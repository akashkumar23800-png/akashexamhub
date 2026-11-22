import { CalendarDays, NotebookText, Users, type LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Reveal } from '@/components/ui/Reveal';
import type { PlatformStats } from '@/lib/types';

interface ReviewPlatform {
  name: string;
  badge: string;
  badgeClassName: string;
}

const REVIEW_PLATFORMS: ReviewPlatform[] = [
  { name: 'G2', badge: 'G', badgeClassName: 'bg-[#ef5b43] text-white' },
  { name: 'Capterra', badge: '▸ Capterra', badgeClassName: 'text-[#1d5b7c]' },
  { name: 'App Store', badge: 'A', badgeClassName: 'bg-gradient-to-br from-sky-400 to-blue-600 text-white' },
];

export function TrustedByMillions({ stats }: { stats: PlatformStats }) {
  const statCards: { label: string; value: number; icon: LucideIcon }[] = [
    { label: 'Registered Users', value: stats.students, icon: Users },
    { label: 'Notes Created', value: stats.notes_total, icon: NotebookText },
    { label: 'Notes Created Daily', value: stats.notes_today, icon: CalendarDays },
  ];

  return (
    <section className="bg-[#faf9f6] px-4 py-12 sm:px-6 lg:py-16" aria-labelledby="trusted-heading">
      <div className="mx-auto max-w-4xl rounded-2xl bg-[#f6f1ea] px-4 py-12 sm:px-8 lg:px-12 lg:py-14">
        <Reveal>
          <h2 id="trusted-heading" className="text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Trusted by Millions Worldwide
          </h2>
        </Reveal>

        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
          {REVIEW_PLATFORMS.map((platform, index) => (
            <Reveal key={platform.name} delay={index * 80}>
              <div className="flex min-h-[112px] flex-col rounded-xl bg-white p-3 shadow-[0_5px_14px_-8px_rgba(15,23,42,0.35)] ring-1 ring-slate-100 sm:min-h-[132px] sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-[10px] font-extrabold sm:h-6 sm:min-w-6 sm:text-xs ${platform.badgeClassName}`}>
                    {platform.badge}
                  </span>
                  <span className="hidden rounded-full bg-amber-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-amber-800 sm:inline-block">
                    Demo
                  </span>
                </div>
                <p className="mt-5 text-sm font-bold text-slate-900 sm:text-lg">Rating pending</p>
                <p className="mt-1 text-[9px] leading-snug text-slate-600 sm:text-xs">Awaiting verified reviews on {platform.name}</p>
              </div>
            </Reveal>
          ))}

          {statCards.map((card, index) => (
            <Reveal key={card.label} delay={(index + REVIEW_PLATFORMS.length) * 80}>
              <div className="flex min-h-[112px] flex-col rounded-xl bg-white p-3 shadow-[0_5px_14px_-8px_rgba(15,23,42,0.35)] ring-1 ring-slate-100 sm:min-h-[132px] sm:p-4">
                <card.icon className="h-4 w-4 text-slate-900 sm:h-5 sm:w-5" aria-hidden="true" />
                <p className="mt-4 text-xl font-extrabold tabular-nums text-slate-900 sm:mt-5 sm:text-2xl">
                  <AnimatedNumber value={card.value} />
                </p>
                <p className="mt-1 text-[9px] font-semibold leading-tight text-slate-900 sm:text-xs">{card.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <p className="mx-auto mt-6 max-w-2xl text-center text-[10px] leading-relaxed text-slate-500 sm:text-xs">
          Review information is a demo placeholder until verified reviews are available. Student and note counts are live from Akash Exam Hub.
        </p>
      </div>
    </section>
  );
}
