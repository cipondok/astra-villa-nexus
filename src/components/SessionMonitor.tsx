
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';

export const SessionMonitor = () => {
  const { user, signOut } = useAuth();
  const { showWarning, showError } = useAlert();

  useEffect(() => {
    if (!user) return;

    console.log('SessionMonitor: Setting up session monitoring for user:', user.email);

    // Session timeout warning (25 minutes = 5 minutes before 30-minute timeout)
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
      clearTimeout(warningTimeout);
      clearTimeout(inactivityTimeout);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [user, showError, showWarning, signOut]);

  return null; // This is a monitor component, no UI needed
};
