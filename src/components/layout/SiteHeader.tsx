import { useEffect, useState } from 'react';
import {
  BookOpen,
  FileText,
  Globe2,
  Image,
  Languages,
  LayoutGrid,
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
import { ProfileMenu } from '@/components/layout/ProfileMenu';
import { SignOutButton } from '@/components/layout/SignOutButton';
import { navKeyFor, type NavKey, type Route } from '@/lib/routes';

type MenuItem = {
  label: string;
  href: string;
  Icon: typeof Image;
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
  { label: 'New Chat', href: '#/', Icon: MessageCircle },
  { label: 'Images', href: '#/tools/edit-pdfs-images', Icon: Image },
  { label: 'AI Filters', href: '#/tools/detect-ai', Icon: Sparkles },
  { label: 'Web Search', href: '#/study-material', Icon: Search },
  { label: 'Documents', href: '#/tools/documents-storage', Icon: FileText },
  { label: 'All tools', href: '#/tools/word-count', Icon: LayoutGrid },
];

export function SiteHeader({ route }: { route: Route }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const active = navKeyFor(route);

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
    document.documentElement.dataset.theme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  const openAuth = async (mode: 'signin' | 'signup') => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    window.location.hash = `#auth/${mode}`;
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

            <nav className="mt-5 flex-1 overflow-y-auto" aria-label="Tools and navigation">
              <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
              <ul className="space-y-1">
                {MENU_ITEMS.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a href={href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950">
                      <Icon className="h-[18px] w-[18px] text-slate-500" aria-hidden="true" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>

              <p className="mb-2 mt-7 px-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Preferences</p>
              <ul className="space-y-1">
                <li>
                  <button type="button" onClick={() => setDarkMode((value) => !value)} className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950">
                    <span className="flex items-center gap-3"><span className="flex h-[18px] w-[18px] items-center justify-center text-slate-500">{darkMode ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}</span>{darkMode ? 'Light mode' : 'Theme mode'}</span>
                    <span className={`h-5 w-9 rounded-full p-0.5 transition ${darkMode ? 'bg-slate-900' : 'bg-slate-200'}`}><span className={`block h-4 w-4 rounded-full bg-white shadow-sm transition ${darkMode ? 'translate-x-4' : ''}`} /></span>
                  </button>
                </li>
                <li><button type="button" className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"><Languages className="h-[18px] w-[18px] text-slate-500" aria-hidden="true" />English</button></li>
              </ul>

              <div className="mt-7 border-t border-slate-100 pt-3">
                <a href="/terms" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"><BookOpen className="h-[18px] w-[18px] text-slate-500" aria-hidden="true" />Terms &amp; Conditions</a>
                <a href="/privacy" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"><ShieldCheck className="h-[18px] w-[18px] text-slate-500" aria-hidden="true" />Privacy Policy</a>
                <a href="mailto:support@akashexamhub.com" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"><Globe2 className="h-[18px] w-[18px] text-slate-500" aria-hidden="true" />Contact Us</a>
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
    </>
  );
}
