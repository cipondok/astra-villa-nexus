
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'offline';

export const useDatabaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('connecting');
        
        // Test database connection
        const { error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);

        if (error) {
          console.error('Database connection error:', error);
          setConnectionStatus('error');
        } else {
          setConnectionStatus('connected');
        }
      } catch (error) {
        console.error('Connection test failed:', error);
        setConnectionStatus('offline');
      } finally {
        setIsLoading(false);
      }
    };

    checkConnection();

    // Set up a periodic connection check
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const retryConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('connecting');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

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
