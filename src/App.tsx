import { useEffect, useState } from 'react';
import { AuthProvider } from '@/contexts/AuthProvider';
import { useAuth } from '@/hooks/useAuth';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingState } from '@/components/ui/StatusStates';

function AuthGate() {
  const { user, loading } = useAuth();
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <LoadingState label="Opening Akash Exam Hub..." />
      </div>
    );
  }

  if (hash.startsWith('#auth') && !user) {
    return <AuthScreen />;
  }

  return <AppShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
