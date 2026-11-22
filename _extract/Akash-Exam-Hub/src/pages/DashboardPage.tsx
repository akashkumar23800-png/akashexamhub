import { Reveal } from '@/components/ui/Reveal';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { AskAnythingBox } from '@/components/home/AskAnythingBox';
import { TrustedByMillions } from '@/components/home/TrustedByMillions';
import { ToolsShowcase } from '@/components/home/ToolsShowcase';
import { SubjectCard } from '@/components/dashboard/SubjectCard';
import { PerformanceDashboard } from '@/components/dashboard/PerformanceDashboard';
import { TestCard } from '@/components/tests/TestCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ErrorState, LoadingState } from '@/components/ui/StatusStates';
import { buildAnalytics } from '@/lib/analytics';
import {
  fetchMyAttemptAnswers,
  fetchMyAttempts,
  fetchPlatformStats,
  fetchPublishedTests,
  fetchSubjects,
} from '@/lib/api';
import { testAvailability } from '@/lib/format';
import { useAsync } from '@/hooks/useAsync';
import type { TestRow } from '@/lib/types';
import { ArrowUpRight, BookOpen, ClipboardList, GraduationCap, Radio, Sparkles, Trophy } from 'lucide-react';

async function loadDashboard() {
  const [subjects, tests, stats, attempts, answers] = await Promise.all([
    fetchSubjects(),
    fetchPublishedTests(),
    fetchPlatformStats(),
    fetchMyAttempts(),
    fetchMyAttemptAnswers(),
  ]);
  return { subjects, tests, stats, attempts, answers, now: Date.now() };
}

function pickFeaturedTest(tests: TestRow[], now: number): TestRow | undefined {
  const startable = tests.filter(
    (test) => test.test_questions[0]?.count > 0 && testAvailability(test.scheduled_at, now) !== 'upcoming',
  );
  return startable.find((test) => test.kind === 'live') ?? startable[0];
}

export function DashboardPage() {
  const { data, error, loading, reload } = useAsync(loadDashboard, []);

  if (loading && !data) {
    return <LoadingState label="Loading your dashboard..." />;
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState message={error ?? 'Please try again.'} onRetry={reload} />
      </div>
    );
  }

  const featured = pickFeaturedTest(data.tests, data.now);
  const liveTests = data.tests.filter((test) => test.kind === 'live');
  const analytics = buildAnalytics(data.attempts, data.answers, data.stats.questions);

  return (
    <div>
      <HeroSection stats={data.stats} ctaHref={featured ? `#/test/${featured.id}/take` : '#/practice'} />

      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8 lg:pt-16" aria-label="AI Study Assistant">
        <Reveal>
          <AskAnythingBox />
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        <a href="#/ai-study-assistant" className="group flex flex-col gap-4 rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-blue-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-700 text-white"><Sparkles className="h-6 w-6" /></span>
            <div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-violet-700">New learning workspace</p><h2 className="mt-1 text-xl font-black text-slate-900">Explore AI Study Assistant</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Solve doubts, build study plans, generate quizzes and notes, and review your learning progress.</p></div>
          </div>
          <span className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition group-hover:bg-violet-800">Open AI Assistant <span className="ml-2">→</span></span>
        </a>
      </section>

      <TrustedByMillions stats={data.stats} />

      <ToolsShowcase />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12" aria-labelledby="subjects-heading">
        <Reveal>
          <h2 id="subjects-heading" className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Explore Practice Subjects
          </h2>
        </Reveal>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {data.subjects.map((subject, index) => (
            <Reveal key={subject.id} delay={Math.min(index, 4) * 80}>
              <SubjectCard subject={subject} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-white py-16 lg:py-20" aria-labelledby="live-tests-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Live and mock exams"
              title="Upcoming Live Tests"
              description="Tests with a scheduled date open at that time. Tests without a date can be started at any time."
              action={
                <a href="#/practice" className="text-sm font-bold text-violet-700 transition hover:text-orange-600">
                  View all tests
                </a>
              }
            />
          </Reveal>
          {liveTests.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                icon={Radio}
                title="No live tests are published yet"
                description="Live and mock tests will appear here as soon as the Akash Exam Hub team publishes them."
              />
            </div>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {liveTests.map((test, index) => (
                <Reveal key={test.id} delay={Math.min(index, 3) * 90}>
                  <TestCard test={test} now={data.now} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20" aria-labelledby="performance-heading">
        <Reveal>
          <SectionHeading
            eyebrow="Your progress"
            title="Student Performance"
            description="Every number here is calculated from the tests you have submitted."
          />
        </Reveal>
        <Reveal className="mt-10">
          <PerformanceDashboard analytics={analytics} subjects={data.subjects} />
        </Reveal>
      </section>

      <section className="border-t border-slate-200 bg-slate-100/80 px-4 py-14 sm:px-6 lg:px-8 lg:py-16" aria-labelledby="original-hub-heading">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-violet-700">The original Akash Exam Hub</p>
                <h2 id="original-hub-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                  Your familiar study space is still here.
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Continue with the original class-wise learning, practice, AI help and student community features.
                </p>
              </div>
              <a href="#/study-material" className="inline-flex items-center gap-2 text-sm font-bold text-violet-700 transition hover:text-orange-600">
                Open study material <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
          </Reveal>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Classes 6–12', description: 'Open class-wise chapters and study material in Hindi or English medium.', href: '#/study-material', Icon: GraduationCap, tone: 'from-violet-600 to-indigo-600' },
              { title: 'Notes & Learning', description: 'Continue reading available notes and subject learning resources.', href: '#/study-material', Icon: BookOpen, tone: 'from-blue-600 to-cyan-600' },
              { title: 'MCQs & Mock Tests', description: 'Practice questions, take tests and review your results.', href: '#/practice', Icon: ClipboardList, tone: 'from-emerald-600 to-teal-600' },
              { title: 'AI Help & Leaderboard', description: 'Get study assistance and explore the student leaderboard.', href: '#/ai-study-assistant', Icon: Trophy, tone: 'from-orange-500 to-rose-500' },
            ].map(({ title, description, href, Icon, tone }) => (
              <a key={title} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-md`}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 flex items-center justify-between text-base font-extrabold text-slate-900">
                  {title}
                  <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet-700" />
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
