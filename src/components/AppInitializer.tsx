
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
    // Set a shorter timeout and don't wait for settings if they're taking too long
    const initTimer = setTimeout(() => {
      console.log('AppInitializer: Initialization complete');
      setInitializationComplete(true);
    }, 1500); // Reduced from longer wait times

    // If settings load quickly, proceed immediately
    if (!settingsLoading) {
      const quickTimer = setTimeout(() => {
        console.log('AppInitializer: Settings loaded quickly');
        setInitializationComplete(true);
      }, 500);
      
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
