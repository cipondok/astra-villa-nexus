import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SyncQueueItem {
  id: string;
  action_type: "create" | "update" | "delete";
  entity_type: string;
  entity_id: string;
  payload: Record<string, any>;
  priority: number;
  retry_count: number;
  status: "pending" | "processing" | "completed" | "failed";
}

interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: Date | null;
}

export const useOfflineSync = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null
  });
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      toast({ title: "Back Online", description: "Syncing your changes..." });
      processQueue();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast({ 
        title: "You're Offline", 
        description: "Changes will sync when you're back online",
        variant: "destructive"
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Load pending items from IndexedDB/localStorage
  useEffect(() => {
    const loadQueue = () => {
      try {
        const stored = localStorage.getItem("offline_sync_queue");
        if (stored) {
          const items = JSON.parse(stored) as SyncQueueItem[];
          setQueue(items);
          setState(prev => ({ ...prev, pendingCount: items.filter(i => i.status === "pending").length }));
        }
      } catch (error) {
        console.error("Failed to load sync queue:", error);
      }
    };

    loadQueue();
  }, []);

  // Save queue to storage
  const saveQueue = useCallback((items: SyncQueueItem[]) => {
    try {
      localStorage.setItem("offline_sync_queue", JSON.stringify(items));
      setState(prev => ({ 
        ...prev, 
        pendingCount: items.filter(i => i.status === "pending").length 
      }));
    } catch (error) {
      console.error("Failed to save sync queue:", error);
    }
  }, []);

  // Add item to sync queue
  const addToQueue = useCallback(async (
    actionType: "create" | "update" | "delete",
    entityType: string,
    entityId: string,
    payload: Record<string, any>,
    priority: number = 5
  ) => {
    const item: SyncQueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId,
      payload,
      priority,
      retry_count: 0,
      status: "pending"
    };

    // If online, try to sync immediately
    if (state.isOnline) {
      try {
        await processSingleItem(item);
        return true;
      } catch (error) {
        // Fall through to queue it
      }
    }

    // Add to offline queue
    const newQueue = [...queue, item].sort((a, b) => a.priority - b.priority);
    setQueue(newQueue);
    saveQueue(newQueue);

    // Also save to Supabase if user is logged in (for cross-device sync)
    if (user && state.isOnline) {
      try {
        await supabase.from("mobile_offline_sync_queue").insert({
          user_id: user.id,
          action_type: actionType,
          entity_type: entityType,
          entity_id: entityId,
          payload,
          priority
        });
      } catch (error) {
        console.error("Failed to save to remote queue:", error);
      }
    }

    return true;
  }, [queue, state.isOnline, user, saveQueue]);

  // Process single item
  const processSingleItem = async (item: SyncQueueItem): Promise<boolean> => {
    const { action_type, entity_type, entity_id, payload } = item;

    switch (action_type) {
      case "create":
        const { error: createError } = await supabase
          .from(entity_type as any)
          .insert(payload);
        if (createError) throw createError;
        break;

      case "update":
        const { error: updateError } = await supabase
          .from(entity_type as any)
          .update(payload)
          .eq("id", entity_id);
        if (updateError) throw updateError;
        break;

      case "delete":
        const { error: deleteError } = await supabase
          .from(entity_type as any)
          .delete()
          .eq("id", entity_id);
        if (deleteError) throw deleteError;
        break;
    }

    return true;
  };

  // Process entire queue
  const processQueue = useCallback(async () => {
    if (!state.isOnline || state.isSyncing || queue.length === 0) return;

    setState(prev => ({ ...prev, isSyncing: true }));

    const pendingItems = queue.filter(i => i.status === "pending");
    const results: SyncQueueItem[] = [];

    for (const item of pendingItems) {
      try {
        await processSingleItem(item);
        results.push({ ...item, status: "completed" });
      } catch (error) {
        console.error(`Sync failed for ${item.id}:`, error);
        results.push({
          ...item,
          status: item.retry_count >= 2 ? "failed" : "pending",
          retry_count: item.retry_count + 1
        });
      }
    }

    // Keep only failed/pending items
    const newQueue = results.filter(i => i.status !== "completed");
    setQueue(newQueue);
    saveQueue(newQueue);

    // Clean up completed items from remote queue
    if (user) {
      const completedIds = results.filter(i => i.status === "completed").map(i => i.id);
      if (completedIds.length > 0) {
        // Note: This would need a custom cleanup since we don't store local IDs
      }
    }

    setState(prev => ({ 
      ...prev, 
      isSyncing: false,
      lastSyncTime: new Date()
    }));

    const syncedCount = results.filter(i => i.status === "completed").length;
    if (syncedCount > 0) {
      toast({ 
        title: "Sync Complete", 
        description: `${syncedCount} changes synced successfully`
      });
    }
  }, [queue, state.isOnline, state.isSyncing, user, saveQueue]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (state.isOnline && queue.length > 0) {
      processQueue();
    }
  }, [state.isOnline]);

  // Clear failed items
  const clearFailed = useCallback(() => {
    const newQueue = queue.filter(i => i.status !== "failed");
    setQueue(newQueue);
    saveQueue(newQueue);
  }, [queue, saveQueue]);

  // Retry failed items
  const retryFailed = useCallback(() => {
    const newQueue = queue.map(i => 
      i.status === "failed" ? { ...i, status: "pending" as const, retry_count: 0 } : i
    );
    setQueue(newQueue);
    saveQueue(newQueue);
    processQueue();
  }, [queue, saveQueue, processQueue]);

  // Cache data for offline access
  const cacheData = useCallback(async (key: string, data: any) => {
    try {
      const cacheItem = {
        key,
        data,
        timestamp: Date.now(),
        expiry: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      localStorage.setItem(`offline_cache_${key}`, JSON.stringify(cacheItem));
    } catch (error) {
      console.error("Failed to cache data:", error);
    }
  }, []);

  // Get cached data
  const getCachedData = useCallback(<T>(key: string): T | null => {
    try {
      const stored = localStorage.getItem(`offline_cache_${key}`);
      if (!stored) return null;

      const cacheItem = JSON.parse(stored);
      if (Date.now() > cacheItem.expiry) {
        localStorage.removeItem(`offline_cache_${key}`);
        return null;
      }

      return cacheItem.data as T;
    } catch (error) {
      console.error("Failed to get cached data:", error);
      return null;
    }
  }, []);

  return {
    ...state,
    queue,
    addToQueue,
    processQueue,
    clearFailed,
    retryFailed,
    cacheData,
    getCachedData
  };
};

export default useOfflineSync;
