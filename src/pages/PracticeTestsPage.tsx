import { Reveal } from '@/components/ui/Reveal';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ErrorState, LoadingState } from '@/components/ui/StatusStates';
import { SubjectCard } from '@/components/dashboard/SubjectCard';
import { TestGrid } from '@/components/tests/TestGrid';
import { useAsync } from '@/hooks/useAsync';
import { fetchPublishedTests, fetchSubjects } from '@/lib/api';

async function loadPractice() {
  const [subjects, tests] = await Promise.all([fetchSubjects(), fetchPublishedTests()]);
  return { subjects, tests, now: Date.now() };
}

export function PracticeTestsPage() {
  const { data, error, loading, reload } = useAsync(loadPractice, []);

  if (loading && !data) return <LoadingState label="Loading practice tests..." />;

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={error ?? 'Please try again.'} onRetry={reload} />
      </div>
    );
  }

  const subjectNames = new Map(data.subjects.map((subject) => [subject.id, subject.name]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <SectionHeading
        eyebrow="Practice"
        title="Practice Tests"
        description="Pick a subject to practise by chapter or open any published test below."
      />

      <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Subjects">
        {data.subjects.map((subject, index) => (
          <Reveal key={subject.id} delay={Math.min(index, 4) * 60}>
            <SubjectCard subject={subject} />
          </Reveal>
        ))}
      </section>

      <section className="mt-16" aria-labelledby="all-tests-heading">
        <h2 id="all-tests-heading" className="text-xl font-extrabold text-slate-900">All published tests</h2>
        <TestGrid tests={data.tests} subjectNames={subjectNames} now={data.now} />
      </section>
    </div>
  );
}
