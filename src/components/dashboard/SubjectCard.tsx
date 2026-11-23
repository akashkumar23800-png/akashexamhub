import { ArrowRight, Atom, BookOpen, Calculator, Coins, Dna, FlaskConical, Globe, Hourglass, Languages, Library, Puzzle, Scale, Sigma, type LucideIcon } from 'lucide-react';
import { subjectTheme } from '@/lib/subjectTheme';
import type { SubjectWithMeta } from '@/lib/types';
import { formatCount } from '@/lib/format';

const SUBJECT_ICONS: Record<string, LucideIcon> = {
  physics: Atom,
  chemistry: FlaskConical,
  mathematics: Sigma,
  reasoning: Puzzle,
  biology: Dna,
  english: BookOpen,
  hindi: Languages,
  'social-science': Library,
  history: Hourglass,
  geography: Globe,
  economics: Coins,
  'political-science': Scale,
};

export function SubjectCard({ subject }: { subject: SubjectWithMeta }) {
  const theme = subjectTheme(subject.slug);
  const Icon = SUBJECT_ICONS[subject.slug] ?? Calculator;
  const questionCount = subject.questions[0]?.count ?? 0;
  const practiceTest = subject.tests.find((test) => test.kind === 'practice');
  const hasQuestions = questionCount > 0;

  return (
    <article
      className={`group relative flex min-h-[190px] flex-col overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-5 ${theme.gradient} ${theme.glow}`}
    >
      <a href={`#/subject/${subject.slug}`} aria-label={`Open ${subject.name} practice`} className="absolute inset-0 z-0" />
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" aria-hidden="true" />

      <div className="pointer-events-none relative flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight">{subject.name}</h3>
            <p className="mt-2 text-sm font-semibold text-white/95">
              {hasQuestions ? formatCount(questionCount) : '—'} <span className="text-xs font-normal text-white/80">Questions</span>
            </p>
          </div>
          <Icon className="h-10 w-10 shrink-0 text-white/40 sm:h-12 sm:w-12" aria-hidden="true" />
        </div>

        <div className="mt-auto pt-5">
          {practiceTest && hasQuestions ? (
            <a
              href={`#/test/${practiceTest.id}/take`}
              className="pointer-events-auto relative z-10 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow transition hover:bg-slate-50"
            >
              Start Test
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </a>
          ) : (
            <a
              href={`#/subject/${subject.slug}`}
              className="pointer-events-auto relative z-10 flex w-full items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900 shadow transition hover:bg-slate-50"
            >
              View subject
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
