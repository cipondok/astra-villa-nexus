
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
        
        // Handle each table type explicitly to avoid TypeScript conflicts
        if (operation.table === 'properties') {
          switch (operation.type) {
            case 'insert':
              result = await supabase.from('properties').insert(operation.data);
              break;
            case 'update':
              result = await supabase.from('properties')
                .update(operation.data)
                .eq('id', operation.data.id);
              break;
            case 'delete':
              result = await supabase.from('properties')
                .delete()
                .eq('id', operation.data.id);
              break;
          }
        } else if (operation.table === 'profiles') {
          switch (operation.type) {
            case 'insert':
              result = await supabase.from('profiles').insert(operation.data);
              break;
            case 'update':
              result = await supabase.from('profiles')
                .update(operation.data)
                .eq('id', operation.data.id);
              break;
            case 'delete':
              result = await supabase.from('profiles')
                .delete()
                .eq('id', operation.data.id);
              break;
          }
        } else {
          // For other tables, use the any type assertion as fallback
          const supabaseAny = supabase as any;
          switch (operation.type) {
            case 'insert':
              result = await supabaseAny.from(operation.table).insert(operation.data);
              break;
            case 'update':
              result = await supabaseAny.from(operation.table)
                .update(operation.data)
                .eq('id', operation.data.id);
              break;
            case 'delete':
              result = await supabaseAny.from(operation.table)
                .delete()
                .eq('id', operation.data.id);
              break;
          }
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

  // Simplified query function for known tables
  const getCachedProperties = useCallback(() => {
    return offlineData.properties;
  }, [offlineData.properties]);

  const getCachedProfiles = useCallback(() => {
    return offlineData.profiles;
  }, [offlineData.profiles]);

  return {
    isOnline,
    offlineData,
    queuedOperations: queuedOperations.length,
    cacheData,
    queueOperation,
    syncQueuedOperations,
    getCachedProperties,
    getCachedProfiles
  };
};
