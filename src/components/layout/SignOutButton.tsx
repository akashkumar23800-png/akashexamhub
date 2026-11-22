import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function SignOutButton({ variant = 'pill', onDone }: { variant?: 'pill' | 'menu'; onDone?: () => void }) {
  const { signOut } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setPending(true);
    setError(null);
    try {
      await signOut();
      onDone?.();
    } catch {
      setError('Could not log out. Please try again.');
      setPending(false);
    }
  };

  const base =
    variant === 'pill'
      ? 'inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700'
      : 'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-red-50 hover:text-red-700';

  return (
    <div className={variant === 'menu' ? 'w-full' : ''}>
      <button type="button" onClick={handleClick} disabled={pending} className={`${base} disabled:opacity-60`}>
        <LogOut className="h-4 w-4" aria-hidden="true" />
        {pending ? 'Logging out...' : 'Logout'}
      </button>
      {error && (
        <p className="mt-2 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
