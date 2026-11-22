import { createRoot } from 'react-dom/client';
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { AskAnythingBox } from '@/components/home/AskAnythingBox';
import '@/index.css';

const user = {
  id: 'demo-user',
  email: 'student@example.com',
  user_metadata: { full_name: 'Demo Student' },
} as unknown as AuthContextValue['user'];

const value: AuthContextValue = {
  session: null,
  user,
  loading: false,
  signOut: async () => {},
};

createRoot(document.getElementById('root')!).render(
  <AuthContext.Provider value={value}>
    <SiteHeader route={{ name: 'dashboard' }} />
    <main className="mx-auto max-w-3xl px-4 py-10">
      <AskAnythingBox />
    </main>
  </AuthContext.Provider>,
);
