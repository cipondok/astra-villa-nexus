
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'offline';

export const useDatabaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('connecting');
        
        // Quick timeout for connection test (3 seconds max)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Connection timeout')), 3000);
        });

        const connectionPromise = supabase
          .from('profiles')
          .select('id')
          .limit(1);

        const { error } = await Promise.race([connectionPromise, timeoutPromise]);

        if (error) {
          console.warn('Database connection warning:', error);
          setConnectionStatus('error');
        } else {
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.warn('Connection test failed, continuing anyway:', error);
        setConnectionStatus('offline');
      } finally {
        setIsLoading(false);
      }
    };

    // Don't block initial load - check connection in background
    checkConnection();

    // Set up a periodic connection check (every 60 seconds instead of 30)
    const interval = setInterval(checkConnection, 60000);

    return () => clearInterval(interval);
  }, []);

  const retryConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 3000);
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
