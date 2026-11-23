import { ArrowDown, FileText, Image, Lightbulb, Mic2, Pencil, Plus, Search, Sparkles, Volume2 } from 'lucide-react';
import type { ToolDefinition } from '@/lib/tools';

const ICON_COLORS: Record<ToolDefinition['accent'], string> = {
  blue: 'text-blue-600',
  orange: 'text-orange-500',
  emerald: 'text-emerald-600',
  amber: 'text-amber-500',
  sky: 'text-sky-600',
  rose: 'text-rose-500',
  teal: 'text-teal-600',
};

export function ToolIllustration({ tool }: { tool: ToolDefinition }) {
  const Icon = tool.icon;
  const iconColor = ICON_COLORS[tool.accent];

  return (
    <div className="relative flex h-[92px] w-full items-center justify-center overflow-hidden rounded-xl bg-[#f8f8f5] sm:h-[118px]">
      <span className="absolute left-4 top-4 h-2 w-2 rounded-full bg-amber-300" />
      <span className="absolute bottom-4 right-5 h-2 w-2 rounded-full bg-emerald-300" />
      <div className="relative flex items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-800 bg-white text-slate-800 shadow-[2px_3px_0_#d9d9d3] transition duration-300 group-hover:-rotate-3 group-hover:shadow-[4px_5px_0_#d9d9d3] sm:h-16 sm:w-16">
          <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${iconColor}`} strokeWidth={1.7} aria-hidden="true" />
        </span>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-slate-700 bg-white shadow-[2px_2px_0_#d9d9d3] sm:h-11 sm:w-11">
          {tool.slug === 'text-to-audio' ? (
            <Volume2 className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" aria-hidden="true" />
          ) : tool.slug === 'detect-ai' ? (
            <Search className="h-5 w-5 text-lime-600 sm:h-6 sm:w-6" aria-hidden="true" />
          ) : tool.slug === 'draft-notes' || tool.slug === 'note-taking' ? (
            <Plus className="h-5 w-5 text-emerald-600 sm:h-6 sm:w-6" aria-hidden="true" />
          ) : (
            <FileText className="h-5 w-5 text-slate-700 sm:h-6 sm:w-6" aria-hidden="true" />
          )}
        </span>
        <span className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-full bg-white p-1 shadow-sm">
          {tool.slug === 'transcribe-files' ? <Mic2 className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" /> : tool.slug === 'rewrite-text' ? <Pencil className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" /> : tool.slug === 'diagrams-ai' ? <Sparkles className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" /> : tool.slug === 'convert-files' || tool.slug === 'compress-files' ? <ArrowDown className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" /> : tool.slug === 'edit-pdfs-images' ? <Lightbulb className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" /> : <Image className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />}
        </span>
      </div>
    </div>
  );
}
