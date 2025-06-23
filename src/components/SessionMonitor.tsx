
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useAlert } from '@/contexts/AlertContext';

export const SessionMonitor = () => {
  const { user, signOut } = useAuth();
  const { showWarning, showError } = useAlert();
  const { checkSessionValidity, createSession } = useSessionManager();

  useEffect(() => {
    if (!user) return;

    // Create session when user logs in
    createSession(user.id);

    // Check session validity on mount
    const validateSession = async () => {
      const isValid = await checkSessionValidity();
      if (!isValid) {
        showError(
          "Session Invalid",
          "Your session is no longer valid. Please log in again."
        );
        signOut();
      }
    };

    validateSession();

    // Set up periodic session validation
    const interval = setInterval(validateSession, 5 * 60 * 1000); // Every 5 minutes

    // Set up session timeout warning (25 minutes = 5 minutes before 30-minute timeout)
    const warningTimeout = setTimeout(() => {
      showWarning(
        "Session Expiring Soon",
        "Your session will expire in 5 minutes due to inactivity. Please interact with the page to extend your session."
      );
    }, 25 * 60 * 1000);

    // Auto logout after 30 minutes of inactivity
    let inactivityTimeout = setTimeout(() => {
      showError(
        "Session Expired",
        "You have been logged out due to inactivity."
      );
      signOut();
    }, 30 * 60 * 1000);

    // Reset timeout on user activity
    const resetTimeout = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        showError(
          "Session Expired",
          "You have been logged out due to inactivity."
        );
        signOut();
      }, 30 * 60 * 1000);
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    return () => {
      clearInterval(interval);
      clearTimeout(warningTimeout);
      clearTimeout(inactivityTimeout);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [user, checkSessionValidity, createSession, showError, showWarning, signOut]);

  return null; // This is a monitor component, no UI needed
};
