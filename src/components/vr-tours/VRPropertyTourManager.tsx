import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye, Glasses, Sofa, Ruler, Sun, Moon, MapPin,
  Play, Pause, RotateCcw, Maximize2, Minimize2, Settings,
  Camera, Share2, Download, ChevronLeft, ChevronRight
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

const VRPropertyTourManager: React.FC<VRPropertyTourManagerProps> = ({
  property,
  scenes,
  className,
  onSaveStaging
}) => {
  const [activeTab, setActiveTab] = useState<'tour' | 'staging' | 'measure' | 'neighborhood'>('tour');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDayMode, setIsDayMode] = useState(true);
  const [showControls, setShowControls] = useState(true);
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
    if (index !== -1) {
      setCurrentSceneIndex(index);
    }
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
    if ('xr' in navigator) {
      setIsVRMode(!isVRMode);
      // WebXR session would be initiated here
    }
  }, [isVRMode]);

  const displayImageUrl = stagedImages[currentScene?.id] || currentScene?.imageUrl;

  const tabs = [
    { id: 'tour', label: '360° Tour', icon: Eye },
    { id: 'staging', label: 'AI Staging', icon: Sofa },
    { id: 'measure', label: 'Measure', icon: Ruler },
    { id: 'neighborhood', label: 'Neighborhood', icon: MapPin },
  ];

  return (
    <Card className={cn(
      "overflow-hidden border-border",
      isFullscreen ? "fixed inset-0 z-50 rounded-none" : "rounded-xl",
      className
    )}>
      <CardHeader className="pb-3 bg-secondary/50 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Glasses className="h-5 w-5 text-primary" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-semibold text-foreground">VR Property Tour</span>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] border-border">
                  {scenes.length} Scenes
                </Badge>
                {isVRMode && (
                  <Badge className="text-[10px] bg-primary text-primary-foreground">VR Active</Badge>
                )}
              </div>
            </div>
          </CardTitle>

          <div className="flex items-center gap-1 sm:gap-2">
            <DayNightToggle isDayMode={isDayMode} onToggle={() => setIsDayMode(!isDayMode)} />
            
            <Button variant="ghost" size="icon" onClick={handleVRMode} className="h-8 w-8">
              <Glasses className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-8 w-8">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <div className="px-3 sm:px-4 py-2 sm:py-3 bg-muted/30 border-b border-border">
            <TabsList className="grid w-full grid-cols-4 bg-background p-1 rounded-lg border border-border">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-md"
                >
                  <tab.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="tour" className="m-0">
            <div className={cn(
              "relative",
              isFullscreen ? "h-screen" : "h-[400px] sm:h-[500px] lg:h-[600px]"
            )}>
              {currentScene && (
                <VRPanoramaViewer
                  imageUrl={displayImageUrl}
                  hotspots={currentScene.hotspots || []}
                  onHotspotClick={(hotspot) => {
                    if (hotspot.targetSceneId) {
                      handleSceneChange(hotspot.targetSceneId);
                    }
                  }}
                  autoRotate={isPlaying}
                  isDayMode={isDayMode}
                  className="w-full h-full"
                />
              )}

              {/* Scene Navigation */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 sm:gap-3 z-10">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handlePrevScene}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-card/90 border border-border shadow-lg"
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <div className="flex items-center gap-1 sm:gap-2 bg-card/90 border border-border rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-lg">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="h-7 w-7 sm:h-8 sm:w-8"
                  >
                    {isPlaying ? <Pause className="h-3 w-3 sm:h-4 sm:w-4" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </Button>
                  
                  <span className="text-xs sm:text-sm font-medium px-1 sm:px-2 text-foreground">
                    {currentSceneIndex + 1} / {scenes.length}
                  </span>
                  
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                    <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleNextScene}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-card/90 border border-border shadow-lg"
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>

              {/* Scene Title */}
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-card/90 border border-border text-foreground px-2 sm:px-3 py-1 sm:py-1.5 shadow-lg">
                  <Eye className="h-3 w-3 mr-1 sm:mr-1.5" />
                  {currentScene?.title || 'Loading...'}
                </Badge>
              </div>

              {/* Thumbnail Strip */}
              <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-10">
                <div className="flex gap-1.5 sm:gap-2 bg-card/80 border border-border rounded-lg sm:rounded-xl p-1.5 sm:p-2 shadow-lg">
                  {scenes.map((scene, index) => (
                    <button
                      key={scene.id}
                      onClick={() => setCurrentSceneIndex(index)}
                      className={cn(
                        "w-12 h-9 sm:w-16 sm:h-12 rounded-md sm:rounded-lg overflow-hidden border-2 transition-all",
                        index === currentSceneIndex
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-transparent hover:border-primary/50"
                      )}
                    >
                      <img
                        src={scene.thumbnailUrl || scene.imageUrl}
                        alt={scene.title}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="staging" className="m-0">
            <VirtualStagingPanel
              scene={currentScene}
              onStagingComplete={(stagedUrl) => handleStagingComplete(currentScene?.id, stagedUrl)}
              isFullscreen={isFullscreen}
            />
          </TabsContent>

          <TabsContent value="measure" className="m-0">
            <DistanceMeasurementTool
              imageUrl={displayImageUrl}
              propertyArea={property.area_sqm}
              isFullscreen={isFullscreen}
            />
          </TabsContent>

          <TabsContent value="neighborhood" className="m-0">
            <NeighborhoodVRExplorer
              property={property}
              isDayMode={isDayMode}
              isFullscreen={isFullscreen}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VRPropertyTourManager;
