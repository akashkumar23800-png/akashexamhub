import type { ReactNode } from 'react';
import { BarChart3, CheckCircle2, ClipboardCheck, Target, TrendingUp, XCircle, type LucideIcon } from 'lucide-react';
import { ScoreTrendChart } from '@/components/dashboard/ScoreTrendChart';
import { SubjectProgressList } from '@/components/dashboard/SubjectProgressList';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatPercent } from '@/lib/format';
import type { AnalyticsSummary } from '@/lib/analytics';
import type { SubjectWithMeta } from '@/lib/types';

interface StatTile {
  label: string;
  icon: LucideIcon;
  tone: string;
  hint: string;
  render: () => ReactNode;
}

export function PerformanceDashboard({ analytics, subjects }: { analytics: AnalyticsSummary; subjects: SubjectWithMeta[] }) {
  if (analytics.testsAttempted === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Your analytics will appear here"
        description="Complete a practice test and your scores, accuracy and progress will be calculated from your real attempts."
        action={
          <a
            href="#/practice"
            className="mt-2 rounded-full bg-gradient-to-r from-violet-600 to-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg"
          >
            Browse practice tests
          </a>
        }
      />
    );
  }

  const tiles: StatTile[] = [
    {
      label: 'Tests Attempted',
      icon: ClipboardCheck,
      tone: 'bg-violet-100 text-violet-700',
      hint: 'Completed submissions',
      render: () => <AnimatedNumber value={analytics.testsAttempted} />,
    },
    {
      label: 'Average Score',
      icon: TrendingUp,
      tone: 'bg-blue-100 text-blue-700',
      hint: 'Across all attempts',
      render: () => <>{formatPercent(analytics.averageScorePercent)}</>,
    },
    {
      label: 'Accuracy',
      icon: Target,
      tone: 'bg-emerald-100 text-emerald-700',
      hint: 'Correct out of answered',
      render: () => <>{formatPercent(analytics.accuracyPercent)}</>,
    },
    {
      label: 'Correct Answers',
      icon: CheckCircle2,
      tone: 'bg-green-100 text-green-700',
      hint: 'Total correct responses',
      render: () => <AnimatedNumber value={analytics.correctAnswers} />,
    },
    {
      label: 'Incorrect Answers',
      icon: XCircle,
      tone: 'bg-red-100 text-red-700',
      hint: 'Total wrong responses',
      render: () => <AnimatedNumber value={analytics.incorrectAnswers} />,
    },
    {
      label: 'Learning Progress',
      icon: BarChart3,
      tone: 'bg-orange-100 text-orange-700',
      hint: 'Questions attempted in the bank',
      render: () => <>{formatPercent(analytics.learningProgressPercent)}</>,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tile.tone}`}>
              <tile.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-4 text-2xl font-extrabold tabular-nums text-slate-900 sm:text-3xl">{tile.render()}</p>
            <p className="mt-1 text-sm font-bold text-slate-800">{tile.label}</p>
            <p className="mt-0.5 text-xs text-slate-500">{tile.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h3 className="text-base font-bold text-slate-900">Score trend</h3>
          <p className="mt-1 text-sm text-slate-500">Your percentage in your most recent attempts.</p>
          <div className="mt-6">
            <ScoreTrendChart points={analytics.trend} />
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h3 className="text-base font-bold text-slate-900">Subject accuracy</h3>
          <p className="mt-1 text-sm text-slate-500">How often you answer correctly in each subject.</p>
          <div className="mt-6">
            <SubjectProgressList progress={analytics.subjects} subjects={subjects} />
          </div>
        </div>
      </div>
    </div>
  );
}
