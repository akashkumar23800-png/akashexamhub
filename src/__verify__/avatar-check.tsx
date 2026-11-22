import { createRoot } from 'react-dom/client';
import type { User } from '@supabase/supabase-js';
import { AuthContext } from '@/contexts/auth-context';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { readAvatarUrl, readDisplayName } from '@/lib/profile';
import type { Route } from '@/lib/routes';

// Test fixture only: a plain colour square, not a person's photo.
const PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#7c3aed"/></svg>',
  );

const googleUser = {
  id: 'user-1',
  email: 'akash.student@gmail.com',
  user_metadata: { full_name: 'Akash Kumar', avatar_url: PHOTO },
} as unknown as User;

const pictureOnlyUser = {
  id: 'user-2',
  email: 'second.student@gmail.com',
  user_metadata: { picture: 'https://lh3.googleusercontent.com/photo.png' },
} as unknown as User;

const route: Route = { name: 'dashboard' };

function Harness() {
  return (
    <AuthContext.Provider
      value={{
        session: null,
        user: googleUser,
        loading: false,
        displayName: readDisplayName(googleUser),
        avatarUrl: readAvatarUrl(googleUser),
        signOut: async () => {},
      }}
    >
      <SiteHeader route={route} />
      <main className="space-y-2 p-6 text-sm">
        <p id="display-name">{readDisplayName(googleUser) ?? 'none'}</p>
        <p id="picture-fallback">{readAvatarUrl(pictureOnlyUser) ?? 'none'}</p>
        <p id="signed-out">{readAvatarUrl(null) ?? 'no-photo'}</p>
      </main>
    </AuthContext.Provider>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<Harness />);
