import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Instagram, Facebook, Linkedin, Twitter, Hash, Sparkles, Loader2, Video, Image, MessageSquare, Clock, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useSocialCopyGenerator, SocialCopyResult, SocialCopyVariant } from "@/hooks/useSocialCopyGenerator";
import { useToast } from "@/hooks/use-toast";

const PLATFORMS = [
  { value: "instagram" as const, label: "Instagram", icon: Instagram, color: "text-pink-500" },
  { value: "tiktok" as const, label: "TikTok", icon: Video, color: "text-foreground" },
  { value: "facebook" as const, label: "Facebook", icon: Facebook, color: "text-blue-500" },
  { value: "twitter" as const, label: "X (Twitter)", icon: Twitter, color: "text-foreground" },
  { value: "linkedin" as const, label: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
];

const TONES = [
  { value: "professional" as const, label: "Profesional" },
  { value: "casual" as const, label: "Kasual" },
  { value: "luxury" as const, label: "Mewah" },
  { value: "urgent" as const, label: "Urgent/FOMO" },
  { value: "storytelling" as const, label: "Storytelling" },
];

const PROPERTY_TYPES = ["Rumah", "Apartemen", "Villa", "Ruko", "Tanah", "Kantor", "Gudang", "Kos-kosan"];

function formatIDR(n: number) {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)} Juta`;
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="icon-sm" onClick={handleCopy} className="flex-shrink-0">
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  );
}

function VariantCard({ variant, index }: { variant: SocialCopyVariant; index: number }) {
  const engagementColor = variant.estimated_engagement === "high" ? "text-green-500" : variant.estimated_engagement === "medium" ? "text-yellow-500" : "text-muted-foreground";

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <Card className="border-border/50 hover:border-primary/30 transition-colors">
        <CardContent className="pt-5 space-y-4">
          {/* Hook */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-primary uppercase tracking-wider">Hook Line</p>
              <p className="text-sm font-semibold text-foreground">{variant.hook_line}</p>
            </div>
            <CopyButton text={variant.hook_line} />
          </div>

          {/* Caption */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Caption</p>
              <CopyButton text={variant.caption} />
            </div>
            <div className="bg-muted/40 rounded-lg p-3 text-sm text-foreground whitespace-pre-line leading-relaxed border border-border/30">
              {variant.caption}
            </div>
          </div>

          {/* Hashtags */}
          {variant.hashtags?.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1"><Hash className="h-3 w-3" /> Hashtags</p>
                <CopyButton text={variant.hashtags.map(h => h.startsWith("#") ? h : `#${h}`).join(" ")} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {variant.hashtags.map((h, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-normal">
                    {h.startsWith("#") ? h : `#${h}`}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex items-start justify-between gap-2 bg-primary/5 rounded-lg p-3 border border-primary/10">
            <div className="space-y-0.5">
              <p className="text-xs font-medium text-primary">Call to Action</p>
              <p className="text-sm text-foreground">{variant.cta}</p>
            </div>
            <CopyButton text={variant.cta} />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/30 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className={`h-3.5 w-3.5 ${engagementColor}`} />
              Engagement: <span className="font-medium capitalize">{variant.estimated_engagement}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              Best time: {variant.best_posting_time}
            </span>
          </div>

          {/* Tips */}
          {variant.content_tips?.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Content Tips</p>
              <ul className="space-y-1">
                {variant.content_tips.map((tip, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <Zap className="h-3 w-3 mt-0.5 text-primary/60 flex-shrink-0" /> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function AISocialCopyPage() {
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "facebook" | "twitter" | "linkedin">("instagram");
  const [tone, setTone] = useState<"professional" | "casual" | "luxury" | "urgent" | "storytelling">("professional");
  const [language, setLanguage] = useState<"id" | "en" | "bilingual">("id");
  const [title, setTitle] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [area, setArea] = useState("");
  const [features, setFeatures] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [result, setResult] = useState<SocialCopyResult | null>(null);

  const mutation = useSocialCopyGenerator();
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!title || !propertyType || !location || !price) {
      toast({ title: "Mohon lengkapi data properti", description: "Judul, tipe, lokasi, dan harga wajib diisi.", variant: "destructive" });
      return;
    }
    mutation.mutate(
      {
        platform, tone, language,
        property_title: title,
        property_type: propertyType,
        location,
        price: Number(price),
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        area: area ? Number(area) : undefined,
        key_features: features ? features.split(",").map(f => f.trim()).filter(Boolean) : undefined,
        target_audience: targetAudience || undefined,
        include_hashtags: true,
        include_cta: true,
      },
      {
        onSuccess: (data) => setResult(data),
        onError: (err) => toast({ title: "AI Error", description: (err as Error).message, variant: "destructive" }),
      }
    );
  };

  const activePlatform = PLATFORMS.find(p => p.value === platform);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-blue-500/5" />
        <div className="container mx-auto px-4 py-12 md:py-16 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
              <MessageSquare className="h-4 w-4" />
              AI Social Media Copy
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
              Copy Properti untuk <span className="text-primary">Social Media</span> dalam Hitungan Detik
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Generate caption, hashtag, dan CTA yang dioptimalkan untuk setiap platform sosial media — siap posting langsung.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Input Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="mb-8 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Detail Properti & Preferensi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Platform selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Platform</label>
                <div className="flex flex-wrap gap-2">
                  {PLATFORMS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <Button
                        key={p.value}
                        variant={platform === p.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPlatform(p.value)}
                        className="gap-1.5"
                      >
                        <Icon className={`h-4 w-4 ${platform === p.value ? "" : p.color}`} />
                        {p.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Judul Properti *</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Rumah Mewah di Menteng" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tipe Properti *</label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger><SelectValue placeholder="Pilih tipe" /></SelectTrigger>
                    <SelectContent>{PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Lokasi *</label>
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Menteng, Jakarta Pusat" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Harga (IDR) *</label>
                  <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="5000000000" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Kamar Tidur</label>
                  <Input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="4" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Luas (m²)</label>
                  <Input type="number" value={area} onChange={(e) => setArea(e.target.value)} placeholder="250" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Target Audience</label>
                  <Input value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Keluarga muda, ekspatriat" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Fitur Unggulan (pisahkan koma)</label>
                <Textarea
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder="Kolam renang, taman luas, smart home, garansi struktur 10 tahun"
                  rows={2}
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Tone / Gaya</label>
                  <Select value={tone} onValueChange={(v) => setTone(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TONES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Bahasa</label>
                  <Select value={language} onValueChange={(v) => setLanguage(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Bahasa Indonesia</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bilingual">Bilingual (ID + EN)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={mutation.isPending} size="lg" className="w-full md:w-auto">
                {mutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating Copy...</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" /> Generate Social Copy</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* Variants */}
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  {activePlatform && <activePlatform.icon className={`h-5 w-5 ${activePlatform.color}`} />}
                  Caption Variants
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {result.variants?.map((v, i) => <VariantCard key={i} variant={v} index={i} />)}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Carousel Ideas */}
                {result.carousel_ideas && result.carousel_ideas.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Image className="h-5 w-5 text-primary" />
                        Carousel / Slide Ideas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {result.carousel_ideas.map((idea, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="bg-primary/10 text-primary rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                            {idea}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}

                {/* Story Sequence */}
                {result.story_sequence && result.story_sequence.length > 0 && (
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        Story / Reel Sequence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ol className="space-y-2">
                        {result.story_sequence.map((step, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="bg-accent text-accent-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Video Script */}
              {result.video_script && (
                <Card className="border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Video className="h-5 w-5 text-primary" />
                        Video Script
                      </CardTitle>
                      <CopyButton text={result.video_script} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/40 rounded-lg p-4 text-sm text-foreground whitespace-pre-line leading-relaxed border border-border/30">
                      {result.video_script}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SEO & Differentiation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base">SEO Keywords</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {result.seo_keywords?.map((kw, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{kw}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {result.competitor_differentiation && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Keunggulan Kompetitif
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground leading-relaxed">{result.competitor_differentiation}</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
