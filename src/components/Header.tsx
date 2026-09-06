import React from 'react';
import { ShieldCheck, Grid, RefreshCw, ArrowLeftRight, Cpu } from 'lucide-react';

interface HeaderProps {
  onOpenFormatExplorer: () => void;
  formatCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFormatExplorer, formatCount }) => {
  return (
    <header className="h-16 px-4 sm:px-8 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs sticky top-0 z-30 transition-colors">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm">
          <ArrowLeftRight className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
            FluxConvert
          </span>
          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:inline-block">
            Local Engine
          </span>
        </div>
      </div>

      {/* Nav links & Badges */}
      <div className="flex items-center gap-3 sm:gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
        <div className="hidden lg:flex items-center gap-5 text-xs font-semibold">
          <span className="text-indigo-600 dark:text-indigo-400 cursor-pointer">Converter</span>
          <span className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors" onClick={onOpenFormatExplorer}>
            Matrix ({formatCount}+)
          </span>
          <span className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors">
            Optimizer
          </span>
        </div>

        <div className="hidden sm:block h-4 w-[1px] bg-slate-200 dark:bg-slate-800"></div>

        {/* Offline Ready Emerald Status */}
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-800/60 shadow-2xs">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-bold uppercase tracking-wider">Offline Ready</span>
        </div>

        {/* Format Explorer Button */}
        <button
          id="open-format-explorer-btn"
          onClick={onOpenFormatExplorer}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-all shadow-2xs active:scale-95 border border-indigo-100 dark:border-indigo-800/40"
          title="Browse all 100+ supported file format conversion pairs"
        >
          <Grid className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">100+ Matrix</span>
        </button>
      </div>
    </header>
  );
};
