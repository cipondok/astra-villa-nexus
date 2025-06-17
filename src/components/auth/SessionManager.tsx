
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface SessionManagerProps {
  children: React.ReactNode;
}

export const SessionManager = ({ children }: SessionManagerProps) => {
  const { user, signOut } = useAuth();

  useEffect(() => {
    // Check for remember me token expiry
    const checkRememberToken = () => {
      const remembered = localStorage.getItem('remember_token');
      if (remembered) {
        const data = JSON.parse(remembered);
        if (new Date(data.expires) <= new Date()) {
          localStorage.removeItem('remember_token');
          localStorage.removeItem('device_fingerprint');
        }
      }
    };

    // Session timeout (30 minutes of inactivity)
    let timeoutId: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (user) {
          signOut();
          alert('Session expired due to inactivity');
        }
      }, 30 * 60 * 1000); // 30 minutes
    };

    const handleActivity = () => {
      if (user) {
        resetTimeout();
      }
    };

    // Monitor user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial setup
    checkRememberToken();
    if (user) {
      resetTimeout();
    }

    // Check remember token every minute
    const intervalId = setInterval(checkRememberToken, 60000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, signOut]);

  return <>{children}</>;
};
