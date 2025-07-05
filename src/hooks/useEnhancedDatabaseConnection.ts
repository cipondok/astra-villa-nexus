import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QueryOptions {
  timeout?: number;
  maxRetries?: number;
  retryDelay?: number;
  showErrorToast?: boolean;
}

interface QueryResult<T = any> {
  data: T | null;
  error: any;
  isLoading: boolean;
  retryCount: number;
  duration: number;
}

interface ConnectionHistoryItem {
  timestamp: Date;
  success: boolean;
  duration: number;
  error?: string;
}

type ConnectionStatus = 'connected' | 'connecting' | 'retry' | 'error' | 'offline';

export const useEnhancedDatabaseConnection = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connected');
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [connectionHistory, setConnectionHistory] = useState<ConnectionHistoryItem[]>([]);
  
  const [metrics, setMetrics] = useState({
    totalQueries: 0,
    successfulQueries: 0,
    failedQueries: 0,
    averageResponseTime: 0,
    timeouts: 0,
    retries: 0,
    connectionHistory: [] as ConnectionHistoryItem[],
    consecutiveFailures: 0
  });
  const { toast } = useToast();

  // Update metrics when connection history changes
  useEffect(() => {
    setMetrics(prev => ({
      ...prev,
      connectionHistory,
      consecutiveFailures
    }));
  }, [connectionHistory, consecutiveFailures]);

  const executeWithTimeout = useCallback(async <T>(
    queryFn: () => Promise<T>,
    timeoutMs: number = 10000
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Query timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      queryFn()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeoutId));
    });
  }, []);

  const executeWithRetry = useCallback(async <T>(
    queryFn: () => Promise<T>,
    options: QueryOptions = {}
  ): Promise<QueryResult<T>> => {
    const {
      timeout = 10000,
      maxRetries = 3,
      retryDelay = 1000,
      showErrorToast = true
    } = options;

    let retryCount = 0;
    let lastError: any = null;
    const startTime = Date.now();

    const attemptQuery = async (): Promise<T> => {
      try {
        return await executeWithTimeout(queryFn, timeout);
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a timeout or connection error
        const isRetryableError = 
          error.message.includes('timeout') ||
          error.message.includes('connection') ||
          error.message.includes('network') ||
          error.code === 'PGRST301' || // Connection timeout
          error.code === 'PGRST116' || // Too many connections
          error.code === '08000' ||    // Connection exception
          error.code === '08006';      // Connection failure

        if (isRetryableError && retryCount < maxRetries) {
          retryCount++;
          setMetrics(prev => ({ ...prev, retries: prev.retries + 1 }));
          
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, retryCount - 1);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          console.warn(`Database query retry attempt ${retryCount}/${maxRetries} after ${delay}ms delay`);
          return attemptQuery();
        }

        throw error;
      }
    };

    try {
      setMetrics(prev => ({ ...prev, totalQueries: prev.totalQueries + 1 }));
      
      const result = await attemptQuery();
      const duration = Date.now() - startTime;
      
      // Update success metrics
      setMetrics(prev => ({
        ...prev,
        successfulQueries: prev.successfulQueries + 1,
        averageResponseTime: (prev.averageResponseTime * (prev.successfulQueries - 1) + duration) / prev.successfulQueries
      }));

      setIsConnected(true);

      return {
        data: result,
        error: null,
        isLoading: false,
        retryCount,
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // Update failure metrics
      setMetrics(prev => ({
        ...prev,
        failedQueries: prev.failedQueries + 1,
        timeouts: error.message.includes('timeout') ? prev.timeouts + 1 : prev.timeouts
      }));

      if (error.message.includes('timeout') || error.message.includes('connection')) {
        setIsConnected(false);
      }

      if (showErrorToast) {
        toast({
          title: "Database Connection Issue",
          description: `Query failed after ${retryCount} retries. ${error.message}`,
          variant: "destructive",
        });
      }

      console.error('Enhanced database query failed:', {
        error: error.message,
        retryCount,
        duration,
        options
      });

      return {
        data: null,
        error,
        isLoading: false,
        retryCount,
        duration
      };
    }
  }, [executeWithTimeout, toast]);

  // Enhanced query method for vendor business profiles
  const queryVendorProfiles = useCallback(async (filters: {
    isActive?: boolean;
    isVerified?: boolean;
    businessType?: string;
    limit?: number;
    offset?: number;
  } = {}) => {
    const queryFn = async () => {
      let query = supabase
        .from('vendor_business_profiles')
        .select(`
          id,
          vendor_id,
          business_name,
          business_type,
          business_description,
          is_active,
          is_verified,
          rating,
          total_reviews,
          created_at,
          updated_at,
          logo_url,
          service_areas
        `);

      // Apply filters with optimized indexing
      if (filters.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      
      if (filters.isVerified !== undefined) {
        query = query.eq('is_verified', filters.isVerified);
      }
      
      if (filters.businessType) {
        query = query.eq('business_type', filters.businessType);
      }

      // Use indexed sorting
      query = query.order('rating', { ascending: false });

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    };

    return executeWithRetry(queryFn, {
      timeout: 8000, // Shorter timeout for better UX
      maxRetries: 2,  // Fewer retries for user-facing queries
      retryDelay: 500,
      showErrorToast: true
    });
  }, [executeWithRetry]);

  // Health check method
  const checkConnection = useCallback(async () => {
    const queryFn = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('count')
        .limit(1);
      
      if (error) throw error;
      return data;
    };

    const result = await executeWithRetry(queryFn, {
      timeout: 5000,
      maxRetries: 1,
      showErrorToast: false
    });

    setIsConnected(result.error === null);
    return result;
  }, [executeWithRetry]);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      totalQueries: 0,
      successfulQueries: 0,
      failedQueries: 0,
      averageResponseTime: 0,
      timeouts: 0,
      retries: 0,
      connectionHistory: [],
      consecutiveFailures: 0
    });
    setConnectionHistory([]);
    setConsecutiveFailures(0);
  }, []);

  // Retry connection method
  const retryConnection = useCallback(async () => {
    setIsLoading(true);
    setIsRetrying(true);
    setConnectionStatus('retry');
    
    try {
      console.log('🔄 Retrying database connection...');
      const result = await checkConnection();
      setLastChecked(new Date());
      
      if (result.error === null) {
        setConnectionStatus('connected');
        setConsecutiveFailures(0);
        
        // Add successful connection to history
        const historyItem: ConnectionHistoryItem = {
          timestamp: new Date(),
          success: true,
          duration: result.duration
        };
        setConnectionHistory(prev => [historyItem, ...prev.slice(0, 99)]); // Keep last 100
      } else {
        setConnectionStatus('error');
        setConsecutiveFailures(prev => prev + 1);
        
        // Add failed connection to history
        const historyItem: ConnectionHistoryItem = {
          timestamp: new Date(),
          success: false,
          duration: result.duration,
          error: result.error.message
        };
        setConnectionHistory(prev => [historyItem, ...prev.slice(0, 99)]);
      }
    } catch (error: any) {
      console.error('Connection retry failed:', error);
      setConnectionStatus('offline');
      setConsecutiveFailures(prev => prev + 1);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [checkConnection]);

  // Reset connection method
  const resetConnection = useCallback(() => {
    setIsConnected(true);
    setConnectionStatus('connected');
    setIsLoading(false);
    setIsRetrying(false);
    setConsecutiveFailures(0);
    setConnectionHistory([]);
    setLastChecked(null);
    resetMetrics();
  }, [resetMetrics]);

  // Auto-check connection health periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isLoading && !isRetrying) {
        await checkConnection();
        setLastChecked(new Date());
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkConnection, isLoading, isRetrying]);

  return {
    // Connection state
    isConnected,
    connectionStatus,
    isLoading,
    isRetrying,
    lastChecked,
    consecutiveFailures,
    
    // Methods
    retryConnection,
    resetConnection,
    executeWithRetry,
    queryVendorProfiles,
    checkConnection,
    resetMetrics,
    
    // Metrics
    metrics
  };
};