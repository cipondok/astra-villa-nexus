
import React from 'react';

interface LoadingPageProps {
  message?: string;
  showConnectionStatus?: boolean;
  connectionStatus?: 'connecting' | 'connected' | 'error' | 'offline';
}

const LoadingPage: React.FC<LoadingPageProps> = ({ 
  message = "Loading, please wait...",
  showConnectionStatus = false,
  connectionStatus = 'connecting'
}) => {
  const getConnectionMessage = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'Checking database...';
      case 'connected':
        return 'Database ready';
      case 'error':
        return 'Database unavailable';
      case 'offline':
        return 'Working offline';
      default:
        return 'Initializing...';
    }
  };

  const getConnectionColor = () => {
    switch (connectionStatus) {
      case 'connecting':
        return 'text-yellow-400';
      case 'connected':
        return 'text-green-400';
      case 'error':
        return 'text-gray-400';
      case 'offline':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="bg-black text-white flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center space-y-6">
        <div className="text-4xl md:text-6xl font-extrabold tracking-widest">
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent animate-pulse">
            ASTRA
          </span>{' '}
          <span className="text-indigo-400">Villa</span>
        </div>
        
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        <p className="text-sm text-gray-400 tracking-wide">{message}</p>
        
        {showConnectionStatus && (
          <div className="flex flex-col items-center space-y-2">
            <div className={`text-xs ${getConnectionColor()} flex items-center space-x-2`}>
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                connectionStatus === 'connected' ? 'bg-green-400' :
                'bg-gray-400'
              }`}></div>
              <span>{getConnectionMessage()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingPage;
