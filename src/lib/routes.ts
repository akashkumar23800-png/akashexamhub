export type Route =
  | { name: 'dashboard' }
  | { name: 'practice' }
  | { name: 'subject'; slug: string }
  | { name: 'test-overview'; testId: string }
  | { name: 'test-take'; testId: string }
  | { name: 'leaderboard' }
  | { name: 'study-material' }
  | { name: 'ai-assistant' }
  | { name: 'pricing' }
  | { name: 'tool'; slug: string };

export type NavKey = 'dashboard' | 'practice' | 'study-material' | 'ai-assistant' | 'leaderboard' | 'pricing';

export function parseRoute(hash: string): Route {
  const segments = hash.replace(/^#/, '').split('/').filter(Boolean);
  const [head, first, second] = segments;

  switch (head) {
    case 'practice':
      return { name: 'practice' };
    case 'subject':
      if (first) return { name: 'subject', slug: first };
      break;
    case 'test':
      if (first && second === 'take') return { name: 'test-take', testId: first };
      if (first && !second) return { name: 'test-overview', testId: first };
      break;
    case 'leaderboard':
      return { name: 'leaderboard' };
    case 'study-material':
      return { name: 'study-material' };
    case 'ai-study-assistant':
    case 'ai':
      return { name: 'ai-assistant' };
    case 'pricing':
      return { name: 'pricing' };
    case 'tools':
      if (first) return { name: 'tool', slug: first };
      break;
  }
  return { name: 'dashboard' };
}

export function navKeyFor(route: Route): NavKey {
  switch (route.name) {
    case 'practice':
    case 'subject':
    case 'test-overview':
    case 'test-take':
      return 'practice';
    case 'study-material':
      return 'study-material';
    case 'ai-assistant':
      return 'ai-assistant';
    case 'leaderboard':
      return 'leaderboard';
    case 'pricing':
      return 'pricing';
    default:
      return 'dashboard';
  }
}
