
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'offline' | 'retry';

interface ConnectionMetrics {
  lastSuccessfulPing: Date | null;
  consecutiveFailures: number;
  totalFailures: number;
  averageResponseTime: number;
  connectionHistory: { timestamp: Date; success: boolean; responseTime?: number }[];
}

export const useEnhancedDatabaseConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [isLoading, setIsLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    lastSuccessfulPing: null,
    consecutiveFailures: 0,
    totalFailures: 0,
    averageResponseTime: 0,
    connectionHistory: []
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const checkIntervalRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef(0);

  // Enhanced connection test that doesn't require auth
  const performConnectionTest = async (): Promise<{ success: boolean; responseTime: number; error?: string }> => {
    const startTime = Date.now();
    
    try {
      console.log('🔍 Testing database connection...');
      
      // Use a simple query that doesn't require authentication
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Connection test timed out');
        controller.abort();
      }, 10000); // 10 second timeout

      // Try to get Supabase version - this should work without auth
      const { data, error } = await supabase
        .from('system_settings')
        .select('count')
        .limit(1)
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      if (error) {
        // Check if it's an auth error vs network error
        if (error.code === 'PGRST301' || error.message.includes('JWT')) {
          // Auth error but connection is working
          console.log('✅ Database connected (auth required for data)');
          return { success: true, responseTime };
        } else {
          console.error('❌ Database connection error:', error);
          return { success: false, responseTime, error: error.message };
        }
      }

      console.log('✅ Database connection successful');
      return { success: true, responseTime };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error('💥 Database connection failed:', error);
      
      if (error.name === 'AbortError') {
        return { success: false, responseTime, error: 'Connection timeout' };
      }
      
      return { success: false, responseTime, error: error.message || 'Unknown error' };
    }
  };

  const updateMetrics = (success: boolean, responseTime?: number) => {
    setMetrics(prev => {
      const newHistory = [...prev.connectionHistory, {
        timestamp: new Date(),
        success,
        responseTime
      }].slice(-50); // Keep last 50 checks

      const successfulPings = newHistory.filter(h => h.success && h.responseTime);
      const avgResponseTime = successfulPings.length > 0 
        ? successfulPings.reduce((sum, h) => sum + (h.responseTime || 0), 0) / successfulPings.length
        : 0;

      return {
        lastSuccessfulPing: success ? new Date() : prev.lastSuccessfulPing,
        consecutiveFailures: success ? 0 : prev.consecutiveFailures + 1,
        totalFailures: success ? prev.totalFailures : prev.totalFailures + 1,
        averageResponseTime: avgResponseTime,
        connectionHistory: newHistory
      };
    });
  };

  const scheduleRetry = (retryCount: number) => {
    // Exponential backoff: 2^retryCount seconds, max 60 seconds
    const delay = Math.min(Math.pow(2, retryCount) * 1000, 60000);
    console.log(`⏰ Scheduling retry in ${delay / 1000} seconds`);
    
    setConnectionStatus('retry');
    
    retryTimeoutRef.current = setTimeout(async () => {
      await checkConnection();
    }, delay);
  };

  const checkConnection = async () => {
    console.log('🔄 Checking database connection...');
    setIsLoading(true);
    
    const result = await performConnectionTest();
    updateMetrics(result.success, result.responseTime);
    setLastChecked(new Date());
    
    if (result.success) {
      console.log('✅ Connection successful');
      setConnectionStatus('connected');
      retryCountRef.current = 0;
    } else {
      console.error('❌ Connection failed:', result.error);
      retryCountRef.current += 1;
      
      if (retryCountRef.current <= 5) {
        setConnectionStatus('error');
        scheduleRetry(retryCountRef.current);
      } else {
        setConnectionStatus('offline');
      }
    }
    
    setIsLoading(false);
  };

  const retryConnection = async () => {
    console.log('🔄 Manual connection retry requested');
    retryCountRef.current = 0;
    
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    await checkConnection();
  };

  const resetConnection = () => {
    console.log('🔄 Resetting connection state');
    retryCountRef.current = 0;
    setConnectionStatus('connecting');
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    checkConnection();
  };

  useEffect(() => {
    console.log('🚀 Starting enhanced database connection monitoring');
    
    // Initial connection check
    checkConnection();
    
    // Set up periodic connection checking every 30 seconds
    checkIntervalRef.current = setInterval(() => {
      if (connectionStatus === 'connected') {
        console.log('⏱️ Periodic connection health check');
        checkConnection();
      }
    }, 30000);

    return () => {
      console.log('🛑 Stopping database connection monitoring');
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Reset retry count when connection becomes successful
  useEffect(() => {
    if (connectionStatus === 'connected') {
      retryCountRef.current = 0;
    }
  }, [connectionStatus]);

  return {
    connectionStatus,
    isLoading,
    retryConnection,
    resetConnection,
    isConnected: connectionStatus === 'connected',
    lastChecked,
    metrics,
    checkConnection,
    isRetrying: connectionStatus === 'retry'
  };
};
