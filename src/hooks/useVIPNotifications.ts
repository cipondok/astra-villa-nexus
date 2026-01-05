import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getMembershipConfig, getMembershipFromUserLevel } from '@/types/membership';

export function useVIPNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const previousLevelRef = useRef<string | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch initial level
    const fetchInitialLevel = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_level_id, user_levels(name)')
        .eq('id', user.id)
        .single();

      if (data?.user_levels) {
        const levelName = Array.isArray(data.user_levels) 
          ? data.user_levels[0]?.name 
          : data.user_levels?.name;
        previousLevelRef.current = levelName || null;
      }
      isInitializedRef.current = true;
    };

    fetchInitialLevel();

    // Listen for real-time changes
    const channel = supabase
      .channel('vip-level-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`
        },
        async (payload) => {
          if (!isInitializedRef.current) return;
          
          const newLevelId = payload.new?.user_level_id;
          const oldLevelId = payload.old?.user_level_id;

          // Only process if level changed
          if (newLevelId === oldLevelId) return;

          // Fetch the new level name
          if (newLevelId) {
            const { data: levelData } = await supabase
              .from('user_levels')
              .select('name')
              .eq('id', newLevelId)
              .single();

            const newLevelName = levelData?.name || 'Basic';
            const newMembership = getMembershipFromUserLevel(newLevelName);
            const config = getMembershipConfig(newMembership);
            const prevMembership = getMembershipFromUserLevel(previousLevelRef.current || undefined);
            const prevConfig = getMembershipConfig(prevMembership);

            const isUpgrade = config.priority > prevConfig.priority;

            if (isUpgrade) {
              toast({
                title: `🎉 Upgraded to ${config.label}!`,
                description: `Congratulations! You now have access to ${config.label} benefits.`,
                duration: 6000,
              });
            } else {
              toast({
                title: `VIP Level Changed`,
                description: `Your membership is now ${config.label}.`,
                duration: 5000,
              });
            }

            previousLevelRef.current = newLevelName;
          } else {
            // Level removed
            toast({
              title: `VIP Level Removed`,
              description: `Your VIP membership has been removed.`,
              duration: 5000,
            });
            previousLevelRef.current = null;
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);
}

export default useVIPNotifications;
