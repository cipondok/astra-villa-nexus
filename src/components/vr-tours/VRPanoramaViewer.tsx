import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { RotateCw, Info, ChevronRight, Navigation, Maximize2, Minimize2 } from 'lucide-react';
import type { VRHotspot } from './VRPropertyTourManager';
import { Button } from '@/components/ui/button';

interface VRPanoramaViewerProps {
  imageUrl: string;
  hotspots: VRHotspot[];
  onHotspotClick: (hotspot: VRHotspot) => void;
  autoRotate?: boolean;
  isDayMode?: boolean;
  className?: string;
}

/**
 * Simple CSS-based 360° panorama viewer
 * Uses CSS transforms for drag-to-look functionality
 * More reliable than Three.js/R3F for basic panorama viewing
 */
const VRPanoramaViewer: React.FC<VRPanoramaViewerProps> = ({
  imageUrl,
  hotspots,
  onHotspotClick,
  autoRotate = true,
  isDayMode = true,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Auto-rotate effect
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    
    const interval = setInterval(() => {
      setRotation(prev => ({
        ...prev,
        y: prev.y + 0.15
      }));
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate, isDragging]);

  // Preload image
  useEffect(() => {
    setIsLoading(true);
    setLoadError(false);
    
    const img = new Image();
    img.onload = () => setIsLoading(false);
    img.onerror = () => {
      setIsLoading(false);
      setLoadError(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - lastPos.x;
    const deltaY = e.clientY - lastPos.y;
    
    setRotation(prev => ({
      x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.3)),
      y: prev.y + deltaX * 0.3
    }));
    
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const deltaX = e.touches[0].clientX - lastPos.x;
    const deltaY = e.touches[0].clientY - lastPos.y;
    
    setRotation(prev => ({
      x: Math.max(-60, Math.min(60, prev.x - deltaY * 0.3)),
      y: prev.y + deltaX * 0.3
    }));
    
    setLastPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(1, Math.min(2.5, prev - e.deltaY * 0.001)));
  };

  const getHotspotIcon = (type: string) => {
    switch (type) {
      case 'navigation':
        return <ChevronRight className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <Navigation className="h-4 w-4" />;
    }
  };

  // Convert hotspot pitch/yaw to screen position (simplified)
  const getHotspotStyle = (hotspot: VRHotspot): React.CSSProperties => {
    const yawOffset = hotspot.position.yaw - rotation.y;
    const pitchOffset = hotspot.position.pitch - rotation.x;
    
    // Normalize yaw to -180 to 180
    let normalizedYaw = ((yawOffset % 360) + 540) % 360 - 180;
    
    // Only show if in front hemisphere
    if (Math.abs(normalizedYaw) > 80) return { display: 'none' };
    
    const x = 50 + (normalizedYaw / 80) * 40;
    const y = 50 - (pitchOffset / 60) * 40;
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
      position: 'absolute',
      zIndex: 10
    };
  };

  if (loadError) {
    return (
      <div className={cn("relative w-full h-full bg-muted flex items-center justify-center", className)}>
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">Failed to load panorama image</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 border-border"
            onClick={() => {
              setLoadError(false);
              setIsLoading(true);
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden cursor-grab select-none",
        isDragging && "cursor-grabbing",
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
      onWheel={handleWheel}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted">
          <div className="flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2 text-foreground shadow-lg">
            <RotateCw className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm">Loading panorama...</span>
          </div>
        </div>
      )}

      {/* Panorama image with CSS transform */}
      <div 
        className="absolute inset-0 transition-transform duration-75"
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: `${200 * zoom}% auto`,
          backgroundPosition: `${50 + rotation.y * 0.5}% ${50 + rotation.x * 0.5}%`,
          backgroundRepeat: 'repeat-x',
          filter: isDayMode ? 'none' : 'brightness(0.6) saturate(0.8) hue-rotate(10deg)',
          transition: isDragging ? 'none' : 'background-position 0.1s ease-out'
        }}
      />

      {/* Dark overlay for night mode */}
      {!isDayMode && (
        <div className="absolute inset-0 bg-background/30 pointer-events-none" />
      )}

      {/* Hotspots */}
      {hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          style={getHotspotStyle(hotspot)}
          onClick={(e) => {
            e.stopPropagation();
            onHotspotClick(hotspot);
          }}
          className={cn(
            "group flex items-center justify-center rounded-full p-2.5 transition-all duration-200",
            "bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg",
            "hover:scale-110 cursor-pointer animate-pulse"
          )}
        >
          {getHotspotIcon(hotspot.type)}
          <div className="absolute left-full ml-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-background/95 backdrop-blur-sm rounded-md px-2 py-1 text-xs text-foreground shadow-lg border border-border">
              {hotspot.title}
              {hotspot.description && (
                <p className="text-muted-foreground mt-0.5">{hotspot.description}</p>
              )}
            </div>
          </div>
        </button>
      ))}

      {/* Controls hint */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-card/90 border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground shadow-lg">
          Drag to look around • Scroll to zoom
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-10 flex gap-1">
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-card/90 border border-border shadow-lg"
          onClick={() => setZoom(prev => Math.min(2.5, prev + 0.25))}
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-card/90 border border-border shadow-lg"
          onClick={() => setZoom(prev => Math.max(1, prev - 0.25))}
        >
          <Minimize2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VRPanoramaViewer;
