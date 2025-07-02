
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
    // Wait for settings to load before showing the app
    if (!settingsLoading) {
      const timer = setTimeout(() => {
        setInitializationComplete(true);
      }, 1000); // Give a bit more time for settings to apply

      return () => clearTimeout(timer);
    }
  }, [settingsLoading]);

  // Show customizable loading screen while initializing
  if (!initializationComplete || settingsLoading) {
    return (
      <CustomizableLoadingPage
        message="Initializing ASTRA Villa..."
        showConnectionStatus={true}
      />
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
