import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import type { ListingAccessState } from '@/lib/listingAccess';

const BACKOFF_MS = [600, 1500, 3000];

interface Options {
  state: ListingAccessState;
  userId?: string | null;
  maxAttempts?: number;
}

/**
 * Delayed role propagation (fresh signup, just-granted role, stale cache) can
 * surface a false "Upgrade Required". When access is denied for a signed-in
 * user we transparently refresh the profile/session and refetch roles a few
 * times with backoff before showing the denial card.
 */
export function useListingAccessRetry({ state, userId, maxAttempts = BACKOFF_MS.length }: Options) {
  const queryClient = useQueryClient();
  const { refreshProfile } = useAuth();
  const [attempt, setAttempt] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsRetrying(true);
    try {
      await refreshProfile();
      await queryClient.invalidateQueries({ queryKey: ['user-roles', userId] });
      await queryClient.refetchQueries({ queryKey: ['user-roles', userId] });
    } catch (e) {
      console.warn('[listing-access] role refresh failed:', e);
    } finally {
      inFlight.current = false;
      setIsRetrying(false);
    }
  }, [queryClient, refreshProfile, userId]);

  // Reset the cycle whenever the user changes or access is resolved.
  useEffect(() => {
    if (state === 'allowed' || state === 'guest') {
      setAttempt(0);
    }
  }, [state, userId]);

  useEffect(() => {
    if (state !== 'upgrade_required' || !userId) return;
    if (attempt >= maxAttempts) return;

    timer.current = setTimeout(async () => {
      await refresh();
      setAttempt((a) => a + 1);
    }, BACKOFF_MS[Math.min(attempt, BACKOFF_MS.length - 1)]);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [state, userId, attempt, maxAttempts, refresh]);

  const manualRetry = useCallback(async () => {
    setAttempt(0);
    await refresh();
  }, [refresh]);

  return {
    /** Auto-retry cycle still running — keep showing a verifying state. */
    isResolving: state === 'upgrade_required' && !!userId && (isRetrying || attempt < maxAttempts),
    isRetrying,
    attempt,
    maxAttempts,
    manualRetry,
  };
}
