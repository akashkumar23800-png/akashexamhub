import { CalendarClock, Clock, FileQuestion, Lock, Play } from 'lucide-react';
import { formatCount, formatDateTime, formatDuration, kindLabel, testAvailability } from '@/lib/format';
import type { TestRow } from '@/lib/types';

export function TestCard({ test, subjectName, now }: { test: TestRow; subjectName?: string | null; now: number }) {
  const questionCount = test.test_questions[0]?.count ?? 0;
  const availability = testAvailability(test.scheduled_at, now);
  const isLive = test.kind === 'live';
  const canStart = questionCount > 0 && availability !== 'upcoming';
  const lockedLabel =
    questionCount === 0
      ? 'Questions coming soon'
      : test.scheduled_at
        ? `Opens ${formatDateTime(test.scheduled_at)}`
        : 'Not available yet';

  return (
    <article className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-900/5">
      <div className="flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isLive ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
          }`}
        >
          {kindLabel(test.kind)}
        </span>
        {subjectName && <span className="truncate text-xs font-semibold text-slate-500">{subjectName}</span>}
      </div>

      <h3 className="mt-4 text-lg font-extrabold leading-snug text-slate-900">{test.title}</h3>
      {test.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{test.description}</p>}

      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        <li className="flex items-center gap-2">
          <FileQuestion className="h-4 w-4 text-violet-600" aria-hidden="true" />
          {questionCount > 0 ? `${formatCount(questionCount)} questions` : 'Questions being added'}
        </li>
        <li className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-violet-600" aria-hidden="true" />
          {formatDuration(test.duration_minutes)}
        </li>
        <li className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-violet-600" aria-hidden="true" />
          {test.scheduled_at ? formatDateTime(test.scheduled_at) : 'Date to be announced'}
        </li>
      </ul>

      <div className="mt-auto flex flex-col gap-2 pt-6 sm:flex-row">
        {canStart ? (
          <a
            href={`#/test/${test.id}/take`}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg"
          >
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
            Start Test
          </a>
        ) : (
          <span
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-bold text-slate-500"
            aria-disabled="true"
          >
            <Lock className="h-4 w-4" aria-hidden="true" />
            {lockedLabel}
          </span>
        )}
        <a
          href={`#/test/${test.id}`}
          className="flex items-center justify-center rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700"
        >
          View Details
        </a>
      </div>
    </article>
  );
}
