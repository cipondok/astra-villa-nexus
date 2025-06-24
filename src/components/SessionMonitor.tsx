
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAlert } from '@/contexts/AlertContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const SessionMonitor = () => {
  const { user, signOut } = useAuth();
  const { showWarning, showError } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    console.log('SessionMonitor: Setting up session monitoring for user:', user.email);

    // Store login time for session tracking
    if (!localStorage.getItem('login_time')) {
      localStorage.setItem('login_time', Date.now().toString());
    }

    // Session timeout warning (25 minutes = 5 minutes before 30-minute timeout)
    const warningTimeout = setTimeout(() => {
      showWarning(
        "Session Expiring Soon",
        "Your session will expire in 5 minutes due to inactivity. Please interact with the page to extend your session."
      );
      toast.warning("Session expiring in 5 minutes. Stay active to maintain your session.");
    }, 25 * 60 * 1000);

    // Auto logout after 30 minutes of inactivity
    let inactivityTimeout = setTimeout(() => {
      console.log('SessionMonitor: Session expired, signing out user');
      showError(
        "Session Expired",
        "You have been logged out due to inactivity. Please log in again."
      );
      toast.error("Session expired. Redirecting to login...");
      
      // Clear session data
      localStorage.removeItem('login_time');
      localStorage.removeItem('session_token');
      localStorage.removeItem('device_fingerprint');
      
      // Sign out and redirect
      signOut().then(() => {
        navigate('/', { replace: true });
      });
    }, 30 * 60 * 1000);

    // Reset timeout on user activity
    const resetTimeout = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        console.log('SessionMonitor: Session expired due to inactivity');
        showError(
          "Session Expired",
          "You have been logged out due to inactivity. Please log in again."
        );
        toast.error("Session expired. Redirecting to login...");
        
        // Clear session data
        localStorage.removeItem('login_time');
        localStorage.removeItem('session_token');
        localStorage.removeItem('device_fingerprint');
        
        // Sign out and redirect
        signOut().then(() => {
          navigate('/', { replace: true });
        });
      }, 30 * 60 * 1000);
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout, true);
    });

    // Check for session validity periodically
    const sessionCheck = setInterval(() => {
      const sessionToken = localStorage.getItem('session_token');
      if (!sessionToken && user) {
        console.log('SessionMonitor: No session token found, signing out');
        toast.error("Session invalid. Please log in again.");
        
        signOut().then(() => {
          navigate('/', { replace: true });
        });
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(inactivityTimeout);
      clearInterval(sessionCheck);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout, true);
      });
    };
  }, [user, showError, showWarning, signOut, navigate]);

  return null; // This is a monitor component, no UI needed
};
