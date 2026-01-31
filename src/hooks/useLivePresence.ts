import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PresenceUser {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  online_at: string;
  current_page?: string;
  role?: string;
  device?: string;
}

export interface PresenceState {
  [key: string]: PresenceUser[];
}

export const useLivePresence = (channelName: string = 'live_monitoring') => {
  const { user } = useAuth();
  const [presenceState, setPresenceState] = useState<PresenceState>({});
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [recentJoins, setRecentJoins] = useState<PresenceUser[]>([]);
  const [recentLeaves, setRecentLeaves] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel(channelName);

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        setPresenceState(newState as unknown as PresenceState);
        
        // Flatten the presence state to get all online users
        const users = Object.values(newState).flat() as unknown as PresenceUser[];
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        setRecentJoins(prev => [...(newPresences as unknown as PresenceUser[]), ...prev].slice(0, 10));
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        setRecentLeaves(prev => [...(leftPresences as unknown as PresenceUser[]), ...prev].slice(0, 10));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          
          // Get user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();

          // Track this user's presence
          await channel.track({
            id: user.id,
            email: user.email,
            full_name: profile?.full_name || user.email?.split('@')[0],
            avatar_url: profile?.avatar_url,
            online_at: new Date().toISOString(),
            current_page: window.location.pathname,
            role: 'user',
            device: getDeviceType(),
          });
        } else {
          setIsConnected(false);
        }
      });

    // Update current page when it changes
    const handleVisibilityChange = () => {
      if (!document.hidden && isConnected) {
        channel.track({
          id: user.id,
          email: user.email,
          online_at: new Date().toISOString(),
          current_page: window.location.pathname,
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
    };
  }, [user, channelName]);

  const updateCurrentPage = useCallback(async (page: string) => {
    if (!user || !isConnected) return;
    
    const channel = supabase.channel(channelName);
    await channel.track({
      id: user.id,
      email: user.email,
      online_at: new Date().toISOString(),
      current_page: page,
    });
  }, [user, isConnected, channelName]);

  return {
    presenceState,
    onlineUsers,
    isConnected,
    recentJoins,
    recentLeaves,
    updateCurrentPage,
    totalOnline: onlineUsers.length,
  };
};

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export default useLivePresence;
