import type { SubjectProgress } from '@/lib/analytics';
import { formatCount, formatPercent } from '@/lib/format';
import { subjectTheme } from '@/lib/subjectTheme';
import type { SubjectWithMeta } from '@/lib/types';

export function SubjectProgressList({ progress, subjects }: { progress: SubjectProgress[]; subjects: SubjectWithMeta[] }) {
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));
  const rows = progress
    .map((item) => ({ ...item, subject: subjectById.get(item.subjectId) }))
    .filter((item): item is SubjectProgress & { subject: SubjectWithMeta } => Boolean(item.subject))
    .sort((a, b) => b.answered - a.answered);

  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">Answer a few questions to see subject-wise accuracy.</p>;
  }

  return (
    <ul className="space-y-5">
      {rows.map((row) => {
        const accuracy = row.answered > 0 ? (row.correct / row.answered) * 100 : 0;
        const theme = subjectTheme(row.subject.slug);
        return (
          <li key={row.subjectId}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="font-bold text-slate-800">{row.subject.name}</span>
              <span className="text-xs font-semibold text-slate-500">
                {formatCount(row.correct)}/{formatCount(row.answered)} correct - {formatPercent(accuracy)}
              </span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={Math.round(accuracy)} aria-valuemin={0} aria-valuemax={100} aria-label={`${row.subject.name} accuracy`}>
              <div
                className={`h-full origin-left rounded-full bg-gradient-to-r ${theme.gradient} animate-grow-x`}
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
