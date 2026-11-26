import { Reveal } from '@/components/ui/Reveal';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { AskAnythingBox } from '@/components/home/AskAnythingBox';
import { StudyTodaySection } from '@/components/home/StudyTodaySection';
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
import type { PlatformStats, TestRow } from '@/lib/types';
import { ArrowUpRight, BookOpen, ClipboardList, GraduationCap, Radio, Sparkles, Trophy } from 'lucide-react';

const EMPTY_STATS: PlatformStats = {
  questions: 0,
  tests: 0,
  students: 0,
  notes_total: 0,
  notes_today: 0,
};

async function loadPerformance() {
  const [attempts, answers] = await Promise.all([
    fetchMyAttempts(),
    fetchMyAttemptAnswers(),
  ]);
  return { attempts, answers };
}

async function loadTestsWithTimestamp() {
  const tests = await fetchPublishedTests();
  return { tests, now: Date.now() };
}

function pickFeaturedTest(tests: TestRow[], now: number): TestRow | undefined {
  const startable = tests.filter(
    (test) => test.test_questions[0]?.count > 0 && testAvailability(test.scheduled_at, now) !== 'upcoming',
  );
  return startable.find((test) => test.kind === 'live') ?? startable[0];
}

export function DashboardPage() {
  const statsState = useAsync(fetchPlatformStats, []);
  const subjectsState = useAsync(fetchSubjects, []);
  const testsState = useAsync(loadTestsWithTimestamp, []);
  const performanceState = useAsync(loadPerformance, []);

  const featured = testsState.data ? pickFeaturedTest(testsState.data.tests, testsState.data.now) : undefined;
  const liveTests = testsState.data ? testsState.data.tests.filter((test) => test.kind === 'live') : [];
  const testsNow = testsState.data?.now ?? 0;
  const analytics = performanceState.data
    ? buildAnalytics(
        performanceState.data.attempts,
        performanceState.data.answers,
        statsState.data?.questions ?? 0,
      )
    : null;

  return (
    <div>
      <HeroSection
        stats={statsState.data ?? EMPTY_STATS}
        ctaHref={featured ? `#/test/${featured.id}/take` : '#/practice'}
      />

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-12" aria-label="AI Study Assistant">
        <Reveal>
          <AskAnythingBox />
        </Reveal>
      </section>

      <section className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.12)] sm:p-6">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-md shadow-violet-600/25">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-violet-700">New learning workspace</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">Explore AI Study Assistant</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Solve doubts, build study plans, generate quizzes and notes, and review your learning progress.
              </p>
            </div>
          </div>
          <a
            href="#/ai-study-assistant"
            className="mt-5 flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-800"
          >
            Open AI Assistant <span className="ml-2">→</span>
          </a>
        </div>
      </section>

      <StudyTodaySection />

      {statsState.loading && !statsState.data ? (
        <section className="mx-auto max-w-4xl px-4 py-12" aria-label="Loading platform stats">
          <LoadingState label="Loading platform statistics..." />
        </section>
      ) : statsState.error || !statsState.data ? (
        <section className="mx-auto max-w-3xl px-4 py-12" aria-label="Platform statistics error">
          <ErrorState
            title="We could not load Platform Statistics."
            message={statsState.error ?? 'Failed to fetch platform statistics.'}
            onRetry={statsState.reload}
          />
        </section>
      ) : (
        <TrustedByMillions stats={statsState.data} />
      )}

      <ToolsShowcase />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12" aria-labelledby="subjects-heading">
        <Reveal>
          <h2 id="subjects-heading" className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
            Explore Practice Subjects
          </h2>
        </Reveal>
        {subjectsState.loading && !subjectsState.data ? (
          <LoadingState label="Loading practice subjects..." />
        ) : subjectsState.error || !subjectsState.data ? (
          <div className="mt-5">
            <ErrorState
              title="We could not load Practice Subjects."
              message={subjectsState.error ?? 'Failed to fetch practice subjects.'}
              onRetry={subjectsState.reload}
            />
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {subjectsState.data.map((subject, index) => (
              <Reveal key={subject.id} delay={Math.min(index, 4) * 80}>
                <SubjectCard subject={subject} />
              </Reveal>
            ))}
          </div>
        )}
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
          {testsState.loading && !testsState.data ? (
            <LoadingState label="Loading live tests..." />
          ) : testsState.error || !testsState.data ? (
            <div className="mt-10">
              <ErrorState
                title="We could not load Upcoming Live Tests."
                message={testsState.error ?? 'Failed to fetch live tests.'}
                onRetry={testsState.reload}
              />
            </div>
          ) : liveTests.length === 0 ? (
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
                  <TestCard test={test} now={testsNow} />
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
        {performanceState.loading && !performanceState.data ? (
          <LoadingState label="Loading your performance analytics..." />
        ) : performanceState.error || !analytics ? (
          <div className="mt-10">
            <ErrorState
              title="We could not load Student Performance."
              message={performanceState.error ?? 'Failed to fetch student performance.'}
              onRetry={performanceState.reload}
            />
          </div>
        ) : (
          <Reveal className="mt-10">
            <PerformanceDashboard analytics={analytics} subjects={subjectsState.data ?? []} />
          </Reveal>
        )}
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
