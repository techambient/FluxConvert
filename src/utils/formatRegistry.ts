import { FileCategory, FormatDefinition } from '../types/converter';

export const ALL_SUPPORTED_FORMATS: FormatDefinition[] = [
  // --- IMAGES ---
  {
    extension: 'png',
    label: 'PNG Image (.png)',
    category: 'image',
    mimeType: 'image/png',
    description: 'Portable Network Graphics with lossless compression and alpha transparency',
    isInput: true,
    isOutput: true,
    canConvertTo: ['jpg', 'jpeg', 'webp', 'gif', 'bmp', 'ico', 'svg', 'pdf', 'txt', 'base64', 'hex']
  },
  {
    extension: 'jpg',
    label: 'JPEG Image (.jpg)',
    category: 'image',
    mimeType: 'image/jpeg',
    description: 'Joint Photographic Experts Group compressed image standard',
    isInput: true,
    isOutput: true,
    canConvertTo: ['png', 'webp', 'gif', 'bmp', 'ico', 'pdf', 'txt', 'base64', 'hex']
  },
  {
    extension: 'jpeg',
    label: 'JPEG Image (.jpeg)',
    category: 'image',
    mimeType: 'image/jpeg',
    description: 'Joint Photographic Experts Group image standard',
    isInput: true,
    isOutput: true,
    canConvertTo: ['png', 'webp', 'gif', 'bmp', 'ico', 'pdf', 'txt', 'base64', 'hex']
  },
  {
    extension: 'webp',
    label: 'WebP Image (.webp)',
    category: 'image',
    mimeType: 'image/webp',
    description: 'Modern Google WebP image format with ultra-high compression',
    isInput: true,
    isOutput: true,
    canConvertTo: ['png', 'jpg', 'gif', 'bmp', 'ico', 'pdf', 'base64']
  },
  {
    extension: 'gif',
    label: 'GIF Image / Animation (.gif)',
    category: 'image',
    mimeType: 'image/gif',
    description: 'Graphics Interchange Format with animated or static frames',
    isInput: true,
    isOutput: true,
    canConvertTo: ['png', 'jpg', 'webp', 'mp4', 'webm', 'zip', 'pdf', 'base64']
  },
  {
    extension: 'bmp',
    label: 'Bitmap Image (.bmp)',
    category: 'image',
    mimeType: 'image/bmp',
    description: 'Standard Windows uncompressed raster bitmap image',
    isInput: true,
    isOutput: true,
    canConvertTo: ['png', 'jpg', 'webp', 'gif', 'ico', 'pdf', 'base64']
  },
  {
    extension: 'svg',
    label: 'Scalable Vector Graphics (.svg)',
    category: 'image',
    mimeType: 'image/svg+xml',
    description: 'XML-based 2D vector graphic format',
    isInput: true,
    isOutput: true,
    canConvertTo: ['png', 'jpg', 'webp', 'pdf', 'ico', 'base64', 'jsx', 'tsx', 'html']
  },
  {
    extension: 'ico',
    label: 'Windows Icon (.ico)',
    category: 'image',
    mimeType: 'image/x-icon',
    description: 'Multi-resolution Windows desktop & favicon icon format',
    isInput: true,
    isOutput: true,
    canConvertTo: ['png', 'jpg', 'webp', 'base64']
  },
  {
    extension: 'tiff',
    label: 'TIFF Image (.tiff)',
    category: 'image',
    mimeType: 'image/tiff',
    description: 'Tagged Image File Format for high-color depth graphics',
    isInput: true,
    isOutput: true,
    canConvertTo: ['png', 'jpg', 'webp', 'pdf', 'bmp']
  },
  {
    extension: 'tif',
    label: 'TIF Image (.tif)',
    category: 'image',
    mimeType: 'image/tiff',
    description: 'Tagged Image File Format',
    isInput: true,
    isOutput: true,
    canConvertTo: ['png', 'jpg', 'webp', 'pdf', 'bmp']
  },
  {
    extension: 'avif',
    label: 'AVIF Image (.avif)',
    category: 'image',
    mimeType: 'image/avif',
    description: 'AV1 Image File Format next-gen compression',
    isInput: true,
    isOutput: true,
    canConvertTo: ['png', 'jpg', 'webp', 'gif', 'pdf', 'base64']
  },
  {
    extension: 'heic',
    label: 'HEIC Image (.heic)',
    category: 'image',
    mimeType: 'image/heic',
    description: 'High Efficiency Image Container from iOS & modern cameras',
    isInput: true,
    isOutput: false,
    canConvertTo: ['png', 'jpg', 'webp', 'pdf']
  },
  {
    extension: 'heif',
    label: 'HEIF Image (.heif)',
    category: 'image',
    mimeType: 'image/heif',
    description: 'High Efficiency Image File Format',
    isInput: true,
    isOutput: false,
    canConvertTo: ['png', 'jpg', 'webp', 'pdf']
  },

  // --- DOCUMENTS & TEXT ---
  {
    extension: 'pdf',
    label: 'PDF Document (.pdf)',
    category: 'document',
    mimeType: 'application/pdf',
    description: 'Adobe Portable Document Format',
    isInput: true,
    isOutput: true,
    canConvertTo: ['txt', 'md', 'html', 'png', 'jpg', 'zip', 'docx']
  },
  {
    extension: 'docx',
    label: 'Microsoft Word (.docx)',
    category: 'document',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    description: 'Microsoft Word OpenXML Document',
    isInput: true,
    isOutput: true,
    canConvertTo: ['html', 'md', 'txt', 'pdf']
  },
  {
    extension: 'md',
    label: 'Markdown (.md)',
    category: 'document',
    mimeType: 'text/markdown',
    description: 'Lightweight Markdown documentation text format',
    isInput: true,
    isOutput: true,
    canConvertTo: ['html', 'pdf', 'docx', 'txt', 'json', 'bbcode']
  },
  {
    extension: 'markdown',
    label: 'Markdown (.markdown)',
    category: 'document',
    mimeType: 'text/markdown',
    description: 'Markdown formatted plain text',
    isInput: true,
    isOutput: true,
    canConvertTo: ['html', 'pdf', 'docx', 'txt', 'json']
  },
  {
    extension: 'html',
    label: 'HTML Web Page (.html)',
    category: 'document',
    mimeType: 'text/html',
    description: 'HyperText Markup Language standard web format',
    isInput: true,
    isOutput: true,
    canConvertTo: ['md', 'pdf', 'txt', 'docx', 'base64']
  },
  {
    extension: 'htm',
    label: 'HTM Document (.htm)',
    category: 'document',
    mimeType: 'text/html',
    description: 'HyperText Markup document',
    isInput: true,
    isOutput: true,
    canConvertTo: ['md', 'pdf', 'txt', 'docx']
  },
  {
    extension: 'txt',
    label: 'Plain Text (.txt)',
    category: 'document',
    mimeType: 'text/plain',
    description: 'Unformatted standard plain text document',
    isInput: true,
    isOutput: true,
    canConvertTo: ['pdf', 'html', 'md', 'docx', 'base64', 'hex', 'rot13', 'morse']
  },
  {
    extension: 'rtf',
    label: 'Rich Text Format (.rtf)',
    category: 'document',
    mimeType: 'application/rtf',
    description: 'Rich Text Format cross-platform formatted text',
    isInput: true,
    isOutput: true,
    canConvertTo: ['txt', 'html', 'md', 'pdf']
  },
  {
    extension: 'epub',
    label: 'ePub eBook (.epub)',
    category: 'document',
    mimeType: 'application/epub+zip',
    description: 'Electronic Publication digital book format',
    isInput: true,
    isOutput: false,
    canConvertTo: ['txt', 'html', 'md', 'pdf']
  },

  // --- SPREADSHEETS & TABULAR DATA ---
  {
    extension: 'xlsx',
    label: 'Excel Spreadsheet (.xlsx)',
    category: 'spreadsheet',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    description: 'Microsoft Excel OpenXML spreadsheet workbook',
    isInput: true,
    isOutput: true,
    canConvertTo: ['csv', 'tsv', 'json', 'html', 'md', 'ods', 'sql', 'xml', 'txt']
  },
  {
    extension: 'xls',
    label: 'Excel 97-2003 (.xls)',
    category: 'spreadsheet',
    mimeType: 'application/vnd.ms-excel',
    description: 'Legacy Microsoft Excel binary spreadsheet',
    isInput: true,
    isOutput: true,
    canConvertTo: ['xlsx', 'csv', 'tsv', 'json', 'html', 'ods', 'sql']
  },
  {
    extension: 'csv',
    label: 'CSV Data (.csv)',
    category: 'spreadsheet',
    mimeType: 'text/csv',
    description: 'Comma Separated Values tabular data standard',
    isInput: true,
    isOutput: true,
    canConvertTo: ['xlsx', 'json', 'tsv', 'html', 'md', 'sql', 'xml', 'ods', 'txt']
  },
  {
    extension: 'tsv',
    label: 'TSV Data (.tsv)',
    category: 'spreadsheet',
    mimeType: 'text/tab-separated-values',
    description: 'Tab Separated Values spreadsheet data',
    isInput: true,
    isOutput: true,
    canConvertTo: ['csv', 'xlsx', 'json', 'html', 'md', 'sql', 'xml']
  },
  {
    extension: 'ods',
    label: 'OpenDocument Spreadsheet (.ods)',
    category: 'spreadsheet',
    mimeType: 'application/vnd.oasis.opendocument.spreadsheet',
    description: 'LibreOffice / OpenOffice Calc spreadsheet standard',
    isInput: true,
    isOutput: true,
    canConvertTo: ['xlsx', 'csv', 'tsv', 'json', 'html', 'md']
  },

  // --- AUDIO & MUSIC ---
  {
    extension: 'mp3',
    label: 'MP3 Audio (.mp3)',
    category: 'audio',
    mimeType: 'audio/mpeg',
    description: 'MPEG Layer 3 digital audio standard',
    isInput: true,
    isOutput: true,
    canConvertTo: ['wav', 'ogg', 'aac', 'webm', 'flac', 'm4a', 'base64']
  },
  {
    extension: 'wav',
    label: 'WAV Audio (.wav)',
    category: 'audio',
    mimeType: 'audio/wav',
    description: 'Waveform Audio uncompressed PCM digital master',
    isInput: true,
    isOutput: true,
    canConvertTo: ['mp3', 'ogg', 'aac', 'webm', 'flac', 'm4a', 'base64']
  },
  {
    extension: 'ogg',
    label: 'Ogg Vorbis Audio (.ogg)',
    category: 'audio',
    mimeType: 'audio/ogg',
    description: 'Ogg Vorbis open container audio format',
    isInput: true,
    isOutput: true,
    canConvertTo: ['mp3', 'wav', 'aac', 'webm', 'flac', 'm4a']
  },
  {
    extension: 'aac',
    label: 'AAC Audio (.aac)',
    category: 'audio',
    mimeType: 'audio/aac',
    description: 'Advanced Audio Coding high-efficiency stream',
    isInput: true,
    isOutput: true,
    canConvertTo: ['mp3', 'wav', 'ogg', 'webm', 'flac']
  },
  {
    extension: 'm4a',
    label: 'M4A Audio (.m4a)',
    category: 'audio',
    mimeType: 'audio/mp4',
    description: 'MPEG-4 Audio audio container used by Apple iTunes',
    isInput: true,
    isOutput: true,
    canConvertTo: ['mp3', 'wav', 'ogg', 'flac', 'webm']
  },
  {
    extension: 'flac',
    label: 'FLAC Lossless Audio (.flac)',
    category: 'audio',
    mimeType: 'audio/flac',
    description: 'Free Lossless Audio Codec studio master sound',
    isInput: true,
    isOutput: true,
    canConvertTo: ['mp3', 'wav', 'ogg', 'aac', 'webm', 'm4a']
  },
  {
    extension: 'weba',
    label: 'WebM Audio (.weba)',
    category: 'audio',
    mimeType: 'audio/webm',
    description: 'WebM audio stream with Opus/Vorbis codec',
    isInput: true,
    isOutput: true,
    canConvertTo: ['mp3', 'wav', 'ogg', 'aac', 'flac']
  },

  // --- VIDEO & ANIMATION ---
  {
    extension: 'mp4',
    label: 'MP4 Video (.mp4)',
    category: 'video',
    mimeType: 'video/mp4',
    description: 'MPEG-4 Part 14 standard digital video container',
    isInput: true,
    isOutput: true,
    canConvertTo: ['webm', 'gif', 'mp3', 'wav', 'ogg', 'm4a', 'png', 'jpg', 'zip']
  },
  {
    extension: 'webm',
    label: 'WebM Video (.webm)',
    category: 'video',
    mimeType: 'video/webm',
    description: 'Royalty-free HTML5 video container with VP8/VP9/AV1 codec',
    isInput: true,
    isOutput: true,
    canConvertTo: ['mp4', 'gif', 'mp3', 'wav', 'ogg', 'png', 'jpg', 'zip']
  },
  {
    extension: 'mov',
    label: 'QuickTime Movie (.mov)',
    category: 'video',
    mimeType: 'video/quicktime',
    description: 'Apple QuickTime Movie digital video format',
    isInput: true,
    isOutput: false,
    canConvertTo: ['mp4', 'webm', 'gif', 'mp3', 'wav', 'ogg', 'zip']
  },
  {
    extension: 'mkv',
    label: 'Matroska Video (.mkv)',
    category: 'video',
    mimeType: 'video/x-matroska',
    description: 'Matroska open standard multimedia container',
    isInput: true,
    isOutput: false,
    canConvertTo: ['mp4', 'webm', 'gif', 'mp3', 'wav', 'ogg', 'zip']
  },
  {
    extension: 'avi',
    label: 'AVI Video (.avi)',
    category: 'video',
    mimeType: 'video/x-msvideo',
    description: 'Audio Video Interleave multimedia format',
    isInput: true,
    isOutput: false,
    canConvertTo: ['mp4', 'webm', 'gif', 'mp3', 'wav']
  },

  // --- DATA, CONFIG & SERIALIZATION ---
  {
    extension: 'json',
    label: 'JSON Data (.json)',
    category: 'data',
    mimeType: 'application/json',
    description: 'JavaScript Object Notation lightweight data-interchange',
    isInput: true,
    isOutput: true,
    canConvertTo: ['yaml', 'xml', 'csv', 'tsv', 'xlsx', 'toml', 'ts', 'sql', 'txt', 'html']
  },
  {
    extension: 'yaml',
    label: 'YAML (.yaml)',
    category: 'data',
    mimeType: 'text/yaml',
    description: 'YAML Ain’t Markup Language human-readable data serialization',
    isInput: true,
    isOutput: true,
    canConvertTo: ['json', 'xml', 'toml', 'csv', 'txt']
  },
  {
    extension: 'yml',
    label: 'YAML (.yml)',
    category: 'data',
    mimeType: 'text/yaml',
    description: 'YAML data serialization format',
    isInput: true,
    isOutput: true,
    canConvertTo: ['json', 'xml', 'toml', 'csv', 'txt']
  },
  {
    extension: 'xml',
    label: 'XML (.xml)',
    category: 'data',
    mimeType: 'application/xml',
    description: 'Extensible Markup Language structured data format',
    isInput: true,
    isOutput: true,
    canConvertTo: ['json', 'yaml', 'csv', 'txt', 'html']
  },
  {
    extension: 'toml',
    label: 'TOML (.toml)',
    category: 'data',
    mimeType: 'application/toml',
    description: 'Tom’s Obvious Minimal Language configuration format',
    isInput: true,
    isOutput: true,
    canConvertTo: ['json', 'yaml', 'xml', 'txt']
  },
  {
    extension: 'ini',
    label: 'INI Config (.ini)',
    category: 'data',
    mimeType: 'text/plain',
    description: 'Configuration file format with key-value property pairs',
    isInput: true,
    isOutput: true,
    canConvertTo: ['json', 'yaml', 'toml', 'txt']
  },
  {
    extension: 'env',
    label: 'ENV (.env)',
    category: 'data',
    mimeType: 'text/plain',
    description: 'Environment variables configuration file',
    isInput: true,
    isOutput: true,
    canConvertTo: ['json', 'yaml', 'txt']
  },
  {
    extension: 'sql',
    label: 'SQL Script (.sql)',
    category: 'data',
    mimeType: 'application/sql',
    description: 'Structured Query Language statements and table schema',
    isInput: true,
    isOutput: true,
    canConvertTo: ['csv', 'json', 'xlsx', 'txt']
  },
  {
    extension: 'properties',
    label: 'Java Properties (.properties)',
    category: 'data',
    mimeType: 'text/plain',
    description: 'Java properties configuration file format',
    isInput: true,
    isOutput: true,
    canConvertTo: ['json', 'yaml', 'txt']
  },

  // --- DEVELOPER, CODE & ENCODING ---
  {
    extension: 'ts',
    label: 'TypeScript (.ts)',
    category: 'code',
    mimeType: 'text/typescript',
    description: 'Typed superset of JavaScript code',
    isInput: true,
    isOutput: true,
    canConvertTo: ['js', 'json', 'txt']
  },
  {
    extension: 'js',
    label: 'JavaScript (.js)',
    category: 'code',
    mimeType: 'text/javascript',
    description: 'Standard JavaScript source code',
    isInput: true,
    isOutput: true,
    canConvertTo: ['ts', 'txt']
  },
  {
    extension: 'css',
    label: 'CSS Stylesheet (.css)',
    category: 'code',
    mimeType: 'text/css',
    description: 'Cascading Style Sheets file',
    isInput: true,
    isOutput: true,
    canConvertTo: ['txt', 'html']
  },
  {
    extension: 'base64',
    label: 'Base64 Encoded (.base64)',
    category: 'code',
    mimeType: 'text/plain',
    description: 'Base64 binary-to-text representation',
    isInput: true,
    isOutput: true,
    canConvertTo: ['txt', 'png', 'jpg', 'pdf', 'hex']
  },
  {
    extension: 'hex',
    label: 'Hex Dump (.hex)',
    category: 'code',
    mimeType: 'text/plain',
    description: 'Hexadecimal byte stream format',
    isInput: true,
    isOutput: true,
    canConvertTo: ['txt', 'base64', 'bin']
  },

  // --- ARCHIVES & CONTAINERS ---
  {
    extension: 'zip',
    label: 'ZIP Archive (.zip)',
    category: 'archive',
    mimeType: 'application/zip',
    description: 'Standard compressed ZIP archive container',
    isInput: true,
    isOutput: true,
    canConvertTo: ['tar', 'txt']
  },
  {
    extension: 'tar',
    label: 'TAR Archive (.tar)',
    category: 'archive',
    mimeType: 'application/x-tar',
    description: 'Tape Archive Unix container',
    isInput: true,
    isOutput: true,
    canConvertTo: ['zip', 'txt']
  },
  {
    extension: 'gz',
    label: 'GZIP Compressed (.gz)',
    category: 'archive',
    mimeType: 'application/gzip',
    description: 'Gnu ZIP compression algorithm file',
    isInput: true,
    isOutput: true,
    canConvertTo: ['zip', 'txt']
  }
];

export const CATEGORY_LABELS: Record<FileCategory, { title: string; color: string; icon: string }> = {
  image: { title: 'Images', color: 'emerald', icon: 'Image' },
  document: { title: 'Documents', color: 'blue', icon: 'FileText' },
  spreadsheet: { title: 'Spreadsheets & Tables', color: 'green', icon: 'Table' },
  audio: { title: 'Audio & Music', color: 'purple', icon: 'Music' },
  video: { title: 'Video & Animation', color: 'rose', icon: 'Video' },
  data: { title: 'Data & Config', color: 'amber', icon: 'Database' },
  code: { title: 'Code & Dev', color: 'cyan', icon: 'Code' },
  archive: { title: 'Archives & ZIP', color: 'indigo', icon: 'Archive' },
};

export function getFormatByExtension(ext: string): FormatDefinition | undefined {
  const normalized = ext.toLowerCase().replace(/^\./, '');
  return ALL_SUPPORTED_FORMATS.find(f => f.extension === normalized);
}

export function getCompatibleOutputs(inputExt: string): string[] {
  const format = getFormatByExtension(inputExt);
  if (format && format.canConvertTo.length > 0) {
    return format.canConvertTo;
  }
  // Default fallback based on category
  if (!format) {
    return ['txt', 'base64', 'hex', 'zip'];
  }
  return ['txt', 'base64', 'zip'];
}

export function detectCategoryByExtension(ext: string): FileCategory {
  const fmt = getFormatByExtension(ext);
  if (fmt) return fmt.category;

  const e = ext.toLowerCase().replace(/^\./, '');
  if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'svg', 'ico', 'tiff', 'tif', 'avif', 'heic', 'heif', 'raw', 'psd'].includes(e)) return 'image';
  if (['pdf', 'docx', 'doc', 'md', 'markdown', 'txt', 'rtf', 'html', 'htm', 'epub', 'odt', 'pages'].includes(e)) return 'document';
  if (['xlsx', 'xls', 'csv', 'tsv', 'ods', 'numbers'].includes(e)) return 'spreadsheet';
  if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'weba', 'wma', 'aiff', 'opus'].includes(e)) return 'audio';
  if (['mp4', 'webm', 'mov', 'mkv', 'avi', 'wmv', 'flv', 'm4v', '3gp'].includes(e)) return 'video';
  if (['json', 'yaml', 'yml', 'xml', 'toml', 'ini', 'env', 'sql', 'properties', 'graphql'].includes(e)) return 'data';
  if (['ts', 'js', 'jsx', 'tsx', 'css', 'scss', 'html', 'py', 'java', 'c', 'cpp', 'rs', 'go', 'php', 'sh', 'base64', 'hex'].includes(e)) return 'code';
  if (['zip', 'tar', 'gz', '7z', 'rar', 'bz2'].includes(e)) return 'archive';

  return 'document';
}
