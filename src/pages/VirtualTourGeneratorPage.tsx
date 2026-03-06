import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useVirtualTourGenerator, type VirtualTourResult, type TourImage, type TourHotspot } from "@/hooks/useVirtualTourGenerator";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video, Plus, Trash2, Loader2, ChevronLeft, ChevronRight, Play, Pause,
  MapPin, Clock, Star, Eye, Sparkles, Volume2, X
} from "lucide-react";

const categoryColors: Record<string, string> = {
  feature: "bg-blue-500",
  material: "bg-amber-500",
  amenity: "bg-green-500",
  view: "bg-purple-500",
  dimension: "bg-cyan-500",
};

const moodEmoji: Record<string, string> = {
  cozy: "🏠", spacious: "✨", luxurious: "💎", bright: "☀️", serene: "🌿",
  modern: "🔷", elegant: "🌟", warm: "🔥", airy: "🌬️", rustic: "🪵",
};

export default function VirtualTourGeneratorPage() {
  const generator = useVirtualTourGenerator();
  const [result, setResult] = useState<VirtualTourResult | null>(null);
  const [images, setImages] = useState<TourImage[]>([{ url: "", label: "" }, { url: "", label: "" }]);
  const [propertyTitle, setPropertyTitle] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [currentStop, setCurrentStop] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<TourHotspot | null>(null);
  const [showNarration, setShowNarration] = useState(true);

  const addImage = () => setImages((p) => [...p, { url: "", label: "" }]);
  const removeImage = (i: number) => setImages((p) => p.filter((_, idx) => idx !== i));
  const updateImage = (i: number, field: keyof TourImage, value: string) =>
    setImages((p) => p.map((img, idx) => (idx === i ? { ...img, [field]: value } : img)));

  const handleGenerate = async () => {
    const validImages = images.filter((img) => img.url.startsWith("http"));
    if (validImages.length < 2) {
      toast.error("Please provide at least 2 valid image URLs");
      return;
    }
    try {
      const res = await generator.mutateAsync({
        images: validImages,
        property_title: propertyTitle || undefined,
        property_type: propertyType || undefined,
        location: location || undefined,
      });
      setResult(res);
      setCurrentStop(0);
      toast.success("Virtual tour generated!");
    } catch (err: any) {
      toast.error(err?.message || "Generation failed");
    }
  };

  const orderedStops = result
    ? result.suggested_flow.map((idx) => result.stops.find((s) => s.image_index === idx)).filter(Boolean)
    : [];

  const current = orderedStops[currentStop];
  const currentImage = current && result ? result.images[current.image_index] : null;

  const goNext = useCallback(() => {
    if (currentStop < orderedStops.length - 1) setCurrentStop((p) => p + 1);
    else setIsPlaying(false);
    setActiveHotspot(null);
  }, [currentStop, orderedStops.length]);

  const goPrev = useCallback(() => {
    if (currentStop > 0) setCurrentStop((p) => p - 1);
    setActiveHotspot(null);
  }, [currentStop]);

  // Auto-play
  useState(() => {
    if (!isPlaying) return;
    const timer = setTimeout(goNext, 8000);
    return () => clearTimeout(timer);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* If no result yet, show setup */}
      {!result ? (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <Video className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Virtual Tour Generator</h1>
              <p className="text-muted-foreground">Create narrated property tours from images</p>
            </div>
          </div>

          {/* Property Info */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details (Optional)</CardTitle>
              <CardDescription>Helps the AI create more relevant narration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Property Title</Label>
                  <Input value={propertyTitle} onChange={(e) => setPropertyTitle(e.target.value)} placeholder="Sunset Villa Bali" />
                </div>
                <div>
                  <Label>Type</Label>
                  <Input value={propertyType} onChange={(e) => setPropertyType(e.target.value)} placeholder="Villa / Apartment" />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Seminyak, Bali" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Property Images</CardTitle>
              <CardDescription>Add 2-10 image URLs. The AI will detect rooms and create a tour flow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {images.map((img, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-xs">Image URL {i + 1} *</Label>
                    <Input value={img.url} onChange={(e) => updateImage(i, "url", e.target.value)} placeholder="https://..." />
                  </div>
                  <div className="w-32">
                    <Label className="text-xs">Label</Label>
                    <Input value={img.label || ""} onChange={(e) => updateImage(i, "label", e.target.value)} placeholder="Living room" />
                  </div>
                  {images.length > 2 && (
                    <Button variant="ghost" size="icon" onClick={() => removeImage(i)} className="shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {images.length < 10 && (
                <Button variant="outline" size="sm" onClick={addImage}><Plus className="h-4 w-4 mr-1" /> Add Image</Button>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleGenerate} size="lg" className="w-full" disabled={generator.isPending}>
            {generator.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Tour...</> : <><Sparkles className="mr-2 h-4 w-4" /> Generate Virtual Tour</>}
          </Button>
        </div>
      ) : (
        /* Tour Viewer */
        <div className="flex flex-col h-screen">
          {/* Top Bar */}
          <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h2 className="font-semibold text-foreground text-sm">{result.tour_title}</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" /> {result.estimated_duration_minutes} min
                  <span>•</span>
                  <Eye className="h-3 w-3" /> {orderedStops.length} stops
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowNarration((p) => !p)}>
                <Volume2 className={`h-4 w-4 ${showNarration ? "text-primary" : "text-muted-foreground"}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsPlaying((p) => !p)}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Main Viewer */}
          <div className="flex-1 relative overflow-hidden bg-black">
            {currentImage && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStop}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <img
                    src={currentImage.url}
                    alt={current?.room_name}
                    className="w-full h-full object-cover"
                  />

                  {/* Hotspots */}
                  <TooltipProvider>
                    {current?.hotspots.map((hs, i) => (
                      <Tooltip key={i}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setActiveHotspot(activeHotspot === hs ? null : hs)}
                            className={`absolute w-6 h-6 rounded-full border-2 border-white/80 shadow-lg transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 ${categoryColors[hs.category]} ${activeHotspot === hs ? "scale-150 ring-2 ring-white" : "animate-pulse"}`}
                            style={{ left: `${hs.x_percent}%`, top: `${hs.y_percent}%` }}
                          >
                            <span className="sr-only">{hs.label}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="font-semibold">{hs.label}</p>
                          <p className="text-xs text-muted-foreground">{hs.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </TooltipProvider>

                  {/* Hotspot Detail Panel */}
                  <AnimatePresence>
                    {activeHotspot && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-24 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-border"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <Badge className={`${categoryColors[activeHotspot.category]} text-white text-xs mb-1`}>{activeHotspot.category}</Badge>
                            <h4 className="font-semibold text-foreground">{activeHotspot.label}</h4>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setActiveHotspot(null)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{activeHotspot.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Room Info Overlay */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm border-0">
                      {moodEmoji[current?.mood || ""] || "🏠"} {current?.room_name}
                    </Badge>
                    <Badge variant="secondary" className="bg-black/40 text-white/80 backdrop-blur-sm border-0 text-xs">
                      {currentStop + 1} / {orderedStops.length}
                    </Badge>
                  </div>

                  {/* Features */}
                  <div className="absolute top-4 right-4 flex flex-wrap gap-1 justify-end max-w-xs">
                    {current?.key_features.slice(0, 4).map((f, i) => (
                      <Badge key={i} variant="outline" className="bg-black/40 text-white/90 border-white/20 text-xs backdrop-blur-sm">
                        {f}
                      </Badge>
                    ))}
                  </div>

                  {/* Narration */}
                  {showNarration && current && (
                    <motion.div
                      key={`narration-${currentStop}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-20 left-4 right-4 md:left-8 md:right-8"
                    >
                      <div className="bg-black/70 backdrop-blur-md rounded-xl px-5 py-3 max-w-2xl mx-auto">
                        <p className="text-white/90 text-sm md:text-base leading-relaxed italic">"{current.narration}"</p>
                        {current.transition_text && (
                          <p className="text-white/50 text-xs mt-2">→ {current.transition_text}</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Nav arrows */}
                  <button
                    onClick={goPrev}
                    disabled={currentStop === 0}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={goNext}
                    disabled={currentStop === orderedStops.length - 1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Bottom Strip - Thumbnails */}
          <div className="bg-card border-t border-border px-4 py-2 shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {orderedStops.map((stop, i) => {
                const img = result.images[stop!.image_index];
                return (
                  <button
                    key={i}
                    onClick={() => { setCurrentStop(i); setActiveHotspot(null); }}
                    className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${i === currentStop ? "border-primary ring-1 ring-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={img.url} alt={stop!.room_name} className="w-20 h-14 object-cover" />
                    <p className="text-[10px] text-center text-muted-foreground truncate px-1 py-0.5">{stop!.room_name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Highlights Bar */}
          {currentStop === 0 && (
            <div className="bg-card/50 border-t border-border px-4 py-2 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto">
                <Star className="h-4 w-4 text-primary shrink-0" />
                {result.property_highlights.map((h, i) => (
                  <Badge key={i} variant="outline" className="shrink-0 text-xs">{h}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
