
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OfflineData {
  properties: any[];
  profiles: any[];
  lastSync: Date | null;
}

interface QueuedOperation {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: Date;
}

export const useOfflineSupport = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    properties: [],
    profiles: [],
    lastSync: null
  });
  const [queuedOperations, setQueuedOperations] = useState<QueuedOperation[]>([]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Back online, syncing queued operations...');
      setIsOnline(true);
      syncQueuedOperations();
    };

    const handleOffline = () => {
      console.log('📵 Gone offline, enabling offline mode...');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cache critical data when online
  const cacheData = useCallback(async () => {
    try {
      console.log('💾 Caching data for offline use...');
      
      // Cache recent properties
      const { data: properties } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      // Cache user profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .limit(100);

      const cachedData = {
        properties: properties || [],
        profiles: profiles || [],
        lastSync: new Date()
      };

      setOfflineData(cachedData);
      localStorage.setItem('supabase_offline_cache', JSON.stringify(cachedData));
      
      console.log('💾 Data cached successfully');
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, []);

  // Load cached data from localStorage
  useEffect(() => {
    const cached = localStorage.getItem('supabase_offline_cache');
    if (cached) {
      try {
        const parsedData = JSON.parse(cached);
        setOfflineData({
          ...parsedData,
          lastSync: parsedData.lastSync ? new Date(parsedData.lastSync) : null
        });
      } catch (error) {
        console.error('Failed to parse cached data:', error);
      }
    }

    const queuedOps = localStorage.getItem('supabase_queued_operations');
    if (queuedOps) {
      try {
        const parsedOps = JSON.parse(queuedOps);
        setQueuedOperations(parsedOps.map((op: any) => ({
          ...op,
          timestamp: new Date(op.timestamp)
        })));
      } catch (error) {
        console.error('Failed to parse queued operations:', error);
      }
    }
  }, []);

  // Queue operations when offline
  const queueOperation = useCallback((
    type: 'insert' | 'update' | 'delete',
    table: string,
    data: any
  ) => {
    const operation: QueuedOperation = {
      id: crypto.randomUUID(),
      type,
      table,
      data,
      timestamp: new Date()
    };

    setQueuedOperations(prev => {
      const updated = [...prev, operation];
      localStorage.setItem('supabase_queued_operations', JSON.stringify(updated));
      return updated;
    });

    console.log(`📝 Queued ${type} operation for ${table}:`, data);
  }, []);

  // Sync queued operations when back online
  const syncQueuedOperations = useCallback(async () => {
    if (!isOnline || queuedOperations.length === 0) return;

    console.log(`🔄 Syncing ${queuedOperations.length} queued operations...`);
    const successfulOps: string[] = [];

    for (const operation of queuedOperations) {
      try {
        let result;
        
        switch (operation.type) {
          case 'insert':
            result = await supabase.from(operation.table).insert(operation.data);
            break;
          case 'update':
            result = await supabase.from(operation.table)
              .update(operation.data)
              .eq('id', operation.data.id);
            break;
          case 'delete':
            result = await supabase.from(operation.table)
              .delete()
              .eq('id', operation.data.id);
            break;
        }

        if (result?.error) {
          console.error(`Failed to sync ${operation.type} for ${operation.table}:`, result.error);
        } else {
          successfulOps.push(operation.id);
          console.log(`✅ Synced ${operation.type} for ${operation.table}`);
        }
      } catch (error) {
        console.error(`Failed to sync operation ${operation.id}:`, error);
      }
    }

    // Remove successful operations from queue
    setQueuedOperations(prev => {
      const remaining = prev.filter(op => !successfulOps.includes(op.id));
      localStorage.setItem('supabase_queued_operations', JSON.stringify(remaining));
      return remaining;
    });

    // Refresh cache after sync
    if (successfulOps.length > 0) {
      await cacheData();
    }
  }, [isOnline, queuedOperations, cacheData]);

  // Enhanced query function with offline support
  const offlineQuery = useCallback(async (
    table: string,
    options: {
      select?: string;
      filters?: Record<string, any>;
      limit?: number;
    } = {}
  ) => {
    if (isOnline) {
      try {
        let query = supabase.from(table).select(options.select || '*');
        
        if (options.filters) {
          Object.entries(options.filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        
        if (options.limit) {
          query = query.limit(options.limit);
        }

        const result = await query;
        return result;
      } catch (error) {
        console.warn('Online query failed, falling back to cache:', error);
      }
    }

    // Fallback to cached data
    console.log('📱 Using cached data for offline query');
    const cachedTableData = offlineData[table as keyof OfflineData];
    
    if (Array.isArray(cachedTableData)) {
      let filteredData = cachedTableData;
      
      if (options.filters) {
        filteredData = cachedTableData.filter(item => {
          return Object.entries(options.filters!).every(([key, value]) => 
            item[key] === value
          );
        });
      }
      
      if (options.limit) {
        filteredData = filteredData.slice(0, options.limit);
      }

      return { data: filteredData, error: null };
    }

    return { data: null, error: new Error('No cached data available') };
  }, [isOnline, offlineData]);

  return {
    isOnline,
    offlineData,
    queuedOperations: queuedOperations.length,
    cacheData,
    queueOperation,
    syncQueuedOperations,
    offlineQuery
  };
};
