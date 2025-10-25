import { useState, useEffect } from 'react';

export type ConnectionSpeed = 'fast' | 'slow' | 'offline' | 'checking';

interface ConnectionSpeedResult {
  speed: ConnectionSpeed;
  isSlowConnection: boolean;
  downloadSpeed: number | null;
}

export const useConnectionSpeed = () => {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionSpeedResult>({
    speed: 'checking',
    isSlowConnection: false,
    downloadSpeed: null
  });

  useEffect(() => {
    const checkConnectionSpeed = () => {
      // Check if online
      if (!navigator.onLine) {
        setConnectionInfo({
          speed: 'offline',
          isSlowConnection: true,
          downloadSpeed: null
        });
        return;
      }

      // Check Network Information API if available
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      if (connection) {
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink; // Mbps
        
        // slow-2g, 2g, 3g = slow, 4g = fast
        const isSlow = effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g' || downlink < 1;
        
        setConnectionInfo({
          speed: isSlow ? 'slow' : 'fast',
          isSlowConnection: isSlow,
          downloadSpeed: downlink || null
        });
      } else {
        // Fallback: measure actual loading time
        const startTime = performance.now();
        const testImage = new Image();
        const cacheBuster = '?t=' + Date.now();
        
        testImage.onload = () => {
          const loadTime = performance.now() - startTime;
          const isSlow = loadTime > 3000; // More than 3 seconds is considered slow
          
          setConnectionInfo({
            speed: isSlow ? 'slow' : 'fast',
            isSlowConnection: isSlow,
            downloadSpeed: null
          });
        };
        
        testImage.onerror = () => {
          setConnectionInfo({
            speed: 'offline',
            isSlowConnection: true,
            downloadSpeed: null
          });
        };
        
        // Use a small image from the app itself
        testImage.src = '/favicon.ico' + cacheBuster;
      }
    };

    checkConnectionSpeed();

    // Listen for online/offline events
    const handleOnline = () => checkConnectionSpeed();
    const handleOffline = () => {
      setConnectionInfo({
        speed: 'offline',
        isSlowConnection: true,
        downloadSpeed: null
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Re-check periodically
    const interval = setInterval(checkConnectionSpeed, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return connectionInfo;
};
