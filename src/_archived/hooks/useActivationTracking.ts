/**
 * Activation Milestone Integration
 * 
 * Drop-in hook that listens to user interactions and automatically
 * records activation milestones without modifying existing hooks.
 */
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useActivationMilestones } from '@/hooks/useActivationMilestones';
import { supabase } from '@/integrations/supabase/client';

export function useActivationTracking() {
  const { user } = useAuth();
  const { completeMilestone, activationProgress } = useActivationMilestones();
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!user?.id || activationProgress.isActivated || subscribedRef.current) return;
    subscribedRef.current = true;

    // Listen to user_interactions inserts for this user
    const channel = supabase
      .channel('activation-tracker')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_interactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const interaction = payload.new as { interaction_type: string; interaction_data: any };
          
          switch (interaction.interaction_type) {
            case 'search':
              if (!activationProgress.milestones.first_search) {
                completeMilestone('first_search', { source: 'realtime' });
              }
              break;
            case 'save':
              if (!activationProgress.milestones.first_save) {
                completeMilestone('first_save', { source: 'realtime' });
              }
              break;
            case 'contact':
              if (!activationProgress.milestones.first_inquiry) {
                completeMilestone('first_inquiry', { source: 'realtime' });
              }
              break;
          }
        }
      )
      .subscribe();

    return () => {
      subscribedRef.current = false;
      supabase.removeChannel(channel);
    };
  }, [user?.id, activationProgress.isActivated]);

  // Also provide manual trigger for insight views (not tracked via user_interactions)
  return { completeMilestone, activationProgress };
}
