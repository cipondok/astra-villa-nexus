
import React, { useState, useEffect } from 'react';
import LoadingPage from './LoadingPage';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    // Very quick initialization - don't wait for anything
    const timer = setTimeout(() => {
      setInitializationComplete(true);
    }, 500); // Just half a second for smooth transition

    return () => clearTimeout(timer);
  }, []);

  // Show minimal loading screen
  if (!initializationComplete) {
    return (
      <LoadingPage
        message="Loading ASTRA Villa..."
        showConnectionStatus={false} // Don't show connection status during initial load
      />
    );
  }

  // Always render children immediately - no database blocking
  return <>{children}</>;
};

export default AppInitializer;
