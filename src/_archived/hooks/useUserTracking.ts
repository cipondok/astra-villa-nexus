
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useUserTracking = () => {
  const { user } = useAuth();

  const trackInteraction = async (interactionType: string, interactionData: any) => {
    if (!user?.id) return;

    try {
      // Use a simple approach to track interactions
      const { error } = await supabase
        .from('profiles')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      // Log the interaction for now (later we'll store in user_interactions table)
      console.log('User interaction tracked:', {
        userId: user.id,
        interactionType,
        interactionData,
        timestamp: new Date().toISOString()
      });

      if (error) {
        console.error('Error updating user activity:', error);
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  return { trackInteraction };
};
