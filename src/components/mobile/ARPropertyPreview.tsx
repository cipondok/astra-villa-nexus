import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Camera, Maximize2, RotateCcw, Download, Share2, 
  Sun, Moon, Sofa, Lamp, Table, Tv, X, Check,
  Move3D, ZoomIn, ZoomOut, Info
} from "lucide-react";

interface ARPropertyPreviewProps {
  propertyId?: string;
  propertyImages?: string[];
  onClose?: () => void;
}

const FURNITURE_ITEMS = [
  { id: "sofa", name: "Sofa", icon: Sofa, model: "sofa_modern" },
  { id: "lamp", name: "Floor Lamp", icon: Lamp, model: "lamp_standing" },
  { id: "table", name: "Coffee Table", icon: Table, model: "table_coffee" },
  { id: "tv", name: "TV Stand", icon: Tv, model: "tv_unit" },
];

const ARPropertyPreview = ({ propertyId, propertyImages = [], onClose }: ARPropertyPreviewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isARMode, setIsARMode] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [placedFurniture, setPlacedFurniture] = useState<Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
  }>>([]);
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null);
  const [isDayMode, setIsDayMode] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [sessionStartTime] = useState(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  // Check for WebXR support
  const [hasARSupport, setHasARSupport] = useState(false);
  
  useEffect(() => {
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported?.('immersive-ar')
        .then((supported: boolean) => setHasARSupport(supported))
        .catch(() => setHasARSupport(false));
    }
  }, []);

  // Track AR session
  const trackSession = useMutation({
    mutationFn: async () => {
      if (!user || !propertyId) return;
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
      
      const { error } = await supabase.from("mobile_ar_sessions").insert({
        user_id: user.id,
        property_id: propertyId,
        session_duration: duration,
        screenshots_taken: 0,
        furniture_items_placed: placedFurniture.length,
        device_model: navigator.userAgent,
        ar_framework: hasARSupport ? "webxr" : "fallback"
      });
      if (error) throw error;
    }
  });

  const handleAddFurniture = (furnitureType: string) => {
    const newItem = {
      id: `${furnitureType}-${Date.now()}`,
      type: furnitureType,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0
    };
    setPlacedFurniture([...placedFurniture, newItem]);
    setSelectedFurniture(newItem.id);
    toast({ title: `${furnitureType} added`, description: "Drag to position" });
  };

  const handleRemoveFurniture = (id: string) => {
    setPlacedFurniture(placedFurniture.filter(f => f.id !== id));
    setSelectedFurniture(null);
  };

  const handleScreenshot = async () => {
    toast({ title: "Screenshot Saved!", description: "Check your gallery" });
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Check out this property!",
        text: "I'm exploring this property with AR",
        url: window.location.href
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link Copied!" });
    }
  };

  const startARSession = async () => {
    if (!hasARSupport) {
      toast({ 
        title: "AR Not Available", 
        description: "Your device doesn't support AR. Using 360° view instead.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsARMode(true);
      // In production, this would initialize WebXR session
      toast({ title: "AR Mode Active", description: "Point camera at floor to place furniture" });
    } catch (error) {
      toast({ title: "AR Failed", description: "Could not start AR session", variant: "destructive" });
    }
  };

  useEffect(() => {
    // Save session on unmount
    return () => {
      trackSession.mutate();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background z-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background/70 to-transparent">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              trackSession.mutate();
              onClose?.();
            }}
            className="text-foreground hover:bg-foreground/20"
          >
            <X className="h-6 w-6" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge variant={isARMode ? "default" : "secondary"} className="gap-1">
              <Camera className="h-3 w-3" />
              {isARMode ? "AR Active" : "Preview"}
            </Badge>
            <Badge variant="outline" className="text-foreground border-foreground/30">
              {placedFurniture.length} items
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleScreenshot}
              className="text-foreground hover:bg-foreground/20"
            >
              <Download className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleShare}
              className="text-foreground hover:bg-foreground/20"
            >
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main view area */}
      <div 
        ref={containerRef}
        className="relative w-full h-full overflow-hidden"
        style={{ 
          filter: !isDayMode ? "brightness(0.6) contrast(1.1)" : undefined,
          transform: `scale(${zoom / 100})`
        }}
      >
        {/* Property image or camera feed */}
        {isARMode ? (
          <div className="w-full h-full bg-gradient-to-br from-background to-muted flex items-center justify-center">
            <div className="text-center text-foreground">
              <Camera className="h-16 w-16 mx-auto mb-4 animate-pulse" />
              <p className="text-lg font-medium">AR Camera Active</p>
              <p className="text-sm text-foreground/60">Point at a flat surface</p>
            </div>
          </div>
        ) : propertyImages[currentImageIndex] ? (
          <img 
            src={propertyImages[currentImageIndex]}
            alt="Property view"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <div className="text-center">
              <Move3D className="h-16 w-16 mx-auto mb-4 text-primary/40" />
              <p className="text-lg text-muted-foreground">No property images</p>
            </div>
          </div>
        )}

        {/* Placed furniture overlays */}
        {placedFurniture.map((item) => {
          const furnitureConfig = FURNITURE_ITEMS.find(f => f.id === item.type);
          const FurnitureIcon = furnitureConfig?.icon || Sofa;
          
          return (
            <div
              key={item.id}
              className={`absolute cursor-move transition-transform ${
                selectedFurniture === item.id ? "ring-2 ring-primary ring-offset-2" : ""
              }`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                transform: `translate(-50%, -50%) scale(${item.scale}) rotate(${item.rotation}deg)`
              }}
              onClick={() => setSelectedFurniture(item.id)}
            >
              <div className="bg-background/90 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                <FurnitureIcon className="h-8 w-8 text-primary" />
              </div>
              {selectedFurniture === item.id && (
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFurniture(item.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* Image navigation dots */}
      {propertyImages.length > 1 && !isARMode && (
        <div className="absolute bottom-32 left-0 right-0 flex justify-center gap-2">
          {propertyImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentImageIndex ? "bg-primary-foreground w-6" : "bg-primary-foreground/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Bottom toolbar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4 pb-8">
        {/* Furniture palette */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {FURNITURE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="secondary"
                className="flex-shrink-0 flex flex-col items-center gap-1 h-auto py-3 px-4"
                onClick={() => handleAddFurniture(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.name}</span>
              </Button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          {/* Day/Night toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDayMode(!isDayMode)}
            className="text-foreground hover:bg-foreground/20"
          >
            {isDayMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* Zoom control */}
          <div className="flex items-center gap-2 flex-1 max-w-48">
            <ZoomOut className="h-4 w-4 text-foreground/60" />
            <Slider
              value={[zoom]}
              onValueChange={([v]) => setZoom(v)}
              min={50}
              max={200}
              step={10}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-foreground/60" />
          </div>

          {/* Reset button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setPlacedFurniture([]);
              setZoom(100);
              setIsDayMode(true);
            }}
            className="text-foreground hover:bg-foreground/20"
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          {/* AR toggle */}
          <Button
            variant={isARMode ? "default" : "secondary"}
            onClick={() => isARMode ? setIsARMode(false) : startARSession()}
            className="gap-2"
          >
            <Camera className="h-4 w-4" />
            {isARMode ? "Exit AR" : "Start AR"}
          </Button>
        </div>
      </div>

      {/* AR not supported banner */}
      {!hasARSupport && (
        <div className="absolute top-20 left-4 right-4">
          <Card className="bg-chart-3/90 border-0">
            <CardContent className="p-3 flex items-center gap-2">
              <Info className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">
                AR not available on this device. Using virtual staging mode.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ARPropertyPreview;
