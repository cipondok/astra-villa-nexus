import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAIImageEnhance, EnhanceResult } from "@/hooks/useAIImageEnhance";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  Upload, Loader2, Sparkles, Sun, Focus, Eraser, Palette, CloudSun,
  Trash2, Sofa, BedDouble, ChefHat, Bath, Building2, TreePine,
  Download, RotateCcw, ArrowLeftRight, ImageIcon, Wand2, Crown,
  ChevronLeft, ChevronRight, Save,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";

/* ── Enhancement Presets ── */
const ENHANCE_PRESETS = [
  { id: "auto_optimize", label: "Auto Optimize", icon: <Sparkles className="h-4 w-4" />, desc: "One-click professional enhancement" },
  { id: "brightness", label: "Brighten", icon: <Sun className="h-4 w-4" />, desc: "Fix dark & underexposed photos" },
  { id: "sharpness", label: "Sharpen", icon: <Focus className="h-4 w-4" />, desc: "Improve clarity and detail" },
  { id: "noise_reduction", label: "Denoise", icon: <Eraser className="h-4 w-4" />, desc: "Clean low-light grain" },
  { id: "color_correction", label: "Color Fix", icon: <Palette className="h-4 w-4" />, desc: "Accurate, vibrant colors" },
  { id: "hdr_effect", label: "HDR Effect", icon: <Sun className="h-4 w-4" />, desc: "Dramatic dynamic range" },
  { id: "twilight", label: "Twilight", icon: <CloudSun className="h-4 w-4" />, desc: "Beautiful dusk atmosphere" },
];

/* ── Staging Styles ── */
const STAGING_STYLES = [
  { id: "modern_luxury", label: "Modern Luxury", icon: <Crown className="h-4 w-4" />, desc: "High-end designer interiors" },
  { id: "minimalist", label: "Minimalist", icon: <Building2 className="h-4 w-4" />, desc: "Clean, simple, functional" },
  { id: "investment_ready", label: "Investment Ready", icon: <Sparkles className="h-4 w-4" />, desc: "Mass-market rental appeal" },
  { id: "tropical_resort", label: "Tropical Resort", icon: <TreePine className="h-4 w-4" />, desc: "Bali-inspired natural" },
  { id: "scandinavian", label: "Scandinavian", icon: <Sofa className="h-4 w-4" />, desc: "Light wood & cozy textiles" },
  { id: "industrial", label: "Industrial Chic", icon: <Building2 className="h-4 w-4" />, desc: "Urban exposed materials" },
];

const ROOM_TYPES = [
  { value: "living room", label: "Living Room", icon: <Sofa className="h-3.5 w-3.5" /> },
  { value: "bedroom", label: "Bedroom", icon: <BedDouble className="h-3.5 w-3.5" /> },
  { value: "kitchen", label: "Kitchen", icon: <ChefHat className="h-3.5 w-3.5" /> },
  { value: "bathroom", label: "Bathroom", icon: <Bath className="h-3.5 w-3.5" /> },
  { value: "dining room", label: "Dining Room", icon: <Building2 className="h-3.5 w-3.5" /> },
  { value: "office", label: "Home Office", icon: <Building2 className="h-3.5 w-3.5" /> },
];

/* ── Before / After Slider ── */
function CompareSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-ew-resize select-none"
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      <img src={after} alt="After" className="absolute inset-0 w-full h-full object-contain bg-black" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={before}
          alt="Before"
          className="h-full object-contain bg-black"
          style={{ width: `${10000 / Math.max(pos, 1)}%`, maxWidth: "none" }}
        />
      </div>
      <div className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10" style={{ left: `${pos}%` }}>
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center gap-0.5">
          <ChevronLeft className="h-3.5 w-3.5 text-foreground" />
          <ChevronRight className="h-3.5 w-3.5 text-foreground" />
        </div>
      </div>
      <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur-sm text-foreground border-border/50 text-[10px]">
        Before
      </Badge>
      <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 text-[10px]">
        After
      </Badge>
    </div>
  );
}

/* ── Preset Button ── */
function PresetButton({
  icon, label, desc, active, onClick, disabled,
}: {
  icon: React.ReactNode; label: string; desc: string; active: boolean; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border text-left transition-all w-full",
        active
          ? "border-primary/50 bg-primary/10 shadow-sm"
          : "border-border/40 hover:border-border hover:bg-muted/30",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      <div className={cn("mt-0.5 p-1.5 rounded-lg", active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
        {icon}
      </div>
      <div>
        <p className={cn("text-sm font-medium", active ? "text-primary" : "text-foreground")}>{label}</p>
        <p className="text-[11px] text-muted-foreground leading-snug">{desc}</p>
      </div>
    </button>
  );
}

/* ── Main Page ── */
export default function AIImageEnhancePage() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState("");
  const [activeTab, setActiveTab] = useState("enhance");
  const [selectedEnhance, setSelectedEnhance] = useState("auto_optimize");
  const [selectedStaging, setSelectedStaging] = useState("modern_luxury");
  const [selectedRoom, setSelectedRoom] = useState("living room");
  const [history, setHistory] = useState<EnhanceResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const enhance = useAIImageEnhance();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image.", variant: "destructive" });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      toast({ title: "Too large", description: "Max 15 MB.", variant: "destructive" });
      return;
    }
    setSourceFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setSourceImage(ev.target?.result as string);
      setHistory([]);
      setActiveIndex(-1);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = () => {
    if (!sourceImage) return;

    const params =
      activeTab === "enhance"
        ? { image_url: sourceImage, mode: "enhance" as const, enhancement_type: selectedEnhance }
        : activeTab === "staging"
        ? { image_url: sourceImage, mode: "virtual_staging" as const, staging_style: selectedStaging, room_type: selectedRoom }
        : activeTab === "sky"
        ? { image_url: sourceImage, mode: "sky_replacement" as const }
        : { image_url: sourceImage, mode: "declutter" as const };

    enhance.mutate(params, {
      onSuccess: (result) => {
        setHistory((prev) => [...prev, result]);
        setActiveIndex(history.length);
        toast({ title: "Done!", description: `Image processed successfully.` });
      },
      onError: (err: any) => {
        toast({ title: "Processing failed", description: err?.message || "Try again.", variant: "destructive" });
      },
    });
  };

  const currentResult = activeIndex >= 0 ? history[activeIndex] : null;

  return (
    <>
      <SEOHead
        title="AI Image Enhancer & Virtual Staging | ASTRA Villa"
        description="Enhance property photos and virtually stage empty rooms with AI. Professional real estate image editing powered by artificial intelligence."
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-chart-1/20 flex items-center justify-center">
              <Wand2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Image Enhancer</h1>
              <p className="text-sm text-muted-foreground">
                Enhance photos, stage rooms, replace skies & declutter — powered by AI
              </p>
            </div>
            <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-[10px] uppercase ml-auto hidden sm:inline-flex">
              AI-Powered
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Panel — Controls */}
            <div className="lg:col-span-4 space-y-4">
              {/* Upload Card */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
                  {sourceImage ? (
                    <div className="relative group">
                      <img src={sourceImage} alt="Source" className="w-full h-44 object-cover rounded-lg border border-border/40" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button size="sm" variant="secondary" className="text-xs" onClick={() => fileInputRef.current?.click()}>
                          <RotateCcw className="h-3 w-3 mr-1" /> Change
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 truncate">{sourceFileName}</p>
                    </div>
                  ) : (
                    <button
                      className="w-full h-44 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center gap-3 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Upload Property Photo</p>
                        <p className="text-[11px] text-muted-foreground">JPG, PNG, WebP · Max 15 MB</p>
                      </div>
                    </button>
                  )}
                </CardContent>
              </Card>

              {/* Tool Tabs */}
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="w-full grid grid-cols-4 h-9">
                      <TabsTrigger value="enhance" className="text-[11px] px-1">Enhance</TabsTrigger>
                      <TabsTrigger value="staging" className="text-[11px] px-1">Stage</TabsTrigger>
                      <TabsTrigger value="sky" className="text-[11px] px-1">Sky</TabsTrigger>
                      <TabsTrigger value="declutter" className="text-[11px] px-1">Declutter</TabsTrigger>
                    </TabsList>

                    <TabsContent value="enhance" className="mt-3 space-y-2">
                      {ENHANCE_PRESETS.map((p) => (
                        <PresetButton
                          key={p.id}
                          icon={p.icon}
                          label={p.label}
                          desc={p.desc}
                          active={selectedEnhance === p.id}
                          onClick={() => setSelectedEnhance(p.id)}
                          disabled={enhance.isPending}
                        />
                      ))}
                    </TabsContent>

                    <TabsContent value="staging" className="mt-3 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2">Room Type</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {ROOM_TYPES.map((rt) => (
                            <button
                              key={rt.value}
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs transition-all",
                                selectedRoom === rt.value
                                  ? "border-primary/50 bg-primary/10 text-primary font-medium"
                                  : "border-border/40 text-muted-foreground hover:border-border"
                              )}
                              onClick={() => setSelectedRoom(rt.value)}
                            >
                              {rt.icon} {rt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2">Staging Style</p>
                        <div className="space-y-1.5">
                          {STAGING_STYLES.map((s) => (
                            <PresetButton
                              key={s.id}
                              icon={s.icon}
                              label={s.label}
                              desc={s.desc}
                              active={selectedStaging === s.id}
                              onClick={() => setSelectedStaging(s.id)}
                              disabled={enhance.isPending}
                            />
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="sky" className="mt-3">
                      <div className="p-4 bg-muted/30 rounded-xl text-center space-y-2">
                        <CloudSun className="h-8 w-8 text-chart-1 mx-auto" />
                        <p className="text-sm font-medium text-foreground">Sky Replacement</p>
                        <p className="text-xs text-muted-foreground">
                          Automatically replace overcast or dull skies with a beautiful clear blue sky.
                          Best for exterior property shots.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent value="declutter" className="mt-3">
                      <div className="p-4 bg-muted/30 rounded-xl text-center space-y-2">
                        <Trash2 className="h-8 w-8 text-chart-4 mx-auto" />
                        <p className="text-sm font-medium text-foreground">AI Declutter</p>
                        <p className="text-xs text-muted-foreground">
                          Remove personal items, clutter, and mess. Make spaces look clean and move-in ready.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Process Button */}
                  <Button
                    className="w-full mt-4 gap-2"
                    disabled={!sourceImage || enhance.isPending}
                    onClick={handleProcess}
                  >
                    {enhance.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing... (30-60s)
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        {activeTab === "enhance" ? "Enhance with AI" :
                         activeTab === "staging" ? "Stage with AI" :
                         activeTab === "sky" ? "Replace Sky" : "Declutter with AI"}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* History Thumbnails */}
              {history.length > 0 && (
                <Card className="border-border/50">
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold text-foreground mb-2">Results ({history.length})</p>
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                      {history.map((r, i) => (
                        <button
                          key={i}
                          className={cn(
                            "flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all",
                            activeIndex === i ? "border-primary" : "border-border/40 hover:border-border"
                          )}
                          onClick={() => setActiveIndex(i)}
                        >
                          <img src={r.enhanced_image_url} alt={`Result ${i + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Panel — Result Viewer */}
            <div className="lg:col-span-8">
              <Card className="border-border/50 overflow-hidden h-full">
                <CardContent className="p-0 h-full">
                  <AnimatePresence mode="wait">
                    {enhance.isPending ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-[500px] flex flex-col items-center justify-center gap-5 bg-muted/5"
                      >
                        <div className="relative">
                          <Loader2 className="h-14 w-14 animate-spin text-primary/60" />
                          <Sparkles className="h-5 w-5 text-chart-1 absolute -top-1 -right-1 animate-pulse" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-sm font-medium text-foreground">AI is processing your image...</p>
                          <p className="text-xs text-muted-foreground">This may take 30-60 seconds</p>
                        </div>
                        {/* Animated progress bar */}
                        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-chart-1 rounded-full"
                            animate={{ width: ["0%", "80%", "95%"] }}
                            transition={{ duration: 45, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    ) : currentResult && sourceImage ? (
                      <motion.div
                        key="result"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col h-full"
                      >
                        <div className="h-[460px] sm:h-[500px]">
                          <CompareSlider before={sourceImage} after={currentResult.enhanced_image_url} />
                        </div>
                        {/* Action bar */}
                        <div className="flex items-center justify-between p-3 bg-muted/20 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {currentResult.mode.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] capitalize">
                              {currentResult.enhancement_type.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => {
                                const a = document.createElement("a");
                                a.href = currentResult.enhanced_image_url;
                                a.download = `enhanced_${Date.now()}.jpg`;
                                a.target = "_blank";
                                a.click();
                              }}
                            >
                              <Download className="h-3 w-3 mr-1" /> Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => {
                                navigator.clipboard.writeText(currentResult.enhanced_image_url);
                                toast({ title: "Copied!", description: "Image URL copied to clipboard." });
                              }}
                            >
                              <Save className="h-3 w-3 mr-1" /> Copy URL
                            </Button>
                          </div>
                        </div>
                        {currentResult.description && (
                          <div className="px-4 pb-3">
                            <p className="text-xs text-muted-foreground leading-relaxed">{currentResult.description}</p>
                          </div>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="h-[500px] flex flex-col items-center justify-center gap-5 bg-muted/5"
                      >
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-chart-1/10 flex items-center justify-center">
                          <ImageIcon className="h-10 w-10 text-primary/40" />
                        </div>
                        <div className="text-center max-w-sm space-y-2">
                          <p className="text-base font-semibold text-foreground">Upload a Property Photo</p>
                          <p className="text-sm text-muted-foreground">
                            Upload an image, choose an enhancement or staging option, and let AI transform it in seconds.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                          {[
                            { icon: <Sparkles className="h-4 w-4" />, label: "Auto Enhance" },
                            { icon: <Sofa className="h-4 w-4" />, label: "Virtual Stage" },
                            { icon: <CloudSun className="h-4 w-4" />, label: "Sky Replace" },
                            { icon: <Trash2 className="h-4 w-4" />, label: "Declutter" },
                          ].map((f) => (
                            <div key={f.label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/30 border border-border/30">
                              <div className="text-muted-foreground">{f.icon}</div>
                              <p className="text-[11px] text-muted-foreground font-medium">{f.label}</p>
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
