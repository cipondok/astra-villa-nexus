
import React, { useState, useEffect } from 'react';
import LoadingPage from './LoadingPage';
import { useWebsiteSettings } from '@/contexts/WebsiteSettingsContext';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [initializationComplete, setInitializationComplete] = useState(false);
  const { isLoading: settingsLoading } = useWebsiteSettings();

  useEffect(() => {
    // Initialize immediately when settings are loaded
    if (!settingsLoading) {
      setInitializationComplete(true);
    }
  }, [settingsLoading]);

  // Show simple loading while settings are loading
  if (!initializationComplete || settingsLoading) {
    return (
      <LoadingPage
        message="Loading ASTRA Villa..."
        showConnectionStatus={false}
      />
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
