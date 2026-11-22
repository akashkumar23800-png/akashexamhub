import { useEffect } from 'react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { DashboardPage } from '@/pages/DashboardPage';
import { PracticeTestsPage } from '@/pages/PracticeTestsPage';
import { SubjectPage } from '@/pages/SubjectPage';
import { TestOverviewPage } from '@/pages/TestOverviewPage';
import { TakeTestPage } from '@/pages/TakeTestPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { StudyMaterialPage } from '@/pages/StudyMaterialPage';
import { PricingPage } from '@/pages/PricingPage';
import { ToolPage } from '@/pages/ToolPage';
import { AIStudyAssistantPage } from '@/pages/AIStudyAssistantPage';
import { useRoute } from '@/hooks/useRoute';
import type { Route } from '@/lib/routes';

export function AppShell() {
  const route = useRoute();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [route]);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader route={route} />
      <main>{renderPage(route)}</main>
      <SiteFooter />
    </div>
  );
}

function renderPage(route: Route) {
  switch (route.name) {
    case 'practice':
      return <PracticeTestsPage />;
    case 'subject':
      return <SubjectPage slug={route.slug} />;
    case 'test-overview':
      return <TestOverviewPage testId={route.testId} />;
    case 'test-take':
      return <TakeTestPage testId={route.testId} />;
    case 'leaderboard':
      return <LeaderboardPage />;
    case 'study-material':
      return <StudyMaterialPage />;
    case 'ai-assistant':
      return <AIStudyAssistantPage />;
    case 'pricing':
      return <PricingPage />;
    case 'tool':
      return <ToolPage slug={route.slug} />;
    default:
      return <DashboardPage />;
  }
}
