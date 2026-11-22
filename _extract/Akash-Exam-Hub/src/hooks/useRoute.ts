import { useEffect, useMemo, useState } from 'react';
import { parseRoute, type Route } from '@/lib/routes';

export function useRoute(): Route {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', handleChange);
    return () => window.removeEventListener('hashchange', handleChange);
  }, []);

  return useMemo(() => parseRoute(hash), [hash]);
}
