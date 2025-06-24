
import React, { useState, useEffect } from 'react';
import LoadingPage from './LoadingPage';
import { useDatabaseConnection } from '@/hooks/useDatabaseConnection';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const { connectionStatus, retryConnection } = useDatabaseConnection();
  const [initializationComplete, setInitializationComplete] = useState(false);

  useEffect(() => {
    // Quick initialization - don't wait for database connection
    const timer = setTimeout(() => {
      setInitializationComplete(true);
    }, 1000); // Reduced from 2 seconds to 1 second

    return () => clearTimeout(timer);
  }, []);

  // Show very brief loading screen
  if (!initializationComplete) {
    return (
      <LoadingPage
        message="Initializing ASTRA Villa..."
        showConnectionStatus={true}
        connectionStatus={connectionStatus}
      />
    );
  }

  // Only show error state if user explicitly retries and fails
  if (connectionStatus === 'error' && window.location.search.includes('retry=true')) {
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
            onClick={() => {
              window.history.replaceState({}, '', window.location.pathname);
              window.location.reload();
            }}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Continue Anyway
          </button>
        </div>
      </div>
    );
  }

  // Always render children - don't block on database connection
  return <>{children}</>;
};

export default AppInitializer;
