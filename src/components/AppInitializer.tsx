
import React, { useState, useEffect } from 'react';
import CustomizableLoadingPage from './CustomizableLoadingPage';
import { useWebsiteSettings } from '@/contexts/WebsiteSettingsContext';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [initializationComplete, setInitializationComplete] = useState(false);
  const { isLoading: settingsLoading } = useWebsiteSettings();

  useEffect(() => {
    // Much faster initialization - only wait if absolutely necessary
    const initTimer = setTimeout(() => {
      console.log('AppInitializer: Initialization complete');
      setInitializationComplete(true);
    }, 800); // Reduced from 1500ms to 800ms

    // If settings load quickly, proceed immediately
    if (!settingsLoading) {
      const quickTimer = setTimeout(() => {
        console.log('AppInitializer: Settings loaded quickly');
        setInitializationComplete(true);
      }, 200); // Reduced from 500ms to 200ms
      
      return () => {
        clearTimeout(initTimer);
        clearTimeout(quickTimer);
      };
    }

    return () => clearTimeout(initTimer);
  }, [settingsLoading]);

  // Show loading screen for initial period only
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
