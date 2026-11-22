import { BookOpen, ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState, LoadingState } from '@/components/ui/StatusStates';
import { TestGrid } from '@/components/tests/TestGrid';
import { useAsync } from '@/hooks/useAsync';
import { fetchPublishedTests, fetchSubjects } from '@/lib/api';

async function loadSubjectPage(slug: string) {
  const [subjects, tests] = await Promise.all([fetchSubjects(), fetchPublishedTests()]);
  const subject = subjects.find((item) => item.slug === slug);
  if (!subject) throw new Error('This subject could not be found.');
  return {
    subject,
    tests: tests.filter((test) => test.subject_id === subject.id),
    now: Date.now(),
  };
}

export function SubjectPage({ slug }: { slug: string }) {
  const { data, error, loading, reload } = useAsync(() => loadSubjectPage(slug), [slug]);

  if (loading && !data) return <LoadingState label="Loading subject..." />;

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={error ?? 'Please try again.'} onRetry={reload} />
      </div>
    );
  }

  const { subject, tests, now } = data;
  const questionCount = subject.questions[0]?.count ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <a href="#/practice" className="text-sm font-semibold text-slate-600 transition hover:text-violet-700">
        Back to practice tests
      </a>
      <section className="hero-gradient mt-6 overflow-hidden rounded-3xl p-8 text-white shadow-xl sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Subject</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">{subject.name}</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90">
          {subject.description ?? 'Practise questions and tests for this subject.'}
        </p>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          {questionCount > 0 ? `${questionCount} questions in the bank` : 'Questions are being added'}
        </p>
      </section>

      <section className="mt-12" aria-labelledby="subject-tests-heading">
        <h2 id="subject-tests-heading" className="text-xl font-extrabold text-slate-900">Tests for {subject.name}</h2>
        {tests.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              icon={ClipboardList}
              title="No tests are published for this subject yet"
              description="Check back soon, or explore tests from other subjects."
              action={
                <a href="#/practice" className="mt-2 text-sm font-bold text-violet-700 hover:text-orange-600">
                  Browse all practice tests
                </a>
              }
            />
          </div>
        ) : (
          <TestGrid tests={tests} subjectNames={new Map([[subject.id, subject.name]])} now={now} />
        )}
      </section>
    </div>
  );
}
