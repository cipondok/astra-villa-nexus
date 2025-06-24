
import React, { useState, useEffect } from 'react';
import LoadingPage from './LoadingPage';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { connectionStatus, isLoading, retryConnection } = useDatabaseConnection();
  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Simulate app initialization process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (connectionStatus === 'connected' || connectionStatus === 'offline') {
        setInitializationComplete(true);
      }
    };

    if (!isLoading) {
      initializeApp();
    }
  }, [connectionStatus, isLoading]);

  // Show loading screen during initialization
  if (!initializationComplete || isLoading) {
    return (
      <LoadingPage
        message="Initializing ASTRA Villa..."
        showConnectionStatus={true}
        connectionStatus={connectionStatus}
      />
    );
  }

  // Show error state with retry option
  if (connectionStatus === 'error') {
    return (
      <div className="bg-black text-white flex items-center justify-center min-h-screen font-orbitron">
        <div className="flex flex-col items-center space-y-6 text-center max-w-md">
          <div className="text-4xl md:text-6xl font-extrabold tracking-widest text-red-400">
            CONNECTION ERROR
          </div>
          <p className="text-gray-400">Unable to connect to the database</p>
          <button
            onClick={retryConnection}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry Connection
          </button>
          <button
            onClick={() => setInitializationComplete(true)}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Continue Offline
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
