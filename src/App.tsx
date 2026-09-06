/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { FileCard } from './components/FileCard';
import { BatchControls } from './components/BatchControls';
import { SettingsModal } from './components/SettingsModal';
import { PreviewModal } from './components/PreviewModal';
import { FormatExplorerModal } from './components/FormatExplorerModal';
import { QuickPresets } from './components/QuickPresets';
import { Footer } from './components/Footer';
import { FileItem, ConversionOptions } from './types/converter';
import { detectCategoryByExtension, getCompatibleOutputs, ALL_SUPPORTED_FORMATS } from './utils/formatRegistry';
import { getFileExtension, changeExtension, downloadBlob } from './utils/fileHelpers';
import { processFileConversion } from './converters';
import { createZipFromFiles } from './converters/archiveConverter';
import confetti from 'canvas-confetti';
import { Sparkles, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [isConvertingBatch, setIsConvertingBatch] = useState(false);
  const [selectedSettingsItem, setSelectedSettingsItem] = useState<FileItem | null>(null);
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<FileItem | null>(null);
  const [isFormatExplorerOpen, setIsFormatExplorerOpen] = useState(false);

  // Add files to the conversion queue
  const handleAddFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newItems: FileItem[] = fileArray.map((file) => {
      const ext = getFileExtension(file.name);
      const category = detectCategoryByExtension(ext);
      const availableFormats = getCompatibleOutputs(ext);

      // Pick the most practical default target format
      let defaultTarget = availableFormats[0] || 'pdf';
      if (ext === 'png') defaultTarget = 'webp';
      else if (ext === 'jpg' || ext === 'jpeg') defaultTarget = 'webp';
      else if (ext === 'webp') defaultTarget = 'png';
      else if (ext === 'csv') defaultTarget = 'xlsx';
      else if (ext === 'xlsx' || ext === 'xls') defaultTarget = 'csv';
      else if (ext === 'md' || ext === 'markdown') defaultTarget = 'pdf';
      else if (ext === 'docx') defaultTarget = 'html';
      else if (ext === 'json') defaultTarget = 'yaml';
      else if (ext === 'yaml' || ext === 'yml') defaultTarget = 'json';
      else if (ext === 'mp4') defaultTarget = 'mp3';
      else if (ext === 'wav') defaultTarget = 'mp3';
      else if (ext === 'mp3') defaultTarget = 'wav';

      return {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        extension: ext,
        category,
        targetFormat: defaultTarget,
        availableFormats,
        status: 'idle',
        progress: 0,
        options: {
          quality: 0.92,
          scale: 1,
          maintainAspectRatio: true,
          audioBitrate: 192,
          audioSampleRate: 44100,
          csvDelimiter: ',',
          jsonIndent: 2,
          videoFps: 24,
        },
      };
    });

    setItems((prev) => [...prev, ...newItems]);
  }, []);

  // Update target format for a specific file
  const handleUpdateTargetFormat = useCallback((id: string, targetFormat: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            targetFormat,
            status: 'idle',
            progress: 0,
            output: undefined,
            errorMessage: undefined,
          };
        }
        return item;
      })
    );
  }, []);

  // Save settings for a specific file
  const handleSaveSettings = useCallback((id: string, options: ConversionOptions) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, options };
        }
        return item;
      })
    );
  }, []);

  // Remove a single item from the queue
  const handleRemoveItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Clear all items
  const handleClearAll = useCallback(() => {
    setItems([]);
  }, []);

  // Set all items to a specific format
  const handleSetAllTargetFormat = useCallback((format: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.availableFormats.includes(format)) {
          return {
            ...item,
            targetFormat: format,
            status: 'idle',
            progress: 0,
            output: undefined,
            errorMessage: undefined,
          };
        }
        return item;
      })
    );
  }, []);

  // Convert a single file
  const handleConvertSingle = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: 'converting', progress: 10, errorMessage: undefined } : i))
    );

    try {
      const output = await processFileConversion(
        item.file,
        item.targetFormat,
        item.options,
        (progress) => {
          setItems((prev) =>
            prev.map((i) => (i.id === id ? { ...i, progress } : i))
          );
        }
      );

      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: 'completed', progress: 100, output } : i))
      );

      // Trigger small confetti burst
      try {
        confetti({
          particleCount: 25,
          spread: 40,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // Safe fallback
      }
    } catch (err: any) {
      console.error('Conversion failed for', item.name, err);
      setItems((prev) =>
        prev.map((i) =>
          i.id === id
            ? { ...i, status: 'error', progress: 0, errorMessage: err.message || 'Conversion failed' }
            : i
        )
      );
    }
  }, [items]);

  // Convert all idle files in parallel
  const handleConvertAll = useCallback(async () => {
    setIsConvertingBatch(true);
    const idleItems = items.filter((i) => i.status === 'idle' || i.status === 'error');

    // Concurrency limit of 3 simultaneous conversions
    const concurrency = 3;
    const queue = [...idleItems];

    const runWorker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;

        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: 'converting', progress: 15, errorMessage: undefined } : i))
        );

        try {
          const output = await processFileConversion(
            item.file,
            item.targetFormat,
            item.options,
            (progress) => {
              setItems((prev) =>
                prev.map((i) => (i.id === item.id ? { ...i, progress } : i))
              );
            }
          );

          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: 'completed', progress: 100, output } : i))
          );
        } catch (err: any) {
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: 'error', progress: 0, errorMessage: err.message || 'Conversion error' }
                : i
            )
          );
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, idleItems.length) }, () => runWorker());
    await Promise.all(workers);

    setIsConvertingBatch(false);

    // Big confetti celebration when all complete
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // Safe fallback
    }
  }, [items]);

  // Download all completed files as a ZIP archive
  const handleDownloadAllZip = useCallback(async () => {
    const completedItems = items.filter((i) => i.status === 'completed' && i.output);
    if (completedItems.length === 0) return;

    try {
      const zipResult = await createZipFromFiles(completedItems, 'converted_files.zip');
      downloadBlob(zipResult.blob, zipResult.filename);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    }
  }, [items]);

  // Load a demo sample file
  const handleLoadSample = useCallback((file: File, defaultTarget: string) => {
    const ext = getFileExtension(file.name);
    const category = detectCategoryByExtension(ext);
    const availableFormats = getCompatibleOutputs(ext);

    const newItem: FileItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: ext,
      category,
      targetFormat: defaultTarget,
      availableFormats,
      status: 'idle',
      progress: 0,
      options: {
        quality: 0.92,
        scale: 1,
        maintainAspectRatio: true,
        audioBitrate: 192,
        audioSampleRate: 44100,
        csvDelimiter: ',',
        jsonIndent: 2,
      },
    };

    setItems((prev) => [newItem, ...prev]);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        onOpenFormatExplorer={() => setIsFormatExplorerOpen(true)}
        formatCount={ALL_SUPPORTED_FORMATS.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Quick Demo Sample Bar */}
        <QuickPresets onLoadSample={handleLoadSample} />

        {/* Drag and Drop Zone */}
        <Dropzone onFilesAdded={handleAddFiles} disabled={isConvertingBatch} />

        {/* Batch Action Bar */}
        {items.length > 0 && (
          <BatchControls
            items={items}
            isConverting={isConvertingBatch}
            onConvertAll={handleConvertAll}
            onDownloadAllZip={handleDownloadAllZip}
            onClearAll={handleClearAll}
            onSetAllTargetFormat={handleSetAllTargetFormat}
          />
        )}

        {/* Active Files Queue */}
        {items.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
              <span>Conversion Queue ({items.length})</span>
              <span>100% Offline Processing</span>
            </div>

            <div className="space-y-2.5">
              {items.map((item) => (
                <FileCard
                  key={item.id}
                  item={item}
                  onUpdateTargetFormat={handleUpdateTargetFormat}
                  onConvertSingle={handleConvertSingle}
                  onRemove={handleRemoveItem}
                  onOpenSettings={(item) => setSelectedSettingsItem(item)}
                  onPreview={(item) => setSelectedPreviewItem(item)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Footer */}
      <Footer onOpenFormatExplorer={() => setIsFormatExplorerOpen(true)} />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={selectedSettingsItem !== null}
        item={selectedSettingsItem}
        onClose={() => setSelectedSettingsItem(null)}
        onSave={handleSaveSettings}
      />

      {/* File Preview Modal */}
      <PreviewModal
        isOpen={selectedPreviewItem !== null}
        item={selectedPreviewItem}
        onClose={() => setSelectedPreviewItem(null)}
      />

      {/* 100+ Format Explorer Matrix Modal */}
      <FormatExplorerModal
        isOpen={isFormatExplorerOpen}
        onClose={() => setIsFormatExplorerOpen(false)}
      />
    </div>
  );
}
