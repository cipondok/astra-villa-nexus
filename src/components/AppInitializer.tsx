
import React, { useState, useEffect } from 'react';
import CustomizableLoadingPage from './CustomizableLoadingPage';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { useConnectionSpeed } from '@/hooks/useConnectionSpeed';
import { toast } from 'sonner';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [initializationComplete, setInitializationComplete] = useState(false);
  const { speed, isSlowConnection } = useConnectionSpeed();
  
  // Initialize performance optimizations
  usePerformanceOptimization();

  useEffect(() => {
    // Show toast for slow connection
    if (speed === 'slow') {
      toast.warning('Slow internet detected. Loading may take longer than usual. Please check your internet connection.', {
        duration: 5000,
      });
    } else if (speed === 'offline') {
      toast.error('No internet connection. Please check your network settings.', {
        duration: 6000,
      });
    }
  }, [speed]);

  useEffect(() => {
    // Show loading screen for a reasonable duration
    const timeout = setTimeout(() => {
      setInitializationComplete(true);
    }, 2000); // Show welcome screen for 2 seconds

    return () => clearTimeout(timeout);
  }, []);

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
