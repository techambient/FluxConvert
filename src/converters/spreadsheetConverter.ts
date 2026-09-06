import { ConversionOptions, ConvertedOutput } from '../types/converter';
import { changeExtension, readFileAsArrayBuffer, readFileAsText } from '../utils/fileHelpers';
import * as XLSX from 'xlsx';

export async function convertSpreadsheet(
  file: File,
  targetFormat: string,
  options: ConversionOptions = {},
  onProgress?: (percent: number) => void
): Promise<ConvertedOutput> {
  const startTime = performance.now();
  const sourceExt = file.name.split('.').pop()?.toLowerCase() || '';
  const targetExt = targetFormat.toLowerCase().replace(/^\./, '');

  onProgress?.(15);

  let workbook: XLSX.WorkBook;

  if (sourceExt === 'csv' || sourceExt === 'tsv' || sourceExt === 'txt') {
    const text = await readFileAsText(file);
    onProgress?.(35);
    workbook = XLSX.read(text, { type: 'string', raw: true });
  } else if (sourceExt === 'json') {
    const jsonText = await readFileAsText(file);
    const parsed = JSON.parse(jsonText);
    const dataArray = Array.isArray(parsed) ? parsed : [parsed];
    const worksheet = XLSX.utils.json_to_sheet(dataArray);
    workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');
  } else {
    // Binary spreadsheet (XLSX, XLS, ODS)
    const arrayBuffer = await readFileAsArrayBuffer(file);
    onProgress?.(35);
    workbook = XLSX.read(arrayBuffer, { type: 'array' });
  }

  onProgress?.(50);

  const sheetNames = workbook.SheetNames;
  const firstSheetName = sheetNames[0] || 'Sheet1';
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to target format
  if (targetExt === 'csv') {
    const delimiter = options.csvDelimiter || ',';
    const csvContent = XLSX.utils.sheet_to_csv(worksheet, { FS: delimiter });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'csv'), 'text/csv', 'csv', startTime, csvContent);
  }

  if (targetExt === 'tsv') {
    const tsvContent = XLSX.utils.sheet_to_csv(worksheet, { FS: '\t' });
    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'tsv'), 'text/tab-separated-values', 'tsv', startTime, tsvContent);
  }

  if (targetExt === 'json') {
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
    const jsonStr = JSON.stringify(jsonData, null, options.jsonIndent || 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'json'), 'application/json', 'json', startTime, jsonStr);
  }

  if (targetExt === 'html') {
    const htmlTable = XLSX.utils.sheet_to_html(worksheet, { editable: false });
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${file.name} - Table View</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #f8fafc; }
    table { border-collapse: collapse; width: 100%; max-width: 1200px; margin: 0 auto; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; }
    th, td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; }
    tr:first-child, th { background: #f1f5f9; font-weight: 600; color: #0f172a; }
    tr:nth-child(even) { background: #f8fafc; }
    tr:hover { background: #f1f5f9; }
  </style>
</head>
<body>
  <h2>${file.name}</h2>
  ${htmlTable}
</body>
</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'html'), 'text/html', 'html', startTime, fullHtml);
  }

  if (targetExt === 'md' || targetExt === 'markdown') {
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    let md = '';
    if (data.length > 0) {
      const headers = data[0].map(h => String(h || '').trim());
      md += `| ${headers.join(' | ')} |\n`;
      md += `| ${headers.map(() => '---').join(' | ')} |\n`;
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const rowCols = headers.map((_, colIdx) => String(row[colIdx] ?? '').replace(/\|/g, '\\|'));
        md += `| ${rowCols.join(' | ')} |\n`;
      }
    }
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'md'), 'text/markdown', 'md', startTime, md);
  }

  if (targetExt === 'sql') {
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
    const tableName = (options.tableName || file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, '_')) || 'my_table';
    let sql = `-- Generated SQL INSERT statements for ${tableName}\n`;
    
    if (jsonData.length > 0) {
      const columns = Object.keys(jsonData[0]);
      const colList = columns.map(c => `\`${c.replace(/`/g, '')}\``).join(', ');
      
      sql += `INSERT INTO \`${tableName}\` (${colList}) VALUES\n`;
      const valuesList = jsonData.map(row => {
        const vals = columns.map(col => {
          const val = row[col];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'number') return val;
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        return `  (${vals.join(', ')})`;
      });
      sql += valuesList.join(',\n') + ';\n';
    }
    const blob = new Blob([sql], { type: 'application/sql;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'sql'), 'application/sql', 'sql', startTime, sql);
  }

  if (targetExt === 'xml') {
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
    const root = options.xmlRootElement || 'dataset';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${root}>\n`;
    for (const row of jsonData) {
      xml += '  <record>\n';
      for (const [key, val] of Object.entries(row)) {
        const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
        xml += `    <${cleanKey}>${escapeXml(String(val ?? ''))}</${cleanKey}>\n`;
      }
      xml += '  </record>\n';
    }
    xml += `</${root}>\n`;
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'xml'), 'application/xml', 'xml', startTime, xml);
  }

  if (targetExt === 'xlsx') {
    const outputBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([outputBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    return createOutput(blob, changeExtension(file.name, 'xlsx'), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', startTime);
  }

  if (targetExt === 'xls') {
    const outputBuffer = XLSX.write(workbook, { bookType: 'biff8', type: 'array' });
    const blob = new Blob([outputBuffer], { type: 'application/vnd.ms-excel' });
    return createOutput(blob, changeExtension(file.name, 'xls'), 'application/vnd.ms-excel', 'xls', startTime);
  }

  if (targetExt === 'ods') {
    const outputBuffer = XLSX.write(workbook, { bookType: 'ods', type: 'array' });
    const blob = new Blob([outputBuffer], { type: 'application/vnd.oasis.opendocument.spreadsheet' });
    return createOutput(blob, changeExtension(file.name, 'ods'), 'application/vnd.oasis.opendocument.spreadsheet', 'ods', startTime);
  }

  // Plain text representation
  const textContent = XLSX.utils.sheet_to_txt(worksheet);
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  return createOutput(blob, changeExtension(file.name, 'txt'), 'text/plain', 'txt', startTime, textContent);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function createOutput(
  blob: Blob,
  filename: string,
  mimeType: string,
  extension: string,
  startTime: number,
  text?: string
): ConvertedOutput {
  return {
    blob,
    filename,
    size: blob.size,
    mimeType,
    extension,
    text,
    timeTakenMs: Math.round(performance.now() - startTime),
  };
}
