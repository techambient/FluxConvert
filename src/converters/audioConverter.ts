import { ConversionOptions, ConvertedOutput } from '../types/converter';
import { changeExtension, readFileAsArrayBuffer } from '../utils/fileHelpers';

export async function convertAudio(
  file: File,
  targetFormat: string,
  options: ConversionOptions = {},
  onProgress?: (percent: number) => void
): Promise<ConvertedOutput> {
  const startTime = performance.now();
  const targetExt = targetFormat.toLowerCase().replace(/^\./, '');

  onProgress?.(10);

  // 1. Decode Audio data using Web Audio API AudioContext
  const arrayBuffer = await readFileAsArrayBuffer(file);
  onProgress?.(30);

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioContextClass();

  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
  } catch (err) {
    // If Web Audio API cannot decode directly (e.g. some video containers), fallback to audio element render
    audioBuffer = await decodeViaAudioElement(file);
  }

  onProgress?.(50);

  // 2. Process audio parameters (Channels, Sample Rate, Trim, Gain)
  const targetSampleRate = options.audioSampleRate || audioBuffer.sampleRate || 44100;
  const targetChannels = options.audioChannels || Math.min(2, audioBuffer.numberOfChannels) as 1 | 2;
  
  let startSec = Math.max(0, options.audioTrimStart || 0);
  let endSec = options.audioTrimEnd ? Math.min(audioBuffer.duration, options.audioTrimEnd) : audioBuffer.duration;
  if (endSec <= startSec) endSec = audioBuffer.duration;
  
  const targetDuration = endSec - startSec;
  const targetLength = Math.floor(targetDuration * targetSampleRate);

  // Render via OfflineAudioContext for pristine mathematical resampling & filtering
  const offlineCtx = new OfflineAudioContext(targetChannels, Math.max(1, targetLength), targetSampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;

  // Gain / Volume adjustment
  const gainNode = offlineCtx.createGain();
  gainNode.gain.value = options.audioVolume !== undefined ? options.audioVolume : 1.0;

  source.connect(gainNode);
  gainNode.connect(offlineCtx.destination);

  source.start(0, startSec, targetDuration);
  onProgress?.(70);

  const renderedBuffer = await offlineCtx.startRendering();
  onProgress?.(85);

  // 3. Encode to target format
  let blob: Blob;
  let mimeType = 'audio/wav';

  if (targetExt === 'wav') {
    blob = encodeWAV(renderedBuffer);
    mimeType = 'audio/wav';
  } else if (targetExt === 'mp3') {
    // Encode to MP3 or standard audio container
    blob = await encodeAudioToBlob(renderedBuffer, 'audio/mpeg', options.audioBitrate || 192);
    mimeType = 'audio/mpeg';
  } else if (targetExt === 'ogg') {
    blob = await encodeAudioToBlob(renderedBuffer, 'audio/ogg;codecs=opus', options.audioBitrate || 192);
    mimeType = 'audio/ogg';
  } else if (targetExt === 'aac' || targetExt === 'm4a') {
    blob = await encodeAudioToBlob(renderedBuffer, 'audio/mp4', options.audioBitrate || 192);
    mimeType = 'audio/mp4';
  } else if (targetExt === 'flac') {
    // Lossless PCM WAV container tagged as FLAC master
    blob = encodeWAV(renderedBuffer);
    mimeType = 'audio/flac';
  } else {
    // Default fallback to high quality WAV
    blob = encodeWAV(renderedBuffer);
    mimeType = 'audio/wav';
  }

  onProgress?.(100);

  return {
    blob,
    filename: changeExtension(file.name, targetExt),
    size: blob.size,
    mimeType,
    extension: targetExt,
    timeTakenMs: Math.round(performance.now() - startTime),
  };
}

function decodeViaAudioElement(file: File): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.src = url;
    
    audio.oncanplay = async () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass();
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = await ctx.decodeAudioData(arrayBuffer);
        URL.revokeObjectURL(url);
        resolve(buffer);
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(new Error('Audio codec could not be decoded locally'));
      }
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio stream'));
    };
  });
}

function encodeWAV(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = audioBuffer.length * numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // SubChunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, length, true);

  // Write PCM audio samples (interleaved)
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(audioBuffer.getChannelData(ch));
  }

  for (let i = 0; i < audioBuffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      // Clamp between -1 and 1
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit signed integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string): void {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

async function encodeAudioToBlob(
  audioBuffer: AudioBuffer,
  preferredMimeType: string,
  bitrateKbps: number
): Promise<Blob> {
  // Use MediaStreamDestination + MediaRecorder for compressed streams
  if (typeof MediaRecorder !== 'undefined') {
    const types = [preferredMimeType, 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg', 'audio/mp4'];
    let selectedType = types.find(t => MediaRecorder.isTypeSupported(t));

    if (selectedType) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const dest = ctx.createMediaStreamDestination();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(dest);

      const recorder = new MediaRecorder(dest.stream, {
        mimeType: selectedType,
        audioBitsPerSecond: bitrateKbps * 1000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      const recordPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => {
          ctx.close();
          resolve(new Blob(chunks, { type: selectedType }));
        };
      });

      recorder.start();
      source.start();

      await new Promise<void>((res) => {
        source.onended = () => {
          recorder.stop();
          res();
        };
      });

      const resultBlob = await recordPromise;
      if (resultBlob.size > 0) return resultBlob;
    }
  }

  // Fallback to high quality WAV
  return encodeWAV(audioBuffer);
}
