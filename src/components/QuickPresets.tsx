import React from 'react';
import { Sparkles, Image, FileText, Table, Music, Code, Check } from 'lucide-react';

interface QuickPresetsProps {
  onLoadSample: (sampleFile: File, defaultTarget: string) => void;
}

export const QuickPresets: React.FC<QuickPresetsProps> = ({ onLoadSample }) => {
  // Generates real client-side File objects dynamically for instant testing
  const createSampleImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;

    // Draw gradient background
    const grad = ctx.createLinearGradient(0, 0, 400, 300);
    grad.addColorStop(0, '#3b82f6');
    grad.addColorStop(0.5, '#6366f1');
    grad.addColorStop(1, '#ec4899');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 300);

    // Draw shapes
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(200, 130, 50, 0, Math.PI * 2);
    ctx.fill();

    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Sample Test Graphic', 200, 230);
    ctx.font = '13px sans-serif';
    ctx.fillText('Ready for WebP / JPG / ICO conversion', 200, 255);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'sample_graphic.png', { type: 'image/png' });
        onLoadSample(file, 'webp');
      }
    }, 'image/png');
  };

  const createSampleSpreadsheet = () => {
    const csvContent = `Product_ID,Product_Name,Category,Price_USD,Stock_Qty,Rating
101,Pro Wireless Headphones,Electronics,149.99,42,4.8
102,Ergonomic Mechanical Keyboard,Accessories,89.50,118,4.9
103,4K Ultra-Wide Monitor,Displays,429.00,15,4.7
104,Noise-Cancelling Earbuds,Audio,79.95,67,4.6
105,Smart Desk Lamp,Lighting,34.99,204,4.5
106,USB-C Fast Charger 100W,Accessories,45.00,89,4.9`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], 'inventory_sample.csv', { type: 'text/csv' });
    onLoadSample(file, 'xlsx');
  };

  const createSampleDocument = () => {
    const mdContent = `# Universal Converter Documentation

Welcome to **OmniConvert**, the 100% browser-native offline file conversion engine.

## Key Highlights
- **100% Offline & Private**: All bytes are processed within your browser sandbox.
- **100+ Supported Formats**: Convert between images, documents, spreadsheets, audio, video, and code.
- **Batch Processing**: Convert multiple files in parallel with zero lag.

### Code Example
\`\`\`typescript
const result = await processFileConversion(file, 'pdf', { quality: 0.95 });
console.log('Done!', result.size);
\`\`\`

> *No files are ever uploaded or transmitted to external servers.*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const file = new File([blob], 'quickstart_guide.md', { type: 'text/markdown' });
    onLoadSample(file, 'pdf');
  };

  const createSampleData = () => {
    const jsonData = {
      server_config: {
        app_name: "Universal File Engine",
        version: "2.4.0",
        environment: "production",
        offline_mode: true
      },
      supported_formats: ["png", "jpg", "webp", "pdf", "docx", "xlsx", "csv", "mp3", "wav", "webm", "json", "yaml", "xml", "sql"],
      features: {
        batch_conversion: true,
        zero_server_upload: true,
        high_speed_canvas: true
      }
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const file = new File([blob], 'app_config.json', { type: 'application/json' });
    onLoadSample(file, 'yaml');
  };

  const createSampleAudio = () => {
    // Generate a 1-second clean synth chord in WAV
    const sampleRate = 44100;
    const duration = 1.5;
    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF header
    const writeStr = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeStr(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeStr(8, 'WAVE');
    writeStr(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeStr(36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate C Major Chord (261.6Hz C4, 329.6Hz E4, 392.0Hz G4) with decay
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.max(0, 1 - t / duration);
      const sampleC = Math.sin(2 * Math.PI * 261.63 * t);
      const sampleE = Math.sin(2 * Math.PI * 329.63 * t);
      const sampleG = Math.sin(2 * Math.PI * 392.00 * t);
      const mixed = (sampleC * 0.4 + sampleE * 0.3 + sampleG * 0.3) * envelope * 0.7;
      const intVal = mixed * 0x7FFF;
      view.setInt16(offset, intVal, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    const file = new File([blob], 'synth_chord.wav', { type: 'audio/wav' });
    onLoadSample(file, 'mp3');
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
      <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] shrink-0 flex items-center gap-1.5 mr-1">
        <Sparkles className="h-3 w-3 text-indigo-500" />
        <span>Quick Samples:</span>
      </span>

      <button
        onClick={createSampleImage}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold shrink-0 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
      >
        <Image className="h-3.5 w-3.5 text-indigo-500" />
        <span>PNG → WebP</span>
      </button>

      <button
        onClick={createSampleSpreadsheet}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold shrink-0 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
      >
        <Table className="h-3.5 w-3.5 text-emerald-500" />
        <span>CSV → Excel</span>
      </button>

      <button
        onClick={createSampleDocument}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold shrink-0 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
      >
        <FileText className="h-3.5 w-3.5 text-blue-500" />
        <span>MD → PDF</span>
      </button>

      <button
        onClick={createSampleData}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold shrink-0 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
      >
        <Code className="h-3.5 w-3.5 text-amber-500" />
        <span>JSON → YAML</span>
      </button>

      <button
        onClick={createSampleAudio}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold shrink-0 border border-slate-200 dark:border-slate-800 transition-colors shadow-2xs"
      >
        <Music className="h-3.5 w-3.5 text-purple-500" />
        <span>WAV → MP3</span>
      </button>
    </div>
  );
};
