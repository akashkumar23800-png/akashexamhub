import { useEffect, useState } from 'react';
import { useInView } from '@/hooks/useInView';
import { formatCount } from '@/lib/format';

export function AnimatedNumber({ value, duration = 1400 }: { value: number; duration?: number }) {
  const { ref, visible } = useInView<HTMLSpanElement>();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!visible) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [visible, value, duration]);

  return <span ref={ref}>{formatCount(display)}</span>;
}
