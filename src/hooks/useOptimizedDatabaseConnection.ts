
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'offline';

export const useOptimizedDatabaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected'); // Start optimistic
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const checkInProgress = useRef(false);

  const quickConnectionTest = async (): Promise<boolean> => {
    if (checkInProgress.current) return true;
    
    try {
      checkInProgress.current = true;
      console.log('🔍 Quick connection test...');
      
      // Very fast query with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const { error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error && error.code !== 'PGRST301') {
        console.error('❌ Connection test failed:', error);
        setConnectionStatus('error');
        return false;
      }

      console.log('✅ Connection test passed');
      setConnectionStatus('connected');
      setLastChecked(new Date());
      return true;
    } catch (error: any) {
      console.error('💥 Connection test error:', error);
      if (error.name === 'AbortError') {
        setConnectionStatus('offline');
      } else {
        setConnectionStatus('error');
      }
      return false;
    } finally {
      checkInProgress.current = false;
    }
  };

  const retryConnection = async () => {
    console.log('🔄 Manual connection retry');
    setIsLoading(true);
    const result = await quickConnectionTest();
    setIsLoading(false);
    return result;
  };

  useEffect(() => {
    console.log('🚀 Starting optimized connection monitoring');
    
    // Quick initial check
    quickConnectionTest();
    
    // Less frequent checks to reduce load
    const interval = setInterval(() => {
      if (connectionStatus === 'connected') {
        quickConnectionTest();
      }
    }, 60000); // Check every minute instead of 15 seconds

    return () => {
      console.log('🛑 Stopping connection monitoring');
      clearInterval(interval);
    };
  }, [connectionStatus]);

  return {
    connectionStatus,
    isLoading,
    retryConnection,
    isConnected: connectionStatus === 'connected',
    lastChecked,
    checkConnection: quickConnectionTest
  };
};
