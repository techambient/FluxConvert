import React from 'react';
import { ShieldCheck, HardDrive, Cpu, Lock } from 'lucide-react';

interface FooterProps {
  onOpenFormatExplorer: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenFormatExplorer }) => {
  return (
    <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                100% Client-Side Privacy
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Your files never touch an external server. All conversions happen entirely inside your local browser sandbox.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Cpu className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                Hardware Accelerated
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Powered by HTML5 Web Canvas, Web Audio, WebCodecs, and WebAssembly to maximize local throughput.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/40 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
              <HardDrive className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-0.5">
                Batch Queue & ZIP
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Convert dozens of files simultaneously and package all outputs into a single compressed ZIP with one click.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600 dark:text-slate-400">FluxConvert Local Engine</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Privacy Secured
            </span>
          </div>

          <button
            onClick={onOpenFormatExplorer}
            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-semibold hover:underline"
          >
            Explore all 100+ format conversion matrices →
          </button>
        </div>
      </div>
    </footer>
  );
};
