
import React from 'react';
import { useConnectionSpeed } from '@/hooks/useConnectionSpeed';

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
  const { speed, isSlowConnection } = useConnectionSpeed();

  const getConnectionMessage = () => {
    if (speed === 'slow') {
      return 'Slow internet detected - ISP issue';
    }
    if (speed === 'offline') {
      return 'No internet - Check your connection';
    }

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
    if (speed === 'slow') {
      return 'text-orange-400';
    }
    if (speed === 'offline') {
      return 'text-red-400';
    }

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
    <div className="bg-black text-white flex items-center justify-center min-h-screen font-orbitron">
      <div className="flex flex-col items-center space-y-6">
        <div 
          className="text-4xl md:text-6xl font-extrabold tracking-widest animate-pulse-glow"
          style={{
            textShadow: '0 0 8px #7f5af0, 0 0 12px #2cb67d',
            animation: 'pulseGlow 2s ease-in-out infinite'
          }}
        >
          ASTRA <span className="text-indigo-400">Villa</span>
        </div>
        
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-indigo-400 rounded-full animate-dot-flash"></div>
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-dot-flash" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-dot-flash" style={{ animationDelay: '0.4s' }}></div>
        </div>
        
        <p className="text-sm text-gray-400 tracking-wide">{message}</p>
        
        {showConnectionStatus && (
          <div className="flex flex-col items-center space-y-2">
            <div className={`text-xs ${getConnectionColor()} flex items-center space-x-2`}>
              <div className={`w-2 h-2 rounded-full ${
                speed === 'slow' ? 'bg-orange-400 animate-pulse' :
                speed === 'offline' ? 'bg-red-400 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                connectionStatus === 'connected' ? 'bg-green-400' :
                'bg-gray-400'
              }`}></div>
              <span>{getConnectionMessage()}</span>
            </div>
            {isSlowConnection && (
              <p className="text-xs text-gray-500 text-center max-w-xs">
                Please wait... This may take longer due to your internet connection
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingPage;
