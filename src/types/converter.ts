export type FileCategory = 
  | 'image' 
  | 'document' 
  | 'spreadsheet' 
  | 'audio' 
  | 'video' 
  | 'data' 
  | 'archive' 
  | 'code';

export interface FormatDefinition {
  extension: string;
  label: string;
  category: FileCategory;
  mimeType: string;
  description: string;
  isInput: boolean;
  isOutput: boolean;
  canConvertTo: string[];
}

export type ConversionStatus = 'idle' | 'converting' | 'completed' | 'error';

export interface ConversionOptions {
  // Image options
  quality?: number; // 0.1 to 1.0 or 10-100
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  scale?: number; // 0.1 to 3
  colorMode?: 'original' | 'grayscale' | 'sepia' | 'invert' | 'bw';
  rotation?: 0 | 90 | 180 | 270;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  icoSizes?: number[]; // [16, 32, 48, 64, 128, 256]

  // Document & PDF options
  pdfOrientation?: 'portrait' | 'landscape';
  pdfPageSize?: 'a4' | 'letter' | 'legal' | 'a3';
  pdfMargin?: number;
  markdownTheme?: 'clean' | 'github' | 'retro';

  // Spreadsheet options
  csvDelimiter?: string; // ',', ';', '\t', '|'
  sheetName?: string;
  includeHeaders?: boolean;
  tableName?: string; // For SQL output

  // Audio options
  audioBitrate?: number; // 64, 128, 192, 256, 320 kbps
  audioSampleRate?: number; // 8000, 16000, 22050, 44100, 48000
  audioChannels?: 1 | 2; // Mono or Stereo
  audioVolume?: number; // 0.0 to 2.0
  audioTrimStart?: number; // seconds
  audioTrimEnd?: number; // seconds

  // Video options
  videoFps?: number; // 10, 15, 24, 30, 60
  videoResolution?: 'original' | '1080p' | '720p' | '480p' | '360p' | 'custom';
  videoSpeed?: number; // 0.5x, 1x, 1.5x, 2x
  videoMute?: boolean;
  gifLoop?: boolean;
  gifDither?: boolean;
  videoTrimStart?: number;
  videoTrimEnd?: number;
  frameInterval?: number; // seconds for frame extraction

  // Data & Code options
  jsonIndent?: number;
  codeMinify?: boolean;
  xmlRootElement?: string;
  yamlIndent?: number;
  typeScriptTypeName?: string;
}

export interface ConvertedOutput {
  blob: Blob;
  dataUrl?: string;
  text?: string;
  filename: string;
  size: number;
  mimeType: string;
  extension: string;
  timeTakenMs: number;
}

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  category: FileCategory;
  previewUrl?: string;
  targetFormat: string;
  availableFormats: string[];
  status: ConversionStatus;
  progress: number;
  options: ConversionOptions;
  output?: ConvertedOutput;
  errorMessage?: string;
}
