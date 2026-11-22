import { Logo } from '@/components/ui/Logo';
import { useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import type { Provider } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type Mode = 'signin' | 'signup';
type SignInStep = 'email' | 'password';

type SocialProvider = {
  name: string;
  provider: Provider;
  Icon: () => JSX.Element;
};

const SOCIAL_PROVIDERS: SocialProvider[] = [
  { name: 'Google', provider: 'google', Icon: GoogleIcon },
  { name: 'Facebook', provider: 'facebook', Icon: FacebookIcon },
  { name: 'Apple', provider: 'apple', Icon: AppleIcon },
  { name: 'Microsoft', provider: 'azure', Icon: MicrosoftIcon },
];

function friendlyAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'The email or password is incorrect.';
  if (lower.includes('already registered') || lower.includes('already been registered')) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  if (lower.includes('provider') || lower.includes('unsupported')) {
    return 'This sign-in option is not configured yet. Use email and password instead.';
  }
  if (lower.includes('password')) return 'Password must be at least 6 characters.';
  if (lower.includes('failed to fetch') || lower.includes('network')) {
    return 'Network problem. Check your connection and try again.';
  }
  return message;
}

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>(() => (window.location.hash === '#auth/signup' ? 'signup' : 'signin'));
  const [step, setStep] = useState<SignInStep>('email');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignup = mode === 'signup';
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const switchMode = (next: Mode) => {
    setMode(next);
    setStep('email');
    setError(null);
    setNotice(null);
    setPassword('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !emailIsValid) {
      setError('Enter a valid email address to continue.');
      return;
    }

    if (!isSignup && step === 'email') {
      setStep('password');
      return;
    }

    if (!password) {
      setError('Enter your password to continue.');
      return;
    }
    if (isSignup && !fullName.trim()) {
      setError('Enter your full name so it appears on the leaderboard.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice('Your account is ready. Sign in with your email and password.');
          switchMode('signin');
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(friendlyAuthError(message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setNotice(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !emailIsValid) {
      setError('Enter your email address first to reset your password.');
      return;
    }

    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: window.location.origin,
    });
    setSubmitting(false);
    if (resetError) {
      setError(friendlyAuthError(resetError.message));
    } else {
      setNotice('If an account exists for this email, you will receive a password reset link.');
    }
  };

  const handleSocialSignIn = async (provider: Provider) => {
    setError(null);
    setNotice(null);
    setSocialLoading(provider);
    const { error: socialError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
    if (socialError) {
      setError(friendlyAuthError(socialError.message));
      setSocialLoading(null);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-5 py-10 text-slate-900 sm:px-8">
      <div className="w-full max-w-[590px] animate-slide-up">
        <div className="mx-auto max-w-[500px]">
          <div className="mb-14 text-center">
            <div className="mb-6 flex justify-center"><Logo /></div>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">{isSignup ? 'Create your account' : 'Welcome back'}</h1>
            {isSignup && <p className="mt-3 text-sm text-slate-500">Start your exam preparation today.</p>}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {isSignup && (
              <label className="mb-4 block">
                <span className="sr-only">Full name</span>
                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Full name"
                  className={inputClass}
                />
              </label>
            )}

            <label className="block">
              <span className="sr-only">Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@gmail.com"
                className={inputClass}
              />
            </label>

            {(isSignup || step === 'password') && (
              <label className="mt-4 block">
                <span className="sr-only">Password</span>
                <input
                  type="password"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Password"
                  className={inputClass}
                />
              </label>
            )}

            {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{error}</p>}
            {notice && <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800" role="status">{notice}</p>}

            <button type="submit" disabled={submitting} className={primaryButtonClass}>
              {submitting ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : isSignup ? 'Create account' : step === 'email' ? 'Continue' : 'Sign in'}
            </button>
          </form>

          {!isSignup && step === 'password' && (
            <button type="button" onClick={handleForgotPassword} disabled={submitting} className="mx-auto mt-8 block text-base text-slate-600 underline underline-offset-2 transition hover:text-slate-950">
              Forgot password?
            </button>
          )}

          <div className="my-9 flex items-center gap-5 text-sm text-slate-700" aria-hidden="true">
            <span className="h-px flex-1 bg-slate-200" />
            <span>or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="space-y-4">
            {SOCIAL_PROVIDERS.map(({ name, provider, Icon }) => (
              <button
                key={provider}
                type="button"
                onClick={() => handleSocialSignIn(provider)}
                disabled={submitting || socialLoading !== null}
                className="flex min-h-[64px] w-full items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white px-5 text-lg font-medium text-slate-900 shadow-[0_2px_8px_rgba(15,23,42,0.04)] transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {socialLoading === provider ? <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" /> : <Icon />}
                <span>Continue with {name}</span>
              </button>
            ))}
          </div>

          <p className="mt-20 text-center text-lg text-slate-500">
            {isSignup ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" onClick={() => switchMode(isSignup ? 'signin' : 'signup')} className="text-slate-700 underline underline-offset-2 transition hover:text-slate-950">
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}

const inputClass = 'h-20 w-full rounded-xl border border-slate-200 bg-white px-7 text-xl text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100 sm:text-2xl';
const primaryButtonClass = 'mt-5 flex h-20 w-full items-center justify-center rounded-xl bg-slate-100 px-6 text-xl font-semibold text-slate-400 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-70';

function GoogleIcon() {
  return <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35 12.27c0-.71-.06-1.4-.18-2.06H12v3.9h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.7 2.91-4.2 2.91-7.23Z" /><path fill="#34A853" d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.7-1.72-5.47-4.03H3.28v2.53A9.75 9.75 0 0 0 12 21.75Z" /><path fill="#FBBC05" d="M6.53 13.84A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.26.31-1.84V7.63H3.28A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.03 4.37l3.25-2.53Z" /><path fill="#EA4335" d="M12 6.13c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 3.1 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.72 5.38l3.25 2.53C7.3 7.85 9.46 6.13 12 6.13Z" /></svg>;
}

function FacebookIcon() {
  return <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#1877F2" /><path fill="white" d="M13.4 19v-6h2l.3-2.35h-2.3v-1.5c0-.68.19-1.14 1.18-1.14h1.26V5.9c-.22-.03-.98-.1-1.86-.1-1.85 0-3.12 1.13-3.12 3.2v1.65H8.77V13h2.09v6h2.54Z" /></svg>;
}

function AppleIcon() {
  return <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M16.77 12.78c.02 2.25 1.97 3 2 3.01-.02.05-.31 1.08-1.03 2.14-.62.91-1.27 1.82-2.29 1.84-1 .02-1.32-.59-2.46-.59-1.15 0-1.5.57-2.45.61-1 .04-1.76-.98-2.39-1.89-1.3-1.87-2.29-5.28-.96-7.59.66-1.15 1.85-1.88 3.14-1.9.98-.02 1.91.66 2.46.66.55 0 1.57-.82 2.65-.7.45.02 1.72.18 2.54 1.37-.07.04-1.52.89-1.51 2.64ZM15.02 7.26c.5-.6.83-1.42.74-2.26-.72.03-1.59.48-2.11 1.08-.46.53-.86 1.38-.75 2.19.8.06 1.62-.4 2.12-1.01Z" /></svg>;
}

function MicrosoftIcon() {
  return <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24"><path fill="#f35325" d="M3 3h8.5v8.5H3z" /><path fill="#81bc06" d="M12.5 3H21v8.5h-8.5z" /><path fill="#05a6f0" d="M3 12.5h8.5V21H3z" /><path fill="#ffba08" d="M12.5 12.5H21V21h-8.5z" /></svg>;
}
