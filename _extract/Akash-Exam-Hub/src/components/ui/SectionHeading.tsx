import type { ReactNode } from 'react';

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">{eyebrow}</p>}
        <h2 className="mt-2 text-2xl font-extrabold leading-[1.2] tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}
