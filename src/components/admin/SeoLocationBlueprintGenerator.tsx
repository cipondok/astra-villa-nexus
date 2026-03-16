import React, { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useSeoLocationBlueprint,
  scoreSeoReadiness,
  type SeoLocationBlueprint,
  type MarketSignal,
} from "@/hooks/useSeoLocationBlueprint";
import { toast } from "sonner";
import {
  MapPin,
  Search,
  Copy,
  CheckCircle2,
  Loader2,
  Tag,
  Link2,
  TrendingUp,
  BarChart3,
  Globe,
  Zap,
  Eye,
  FileText,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Config ──

const signalConfig: Record<MarketSignal, { color: string; bg: string; border: string; label: string; emoji: string }> = {
  HIGH_DEMAND: { color: "text-chart-1", bg: "bg-chart-1/10", border: "border-chart-1/30", label: "High Demand", emoji: "🔥" },
  GROWING:     { color: "text-primary", bg: "bg-primary/10", border: "border-primary/30", label: "Growing", emoji: "📈" },
  STABLE:      { color: "text-chart-4", bg: "bg-chart-4/10", border: "border-chart-4/30", label: "Stable", emoji: "⚖️" },
  EMERGING:    { color: "text-chart-3", bg: "bg-chart-3/10", border: "border-chart-3/30", label: "Emerging", emoji: "🌱" },
};

// ── Helpers ──

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} disalin`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={copy}>
      {copied ? <CheckCircle2 className="h-3 w-3 text-chart-1" /> : <Copy className="h-3 w-3 text-muted-foreground" />}
    </Button>
  );
}

function KeywordCluster({ title, keywords, color }: { title: string; keywords: string[]; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{title}</span>
        <CopyButton text={keywords.join(", ")} label={title} />
      </div>
      <div className="flex flex-wrap gap-1">
        {keywords.map((kw) => (
          <Badge key={kw} variant="outline" className={cn("text-[9px] h-5 px-1.5 font-normal", color)}>
            {kw}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function formatRupiah(n: number): string {
  if (n >= 1e9) return `Rp ${(n / 1e9).toFixed(1)} M`;
  if (n >= 1e6) return `Rp ${(n / 1e6).toFixed(0)} Jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

// ── Blueprint Result View ──

function BlueprintResult({ data }: { data: SeoLocationBlueprint }) {
  const sc = signalConfig[data.market_data.market_signal];
  const m = data.market_data;
  const kw = data.keyword_clusters;
  const il = data.internal_links;

  const totalKeywords = Object.values(kw).reduce((s, arr) => s + arr.length, 0);
  const seoScore = scoreSeoReadiness(
    m.listing_count,
    data.seo_title,
    data.meta_description,
    totalKeywords,
    il.nearby_areas.length,
  );

  const scoreColor = seoScore >= 75 ? "text-chart-1" : seoScore >= 50 ? "text-chart-4" : "text-destructive";

  return (
    <div className="space-y-4">
      {/* Header metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {[
          { label: "Listings", value: String(m.listing_count), icon: FileText },
          { label: "Median", value: m.price_formatted, icon: BarChart3 },
          { label: "SEO Score", value: `${seoScore}/100`, icon: Zap, color: scoreColor },
          { label: "Keywords", value: String(totalKeywords), icon: Tag },
          { label: "Signal", value: sc.label, icon: TrendingUp, color: sc.color },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="rounded-xl border-border/30 bg-card/80">
            <CardContent className="p-2.5 flex items-center gap-2">
              <Icon className={cn("h-3.5 w-3.5 shrink-0", color || "text-muted-foreground")} />
              <div>
                <span className="text-[8px] text-muted-foreground block">{label}</span>
                <span className={cn("text-[11px] font-bold", color || "text-foreground")}>{value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Market signal badge row */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={cn("text-[10px] h-5 px-2", sc.color, sc.bg, sc.border)}>
          {sc.emoji} {sc.label}
        </Badge>
        <Badge variant="outline" className="text-[10px] h-5 px-2 text-muted-foreground">
          <MapPin className="h-3 w-3 mr-1" />{data.location.full_path}
        </Badge>
        <Badge variant="outline" className="text-[10px] h-5 px-2 text-muted-foreground">
          Level: {data.location.level}
        </Badge>
        <Badge variant="outline" className="text-[10px] h-5 px-2 text-muted-foreground">
          <Globe className="h-3 w-3 mr-1" />{data.page_slug}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="seo" className="w-full">
        <TabsList className="h-8">
          <TabsTrigger value="seo" className="text-[10px] h-6 px-3">SEO Content</TabsTrigger>
          <TabsTrigger value="keywords" className="text-[10px] h-6 px-3">Keywords</TabsTrigger>
          <TabsTrigger value="links" className="text-[10px] h-6 px-3">Internal Links</TabsTrigger>
          <TabsTrigger value="serp" className="text-[10px] h-6 px-3">SERP Preview</TabsTrigger>
        </TabsList>

        {/* SEO Content */}
        <TabsContent value="seo" className="space-y-3 mt-3">
          <Card className="rounded-xl border-border/30">
            <CardContent className="p-3 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-[9px] text-muted-foreground uppercase tracking-wide">SEO Title ({data.seo_title.length} chars)</Label>
                  <CopyButton text={data.seo_title} label="Title" />
                </div>
                <p className="text-sm font-semibold text-primary">{data.seo_title}</p>
              </div>
              <Separator className="bg-border/30" />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-[9px] text-muted-foreground uppercase tracking-wide">Meta Description ({data.meta_description.length} chars)</Label>
                  <CopyButton text={data.meta_description} label="Meta Description" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{data.meta_description}</p>
              </div>
              <Separator className="bg-border/30" />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-[9px] text-muted-foreground uppercase tracking-wide">Intro Content</Label>
                  <CopyButton text={data.intro_content} label="Intro Content" />
                </div>
                <ScrollArea className="h-48">
                  <div className="text-[11px] text-foreground/90 leading-relaxed whitespace-pre-line">
                    {data.intro_content}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>

          {/* Market data grid */}
          <Card className="rounded-xl border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <BarChart3 className="h-3 w-3" /> Market Intelligence Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Demand", value: m.demand_score, max: 100 },
                  { label: "Growth", value: m.growth_score, max: 100 },
                  { label: "Liquidity", value: m.liquidity_score, max: 100 },
                  { label: "Investment", value: m.investment_score, max: 100 },
                ].map(({ label, value, max }) => {
                  const pct = Math.min(value / max * 100, 100);
                  const barColor = pct >= 65 ? "bg-chart-1" : pct >= 40 ? "bg-chart-4" : "bg-muted-foreground";
                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-muted-foreground">{label}</span>
                        <span className="text-[10px] font-bold text-foreground">{value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted/40 overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Property type dist */}
              {Object.keys(m.property_types).length > 0 && (
                <div className="mt-3 pt-2 border-t border-border/20">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wide block mb-1.5">Property Type Distribution</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Object.entries(m.property_types).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="text-[9px] h-5 px-1.5 text-muted-foreground">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords */}
        <TabsContent value="keywords" className="space-y-3 mt-3">
          <Card className="rounded-xl border-border/30">
            <CardContent className="p-3 space-y-4">
              <KeywordCluster title="🛒 Transactional (Beli/Jual)" keywords={kw.transactional} color="text-chart-1 bg-chart-1/10 border-chart-1/30" />
              <Separator className="bg-border/20" />
              <KeywordCluster title="🏠 Rental (Sewa/Kost)" keywords={kw.rental} color="text-primary bg-primary/10 border-primary/30" />
              <Separator className="bg-border/20" />
              <KeywordCluster title="💰 Investment" keywords={kw.investment} color="text-chart-3 bg-chart-3/10 border-chart-3/30" />
              <Separator className="bg-border/20" />
              <KeywordCluster title="ℹ️ Informational" keywords={kw.informational} color="text-chart-4 bg-chart-4/10 border-chart-4/30" />
              <Separator className="bg-border/20" />
              <KeywordCluster title="🎯 Long Tail" keywords={kw.long_tail} color="text-muted-foreground bg-muted/20 border-border/30" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Internal Links */}
        <TabsContent value="links" className="space-y-3 mt-3">
          <Card className="rounded-xl border-border/30">
            <CardContent className="p-3 space-y-4">
              {/* Parent pages */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">🔼 Parent Pages (Breadcrumb)</span>
                {il.parent_pages.map((link) => (
                  <div key={link.slug} className="flex items-center justify-between p-2 rounded-lg border border-border/30 bg-muted/10">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-3 w-3 text-primary" />
                      <div>
                        <span className="text-[10px] font-medium text-foreground">{link.label}</span>
                        <span className="text-[9px] text-muted-foreground block">{link.slug}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] h-3.5 px-1 text-muted-foreground">{link.rel}</Badge>
                  </div>
                ))}
              </div>

              <Separator className="bg-border/20" />

              {/* Nearby areas */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">📍 Nearby Areas</span>
                {il.nearby_areas.length > 0 ? il.nearby_areas.map((na) => (
                  <div key={na.area} className="flex items-center justify-between p-2 rounded-lg border border-border/30 bg-muted/10">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-chart-4" />
                      <span className="text-[10px] font-medium text-foreground">{na.area}</span>
                    </div>
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-muted-foreground">{na.listing_count} listing</Badge>
                  </div>
                )) : (
                  <p className="text-[10px] text-muted-foreground">Tidak ada area terdekat terdeteksi</p>
                )}
              </div>

              <Separator className="bg-border/20" />

              {/* Contextual links */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">🔗 Contextual Links</span>
                {il.contextual_links.map((link) => (
                  <div key={link.slug} className="flex items-center justify-between p-2 rounded-lg border border-border/30 bg-muted/10">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-3 w-3 text-chart-3" />
                      <div>
                        <span className="text-[10px] font-medium text-foreground">{link.label}</span>
                        <span className="text-[9px] text-muted-foreground block">{link.slug}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] h-3.5 px-1 text-muted-foreground">{link.rel}</Badge>
                  </div>
                ))}
              </div>

              <Separator className="bg-border/20" />

              {/* Collection links */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">📂 Collection Pages</span>
                {il.collection_links.map((link) => (
                  <div key={link.slug} className="flex items-center justify-between p-2 rounded-lg border border-border/30 bg-muted/10">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3 text-chart-1" />
                      <div>
                        <span className="text-[10px] font-medium text-foreground">{link.label}</span>
                        <span className="text-[9px] text-muted-foreground block">{link.slug}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] h-3.5 px-1 text-muted-foreground">{link.rel}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SERP Preview */}
        <TabsContent value="serp" className="mt-3">
          <Card className="rounded-xl border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Eye className="h-3 w-3" /> Google SERP Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="p-4 rounded-lg bg-background border border-border/40 space-y-1 max-w-xl">
                <span className="text-[11px] text-muted-foreground">astra-villa-realty.lovable.app{data.page_slug}</span>
                <h3 className="text-sm font-medium text-primary hover:underline cursor-pointer leading-tight">
                  {data.seo_title}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {data.meta_description}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-3 text-[9px] text-muted-foreground">
                <span>Title: <span className={data.seo_title.length <= 60 ? "text-chart-1 font-medium" : "text-chart-3 font-medium"}>{data.seo_title.length}/60</span></span>
                <span>Desc: <span className={data.meta_description.length <= 160 ? "text-chart-1 font-medium" : "text-chart-3 font-medium"}>{data.meta_description.length}/160</span></span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Main Component ──

const SeoLocationBlueprintGenerator = React.memo(function SeoLocationBlueprintGenerator() {
  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [village, setVillage] = useState("");
  const [result, setResult] = useState<SeoLocationBlueprint | null>(null);

  const { mutateAsync, isPending } = useSeoLocationBlueprint();

  const handleGenerate = useCallback(async () => {
    if (!province) {
      toast.error("Provinsi wajib diisi");
      return;
    }
    try {
      const data = await mutateAsync({ province, city, district, village });
      setResult(data);
      toast.success("Blueprint SEO berhasil dibuat!");
    } catch (e: any) {
      toast.error(e?.message || "Gagal membuat blueprint");
    }
  }, [province, city, district, village, mutateAsync]);

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border-border/30 overflow-hidden bg-card/80 backdrop-blur-sm">
        <div className="h-1.5 bg-gradient-to-r from-primary/40 via-chart-1/30 to-chart-3/20" />
        <CardHeader className="p-4 pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            SEO Location Blueprint Generator
          </CardTitle>
          <CardDescription className="text-[11px]">
            Generate structured SEO content blueprints for any location in the hierarchy — Province → City → Kecamatan → Kelurahan
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Provinsi *</Label>
              <Input value={province} onChange={(e) => setProvince(e.target.value)} placeholder="DKI Jakarta" className="h-8 text-[11px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Kota / Kabupaten</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Jakarta Selatan" className="h-8 text-[11px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Kecamatan</Label>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Kebayoran Baru" className="h-8 text-[11px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Kelurahan / Desa</Label>
              <Input value={village} onChange={(e) => setVillage(e.target.value)} placeholder="Senayan" className="h-8 text-[11px]" />
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isPending || !province} className="w-full h-9 text-[11px] gap-2">
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
            {isPending ? "Generating Blueprint..." : "Generate SEO Blueprint"}
          </Button>
        </CardContent>
      </Card>

      {result && <BlueprintResult data={result} />}
    </div>
  );
});

export default SeoLocationBlueprintGenerator;
