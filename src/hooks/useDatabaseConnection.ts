
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'offline';

export const useDatabaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    console.log('🔍 Checking database connection...');
    try {
      setConnectionStatus('connecting');
      
      // Test with a simple, fast query with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Connection check timed out');
        controller.abort();
      }, 5000); // Increased timeout to 5 seconds

      // Try to run a simple query that should always work - just test the connection
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
        console.log('✅ Database connection successful');
        setConnectionStatus('connected');
        setLastChecked(new Date());
        return true;
      }
    } catch (error: any) {
      console.error('💥 Database connection failed:', error);
      
      // Check if it's an abort error (timeout)
      if (error.name === 'AbortError') {
        setConnectionStatus('offline');
      } else {
        setConnectionStatus('error');
      }
      return false;
    }
  };

  // Test connection with a more reliable method
  const testRealConnection = async () => {
    try {
      console.log('🧪 Testing real database connection...');
      
      // Try to get the current session first
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.log('⚠️ Session error, but trying database anyway:', sessionError);
      }

      // Try a simple database operation that doesn't require authentication
      const { error } = await supabase
        .from('system_settings')
        .select('id')
        .limit(1);

      if (error) {
        console.error('❌ Real connection test failed:', error);
        return false;
      }

      console.log('✅ Real connection test passed');
      return true;
    } catch (error) {
      console.error('💥 Real connection test error:', error);
      return false;
    }
  };

  useEffect(() => {
    console.log('🚀 Starting database connection monitoring');
    
    // Initial connection check with real test
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
    
    // Set up periodic connection checking every 15 seconds for more responsive updates
    const interval = setInterval(async () => {
      console.log('⏱️ Periodic connection check');
      await checkConnection();
    }, 15000);

    return () => {
      console.log('🛑 Stopping database connection monitoring');
      clearInterval(interval);
    };
  }, []);

  const retryConnection = async () => {
    console.log('🔄 Manual connection retry requested');
    setIsLoading(true);
    
    // First try the real connection test
    const realConnectionResult = await testRealConnection();
    
    if (realConnectionResult) {
      setConnectionStatus('connected');
      setLastChecked(new Date());
      setIsLoading(false);
      return true;
    }
    
    // If real test fails, try the regular check
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
