import { useState, useRef } from "react";
import { useVirtualStaging, VirtualStagingResult } from "@/hooks/useVirtualStaging";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Upload, Loader2, Image as ImageIcon, ArrowRight,
  Download, RotateCcw, Wand2, Sofa, ChefHat, BedDouble, Bath, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";

const ROOM_TYPES = [
  { value: "living room", label: "Living Room", icon: <Sofa className="h-3.5 w-3.5" /> },
  { value: "bedroom", label: "Bedroom", icon: <BedDouble className="h-3.5 w-3.5" /> },
  { value: "kitchen", label: "Kitchen", icon: <ChefHat className="h-3.5 w-3.5" /> },
  { value: "bathroom", label: "Bathroom", icon: <Bath className="h-3.5 w-3.5" /> },
  { value: "dining room", label: "Dining Room", icon: <Building2 className="h-3.5 w-3.5" /> },
  { value: "office", label: "Home Office", icon: <Building2 className="h-3.5 w-3.5" /> },
];

const STYLES = [
  { value: "modern minimalist", label: "Modern Minimalist" },
  { value: "Scandinavian", label: "Scandinavian" },
  { value: "tropical Balinese", label: "Tropical Balinese" },
  { value: "industrial chic", label: "Industrial Chic" },
  { value: "luxury contemporary", label: "Luxury Contemporary" },
  { value: "mid-century modern", label: "Mid-Century Modern" },
  { value: "Japanese zen", label: "Japanese Zen" },
  { value: "coastal hamptons", label: "Coastal Hamptons" },
];

export default function VirtualStagingTool() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [roomType, setRoomType] = useState("living room");
  const [style, setStyle] = useState("modern minimalist");
  const [results, setResults] = useState<VirtualStagingResult[]>([]);
  const [activeResult, setActiveResult] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [sliderPos, setSliderPos] = useState(50);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const staging = useVirtualStaging();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSourceImage(ev.target?.result as string);
      setResults([]);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    if (!sourceImage) return;
    staging.mutate(
      { imageUrl: sourceImage, roomType, style },
      {
        onSuccess: (result) => {
          setResults((prev) => [...prev, result]);
          setActiveResult(results.length);
          setShowComparison(true);
          toast({ title: "Staging complete!", description: `${result.room_type} styled as ${result.style}` });
        },
        onError: (err: any) => {
          const msg = err?.message || "Failed to generate staging";
          toast({ title: "Staging failed", description: msg, variant: "destructive" });
        },
      }
    );
  };

  const currentResult = results[activeResult];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Wand2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Virtual Staging</h1>
          <p className="text-sm text-muted-foreground">Transform empty rooms into beautifully furnished spaces</p>
        </div>
        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase ml-auto">
          AI-Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <Card className="lg:col-span-1 border-border/50">
          <CardContent className="p-4 space-y-5">
            {/* Upload */}
            <div>
              <Label className="text-xs font-semibold text-foreground mb-2 block">Source Photo</Label>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
              {sourceImage ? (
                <div className="relative group">
                  <img src={sourceImage} alt="Source" className="w-full h-40 object-cover rounded-lg border border-border/50" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-7 bg-background/80 backdrop-blur-sm text-xs"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" /> Change
                  </Button>
                </div>
              ) : (
                <button
                  className="w-full h-40 border-2 border-dashed border-border/60 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Upload empty room photo</span>
                </button>
              )}
            </div>

            {/* Room Type */}
            <div>
              <Label className="text-xs font-semibold text-foreground mb-2 block">Room Type</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {ROOM_TYPES.map((rt) => (
                  <button
                    key={rt.value}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs transition-all",
                      roomType === rt.value
                        ? "border-primary/50 bg-primary/10 text-primary font-medium"
                        : "border-border/40 text-muted-foreground hover:border-border"
                    )}
                    onClick={() => setRoomType(rt.value)}
                  >
                    {rt.icon} {rt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style */}
            <div>
              <Label className="text-xs font-semibold text-foreground mb-2 block">Design Style</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-xs">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate */}
            <Button
              className="w-full gap-2"
              disabled={!sourceImage || staging.isPending}
              onClick={handleGenerate}
            >
              {staging.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Staging... (30-60s)
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Staging
                </>
              )}
            </Button>

            {/* Previous results */}
            {results.length > 1 && (
              <div>
                <Label className="text-xs font-semibold text-foreground mb-2 block">Variations ({results.length})</Label>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {results.map((r, i) => (
                    <button
                      key={i}
                      className={cn(
                        "flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                        activeResult === i ? "border-primary" : "border-border/40"
                      )}
                      onClick={() => { setActiveResult(i); setShowComparison(true); }}
                    >
                      <img src={r.staged_image_url} alt={`V${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Result viewer */}
        <Card className="lg:col-span-2 border-border/50 overflow-hidden">
          <CardContent className="p-0">
            {staging.isPending ? (
              <div className="h-96 flex flex-col items-center justify-center gap-4 bg-muted/10">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <Sparkles className="h-5 w-5 text-primary absolute -top-1 -right-1 animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">AI is furnishing the room...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Applying {style} style to {roomType}
                  </p>
                </div>
              </div>
            ) : currentResult && showComparison ? (
              <div className="relative">
                {/* Before/After Comparison Slider */}
                <div
                  className="relative h-96 sm:h-[500px] overflow-hidden cursor-ew-resize select-none"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setSliderPos(((e.clientX - rect.left) / rect.width) * 100);
                  }}
                  onTouchMove={(e) => {
                    const touch = e.touches[0];
                    const rect = e.currentTarget.getBoundingClientRect();
                    setSliderPos(((touch.clientX - rect.left) / rect.width) * 100);
                  }}
                >
                  {/* After (staged) - full width behind */}
                  <img
                    src={currentResult.staged_image_url}
                    alt="Staged"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Before (original) - clipped */}
                  {sourceImage && (
                    <div
                      className="absolute inset-0 overflow-hidden"
                      style={{ width: `${sliderPos}%` }}
                    >
                      <img
                        src={sourceImage}
                        alt="Original"
                        className="w-full h-full object-cover"
                        style={{ width: `${10000 / sliderPos}%`, maxWidth: "none" }}
                      />
                    </div>
                  )}
                  {/* Slider line */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
                    style={{ left: `${sliderPos}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                      <ArrowRight className="h-3 w-3 text-foreground rotate-180" />
                      <ArrowRight className="h-3 w-3 text-foreground" />
                    </div>
                  </div>
                  {/* Labels */}
                  <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground border-border/50 text-[10px]">
                    Before
                  </Badge>
                  <Badge className="absolute top-3 right-3 bg-primary/80 backdrop-blur-sm text-white border-0 text-[10px]">
                    AI Staged
                  </Badge>
                </div>

                {/* Actions bar */}
                <div className="flex items-center justify-between p-3 bg-muted/30 border-t border-border/30">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">{currentResult.room_type}</Badge>
                    <Badge variant="outline" className="text-[10px]">{currentResult.style}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = currentResult.staged_image_url;
                        a.download = `staged-${currentResult.room_type}-${Date.now()}.png`;
                        a.click();
                      }}
                    >
                      <Download className="h-3 w-3 mr-1" /> Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      disabled={staging.isPending}
                      onClick={handleGenerate}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" /> Regenerate
                    </Button>
                  </div>
                </div>

                {/* AI Description */}
                {currentResult.description && (
                  <div className="px-3 pb-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">{currentResult.description}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 flex flex-col items-center justify-center gap-4 bg-muted/10">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-primary/50" />
                </div>
                <div className="text-center max-w-xs">
                  <p className="text-sm font-medium text-foreground">Upload & Stage</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload an empty room photo, choose a style, and let AI furnish it instantly
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
