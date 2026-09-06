import { ConvertedOutput, FileItem } from '../types/converter';
import JSZip from 'jszip';
import { changeExtension } from '../utils/fileHelpers';

export async function createZipFromFiles(
  items: FileItem[],
  zipFilename = 'converted_files.zip',
  onProgress?: (percent: number) => void
): Promise<ConvertedOutput> {
  const startTime = performance.now();
  const zip = new JSZip();

  let count = 0;
  for (const item of items) {
    if (item.output) {
      zip.file(item.output.filename, item.output.blob);
    } else {
      zip.file(item.name, item.file);
    }
    count++;
    onProgress?.(Math.round((count / items.length) * 80));
  }

  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      onProgress?.(80 + Math.round(metadata.percent * 0.2));
    }
  );

  return {
    blob: zipBlob,
    filename: zipFilename,
    size: zipBlob.size,
    mimeType: 'application/zip',
    extension: 'zip',
    timeTakenMs: Math.round(performance.now() - startTime),
  };
}

export async function extractZipEntries(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ name: string; size: number; blob: Blob; text?: string }[]> {
  const zip = new JSZip();
  const zipContent = await zip.loadAsync(file);
  const entries: { name: string; size: number; blob: Blob; text?: string }[] = [];

  const fileKeys = Object.keys(zipContent.files).filter(k => !zipContent.files[k].dir);
  let processed = 0;

  for (const filename of fileKeys) {
    const zipEntry = zipContent.files[filename];
    const blob = await zipEntry.async('blob');
    let text: string | undefined;
    
    // Read text if small text file
    if (filename.match(/\.(txt|json|csv|tsv|md|xml|yaml|yml|html|css|js|ts)$/i) && blob.size < 500000) {
      text = await zipEntry.async('string');
    }

    entries.push({
      name: filename,
      size: blob.size,
      blob,
      text,
    });

    processed++;
    onProgress?.(Math.round((processed / fileKeys.length) * 100));
  }

  return entries;
}
