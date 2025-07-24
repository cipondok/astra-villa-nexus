import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Property3DViewerProps {
  className?: string;
  height?: string;
  propertyData?: {
    width: number;
    length: number;
    height: number;
    floors: number;
    rooms: number;
    bathrooms: number;
  };
}

const Property3DViewer = ({ 
  className, 
  height = "100vh",
  propertyData = {
    width: 12,
    length: 15,
    height: 8,
    floors: 2,
    rooms: 4,
    bathrooms: 3
  }
}: Property3DViewerProps) => {
  const [isRotating, setIsRotating] = useState(true);
  const [currentView, setCurrentView] = useState<'front' | 'side' | 'top' | 'iso'>('iso');
  const [showDimensions, setShowDimensions] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const views = {
    front: { rotateX: 0, rotateY: 0, rotateZ: 0 },
    side: { rotateX: 0, rotateY: 90, rotateZ: 0 },
    top: { rotateX: -90, rotateY: 0, rotateZ: 0 },
    iso: { rotateX: -15, rotateY: 25, rotateZ: 0 }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRotating && currentView === 'iso') {
      interval = setInterval(() => {
        if (containerRef.current) {
          const house = containerRef.current.querySelector('.property-3d-house') as HTMLElement;
          if (house) {
            const currentRotateY = parseInt(house.style.getPropertyValue('--rotate-y') || '25');
            house.style.setProperty('--rotate-y', `${currentRotateY + 1}deg`);
          }
        }
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isRotating, currentView]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900",
        className
      )}
      style={{ height }}
    >
      {/* Control Panel */}
      <div className="absolute top-6 left-6 z-30 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">3D Property View</h3>
        
        {/* View Controls */}
        <div className="flex gap-2 mb-3">
          {Object.keys(views).map((view) => (
            <button
              key={view}
              onClick={() => {
                setCurrentView(view as keyof typeof views);
                setIsRotating(view === 'iso');
              }}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-all",
                currentView === view
                  ? "bg-blue-500 text-white shadow-lg"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              {view.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Toggle Controls */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={isRotating}
              onChange={(e) => setIsRotating(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Auto Rotate</span>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
              className="rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Show Dimensions</span>
          </label>
        </div>
      </div>

      {/* Property Info Panel */}
      <div className="absolute top-6 right-6 z-30 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/20">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3">Property Details</h3>
        <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
          <div className="flex justify-between gap-4">
            <span>Dimensions:</span>
            <span className="font-mono">{propertyData.length}m × {propertyData.width}m</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Height:</span>
            <span className="font-mono">{propertyData.height}m</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Floors:</span>
            <span className="font-mono">{propertyData.floors}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Rooms:</span>
            <span className="font-mono">{propertyData.rooms}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Bathrooms:</span>
            <span className="font-mono">{propertyData.bathrooms}</span>
          </div>
        </div>
      </div>

      {/* 3D Scene */}
      <div className="absolute inset-0 flex items-center justify-center perspective-1000">
        <div 
          className="property-3d-house relative transform-gpu transition-all duration-1000 ease-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateX(${views[currentView].rotateX}deg) rotateY(var(--rotate-y, ${views[currentView].rotateY}deg)) rotateZ(${views[currentView].rotateZ}deg) scale(1.2)`,
            '--rotate-y': `${views[currentView].rotateY}deg`
          } as React.CSSProperties}
        >
          {/* Ground Plane */}
          <div 
            className="absolute bg-green-200 dark:bg-green-800 opacity-60 border-2 border-green-300 dark:border-green-700"
            style={{
              width: '300px',
              height: '250px',
              transform: 'rotateX(90deg) translateZ(-120px)',
              left: '-50px',
              top: '50px'
            }}
          >
            <div className="absolute inset-2 border border-dashed border-green-400 dark:border-green-600 rounded"></div>
          </div>

          {/* Main House Structure */}
          <div className="relative">
            {/* Foundation */}
            <div 
              className="absolute bg-gray-300 dark:bg-gray-700 border-2 border-gray-400 dark:border-gray-600"
              style={{
                width: '200px',
                height: '160px',
                transform: 'translateZ(-10px)',
                left: '0px',
                top: '20px'
              }}
            />

            {/* Front Wall */}
            <div 
              className="absolute bg-gradient-to-b from-blue-400 to-blue-600 border-2 border-blue-500"
              style={{
                width: '200px',
                height: '120px',
                transform: 'translateZ(80px)',
                left: '0px',
                top: '60px'
              }}
            >
              {/* Front Door */}
              <div 
                className="absolute bg-amber-800 border-2 border-amber-900 rounded-t-lg"
                style={{
                  width: '30px',
                  height: '60px',
                  bottom: '0px',
                  left: '85px'
                }}
              >
                <div className="absolute w-2 h-2 bg-yellow-400 rounded-full top-6 right-1"></div>
              </div>

              {/* Front Windows */}
              <div 
                className="absolute bg-yellow-200 border-2 border-yellow-400 animate-pulse"
                style={{
                  width: '25px',
                  height: '25px',
                  top: '25px',
                  left: '30px'
                }}
              />
              <div 
                className="absolute bg-yellow-200 border-2 border-yellow-400 animate-pulse"
                style={{
                  width: '25px',
                  height: '25px',
                  top: '25px',
                  right: '30px'
                }}
              />
            </div>

            {/* Back Wall */}
            <div 
              className="absolute bg-gradient-to-b from-blue-300 to-blue-500 border-2 border-blue-400"
              style={{
                width: '200px',
                height: '120px',
                transform: 'translateZ(-80px)',
                left: '0px',
                top: '60px'
              }}
            />

            {/* Left Wall */}
            <div 
              className="absolute bg-gradient-to-b from-blue-350 to-blue-550 border-2 border-blue-450"
              style={{
                width: '160px',
                height: '120px',
                transform: 'rotateY(90deg) translateZ(100px)',
                left: '0px',
                top: '60px'
              }}
            >
              {/* Side Windows */}
              <div 
                className="absolute bg-yellow-200 border-2 border-yellow-400 animate-pulse"
                style={{
                  width: '20px',
                  height: '20px',
                  top: '30px',
                  left: '40px'
                }}
              />
              <div 
                className="absolute bg-yellow-200 border-2 border-yellow-400 animate-pulse"
                style={{
                  width: '20px',
                  height: '20px',
                  top: '30px',
                  right: '40px'
                }}
              />
            </div>

            {/* Right Wall */}
            <div 
              className="absolute bg-gradient-to-b from-blue-350 to-blue-550 border-2 border-blue-450"
              style={{
                width: '160px',
                height: '120px',
                transform: 'rotateY(-90deg) translateZ(100px)',
                right: '0px',
                top: '60px'
              }}
            />

            {/* Roof */}
            <div 
              className="absolute bg-gradient-to-b from-red-500 to-red-700 border-2 border-red-600"
              style={{
                width: '220px',
                height: '180px',
                transform: 'rotateX(30deg) translateZ(80px) translateY(-60px)',
                left: '-10px',
                top: '40px',
                clipPath: 'polygon(50% 0%, 0% 80%, 100% 80%)'
              }}
            />

            {/* Chimney */}
            <div 
              className="absolute bg-gray-600 border-2 border-gray-700"
              style={{
                width: '15px',
                height: '40px',
                transform: 'translateZ(40px) translateY(-40px)',
                right: '40px',
                top: '40px'
              }}
            />

            {/* Second Floor (if applicable) */}
            {propertyData.floors > 1 && (
              <div 
                className="absolute bg-gradient-to-b from-blue-300 to-blue-500 border-2 border-blue-400 opacity-90"
                style={{
                  width: '200px',
                  height: '100px',
                  transform: 'translateZ(80px) translateY(-100px)',
                  left: '0px',
                  top: '60px'
                }}
              >
                {/* Upper Floor Windows */}
                <div 
                  className="absolute bg-yellow-200 border-2 border-yellow-400 animate-pulse"
                  style={{
                    width: '20px',
                    height: '20px',
                    top: '25px',
                    left: '40px'
                  }}
                />
                <div 
                  className="absolute bg-yellow-200 border-2 border-yellow-400 animate-pulse"
                  style={{
                    width: '20px',
                    height: '20px',
                    top: '25px',
                    right: '40px'
                  }}
                />
              </div>
            )}
          </div>

          {/* Dimension Labels */}
          {showDimensions && (
            <>
              {/* Length Dimension */}
              <div 
                className="absolute text-xs font-mono text-gray-800 dark:text-gray-200 bg-white/80 dark:bg-black/80 px-2 py-1 rounded border backdrop-blur-sm"
                style={{
                  bottom: '-40px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  zIndex: 10
                }}
              >
                {propertyData.length}m
              </div>

              {/* Width Dimension */}
              <div 
                className="absolute text-xs font-mono text-gray-800 dark:text-gray-200 bg-white/80 dark:bg-black/80 px-2 py-1 rounded border backdrop-blur-sm"
                style={{
                  top: '50%',
                  right: '-60px',
                  transform: 'translateY(-50%) rotate(90deg)',
                  zIndex: 10
                }}
              >
                {propertyData.width}m
              </div>

              {/* Height Dimension */}
              <div 
                className="absolute text-xs font-mono text-gray-800 dark:text-gray-200 bg-white/80 dark:bg-black/80 px-2 py-1 rounded border backdrop-blur-sm"
                style={{
                  top: '20px',
                  left: '-50px',
                  zIndex: 10
                }}
              >
                {propertyData.height}m
              </div>
            </>
          )}

          {/* Measurement Lines */}
          {showDimensions && (
            <>
              {/* Length measurement line */}
              <div 
                className="absolute border-t-2 border-dashed border-gray-500 dark:border-gray-400"
                style={{
                  width: '200px',
                  bottom: '-25px',
                  left: '0px'
                }}
              />
              <div className="absolute w-1 h-4 bg-gray-500 dark:bg-gray-400" style={{ bottom: '-33px', left: '0px' }} />
              <div className="absolute w-1 h-4 bg-gray-500 dark:bg-gray-400" style={{ bottom: '-33px', left: '200px' }} />

              {/* Width measurement line */}
              <div 
                className="absolute border-l-2 border-dashed border-gray-500 dark:border-gray-400"
                style={{
                  height: '160px',
                  right: '-25px',
                  top: '20px'
                }}
              />
              <div className="absolute h-1 w-4 bg-gray-500 dark:bg-gray-400" style={{ right: '-33px', top: '20px' }} />
              <div className="absolute h-1 w-4 bg-gray-500 dark:bg-gray-400" style={{ right: '-33px', top: '180px' }} />
            </>
          )}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        <div className="absolute top-40 right-32 w-2 h-2 bg-purple-400 rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-32 left-32 w-4 h-4 bg-green-400 rounded-full animate-bounce opacity-70"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-yellow-400 rounded-full animate-ping opacity-80"></div>
      </div>

      {/* Bottom Info Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl px-6 py-3 shadow-xl border border-white/20">
        <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
          🏠 Interactive 3D Property View • Total Area: {propertyData.length * propertyData.width}m²
        </p>
      </div>
    </div>
  );
};

export default Property3DViewer;