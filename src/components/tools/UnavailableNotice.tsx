import { Clock } from 'lucide-react';

export function UnavailableNotice({ reason }: { reason: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-stone-50 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
        <Clock className="h-7 w-7" aria-hidden="true" />
      </span>
      <p className="font-bold text-slate-900">Not available yet</p>
      <p className="max-w-md text-sm leading-relaxed text-slate-600">{reason}</p>
    </div>
  );
}
