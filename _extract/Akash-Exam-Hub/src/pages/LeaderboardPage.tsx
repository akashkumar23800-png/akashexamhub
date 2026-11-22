import { useState } from 'react';
import { Crown, Medal, Trophy } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ErrorState, LoadingState } from '@/components/ui/StatusStates';
import { useAsync } from '@/hooks/useAsync';
import { useAuth } from '@/hooks/useAuth';
import { fetchLeaderboard } from '@/lib/api';
import { formatCount } from '@/lib/format';
import type { LeaderboardPeriod } from '@/lib/types';

const PERIODS: { value: LeaderboardPeriod; label: string; hint: string }[] = [
  { value: 'week', label: 'This week', hint: 'Points from tests taken since Monday' },
  { value: 'month', label: 'This month', hint: 'Points from tests taken this calendar month' },
];

const PODIUM_STYLES = [
  'from-amber-300 to-amber-500',
  'from-slate-300 to-slate-400',
  'from-orange-300 to-orange-500',
];

export function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('week');
  const { user } = useAuth();
  const { data, error, loading, reload } = useAsync(() => fetchLeaderboard(period), [period]);
  const activePeriod = PERIODS.find((item) => item.value === period) ?? PERIODS[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <SectionHeading
        eyebrow="Rankings"
        title="Leaderboard"
        description={`${activePeriod.hint}. A test scores +4 per correct answer and -1 per wrong answer.`}
      />

      <div className="mt-8 inline-flex rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200" role="tablist" aria-label="Leaderboard period">
        {PERIODS.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={period === item.value}
            onClick={() => setPeriod(item.value)}
            className={`rounded-full px-5 py-2 text-sm font-bold transition ${
              period === item.value
                ? 'bg-gradient-to-r from-violet-600 to-orange-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {loading && !data && <LoadingState label="Loading rankings..." />}
        {error && !loading && <ErrorState message={error} onRetry={reload} />}
        {data && data.length === 0 && (
          <EmptyState
            icon={Trophy}
            title="No rankings for this period yet"
            description="Complete a practice test to appear on the leaderboard."
            action={
              <a href="#/practice" className="mt-2 text-sm font-bold text-violet-700 hover:text-orange-600">
                Start a test
              </a>
            }
          />
        )}
        {data && data.length > 0 && (
          <div className="space-y-6">
            <ol className="grid gap-4 sm:grid-cols-3">
              {data.slice(0, 3).map((row) => {
                const isMe = row.user_id === user?.id;
                return (
                  <li
                    key={row.user_id}
                    className={`relative overflow-hidden rounded-3xl border bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                      isMe ? 'border-violet-300 ring-2 ring-violet-200' : 'border-slate-200'
                    } ${row.place === 1 ? 'sm:-mt-4' : ''}`}
                  >
                    <span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-sm font-extrabold text-white ${PODIUM_STYLES[row.place - 1]}`}>
                      {row.place === 1 ? <Crown className="h-4 w-4" aria-hidden="true" /> : row.place}
                    </span>
                    <div className="mt-4 flex justify-center">
                      <Avatar name={row.full_name} size="lg" />
                    </div>
                    <p className="mt-3 truncate font-bold text-slate-900">
                      {row.full_name}
                      {isMe && <span className="ml-1 text-xs text-violet-600">(You)</span>}
                    </p>
                    <p className="mt-1 text-2xl font-extrabold tabular-nums text-slate-900">{formatCount(row.points)}</p>
                    <p className="text-xs font-semibold text-slate-500">
                      points - {formatCount(row.tests_completed)} {row.tests_completed === 1 ? 'test' : 'tests'}
                    </p>
                  </li>
                );
              })}
            </ol>

            {data.length > 3 && (
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <tr>
                      <th scope="col" className="px-6 py-4">Rank</th>
                      <th scope="col" className="px-6 py-4">Student</th>
                      <th scope="col" className="px-6 py-4 text-right">Points</th>
                      <th scope="col" className="hidden px-6 py-4 text-right sm:table-cell">Tests completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.slice(3).map((row) => {
                      const isMe = row.user_id === user?.id;
                      return (
                        <tr key={row.user_id} className={`transition hover:bg-violet-50/60 ${isMe ? 'bg-violet-50' : ''}`}>
                          <td className="px-6 py-4 font-bold text-slate-700">
                            <span className="inline-flex items-center gap-2">
                              <Medal className="h-4 w-4 text-slate-300" aria-hidden="true" />
                              {row.place}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={row.full_name} size="sm" />
                              <span className="font-semibold text-slate-900">
                                {row.full_name}
                                {isMe && <span className="ml-1 text-xs text-violet-600">(You)</span>}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-bold tabular-nums text-slate-900">{formatCount(row.points)}</td>
                          <td className="hidden px-6 py-4 text-right tabular-nums text-slate-600 sm:table-cell">{formatCount(row.tests_completed)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
