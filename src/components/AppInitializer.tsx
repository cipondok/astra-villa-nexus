import React, { useState, useEffect } from 'react';
import CustomizableLoadingPage from './CustomizableLoadingPage';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { useConnectionSpeed } from '@/hooks/useConnectionSpeed';
import { toast } from 'sonner';
import { safeSessionStorage } from '@/lib/safeStorage';

interface AppInitializerProps {
  children: React.ReactNode;
}

const SESSION_KEY = 'astra_welcome_shown';

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  // Check if already shown this session BEFORE first render
  const alreadyShown = safeSessionStorage.getItem(SESSION_KEY) === 'true';
  const [initializationComplete, setInitializationComplete] = useState(alreadyShown);
  const { speed } = useConnectionSpeed();
  
  // Initialize performance optimizations
  usePerformanceOptimization();

  useEffect(() => {
    // Show toast for slow connection (only once)
    if (speed === 'slow') {
      toast.warning('Slow internet detected. Loading may take longer than usual.', {
        duration: 5000,
        id: 'slow-connection', // Prevent duplicate toasts
      });
    } else if (speed === 'offline') {
      toast.error('No internet connection. Please check your network settings.', {
        duration: 6000,
        id: 'offline-connection',
      });
    }
  }, [speed]);

  useEffect(() => {
    // Skip if already shown this session
    if (alreadyShown) return;

    // Show loading screen for 2 seconds, then mark as shown
    const timeout = setTimeout(() => {
      safeSessionStorage.setItem(SESSION_KEY, 'true');
      setInitializationComplete(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [alreadyShown]);

  if (!initializationComplete) {
    const message = speed === 'slow' 
      ? 'Loading slowly... Check your internet connection'
      : speed === 'offline'
      ? 'No internet connection detected'
      : 'Loading ASTRA Villa...';

    return (
      <CustomizableLoadingPage
        message={message}
        showConnectionStatus={true}
      />
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
