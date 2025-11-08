import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface ActivityLog {
  id: string;
  activity_type: string;
  activity_description: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  location_data?: any;
  created_at: string;
}

export interface LoginAlert {
  id: string;
  alert_type: string;
  message: string;
  device_info?: any;
  ip_address?: string;
  location_data?: any;
  is_read: boolean;
  created_at: string;
}

export const useActivityLogs = () => {
  const { user } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loginAlerts, setLoginAlerts] = useState<LoginAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadActivityLogs();
    }
  }, [user]);

  const loadActivityLogs = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Fetch activity logs
      const { data: activityData, error: activityError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (activityError) throw activityError;

      // Fetch login alerts
      const { data: loginData, error: loginError } = await supabase
        .from('user_login_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (loginError) throw loginError;

      setActivityLogs((activityData || []) as ActivityLog[]);
      setLoginAlerts((loginData || []) as LoginAlert[]);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'profile_update':
        return '👤';
      case 'password_change':
        return '🔐';
      case 'email_change':
        return '📧';
      case 'login':
        return '🔓';
      case 'logout':
        return '🔒';
      case 'settings_update':
        return '⚙️';
      default:
        return '📝';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'new_login':
        return '🔓';
      case 'suspicious_login':
        return '⚠️';
      case 'new_device':
        return '📱';
      default:
        return '🔔';
    }
  };

  return {
    activityLogs,
    loginAlerts,
    isLoading,
    loadActivityLogs,
    getActivityIcon,
    getAlertIcon,
  };
};
