import { useState } from 'react';
import { FileQuestion, Lock } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState, LoadingState } from '@/components/ui/StatusStates';
import { TestResult } from '@/components/tests/TestResult';
import { TestRunner } from '@/components/tests/TestRunner';
import { useAsync } from '@/hooks/useAsync';
import { fetchTestDetail, fetchTestQuestions } from '@/lib/api';
import { formatDateTime, testAvailability } from '@/lib/format';
import type { QuestionRow, SubmitResult } from '@/lib/types';

async function loadTakeTest(testId: string) {
  const [detail, rows] = await Promise.all([fetchTestDetail(testId), fetchTestQuestions(testId)]);
  if (!detail) throw new Error('This test could not be found. It may have been unpublished.');
  const questions: QuestionRow[] = rows.flatMap((row) => (row.question ? [row.question] : []));
  return { detail, questions, now: Date.now() };
}

export function TakeTestPage({ testId }: { testId: string }) {
  const { data, error, loading, reload } = useAsync(() => loadTakeTest(testId), [testId]);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [runKey, setRunKey] = useState(0);

  if (loading && !data) return <LoadingState label="Preparing your test..." />;

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={error ?? 'Please try again.'} onRetry={reload} />
      </div>
    );
  }

  const { detail, questions, now } = data;
  const opensAt = detail.scheduled_at;

  if (opensAt && testAvailability(opensAt, now) === 'upcoming') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={Lock}
          title={`${detail.title} opens soon`}
          description={`This live test starts on ${formatDateTime(opensAt)}. Come back then to begin.`}
          action={
            <a href={`#/test/${testId}`} className="mt-2 text-sm font-bold text-violet-700 hover:text-orange-600">
              View test details
            </a>
          }
        />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={FileQuestion}
          title="Questions are being added"
          description="This test does not have any questions yet. Please check back later."
          action={
            <a href="#/practice" className="mt-2 text-sm font-bold text-violet-700 hover:text-orange-600">
              Browse other tests
            </a>
          }
        />
      </div>
    );
  }

  if (result) {
    return (
      <TestResult
        title={detail.title}
        result={result}
        questions={questions}
        onRetake={() => {
          setResult(null);
          setRunKey((value) => value + 1);
        }}
      />
    );
  }

  return (
    <TestRunner
      key={runKey}
      testId={testId}
      title={detail.title}
      durationMinutes={detail.duration_minutes}
      questions={questions}
      onSubmitted={setResult}
    />
  );
}
