import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim();

function isValidRealSupabaseConfig(url: string, key: string): boolean {
  if (!url || !key) return false;
  const lowerUrl = url.toLowerCase();
  const lowerKey = key.toLowerCase();
  if (
    lowerUrl.includes('your_project_ref') ||
    lowerUrl.includes('your-project') ||
    lowerUrl.includes('placeholder') ||
    lowerUrl.includes('example.supabase') ||
    lowerKey.includes('your_supabase') ||
    lowerKey.includes('your-anon') ||
    lowerKey.includes('placeholder')
  ) {
    return false;
  }
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = isValidRealSupabaseConfig(supabaseUrl, supabaseAnonKey);

function createFallbackQuery() {
  const emptyResult = { data: [], error: null };
  const singleResult = { data: null, error: null };
  const chain: Record<string, unknown> = {
    select: () => chain,
    insert: () => chain,
    update: () => chain,
    upsert: () => chain,
    delete: () => chain,
    eq: () => chain,
    order: () => chain,
    limit: () => chain,
    single: () => Promise.resolve(singleResult),
    maybeSingle: () => Promise.resolve(singleResult),
    then: (resolve: (value: typeof emptyResult) => unknown) => Promise.resolve(emptyResult).then(resolve),
  };
  return chain;
}

const fallbackClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Authentication requires Supabase configuration.' } }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Authentication requires Supabase configuration.' } }),
    signInWithOAuth: async () => ({ data: { provider: null, url: null }, error: { message: 'OAuth requires Supabase configuration.' } }),
    resetPasswordForEmail: async () => ({ data: {}, error: { message: 'Password reset requires Supabase configuration.' } }),
    signOut: async () => ({ error: null }),
  },
  from: () => createFallbackQuery(),
  rpc: async () => ({ data: null, error: null }),
  functions: {
    invoke: async () => ({
      data: null,
      error: { message: 'AI backend requires Supabase Edge Function configuration.' },
    }),
  },
} as unknown as SupabaseClient;

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : fallbackClient;
