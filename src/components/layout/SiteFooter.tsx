import { useState } from 'react';
import { ArrowUpRight, Cookie, Mail, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

type FooterLink = { label: string; href: string };
type FooterGroup = { title: string; links: FooterLink[] };

const groups: FooterGroup[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#/' },
      { label: 'Pricing', href: '#/pricing' },
      { label: 'AI Lecture Notes', href: '#/study-material' },
      { label: 'AI PDF Study Tool', href: '#/ai-study-assistant' },
      { label: 'AI Tutor from Notes', href: '#/ai-study-assistant' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Students', href: '#/study-material' },
      { label: 'Teachers & Educators', href: 'mailto:support@akashexamhub.com?subject=Educator%20support' },
      { label: 'Schools & Institutions', href: 'mailto:support@akashexamhub.com?subject=Institution%20enquiry' },
      { label: 'Exam Preparation', href: '#/practice' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Study Guides', href: '#/study-material' },
      { label: 'Help Centre', href: 'mailto:support@akashexamhub.com?subject=Help%20request' },
      { label: 'FAQs', href: 'mailto:support@akashexamhub.com?subject=Question' },
      { label: 'Contact', href: 'mailto:support@akashexamhub.com' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Akash Exam Hub', href: '#/' },
      { label: 'Our Mission', href: '#/' },
      { label: 'Feedback', href: 'mailto:support@akashexamhub.com?subject=Feedback' },
      { label: 'Contact Us', href: 'mailto:support@akashexamhub.com' },
    ],
  },
];

const useCases = [
  'Medical students', 'Law students', 'Engineering students', 'School students',
  'CBSE exam revision', 'Lecture notes', 'Research organization', 'Dissertation revision',
  'Business students', 'Nursing students', 'Psychology students', 'Computer science students',
];

const platforms = [
  'AI knowledge management for students', 'Student second brain', 'AI study platform',
  'AI revision platform', 'Knowledge retention platform', 'AI learning platform',
];

const learningScience = [
  'Learning Science', 'AI for Learning', 'Active Recall', 'Spaced Repetition',
  'Retrieval Practice', 'The Forgetting Curve', 'Long-Term Retention',
  'Why Re-reading Does Not Work',
];

export function SiteFooter() {
  const [cookieOpen, setCookieOpen] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);

  const saveCookieChoice = () => {
    try {
      window.localStorage.setItem('akah-exam-hub-cookie-preferences', JSON.stringify({ essential: true, analytics: analyticsAllowed }));
    } catch {
      // Preferences remain usable for this visit if storage is disabled.
    }
    setCookieOpen(false);
  };

  return (
    <>
      <footer className="mt-16 border-t border-slate-200 bg-[#f8f8fa] text-slate-700">
        <div className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 lg:pt-16">
          <div className="grid gap-10 border-b border-slate-200 pb-10 md:grid-cols-[1.35fr_2fr] md:gap-14">
            <div className="max-w-sm">
              <Logo />
              <p className="mt-5 text-sm leading-7 text-slate-500">
                Turn your learning materials into a clearer study plan. Prepare smarter with chapter-wise resources, practice tests and AI-powered study support.
              </p>
              <a href="mailto:support@akashexamhub.com" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-800 hover:text-violet-700">
                <Mail className="h-4 w-4" /> support@akashexamhub.com <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4 sm:gap-x-5">
              {groups.map((group) => (
                <section key={group.title}>
                  <h2 className="text-sm font-extrabold tracking-wide text-slate-900">{group.title}</h2>
                  <ul className="mt-4 space-y-3">
                    {group.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="text-[13px] leading-5 text-slate-500 transition hover:text-violet-700">{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>

          <div className="grid gap-9 border-b border-slate-200 py-9 md:grid-cols-3 md:gap-10">
            <section>
              <h2 className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">Explore Akash Exam Hub</h2>
              <h3 className="mt-5 text-sm font-extrabold text-slate-900">Use cases</h3>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                {useCases.map((item) => <li key={item}><a href="#/study-material" className="text-[12px] leading-5 text-slate-500 hover:text-violet-700">{item}</a></li>)}
              </ul>
            </section>
            <section>
              <h3 className="text-sm font-extrabold text-slate-900">Platform</h3>
              <ul className="mt-5 space-y-3">
                {platforms.map((item) => <li key={item}><a href="#/ai-study-assistant" className="text-[12px] leading-5 text-slate-500 hover:text-violet-700">{item}</a></li>)}
              </ul>
            </section>
            <section>
              <h3 className="text-sm font-extrabold text-slate-900">Learning science</h3>
              <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
                {learningScience.map((item) => <li key={item}><a href="#/study-material" className="text-[12px] leading-5 text-slate-500 hover:text-violet-700">{item}</a></li>)}
              </ul>
              <h3 className="mt-8 text-sm font-extrabold text-slate-900">Compare</h3>
              <a href="#/practice" className="mt-3 inline-block text-[12px] text-slate-500 hover:text-violet-700">Study and practice tools</a>
            </section>
          </div>

          <div className="flex flex-col gap-4 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Akash Exam Hub. All rights reserved.</p>
            <nav aria-label="Legal links" className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a href="/privacy.html" className="hover:text-slate-700">Privacy</a>
              <a href="/terms.html" className="hover:text-slate-700">Terms</a>
              <button type="button" onClick={() => setCookieOpen(true)} className="inline-flex items-center gap-1 hover:text-slate-700"><Cookie className="h-3.5 w-3.5" /> Cookie settings</button>
            </nav>
          </div>
        </div>
      </footer>

      {cookieOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCookieOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="cookie-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-3">
              <span className="rounded-xl bg-violet-50 p-2 text-violet-700"><ShieldCheck className="h-5 w-5" /></span>
              <div><h2 id="cookie-title" className="text-lg font-extrabold text-slate-900">Cookie preferences</h2><p className="mt-1 text-sm leading-6 text-slate-500">Essential storage is always on so the website can work. You can choose whether to allow optional analytics storage.</p></div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-200 p-4">
              <div><p className="text-sm font-bold text-slate-800">Essential</p><p className="mt-1 text-xs text-slate-500">Required for core website functions</p></div>
              <span className="text-xs font-bold text-emerald-700">Always on</span>
            </div>
            <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4">
              <span><span className="block text-sm font-bold text-slate-800">Optional analytics</span><span className="mt-1 block text-xs text-slate-500">Allow anonymous usage measurement</span></span>
              <input type="checkbox" checked={analyticsAllowed} onChange={(event) => setAnalyticsAllowed(event.target.checked)} className="h-4 w-4 accent-violet-600" />
            </label>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setCookieOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button><button type="button" onClick={saveCookieChoice} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700">Save preferences</button></div>
          </section>
        </div>
      )}
    </>
  );
}
