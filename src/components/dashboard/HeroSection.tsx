import { Calculator, Dna, FlaskConical, Play, Puzzle, Rocket, Users, type LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import type { PlatformStats } from '@/lib/types';

const FLOATING_ICONS: { icon: LucideIcon; className: string; delay: string }[] = [
  { icon: Rocket, className: 'top-3 left-4 bg-blue-500/80', delay: '0s' },
  { icon: FlaskConical, className: 'top-10 right-2 bg-emerald-500/80', delay: '1.5s' },
  { icon: Calculator, className: 'bottom-5 left-0 bg-orange-500/85', delay: '3s' },
  { icon: Puzzle, className: 'bottom-0 right-10 bg-amber-500/80', delay: '4.5s' },
  { icon: Dna, className: 'top-1/2 -right-2 bg-teal-500/80', delay: '2.2s' },
];

export function HeroSection({ stats, ctaHref }: { stats: PlatformStats; ctaHref: string }) {
  const statItems = [
    { label: 'Questions', value: stats.questions, icon: Rocket, color: 'text-indigo-100', background: 'bg-indigo-400/35 ring-1 ring-white/25' },
    { label: 'Mock Tests', value: stats.tests, icon: FlaskConical, color: 'text-teal-100', background: 'bg-teal-400/25 ring-1 ring-white/25' },
    { label: 'Students', value: stats.students, icon: Users, color: 'text-amber-100', background: 'bg-amber-400/30 ring-1 ring-white/25' },
  ];

  return (
    <section className="bg-slate-50 px-4 py-4 sm:px-6 md:py-6">
      <div className="hero-gradient relative mx-auto max-w-6xl overflow-hidden rounded-3xl p-6 text-white shadow-xl md:p-10">
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-glow-pulse" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-orange-300/30 blur-3xl animate-glow-pulse" aria-hidden="true" />

        <div className="relative z-10 grid items-center gap-8 md:grid-cols-12">
          <div className="animate-slide-up md:col-span-7">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Crack your exam.<br />One test at a time.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-indigo-100 sm:text-base">
              Master your subjects with interactive practice tests and detailed analytics.
            </p>
            <div className="pt-5">
              <a
                href={ctaHref}
                className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 hover:from-amber-600 hover:to-orange-600 sm:px-6 sm:text-base"
              >
                Take a free mock test
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/25">
                  <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                </span>
              </a>
            </div>
          </div>

          <div className="relative animate-slide-up md:col-span-5" style={{ animationDelay: '150ms' }}>
            {FLOATING_ICONS.map(({ icon: Icon, className, delay }) => (
              <span
                key={className}
                className={`absolute z-10 hidden h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg ring-1 ring-white/30 backdrop-blur-md animate-float sm:flex ${className}`}
                style={{ animationDelay: delay }}
                aria-hidden="true"
              >
                <Icon className="h-5 w-5" />
              </span>
            ))}

            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {statItems.map(({ label, value, icon: Icon, color, background }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/15 bg-white/10 p-3 text-center backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:bg-white/20 sm:p-4"
                >
                  <span className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full ${background} ${color}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-lg font-extrabold tabular-nums sm:text-2xl">
                    {value > 0 ? <AnimatedNumber value={value} /> : '—'}
                  </p>
                  <p className={`mt-0.5 text-[9px] font-semibold uppercase tracking-wider ${color} sm:text-[10px]`}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
