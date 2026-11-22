import { initialsOf } from '@/lib/format';

export function Avatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-16 w-16 text-xl' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm';
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-orange-500 font-bold text-white ring-2 ring-white ${sizeClass}`}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}
