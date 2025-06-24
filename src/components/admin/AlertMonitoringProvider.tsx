
import React from 'react';
import { useRealTimeAlerts } from '@/hooks/useRealTimeAlerts';
import { useAuth } from '@/contexts/AuthContext';

interface AlertMonitoringProviderProps {
  children: React.ReactNode;
}

const AlertMonitoringProvider: React.FC<AlertMonitoringProviderProps> = ({ children }) => {
  const { profile } = useAuth();
  const { isMonitoring } = useRealTimeAlerts();

  React.useEffect(() => {
    if (profile?.role === 'admin' && isMonitoring) {
      console.log('🚨 Real-time alert monitoring is now active');
    }
  }, [profile?.role, isMonitoring]);

  return (
    <>
      {children}
      {profile?.role === 'admin' && isMonitoring && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Real-time monitoring active
          </div>
        </div>
      )}
    </>
  );
};

export default AlertMonitoringProvider;
