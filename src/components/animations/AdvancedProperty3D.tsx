import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface AdvancedProperty3DProps {
  className?: string;
  height?: string;
}

const AdvancedProperty3D = ({ className, height = "100vh" }: AdvancedProperty3DProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900",
        className
      )}
      style={{ height }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-purple-400/20 rounded-lg animate-pulse opacity-50 rotate-45"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-indigo-400/20 rounded-full animate-ping opacity-40"></div>
        <div className="absolute bottom-32 right-10 w-12 h-12 bg-cyan-400/20 rounded-lg animate-bounce opacity-60 rotate-12"></div>
        
        {/* Animated Lines */}
        <div className="absolute top-1/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-300/50 to-transparent animate-pulse"></div>
        <div className="absolute top-2/3 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-300/50 to-transparent animate-pulse delay-1000"></div>
      </div>

      {/* Main 3D House Animation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative transform-gpu perspective-1000">
          {/* Central House */}
          <div className="relative group cursor-pointer" style={{ 
            transform: 'rotateX(-10deg) rotateY(15deg)',
            transformStyle: 'preserve-3d',
            animation: 'float 6s ease-in-out infinite'
          }}>
            {/* House Base */}
            <div className="relative w-32 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-2xl group-hover:scale-110 transition-transform duration-500">
              {/* Roof */}
              <div 
                className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-gradient-to-br from-red-500 to-red-700 shadow-lg"
                style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                }}
              />
              
              {/* Windows */}
              <div className="absolute top-3 left-3 w-4 h-4 bg-yellow-300 rounded-sm animate-pulse shadow-lg"></div>
              <div className="absolute top-3 right-3 w-4 h-4 bg-yellow-300 rounded-sm animate-pulse shadow-lg"></div>
              
              {/* Door */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-12 bg-amber-800 rounded-t-lg shadow-lg">
                <div className="absolute top-6 right-1 w-1 h-1 bg-yellow-400 rounded-full"></div>
              </div>
              
              {/* Chimney */}
              <div className="absolute -top-2 right-2 w-3 h-8 bg-gray-600 rounded-sm shadow-lg"></div>
            </div>
            
            {/* 3D Shadow */}
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-28 h-6 bg-black/20 rounded-full blur-md"
              style={{
                transform: 'translateX(-50%) rotateX(90deg) translateZ(-20px)'
              }}
            />
          </div>
          
          {/* Surrounding Houses */}
          <div className="absolute -left-40 -top-10 opacity-70 scale-75" style={{
            transform: 'rotateX(-5deg) rotateY(25deg)',
            transformStyle: 'preserve-3d',
            animation: 'float 8s ease-in-out infinite reverse'
          }}>
            <div className="w-20 h-16 bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-xl">
              <div 
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gradient-to-br from-orange-500 to-orange-700"
                style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
              />
              <div className="absolute top-2 left-2 w-3 h-3 bg-yellow-300 rounded-sm animate-pulse"></div>
              <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-300 rounded-sm animate-pulse"></div>
            </div>
          </div>
          
          <div className="absolute -right-40 top-5 opacity-60 scale-90" style={{
            transform: 'rotateX(-8deg) rotateY(-20deg)',
            transformStyle: 'preserve-3d',
            animation: 'float 7s ease-in-out infinite'
          }}>
            <div className="w-24 h-18 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg shadow-xl">
              <div 
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-gradient-to-br from-indigo-500 to-indigo-700"
                style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
              />
              <div className="absolute top-2 left-2 w-3 h-3 bg-yellow-300 rounded-sm animate-pulse delay-500"></div>
              <div className="absolute top-2 right-2 w-3 h-3 bg-yellow-300 rounded-sm animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay UI Elements */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* Top Overlay */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
            Discover Properties
          </h1>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 font-medium bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full px-6 py-2 inline-block">
            Immersive Property Experience
          </p>
        </div>
        
        {/* Bottom Action Area */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center pointer-events-auto animate-fade-in">
          <div className="bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20">
            <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base">
              🏠 Explore premium properties with advanced search
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg">
                Start Exploring
              </button>
              <button className="bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg border border-gray-200 dark:border-gray-700">
                View Gallery
              </button>
            </div>
          </div>
        </div>
        
        {/* Corner Elements */}
        <div className="absolute top-4 right-4 pointer-events-auto animate-bounce">
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-full p-3 shadow-lg">
            <span className="text-2xl">🏡</span>
          </div>
        </div>
        
        <div className="absolute top-4 left-4 pointer-events-auto animate-pulse">
          <div className="bg-white/80 dark:bg-black/80 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Interactive View</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdvancedProperty3D;