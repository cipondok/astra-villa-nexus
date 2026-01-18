import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useAuthNotifications = () => {
  const hasShownWelcomeRef = useRef(false);
  const lastEventRef = useRef<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Prevent duplicate notifications
        if (lastEventRef.current === event) return;
        lastEventRef.current = event;

        if (event === 'SIGNED_IN' && session?.user && !hasShownWelcomeRef.current) {
          hasShownWelcomeRef.current = true;
          
          // Get user name from metadata or email
          const userName = session.user.user_metadata?.full_name || 
                          session.user.email?.split('@')[0] || 
                          'User';
          
          // Small delay to ensure UI is ready
          setTimeout(() => {
            toast({
              title: "Welcome back! 👋",
              description: `Good to see you again, ${userName}`,
              variant: "success",
              duration: 4000,
            });
          }, 500);
        }

        if (event === 'SIGNED_OUT') {
          hasShownWelcomeRef.current = false;
          
          toast({
            title: "Signed out successfully",
            description: "You have been logged out. See you next time!",
            variant: "info",
            duration: 3000,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);
};
