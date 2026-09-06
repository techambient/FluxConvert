import React, { useState } from 'react';
import { FileItem, ConversionOptions } from '../types/converter';
import { X, Sliders, Check, RotateCw, FlipHorizontal, FlipVertical, Volume2 } from 'lucide-react';

interface SettingsModalProps {
  item: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, options: ConversionOptions) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !item) return null;

  const [options, setOptions] = useState<ConversionOptions>({ ...item.options });

  const handleSave = () => {
    onSave(item.id, options);
    onClose();
  };

  const isImage = item.category === 'image';
  const isDocument = item.category === 'document';
  const isSpreadsheet = item.category === 'spreadsheet';
  const isAudio = item.category === 'audio';
  const isVideo = item.category === 'video';
  const isData = item.category === 'data' || item.category === 'code';

  return (
    <div
      id="conversion-settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="conversion-settings-modal-content"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Conversion Settings
              </h3>
              <p className="text-xs text-slate-500 truncate max-w-xs">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dynamic Controls based on Category */}
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* IMAGE CONTROLS */}
          {isImage && (
            <>
              {/* Quality */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Image Quality</span>
                  <span className="font-mono text-indigo-600 font-bold">{Math.round((options.quality ?? 0.92) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={options.quality ?? 0.92}
                  onChange={(e) => setOptions({ ...options, quality: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Color Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Color Filter
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {(['original', 'grayscale', 'sepia', 'invert', 'bw'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setOptions({ ...options, colorMode: mode })}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                        (options.colorMode || 'original') === mode
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {mode === 'bw' ? 'B&W' : mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation & Flip */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Transform & Rotation
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const cur = options.rotation || 0;
                      const next = ((cur + 90) % 360) as 0 | 90 | 180 | 270;
                      setOptions({ ...options, rotation: next });
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                    <span>Rotate ({options.rotation || 0}°)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, flipHorizontal: !options.flipHorizontal })}
                    className={`p-2 rounded-lg border text-xs ${
                      options.flipHorizontal
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                    }`}
                    title="Flip Horizontally"
                  >
                    <FlipHorizontal className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, flipVertical: !options.flipVertical })}
                    className={`p-2 rounded-lg border text-xs ${
                      options.flipVertical
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                    }`}
                    title="Flip Vertically"
                  >
                    <FlipVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Resize / Scale */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Scale Factor</span>
                  <span className="font-mono text-indigo-600 font-bold">{Math.round((options.scale ?? 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={options.scale ?? 1}
                  onChange={(e) => setOptions({ ...options, scale: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </>
          )}

          {/* DOCUMENT / PDF CONTROLS */}
          {isDocument && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  PDF Page Orientation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['portrait', 'landscape'] as const).map((orient) => (
                    <button
                      key={orient}
                      type="button"
                      onClick={() => setOptions({ ...options, pdfOrientation: orient })}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium capitalize border transition-all ${
                        (options.pdfOrientation || 'portrait') === orient
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {orient}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Page Size
                </label>
                <select
                  value={options.pdfPageSize || 'a4'}
                  onChange={(e) => setOptions({ ...options, pdfPageSize: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                >
                  <option value="a4">A4 (210 × 297 mm)</option>
                  <option value="letter">US Letter (8.5 × 11 in)</option>
                  <option value="legal">US Legal (8.5 × 14 in)</option>
                  <option value="a3">A3 (297 × 420 mm)</option>
                </select>
              </div>
            </>
          )}

          {/* SPREADSHEET CONTROLS */}
          {isSpreadsheet && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  CSV Delimiter
                </label>
                <select
                  value={options.csvDelimiter || ','}
                  onChange={(e) => setOptions({ ...options, csvDelimiter: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                >
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="&#9;">Tab (\t)</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  SQL Table Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. users_data"
                  value={options.tableName || ''}
                  onChange={(e) => setOptions({ ...options, tableName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                />
              </div>
            </>
          )}

          {/* AUDIO CONTROLS */}
          {isAudio && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Audio Channels
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, audioChannels: 2 })}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border ${
                      (options.audioChannels || 2) === 2
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-semibold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Stereo (2 Channels)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOptions({ ...options, audioChannels: 1 })}
                    className={`py-1.5 px-3 rounded-lg text-xs font-medium border ${
                      options.audioChannels === 1
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-semibold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Mono (1 Channel)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  <span>Volume Gain</span>
                  <span className="font-mono text-indigo-600 font-bold">{Math.round((options.audioVolume ?? 1.0) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.1"
                  value={options.audioVolume ?? 1.0}
                  onChange={(e) => setOptions({ ...options, audioVolume: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </>
          )}

          {/* VIDEO CONTROLS */}
          {isVideo && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Output Resolution
                </label>
                <select
                  value={options.videoResolution || 'original'}
                  onChange={(e) => setOptions({ ...options, videoResolution: e.target.value as any })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs"
                >
                  <option value="original">Original Resolution</option>
                  <option value="1080p">1080p Full HD (1920×1080)</option>
                  <option value="720p">720p HD (1280×720)</option>
                  <option value="480p">480p SD (854×480)</option>
                  <option value="360p">360p Mobile (640×360)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mute Audio Stream</span>
                <input
                  type="checkbox"
                  checked={options.videoMute || false}
                  onChange={(e) => setOptions({ ...options, videoMute: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
              </div>
            </>
          )}

          {/* DATA & CODE CONTROLS */}
          {isData && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  JSON / YAML Indentation
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[2, 4].map((spaces) => (
                    <button
                      key={spaces}
                      type="button"
                      onClick={() => setOptions({ ...options, jsonIndent: spaces, yamlIndent: spaces })}
                      className={`py-1.5 px-3 rounded-lg text-xs font-medium border ${
                        (options.jsonIndent || 2) === spaces
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 font-semibold'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {spaces} Spaces
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Minify Output</span>
                <input
                  type="checkbox"
                  checked={options.codeMinify || false}
                  onChange={(e) => setOptions({ ...options, codeMinify: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 rounded"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 dark:shadow-none active:scale-95"
          >
            <Check className="h-4 w-4" />
            <span>Apply Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
