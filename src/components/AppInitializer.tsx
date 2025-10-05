
import React, { useState, useEffect } from 'react';
import CustomizableLoadingPage from './CustomizableLoadingPage';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [initializationComplete, setInitializationComplete] = useState(false);
  
  // Initialize performance optimizations
  usePerformanceOptimization();

  useEffect(() => {
    // Simple loading timeout
    const timeout = setTimeout(() => {
      setInitializationComplete(true);
    }, 300);

    return () => clearTimeout(timeout);
  }, []);

  if (!initializationComplete) {
    return (
      <CustomizableLoadingPage
        message="Loading ASTRA Villa..."
        showConnectionStatus={false}
      />
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
