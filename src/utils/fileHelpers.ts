/**
 * Universal file utilities for browser-native conversion
 */

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function calculateSavings(originalSize: number, newSize: number): {
  diff: number;
  percentage: number;
  isSmaller: boolean;
} {
  const diff = originalSize - newSize;
  const percentage = Math.round((diff / originalSize) * 100 * 10) / 10;
  return {
    diff,
    percentage,
    isSmaller: diff > 0,
  };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function readFileAsText(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('Failed to read file as text'));
    reader.readAsText(file);
  });
}

export function readFileAsArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error || new Error('Failed to read file as ArrayBuffer'));
    reader.readAsArrayBuffer(file);
  });
}

export function readFileAsDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('Failed to read file as Data URL'));
    reader.readAsDataURL(file);
  });
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length > 1) {
    return parts.pop()!.toLowerCase();
  }
  return '';
}

export function changeExtension(filename: string, newExt: string): string {
  const cleanExt = newExt.replace(/^\./, '');
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return `${filename}.${cleanExt}`;
  }
  return `${filename.substring(0, lastDotIndex)}.${cleanExt}`;
}

export async function detectFileMagicBytes(file: File): Promise<string | null> {
  try {
    const slice = file.slice(0, 16);
    const buffer = await readFileAsArrayBuffer(slice);
    const bytes = new Uint8Array(buffer);
    
    // PNG: 89 50 4E 47
    if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return 'png';
    // JPEG: FF D8 FF
    if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return 'jpg';
    // GIF: 47 49 46 38
    if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'gif';
    // WEBP: 52 49 46 46 ... 57 45 42 50
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'webp';
    // PDF: 25 50 44 46 (%PDF)
    if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'pdf';
    // ZIP / DOCX / XLSX: 50 4B 03 04
    if (bytes[0] === 0x50 && bytes[1] === 0x4B && (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07)) {
      return 'zip';
    }
    // BMP: 42 4D
    if (bytes[0] === 0x42 && bytes[1] === 0x4D) return 'bmp';
    // WAV: 52 49 46 46 ... 57 41 56 45
    if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x41 && bytes[10] === 0x56 && bytes[11] === 0x45) return 'wav';
    // MP3: 49 44 33 (ID3) or FF FB
    if ((bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) || (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0)) return 'mp3';
    // MP4 / MOV: ftyp
    if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return 'mp4';
    // WebM / Matroska: 1A 45 DF A3
    if (bytes[0] === 0x1A && bytes[1] === 0x45 && bytes[2] === 0xDF && bytes[3] === 0xA3) return 'webm';
    // OGG: 4F 67 67 53 (OggS)
    if (bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53) return 'ogg';
    
    return null;
  } catch (err) {
    return null;
  }
}
