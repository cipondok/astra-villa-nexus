import React, { useState, useEffect, useCallback } from 'react';
import { useVideoTours, TourScene, TourHotspot } from '@/hooks/useVideoTours';
import Panorama360Viewer from './Panorama360Viewer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Camera, ChevronLeft, ChevronRight, Grid3X3, 
  Maximize2, Play, Video, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoTourViewerProps {
  tourId: string;
  className?: string;
  autoStart?: boolean;
}

const VideoTourViewer: React.FC<VideoTourViewerProps> = ({
  tourId,
  className,
  autoStart = false
}) => {
  const { useTourDetails, trackView } = useVideoTours();
  const { data, isLoading } = useTourDetails(tourId);
  
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSceneList, setShowSceneList] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());

  const tour = data?.tour;
  const scenes = data?.scenes || [];
  const allHotspots = data?.hotspots || [];

  // Set initial scene
  useEffect(() => {
    if (scenes.length > 0 && !currentSceneId) {
      const entryScene = scenes.find(s => s.is_entry_point) || scenes[0];
      setCurrentSceneId(entryScene.id);
    }
  }, [scenes, currentSceneId]);

  // Track view
  useEffect(() => {
    if (tour && autoStart) {
      trackView({
        tour_id: tour.id,
        session_id: sessionId,
        device_type: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
      });
    }
  }, [tour, sessionId, autoStart, trackView]);

  const currentScene = scenes.find(s => s.id === currentSceneId);
  const currentHotspots = allHotspots.filter(h => h.scene_id === currentSceneId);
  const currentIndex = scenes.findIndex(s => s.id === currentSceneId);

  const handleSceneChange = useCallback((sceneId: string) => {
    setCurrentSceneId(sceneId);
  }, []);

  const handlePrevScene = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentSceneId(scenes[currentIndex - 1].id);
    }
  }, [currentIndex, scenes]);

  const handleNextScene = useCallback(() => {
    if (currentIndex < scenes.length - 1) {
      setCurrentSceneId(scenes[currentIndex + 1].id);
    }
  }, [currentIndex, scenes]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
    
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [isFullscreen]);

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="aspect-video w-full rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!tour || !currentScene) {
    return (
      <div className={cn("flex items-center justify-center aspect-video bg-muted rounded-xl", className)}>
        <div className="text-center text-muted-foreground">
          <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Tour not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Main viewer */}
      <div className="relative">
        <Panorama360Viewer
          scene={currentScene}
          hotspots={currentHotspots}
          onSceneChange={handleSceneChange}
          settings={tour.settings}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />

        {/* Navigation arrows */}
        {scenes.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={handlePrevScene}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              onClick={handleNextScene}
              disabled={currentIndex === scenes.length - 1}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Scene counter */}
        <div className="absolute top-4 right-4 z-10">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            <Camera className="h-3 w-3 mr-1" />
            {currentIndex + 1} / {scenes.length}
          </Badge>
        </div>

        {/* Scene list toggle */}
        <Sheet open={showSceneList} onOpenChange={setShowSceneList}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-16 right-4 h-10 w-10 bg-background/80 backdrop-blur-sm"
            >
              <Grid3X3 className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Tour Scenes</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-2">
              {scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => {
                    handleSceneChange(scene.id);
                    setShowSceneList(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                    scene.id === currentSceneId 
                      ? "bg-primary/10 border border-primary" 
                      : "hover:bg-muted"
                  )}
                >
                  <div className="relative w-16 h-10 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={scene.thumbnail_url || scene.image_url}
                      alt={scene.title}
                      className="w-full h-full object-cover"
                    />
                    {scene.is_entry_point && (
                      <Badge className="absolute -top-1 -right-1 h-4 text-[10px] px-1">
                        Start
                      </Badge>
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{scene.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Scene {index + 1}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Scene thumbnails */}
      {scenes.length > 1 && (
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {scenes.map((scene, index) => (
              <button
                key={scene.id}
                onClick={() => handleSceneChange(scene.id)}
                className={cn(
                  "relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all",
                  scene.id === currentSceneId
                    ? "ring-2 ring-primary ring-offset-2"
                    : "opacity-70 hover:opacity-100"
                )}
              >
                <img
                  src={scene.thumbnail_url || scene.image_url}
                  alt={scene.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-1 left-1 text-[10px] text-white font-medium">
                  {index + 1}. {scene.title}
                </span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      )}

      {/* Tour info */}
      <div className="flex items-center justify-between text-sm">
        <div>
          <h3 className="font-medium">{tour.title}</h3>
          {tour.description && (
            <p className="text-muted-foreground text-xs line-clamp-1">
              {tour.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {tour.is_vr_enabled && (
            <Badge variant="outline" className="text-xs">
              VR Ready
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {tour.view_count} views
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default VideoTourViewer;
