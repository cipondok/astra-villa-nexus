import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paintbrush, Sofa, Lightbulb, Palette, DollarSign, Sparkles, ChevronRight, Loader2, Home, Lamp, BadgeCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useInteriorDesignAdvisor, InteriorDesignResult } from "@/hooks/useInteriorDesignAdvisor";
import { useToast } from "@/hooks/use-toast";

const ROOM_TYPES = [
  "Living Room", "Bedroom", "Kitchen", "Bathroom", "Dining Room",
  "Home Office", "Balcony", "Studio Apartment", "Children's Room", "Walk-in Closet",
];

const STYLES = [
  "Modern Minimalist", "Scandinavian", "Industrial", "Japanese Zen",
  "Mid-Century Modern", "Bohemian", "Art Deco", "Tropical Bali",
  "Contemporary Luxury", "Rustic Farmhouse",
];

const BUDGET_LEVELS = [
  { value: "low" as const, label: "Budget-Friendly", desc: "< Rp 15 juta" },
  { value: "medium" as const, label: "Mid-Range", desc: "Rp 15–50 juta" },
  { value: "high" as const, label: "Premium", desc: "Rp 50–150 juta" },
  { value: "luxury" as const, label: "Luxury", desc: "> Rp 150 juta" },
];

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

export default function AIInteriorDesignPage() {
  const [roomType, setRoomType] = useState("");
  const [style, setStyle] = useState("");
  const [budget, setBudget] = useState<"low" | "medium" | "high" | "luxury">("medium");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<InteriorDesignResult | null>(null);

  const mutation = useInteriorDesignAdvisor();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!roomType || !style) {
      toast({ title: "Please select room type and style", variant: "destructive" });
      return;
    }
    mutation.mutate(
      { room_type: roomType, style, budget_level: budget, current_description: description || undefined },
      {
        onSuccess: (data) => setResult(data),
        onError: (err) => toast({ title: "AI Error", description: (err as Error).message, variant: "destructive" }),
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
              <Paintbrush className="h-4 w-4" />
              AI Interior Design Advisor
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Desain Interior Impian Anda dengan <span className="text-primary">Kecerdasan Buatan</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Dapatkan rekomendasi furnitur, palet warna, tata letak, dan estimasi biaya yang disesuaikan dengan gaya dan budget Anda.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Input Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-8 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-primary" />
                Konfigurasi Ruangan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Jenis Ruangan</label>
                  <Select value={roomType} onValueChange={setRoomType}>
                    <SelectTrigger><SelectValue placeholder="Pilih ruangan" /></SelectTrigger>
                    <SelectContent>
                      {ROOM_TYPES.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Gaya Desain</label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger><SelectValue placeholder="Pilih gaya" /></SelectTrigger>
                    <SelectContent>
                      {STYLES.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Level Budget</label>
                  <Select value={budget} onValueChange={(v) => setBudget(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BUDGET_LEVELS.map((b) => (
                        <SelectItem key={b.value} value={b.value}>{b.label} — {b.desc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Deskripsi Tambahan (opsional)</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Ruangan berukuran 4x5m, memiliki jendela besar menghadap taman, lantai kayu..."
                  rows={3}
                  className="resize-none"
                />
              </div>
              <Button onClick={handleGenerate} disabled={mutation.isPending} size="lg" className="w-full md:w-auto">
                {mutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating Design...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Generate Interior Design</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Concept Overview */}
              <Card className="border-primary/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    {result.design_concept}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{result.style_description}</p>
                  <div className="flex flex-wrap gap-2">
                    {result.mood_keywords?.map((kw) => (
                      <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Color Palette */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Palette className="h-5 w-5 text-primary" />
                      Palet Warna
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {result.color_palette?.map((c, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg border border-border/50 shadow-sm flex-shrink-0" style={{ backgroundColor: c.hex }} />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.usage}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Lighting */}
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Lamp className="h-5 w-5 text-primary" />
                      Pencahayaan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.lighting_suggestions?.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Lightbulb className="h-4 w-4 mt-0.5 text-primary/60 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Furniture Recommendations */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sofa className="h-5 w-5 text-primary" />
                    Rekomendasi Furnitur
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.furniture_recommendations?.map((item, i) => (
                      <div key={i} className="p-4 rounded-lg border border-border/50 bg-muted/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm text-foreground">{item.name}</h4>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{item.placement_tip}</p>
                        {item.brand_suggestion && (
                          <p className="text-xs text-primary/80">Brand: {item.brand_suggestion}</p>
                        )}
                        <p className="text-sm font-semibold text-foreground">{formatIDR(item.estimated_price_idr)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Layout Tips + Do's & Don'ts */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ChevronRight className="h-5 w-5 text-primary" />
                      Tips Tata Letak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.layout_tips?.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary font-bold text-xs mt-0.5">{i + 1}.</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-green-600 dark:text-green-400">
                      <BadgeCheck className="h-5 w-5" />
                      Do's
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.dos?.map((d, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <BadgeCheck className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" /> {d}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base text-destructive">
                      <AlertTriangle className="h-5 w-5" />
                      Don'ts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.donts?.map((d, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 mt-0.5 text-destructive/60 flex-shrink-0" /> {d}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Budget Summary */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimasi Total Budget</p>
                      <p className="text-2xl font-bold text-foreground">{formatIDR(result.estimated_total_budget_idr)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.accent_pieces?.map((p, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
