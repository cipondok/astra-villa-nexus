import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ── Constants ──────────────────────────────────────────────
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;   // 30 min → show warning
const GRACE_PERIOD = 5 * 60 * 1000;           // 5 min grace after warning
const SESSION_CHECK_INTERVAL = 30_000;         // 30 s periodic check
const TOKEN_REFRESH_THROTTLE = 10 * 60 * 1000; // Refresh token max every 10 min
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'] as const;

// ── Global suppression flag (used by batch operations) ────
let sessionCheckSuppressed = false;
export const suppressSessionCheck = (suppress: boolean) => { sessionCheckSuppressed = suppress; };
export const isSessionCheckSuppressed = () => sessionCheckSuppressed;

// ── Auth error emitter (trigger modal from anywhere) ──────
export const authErrorEmitter = {
  listeners: new Set<(error: string) => void>(),
  emit(error: string) { this.listeners.forEach(l => l(error)); },
  subscribe(listener: (error: string) => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  },
};
export const triggerAuthModal = (reason?: string) => {
  authErrorEmitter.emit(reason || 'Authentication required');
};

// ── Network status helper ─────────────────────────────────
const isOnline = () => typeof navigator !== 'undefined' ? navigator.onLine : true;

// ── Hook ──────────────────────────────────────────────────
export interface SessionMonitorState {
  isSessionExpired: boolean;
  showExpirationModal: boolean;
  showWarning: boolean;
  authError: string | null;
  isOffline: boolean;
  gracePeriodEnd: number | null;       // timestamp when grace period expires
  inactivityWarning: boolean;          // true = in grace period countdown
}

export const useSessionMonitor = () => {
  const [state, setState] = useState<SessionMonitorState>({
    isSessionExpired: false,
    showExpirationModal: false,
    showWarning: false,
    authError: null,
    isOffline: !isOnline(),
    gracePeriodEnd: null,
    inactivityWarning: false,
  });

  const { toast } = useToast();
  const lastRefreshRef = useRef(0);
  const warningShownRef = useRef(false);
  const forcedLogoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Helpers ───────────────────────────────────────────
  const getLastActivity = useCallback((): number => {
    const stored = localStorage.getItem('last_activity');
    return stored ? parseInt(stored, 10) : Date.now();
  }, []);

  const touchActivity = useCallback(() => {
    localStorage.setItem('last_activity', Date.now().toString());
  }, []);

  // ── Throttled silent token refresh ────────────────────
  const silentRefresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastRefreshRef.current < TOKEN_REFRESH_THROTTLE) return;
    if (!isOnline()) return;
    try {
      const { error } = await supabase.auth.refreshSession();
      if (!error) {
        lastRefreshRef.current = now;
      } else {
        console.error('[SessionMonitor] silent refresh error', error.message);
      }
    } catch (e) {
      // network failure – ignore, will retry later
    }
  }, []);

  // ── Force logout ──────────────────────────────────────
  const forceLogout = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isSessionExpired: true,
      showExpirationModal: true,
      inactivityWarning: false,
      gracePeriodEnd: null,
      authError: 'Logged out due to inactivity',
    }));
    warningShownRef.current = false;
    localStorage.removeItem('had_active_session');
  }, []);

  // ── Cancel grace period ───────────────────────────────
  const cancelGracePeriod = useCallback(() => {
    if (forcedLogoutTimerRef.current) {
      clearTimeout(forcedLogoutTimerRef.current);
      forcedLogoutTimerRef.current = null;
    }
    warningShownRef.current = false;
    setState(prev => ({ ...prev, inactivityWarning: false, gracePeriodEnd: null, showWarning: false }));
  }, []);

  // ── Start grace period ────────────────────────────────
  const startGracePeriod = useCallback(() => {
    if (warningShownRef.current) return;
    warningShownRef.current = true;

    const end = Date.now() + GRACE_PERIOD;
    setState(prev => ({ ...prev, inactivityWarning: true, gracePeriodEnd: end, showWarning: true }));

    toast({
      title: 'Session Expiring Soon',
      description: 'You will be logged out in 5 minutes due to inactivity.',
      variant: 'destructive',
      duration: 10000,
    });

    forcedLogoutTimerRef.current = setTimeout(() => {
      forceLogout();
    }, GRACE_PERIOD);
  }, [toast, forceLogout]);

  // ── Extend session (called on user activity / Stay Logged In) ──
  const extendSession = useCallback(async () => {
    touchActivity();
    cancelGracePeriod();
    await silentRefresh();
  }, [touchActivity, cancelGracePeriod, silentRefresh]);

  // ── Handle auth error ─────────────────────────────────
  const handleAuthError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      isSessionExpired: true,
      showExpirationModal: true,
      authError: error,
      inactivityWarning: false,
      gracePeriodEnd: null,
    }));
    cancelGracePeriod();
  }, [cancelGracePeriod]);

  // ── Dismiss / reset ───────────────────────────────────
  const dismissExpirationModal = useCallback(() => {
    setState(prev => ({ ...prev, showExpirationModal: false }));
  }, []);

  const resetSessionState = useCallback(() => {
    cancelGracePeriod();
    setState({
      isSessionExpired: false,
      showExpirationModal: false,
      showWarning: false,
      authError: null,
      isOffline: !isOnline(),
      gracePeriodEnd: null,
      inactivityWarning: false,
    });
  }, [cancelGracePeriod]);

  // ── Subscribe to external auth errors ─────────────────
  useEffect(() => {
    const unsub = authErrorEmitter.subscribe(handleAuthError);
    return unsub;
  }, [handleAuthError]);

  // ── Network online/offline ────────────────────────────
  useEffect(() => {
    const goOffline = () => setState(prev => ({ ...prev, isOffline: true }));
    const goOnline = async () => {
      setState(prev => ({ ...prev, isOffline: false }));
      // Re-validate session after coming back online
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          const hadSession = localStorage.getItem('had_active_session') === 'true';
          if (hadSession) handleAuthError('Session expired while offline');
        } else {
          // Session still valid – refresh activity
          touchActivity();
        }
      } catch { /* ignore network error during transition */ }
    };

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, [handleAuthError, touchActivity]);

  // ── Main session check loop ───────────────────────────
  useEffect(() => {
    const checkSession = async () => {
      if (sessionCheckSuppressed || state.isOffline || state.isSessionExpired) return;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          if (error.message.includes('refresh_token') || error.message.includes('invalid') || error.message.includes('expired')) {
            handleAuthError(error.message);
          }
          return;
        }

        const hadSession = localStorage.getItem('had_active_session') === 'true';
        if (!session && hadSession) {
          handleAuthError('Your session has ended');
          localStorage.removeItem('had_active_session');
          return;
        }

        if (session) {
          localStorage.setItem('had_active_session', 'true');

          // Check token expiry
          if (session.expires_at) {
            const timeUntilExpiry = session.expires_at * 1000 - Date.now();
            if (timeUntilExpiry <= 0) {
              handleAuthError('Session has expired');
              return;
            }
          }

          // ── Inactivity check ──────────────────────────
          const idleMs = Date.now() - getLastActivity();
          if (idleMs >= INACTIVITY_TIMEOUT && !warningShownRef.current) {
            startGracePeriod();
          } else if (idleMs < INACTIVITY_TIMEOUT && warningShownRef.current) {
            // User became active again during grace period
            cancelGracePeriod();
          }

          // Sliding refresh when active
          if (idleMs < INACTIVITY_TIMEOUT) {
            silentRefresh();
          }
        }
      } catch (err: any) {
        if (err?.message?.includes('network') || err?.message?.includes('fetch')) {
          // Network issue — don't expire
          toast({ title: 'Connection Issue', description: 'Please check your internet connection', variant: 'destructive' });
        }
      }
    };

    checkSession();
    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [state.isOffline, state.isSessionExpired, handleAuthError, getLastActivity, startGracePeriod, cancelGracePeriod, silentRefresh, toast]);

  // ── Auth state change listener ────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (sessionCheckSuppressed) return;
      if (event === 'SIGNED_OUT' && !state.isSessionExpired) {
        resetSessionState();
        localStorage.removeItem('had_active_session');
      } else if (event === 'TOKEN_REFRESHED') {
        warningShownRef.current = false;
        setState(prev => ({ ...prev, showWarning: false, authError: null }));
      } else if (event === 'SIGNED_IN') {
        resetSessionState();
        localStorage.setItem('had_active_session', 'true');
      }
    });
    return () => subscription.unsubscribe();
  }, [state.isSessionExpired, resetSessionState]);

  // ── Tab visibility ────────────────────────────────────
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.visibilityState !== 'visible') return;
      if (sessionCheckSuppressed || state.isSessionExpired) return;

      // On tab focus, check elapsed idle time
      const idleMs = Date.now() - getLastActivity();
      if (idleMs >= INACTIVITY_TIMEOUT + GRACE_PERIOD) {
        forceLogout();
      } else if (idleMs >= INACTIVITY_TIMEOUT) {
        startGracePeriod();
      } else {
        // User came back quickly — validate session
        if (isOnline()) {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session && localStorage.getItem('had_active_session') === 'true') {
              handleAuthError('Session expired while away');
            }
          } catch { /* ignore */ }
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.isSessionExpired, getLastActivity, forceLogout, startGracePeriod, handleAuthError]);

  // ── Activity event listeners ──────────────────────────
  useEffect(() => {
    const handleActivity = () => {
      if (state.isSessionExpired) return;
      touchActivity();

      // If we're in the grace period and user interacted, cancel it
      if (warningShownRef.current) {
        cancelGracePeriod();
        silentRefresh();
      }
    };

    ACTIVITY_EVENTS.forEach(e => document.addEventListener(e, handleActivity, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach(e => document.removeEventListener(e, handleActivity));
    };
  }, [state.isSessionExpired, touchActivity, cancelGracePeriod, silentRefresh]);

  // ── Cleanup forced logout timer on unmount ────────────
  useEffect(() => {
    return () => {
      if (forcedLogoutTimerRef.current) clearTimeout(forcedLogoutTimerRef.current);
    };
  }, []);

  return {
    ...state,
    dismissExpirationModal,
    resetSessionState,
    extendSession,
    triggerAuthModal: handleAuthError,
  };
};
