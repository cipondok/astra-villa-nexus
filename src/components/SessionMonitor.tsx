
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const SessionMonitor = () => {
  const { user, signOut, extendSession } = useAuth();
  const { showWarning, showError } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    console.log('SessionMonitor: Setting up session monitoring for user:', user.email);

    // Store login time for session tracking
    if (!localStorage.getItem('login_time')) {
      localStorage.setItem('login_time', Date.now().toString());
    }

    // Much longer session timeout - 2 hours with 10 minute warning
    const warningTimeout = setTimeout(() => {
      showWarning(
        "Session Expiring Soon",
        "Your session will expire in 10 minutes due to inactivity. Click anywhere to extend your session."
      );
      toast.warning("Session expiring in 10 minutes. Stay active to maintain your session.", {
        duration: 60000, // Show for 1 minute
        action: {
          label: "Extend Session",
          onClick: () => {
            extendSession();
            toast.success("Session extended successfully!");
          }
        }
      });
    }, 110 * 60 * 1000); // Warning at 110 minutes (10 minutes before 2-hour timeout)

    // Auto logout after 2 hours of complete inactivity
    let inactivityTimeout = setTimeout(() => {
      console.log('SessionMonitor: Session expired, signing out user');
      showError(
        "Session Expired",
        "You have been logged out due to prolonged inactivity. Please log in again."
      );
      toast.error("Session expired. Redirecting to login...");
      
      // Clear session data
      localStorage.removeItem('login_time');
      localStorage.removeItem('last_activity');
      localStorage.removeItem('session_token');
      localStorage.removeItem('device_fingerprint');
      
      // Sign out and redirect
      signOut().then(() => {
        navigate('/', { replace: true });
      });
    }, 120 * 60 * 1000); // 2 hours

    // Reset timeout on user activity - much more lenient
    const resetTimeout = () => {
      clearTimeout(inactivityTimeout);
      
      // Extend session automatically on activity
      const lastActivity = localStorage.getItem('last_activity');
      const now = Date.now();
      const timeSinceActivity = lastActivity ? now - parseInt(lastActivity) : 0;
      
      // Auto-extend if it's been more than 30 minutes since last activity
      if (timeSinceActivity > 30 * 60 * 1000) {
        extendSession();
      }
      
      localStorage.setItem('last_activity', now.toString());
      
      // Reset the 2-hour timeout
      inactivityTimeout = setTimeout(() => {
        console.log('SessionMonitor: Session expired due to inactivity');
        showError(
          "Session Expired",
          "You have been logged out due to prolonged inactivity. Please log in again."
        );
        toast.error("Session expired. Redirecting to login...");
        
        // Clear session data
        localStorage.removeItem('login_time');
        localStorage.removeItem('last_activity');
        localStorage.removeItem('session_token');
        localStorage.removeItem('device_fingerprint');
        
        // Sign out and redirect
        signOut().then(() => {
          navigate('/', { replace: true });
        });
      }, 120 * 60 * 1000); // 2 hours
    };

    // Listen for user activity - more events for better detection
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'focus', 'blur'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    // Check for session validity less frequently - every 15 minutes
    const sessionCheck = setInterval(() => {
      const lastActivity = localStorage.getItem('last_activity');
      if (lastActivity) {
        const timeSinceActivity = Date.now() - parseInt(lastActivity);
        // Only check session if user has been inactive for more than 1 hour
        if (timeSinceActivity > 60 * 60 * 1000 && user) {
          console.log('SessionMonitor: Checking session validity due to inactivity');
          extendSession(); // Try to extend rather than invalidate
        }
      }
    }, 15 * 60 * 1000); // Check every 15 minutes

    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(inactivityTimeout);
      clearInterval(sessionCheck);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [user, showError, showWarning, signOut, navigate, extendSession]);

  return null; // This is a monitor component, no UI needed
};
