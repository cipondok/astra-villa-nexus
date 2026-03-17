import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePropertyVideoGen, VideoGenResult, VideoSegment } from "@/hooks/usePropertyVideoGen";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Upload, Loader2, Video, Film, Play, Pause, Download, Trash2,
  Plus, X, ChevronLeft, ChevronRight, Music, Type, MapPin,
  DollarSign, TrendingUp, Sparkles, GripVertical, Eye, Share2,
  ImageIcon, Clapperboard,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";

/* ── Theme Options ── */
const THEMES = [
  {
    id: "luxury_cinematic",
    label: "Luxury Cinematic",
    desc: "Elegant slow pans, golden hour lighting, premium feel",
    gradient: "from-amber-500/20 to-orange-600/20",
    icon: <Film className="h-5 w-5" />,
  },
  {
    id: "modern_clean",
    label: "Modern Showcase",
    desc: "Crisp transitions, bright lighting, minimalist style",
    gradient: "from-blue-500/20 to-cyan-500/20",
    icon: <Video className="h-5 w-5" />,
  },
  {
    id: "investment_highlight",
    label: "Investment Highlight",
    desc: "Dynamic pacing, data overlays, professional authority",
    gradient: "from-emerald-500/20 to-teal-500/20",
    icon: <TrendingUp className="h-5 w-5" />,
  },
];

const MUSIC_OPTIONS = [
  { id: "ambient", label: "Ambient", desc: "Calm, atmospheric" },
  { id: "cinematic", label: "Cinematic", desc: "Orchestral drama" },
  { id: "upbeat", label: "Upbeat", desc: "Energetic, modern" },
  { id: "none", label: "No Music", desc: "Silent video" },
];

/* ── Timeline Frame ── */
function TimelineFrame({
  src, index, total, isActive, onClick, onRemove,
}: {
  src: string; index: number; total: number; isActive: boolean;
  onClick: () => void; onRemove: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        "relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 cursor-pointer group transition-all",
        isActive ? "border-primary ring-2 ring-primary/30" : "border-border/40 hover:border-border"
      )}
      onClick={onClick}
    >
      <img src={src} alt={`Frame ${index + 1}`} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-full bg-destructive/80 text-destructive-foreground transition-opacity"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
      <span className="absolute bottom-0.5 left-1 text-[9px] font-bold text-white drop-shadow">
        {index + 1}/{total}
      </span>
      {/* Timeline connector */}
      {index < total - 1 && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-border/60 z-10" />
      )}
    </motion.div>
  );
}

/* ── Result Player ── */
function ResultPlayer({
  segments, overlays, onDownload,
}: {
  segments: VideoSegment[];
  overlays: { type: string; text: string }[];
  onDownload: () => void;
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const togglePlay = useCallback(() => {
    if (playing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      intervalRef.current = window.setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= segments.length - 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            setPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 3000);
    }
  }, [playing, segments.length]);

  if (segments.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Main viewport */}
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentFrame}
            src={segments[currentFrame]?.url}
            alt={`Segment ${currentFrame + 1}`}
            className="w-full h-full object-contain"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {/* Text overlays */}
        <AnimatePresence>
          {overlays.length > 0 && currentFrame === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 left-4 right-4"
            >
              <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 space-y-1">
                {overlays.filter(o => o.type === "title").map((o, i) => (
                  <p key={i} className="text-white font-bold text-lg">{o.text}</p>
                ))}
                {overlays.filter(o => o.type === "location").map((o, i) => (
                  <p key={i} className="text-white/80 text-sm flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {o.text}
                  </p>
                ))}
                {overlays.filter(o => o.type === "price").map((o, i) => (
                  <p key={i} className="text-chart-1 font-bold text-base">{o.text}</p>
                ))}
              </div>
            </motion.div>
          )}
          {overlays.filter(o => o.type === "score").length > 0 && currentFrame === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 right-4"
            >
              <Badge className="bg-chart-1/90 text-white border-0 text-sm px-3 py-1">
                {overlays.find(o => o.type === "score")?.text}
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Play/Pause overlay */}
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center group"
        >
          <div className={cn(
            "w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-opacity",
            playing ? "opacity-0 group-hover:opacity-100" : "opacity-100"
          )}>
            {playing ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white ml-0.5" />}
          </div>
        </button>

        {/* Frame counter */}
        <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white border-0 text-[10px]">
          {currentFrame + 1} / {segments.length}
        </Badge>
      </div>

      {/* Segment thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {segments.map((seg, i) => (
          <button
            key={i}
            onClick={() => { setCurrentFrame(i); setPlaying(false); }}
            className={cn(
              "flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden border-2 transition-all",
              currentFrame === i ? "border-primary" : "border-border/40"
            )}
          >
            <img src={seg.thumbnail} alt={`Seg ${i + 1}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="text-xs" onClick={onDownload}>
          <Download className="h-3 w-3 mr-1" /> Download Frames
        </Button>
        <Button variant="outline" size="sm" className="text-xs" disabled>
          <Share2 className="h-3 w-3 mr-1" /> Share (Coming Soon)
        </Button>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function PropertyVideoTourPage() {
  const [images, setImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState("luxury_cinematic");
  const [selectedMusic, setSelectedMusic] = useState("ambient");
  const [result, setResult] = useState<VideoGenResult | null>(null);

  // Property info
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [score, setScore] = useState("");
  const [sellingPoints, setSellingPoints] = useState<string[]>([""]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const videoGen = usePropertyVideoGen();

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 10 - images.length;
    if (remaining <= 0) {
      toast({ title: "Maximum reached", description: "Max 10 images.", variant: "destructive" });
      return;
    }

    Array.from(files).slice(0, remaining).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    if (activeImageIndex >= images.length - 1) setActiveImageIndex(Math.max(0, images.length - 2));
  };

  const handleGenerate = () => {
    if (images.length < 2) {
      toast({ title: "Need more images", description: "Upload at least 2 photos.", variant: "destructive" });
      return;
    }

    videoGen.mutate(
      {
        images,
        theme: selectedTheme,
        property_info: {
          title: title || undefined,
          price: price || undefined,
          location: location || undefined,
          opportunity_score: score ? parseInt(score) : undefined,
          selling_points: sellingPoints.filter(Boolean),
        },
        music_style: selectedMusic,
      },
      {
        onSuccess: (data) => {
          setResult(data);
          toast({ title: "Video tour generated!", description: data.message });
        },
        onError: (err: any) => {
          toast({ title: "Generation failed", description: err?.message || "Try again.", variant: "destructive" });
        },
      }
    );
  };

  const handleDownload = () => {
    if (!result) return;
    result.segments.forEach((seg, i) => {
      const a = document.createElement("a");
      a.href = seg.url;
      a.download = `property_tour_frame_${i + 1}.jpg`;
      a.target = "_blank";
      a.click();
    });
  };

  return (
    <>
      <SEOHead
        title="AI Property Video Tour Generator | ASTRA Villa"
        description="Create cinematic property video tours from listing photos with AI. Generate viral marketing-ready content in minutes."
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-chart-4/20 to-primary/20 flex items-center justify-center">
              <Clapperboard className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Video Tour Generator</h1>
              <p className="text-sm text-muted-foreground">
                Create cinematic property showcases from listing photos
              </p>
            </div>
            <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20 text-[10px] uppercase ml-auto hidden sm:inline-flex">
              AI Video
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel — Controls */}
            <div className="lg:col-span-4 space-y-4">
              {/* Image Upload */}
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold text-foreground">Listing Photos</Label>
                    <span className="text-[10px] text-muted-foreground">{images.length}/10</span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFilesSelect}
                  />

                  {images.length === 0 ? (
                    <button
                      className="w-full h-32 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-7 w-7 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Upload 2-10 property photos</p>
                    </button>
                  ) : (
                    <>
                      {/* Timeline */}
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        <AnimatePresence>
                          {images.map((img, i) => (
                            <TimelineFrame
                              key={`${img.slice(0, 30)}-${i}`}
                              src={img}
                              index={i}
                              total={images.length}
                              isActive={activeImageIndex === i}
                              onClick={() => setActiveImageIndex(i)}
                              onRemove={() => removeImage(i)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={images.length >= 10}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add More Photos
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Theme Selector */}
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <Label className="text-xs font-semibold text-foreground">Video Theme</Label>
                  <div className="space-y-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme.id)}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                          selectedTheme === theme.id
                            ? "border-primary/50 bg-primary/5 shadow-sm"
                            : "border-border/40 hover:border-border hover:bg-muted/30"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg bg-gradient-to-br",
                          theme.gradient,
                          selectedTheme === theme.id ? "text-primary" : "text-muted-foreground"
                        )}>
                          {theme.icon}
                        </div>
                        <div>
                          <p className={cn("text-sm font-medium", selectedTheme === theme.id ? "text-primary" : "text-foreground")}>
                            {theme.label}
                          </p>
                          <p className="text-[11px] text-muted-foreground">{theme.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Music */}
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Music className="h-3.5 w-3.5" /> Background Music
                  </Label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {MUSIC_OPTIONS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMusic(m.id)}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-left transition-all",
                          selectedMusic === m.id
                            ? "border-primary/50 bg-primary/10 text-primary"
                            : "border-border/40 text-muted-foreground hover:border-border"
                        )}
                      >
                        <p className="text-xs font-medium">{m.label}</p>
                        <p className="text-[10px] opacity-70">{m.desc}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Property Info */}
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Type className="h-3.5 w-3.5" /> Text Overlays
                  </Label>

                  <div className="space-y-2">
                    <Input
                      placeholder="Property title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="text-xs h-8"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Price (e.g. Rp 2.5M)"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="text-xs h-8"
                      />
                      <Input
                        placeholder="Score (0-100)"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="text-xs h-8"
                        type="number"
                        min={0}
                        max={100}
                      />
                    </div>
                    <Input
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="text-xs h-8"
                    />

                    <Separator />
                    <p className="text-[10px] text-muted-foreground font-medium">Key Selling Points</p>
                    {sellingPoints.map((sp, i) => (
                      <div key={i} className="flex gap-1">
                        <Input
                          placeholder={`Feature ${i + 1}`}
                          value={sp}
                          onChange={(e) => {
                            const updated = [...sellingPoints];
                            updated[i] = e.target.value;
                            setSellingPoints(updated);
                          }}
                          className="text-xs h-7 flex-1"
                        />
                        {sellingPoints.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setSellingPoints(sellingPoints.filter((_, j) => j !== i))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {sellingPoints.length < 4 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[10px] h-6"
                        onClick={() => setSellingPoints([...sellingPoints, ""])}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Point
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                className="w-full gap-2"
                size="lg"
                disabled={images.length < 2 || videoGen.isPending}
                onClick={handleGenerate}
              >
                {videoGen.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Tour... (1-2 min)
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Video Tour
                  </>
                )}
              </Button>
            </div>

            {/* Right Panel — Preview / Result */}
            <div className="lg:col-span-8">
              <Card className="border-border/50 overflow-hidden h-full">
                <CardContent className="p-4 h-full">
                  <AnimatePresence mode="wait">
                    {videoGen.isPending ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-[520px] flex flex-col items-center justify-center gap-6"
                      >
                        <div className="relative">
                          <Loader2 className="h-16 w-16 animate-spin text-chart-4/60" />
                          <Film className="h-6 w-6 text-chart-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="text-center space-y-2">
                          <p className="text-base font-semibold text-foreground">Creating Your Video Tour</p>
                          <p className="text-sm text-muted-foreground">
                            AI is processing {images.length} photos with {THEMES.find(t => t.id === selectedTheme)?.label} style
                          </p>
                        </div>
                        <div className="w-64 space-y-3">
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-chart-4 to-primary rounded-full"
                              animate={{ width: ["0%", "40%", "70%", "90%"] }}
                              transition={{ duration: 90, ease: "easeOut" }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            {["Analyzing photos...", "Generating cinematic frames...", "Adding transitions & overlays..."].map((step, i) => (
                              <motion.div
                                key={step}
                                initial={{ opacity: 0.3 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 15, duration: 1 }}
                                className="flex items-center gap-2 text-xs text-muted-foreground"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-chart-4/60" />
                                {step}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ) : result && result.segments.length > 0 ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground">Generated Tour Preview</h3>
                            <p className="text-[11px] text-muted-foreground">
                              {result.processed_segments} cinematic frames · {THEMES.find(t => t.id === result.theme)?.label}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px]">{result.theme.replace("_", " ")}</Badge>
                            <Badge variant="outline" className="text-[10px]">{result.music_style}</Badge>
                          </div>
                        </div>
                        <ResultPlayer
                          segments={result.segments}
                          overlays={result.overlays}
                          onDownload={handleDownload}
                        />
                      </motion.div>
                    ) : images.length > 0 ? (
                      <motion.div
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-foreground">Photo Preview</h3>
                          <span className="text-[10px] text-muted-foreground">{activeImageIndex + 1} of {images.length}</span>
                        </div>
                        <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                          <AnimatePresence mode="wait">
                            <motion.img
                              key={activeImageIndex}
                              src={images[activeImageIndex]}
                              alt={`Photo ${activeImageIndex + 1}`}
                              className="w-full h-full object-contain"
                              initial={{ opacity: 0, x: 30 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -30 }}
                              transition={{ duration: 0.3 }}
                            />
                          </AnimatePresence>
                          {/* Navigation arrows */}
                          {images.length > 1 && (
                            <>
                              <button
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                                onClick={() => setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                                onClick={() => setActiveImageIndex((prev) => (prev + 1) % images.length)}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white border-0 text-[10px]">
                            <Eye className="h-3 w-3 mr-1" /> Preview
                          </Badge>
                        </div>

                        {/* Quick info preview */}
                        {(title || price || location) && (
                          <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                            <p className="text-xs font-semibold text-foreground">Overlay Preview:</p>
                            {title && <p className="text-sm font-bold text-foreground">{title}</p>}
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {location}</span>}
                              {price && <span className="flex items-center gap-1 text-chart-1"><DollarSign className="h-3 w-3" /> {price}</span>}
                              {score && <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Score: {score}</span>}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-[520px] flex flex-col items-center justify-center gap-5"
                      >
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-chart-4/10 to-primary/10 flex items-center justify-center">
                          <Clapperboard className="h-10 w-10 text-chart-4/40" />
                        </div>
                        <div className="text-center max-w-sm space-y-2">
                          <p className="text-base font-semibold text-foreground">Create a Property Video Tour</p>
                          <p className="text-sm text-muted-foreground">
                            Upload listing photos, select a cinematic theme, add property details, and generate a professional video tour.
                          </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                          {[
                            { icon: <ImageIcon className="h-5 w-5" />, label: "Upload Photos", step: "1" },
                            { icon: <Film className="h-5 w-5" />, label: "Choose Theme", step: "2" },
                            { icon: <Sparkles className="h-5 w-5" />, label: "Generate Tour", step: "3" },
                          ].map((s) => (
                            <div key={s.step} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/20 border border-border/30">
                              <div className="w-6 h-6 rounded-full bg-chart-4/10 text-chart-4 text-xs font-bold flex items-center justify-center">
                                {s.step}
                              </div>
                              <div className="text-muted-foreground">{s.icon}</div>
                              <p className="text-[11px] text-muted-foreground font-medium text-center">{s.label}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
