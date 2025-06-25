
import React, { useEffect } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';

const SessionMonitor: React.FC = () => {
  const { user, extendSession } = useEnhancedAuth();

  useEffect(() => {
    console.log('SessionMonitor mounted, user:', user?.email || 'No user');
    
    if (!user) {
      console.log('No user, skipping session monitoring');
      return;
    }

    // Simple session monitoring without complex logic
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('Page became visible, extending session');
        extendSession().catch(err => {
          console.error('Session extension error:', err);
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, extendSession]);

  return null; // This component doesn't render anything visible
};

export default SessionMonitor;
