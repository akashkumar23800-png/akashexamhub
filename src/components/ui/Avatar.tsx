import { useEffect, useState } from 'react';
import { initialsOf } from '@/lib/format';

type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
};

/**
 * Circular avatar. Shows the signed-in user's real profile photo (Google/Gmail via
 * Supabase `user_metadata.avatar_url` or `picture`) and falls back to clean initials
 * only when there is no photo or the image cannot be loaded.
 */
export function Avatar({
  name,
  src,
  size = 'md',
  className = '',
}: {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
}) {
  const photoUrl = src?.trim() ? src.trim() : null;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  const showPhoto = Boolean(photoUrl) && !failed;

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-600 to-orange-500 font-bold text-white ring-2 ring-white ${SIZE_CLASS[size]} ${className}`}
    >
      {showPhoto ? (
        <img
          src={photoUrl as string}
          alt={name ? `${name} profile photo` : 'Profile photo'}
          referrerPolicy="no-referrer"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full rounded-full object-cover object-center"
        />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
    </span>
  );
}
