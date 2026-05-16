
import React, { useEffect, useCallback } from 'react';
import { useRealTimeAlerts } from '@/hooks/useRealTimeAlerts';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AlertMonitoringProviderProps {
  children: React.ReactNode;
}

const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
};

const showBrowserNotification = (title: string, message: string, priority: string) => {
  if (Notification.permission !== 'granted') return;
  const icon = priority === 'critical' ? '🚨' : '⚠️';
  new Notification(`${icon} ${title}`, {
    body: message.substring(0, 200),
    icon: '/favicon.ico',
    tag: `admin-alert-${Date.now()}`,
    requireInteraction: priority === 'critical',
  });
};

const AlertMonitoringProvider: React.FC<AlertMonitoringProviderProps> = ({ children }) => {
  const { profile } = useAuth();
  const { isMonitoring } = useRealTimeAlerts();

  // Request notification permission when admin starts monitoring
  useEffect(() => {
    if (profile?.role === 'admin' && isMonitoring) {
      console.log('🚨 Real-time alert monitoring is now active');
      requestNotificationPermission();
    }
  }, [profile?.role, isMonitoring]);

  // Listen for critical/high priority alerts via realtime and show browser notifications
  useEffect(() => {
    if (profile?.role !== 'admin' || !isMonitoring) return;

    const channel = supabase
      .channel('critical-alerts-browser-notify')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_alerts',
        },
        (payload) => {
          const alert = payload.new as any;
          if (alert.priority === 'critical' || alert.priority === 'high') {
            showBrowserNotification(alert.title, alert.message, alert.priority);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.role, isMonitoring]);

  return (
    <>
      {children}
      {profile?.role === 'admin' && isMonitoring && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-chart-1 text-background px-3 py-1 rounded-full text-xs flex items-center gap-2">
            <div className="w-2 h-2 bg-background rounded-full animate-pulse" />
            Real-time monitoring active
          </div>
        </div>
      )}
    </>
  );
};

export default AlertMonitoringProvider;
