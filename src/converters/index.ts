import { ConversionOptions, ConvertedOutput, FileCategory } from '../types/converter';
import { detectCategoryByExtension, getFormatByExtension } from '../utils/formatRegistry';
import { getFileExtension } from '../utils/fileHelpers';
import { convertImage } from './imageConverter';
import { convertDocument } from './documentConverter';
import { convertSpreadsheet } from './spreadsheetConverter';
import { convertAudio } from './audioConverter';
import { convertVideo } from './videoConverter';
import { convertDataOrCode } from './dataCodeConverter';

export async function processFileConversion(
  file: File,
  targetFormat: string,
  options: ConversionOptions = {},
  onProgress?: (percent: number) => void
): Promise<ConvertedOutput> {
  const sourceExt = getFileExtension(file.name);
  const targetExt = targetFormat.toLowerCase().replace(/^\./, '');
  const sourceCategory = detectCategoryByExtension(sourceExt);

  // If converting to audio from video, route directly to video converter which extracts audio
  if (sourceCategory === 'video') {
    return await convertVideo(file, targetExt, options, onProgress);
  }

  // If source is audio, route to audio converter
  if (sourceCategory === 'audio') {
    return await convertAudio(file, targetExt, options, onProgress);
  }

  // If source is spreadsheet (xlsx, xls, csv, tsv, ods)
  if (sourceCategory === 'spreadsheet') {
    return await convertSpreadsheet(file, targetExt, options, onProgress);
  }

  // If source is document (pdf, docx, md, html, txt, rtf)
  if (sourceCategory === 'document') {
    return await convertDocument(file, targetExt, options, onProgress);
  }

  // If source is image (png, jpg, webp, gif, bmp, svg, ico, etc.)
  if (sourceCategory === 'image') {
    return await convertImage(file, targetExt, options, onProgress);
  }

  // If source is data/code (json, yaml, xml, toml, sql, ts, js, base64, hex)
  if (sourceCategory === 'data' || sourceCategory === 'code') {
    return await convertDataOrCode(file, targetExt, options, onProgress);
  }

  // Fallback try document / data converter
  try {
    return await convertDocument(file, targetExt, options, onProgress);
  } catch (err) {
    return await convertDataOrCode(file, targetExt, options, onProgress);
  }
}
