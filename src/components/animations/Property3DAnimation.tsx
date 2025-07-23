import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Property3DAnimationProps {
  className?: string;
  isMobile?: boolean;
}

const Property3DAnimation = ({ className, isMobile }: Property3DAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const houseRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const house = houseRef.current;
    
    if (!container || !house) return;

    // Create floating animation
    const floatAnimation = () => {
      house.style.transform = `
        translateY(${Math.sin(Date.now() * 0.002) * 5}px) 
        rotateY(${Math.sin(Date.now() * 0.001) * 10}deg)
        rotateX(${Math.cos(Date.now() * 0.0015) * 5}deg)
      `;
      requestAnimationFrame(floatAnimation);
    };

    floatAnimation();
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-center perspective-1000",
        isMobile ? "h-16 w-20" : "h-20 w-24",
        className
      )}
    >
      {/* Animated 3D House */}
      <div 
        ref={houseRef}
        className={cn(
          "relative transform-gpu will-change-transform transition-all duration-1000",
          isMobile ? "scale-75" : "scale-100"
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-10deg) rotateY(15deg)'
        }}
      >
        {/* House Base */}
        <div className={cn(
          "relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg",
          isMobile ? "w-8 h-6" : "w-10 h-8"
        )}>
          {/* Roof */}
          <div 
            className={cn(
              "absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-red-500 to-red-600 shadow-md",
              isMobile ? "w-10 h-3" : "w-12 h-4"
            )}
            style={{
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
            }}
          />
          
          {/* Windows */}
          <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-yellow-300 rounded-sm animate-pulse" />
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-300 rounded-sm animate-pulse" />
          
          {/* Door */}
          <div className={cn(
            "absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-brown-600 rounded-t-sm",
            isMobile ? "w-1.5 h-2" : "w-2 h-3"
          )} />
        </div>

        {/* Floating Elements */}
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-bounce opacity-80" />
        <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse opacity-70" />
        
        {/* 3D Shadow */}
        <div 
          className={cn(
            "absolute top-full left-1/2 transform -translate-x-1/2 bg-black/20 rounded-full blur-sm",
            isMobile ? "w-6 h-2 mt-1" : "w-8 h-3 mt-2"
          )}
          style={{
            transform: 'translateX(-50%) rotateX(90deg) translateZ(-10px)'
          }}
        />
      </div>

      {/* Sparkle Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-ping opacity-75" />
        <div className="absolute top-3 right-2 w-0.5 h-0.5 bg-blue-300 rounded-full animate-pulse" />
        <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-purple-300 rounded-full animate-bounce" />
      </div>

      {/* Text Label */}
      <div className={cn(
        "absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center",
        isMobile ? "text-xs" : "text-sm"
      )}>
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
          3D View
        </span>
      </div>
    </div>
  );
};

export default Property3DAnimation;