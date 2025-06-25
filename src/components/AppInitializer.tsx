
import React, { useState, useEffect } from 'react';
import LoadingPage from './LoadingPage';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    // Quick initialization without delays
    const timer = setTimeout(() => {
      setInitializationComplete(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show minimal loading screen only briefly
  if (!initializationComplete) {
    return (
      <LoadingPage
        message="Initializing..."
        showConnectionStatus={false}
      />
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
