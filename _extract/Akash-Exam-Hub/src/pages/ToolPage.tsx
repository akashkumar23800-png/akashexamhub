import type { ComponentType } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { CitationTool } from '@/components/tools/CitationTool';
import { DetectAiTool } from '@/components/tools/DetectAiTool';
import { DraftNoteTool } from '@/components/tools/DraftNoteTool';
import { ImageCompressTool } from '@/components/tools/ImageCompressTool';
import { ImageConvertTool } from '@/components/tools/ImageConvertTool';
import { ImageEditTool } from '@/components/tools/ImageEditTool';
import { NoteTakingTool } from '@/components/tools/NoteTakingTool';
import { RewriteTextTool } from '@/components/tools/RewriteTextTool';
import { TextToAudioTool } from '@/components/tools/TextToAudioTool';
import { UnavailableNotice } from '@/components/tools/UnavailableNotice';
import { WordCountTool } from '@/components/tools/WordCountTool';
import { EmptyState } from '@/components/ui/EmptyState';
import { ACCENT_STYLES, findTool } from '@/lib/tools';

const PANELS: Record<string, ComponentType> = {
  'convert-files': ImageConvertTool,
  'compress-files': ImageCompressTool,
  'edit-pdfs-images': ImageEditTool,
  'rewrite-text': RewriteTextTool,
  'text-to-audio': TextToAudioTool,
  'draft-notes': DraftNoteTool,
  'detect-ai': DetectAiTool,
  'word-count': WordCountTool,
  'citation-generator': CitationTool,
  'note-taking': NoteTakingTool,
};

export function ToolPage({ slug }: { slug: string }) {
  const tool = findTool(slug);

  if (!tool) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={Search}
          title="Tool not found"
          description="This tool does not exist. Choose one from the tools on the homepage."
          action={
            <a href="#/" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700">
              Back to home
            </a>
          }
        />
      </div>
    );
  }

  const Icon = tool.icon;
  const accent = ACCENT_STYLES[tool.accent];
  const Panel = PANELS[tool.slug];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
      <a href="#/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All tools
      </a>

      <header className="mt-6 flex items-start gap-4">
        <span className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ring-1 ${accent.tile}`}>
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{tool.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{tool.description}</p>
        </div>
      </header>

      <section className="mt-8 rounded-3xl bg-white p-5 shadow-[0_10px_30px_-12px_rgba(15,23,42,0.18)] ring-1 ring-slate-100 sm:p-8">
        {tool.unavailableReason ? (
          <UnavailableNotice reason={tool.unavailableReason} />
        ) : Panel ? (
          <Panel />
        ) : (
          <UnavailableNotice reason="This tool is not available yet." />
        )}
      </section>
    </div>
  );
}
