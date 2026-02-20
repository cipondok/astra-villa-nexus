
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
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000);

      const { data, error } = await supabase
        .from('system_settings')
        .select('id')
        .eq('is_public', true)
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      if (error) {
        console.error('❌ Database connection error:', error);
        setConnectionStatus('error');
        return false;
      } else {
        setConnectionStatus('connected');
        setLastChecked(new Date());
        return true;
      }
    } catch (error: any) {
      console.error('💥 Database connection failed:', error);
      
      if (error.name === 'AbortError') {
        setConnectionStatus('offline');
      } else {
        setConnectionStatus('error');
      }
      return false;
    }
  };

  const testRealConnection = async () => {
    try {
      const { data: session, error: sessionError } = await supabase.auth.getSession();

      const { error } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Real connection test failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('💥 Real connection test error:', error);
      return false;
    }
  };

  useEffect(() => {
    const initialCheck = async () => {
      const isReallyConnected = await testRealConnection();
      
      if (isReallyConnected) {
        setConnectionStatus('connected');
        setLastChecked(new Date());
      } else {
        await checkConnection();
      }
    };

    initialCheck();
    
    const interval = setInterval(async () => {
      await checkConnection();
    }, 15000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const retryConnection = async () => {
    setIsLoading(true);
    
    const realConnectionResult = await testRealConnection();
    
    if (realConnectionResult) {
      setConnectionStatus('connected');
      setLastChecked(new Date());
      setIsLoading(false);
      return true;
    }
    
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
    checkConnection: testRealConnection
  };
};
