import { TestCard } from '@/components/tests/TestCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Reveal } from '@/components/ui/Reveal';
import { ClipboardList } from 'lucide-react';
import type { TestRow } from '@/lib/types';

export function TestGrid({ tests, subjectNames, now }: { tests: TestRow[]; subjectNames: Map<string, string>; now: number }) {
  if (tests.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState icon={ClipboardList} title="No published tests yet" description="New tests will appear here once they are published." />
      </div>
    );
  }
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {tests.map((test, index) => (
        <Reveal key={test.id} delay={Math.min(index, 3) * 80}>
          <TestCard test={test} subjectName={test.subject_id ? subjectNames.get(test.subject_id) : null} now={now} />
        </Reveal>
      ))}
    </div>
  );
}
