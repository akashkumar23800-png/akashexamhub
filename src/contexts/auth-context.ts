import { createContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /** Display name from the provider profile (Google full_name/name), if any. */
  displayName: string | null;
  /** Real profile photo URL from the provider (Google avatar_url/picture), if any. */
  avatarUrl: string | null;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
