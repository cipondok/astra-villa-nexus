
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
    // Reduce loading time for better performance
    const minLoadingTime = setTimeout(() => {
      setInitializationComplete(true);
    }, 300);

    // Skip loading if settings are already loaded
    if (!settingsLoading) {
      clearTimeout(minLoadingTime);
      setInitializationComplete(true);
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
