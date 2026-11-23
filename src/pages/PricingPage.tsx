import { Check, Sparkles } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';

const FREE_FEATURES = [
  'Subject practice tests and the public mock tests',
  'Instant scoring with explanations',
  'Your analytics and leaderboard ranking',
  'Study material for Classes 6 to 12',
];

const PREMIUM_FEATURES = [
  'Everything in Free',
  'Full-length premium mock exams',
  'Advanced performance insights',
  'Priority access to new live tests',
];

export function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple plans for serious students"
          description="Start free today. Your scores and rankings are saved to your account from the very first test."
        />
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Free</p>
          <p className="mt-3 text-4xl font-extrabold text-slate-900">
            Rs 0 <span className="text-base font-semibold text-slate-500">/ forever</span>
          </p>
          <ul className="mt-8 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-slate-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
          <a
            href="#/practice"
            className="mt-auto rounded-full border border-slate-200 px-6 py-3 pt-3 text-center text-sm font-bold text-slate-800 transition hover:border-violet-300 hover:text-violet-700"
          >
            Start practising
          </a>
        </section>

        <section className="relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-blue-700 to-orange-500 p-8 text-white shadow-xl">
          <span className="absolute right-6 top-6 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Coming soon
          </span>
          <p className="text-sm font-bold uppercase tracking-wider text-white/80">Premium</p>
          <p className="mt-3 text-4xl font-extrabold">Rs --</p>
          <ul className="mt-8 space-y-3">
            {PREMIUM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm text-white/95">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
          <p className="mt-auto pt-8 text-sm text-white/85">
            Paid plans are not open yet. Free access includes everything you need to start preparing.
          </p>
        </section>
      </div>
    </div>
  );
}
