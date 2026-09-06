import { ConversionOptions, ConvertedOutput } from '../types/converter';
import { changeExtension, readFileAsArrayBuffer, readFileAsDataURL, readFileAsText } from '../utils/fileHelpers';
import { jsPDF } from 'jspdf';

export async function convertImage(
  file: File,
  targetFormat: string,
  options: ConversionOptions = {},
  onProgress?: (percent: number) => void
): Promise<ConvertedOutput> {
  const startTime = performance.now();
  const targetExt = targetFormat.toLowerCase().replace(/^\./, '');
  
  onProgress?.(10);

  // 1. Handle SVG to Code / JSX / React / TSX / DataURL / Clean Text
  if (targetExt === 'jsx' || targetExt === 'tsx') {
    const svgText = await readFileAsText(file);
    const componentName = file.name.replace(/[^a-zA-Z0-9]/g, '') || 'SvgIcon';
    const cleanSvg = svgText.replace(/class=/g, 'className=').replace(/stroke-width=/g, 'strokeWidth=').replace(/fill-rule=/g, 'fillRule=').replace(/clip-rule=/g, 'clipRule=');
    const jsxCode = `import React from 'react';\n\nexport const ${componentName}: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (\n  ${cleanSvg}\n);\n\nexport default ${componentName};`;
    const blob = new Blob([jsxCode], { type: 'text/typescript' });
    return {
      blob,
      text: jsxCode,
      filename: changeExtension(file.name, targetExt),
      size: blob.size,
      mimeType: 'text/typescript',
      extension: targetExt,
      timeTakenMs: Math.round(performance.now() - startTime),
    };
  }

  // 2. Handle Image to Base64
  if (targetExt === 'base64') {
    onProgress?.(40);
    const dataUrl = await readFileAsDataURL(file);
    const blob = new Blob([dataUrl], { type: 'text/plain;charset=utf-8' });
    onProgress?.(100);
    return {
      blob,
      dataUrl,
      text: dataUrl,
      filename: changeExtension(file.name, 'base64.txt'),
      size: blob.size,
      mimeType: 'text/plain',
      extension: 'base64',
      timeTakenMs: Math.round(performance.now() - startTime),
    };
  }

  // 3. Handle Image to Hex
  if (targetExt === 'hex') {
    onProgress?.(30);
    const buffer = await readFileAsArrayBuffer(file);
    const bytes = new Uint8Array(buffer);
    let hexStr = '';
    const chunk = 10000;
    for (let i = 0; i < bytes.length; i += chunk) {
      const slice = bytes.subarray(i, Math.min(i + chunk, bytes.length));
      hexStr += Array.from(slice).map(b => b.toString(16).padStart(2, '0')).join(' ');
      if (i % 50000 === 0) {
        onProgress?.(30 + Math.floor((i / bytes.length) * 60));
      }
    }
    const blob = new Blob([hexStr], { type: 'text/plain;charset=utf-8' });
    onProgress?.(100);
    return {
      blob,
      text: hexStr.slice(0, 5000) + (hexStr.length > 5000 ? '... (truncated preview)' : ''),
      filename: changeExtension(file.name, 'hex.txt'),
      size: blob.size,
      mimeType: 'text/plain',
      extension: 'hex',
      timeTakenMs: Math.round(performance.now() - startTime),
    };
  }

  // 4. Load Image into HTML5 Canvas for transformation & raster export
  onProgress?.(20);
  const img = await loadImageFromFile(file);
  onProgress?.(40);

  // Compute dimensions
  let targetWidth = img.naturalWidth || img.width || 800;
  let targetHeight = img.naturalHeight || img.height || 600;

  if (options.scale && options.scale !== 1) {
    targetWidth = Math.max(1, Math.round(targetWidth * options.scale));
    targetHeight = Math.max(1, Math.round(targetHeight * options.scale));
  } else if (options.width || options.height) {
    if (options.maintainAspectRatio !== false) {
      const ratio = targetWidth / targetHeight;
      if (options.width && !options.height) {
        targetWidth = options.width;
        targetHeight = Math.round(options.width / ratio);
      } else if (!options.width && options.height) {
        targetHeight = options.height;
        targetWidth = Math.round(options.height * ratio);
      } else if (options.width && options.height) {
        targetWidth = options.width;
        targetHeight = options.height;
      }
    } else {
      if (options.width) targetWidth = options.width;
      if (options.height) targetHeight = options.height;
    }
  }

  // Handle Image to ASCII Art (.txt)
  if (targetExt === 'txt') {
    onProgress?.(60);
    const asciiText = generateAsciiArt(img, Math.min(120, targetWidth));
    const blob = new Blob([asciiText], { type: 'text/plain;charset=utf-8' });
    onProgress?.(100);
    return {
      blob,
      text: asciiText,
      filename: changeExtension(file.name, 'ascii.txt'),
      size: blob.size,
      mimeType: 'text/plain',
      extension: 'txt',
      timeTakenMs: Math.round(performance.now() - startTime),
    };
  }

  // Handle Image to PDF
  if (targetExt === 'pdf') {
    onProgress?.(60);
    const orientation = targetWidth > targetHeight ? 'landscape' : 'portrait';
    const doc = new jsPDF({
      orientation,
      unit: 'px',
      format: [targetWidth, targetHeight],
    });

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d')!;
    applyCanvasFilters(ctx, img, targetWidth, targetHeight, options);

    const imgData = canvas.toDataURL('image/jpeg', options.quality ? Math.min(1, options.quality) : 0.95);
    doc.addImage(imgData, 'JPEG', 0, 0, targetWidth, targetHeight);

    const pdfBlob = doc.output('blob');
    onProgress?.(100);
    return {
      blob: pdfBlob,
      filename: changeExtension(file.name, 'pdf'),
      size: pdfBlob.size,
      mimeType: 'application/pdf',
      extension: 'pdf',
      timeTakenMs: Math.round(performance.now() - startTime),
    };
  }

  // Handle Windows ICO (.ico)
  if (targetExt === 'ico') {
    onProgress?.(50);
    const icoSizes = options.icoSizes && options.icoSizes.length > 0 ? options.icoSizes : [16, 32, 48, 64, 128, 256];
    const icoBlob = await generateIcoBlob(img, icoSizes, options);
    onProgress?.(100);
    return {
      blob: icoBlob,
      filename: changeExtension(file.name, 'ico'),
      size: icoBlob.size,
      mimeType: 'image/x-icon',
      extension: 'ico',
      timeTakenMs: Math.round(performance.now() - startTime),
    };
  }

  // Standard Canvas conversions (PNG, JPEG, WEBP, BMP, GIF, AVIF)
  const canvas = document.createElement('canvas');
  
  // Handle rotation
  const rotation = options.rotation || 0;
  if (rotation === 90 || rotation === 270) {
    canvas.width = targetHeight;
    canvas.height = targetWidth;
  } else {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  
  // Fill background with white if exporting to JPEG or BMP
  if (targetExt === 'jpg' || targetExt === 'jpeg' || targetExt === 'bmp') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  onProgress?.(60);
  ctx.save();
  
  // Center translation for rotation
  ctx.translate(canvas.width / 2, canvas.height / 2);
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }
  if (options.flipHorizontal || options.flipVertical) {
    ctx.scale(options.flipHorizontal ? -1 : 1, options.flipVertical ? -1 : 1);
  }
  ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
  ctx.restore();

  // Apply pixel color filters (grayscale, sepia, invert, bw)
  if (options.colorMode && options.colorMode !== 'original') {
    applyPixelFilters(ctx, canvas.width, canvas.height, options.colorMode);
  }

  onProgress?.(80);

  // Determine export MIME type and quality
  let mimeType = 'image/png';
  let quality = options.quality !== undefined ? options.quality : 0.92;
  if (quality > 1) quality = quality / 100; // normalize if 0-100 scale used

  if (targetExt === 'jpg' || targetExt === 'jpeg') {
    mimeType = 'image/jpeg';
  } else if (targetExt === 'webp') {
    mimeType = 'image/webp';
  } else if (targetExt === 'avif') {
    mimeType = 'image/avif';
  } else if (targetExt === 'gif') {
    mimeType = 'image/gif';
  } else if (targetExt === 'bmp') {
    mimeType = 'image/bmp';
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) {
          resolve(b);
        } else {
          // Fallback if browser doesn't support bmp/avif toBlob directly
          const dataUrl = canvas.toDataURL(mimeType, quality);
          resolve(dataUrlToBlob(dataUrl));
        }
      },
      mimeType,
      quality
    );
  });

  onProgress?.(100);
  const dataUrl = canvas.toDataURL(mimeType, quality);

  return {
    blob,
    dataUrl,
    filename: changeExtension(file.name, targetExt === 'jpeg' ? 'jpg' : targetExt),
    size: blob.size,
    mimeType: blob.type || mimeType,
    extension: targetExt,
    timeTakenMs: Math.round(performance.now() - startTime),
  };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to load image: ${file.name}`));
    };
    img.src = url;
  });
}

function applyCanvasFilters(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  width: number,
  height: number,
  options: ConversionOptions
) {
  ctx.save();
  if (options.colorMode === 'grayscale') {
    ctx.filter = 'grayscale(100%)';
  } else if (options.colorMode === 'sepia') {
    ctx.filter = 'sepia(100%)';
  } else if (options.colorMode === 'invert') {
    ctx.filter = 'invert(100%)';
  }
  ctx.drawImage(img, 0, 0, width, height);
  ctx.restore();
}

function applyPixelFilters(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mode: 'grayscale' | 'sepia' | 'invert' | 'bw'
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (mode === 'grayscale') {
      const v = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    } else if (mode === 'sepia') {
      data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
      data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
      data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    } else if (mode === 'invert') {
      data[i] = 255 - r;
      data[i + 1] = 255 - g;
      data[i + 2] = 255 - b;
    } else if (mode === 'bw') {
      const v = (0.299 * r + 0.587 * g + 0.114 * b) > 128 ? 255 : 0;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

function generateAsciiArt(img: HTMLImageElement, targetCols: number): string {
  const canvas = document.createElement('canvas');
  const aspect = (img.naturalHeight || img.height || 1) / (img.naturalWidth || img.width || 1);
  const targetRows = Math.round(targetCols * aspect * 0.5); // 0.5 corrects for character height
  
  canvas.width = targetCols;
  canvas.height = targetRows;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, targetCols, targetRows);
  
  const imgData = ctx.getImageData(0, 0, targetCols, targetRows);
  const data = imgData.data;
  const asciiChars = ' .:-=+*#%@';
  let result = '';

  for (let y = 0; y < targetRows; y++) {
    for (let x = 0; x < targetCols; x++) {
      const idx = (y * targetCols + x) * 4;
      const brightness = (data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114) / 255;
      const charIndex = Math.floor(brightness * (asciiChars.length - 1));
      result += asciiChars[charIndex];
    }
    result += '\n';
  }

  return result;
}

function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

async function generateIcoBlob(
  img: HTMLImageElement,
  sizes: number[],
  options: ConversionOptions
): Promise<Blob> {
  // Build a true multi-directory Windows ICO file buffer with PNG-encoded image payloads
  const pngBuffers: { size: number; buffer: ArrayBuffer }[] = [];

  for (const size of sizes) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, size, size);
    if (options.colorMode && options.colorMode !== 'original') {
      applyPixelFilters(ctx, size, size, options.colorMode);
    }
    const pngBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/png'));
    const pngBuffer = await pngBlob.arrayBuffer();
    pngBuffers.push({ size, buffer: pngBuffer });
  }

  // Header: 6 bytes (Reserved 2, Type 2 (1 = ICO), Count 2)
  const headerSize = 6;
  const dirEntrySize = 16;
  const count = pngBuffers.length;
  let offset = headerSize + count * dirEntrySize;

  let totalSize = offset;
  for (const item of pngBuffers) {
    totalSize += item.buffer.byteLength;
  }

  const icoBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(icoBuffer);

  // Write ICONDIR
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // 1 = ICO type
  view.setUint16(4, count, true); // Image count

  // Write ICONDIRENTRY for each size
  let currentOffset = offset;
  for (let i = 0; i < count; i++) {
    const { size, buffer } = pngBuffers[i];
    const entryOffset = headerSize + i * dirEntrySize;
    
    view.setUint8(entryOffset, size >= 256 ? 0 : size); // Width
    view.setUint8(entryOffset + 1, size >= 256 ? 0 : size); // Height
    view.setUint8(entryOffset + 2, 0); // Color palette
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel
    view.setUint32(entryOffset + 8, buffer.byteLength, true); // Size of image data
    view.setUint32(entryOffset + 12, currentOffset, true); // Image data offset

    // Write PNG payload
    const dest = new Uint8Array(icoBuffer, currentOffset, buffer.byteLength);
    dest.set(new Uint8Array(buffer));
    currentOffset += buffer.byteLength;
  }

  return new Blob([icoBuffer], { type: 'image/x-icon' });
}
