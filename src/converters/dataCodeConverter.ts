import { ConversionOptions, ConvertedOutput } from '../types/converter';
import { changeExtension, readFileAsArrayBuffer, readFileAsText } from '../utils/fileHelpers';
import * as YAML from 'yaml';
import * as XLSX from 'xlsx';

export async function convertDataOrCode(
  file: File,
  targetFormat: string,
  options: ConversionOptions = {},
  onProgress?: (percent: number) => void
): Promise<ConvertedOutput> {
  const startTime = performance.now();
  const sourceExt = file.name.split('.').pop()?.toLowerCase() || '';
  const targetExt = targetFormat.toLowerCase().replace(/^\./, '');

  onProgress?.(20);

  // Read content as text or buffer
  const rawText = await readFileAsText(file);
  onProgress?.(40);

  let outputText = '';
  let mimeType = 'text/plain;charset=utf-8';

  // 1. JSON Source Conversions
  if (sourceExt === 'json') {
    let parsedJson: any;
    try {
      parsedJson = JSON.parse(rawText);
    } catch (e) {
      throw new Error(`Invalid JSON in file ${file.name}: ${(e as Error).message}`);
    }

    if (targetExt === 'yaml' || targetExt === 'yml') {
      outputText = YAML.stringify(parsedJson, { indent: options.yamlIndent || 2 });
      mimeType = 'text/yaml';
    } else if (targetExt === 'xml') {
      outputText = jsonToXml(parsedJson, options.xmlRootElement || 'root');
      mimeType = 'application/xml';
    } else if (targetExt === 'csv' || targetExt === 'tsv') {
      const arrayData = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
      const ws = XLSX.utils.json_to_sheet(arrayData);
      outputText = XLSX.utils.sheet_to_csv(ws, { FS: targetExt === 'tsv' ? '\t' : (options.csvDelimiter || ',') });
      mimeType = targetExt === 'tsv' ? 'text/tab-separated-values' : 'text/csv';
    } else if (targetExt === 'xlsx') {
      const arrayData = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
      const ws = XLSX.utils.json_to_sheet(arrayData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, options.sheetName || 'Data');
      const outBuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([outBuf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      onProgress?.(100);
      return {
        blob,
        filename: changeExtension(file.name, 'xlsx'),
        size: blob.size,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: 'xlsx',
        timeTakenMs: Math.round(performance.now() - startTime),
      };
    } else if (targetExt === 'ts' || targetExt === 'typescript') {
      const typeName = options.typeScriptTypeName || 'GeneratedType';
      outputText = generateTypeScriptInterfaces(parsedJson, typeName);
      mimeType = 'text/typescript';
    } else if (targetExt === 'toml' || targetExt === 'ini') {
      outputText = jsonToIniOrToml(parsedJson);
      mimeType = 'text/plain';
    } else if (targetExt === 'sql') {
      const arrayData = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
      const tableName = options.tableName || 'my_table';
      outputText = jsonToSql(arrayData, tableName);
      mimeType = 'application/sql';
    } else if (targetExt === 'html') {
      outputText = jsonToHtmlViewer(parsedJson, file.name);
      mimeType = 'text/html';
    } else {
      outputText = JSON.stringify(parsedJson, null, options.jsonIndent || 2);
    }
  }
  // 2. YAML Source Conversions
  else if (sourceExt === 'yaml' || sourceExt === 'yml') {
    let parsed: any;
    try {
      parsed = YAML.parse(rawText);
    } catch (e) {
      throw new Error(`Invalid YAML format: ${(e as Error).message}`);
    }

    if (targetExt === 'json') {
      outputText = JSON.stringify(parsed, null, options.jsonIndent || 2);
      mimeType = 'application/json';
    } else if (targetExt === 'xml') {
      outputText = jsonToXml(parsed, options.xmlRootElement || 'root');
      mimeType = 'application/xml';
    } else if (targetExt === 'toml' || targetExt === 'ini') {
      outputText = jsonToIniOrToml(parsed);
    } else {
      outputText = YAML.stringify(parsed);
      mimeType = 'text/yaml';
    }
  }
  // 3. XML Source Conversions
  else if (sourceExt === 'xml') {
    if (targetExt === 'json') {
      const jsonFromXml = xmlToJson(rawText);
      outputText = JSON.stringify(jsonFromXml, null, options.jsonIndent || 2);
      mimeType = 'application/json';
    } else if (targetExt === 'yaml') {
      const jsonFromXml = xmlToJson(rawText);
      outputText = YAML.stringify(jsonFromXml);
      mimeType = 'text/yaml';
    } else {
      outputText = rawText;
    }
  }
  // 4. Base64 & Hex
  else if (sourceExt === 'base64' || targetExt === 'base64') {
    if (targetExt === 'base64') {
      outputText = btoa(unescape(encodeURIComponent(rawText)));
    } else {
      try {
        outputText = decodeURIComponent(escape(atob(rawText.trim())));
      } catch (e) {
        outputText = atob(rawText.trim());
      }
    }
  }
  else if (sourceExt === 'hex' || targetExt === 'hex') {
    if (targetExt === 'hex') {
      outputText = Array.from(new TextEncoder().encode(rawText))
        .map(b => b.toString(16).padStart(2, '0'))
        .join(' ');
    } else {
      const cleanHex = rawText.replace(/[^0-9a-fA-F]/g, '');
      const bytes = new Uint8Array(cleanHex.length / 2);
      for (let i = 0; i < cleanHex.length; i += 2) {
        bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
      }
      outputText = new TextDecoder().decode(bytes);
    }
  }
  // 5. Code Minification / Beautification
  else if (options.codeMinify) {
    outputText = rawText
      .replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, '') // remove comments
      .replace(/\s+/g, ' ')
      .trim();
  } else {
    outputText = rawText;
  }

  onProgress?.(90);

  const blob = new Blob([outputText], { type: mimeType });
  onProgress?.(100);

  return {
    blob,
    text: outputText,
    filename: changeExtension(file.name, targetExt),
    size: blob.size,
    mimeType,
    extension: targetExt,
    timeTakenMs: Math.round(performance.now() - startTime),
  };
}

function jsonToXml(obj: any, rootName = 'root'): string {
  function toXml(val: any, name: string): string {
    if (val === null || val === undefined) return `<${name}/>`;
    if (typeof val !== 'object') return `<${name}>${escapeXml(String(val))}</${name}>`;
    if (Array.isArray(val)) {
      return val.map(item => toXml(item, 'item')).join('\n');
    }
    let res = `<${name}>\n`;
    for (const [k, v] of Object.entries(val)) {
      const cleanKey = k.replace(/[^a-zA-Z0-9_]/g, '_');
      res += '  ' + toXml(v, cleanKey).replace(/\n/g, '\n  ') + '\n';
    }
    res += `</${name}>`;
    return res;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>\n${toXml(obj, rootName)}`;
}

function xmlToJson(xmlStr: string): any {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
  
  function nodeToObj(node: Node): any {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.nodeValue?.trim() || null;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const obj: any = {};
      const el = node as Element;
      
      // Attributes
      if (el.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          obj['@attributes'][attr.name] = attr.value;
        }
      }

      // Children
      const childNodes = Array.from(el.childNodes);
      const textChildren = childNodes.filter(c => c.nodeType === Node.TEXT_NODE && c.nodeValue?.trim());
      const elementChildren = childNodes.filter(c => c.nodeType === Node.ELEMENT_NODE);

      if (elementChildren.length === 0 && textChildren.length > 0) {
        return textChildren[0].nodeValue?.trim();
      }

      for (const child of elementChildren) {
        const childEl = child as Element;
        const name = childEl.tagName;
        const value = nodeToObj(childEl);
        if (obj[name]) {
          if (!Array.isArray(obj[name])) obj[name] = [obj[name]];
          obj[name].push(value);
        } else {
          obj[name] = value;
        }
      }

      return obj;
    }
    return null;
  }

  return { [xmlDoc.documentElement.tagName]: nodeToObj(xmlDoc.documentElement) };
}

function jsonToIniOrToml(obj: any): string {
  let res = '';
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      res += `\n[${k}]\n`;
      for (const [subK, subV] of Object.entries(v)) {
        res += `${subK} = ${JSON.stringify(subV)}\n`;
      }
    } else {
      res += `${k} = ${JSON.stringify(v)}\n`;
    }
  }
  return res.trim();
}

function jsonToSql(arrayData: any[], tableName: string): string {
  if (arrayData.length === 0) return `-- Empty dataset`;
  const cols = Object.keys(arrayData[0]);
  let sql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n`;
  sql += cols.map(c => `  \`${c}\` TEXT`).join(',\n');
  sql += `\n);\n\nINSERT INTO \`${tableName}\` (${cols.map(c => `\`${c}\``).join(', ')}) VALUES\n`;

  const rows = arrayData.map(row => {
    const vals = cols.map(c => {
      const v = row[c];
      if (v === null || v === undefined) return 'NULL';
      return `'${String(v).replace(/'/g, "''")}'`;
    });
    return `  (${vals.join(', ')})`;
  });

  sql += rows.join(',\n') + ';\n';
  return sql;
}

function generateTypeScriptInterfaces(obj: any, rootName: string): string {
  const interfaces: Record<string, string> = {};

  function inferType(val: any, name: string): string {
    if (val === null) return 'any';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      const itemType = inferType(val[0], `${name}Item`);
      return `${itemType}[]`;
    }
    if (typeof val === 'object') {
      const ifaceName = capitalize(name);
      let iface = `export interface ${ifaceName} {\n`;
      for (const [k, v] of Object.entries(val)) {
        const propType = inferType(v, `${ifaceName}_${k}`);
        iface += `  ${k}: ${propType};\n`;
      }
      iface += `}`;
      interfaces[ifaceName] = iface;
      return ifaceName;
    }
    return typeof val;
  }

  inferType(obj, rootName);
  return Object.values(interfaces).reverse().join('\n\n');
}

function jsonToHtmlViewer(obj: any, title: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeXml(title)}</title>
  <style>
    body { font-family: monospace; padding: 20px; background: #0f172a; color: #f8fafc; line-height: 1.5; }
    pre { background: #1e293b; padding: 16px; border-radius: 8px; border: 1px solid #334155; overflow: auto; }
  </style>
</head>
<body>
  <h2>${escapeXml(title)}</h2>
  <pre>${escapeXml(JSON.stringify(obj, null, 2))}</pre>
</body>
</html>`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
