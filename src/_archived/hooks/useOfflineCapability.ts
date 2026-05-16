import { useState, useEffect, useCallback } from 'react';

/**
 * Offline Capability Hook
 * Provides comprehensive offline support for mobile-first experience:
 * - Network status monitoring
 * - Data caching with IndexedDB
 * - Background sync queue
 * - Offline-first data strategy
 */

interface CachedData<T> {
  data: T;
  timestamp: number;
  expiry?: number;
}

interface SyncQueueItem {
  id: string;
  action: string;
  payload: any;
  timestamp: number;
  retries: number;
}

const DB_NAME = 'astra_offline_db';
const DB_VERSION = 1;
const CACHE_STORE = 'cache';
const SYNC_STORE = 'sync_queue';

export const useOfflineCapability = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPending, setIsPending] = useState(false);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processSyncQueue();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize IndexedDB
  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(CACHE_STORE)) {
          db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
        }
        
        if (!db.objectStoreNames.contains(SYNC_STORE)) {
          const syncStore = db.createObjectStore(SYNC_STORE, { keyPath: 'id' });
          syncStore.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }, []);

  // Cache data for offline access
  const cacheData = useCallback(async <T>(
    key: string,
    data: T,
    expiryMs?: number
  ): Promise<void> => {
    try {
      const db = await openDB();
      const tx = db.transaction(CACHE_STORE, 'readwrite');
      const store = tx.objectStore(CACHE_STORE);

      const cacheEntry: CachedData<T> & { key: string } = {
        key,
        data,
        timestamp: Date.now(),
        expiry: expiryMs ? Date.now() + expiryMs : undefined,
      };

      store.put(cacheEntry);
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
      });
    } catch (error) {
      console.error('Failed to cache data:', error);
    }
  }, [openDB]);

  // Retrieve cached data
  const getCachedData = useCallback(async <T>(key: string): Promise<T | null> => {
    try {
      const db = await openDB();
      const tx = db.transaction(CACHE_STORE, 'readonly');
      const store = tx.objectStore(CACHE_STORE);

      const request = store.get(key);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const entry = request.result as (CachedData<T> & { key: string }) | undefined;
          
          if (!entry) {
            resolve(null);
            return;
          }

          // Check expiry
          if (entry.expiry && Date.now() > entry.expiry) {
            resolve(null);
            return;
          }

          resolve(entry.data);
        };
        request.onerror = () => resolve(null);
      });
    } catch (error) {
      console.error('Failed to get cached data:', error);
      return null;
    }
  }, [openDB]);

  // Add action to sync queue for later execution
  const queueSync = useCallback(async (
    action: string,
    payload: any
  ): Promise<string> => {
    const id = `${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const db = await openDB();
      const tx = db.transaction(SYNC_STORE, 'readwrite');
      const store = tx.objectStore(SYNC_STORE);

      const queueItem: SyncQueueItem = {
        id,
        action,
        payload,
        timestamp: Date.now(),
        retries: 0,
      };

      store.add(queueItem);
      
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
      });

      setSyncQueue(prev => [...prev, queueItem]);
      
      // Try to sync immediately if online
      if (navigator.onLine) {
        processSyncQueue();
      }

      return id;
    } catch (error) {
      console.error('Failed to queue sync:', error);
      throw error;
    }
  }, [openDB]);

  // Process pending sync queue
  const processSyncQueue = useCallback(async () => {
    if (!navigator.onLine || isPending) return;
    
    setIsPending(true);

    try {
      const db = await openDB();
      const tx = db.transaction(SYNC_STORE, 'readonly');
      const store = tx.objectStore(SYNC_STORE);
      const request = store.getAll();

      request.onsuccess = async () => {
        const items: SyncQueueItem[] = request.result;
        
        for (const item of items) {
          try {
            // Process based on action type
            await processSyncItem(item);
            
            // Remove from queue on success
            const deleteTx = db.transaction(SYNC_STORE, 'readwrite');
            deleteTx.objectStore(SYNC_STORE).delete(item.id);
            
            setSyncQueue(prev => prev.filter(q => q.id !== item.id));
          } catch (error) {
            console.error('Failed to sync item:', item.id, error);
            
            // Update retry count
            if (item.retries < 3) {
              const updateTx = db.transaction(SYNC_STORE, 'readwrite');
              updateTx.objectStore(SYNC_STORE).put({ ...item, retries: item.retries + 1 });
            }
          }
        }
      };
    } catch (error) {
      console.error('Failed to process sync queue:', error);
    } finally {
      setIsPending(false);
    }
  }, [isPending, openDB]);

  // Process individual sync item (extend based on your needs)
  const processSyncItem = async (item: SyncQueueItem): Promise<void> => {
    const { action, payload } = item;
    
    // Add your sync logic here based on action type
    switch (action) {
      case 'save_property':
        // Sync property save to server
        break;
      case 'update_favorite':
        // Sync favorite toggle
        break;
      case 'submit_inquiry':
        // Sync inquiry submission
        break;
      default:
        console.warn('Unknown sync action:', action);
    }
  };

  // Offline-first fetch with cache fallback
  const fetchWithCache = useCallback(async <T>(
    url: string,
    cacheKey: string,
    options?: RequestInit,
    cacheExpiryMs: number = 5 * 60 * 1000 // 5 min default
  ): Promise<T> => {
    // Try to get from cache first
    const cached = await getCachedData<T>(cacheKey);
    
    if (!navigator.onLine) {
      if (cached) return cached;
      throw new Error('Offline and no cached data available');
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      // Cache the fresh data
      await cacheData(cacheKey, data, cacheExpiryMs);
      
      return data;
    } catch (error) {
      // Fall back to cache on error
      if (cached) return cached;
      throw error;
    }
  }, [getCachedData, cacheData]);

  return {
    isOnline,
    isPending,
    syncQueueLength: syncQueue.length,
    cacheData,
    getCachedData,
    queueSync,
    processSyncQueue,
    fetchWithCache,
  };
};

export default useOfflineCapability;
