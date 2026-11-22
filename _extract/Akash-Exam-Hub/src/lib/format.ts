import type { TestKind } from '@/lib/types';

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDuration(minutes: number): string {
  return `${minutes} min`;
}

export function formatPercent(value: number | null): string {
  return value === null ? '--' : `${Math.round(value)}%`;
}

export function formatCount(value: number): string {
  return value.toLocaleString('en-IN');
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'S';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] ?? '' : '';
  return `${first}${last}`.toUpperCase();
}

export function kindLabel(kind: TestKind): string {
  return kind === 'live' ? 'Live test' : 'Practice test';
}

export function testAvailability(scheduledAt: string | null, now: number): 'open' | 'upcoming' | 'tba' {
  if (!scheduledAt) return 'tba';
  return new Date(scheduledAt).getTime() <= now ? 'open' : 'upcoming';
}
