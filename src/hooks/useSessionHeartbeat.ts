import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { triggerAuthModal, isSessionCheckSuppressed } from '@/hooks/useSessionMonitor';

const HEARTBEAT_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Pings session-heartbeat edge function every 5 min while user is active & online.
 * If the server returns 401/403, triggers the re-login modal.
 */
export const useSessionHeartbeat = (isAuthenticated: boolean) => {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const beat = async () => {
      // Skip if offline, tab hidden, or session suppressed
      if (!navigator.onLine || document.visibilityState === 'hidden' || isSessionCheckSuppressed()) return;

      try {
        const { data, error } = await supabase.functions.invoke('session-heartbeat', {
          method: 'POST',
        });

        if (error) {
          // If the error contains 401/403-like message, trigger auth modal
          const msg = typeof error === 'object' && 'message' in error ? (error as any).message : String(error);
          if (msg.includes('401') || msg.includes('403') || msg.includes('unauthorized') || msg.includes('JWT')) {
            triggerAuthModal('Session invalid – please sign in again');
          }
        }
      } catch {
        // Network error – silently ignore, will retry next interval
      }
    };

    // First beat after 1 minute
    const initialTimeout = setTimeout(beat, 60_000);
    timerRef.current = setInterval(beat, HEARTBEAT_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated]);
};
