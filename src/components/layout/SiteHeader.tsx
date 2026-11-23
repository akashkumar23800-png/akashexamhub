import { useEffect, useState } from 'react';
import {
  BookOpen,
  Check,
  FileText,
  Globe2,
  Image,
  Languages,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Logo } from '@/components/ui/Logo';
import { Avatar } from '@/components/ui/Avatar';
import { ProfileMenu } from '@/components/layout/ProfileMenu';
import { SignOutButton } from '@/components/layout/SignOutButton';
import { navKeyFor, type NavKey, type Route } from '@/lib/routes';
import { useAuth } from '@/hooks/useAuth';
import { getStudyLanguage, setStudyLanguage, type StudyLanguage } from '@/lib/preferences';

type MenuItem = {
  label: string;
  href: string;
  Icon: typeof Image;
  action?: 'new-chat';
};

const NAV_ITEMS: { key: NavKey; label: string; href: string }[] = [
  { key: 'dashboard', label: 'Dashboard', href: '#/' },
  { key: 'practice', label: 'Practice Tests', href: '#/practice' },
  { key: 'study-material', label: 'Study Material', href: '#/study-material' },
  { key: 'ai-assistant', label: 'AI Assistant', href: '#/ai-study-assistant' },
  { key: 'leaderboard', label: 'Leaderboard', href: '#/leaderboard' },
  { key: 'pricing', label: 'Pricing', href: '#/pricing' },
];

const MENU_ITEMS: MenuItem[] = [
  { label: 'AI Study Assistant', href: '#/ai-study-assistant', Icon: Sparkles },
  { label: 'New Chat', href: '#/ai-study-assistant', Icon: MessageCircle, action: 'new-chat' },
  { label: 'Images', href: '#/tools/edit-pdfs-images', Icon: Image },
  { label: 'AI Filters', href: '#/tools/detect-ai', Icon: Sparkles },
  { label: 'Web Search', href: '#/study-material', Icon: Search },
  { label: 'Documents', href: '#/tools/documents-storage', Icon: FileText },
  { label: 'All Tools', href: '#/tools/word-count', Icon: LayoutGrid },
];

const LANGUAGES: StudyLanguage[] = ['English', 'Hindi'];

export function SiteHeader({ route }: { route: Route }) {
  const { user, displayName, avatarUrl, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<StudyLanguage>(() => getStudyLanguage());
  const [languageOpen, setLanguageOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [signOutPending, setSignOutPending] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const active = navKeyFor(route);
  const currentHash = typeof window === 'undefined' ? '#/' : window.location.hash || '#/';

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!signOutOpen) return undefined;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !signOutPending) setSignOutOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [signOutOpen, signOutPending]);

  useEffect(() => {
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const openAuth = async (mode: 'signin' | 'signup') => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    window.location.hash = `#auth/${mode}`;
  };

  const handleMenuNavigate = (item: MenuItem) => {
    setMenuOpen(false);
    if (item.action === 'new-chat') {
      if (window.location.hash !== item.href) window.location.hash = item.href;
      window.dispatchEvent(new Event('akh:new-chat'));
    }
  };

  const chooseLanguage = (next: StudyLanguage) => {
    setLanguage(next);
    setStudyLanguage(next);
    setLanguageOpen(false);
  };

  const requestSignOut = () => {
    setSignOutError(null);
    if (!user) {
      setMenuOpen(false);
      window.location.hash = '#auth/signin';
      return;
    }
    setSignOutOpen(true);
  };

  const confirmSignOut = async () => {
    setSignOutPending(true);
    setSignOutError(null);
    try {
      await signOut();
      setSignOutOpen(false);
      setMenuOpen(false);
    } catch {
      setSignOutError('Could not sign out. Please try again.');
    } finally {
      setSignOutPending(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex min-h-[72px] max-w-7xl items-center gap-2 py-1 sm:min-h-[84px] lg:gap-6 px-3 sm:px-6 lg:px-8">
          <Logo />

          <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Main">
            {NAV_ITEMS.map((item) => {
              const isActive = item.key === active;
              return (
                <a
                  key={item.key}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`group relative rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isActive ? 'text-violet-700' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-3.5 -bottom-[3px] h-[3px] origin-left rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-orange-500 shadow-[0_0_12px_rgba(124,58,237,0.6)] transition-transform duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-50'
                    }`}
                    aria-hidden="true"
                  />
                </a>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden lg:block">
              <SignOutButton />
            </div>
            <ProfileMenu />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="app-menu-drawer"
              aria-label="Open menu"
              className="rounded-full p-2 text-slate-700 transition hover:bg-slate-100"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50" role="presentation">
          <button type="button" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]" />
          <aside id="app-menu-drawer" className="relative flex h-full w-[min(88vw,360px)] animate-slide-up flex-col bg-white px-5 py-5 shadow-2xl" aria-label="App menu">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <Logo />
              <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                <X className="h-5 w-5" />
              </button>
            </div>

            {user && (
              <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <Avatar name={displayName || 'Student'} src={avatarUrl} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{displayName || 'Student'}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
            )}

            <nav className="mt-4 flex-1 overflow-y-auto" aria-label="Tools and navigation">
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
              <ul className="space-y-1">
                {MENU_ITEMS.map((item) => {
                  const isActive = currentHash === item.href;
                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        onClick={() => handleMenuNavigate(item)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                          isActive
                            ? 'bg-violet-50 text-violet-800 ring-1 ring-violet-100'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                        }`}
                      >
                        <item.Icon className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-violet-700' : 'text-slate-500'}`} aria-hidden="true" />
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>

              <p className="mb-2 mt-7 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Preferences</p>
              <ul className="space-y-1">
                <li>
                  <button
                    type="button"
                    onClick={() => setDarkMode((value) => !value)}
                    aria-pressed={darkMode}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-[18px] w-[18px] items-center justify-center text-slate-500">
                        {darkMode ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
                      </span>
                      Theme Mode
                    </span>
                    <span className={`h-5 w-9 flex-shrink-0 rounded-full p-0.5 transition ${darkMode ? 'bg-violet-600' : 'bg-slate-200'}`}>
                      <span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition ${darkMode ? 'translate-x-4' : ''}`} />
                    </span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLanguageOpen((open) => !open)}
                    aria-expanded={languageOpen}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${
                      languageOpen ? 'bg-slate-100 text-slate-950' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <Languages className="h-[18px] w-[18px] flex-shrink-0 text-slate-500" aria-hidden="true" />
                      <span>Language <span className="text-slate-400">–</span> {language}</span>
                    </span>
                    <span className={`text-slate-400 transition-transform ${languageOpen ? 'rotate-180' : ''}`} aria-hidden="true">▾</span>
                  </button>
                  {languageOpen && (
                    <div className="mt-1 space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-1.5">
                      {LANGUAGES.map((option) => {
                        const selected = option === language;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => chooseLanguage(option)}
                            aria-pressed={selected}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold transition ${
                              selected ? 'bg-white text-violet-800 shadow-sm' : 'text-slate-600 hover:bg-white/70 hover:text-slate-900'
                            }`}
                          >
                            {option}
                            {selected && <Check className="h-4 w-4 text-violet-700" aria-hidden="true" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </li>
                <li>
                  <a href="/terms.html" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950">
                    <BookOpen className="h-[18px] w-[18px] flex-shrink-0 text-slate-500" aria-hidden="true" />
                    Terms &amp; Conditions
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={requestSignOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="h-[18px] w-[18px] flex-shrink-0 text-slate-500" aria-hidden="true" />
                    Sign Out
                  </button>
                </li>
              </ul>

              <div className="mt-7 border-t border-slate-100 pt-3">
                <a href="/privacy.html" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                  <ShieldCheck className="h-[18px] w-[18px] text-slate-500" aria-hidden="true" />Privacy Policy
                </a>
                <a href="mailto:support@akashexamhub.com" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                  <Globe2 className="h-[18px] w-[18px] text-slate-500" aria-hidden="true" />Contact Us
                </a>
              </div>
            </nav>

            <div className="border-t border-slate-100 pt-5">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => openAuth('signup')} className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700">Sign up</button>
                <button type="button" onClick={() => openAuth('signin')} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50">Login</button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {signOutOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="signout-title">
          <button type="button" aria-label="Cancel sign out" onClick={() => { if (!signOutPending) setSignOutOpen(false); }} className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in" />
          <div id="signout-dialog" className="relative w-full max-w-sm animate-slide-up rounded-3xl bg-white p-6 text-left shadow-2xl">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 id="signout-title" className="mt-4 text-lg font-extrabold text-slate-900">Sign out of Akash Exam Hub?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              You will need to log in again to reach your saved tests, notes, quiz scores and study progress.
            </p>
            {signOutError && (
              <p role="alert" className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{signOutError}</p>
            )}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSignOutOpen(false)}
                disabled={signOutPending}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmSignOut()}
                disabled={signOutPending}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {signOutPending ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
