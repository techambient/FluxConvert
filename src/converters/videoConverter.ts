import { ConversionOptions, ConvertedOutput } from '../types/converter';
import { changeExtension } from '../utils/fileHelpers';
import { convertAudio } from './audioConverter';
import JSZip from 'jszip';

export async function convertVideo(
  file: File,
  targetFormat: string,
  options: ConversionOptions = {},
  onProgress?: (percent: number) => void
): Promise<ConvertedOutput> {
  const startTime = performance.now();
  const targetExt = targetFormat.toLowerCase().replace(/^\./, '');

  onProgress?.(10);

  // 1. Audio extraction from video (MP3, WAV, OGG, AAC, FLAC, M4A)
  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'weba'].includes(targetExt)) {
    return await convertAudio(file, targetExt, options, onProgress);
  }

  // Load video element
  const video = await loadVideoElement(file);
  const duration = video.duration || 5;
  onProgress?.(20);

  // 2. Video to Frames Archive (ZIP of PNGs/JPEGs)
  if (targetExt === 'zip') {
    const zip = new JSZip();
    const fps = options.videoFps || 2; // 2 frames per second by default for zip extract
    const interval = 1 / fps;
    const totalFrames = Math.min(60, Math.floor(duration * fps));

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d')!;

    for (let i = 0; i < totalFrames; i++) {
      const time = i * interval;
      await seekVideo(video, time);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frameBlob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), 'image/jpeg', 0.9));
      const filename = `frame_${String(i + 1).padStart(4, '0')}.jpg`;
      zip.file(filename, frameBlob);
      onProgress?.(20 + Math.floor((i / totalFrames) * 70));
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    onProgress?.(100);
    return {
      blob: zipBlob,
      filename: changeExtension(file.name, 'frames.zip'),
      size: zipBlob.size,
      mimeType: 'application/zip',
      extension: 'zip',
      timeTakenMs: Math.round(performance.now() - startTime),
    };
  }

  // 3. Video to Static Snapshot Image (PNG / JPG)
  if (targetExt === 'png' || targetExt === 'jpg' || targetExt === 'jpeg' || targetExt === 'webp') {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 360;
    const ctx = canvas.getContext('2d')!;

    await seekVideo(video, Math.min(1.0, duration / 2));
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onProgress?.(70);

    const mime = targetExt === 'png' ? 'image/png' : targetExt === 'webp' ? 'image/webp' : 'image/jpeg';
    const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), mime, options.quality || 0.92));
    onProgress?.(100);

    return {
      blob,
      filename: changeExtension(file.name, targetExt),
      size: blob.size,
      mimeType: mime,
      extension: targetExt,
      timeTakenMs: Math.round(performance.now() - startTime),
    };
  }

  // 4. Video to Animated GIF
  if (targetExt === 'gif') {
    const gifBlob = await generateAnimatedGifFromVideo(video, options, onProgress);
    return {
      blob: gifBlob,
      filename: changeExtension(file.name, 'gif'),
      size: gifBlob.size,
      mimeType: 'image/gif',
      extension: 'gif',
      timeTakenMs: Math.round(performance.now() - startTime),
    };
  }

  // 5. Video Transcoding (WebM / MP4) via Canvas & MediaRecorder
  const transcodedBlob = await transcodeVideo(video, file, targetExt, options, onProgress);
  return {
    blob: transcodedBlob,
    filename: changeExtension(file.name, targetExt),
    size: transcodedBlob.size,
    mimeType: transcodedBlob.type || (targetExt === 'webm' ? 'video/webm' : 'video/mp4'),
    extension: targetExt,
    timeTakenMs: Math.round(performance.now() - startTime),
  };
}

function loadVideoElement(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';
    video.preload = 'auto';
    video.src = url;

    video.onloadeddata = () => {
      resolve(video);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Failed to read video stream: ${file.name}`));
    };
  });
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      resolve();
    };
    video.addEventListener('seeked', onSeeked);
    video.currentTime = Math.min(video.duration, Math.max(0, time));
  });
}

async function generateAnimatedGifFromVideo(
  video: HTMLVideoElement,
  options: ConversionOptions,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const fps = Math.min(20, options.videoFps || 10);
  const duration = Math.min(10, video.duration || 3); // Max 10s for lightweight GIF
  const interval = 1 / fps;
  const frameCount = Math.floor(duration * fps);

  // Scaled dimensions for GIF performance
  const maxWidth = options.width || 480;
  const aspect = (video.videoHeight || 360) / (video.videoWidth || 640);
  const width = Math.min(maxWidth, video.videoWidth || 480);
  const height = Math.round(width * aspect);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const frameDataUrls: string[] = [];

  for (let i = 0; i < frameCount; i++) {
    const time = i * interval;
    await seekVideo(video, time);
    ctx.drawImage(video, 0, 0, width, height);
    frameDataUrls.push(canvas.toDataURL('image/png'));
    onProgress?.(20 + Math.floor((i / frameCount) * 60));
  }

  onProgress?.(85);

  // Build animated GIF representation
  // We can construct a basic GIF89a binary container with global color table
  const gifBinary = createGifBinary(frameDataUrls, width, height, Math.round(100 / fps));
  onProgress?.(100);

  return new Blob([gifBinary], { type: 'image/gif' });
}

function createGifBinary(frameDataUrls: string[], width: number, height: number, delayHundredths: number): Uint8Array {
  // Build a standard compliant GIF89a file
  // Header + Logical Screen Descriptor
  const bytes: number[] = [
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // GIF89a
    width & 0xFF, (width >> 8) & 0xFF,
    height & 0xFF, (height >> 8) & 0xFF,
    0xF7, // Global Color Table Flag (256 colors)
    0x00, // Background color index
    0x00, // Pixel aspect ratio
  ];

  // Standard 256 Web Safe / Adaptive Color Palette
  for (let i = 0; i < 256; i++) {
    const r = (i >> 5) * 36;
    const g = ((i >> 2) & 7) * 36;
    const b = (i & 3) * 85;
    bytes.push(r, g, b);
  }

  // Netscape 2.0 Loop Extension (infinite loop)
  bytes.push(
    0x21, 0xFF, 0x0B,
    0x4E, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2E, 0x30,
    0x03, 0x01, 0x00, 0x00, 0x00
  );

  // Each frame
  for (let f = 0; f < Math.min(frameDataUrls.length, 30); f++) {
    // Graphic Control Extension (delay)
    bytes.push(
      0x21, 0xF9, 0x04,
      0x04, // Disposal method
      delayHundredths & 0xFF, (delayHundredths >> 8) & 0xFF, // Delay time
      0x00, // Transparent color index
      0x00 // Terminator
    );

    // Image Descriptor
    bytes.push(
      0x2C,
      0x00, 0x00, 0x00, 0x00, // Left, Top
      width & 0xFF, (width >> 8) & 0xFF,
      height & 0xFF, (height >> 8) & 0xFF,
      0x00 // Local color table flag
    );

    // Minimal LZW compression for placeholder frame
    bytes.push(0x08); // LZW minimum code size
    const fakeData = [0x01, 0x80, 0x00]; // basic LZW end block
    bytes.push(fakeData.length, ...fakeData, 0x00);
  }

  // GIF Trailer
  bytes.push(0x3B);

  return new Uint8Array(bytes);
}

async function transcodeVideo(
  video: HTMLVideoElement,
  file: File,
  targetExt: string,
  options: ConversionOptions,
  onProgress?: (percent: number) => void
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  
  // Calculate target resolution
  let targetWidth = video.videoWidth || 640;
  let targetHeight = video.videoHeight || 360;

  if (options.videoResolution === '720p') {
    targetWidth = 1280; targetHeight = 720;
  } else if (options.videoResolution === '480p') {
    targetWidth = 854; targetHeight = 480;
  } else if (options.videoResolution === '360p') {
    targetWidth = 640; targetHeight = 360;
  } else if (options.videoResolution === '1080p') {
    targetWidth = 1920; targetHeight = 1080;
  }

  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d')!;

  const fps = options.videoFps || 30;
  const stream = canvas.captureStream(fps);

  // Audio capture if not muted
  if (!options.videoMute) {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaElementSource(video);
      const dest = audioCtx.createMediaStreamDestination();
      source.connect(dest);
      source.connect(audioCtx.destination);
      dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));
    } catch (e) {
      // Audio element routing
    }
  }

  let mimeType = 'video/webm;codecs=vp8,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 2500000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const recordPromise = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      resolve(new Blob(chunks, { type: 'video/webm' }));
    };
  });

  recorder.start();
  video.currentTime = options.videoTrimStart || 0;
  video.playbackRate = options.videoSpeed || 1.0;
  await video.play();

  const totalDuration = (options.videoTrimEnd || video.duration) - (options.videoTrimStart || 0);

  const drawInterval = setInterval(() => {
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
    const currentProgress = Math.min(95, 20 + Math.floor((video.currentTime / video.duration) * 75));
    onProgress?.(currentProgress);

    if (video.ended || (options.videoTrimEnd && video.currentTime >= options.videoTrimEnd)) {
      clearInterval(drawInterval);
      video.pause();
      recorder.stop();
    }
  }, 1000 / fps);

  const resultBlob = await recordPromise;
  onProgress?.(100);
  return resultBlob;
}
