import type { User } from '@supabase/supabase-js';

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function metadataOf(user: User | null | undefined): Record<string, unknown> {
  return (user?.user_metadata ?? {}) as Record<string, unknown>;
}

/** Display name from the OAuth provider profile (Google sends `full_name`, others `name`). */
export function readDisplayName(user: User | null | undefined): string | null {
  const metadata = metadataOf(user);
  return readString(metadata.full_name) ?? readString(metadata.name);
}

/** Real profile photo URL from the provider profile (`avatar_url`, then `picture`). */
export function readAvatarUrl(user: User | null | undefined): string | null {
  const metadata = metadataOf(user);
  return readString(metadata.avatar_url) ?? readString(metadata.picture);
}
