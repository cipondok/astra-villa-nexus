import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
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

  const displayImageUrl = stagedImages[currentScene?.id] || currentScene?.imageUrl;

  const tabs = [
    { id: 'tour', label: '360°', icon: Eye },
    { id: 'staging', label: 'Stage', icon: Sofa },
    { id: 'measure', label: 'Measure', icon: Ruler },
    { id: 'neighborhood', label: 'Area', icon: MapPin },
  ];

  return (
    <Card className={cn(
      "overflow-hidden border-border",
      isFullscreen ? "fixed inset-0 z-50 rounded-none" : "rounded-lg",
      className
    )}>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          {/* Compact toolbar: tabs + controls in one row */}
          <div className="flex items-center justify-between gap-2 px-2 py-1 bg-secondary/40 border-b border-border">
            <TabsList className="h-7 bg-background/80 p-0.5 rounded-md border border-border gap-0.5">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="h-6 px-2 text-[10px] gap-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded"
                >
                  <tab.icon className="h-3 w-3" />
                  <span className="hidden xs:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex items-center gap-0.5">
              <Badge variant="outline" className="h-5 text-[9px] border-border px-1.5 hidden sm:flex">
                {scenes.length} rooms
              </Badge>
              <DayNightToggle isDayMode={isDayMode} onToggle={() => setIsDayMode(!isDayMode)} />
              <Button variant="ghost" size="icon" onClick={handleVRMode} className="h-6 w-6">
                <Glasses className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="h-6 w-6">
                {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          <TabsContent value="tour" className="m-0">
            <div className={cn(
              "relative",
              isFullscreen ? "h-screen" : "h-[50vh] sm:h-[55vh] lg:h-[65vh]"
            )}>
              {currentScene && (
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

              {/* Scene Navigation — compact */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handlePrevScene}
                  className="h-8 w-8 rounded-full bg-card/90 border border-border shadow-lg"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center gap-1 bg-card/90 border border-border rounded-full px-2.5 py-1 shadow-lg">
                  <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)} className="h-6 w-6">
                    {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  </Button>
                  <span className="text-[11px] font-medium px-1 text-foreground">
                    {currentSceneIndex + 1}/{scenes.length}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleNextScene}
                  className="h-8 w-8 rounded-full bg-card/90 border border-border shadow-lg"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Scene Title — top left badge */}
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg-card/90 border border-border text-foreground px-2 py-0.5 text-[10px] shadow-lg">
                  <Eye className="h-2.5 w-2.5 mr-1" />
                  {currentScene?.title || 'Loading...'}
                </Badge>
              </div>

              {/* Thumbnail Strip — compact */}
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10">
                <div className="flex gap-1 bg-card/80 border border-border rounded-lg p-1 shadow-lg">
                  {scenes.map((scene, index) => (
                    <button
                      key={scene.id}
                      onClick={() => setCurrentSceneIndex(index)}
                      className={cn(
                        "w-10 h-7 sm:w-14 sm:h-10 rounded overflow-hidden border-2 transition-all",
                        index === currentSceneIndex
                          ? "border-primary ring-1 ring-primary/30"
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