import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Eye, Glasses, Sofa, Ruler, Sun, Moon, MapPin,
  Play, Pause, Maximize2, Minimize2,
  Camera, ChevronLeft, ChevronRight, X, Share2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import VRPanoramaViewer from './VRPanoramaViewer';
import VirtualStagingPanel from './VirtualStagingPanel';
import DistanceMeasurementTool from './DistanceMeasurementTool';
import DayNightToggle from './DayNightToggle';
import NeighborhoodVRExplorer from './NeighborhoodVRExplorer';
import { BaseProperty } from '@/types/property';

export interface VRTourScene {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl?: string;
  roomType: 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'dining_room' | 'office' | 'outdoor';
  position?: { lat: number; lng: number };
  hotspots?: VRHotspot[];
}

export interface VRHotspot {
  id: string;
  type: 'navigation' | 'info' | 'furniture' | 'measurement';
  position: { pitch: number; yaw: number };
  targetSceneId?: string;
  title: string;
  description?: string;
}

interface VRPropertyTourManagerProps {
  property: BaseProperty;
  scenes: VRTourScene[];
  className?: string;
  onSaveStaging?: (sceneId: string, stagedImageUrl: string) => void;
}

type ActiveTool = 'none' | 'staging' | 'measure' | 'neighborhood';

const VRPropertyTourManager: React.FC<VRPropertyTourManagerProps> = ({
  property,
  scenes,
  className,
  onSaveStaging
}) => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('none');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDayMode, setIsDayMode] = useState(true);
  const [isVRMode, setIsVRMode] = useState(false);
  const [stagedImages, setStagedImages] = useState<Record<string, string>>({});

  const currentScene = scenes[currentSceneIndex];

  const handleNextScene = useCallback(() => {
    setCurrentSceneIndex((prev) => (prev + 1) % scenes.length);
  }, [scenes.length]);

  const handlePrevScene = useCallback(() => {
    setCurrentSceneIndex((prev) => (prev - 1 + scenes.length) % scenes.length);
  }, [scenes.length]);

  const handleSceneChange = useCallback((sceneId: string) => {
    const index = scenes.findIndex((s) => s.id === sceneId);
    if (index !== -1) setCurrentSceneIndex(index);
  }, [scenes]);

  const handleStagingComplete = useCallback((sceneId: string, stagedImageUrl: string) => {
    setStagedImages((prev) => ({ ...prev, [sceneId]: stagedImageUrl }));
    onSaveStaging?.(sceneId, stagedImageUrl);
  }, [onSaveStaging]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleVRMode = useCallback(() => {
    if ('xr' in navigator) setIsVRMode(!isVRMode);
  }, [isVRMode]);

  const toggleTool = (tool: ActiveTool) => {
    setActiveTool(prev => prev === tool ? 'none' : tool);
  };

  const displayImageUrl = stagedImages[currentScene?.id] || currentScene?.imageUrl;

  const tools = [
    { id: 'staging' as ActiveTool, label: 'AI Stage', icon: Sofa },
    { id: 'measure' as ActiveTool, label: 'Measure', icon: Ruler },
    { id: 'neighborhood' as ActiveTool, label: 'Area', icon: MapPin },
  ];

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-border bg-card",
      isFullscreen ? "fixed inset-0 z-50 rounded-none" : "",
      className
    )}>
      {/* Main panorama viewer — full area */}
      <div className={cn(
        "relative w-full",
        isFullscreen ? "h-screen" : "h-[60vh] sm:h-[65vh] lg:h-[75vh]"
      )}>
        {activeTool === 'none' && currentScene && (
          <VRPanoramaViewer
            imageUrl={displayImageUrl}
            hotspots={currentScene.hotspots || []}
            onHotspotClick={(hotspot) => {
              if (hotspot.targetSceneId) handleSceneChange(hotspot.targetSceneId);
            }}
            autoRotate={isPlaying}
            isDayMode={isDayMode}
            className="w-full h-full"
          />
        )}

        {/* Tool panels rendered inside the viewer area */}
        {activeTool === 'staging' && (
          <div className="w-full h-full overflow-auto">
            <VirtualStagingPanel
              scene={currentScene}
              onStagingComplete={(stagedUrl) => handleStagingComplete(currentScene?.id, stagedUrl)}
              isFullscreen={isFullscreen}
            />
          </div>
        )}
        {activeTool === 'measure' && (
          <div className="w-full h-full overflow-auto">
            <DistanceMeasurementTool
              imageUrl={displayImageUrl}
              propertyArea={property.area_sqm}
              isFullscreen={isFullscreen}
            />
          </div>
        )}
        {activeTool === 'neighborhood' && (
          <div className="w-full h-full overflow-auto">
            <NeighborhoodVRExplorer
              property={property}
              isDayMode={isDayMode}
              isFullscreen={isFullscreen}
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════ */}
        {/* FLOATING TOOLKIT — overlaid on the image   */}
        {/* ═══════════════════════════════════════════ */}

        {/* Top-left: Scene title + badge */}
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          <Badge className="bg-card/80 backdrop-blur-md border border-border/60 text-foreground px-2.5 py-1 text-[11px] shadow-lg">
            <Eye className="h-3 w-3 mr-1.5 text-primary" />
            {currentScene?.title || 'Loading...'}
          </Badge>
          <Badge className="bg-primary/90 backdrop-blur-md text-primary-foreground px-2 py-1 text-[10px] shadow-lg">
            {currentSceneIndex + 1}/{scenes.length}
          </Badge>
        </div>

        {/* Top-right: Utility controls */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
          <DayNightToggle isDayMode={isDayMode} onToggle={() => setIsDayMode(!isDayMode)} className="scale-75 origin-right" />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleVRMode}
            className="h-8 w-8 bg-card/70 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/90"
          >
            <Glasses className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8 bg-card/70 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/90"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* Left-side: Floating vertical tool strip */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1.5">
          {tools.map((tool) => (
            <motion.button
              key={tool.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleTool(tool.id)}
              className={cn(
                "group relative flex items-center justify-center w-10 h-10 rounded-xl shadow-lg transition-all duration-200",
                "backdrop-blur-md border",
                activeTool === tool.id
                  ? "bg-primary text-primary-foreground border-primary/50 shadow-primary/20"
                  : "bg-card/70 text-foreground border-border/50 hover:bg-card/90"
              )}
            >
              <tool.icon className="h-4 w-4" />
              {/* Tooltip */}
              <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-card/95 backdrop-blur-md border border-border text-[10px] font-medium text-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
                {tool.label}
              </span>
            </motion.button>
          ))}
        </div>

        {/* Bottom-center: Scene navigation + thumbnails */}
        {activeTool === 'none' && (
          <>
            {/* Thumbnail strip */}
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-20">
              <div className="flex gap-1 bg-card/70 backdrop-blur-md border border-border/50 rounded-lg p-1 shadow-xl">
                {scenes.map((scene, index) => (
                  <button
                    key={scene.id}
                    onClick={() => setCurrentSceneIndex(index)}
                    className={cn(
                      "relative w-12 h-8 sm:w-14 sm:h-10 rounded-md overflow-hidden border-2 transition-all",
                      index === currentSceneIndex
                        ? "border-primary ring-1 ring-primary/40 scale-105"
                        : "border-transparent hover:border-primary/40 opacity-70 hover:opacity-100"
                    )}
                  >
                    <img
                      src={scene.thumbnailUrl || scene.imageUrl}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                    {index === currentSceneIndex && (
                      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Playback controls */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevScene}
                className="h-9 w-9 rounded-full bg-card/70 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/90"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
                className="h-9 w-9 rounded-full bg-card/70 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/90"
              >
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextScene}
                className="h-9 w-9 rounded-full bg-card/70 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/90"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="w-px h-5 bg-border/50 mx-0.5" />

              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-card/70 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/90"
              >
                <Camera className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-card/70 backdrop-blur-md border border-border/50 shadow-lg hover:bg-card/90"
              >
                <Share2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </>
        )}

        {/* Active tool close button */}
        {activeTool !== 'none' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setActiveTool('none')}
            className="absolute bottom-3 right-3 z-30 flex items-center gap-1.5 px-3 py-2 rounded-full bg-card/80 backdrop-blur-md border border-border/50 shadow-xl text-xs font-medium text-foreground hover:bg-card/95 transition-colors"
          >
            <X className="h-3 w-3" />
            Back to 360°
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default VRPropertyTourManager;