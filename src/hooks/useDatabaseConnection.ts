
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'offline';

export const useDatabaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Test with a simple, fast query with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error('Database connection error:', error);
        setConnectionStatus('error');
        return false;
      } else {
        setConnectionStatus('connected');
        setLastChecked(new Date());
        return true;
      }
    } catch (error) {
      console.error('Database connection failed:', error);
      setConnectionStatus('offline');
      return false;
    }
  };

  useEffect(() => {
    // Initial connection check
    checkConnection();
    
    // Set up periodic connection checking every 30 seconds
    const interval = setInterval(() => {
      checkConnection();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const retryConnection = async () => {
    setIsLoading(true);
    const result = await checkConnection();
    setIsLoading(false);
    return result;
  };

  return {
    connectionStatus,
    isLoading,
    retryConnection,
    isConnected: connectionStatus === 'connected',
    lastChecked,
    checkConnection
  };
};
