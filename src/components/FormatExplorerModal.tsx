import React, { useState } from 'react';
import { ALL_SUPPORTED_FORMATS, CATEGORY_LABELS } from '../utils/formatRegistry';
import { FileCategory } from '../types/converter';
import { X, Search, Grid, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

interface FormatExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormatExplorerModal: React.FC<FormatExplorerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredFormats = ALL_SUPPORTED_FORMATS.filter((fmt) => {
    const matchesSearch =
      fmt.extension.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fmt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fmt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fmt.canConvertTo.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'all' || fmt.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = Object.keys(CATEGORY_LABELS) as FileCategory[];

  return (
    <div
      id="format-explorer-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="format-explorer-modal-content"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Grid className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Supported 100+ Format Matrix
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">
                  {ALL_SUPPORTED_FORMATS.length} Registered Formats
                </span>
              </div>
              <p className="text-xs text-slate-500">
                100% browser-native conversion graph — all processing happens client-side
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search formats by name, extension (e.g. .webp, .docx, .sql, .mp3, .pdf) or target..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All Formats ({ALL_SUPPORTED_FORMATS.length})
            </button>
            {categories.map((cat) => {
              const meta = CATEGORY_LABELS[cat];
              const count = ALL_SUPPORTED_FORMATS.filter((f) => f.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {meta.title} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Formats Grid Catalog */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#F8FAFC] dark:bg-slate-950/50">
          {filteredFormats.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No formats matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredFormats.map((fmt) => (
                <div
                  key={fmt.extension}
                  className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                          .{fmt.extension}
                        </span>
                        <span className="font-semibold text-xs text-slate-900 dark:text-white">
                          {fmt.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {fmt.description}
                      </p>
                    </div>
                  </div>

                  {/* Converts To Badges */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400 font-medium">Converts to:</span>
                    {fmt.canConvertTo.map((target) => (
                      <span
                        key={target}
                        className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                      >
                        .{target}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-900 text-center text-xs text-slate-500">
          🔒 Offline Engine • Powered by HTML5 Web APIs, Canvas, Web Audio API, WebAssembly & Client Bundles
        </div>
      </div>
    </div>
  );
};
