import React from 'react';
import { FileItem } from '../types/converter';
import { Play, Download, Trash2, Layers, CheckCircle2, RefreshCw } from 'lucide-react';

interface BatchControlsProps {
  items: FileItem[];
  isConverting: boolean;
  onConvertAll: () => void;
  onDownloadAllZip: () => void;
  onClearAll: () => void;
  onSetAllTargetFormat: (format: string) => void;
}

export const BatchControls: React.FC<BatchControlsProps> = ({
  items,
  isConverting,
  onConvertAll,
  onDownloadAllZip,
  onClearAll,
  onSetAllTargetFormat,
}) => {
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const idleCount = items.filter((i) => i.status === 'idle').length;
  const totalCount = items.length;

  if (totalCount === 0) return null;

  return (
    <div
      id="batch-controls-bar"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3"
    >
      {/* Left: Status Counts */}
      <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 w-full sm:w-auto justify-between sm:justify-start">
        <span className="font-semibold text-slate-900 dark:text-white">
          {totalCount} {totalCount === 1 ? 'file' : 'files'} in queue
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          {completedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> {completedCount} completed
            </span>
          )}
          {idleCount > 0 && (
            <span>• {idleCount} ready</span>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
        {/* Quick Batch Format Switcher */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 hidden md:inline">Convert all to:</span>
          <select
            id="batch-format-select"
            onChange={(e) => {
              if (e.target.value) {
                onSetAllTargetFormat(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 focus:outline-none"
          >
            <option value="" disabled>Choose format...</option>
            <optgroup label="Images">
              <option value="webp">WEBP (Compressed)</option>
              <option value="png">PNG (Lossless)</option>
              <option value="jpg">JPG (Photo)</option>
              <option value="ico">ICO (Favicon)</option>
            </optgroup>
            <optgroup label="Documents">
              <option value="pdf">PDF Document</option>
              <option value="md">Markdown</option>
              <option value="html">HTML</option>
              <option value="txt">Plain Text</option>
              <option value="docx">Word (.docx)</option>
            </optgroup>
            <optgroup label="Spreadsheets / Data">
              <option value="csv">CSV Spreadsheet</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="json">JSON</option>
              <option value="yaml">YAML</option>
              <option value="sql">SQL Inserts</option>
            </optgroup>
            <optgroup label="Media">
              <option value="mp3">MP3 Audio</option>
              <option value="wav">WAV Audio</option>
              <option value="gif">Animated GIF</option>
              <option value="webm">WebM Video</option>
            </optgroup>
          </select>
        </div>

        {/* Convert All Button */}
        <button
          id="btn-convert-all"
          onClick={onConvertAll}
          disabled={isConverting || idleCount === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 ${
            isConverting || idleCount === 0
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none'
          }`}
        >
          {isConverting ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Converting...</span>
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Convert All ({idleCount})</span>
            </>
          )}
        </button>

        {/* Download All as ZIP */}
        {completedCount > 0 && (
          <button
            id="btn-download-all-zip"
            onClick={onDownloadAllZip}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-500/20 transition-all active:scale-95"
            title="Download all converted files zipped into a single archive"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download All ZIP ({completedCount})</span>
          </button>
        )}

        {/* Clear All Button */}
        <button
          id="btn-clear-all"
          onClick={onClearAll}
          disabled={isConverting}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          title="Clear all files from queue"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
