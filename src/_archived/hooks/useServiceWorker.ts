import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ServiceWorkerState {
  isSupported: boolean;
  isRegistered: boolean;
  isOnline: boolean;
  updateAvailable: boolean;
  registration: ServiceWorkerRegistration | null;
}

export function useServiceWorker() {
  const { toast } = useToast();
  const [state, setState] = useState<ServiceWorkerState>({
    isSupported: 'serviceWorker' in navigator,
    isRegistered: false,
    isOnline: navigator.onLine,
    updateAvailable: false,
    registration: null,
  });

  useEffect(() => {
    if (!state.isSupported) {
      console.log('Service Worker not supported');
      return;
    }

    registerServiceWorker();
    setupConnectionMonitoring();
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', registration);

      setState(prev => ({
        ...prev,
        isRegistered: true,
        registration,
      }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setState(prev => ({ ...prev, updateAvailable: true }));
              
              toast({
                title: "App Update Available",
                description: "A new version is ready. Refresh to update.",
                duration: 10000,
              });
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'CACHE_UPDATED') {
          console.log('Cache updated for:', event.data.url);
        }
      });

    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const setupConnectionMonitoring = () => {
    const updateOnlineStatus = () => {
      const isOnline = navigator.onLine;
      setState(prev => ({ ...prev, isOnline }));

      if (isOnline) {
        toast({
          title: "Back Online",
          description: "Internet connection restored.",
        });
        
        // Trigger background sync if supported
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then(registration => {
            return (registration as any).sync.register('background-sync');
          }).catch(err => console.log('Background sync registration failed:', err));
        }
      } else {
        toast({
          title: "Connection Lost",
          description: "You're now offline. Some features may be limited.",
          variant: "destructive",
        });
      }
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  };

  const updateApp = () => {
    if (state.registration?.waiting) {
      state.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const clearCache = async () => {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      
      toast({
        title: "Cache Cleared",
        description: "Application cache has been cleared.",
      });
      
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast({
        title: "Cache Clear Failed",
        description: "Unable to clear application cache.",
        variant: "destructive",
      });
    }
  };

  const getCacheSize = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          used: estimate.usage || 0,
          available: estimate.quota || 0,
          usedMB: Math.round((estimate.usage || 0) / (1024 * 1024) * 100) / 100,
          availableMB: Math.round((estimate.quota || 0) / (1024 * 1024) * 100) / 100,
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return null;
    }
  };

  const requestPersistentStorage = async () => {
    try {
      if ('storage' in navigator && 'persist' in navigator.storage) {
        const persistent = await navigator.storage.persist();
        if (persistent) {
          toast({
            title: "Persistent Storage Enabled",
            description: "App data will persist across browser sessions.",
          });
        }
        return persistent;
      }
      return false;
    } catch (error) {
      console.error('Failed to request persistent storage:', error);
      return false;
    }
  };

  return {
    ...state,
    updateApp,
    clearCache,
    getCacheSize,
    requestPersistentStorage,
  };
}