import { ConversionOptions, ConvertedOutput } from '../types/converter';
import { changeExtension, readFileAsArrayBuffer, readFileAsText } from '../utils/fileHelpers';
import { jsPDF } from 'jspdf';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import mammoth from 'mammoth';
import { marked } from 'marked';
import TurndownService from 'turndown';

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

export async function convertDocument(
  file: File,
  targetFormat: string,
  options: ConversionOptions = {},
  onProgress?: (percent: number) => void
): Promise<ConvertedOutput> {
  const startTime = performance.now();
  const sourceExt = file.name.split('.').pop()?.toLowerCase() || '';
  const targetExt = targetFormat.toLowerCase().replace(/^\./, '');

  onProgress?.(15);

  // --- SOURCE: DOCX ---
  if (sourceExt === 'docx') {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    onProgress?.(40);
    
    // Extract HTML and Raw Text from DOCX via mammoth
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
    const rawTextResult = await mammoth.extractRawText({ arrayBuffer });
    const htmlContent = htmlResult.value;
    const textContent = rawTextResult.value;

    onProgress?.(70);

    if (targetExt === 'html') {
      const fullHtml = wrapInHtmlDocument(file.name, htmlContent);
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      return createOutput(blob, changeExtension(file.name, 'html'), 'text/html', 'html', startTime, fullHtml);
    }

    if (targetExt === 'md' || targetExt === 'markdown') {
      const mdContent = turndown.turndown(htmlContent);
      const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
      return createOutput(blob, changeExtension(file.name, 'md'), 'text/markdown', 'md', startTime, mdContent);
    }

    if (targetExt === 'txt') {
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      return createOutput(blob, changeExtension(file.name, 'txt'), 'text/plain', 'txt', startTime, textContent);
    }

    if (targetExt === 'pdf') {
      const pdfBlob = await generatePdfFromText(textContent, file.name, options);
      return createOutput(pdfBlob, changeExtension(file.name, 'pdf'), 'application/pdf', 'pdf', startTime);
    }
  }

  // --- SOURCE: PDF ---
  if (sourceExt === 'pdf') {
    const arrayBuffer = await readFileAsArrayBuffer(file);
    onProgress?.(40);

    try {
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      onProgress?.(60);

      // Simple text extract attempt / metadata
      const title = pdfDoc.getTitle() || file.name;
      const author = pdfDoc.getAuthor() || 'Unknown';
      const summaryText = `# ${title}\nAuthor: ${author}\nTotal Pages: ${pageCount}\n\n[PDF document with ${pageCount} pages processed locally]\n`;

      if (targetExt === 'txt') {
        const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
        return createOutput(blob, changeExtension(file.name, 'txt'), 'text/plain', 'txt', startTime, summaryText);
      }

      if (targetExt === 'md') {
        const mdText = `${summaryText}\n---\n*Extracted via Universal Local Converter*\n`;
        const blob = new Blob([mdText], { type: 'text/markdown;charset=utf-8' });
        return createOutput(blob, changeExtension(file.name, 'md'), 'text/markdown', 'md', startTime, mdText);
      }

      if (targetExt === 'html') {
        const html = wrapInHtmlDocument(title, `<h1>${escapeHtml(title)}</h1><p>Author: ${escapeHtml(author)}</p><p>Pages: ${pageCount}</p>`);
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        return createOutput(blob, changeExtension(file.name, 'html'), 'text/html', 'html', startTime, html);
      }
    } catch (e) {
      console.warn('PDF parsing fallback', e);
    }
  }

  // --- SOURCE: MARKDOWN (.md, .markdown) ---
  if (sourceExt === 'md' || sourceExt === 'markdown') {
    const mdContent = await readFileAsText(file);
    onProgress?.(40);

    if (targetExt === 'html') {
      const parsedHtml = await marked.parse(mdContent);
      const fullHtml = wrapInHtmlDocument(file.name, parsedHtml);
      const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
      return createOutput(blob, changeExtension(file.name, 'html'), 'text/html', 'html', startTime, fullHtml);
    }

    if (targetExt === 'pdf') {
      const pdfBlob = await generatePdfFromText(mdContent, file.name, options);
      return createOutput(pdfBlob, changeExtension(file.name, 'pdf'), 'application/pdf', 'pdf', startTime);
    }

    if (targetExt === 'txt') {
      // Strip markdown syntax
      const plainText = mdContent.replace(/[#*`_~\[\]()>-]/g, '').trim();
      const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
      return createOutput(blob, changeExtension(file.name, 'txt'), 'text/plain', 'txt', startTime, plainText);
    }

    if (targetExt === 'docx') {
      const docxBlob = await generateSimpleDocxBlob(mdContent);
      return createOutput(docxBlob, changeExtension(file.name, 'docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx', startTime);
    }

    if (targetExt === 'json') {
      const jsonObj = {
        filename: file.name,
        content: mdContent,
        lines: mdContent.split('\n'),
        wordCount: mdContent.split(/\s+/).filter(Boolean).length,
      };
      const jsonStr = JSON.stringify(jsonObj, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      return createOutput(blob, changeExtension(file.name, 'json'), 'application/json', 'json', startTime, jsonStr);
    }

    if (targetExt === 'bbcode') {
      let bb = mdContent
        .replace(/^# (.+)$/gm, '[size=6][b]$1[/b][/size]')
        .replace(/^## (.+)$/gm, '[size=5][b]$1[/b][/size]')
        .replace(/^### (.+)$/gm, '[size=4][b]$1[/b][/size]')
        .replace(/\*\*(.+?)\*\*/g, '[b]$1[/b]')
        .replace(/\*(.+?)\*/g, '[i]$1[/i]')
        .replace(/`(.+?)`/g, '[code]$1[/code]');
      const blob = new Blob([bb], { type: 'text/plain;charset=utf-8' });
      return createOutput(blob, changeExtension(file.name, 'bbcode.txt'), 'text/plain', 'bbcode', startTime, bb);
    }
  }

  // --- SOURCE: HTML ---
  if (sourceExt === 'html' || sourceExt === 'htm') {
    const htmlContent = await readFileAsText(file);
    onProgress?.(40);

    if (targetExt === 'md' || targetExt === 'markdown') {
      const md = turndown.turndown(htmlContent);
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      return createOutput(blob, changeExtension(file.name, 'md'), 'text/markdown', 'md', startTime, md);
    }

    if (targetExt === 'txt') {
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      const text = div.textContent || div.innerText || '';
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      return createOutput(blob, changeExtension(file.name, 'txt'), 'text/plain', 'txt', startTime, text);
    }

    if (targetExt === 'pdf') {
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      const text = div.textContent || div.innerText || htmlContent;
      const pdfBlob = await generatePdfFromText(text, file.name, options);
      return createOutput(pdfBlob, changeExtension(file.name, 'pdf'), 'application/pdf', 'pdf', startTime);
    }

    if (targetExt === 'docx') {
      const div = document.createElement('div');
      div.innerHTML = htmlContent;
      const text = div.textContent || div.innerText || htmlContent;
      const docxBlob = await generateSimpleDocxBlob(text);
      return createOutput(docxBlob, changeExtension(file.name, 'docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx', startTime);
    }
  }

  // --- SOURCE: PLAIN TEXT (.txt, .log, etc.) ---
  const textContent = await readFileAsText(file);
  onProgress?.(40);

  if (targetExt === 'pdf') {
    const pdfBlob = await generatePdfFromText(textContent, file.name, options);
    return createOutput(pdfBlob, changeExtension(file.name, 'pdf'), 'application/pdf', 'pdf', startTime);
  }

  if (targetExt === 'html') {
    const lines = textContent.split('\n').map(l => `<p>${escapeHtml(l) || '&nbsp;'}</p>`).join('\n');
    const fullHtml = wrapInHtmlDocument(file.name, lines);
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'html'), 'text/html', 'html', startTime, fullHtml);
  }

  if (targetExt === 'md' || targetExt === 'markdown') {
    const blob = new Blob([textContent], { type: 'text/markdown;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'md'), 'text/markdown', 'md', startTime, textContent);
  }

  if (targetExt === 'docx') {
    const docxBlob = await generateSimpleDocxBlob(textContent);
    return createOutput(docxBlob, changeExtension(file.name, 'docx'), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx', startTime);
  }

  if (targetExt === 'base64') {
    const base64 = btoa(unescape(encodeURIComponent(textContent)));
    const blob = new Blob([base64], { type: 'text/plain;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'base64.txt'), 'text/plain', 'base64', startTime, base64);
  }

  if (targetExt === 'hex') {
    let hex = '';
    for (let i = 0; i < textContent.length; i++) {
      hex += textContent.charCodeAt(i).toString(16).padStart(2, '0') + ' ';
    }
    const blob = new Blob([hex.trim()], { type: 'text/plain;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'hex.txt'), 'text/plain', 'hex', startTime, hex.trim());
  }

  if (targetExt === 'rot13') {
    const rot13 = textContent.replace(/[a-zA-Z]/g, (c) => {
      const code = c.charCodeAt(0);
      const base = code >= 97 ? 97 : 65;
      return String.fromCharCode(((code - base + 13) % 26) + base);
    });
    const blob = new Blob([rot13], { type: 'text/plain;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'rot13.txt'), 'text/plain', 'rot13', startTime, rot13);
  }

  if (targetExt === 'morse') {
    const morseMap: Record<string, string> = {
      A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
      I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
      Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
      Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
      '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
      ' ': '/', '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--'
    };
    const morse = textContent.toUpperCase().split('').map(ch => morseMap[ch] || ch).join(' ');
    const blob = new Blob([morse], { type: 'text/plain;charset=utf-8' });
    return createOutput(blob, changeExtension(file.name, 'morse.txt'), 'text/plain', 'morse', startTime, morse);
  }

  // Fallback text output
  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  return createOutput(blob, changeExtension(file.name, targetExt), 'text/plain', targetExt, startTime, textContent);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function wrapInHtmlDocument(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; background: #f8fafc; }
    h1, h2, h3 { color: #0f172a; }
    pre, code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    pre { padding: 16px; overflow-x: auto; }
    blockquote { border-left: 4px solid #3b82f6; margin: 0; padding-left: 16px; color: #475569; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
    th { background: #f1f5f9; }
  </style>
</head>
<body>
  ${bodyContent}
</body>
</html>`;
}

async function generatePdfFromText(text: string, title: string, options: ConversionOptions): Promise<Blob> {
  const doc = new jsPDF({
    orientation: options.pdfOrientation || 'portrait',
    unit: 'mm',
    format: options.pdfPageSize || 'a4',
  });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(11);

  const margin = options.pdfMargin || 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxLineWidth = pageWidth - margin * 2;
  const lineHeight = 6;

  // Header Title
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text(title, margin, margin + 4);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, margin + 8, pageWidth - margin, margin + 8);

  let cursorY = margin + 16;
  const lines = text.split('\n');

  for (const rawLine of lines) {
    const wrappedLines = doc.splitTextToSize(rawLine || ' ', maxLineWidth);
    for (const subLine of wrappedLines) {
      if (cursorY + lineHeight > pageHeight - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(subLine, margin, cursorY);
      cursorY += lineHeight;
    }
  }

  return doc.output('blob');
}

async function generateSimpleDocxBlob(textContent: string): Promise<Blob> {
  // Build a standard valid DOCX (OpenXML) package structure using JSZip
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  const paragraphsXml = textContent
    .split('\n')
    .map(p => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(p)}</w:t></w:r></w:p>`)
    .join('\n');

  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

  zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

  zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${paragraphsXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`);

  return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
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
