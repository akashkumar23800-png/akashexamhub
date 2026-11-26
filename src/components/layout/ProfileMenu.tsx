import { useEffect, useRef, useState } from 'react';
import { LogIn, UserPlus, UserRound } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { SignOutButton } from '@/components/layout/SignOutButton';
import { useAuth } from '@/hooks/useAuth';

export function ProfileMenu() {
  const { user, displayName, avatarUrl } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const metadataName = (user?.user_metadata?.full_name as string | undefined)?.trim();
  const name = displayName || metadataName || 'Student';
  const email = user?.email ?? '';

  useEffect(() => {
    if (!open) return;
    const handlePointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointer);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handlePointer);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        className="flex items-center justify-center rounded-full transition"
      >
        {user ? (
          <Avatar name={name} src={avatarUrl} size="sm" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/90 text-indigo-600 transition hover:bg-indigo-100">
            <UserRound className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right animate-slide-up overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10"
        >
          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <Avatar name={name} src={avatarUrl} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{name}</p>
                  <p className="truncate text-xs text-slate-500">{email}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600">
                <UserRound className="h-4 w-4 text-slate-400" aria-hidden="true" />
                Student account
              </div>
              <div className="mt-1 border-t border-slate-100 pt-1">
                <SignOutButton variant="menu" />
              </div>
            </>
          ) : (
            <div className="space-y-1 p-1">
              <div className="rounded-xl bg-slate-50 px-3 py-2.5">
                <p className="text-sm font-bold text-slate-900">Student Portal</p>
                <p className="text-xs text-slate-500">Sign in to sync your tests and notes</p>
              </div>
              <a
                href="#auth/signin"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <LogIn className="h-4 w-4 text-slate-500" aria-hidden="true" />
                Login
              </a>
              <a
                href="#auth/signup"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
              >
                <UserPlus className="h-4 w-4 text-violet-600" aria-hidden="true" />
                Create account
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
