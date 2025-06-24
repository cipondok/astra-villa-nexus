
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'offline';

export const useDatabaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('offline');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Don't block app startup - assume offline initially
    setConnectionStatus('offline');
    
    // Very lightweight background check - only when user interacts
    const checkConnectionLater = () => {
      setTimeout(async () => {
        try {
          setConnectionStatus('connecting');
          
          // Ultra-fast timeout (1 second max)
          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Quick timeout')), 1000);
          });

          const connectionPromise = supabase
            .from('profiles')
            .select('id')
            .limit(1);

          const { error } = await Promise.race([connectionPromise, timeoutPromise]);

          if (error) {
            setConnectionStatus('offline');
          } else {
            setConnectionStatus('connected');
          }
        } catch (error) {
          setConnectionStatus('offline');
        }
      }, 3000); // Wait 3 seconds after app loads before checking
    };

    checkConnectionLater();
  }, []);

  const retryConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 2000);
      });

      const connectionPromise = supabase
        .from('profiles')
        .select('id')
        .limit(1);

      const { error } = await Promise.race([connectionPromise, timeoutPromise]);

      if (error) {
        setConnectionStatus('error');
      } else {
        setConnectionStatus('connected');
      }
    } catch (error) {
      setConnectionStatus('offline');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    connectionStatus,
    isLoading,
    retryConnection,
    isConnected: connectionStatus === 'connected'
  };
};
