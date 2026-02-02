import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import {
  Sofa, Bed, UtensilsCrossed, Bath, Briefcase, Trees,
  Sparkles, Loader2, Download, RotateCcw, ArrowLeftRight,
  Palette, Wand2, Save, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { VRTourScene } from './VRPropertyTourManager';

interface VirtualStagingPanelProps {
  scene: VRTourScene | undefined;
  onStagingComplete: (stagedImageUrl: string) => void;
  isFullscreen?: boolean;
}

type RoomType = 'living_room' | 'bedroom' | 'kitchen' | 'bathroom' | 'dining_room' | 'office' | 'outdoor';
type StyleType = 'modern' | 'traditional' | 'minimalist' | 'tropical' | 'luxury' | 'scandinavian' | 'industrial';

const roomTypeIcons: Record<RoomType, React.ReactNode> = {
  living_room: <Sofa className="h-4 w-4" />,
  bedroom: <Bed className="h-4 w-4" />,
  kitchen: <UtensilsCrossed className="h-4 w-4" />,
  bathroom: <Bath className="h-4 w-4" />,
  dining_room: <UtensilsCrossed className="h-4 w-4" />,
  office: <Briefcase className="h-4 w-4" />,
  outdoor: <Trees className="h-4 w-4" />,
};

const styleDescriptions: Record<StyleType, string> = {
  modern: 'Clean lines, neutral colors, contemporary furniture',
  traditional: 'Classic elegance, warm woods, timeless pieces',
  minimalist: 'Simple, uncluttered, functional beauty',
  tropical: 'Bali-inspired, natural materials, lush plants',
  luxury: 'Premium materials, designer pieces, opulent details',
  scandinavian: 'Light woods, cozy textiles, hygge aesthetic',
  industrial: 'Raw materials, urban edge, vintage accents',
};

const VirtualStagingPanel: React.FC<VirtualStagingPanelProps> = ({
  scene,
  onStagingComplete,
  isFullscreen = false
}) => {
  const [roomType, setRoomType] = useState<RoomType>(scene?.roomType || 'living_room');
  const [style, setStyle] = useState<StyleType>('modern');
  const [removeExisting, setRemoveExisting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stagedImageUrl, setStagedImageUrl] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPosition, setComparisonPosition] = useState([50]);

  const handleStageRoom = useCallback(async () => {
    if (!scene?.imageUrl) {
      toast.error('No image available to stage');
      return;
    }

    setIsLoading(true);
    setStagedImageUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('virtual-staging', {
        body: {
          imageUrl: scene.imageUrl,
          roomType,
          style,
          removeExisting,
        },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.stagedImageUrl) {
        setStagedImageUrl(data.stagedImageUrl);
        toast.success('Room staged successfully!');
      }
    } catch (error) {
      console.error('Virtual staging error:', error);
      toast.error('Failed to stage room. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [scene?.imageUrl, roomType, style, removeExisting]);

  const handleSave = useCallback(() => {
    if (stagedImageUrl) {
      onStagingComplete(stagedImageUrl);
      toast.success('Staged image saved to tour!');
    }
  }, [stagedImageUrl, onStagingComplete]);

  const handleDownload = useCallback(() => {
    if (!stagedImageUrl) return;
    
    const link = document.createElement('a');
    link.href = stagedImageUrl;
    link.download = `staged-${scene?.title || 'room'}-${style}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image downloaded!');
  }, [stagedImageUrl, scene?.title, style]);

  const handleReset = useCallback(() => {
    setStagedImageUrl(null);
    setShowComparison(false);
  }, []);

  return (
    <div className={cn(
      "grid gap-4 p-4",
      isFullscreen ? "lg:grid-cols-3 h-screen overflow-auto" : "lg:grid-cols-2"
    )}>
      {/* Preview Panel */}
      <div className={cn(
        "relative rounded-xl overflow-hidden bg-muted",
        isFullscreen ? "lg:col-span-2 h-[500px]" : "h-[400px]"
      )}>
        <AnimatePresence mode="wait">
          {stagedImageUrl && showComparison ? (
            <div className="relative w-full h-full">
              {/* Original Image */}
              <img
                src={scene?.imageUrl}
                alt="Original"
                className="absolute inset-0 w-full h-full object-cover"
              />
              
              {/* Staged Image with clip */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - comparisonPosition[0]}% 0 0)` }}
              >
                <img
                  src={stagedImageUrl}
                  alt="Staged"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Comparison Slider */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                style={{ left: `${comparisonPosition[0]}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                  <ArrowLeftRight className="h-4 w-4 text-gray-600" />
                </div>
              </div>

              {/* Labels */}
              <Badge className="absolute top-4 left-4 bg-background/80">Original</Badge>
              <Badge className="absolute top-4 right-4 bg-primary">Staged</Badge>
            </div>
          ) : (
            <motion.img
              key={stagedImageUrl || scene?.imageUrl}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={stagedImageUrl || scene?.imageUrl}
              alt={scene?.title || 'Room'}
              className="w-full h-full object-cover"
            />
          )}
        </AnimatePresence>

        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 text-white animate-spin" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
            <div className="text-center">
              <p className="text-white font-medium">AI Staging in Progress</p>
              <p className="text-white/70 text-sm">Adding {style} furniture...</p>
            </div>
          </div>
        )}

        {/* Action buttons when staged */}
        {stagedImageUrl && !isLoading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Button
              variant={showComparison ? "default" : "secondary"}
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
              className="bg-background/80 backdrop-blur-sm"
            >
              <ArrowLeftRight className="h-4 w-4 mr-1" />
              Compare
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownload}
              className="bg-background/80 backdrop-blur-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-primary"
            >
              <Save className="h-4 w-4 mr-1" />
              Save to Tour
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="bg-background/80 backdrop-blur-sm"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        )}

        {showComparison && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64">
            <Slider
              value={comparisonPosition}
              onValueChange={setComparisonPosition}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Controls Panel */}
      <Card className="h-fit">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wand2 className="h-4 w-4 text-primary" />
            AI Virtual Staging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Room Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Room Type</Label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(roomTypeIcons) as RoomType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setRoomType(type)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all",
                    roomType === type
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  {roomTypeIcons[type]}
                  <span className="text-[10px] capitalize">
                    {type.replace('_', ' ')}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Style Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Interior Style
            </Label>
            <Select value={style} onValueChange={(v) => setStyle(v as StyleType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(styleDescriptions) as StyleType[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    <div className="flex flex-col">
                      <span className="capitalize font-medium">{s}</span>
                      <span className="text-xs text-muted-foreground">
                        {styleDescriptions[s]}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label className="text-sm font-medium">Remove Existing Furniture</Label>
              <p className="text-xs text-muted-foreground">
                Replace current furniture with new staging
              </p>
            </div>
            <Switch checked={removeExisting} onCheckedChange={setRemoveExisting} />
          </div>

          {/* Generate Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={handleStageRoom}
            disabled={isLoading || !scene?.imageUrl}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Staging Room...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Stage This Room
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            AI will add {style} furniture and decor to this {roomType.replace('_', ' ')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default VirtualStagingPanel;
