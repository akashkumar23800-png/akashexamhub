import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, Send, TriangleAlert } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { submitTestAttempt } from '@/lib/api';
import type { QuestionRow, SubmitResult } from '@/lib/types';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function TestRunner({
  testId,
  title,
  durationMinutes,
  questions,
  onSubmitted,
}: {
  testId: string;
  title: string;
  durationMinutes: number;
  questions: QuestionRow[];
  onSubmitted: (result: SubmitResult) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const current = questions[index];
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = questions.length - answeredCount;
  const progressPercent = questions.length > 0 ? ((index + 1) / questions.length) * 100 : 0;
  const isLowTime = secondsLeft <= 60;

  useEffect(() => {
    const id = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(id);
  }, []);

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setConfirmOpen(false);
    try {
      const result = await submitTestAttempt(
        testId,
        questions.map((question) => ({
          question_id: question.id,
          selected_index: answers[question.id] ?? null,
        })),
      );
      onSubmitted(result);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'We could not submit your test. Please try again.');
      setSubmitting(false);
    }
  };

  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });

  useEffect(() => {
    if (secondsLeft === 0) void submitRef.current();
  }, [secondsLeft]);

  const selectOption = (questionId: string, optionIndex: number) => {
    setAnswers((previous) => ({ ...previous, [questionId]: optionIndex }));
  };

  const clearOption = (questionId: string) => {
    setAnswers((previous) => {
      const next = { ...previous };
      delete next[questionId];
      return next;
    });
  };

  if (!current) return null;
  const selected = answers[current.id];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="sticky top-16 z-30 -mx-4 mb-6 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{title}</p>
            <p className="text-xs font-semibold text-slate-500">
              Question {index + 1} of {questions.length} - {answeredCount} answered
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-extrabold tabular-nums ${
                isLowTime ? 'animate-pulse bg-red-600 text-white' : 'bg-slate-900 text-white'
              }`}
              aria-live="off"
              aria-label={`Time left ${formatClock(secondsLeft)}`}
            >
              <Clock className="h-4 w-4" aria-hidden="true" />
              {formatClock(secondsLeft)}
            </span>
            <button
              type="button"
              onClick={() => (unansweredCount > 0 ? setConfirmOpen(true) : void submit())}
              disabled={submitting}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-orange-500 px-5 py-2 text-sm font-bold text-white shadow-md transition hover:shadow-lg disabled:opacity-60"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {submitting ? 'Submitting...' : 'Submit test'}
            </button>
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-orange-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {submitError && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800" role="alert">
          <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          <p>Your answers were not submitted: {submitError} Your selections are still here, so you can try again.</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-live="polite">
          {current.chapter && <p className="text-xs font-bold uppercase tracking-wider text-violet-600">{current.chapter}</p>}
          <h2 className="mt-3 text-xl font-bold leading-relaxed text-slate-900 sm:text-2xl">{current.question_text}</h2>

          <div className="mt-8 grid gap-3">
            {current.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex;
              return (
                <button
                  key={optionIndex}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => selectOption(current.id, optionIndex)}
                  className={`group flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left text-sm font-semibold transition duration-200 sm:text-base ${
                    isSelected
                      ? 'border-violet-600 bg-violet-50 text-violet-900 shadow-md shadow-violet-600/10'
                      : 'border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-sm'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold transition ${
                      isSelected ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-violet-100'
                    }`}
                  >
                    {OPTION_LABELS[optionIndex]}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
              disabled={index === 0}
              className="flex items-center gap-2 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>
            {selected !== undefined && (
              <button
                type="button"
                onClick={() => clearOption(current.id)}
                className="text-sm font-semibold text-slate-500 underline-offset-4 transition hover:text-slate-800 hover:underline"
              >
                Clear answer
              </button>
            )}
            <button
              type="button"
              onClick={() => setIndex((value) => Math.min(questions.length - 1, value + 1))}
              disabled={index === questions.length - 1}
              className="flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </section>

        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:self-start">
          <p className="text-sm font-bold text-slate-900">Question palette</p>
          <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-5">
            {questions.map((question, questionIndex) => {
              const isCurrent = questionIndex === index;
              const isAnswered = answers[question.id] !== undefined;
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setIndex(questionIndex)}
                  aria-label={`Question ${questionIndex + 1}${isAnswered ? ', answered' : ', not answered'}`}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`h-9 rounded-lg text-xs font-bold transition ${
                    isCurrent
                      ? 'bg-violet-600 text-white ring-2 ring-violet-300 ring-offset-1'
                      : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {questionIndex + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-5 space-y-2 text-xs font-semibold text-slate-600">
            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-emerald-200" aria-hidden="true" /> Answered ({answeredCount})
            </p>
            <p className="flex items-center gap-2">
              <span className="h-3 w-3 rounded bg-slate-200" aria-hidden="true" /> Not answered ({unansweredCount})
            </p>
          </div>
        </aside>
      </div>

      {confirmOpen && (
        <Modal title="Submit your test?" onClose={() => setConfirmOpen(false)}>
          <p className="text-sm leading-relaxed text-slate-700">
            You have <span className="font-bold">{unansweredCount}</span> unanswered{' '}
            {unansweredCount === 1 ? 'question' : 'questions'}. Unanswered questions score zero. Once submitted, you cannot change your answers.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Keep working
            </button>
            <button
              type="button"
              onClick={() => void submit()}
              className="rounded-full bg-gradient-to-r from-violet-600 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-lg"
            >
              Submit now
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
