import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Automatically invalidates all TanStack Query caches when the browser
 * transitions from offline → online, triggering background refetches
 * so users see fresh data without manual reload.
 */
export function useOnlineRefresh() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const onOnline = () => {
      console.log('[PWA] Back online — invalidating queries');
      // Invalidate all queries so they refetch in background
      queryClient.invalidateQueries();
    };

    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [queryClient]);
}
