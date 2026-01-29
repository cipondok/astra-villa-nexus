import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

/**
 * Enhanced PWA Hook with comprehensive offline support
 * - Install prompt handling
 * - Network status monitoring
 * - Cache management
 * - Background sync integration
 * - Storage quota management
 */

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface CacheInfo {
  used: number;
  quota: number;
  usedMB: number;
  quotaMB: number;
  percentUsed: number;
}

interface SyncQueueItem {
  id: number;
  url: string;
  method: string;
  tag: string;
  timestamp: number;
  retries: number;
}

interface PWAState {
  canInstall: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  syncQueueLength: number;
  cacheInfo: CacheInfo | null;
  isSupported: boolean;
}

export function usePWAEnhanced() {
  const { toast } = useToast();
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);
  const [state, setState] = useState<PWAState>({
    canInstall: false,
    isInstalled: false,
    isOnline: navigator.onLine,
    updateAvailable: false,
    syncQueueLength: 0,
    cacheInfo: null,
    isSupported: 'serviceWorker' in navigator
  });

  // Check if PWA is installed
  const checkInstalled = useCallback(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    return isStandalone || isIOSStandalone;
  }, []);

  // Get cache storage info
  const getCacheInfo = useCallback(async (): Promise<CacheInfo | null> => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          quota: estimate.quota || 0,
          usedMB: Math.round((estimate.usage || 0) / (1024 * 1024) * 100) / 100,
          quotaMB: Math.round((estimate.quota || 0) / (1024 * 1024) * 100) / 100,
          percentUsed: Math.round(((estimate.usage || 0) / (estimate.quota || 1)) * 100)
        };
      } catch (error) {
        console.error('Failed to get storage estimate:', error);
      }
    }
    return null;
  }, []);

  // Get sync queue length from IndexedDB
  const getSyncQueueLength = useCallback(async (): Promise<number> => {
    return new Promise((resolve) => {
      try {
        const request = indexedDB.open('astra-sync-queue', 2);
        request.onsuccess = () => {
          const db = request.result;
          if (db.objectStoreNames.contains('pending-requests')) {
            const tx = db.transaction('pending-requests', 'readonly');
            const store = tx.objectStore('pending-requests');
            const countReq = store.count();
            countReq.onsuccess = () => resolve(countReq.result);
            countReq.onerror = () => resolve(0);
          } else {
            resolve(0);
          }
        };
        request.onerror = () => resolve(0);
      } catch {
        resolve(0);
      }
    });
  }, []);

  // Initialize and set up event listeners
  useEffect(() => {
    if (!state.isSupported) return;

    // Check initial state
    const initializeState = async () => {
      const isInstalled = checkInstalled();
      const cacheInfo = await getCacheInfo();
      const syncQueueLength = await getSyncQueueLength();

      setState(prev => ({
        ...prev,
        isInstalled,
        cacheInfo,
        syncQueueLength
      }));
    };

    initializeState();

    // Before install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setState(prev => ({ ...prev, canInstall: true }));
    };

    // App installed
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState(prev => ({ ...prev, isInstalled: true, canInstall: false }));
      toast({
        title: "App Installed! 🎉",
        description: "ASTRA Villa has been added to your home screen."
      });
    };

    // Online/offline status
    const handleOnline = async () => {
      setState(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "Back Online",
        description: "Syncing your changes..."
      });
      
      // Trigger background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        try {
          await (registration as any).sync.register('sync-forms');
        } catch (error) {
          console.log('Background sync registration failed:', error);
        }
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "You're Offline",
        description: "Changes will sync when you're back online.",
        variant: "destructive"
      });
    };

    // Service worker update
    const handleControllerChange = () => {
      setState(prev => ({ ...prev, updateAvailable: true }));
    };

    // Service worker messages
    const handleSWMessage = (event: MessageEvent) => {
      const { type, ...data } = event.data || {};
      
      switch (type) {
        case 'SYNC_COMPLETE':
          toast({
            title: "Sync Complete",
            description: `${data.success} action(s) synced successfully.`
          });
          getSyncQueueLength().then(length => {
            setState(prev => ({ ...prev, syncQueueLength: length }));
          });
          break;
          
        case 'REQUEST_QUEUED':
          getSyncQueueLength().then(length => {
            setState(prev => ({ ...prev, syncQueueLength: length }));
          });
          break;
          
        case 'CACHE_SIZE':
          setState(prev => ({ ...prev, cacheInfo: data.size }));
          break;
      }
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker?.addEventListener('message', handleSWMessage);

    // Check for updates periodically
    const updateCheck = setInterval(async () => {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) {
        registration.update();
      }
    }, 60 * 60 * 1000); // Every hour

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('controllerchange', handleControllerChange);
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
      clearInterval(updateCheck);
    };
  }, [state.isSupported, checkInstalled, getCacheInfo, getSyncQueueLength, toast]);

  // Install PWA
  const installPWA = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) return false;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setState(prev => ({ ...prev, canInstall: false }));
        return true;
      }
    } catch (error) {
      console.error('Install prompt failed:', error);
    }
    
    return false;
  }, [deferredPrompt]);

  // Reload for update
  const reloadForUpdate = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  }, []);

  // Clear all caches
  const clearCache = useCallback(async () => {
    try {
      // Send message to service worker
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration?.active) {
        registration.active.postMessage({ type: 'CLEAR_CACHE' });
      }

      // Also clear from main thread
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name.startsWith('astra-'))
          .map(name => caches.delete(name))
      );

      const cacheInfo = await getCacheInfo();
      setState(prev => ({ ...prev, cacheInfo }));

      toast({
        title: "Cache Cleared",
        description: "All cached data has been removed."
      });
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast({
        title: "Error",
        description: "Failed to clear cache.",
        variant: "destructive"
      });
    }
  }, [getCacheInfo, toast]);

  // Cache specific property for offline
  const cacheProperty = useCallback(async (property: any) => {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration?.active) {
      registration.active.postMessage({
        type: 'CACHE_PROPERTY',
        payload: property
      });
    }
  }, []);

  // Precache user's favorites
  const precacheFavorites = useCallback(async (favorites: any[]) => {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration?.active) {
      registration.active.postMessage({
        type: 'PRECACHE_FAVORITES',
        payload: favorites
      });
    }
  }, []);

  // Trigger cache cleanup
  const cleanupCaches = useCallback(async () => {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration?.active) {
      registration.active.postMessage({ type: 'CLEANUP_OLD_CACHES' });
    }
  }, []);

  // Request persistent storage
  const requestPersistentStorage = useCallback(async (): Promise<boolean> => {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const persistent = await navigator.storage.persist();
        if (persistent) {
          toast({
            title: "Persistent Storage Enabled",
            description: "Your data will be preserved across sessions."
          });
        }
        return persistent;
      } catch (error) {
        console.error('Failed to request persistent storage:', error);
      }
    }
    return false;
  }, [toast]);

  // Queue action for background sync
  const queueSync = useCallback(async (action: string, payload: any) => {
    const registration = await navigator.serviceWorker?.getRegistration();
    if (registration?.active) {
      registration.active.postMessage({
        type: 'QUEUE_SYNC',
        payload: { action, ...payload }
      });
    }
  }, []);

  return {
    ...state,
    installPWA,
    reloadForUpdate,
    clearCache,
    cacheProperty,
    precacheFavorites,
    cleanupCaches,
    requestPersistentStorage,
    queueSync,
    refreshCacheInfo: getCacheInfo,
    refreshSyncQueue: getSyncQueueLength
  };
}

export default usePWAEnhanced;
