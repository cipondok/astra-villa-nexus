
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { generateDeviceFingerprint, getDeviceInfo, clearAllCookies } from '@/utils/deviceFingerprint';
import { useAlert } from '@/contexts/AlertContext';

interface SessionData {
  id: string;
  device_fingerprint: string;
  device_info: any;
  login_time: string;
  last_activity: string;
  expires_at: string;
  is_active: boolean;
}

export const useSessionManager = () => {
  const { user } = useAuth();
  const { showError, showWarning } = useAlert();
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null);
  const [otherSessions, setOtherSessions] = useState<SessionData[]>([]);

  // Generate session token
  const generateSessionToken = useCallback(() => {
    return crypto.randomUUID() + '-' + Date.now();
  }, []);

  // Create new session
  const createSession = useCallback(async (userId: string) => {
    try {
      console.log('Creating session for user:', userId);
      const deviceFingerprint = generateDeviceFingerprint();
      const deviceInfo = getDeviceInfo();
      const sessionToken = generateSessionToken();

      // Check for existing sessions
      const { data: existingSessions } = await supabase
        .from('user_device_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true);

      // Only show warning if there are sessions from different devices
      if (existingSessions && existingSessions.length > 0) {
        const differentDevices = existingSessions.filter(
          session => session.device_fingerprint !== deviceFingerprint
        );

        if (differentDevices.length > 0) {
          // Create alert for new device login
          await supabase.rpc('create_login_alert', {
            p_user_id: userId,
            p_alert_type: 'new_device',
            p_device_info: deviceInfo,
            p_message: `New login detected from ${deviceInfo.platform} on ${deviceInfo.userAgent}`
          });

          showWarning(
            "New Device Login",
            "You are already logged in on another device. If this wasn't you, please change your password immediately."
          );
        }
      }

      // Create new session with longer expiry (7 days)
      const { data: newSession, error } = await supabase
        .from('user_device_sessions')
        .insert({
          user_id: userId,
          session_token: sessionToken,
          device_fingerprint: deviceFingerprint,
          device_info: deviceInfo,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating session:', error);
        return;
      }

      setCurrentSession(newSession);
      localStorage.setItem('session_token', sessionToken);
      localStorage.setItem('device_fingerprint', deviceFingerprint);
      console.log('Session created successfully');

    } catch (error) {
      console.error('Error creating session:', error);
    }
  }, [generateSessionToken, showWarning]);

  // Update session activity (less frequent)
  const updateSessionActivity = useCallback(async () => {
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken || !user) return;

    try {
      await supabase
        .from('user_device_sessions')
        .update({ 
          last_activity: new Date().toISOString() 
        })
        .eq('session_token', sessionToken)
        .eq('user_id', user.id);
    } catch (error) {
      console.error('Error updating session activity:', error);
    }
  }, [user]);

  // Check session validity (less aggressive)
  const checkSessionValidity = useCallback(async () => {
    const sessionToken = localStorage.getItem('session_token');
    if (!sessionToken || !user) return true; // Don't fail if no session token yet

    try {
      const { data: session } = await supabase
        .from('user_device_sessions')
        .select('*')
        .eq('session_token', sessionToken)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (!session) {
        console.log('No active session found');
        return false;
      }

      // Check if session is expired (with some grace period)
      const expiryTime = new Date(session.expires_at).getTime();
      const currentTime = new Date().getTime();
      const gracePeriod = 5 * 60 * 1000; // 5 minutes grace period

      if (expiryTime + gracePeriod < currentTime) {
        console.log('Session expired');
        await supabase
          .from('user_device_sessions')
          .update({ is_active: false })
          .eq('id', session.id);

        return false;
      }

      setCurrentSession(session);
      return true;
    } catch (error) {
      console.error('Error checking session validity:', error);
      return true; // Don't fail on error, let user continue
    }
  }, [user]);

  // Terminate session
  const terminateSession = useCallback(async (sessionId?: string) => {
    try {
      const sessionToken = localStorage.getItem('session_token');
      
      if (sessionId) {
        // Terminate specific session
        await supabase
          .from('user_device_sessions')
          .update({ is_active: false })
          .eq('id', sessionId);
      } else if (sessionToken && user) {
        // Terminate current session
        await supabase
          .from('user_device_sessions')
          .update({ is_active: false })
          .eq('session_token', sessionToken)
          .eq('user_id', user.id);
      }

      // Clear local storage and cookies
      clearAllCookies();
      setCurrentSession(null);
      setOtherSessions([]);
      
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  }, [user]);

  // Fetch all user sessions
  const fetchUserSessions = useCallback(async () => {
    if (!user) return;

    try {
      const { data: sessions } = await supabase
        .from('user_device_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_activity', { ascending: false });

      if (sessions) {
        const currentDeviceFingerprint = localStorage.getItem('device_fingerprint');
        const current = sessions.find(s => s.device_fingerprint === currentDeviceFingerprint);
        const others = sessions.filter(s => s.device_fingerprint !== currentDeviceFingerprint);
        
        setCurrentSession(current || null);
        setOtherSessions(others);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }, [user]);

  // Reduced frequency checks - only every 10 minutes and less aggressive
  useEffect(() => {
    if (!user) return;

    // Only check session validity every 10 minutes (not 5)
    const interval = setInterval(() => {
      checkSessionValidity();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [user, checkSessionValidity]);

  // Update activity every 2 minutes when user is active (less frequent)
  useEffect(() => {
    if (!user) return;

    let activityTimeout: NodeJS.Timeout;

    const handleActivity = () => {
      clearTimeout(activityTimeout);
      activityTimeout = setTimeout(() => {
        updateSessionActivity();
      }, 2 * 60 * 1000); // 2 minutes instead of 30 seconds
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearTimeout(activityTimeout);
    };
  }, [user, updateSessionActivity]);

  return {
    currentSession,
    otherSessions,
    createSession,
    terminateSession,
    fetchUserSessions,
    checkSessionValidity,
    updateSessionActivity
  };
};
