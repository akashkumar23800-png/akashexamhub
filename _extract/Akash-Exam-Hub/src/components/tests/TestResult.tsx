import { CheckCircle2, CircleSlash, XCircle } from 'lucide-react';
import { formatPercent } from '@/lib/format';
import type { QuestionRow, SubmitResult } from '@/lib/types';

export function TestResult({
  title,
  result,
  questions,
  onRetake,
}: {
  title: string;
  result: SubmitResult;
  questions: QuestionRow[];
  onRetake: () => void;
}) {
  const percent = result.max_score > 0 ? (result.score / result.max_score) * 100 : 0;
  const answered = result.correct + result.incorrect;
  const accuracy = answered > 0 ? (result.correct / answered) * 100 : null;
  const questionById = new Map(questions.map((question) => [question.id, question]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="hero-gradient relative overflow-hidden rounded-3xl p-8 text-white shadow-xl sm:p-10">
        <p className="text-sm font-semibold text-white/85">{title} - results</p>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-6xl font-extrabold tabular-nums sm:text-7xl">
              {result.score}
              <span className="text-2xl font-bold text-white/80"> / {result.max_score}</span>
            </p>
            <p className="mt-2 text-base text-white/90">Points scored - {formatPercent(percent)} of the maximum</p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <ResultChip label="Correct" value={result.correct} />
            <ResultChip label="Incorrect" value={result.incorrect} />
            <ResultChip label="Unanswered" value={result.unanswered} />
          </div>
        </div>
        <p className="mt-6 text-sm text-white/85">
          Accuracy: <span className="font-bold text-white">{formatPercent(accuracy)}</span> - correct answers earn 4 points, wrong answers lose 1.
        </p>
      </section>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onRetake}
          className="rounded-full bg-gradient-to-r from-violet-600 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg"
        >
          Retake test
        </button>
        <a href="#/practice" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700">
          More practice tests
        </a>
        <a href="#/" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700">
          Back to dashboard
        </a>
      </div>

      <h2 className="mt-12 text-xl font-extrabold text-slate-900">Review your answers</h2>
      <ol className="mt-6 space-y-5">
        {result.review.map((item, index) => {
          const question = questionById.get(item.question_id);
          if (!question) return null;
          const status = item.is_correct === null ? 'skipped' : item.is_correct ? 'correct' : 'incorrect';
          return (
            <li key={item.question_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <StatusIcon status={status} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Question {index + 1}</p>
                  <p className="mt-1 font-semibold leading-relaxed text-slate-900">{question.question_text}</p>
                  <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 px-4 py-3">
                      <dt className="text-xs font-semibold text-slate-500">Your answer</dt>
                      <dd className="mt-0.5 font-semibold text-slate-800">
                        {item.selected_index === null ? 'Not answered' : question.options[item.selected_index]}
                      </dd>
                    </div>
                    <div className="rounded-xl bg-emerald-50 px-4 py-3">
                      <dt className="text-xs font-semibold text-emerald-700">Correct answer</dt>
                      <dd className="mt-0.5 font-semibold text-emerald-900">{question.options[item.correct_index]}</dd>
                    </div>
                  </dl>
                  {item.explanation && (
                    <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-relaxed text-blue-900">
                      {item.explanation}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function ResultChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/15 px-5 py-3 backdrop-blur">
      <p className="text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="text-xs font-semibold text-white/90">{label}</p>
    </div>
  );
}

function StatusIcon({ status }: { status: 'correct' | 'incorrect' | 'skipped' }) {
  if (status === 'correct') {
    return <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-emerald-600" aria-label="Correct" />;
  }
  if (status === 'incorrect') {
    return <XCircle className="mt-1 h-6 w-6 shrink-0 text-red-600" aria-label="Incorrect" />;
  }
  return <CircleSlash className="mt-1 h-6 w-6 shrink-0 text-slate-400" aria-label="Not answered" />;
}
