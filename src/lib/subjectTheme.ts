export interface SubjectTheme {
  gradient: string;
  glow: string;
  text: string;
}

const THEMES: Record<string, SubjectTheme> = {
  physics: { gradient: 'from-blue-600 to-blue-800', glow: 'shadow-blue-600/30', text: 'text-blue-700' },
  chemistry: { gradient: 'from-green-600 to-green-800', glow: 'shadow-green-600/30', text: 'text-green-700' },
  mathematics: { gradient: 'from-orange-500 to-orange-700', glow: 'shadow-orange-500/30', text: 'text-orange-700' },
  reasoning: { gradient: 'from-purple-600 to-purple-800', glow: 'shadow-purple-600/30', text: 'text-purple-700' },
  biology: { gradient: 'from-emerald-600 to-emerald-800', glow: 'shadow-emerald-600/30', text: 'text-emerald-700' },
  english: { gradient: 'from-rose-600 to-rose-800', glow: 'shadow-rose-600/30', text: 'text-rose-700' },
  hindi: { gradient: 'from-amber-700 to-amber-900', glow: 'shadow-amber-700/30', text: 'text-amber-800' },
  'social-science': { gradient: 'from-cyan-600 to-cyan-800', glow: 'shadow-cyan-600/30', text: 'text-cyan-700' },
  history: { gradient: 'from-red-600 to-red-800', glow: 'shadow-red-600/30', text: 'text-red-700' },
  geography: { gradient: 'from-teal-600 to-teal-800', glow: 'shadow-teal-600/30', text: 'text-teal-700' },
  economics: { gradient: 'from-lime-700 to-lime-900', glow: 'shadow-lime-700/30', text: 'text-lime-800' },
  'political-science': { gradient: 'from-slate-600 to-slate-800', glow: 'shadow-slate-600/30', text: 'text-slate-700' },
};

const DEFAULT_THEME: SubjectTheme = {
  gradient: 'from-slate-600 to-slate-800',
  glow: 'shadow-slate-600/30',
  text: 'text-slate-700',
};

export function subjectTheme(slug: string): SubjectTheme {
  return THEMES[slug] ?? DEFAULT_THEME;
}
