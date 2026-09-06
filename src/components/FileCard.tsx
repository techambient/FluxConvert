import React, { useState } from 'react';
import {
  FileItem,
  FileCategory
} from '../types/converter';
import {
  formatFileSize,
  calculateSavings,
  downloadBlob
} from '../utils/fileHelpers';
import {
  CATEGORY_LABELS,
  ALL_SUPPORTED_FORMATS,
  getFormatByExtension
} from '../utils/formatRegistry';
import {
  Image as ImageIcon,
  FileText,
  Table,
  Music,
  Video,
  Database,
  Code,
  Archive,
  Download,
  Settings,
  Eye,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface FileCardProps {
  item: FileItem;
  onUpdateTargetFormat: (id: string, targetFormat: string) => void;
  onConvertSingle: (id: string) => void;
  onRemove: (id: string) => void;
  onOpenSettings: (item: FileItem) => void;
  onPreview: (item: FileItem) => void;
}

const CategoryIconMap: Record<FileCategory, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  document: FileText,
  spreadsheet: Table,
  audio: Music,
  video: Video,
  data: Database,
  code: Code,
  archive: Archive,
};

export const FileCard: React.FC<FileCardProps> = ({
  item,
  onUpdateTargetFormat,
  onConvertSingle,
  onRemove,
  onOpenSettings,
  onPreview,
}) => {
  const IconComponent = CategoryIconMap[item.category] || FileText;
  const categoryMeta = CATEGORY_LABELS[item.category] || { title: 'File', color: 'slate' };

  const savings = item.output
    ? calculateSavings(item.size, item.output.size)
    : null;

  return (
    <div
      id={`file-card-${item.id}`}
      className={`rounded-xl border transition-all duration-200 p-4 bg-white dark:bg-slate-900 ${
        item.status === 'completed'
          ? 'border-emerald-200 dark:border-emerald-900/60 shadow-sm'
          : item.status === 'error'
          ? 'border-red-200 dark:border-red-900/60 bg-red-50/20'
          : item.status === 'converting'
          ? 'border-blue-300 dark:border-blue-800 shadow-md shadow-blue-500/5'
          : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: File Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${
              item.category === 'image'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : item.category === 'document'
                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                : item.category === 'spreadsheet'
                ? 'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-400'
                : item.category === 'audio'
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                : item.category === 'video'
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                : item.category === 'data'
                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
            }`}
          >
            <IconComponent className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4
                className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md"
                title={item.name}
              >
                {item.name}
              </h4>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-medium">
                {item.extension}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{formatFileSize(item.size)}</span>
              <span>•</span>
              <span className="capitalize">{categoryMeta.title}</span>

              {/* Converted Stats */}
              {item.status === 'completed' && item.output && (
                <>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Converted to {formatFileSize(item.output.size)}
                  </span>
                  {savings && savings.percentage !== 0 && (
                    <span
                      className={`font-semibold px-1.5 py-0.2 rounded text-[11px] ${
                        savings.isSmaller
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {savings.isSmaller ? `-${savings.percentage}%` : `+${Math.abs(savings.percentage)}%`}
                    </span>
                  )}
                  <span>•</span>
                  <span className="text-slate-400">{item.output.timeTakenMs}ms</span>
                </>
              )}
            </div>

            {/* Error Message */}
            {item.status === 'error' && item.errorMessage && (
              <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 mt-1">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Center / Right: Conversion Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          {/* Format Selector Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400 hidden sm:inline">to</span>
            <select
              id={`select-format-${item.id}`}
              value={item.targetFormat}
              disabled={item.status === 'converting'}
              onChange={(e) => onUpdateTargetFormat(item.id, e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
            >
              {item.availableFormats.map((ext) => {
                const fmt = getFormatByExtension(ext);
                return (
                  <option key={ext} value={ext}>
                    {ext.toUpperCase()} {fmt ? `(${fmt.label.split(' ')[0]})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Options / Settings Button */}
          <button
            id={`btn-settings-${item.id}`}
            onClick={() => onOpenSettings(item)}
            title="Configure conversion settings (quality, resolution, bitrate, etc.)"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Action Button depending on status */}
          {item.status === 'idle' && (
            <button
              id={`btn-convert-${item.id}`}
              onClick={() => onConvertSingle(item.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold transition-all shadow-xs shadow-indigo-200 dark:shadow-none"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Convert</span>
            </button>
          )}

          {item.status === 'converting' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-200 dark:border-indigo-900">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>{item.progress}%</span>
            </div>
          )}

          {item.status === 'completed' && item.output && (
            <div className="flex items-center gap-1.5">
              {/* Preview Button */}
              <button
                id={`btn-preview-${item.id}`}
                onClick={() => onPreview(item)}
                title="Preview converted file"
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </button>

              {/* Download Button */}
              <button
                id={`btn-download-${item.id}`}
                onClick={() => downloadBlob(item.output!.blob, item.output!.filename)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold transition-all shadow-xs shadow-emerald-500/20"
                title={`Download ${item.output.filename}`}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}

          {item.status === 'error' && (
            <button
              id={`btn-retry-${item.id}`}
              onClick={() => onConvertSingle(item.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 hover:bg-red-200 text-xs font-medium transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry</span>
            </button>
          )}

          {/* Remove Button */}
          <button
            id={`btn-remove-${item.id}`}
            onClick={() => onRemove(item.id)}
            title="Remove from queue"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Real-time Progress Bar */}
      {item.status === 'converting' && (
        <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-150 rounded-full"
            style={{ width: `${item.progress}%` }}
          />
        </div>
      )}
    </div>
  );
};
