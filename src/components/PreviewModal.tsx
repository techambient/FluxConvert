import React, { useState, useEffect } from 'react';
import { FileItem } from '../types/converter';
import { formatFileSize, downloadBlob, readFileAsText } from '../utils/fileHelpers';
import { X, Download, Copy, Check, Eye } from 'lucide-react';

interface PreviewModalProps {
  item: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ item, isOpen, onClose }) => {
  if (!isOpen || !item || !item.output) return null;

  const [copied, setCopied] = useState(false);
  const [previewText, setPreviewText] = useState<string | null>(item.output.text || null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (item.output?.blob) {
      const url = URL.createObjectURL(item.output.blob);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [item.output?.blob]);

  useEffect(() => {
    // If text preview not already populated, read if text-based
    if (
      !previewText &&
      item.output?.blob &&
      item.output.blob.size < 2000000 &&
      (item.output.mimeType.startsWith('text/') ||
        item.output.mimeType.includes('json') ||
        item.output.mimeType.includes('xml') ||
        item.output.mimeType.includes('yaml') ||
        item.output.mimeType.includes('javascript') ||
        item.output.mimeType.includes('typescript'))
    ) {
      readFileAsText(item.output.blob).then(setPreviewText);
    }
  }, [item.output, previewText]);

  const handleCopy = () => {
    if (previewText) {
      navigator.clipboard.writeText(previewText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isImage = item.output.mimeType.startsWith('image/');
  const isAudio = item.output.mimeType.startsWith('audio/');
  const isVideo = item.output.mimeType.startsWith('video/');
  const isPdf = item.output.mimeType === 'application/pdf';

  return (
    <div
      id="file-preview-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        id="file-preview-modal-content"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Eye className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {item.output.filename}
              </h3>
              <p className="text-xs text-slate-500">
                {formatFileSize(item.output.size)} • {item.output.mimeType}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {previewText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            )}

            <button
              onClick={() => downloadBlob(item.output!.blob, item.output!.filename)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#F8FAFC]/50 dark:bg-slate-950/50 min-h-[300px]">
          {/* IMAGE */}
          {isImage && objectUrl && (
            <div className="max-w-full max-h-full flex items-center justify-center p-2">
              <img
                src={objectUrl}
                alt={item.output.filename}
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 bg-checkerboard"
              />
            </div>
          )}

          {/* AUDIO */}
          {isAudio && objectUrl && (
            <div className="w-full max-w-md p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xs text-center space-y-4 border border-slate-200 dark:border-slate-700">
              <div className="h-20 w-20 mx-auto rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                <span className="text-2xl font-bold">♪</span>
              </div>
              <audio controls src={objectUrl} className="w-full" autoPlay />
            </div>
          )}

          {/* VIDEO */}
          {isVideo && objectUrl && (
            <div className="max-w-full max-h-full p-2">
              <video
                controls
                src={objectUrl}
                className="max-h-[60vh] max-w-full rounded-xl shadow-xs"
                autoPlay
              />
            </div>
          )}

          {/* PDF */}
          {isPdf && objectUrl && (
            <div className="w-full h-[60vh]">
              <iframe
                src={objectUrl}
                title={item.output.filename}
                className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800"
              />
            </div>
          )}

          {/* TEXT / CODE */}
          {previewText && !isImage && !isAudio && !isVideo && !isPdf && (
            <div className="w-full h-full max-h-[60vh] overflow-auto">
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                <code>{previewText}</code>
              </pre>
            </div>
          )}

          {/* FALLBACK FOR BINARY ARCHIVES */}
          {!previewText && !isImage && !isAudio && !isVideo && !isPdf && (
            <div className="text-center p-8 space-y-3">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 flex items-center justify-center">
                <Download className="h-8 w-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Binary Converted File Ready
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                This file format is ready to be saved and used directly on your computer.
              </p>
              <button
                onClick={() => downloadBlob(item.output!.blob, item.output!.filename)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Download {item.output.filename}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
