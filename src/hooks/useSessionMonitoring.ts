
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ActiveSession {
  id: string;
  user_id: string;
  device_fingerprint?: string;
  user_agent?: string;
  expires_at?: string;
  created_at: string;
  session_token: string;
  ip_address?: string;
  is_active?: boolean;
  location_data?: any;
}

export const useSessionMonitoring = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [hasMultipleSessions, setHasMultipleSessions] = useState(false);
  const { toast } = useToast();

  const currentSessionId = useState(() => 
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  )[0];

  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    return `${platform} - ${userAgent.substring(0, 50)}...`;
  };

  const updateSessionActivity = async () => {
    if (!user || !isAuthenticated) return;

    try {
      const deviceInfo = getDeviceInfo();
      const sessionToken = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      // Update current session
      await supabase
        .from('user_sessions')
        .upsert({
          id: currentSessionId,
          user_id: user.id,
          device_fingerprint: deviceInfo,
          user_agent: navigator.userAgent,
          session_token: sessionToken,
          expires_at: expiresAt,
          is_active: true
        });

      // Check for other active sessions (active in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .gte('created_at', fiveMinutesAgo)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error checking sessions:', error);
        return;
      }

      // Transform the data to match our interface
      const transformedSessions: ActiveSession[] = (sessions || []).map(session => ({
        id: session.id,
        user_id: session.user_id,
        device_fingerprint: session.device_fingerprint,
        user_agent: session.user_agent,
        expires_at: session.expires_at,
        created_at: session.created_at,
        session_token: session.session_token,
        ip_address: session.ip_address ? String(session.ip_address) : undefined,
        is_active: session.is_active,
        location_data: session.location_data
      }));

      const otherSessions = transformedSessions.filter(session => session.id !== currentSessionId);
      setActiveSessions(transformedSessions);
      
      if (otherSessions.length > 0 && !hasMultipleSessions) {
        setHasMultipleSessions(true);
        toast({
          title: "Multiple Login Detected",
          description: `You are already logged in on ${otherSessions.length} other device(s). For security, please logout from other devices if this wasn't you.`,
          variant: "destructive",
        });
      } else if (otherSessions.length === 0) {
        setHasMultipleSessions(false);
      }
    } catch (error) {
      console.error('Session monitoring error:', error);
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);
      
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
      
      toast({
        title: "Session Terminated",
        description: "The selected session has been terminated.",
      });
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const cleanupCurrentSession = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', currentSessionId);
    } catch (error) {
      console.error('Error cleaning up session:', error);
    }
  };

  useEffect(() => {
    if (!user || !isAuthenticated) {
      cleanupCurrentSession();
      setActiveSessions([]);
      setHasMultipleSessions(false);
      return;
    }

    // Initial session update
    updateSessionActivity();

    // Update session every 2 minutes
    const interval = setInterval(updateSessionActivity, 2 * 60 * 1000);

    // Cleanup on page unload
    const handleBeforeUnload = () => {
      cleanupCurrentSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cleanupCurrentSession();
    };
  }, [user, isAuthenticated]);

  return {
    activeSessions,
    hasMultipleSessions,
    terminateSession,
    currentSessionId
  };
};
