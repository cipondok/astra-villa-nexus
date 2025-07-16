
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
    // Show loading for just a moment for smooth experience
    const minLoadingTime = setTimeout(() => {
      console.log('AppInitializer: Minimum loading time complete');
      setInitializationComplete(true);
    }, 1000);

    // If settings are already loaded, still show brief loading
    if (!settingsLoading) {
      console.log('AppInitializer: Settings already loaded');
    }

    return () => clearTimeout(minLoadingTime);
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
