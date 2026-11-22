import { useState } from 'react';
import type { TrendPoint } from '@/lib/analytics';
import { formatPercent } from '@/lib/format';

export function ScoreTrendChart({ points }: { points: TrendPoint[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activePoint = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className="relative">
      <div className="flex h-56 items-end gap-2 sm:gap-3" role="list" aria-label="Recent attempt scores">
        {points.map((point, index) => {
          const height = Math.max(4, Math.min(100, point.percent));
          const highlighted = activeIndex === index;
          return (
            <div key={point.id} role="listitem" className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <button
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
                onFocus={() => setActiveIndex(index)}
                onBlur={() => setActiveIndex(null)}
                aria-label={`${point.label}: ${formatPercent(point.percent)}`}
                className="group relative flex h-full w-full items-end justify-center"
              >
                <span
                  className={`block w-full max-w-[48px] origin-bottom rounded-t-xl bg-gradient-to-t from-violet-600 via-blue-500 to-orange-400 transition-all duration-300 animate-grow-bar ${
                    highlighted ? 'opacity-100 shadow-lg shadow-violet-500/40' : 'opacity-85'
                  }`}
                  style={{ height: `${height}%`, animationDelay: `${index * 60}ms` }}
                />
              </button>
              <span className="text-[10px] font-semibold text-slate-500 sm:text-xs">{point.label}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 min-h-6 text-sm font-semibold text-slate-700" aria-live="polite">
        {activePoint ? `${activePoint.label} - ${formatPercent(activePoint.percent)}` : 'Hover a bar to see the score'}
      </div>
    </div>
  );
}
