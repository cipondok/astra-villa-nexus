
import React from 'react';

interface LoadingPageProps {
  message?: string;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ message = "Loading, please wait..." }) => {
  return (
    <div className="bg-black text-white flex items-center justify-center min-h-screen font-orbitron">
      <div className="flex flex-col items-center space-y-6">
        <div 
          className="text-4xl md:text-6xl font-extrabold tracking-widest animate-pulse-glow"
          style={{
            textShadow: '0 0 8px #7f5af0, 0 0 12px #2cb67d',
            animation: 'pulseGlow 3s ease-in-out infinite'
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
      </div>
    </div>
  );
};

export default LoadingPage;
