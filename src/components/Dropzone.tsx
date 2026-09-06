import React, { useRef, useState, useEffect } from 'react';
import { UploadCloud, Image, FileText, Table, Music, Video, Database, Code, Plus, Sparkles } from 'lucide-react';
import { ALL_SUPPORTED_FORMATS } from '../utils/formatRegistry';

interface DropzoneProps {
  onFilesAdded: (files: FileList | File[]) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFilesAdded, disabled }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Support clipboard paste (e.g. copied images or text files)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled) return;
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        onFilesAdded(e.clipboardData.files);
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onFilesAdded, disabled]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files);
      // Reset so the same file can be picked again if needed
      e.target.value = '';
    }
  };

  return (
    <div
      id="file-dropzone-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`relative group cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/30 scale-[1.005] shadow-xl shadow-indigo-500/10'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 shadow-xs'
      }`}
    >
      <input
        ref={fileInputRef}
        id="file-upload-input"
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        disabled={disabled}
      />

      <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center relative z-10">
        {/* Geometric Icon Box */}
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 ${
            isDragOver
              ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-600/30'
              : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 shadow-inner'
          }`}
        >
          <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>

        {/* Primary Call to Action */}
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
          {isDragOver ? 'Drop files to start converting!' : 'Drag & Drop Files'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6 leading-relaxed">
          Convert your images, videos, audio, and documents instantly and securely. Files never leave your computer.
        </p>

        {/* Geometric Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) fileInputRef.current?.click();
          }}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all mb-6"
        >
          Browse Device
        </button>

        {/* Supported Categories Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40">
            <Image className="h-3 w-3" /> Images (PNG, WebP, JPG, SVG)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <FileText className="h-3 w-3" /> Docs (PDF, Word, Markdown)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Table className="h-3 w-3" /> Sheets (Excel, CSV, SQL)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Music className="h-3 w-3" /> Audio (MP3, WAV, FLAC)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Video className="h-3 w-3" /> Video (MP4, WebM, GIF)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Database className="h-3 w-3" /> Data (JSON, YAML, XML)
          </span>
        </div>

        {/* Tip */}
        <div className="mt-4 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-indigo-500" />
          <span>Tip: You can also paste screenshots or text with <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Ctrl+V</kbd></span>
        </div>
      </div>
    </div>
  );
};
