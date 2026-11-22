import {
  ArrowLeftRight,
  AudioLines,
  FileAudio,
  FileImage,
  FolderArchive,
  Hash,
  type LucideIcon,
  Minimize2,
  NotebookText,
  Pencil,
  Quote,
  ScanSearch,
  Shapes,
  Wand2,
} from 'lucide-react';

export type ToolAccent = 'blue' | 'orange' | 'emerald' | 'amber' | 'sky' | 'rose' | 'teal';

export interface ToolDefinition {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: ToolAccent;
  unavailableReason?: string;
}

export const TOOLS: ToolDefinition[] = [
  {
    slug: 'transcribe-files',
    title: 'Transcribe files to text',
    description: 'Extract text from audio and video files.',
    icon: FileAudio,
    accent: 'blue',
    unavailableReason: 'Transcribing audio and video needs a speech-to-text service that is not connected to Akash Exam Hub yet.',
  },
  {
    slug: 'convert-files',
    title: 'Convert files',
    description: 'Convert images between PNG, JPEG and WebP.',
    icon: ArrowLeftRight,
    accent: 'orange',
  },
  {
    slug: 'compress-files',
    title: 'Compress files',
    description: 'Reduce the file size of images while keeping them clear.',
    icon: Minimize2,
    accent: 'emerald',
  },
  {
    slug: 'edit-pdfs-images',
    title: 'Edit PDFs and images',
    description: 'Rotate and flip images. PDF editing is not available yet.',
    icon: FileImage,
    accent: 'sky',
  },
  {
    slug: 'rewrite-text',
    title: 'Rewrite text with AI',
    description: 'Rewrite any text in a simpler, formal, friendly or exam-ready style.',
    icon: Wand2,
    accent: 'amber',
  },
  {
    slug: 'text-to-audio',
    title: 'Convert text to audio',
    description: 'Listen to any text read aloud in your browser.',
    icon: AudioLines,
    accent: 'rose',
  },
  {
    slug: 'draft-notes',
    title: 'Take and draft notes',
    description: 'Write a new note and save it to your account.',
    icon: Pencil,
    accent: 'teal',
  },
  {
    slug: 'diagrams-ai',
    title: 'Create diagrams with AI',
    description: 'Turn a text prompt into a diagram.',
    icon: Shapes,
    accent: 'blue',
    unavailableReason: 'Diagram generation is not connected to Akash Exam Hub yet.',
  },
  {
    slug: 'detect-ai',
    title: 'Detect AI-generated content',
    description: 'Get an estimated score for how likely text was written by AI.',
    icon: ScanSearch,
    accent: 'orange',
  },
  {
    slug: 'word-count',
    title: 'Count words and characters',
    description: 'See word, character, sentence and reading-time counts.',
    icon: Hash,
    accent: 'emerald',
  },
  {
    slug: 'citation-generator',
    title: 'Citation generator',
    description: 'Create book and website citations in APA or MLA style.',
    icon: Quote,
    accent: 'sky',
  },
  {
    slug: 'note-taking',
    title: 'Note taking',
    description: 'Create, edit, search and delete your saved notes.',
    icon: NotebookText,
    accent: 'amber',
  },
  {
    slug: 'documents-storage',
    title: 'Documents storage',
    description: 'Store and manage your study documents.',
    icon: FolderArchive,
    accent: 'rose',
    unavailableReason: 'Document storage is not set up yet, so files cannot be saved to your account.',
  },
];

export function findTool(slug: string): ToolDefinition | undefined {
  return TOOLS.find((tool) => tool.slug === slug);
}

export const ACCENT_STYLES: Record<ToolAccent, { tile: string; text: string }> = {
  blue: { tile: 'bg-blue-50 text-blue-700 ring-blue-100', text: 'text-blue-700' },
  orange: { tile: 'bg-orange-50 text-orange-600 ring-orange-100', text: 'text-orange-600' },
  emerald: { tile: 'bg-emerald-50 text-emerald-700 ring-emerald-100', text: 'text-emerald-700' },
  amber: { tile: 'bg-amber-50 text-amber-700 ring-amber-100', text: 'text-amber-700' },
  sky: { tile: 'bg-sky-50 text-sky-700 ring-sky-100', text: 'text-sky-700' },
  rose: { tile: 'bg-rose-50 text-rose-700 ring-rose-100', text: 'text-rose-700' },
  teal: { tile: 'bg-teal-50 text-teal-700 ring-teal-100', text: 'text-teal-700' },
};
