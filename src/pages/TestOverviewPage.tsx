import { ArrowLeft, CalendarClock, Clock, FileQuestion, Lock, ShieldCheck, type LucideIcon } from 'lucide-react';
import { ErrorState, LoadingState } from '@/components/ui/StatusStates';
import { useAsync } from '@/hooks/useAsync';
import { fetchTestDetail } from '@/lib/api';
import { formatDateTime, testAvailability } from '@/lib/format';

async function loadTestDetail(testId: string) {
  const detail = await fetchTestDetail(testId);
  if (!detail) throw new Error('This test could not be found. It may have been unpublished.');
  return { detail, now: Date.now() };
}

export function TestOverviewPage({ testId }: { testId: string }) {
  const { data, error, loading, reload } = useAsync(() => loadTestDetail(testId), [testId]);

  if (loading && !data) return <LoadingState label="Loading test details..." />;

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={error ?? 'Please try again.'} onRetry={reload} />
      </div>
    );
  }

  const { detail, now } = data;
  const questionCount = detail.test_questions[0]?.count ?? 0;
  const availability = testAvailability(detail.scheduled_at, now);
  const canStart = questionCount > 0 && availability !== 'upcoming';
  const isLive = detail.kind === 'live';

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <a href="#/practice" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-violet-700">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All practice tests
      </a>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <section className="animate-slide-up rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${isLive ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
              {isLive ? 'Live test' : 'Practice test'}
            </span>
            {detail.subject && <span className="text-xs font-semibold text-slate-500">{detail.subject.name}</span>}
          </div>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">{detail.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            {detail.description ?? 'Answer each question within the time limit and review your answers when you finish.'}
          </p>

          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-violet-600" aria-hidden="true" />
              How scoring works
            </p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              <li>Correct answer: +4 points</li>
              <li>Wrong answer: -1 point</li>
              <li>Unanswered: 0 points</li>
            </ul>
          </div>
        </section>

        <aside className="animate-slide-up rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:sticky lg:top-28 lg:self-start" style={{ animationDelay: '100ms' }}>
          <ul className="space-y-5">
            <DetailRow icon={FileQuestion} label="Questions" value={questionCount > 0 ? `${questionCount}` : 'Being added'} />
            <DetailRow icon={Clock} label="Time limit" value={`${detail.duration_minutes} minutes`} />
            <DetailRow
              icon={CalendarClock}
              label="Schedule"
              value={detail.scheduled_at ? formatDateTime(detail.scheduled_at) : 'Date to be announced'}
            />
          </ul>

          <div className="mt-8">
            {canStart ? (
              <a
                href={`#/test/${testId}/take`}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-orange-500 px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-violet-600/25 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Start Test
              </a>
            ) : (
              <p className="flex items-center justify-center gap-2 rounded-full bg-slate-100 px-6 py-3.5 text-sm font-bold text-slate-500">
                <Lock className="h-4 w-4" aria-hidden="true" />
                {questionCount === 0 ? 'Questions coming soon' : 'Not open yet'}
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <li className="flex items-start gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-0.5 font-bold text-slate-900">{value}</p>
      </div>
    </li>
  );
}
