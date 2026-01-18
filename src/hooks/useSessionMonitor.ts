import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionMonitorState {
  isSessionExpired: boolean;
  showExpirationModal: boolean;
  showWarning: boolean;
}

const SESSION_CHECK_INTERVAL = 30000; // Check every 30 seconds
const WARNING_BEFORE_EXPIRY = 5 * 60 * 1000; // Show warning 5 minutes before expiry

export const useSessionMonitor = () => {
  const [state, setState] = useState<SessionMonitorState>({
    isSessionExpired: false,
    showExpirationModal: false,
    showWarning: false,
  });
  const { toast } = useToast();
  const warningShownRef = useRef(false);
  const lastActivityRef = useRef(Date.now());

  const updateLastActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    localStorage.setItem('last_activity', Date.now().toString());
  }, []);

  const handleSessionExpired = useCallback(() => {
    console.log('Session expired detected');
    setState(prev => ({
      ...prev,
      isSessionExpired: true,
      showExpirationModal: true,
      showWarning: false,
    }));
    warningShownRef.current = false;
  }, []);

  const showExpirationWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      toast({
        title: "Session Expiring Soon",
        description: "Your session will expire in 5 minutes. Please save your work.",
        variant: "destructive",
        duration: 10000,
      });
      setState(prev => ({ ...prev, showWarning: true }));
    }
  }, [toast]);

  const dismissExpirationModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showExpirationModal: false,
    }));
  }, []);

  const resetSessionState = useCallback(() => {
    setState({
      isSessionExpired: false,
      showExpirationModal: false,
      showWarning: false,
    });
    warningShownRef.current = false;
  }, []);

  useEffect(() => {
    let checkInterval: NodeJS.Timeout;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          return;
        }

        // If there was a session before but now there isn't, it expired
        const hadSession = localStorage.getItem('had_active_session') === 'true';
        
        if (!session && hadSession) {
          handleSessionExpired();
          localStorage.removeItem('had_active_session');
          return;
        }

        if (session) {
          localStorage.setItem('had_active_session', 'true');
          
          // Check if session is about to expire
          const expiresAt = session.expires_at;
          if (expiresAt) {
            const expiryTime = expiresAt * 1000; // Convert to milliseconds
            const now = Date.now();
            const timeUntilExpiry = expiryTime - now;

            if (timeUntilExpiry <= 0) {
              handleSessionExpired();
            } else if (timeUntilExpiry <= WARNING_BEFORE_EXPIRY) {
              showExpirationWarning();
            }
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };

    // Initial check
    checkSession();

    // Set up periodic checks
    checkInterval = setInterval(checkSession, SESSION_CHECK_INTERVAL);

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change in session monitor:', event);
      
      if (event === 'SIGNED_OUT') {
        const wasExpired = state.isSessionExpired;
        if (!wasExpired) {
          // User signed out manually, don't show expiration modal
          resetSessionState();
        }
        localStorage.removeItem('had_active_session');
      } else if (event === 'TOKEN_REFRESHED') {
        // Token was refreshed successfully
        warningShownRef.current = false;
        setState(prev => ({ ...prev, showWarning: false }));
      } else if (event === 'SIGNED_IN') {
        resetSessionState();
        localStorage.setItem('had_active_session', 'true');
      }
    });

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      document.addEventListener(event, updateLastActivity, { passive: true });
    });

    return () => {
      clearInterval(checkInterval);
      subscription.unsubscribe();
      activityEvents.forEach(event => {
        document.removeEventListener(event, updateLastActivity);
      });
    };
  }, [handleSessionExpired, showExpirationWarning, resetSessionState, updateLastActivity, state.isSessionExpired]);

  return {
    ...state,
    dismissExpirationModal,
    resetSessionState,
  };
};
