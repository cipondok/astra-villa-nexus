import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  FileText, Copy, Check, MapPin, Home, Users, DollarSign,
  Heart, TrendingUp, Smartphone, Crown, BarChart3,
  Sparkles, ArrowRight, Zap, Eye, Clock, Shield
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

type PropertyType = "apartment" | "villa" | "townhouse" | "penthouse" | "land" | "commercial";
type BuyerSegment = "first-home" | "family-upgrade" | "luxury-lifestyle" | "investor" | "expat";
type EmotionalAngle = "investment-yield" | "luxury-lifestyle" | "family-comfort";

const propertyLabels: Record<PropertyType, string> = {
  apartment: "Apartment", villa: "Villa", townhouse: "Townhouse",
  penthouse: "Penthouse", land: "Land Plot", commercial: "Commercial Space",
};
const segmentLabels: Record<BuyerSegment, string> = {
  "first-home": "First-Home Buyer", "family-upgrade": "Family Upgrade",
  "luxury-lifestyle": "Luxury Lifestyle", investor: "Investor", expat: "Expat Buyer",
};
const angleLabels: Record<EmotionalAngle, string> = {
  "investment-yield": "Investment Yield", "luxury-lifestyle": "Luxury Lifestyle", "family-comfort": "Family Comfort",
};

interface ListingCopy {
  headline: string;
  hook: string;
  body: string;
  urgency: string;
  cta: string;
}

function generate(
  type: PropertyType, location: string, district: string,
  segment: BuyerSegment, price: string, angle: EmotionalAngle, beds: string, size: string
): { mobile: ListingCopy; luxury: ListingCopy; investor: ListingCopy } {
  const t = propertyLabels[type];
  const priceStr = price || "Rp 2.8B";
  const bedStr = beds || "3";
  const sizeStr = size || "145";
  const loc = location || "Jakarta";
  const dist = district || "Menteng";

  return {
    mobile: {
      headline: angle === "investment-yield"
        ? `${bedStr}BR ${t} · ${dist} · ${priceStr} · 8.2% Yield`
        : angle === "luxury-lifestyle"
        ? `Stunning ${bedStr}BR ${t} in ${dist} · ${priceStr}`
        : `Family-Ready ${bedStr}BR ${t} · ${dist} · ${priceStr}`,
      hook: angle === "investment-yield"
        ? `High-yield ${t.toLowerCase()} in ${loc}'s fastest-appreciating corridor.`
        : angle === "luxury-lifestyle"
        ? `Wake up to skyline views in ${loc}'s most coveted address.`
        : `The home your family deserves — space, safety, and the best schools nearby.`,
      body: `${sizeStr} sqm · ${bedStr} bed · ${parseInt(bedStr) > 1 ? parseInt(bedStr) - 1 : 1} bath · ${dist}, ${loc}\n\n`
        + (angle === "investment-yield"
          ? `✓ Projected 8.2% annual yield\n✓ 94% occupancy in area\n✓ ${dist} appreciation +12% YoY\n✓ Tenant-ready condition`
          : angle === "luxury-lifestyle"
          ? `✓ Premium finishes throughout\n✓ Panoramic city views\n✓ Private parking + concierge\n✓ Minutes from ${dist}'s finest dining`
          : `✓ Near top-rated international schools\n✓ Gated community with 24/7 security\n✓ Spacious garden & play area\n✓ Family-friendly neighborhood`),
      urgency: `⚡ ${Math.floor(Math.random() * 8) + 12} buyers viewed this week · Only 1 unit at this price`,
      cta: `Tap to unlock full details & schedule a private viewing →`,
    },
    luxury: {
      headline: `An Exceptional ${t} in the Heart of ${dist}`,
      hook: angle === "investment-yield"
        ? `Where intelligent capital meets impeccable design — a rare acquisition opportunity in ${loc}'s premier investment corridor.`
        : angle === "luxury-lifestyle"
        ? `A residence of quiet distinction — designed for those who understand that true luxury is found in the details.`
        : `A sanctuary of refined family living — where every space has been thoughtfully crafted for the moments that matter.`,
      body: `Positioned in the prestigious ${dist} enclave of ${loc}, this ${sizeStr} square metre ${t.toLowerCase()} represents a rare convergence of architectural elegance and strategic location.\n\n`
        + `Spanning ${bedStr} generously proportioned bedrooms with ${parseInt(bedStr) > 1 ? parseInt(bedStr) - 1 : 1} bathrooms, the residence features:\n\n`
        + (angle === "investment-yield"
          ? `• Premium specification throughout, commanding top-quartile rental rates\n• Located in ${dist}'s highest-demand rental corridor with 94% occupancy\n• Projected net yield of 8.2% — outperforming ${loc}'s average by 2.4x\n• Capital appreciation trajectory of 12% compound annual growth\n• Fully furnished to institutional tenant-ready standard`
          : angle === "luxury-lifestyle"
          ? `• Bespoke Italian marble flooring with underfloor climate control\n• Floor-to-ceiling glazing framing unobstructed panoramic views\n• Chef's kitchen with Gaggenau integrated appliances\n• Private residents' lounge, infinity pool, and wellness suite\n• Dedicated concierge and valet parking`
          : `• Thoughtfully designed open-plan living flowing to private garden terrace\n• Master suite with walk-in wardrobe and spa-inspired ensuite\n• Children's study and play areas bathed in natural light\n• Steps from ${loc}'s highest-rated international schools\n• 24-hour security within a landscaped gated community`)
        + `\n\nPriced at ${priceStr} — reflecting both the calibre of the residence and the trajectory of the ${dist} market.`,
      urgency: `This property is being presented to a select group of qualified buyers before wider market release. Early expressions of interest will be prioritised.`,
      cta: `Request a private viewing and comprehensive property dossier →`,
    },
    investor: {
      headline: `${dist}, ${loc} · ${t} · ${priceStr} · Yield Play + Appreciation Upside`,
      hook: `Data-backed acquisition opportunity in a high-liquidity micro-market with proven rental demand and accelerating capital growth.`,
      body: `ASSET SUMMARY\n`
        + `─────────────────────────────\n`
        + `Type: ${t} · ${sizeStr} sqm · ${bedStr}BR/${parseInt(bedStr) > 1 ? parseInt(bedStr) - 1 : 1}BA\n`
        + `Location: ${dist}, ${loc}\n`
        + `Asking Price: ${priceStr}\n`
        + `Price/sqm: ${priceStr ? "Rp 19.3M" : "—"}\n\n`
        + `YIELD ANALYSIS\n`
        + `─────────────────────────────\n`
        + `• Gross Rental Yield: 8.2% (area avg: 5.1%)\n`
        + `• Net Yield (after mgmt): 6.8%\n`
        + `• Area Occupancy Rate: 94%\n`
        + `• Avg Days-on-Market (rental): 11 days\n`
        + `• Comparable Rent: Rp 19.5M/month\n\n`
        + `CAPITAL APPRECIATION\n`
        + `─────────────────────────────\n`
        + `• ${dist} 3Y CAGR: 12.4%\n`
        + `• Infrastructure catalyst: MRT Phase 2 (${dist} station — 2026)\n`
        + `• Supply pipeline: Low (2 new projects vs 8 in adjacent districts)\n`
        + `• Liquidity score: 87/100 (ASTRA Intelligence)\n\n`
        + `RISK FACTORS\n`
        + `─────────────────────────────\n`
        + `• Regulatory: Stable — no pending zoning changes\n`
        + `• Oversupply risk: Low (demand/supply ratio 1.7x)\n`
        + `• Currency exposure: IDR-denominated asset`,
      urgency: `⚠ This asset scores in the top 5% of ASTRA's liquidity index. ${Math.floor(Math.random() * 4) + 3} qualified investors are currently evaluating.`,
      cta: `Unlock full investment memo, comparable analysis, and projected IRR model →`,
    },
  };
}

const ListingCopyGenerator = () => {
  const { toast } = useToast();
  const [type, setType] = useState<PropertyType>("apartment");
  const [location, setLocation] = useState("Jakarta");
  const [district, setDistrict] = useState("Menteng");
  const [segment, setSegment] = useState<BuyerSegment>("investor");
  const [angle, setAngle] = useState<EmotionalAngle>("investment-yield");
  const [price, setPrice] = useState("Rp 2.8B");
  const [beds, setBeds] = useState("3");
  const [size, setSize] = useState("145");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copies = generate(type, location, district, segment, price, angle, beds, size);

  const copyAll = (key: string, copy: ListingCopy) => {
    const text = `${copy.headline}\n\n${copy.hook}\n\n${copy.body}\n\n${copy.urgency}\n\n${copy.cta}`;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const versions: { key: string; label: string; icon: React.ElementType; color: string; copy: ListingCopy; desc: string }[] = [
    { key: "mobile", label: "Mobile-Friendly", icon: Smartphone, color: "text-emerald-500", copy: copies.mobile, desc: "Scannable, emoji-driven, optimized for small screens" },
    { key: "luxury", label: "Premium Luxury", icon: Crown, color: "text-amber-400", copy: copies.luxury, desc: "Institutional tone, aspirational language, exclusivity signals" },
    { key: "investor", label: "Investor Analytical", icon: BarChart3, color: "text-cyan-400", copy: copies.investor, desc: "Data-dense, yield-focused, terminal-style formatting" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6 text-primary" />
          Listing Copy Generator
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          High-conversion property descriptions in 3 tones — mobile, luxury & investor analytical
        </p>
      </div>

      {/* Config */}
      <Card className="border-border/40 bg-card/70">
        <CardContent className="pt-4 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Home className="h-3 w-3" />Type</label>
              <Select value={type} onValueChange={(v) => setType(v as PropertyType)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(propertyLabels).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><MapPin className="h-3 w-3" />City</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{["Jakarta", "Bandung", "Surabaya", "Bali", "Medan"].map(c => <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><MapPin className="h-3 w-3" />District</label>
              <Input value={district} onChange={e => setDistrict(e.target.value)} className="h-8 text-xs" placeholder="e.g. Menteng" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Heart className="h-3 w-3" />Angle</label>
              <Select value={angle} onValueChange={(v) => setAngle(v as EmotionalAngle)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(angleLabels).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><DollarSign className="h-3 w-3" />Price</label>
              <Input value={price} onChange={e => setPrice(e.target.value)} className="h-8 text-xs" placeholder="Rp 2.8B" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Home className="h-3 w-3" />Beds</label>
              <Input value={beds} onChange={e => setBeds(e.target.value)} className="h-8 text-xs" placeholder="3" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Eye className="h-3 w-3" />Size (sqm)</label>
              <Input value={size} onChange={e => setSize(e.target.value)} className="h-8 text-xs" placeholder="145" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground uppercase flex items-center gap-1"><Users className="h-3 w-3" />Segment</label>
              <Select value={segment} onValueChange={(v) => setSegment(v as BuyerSegment)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(segmentLabels).map(([k, v]) => <SelectItem key={k} value={k} className="text-xs">{v}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Copies */}
      <div className="space-y-4">
        {versions.map((v, i) => (
          <motion.div key={`${v.key}-${type}-${angle}-${location}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="border-border/40 bg-card/70">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <v.icon className={`h-5 w-5 ${v.color}`} />
                    <CardTitle className="text-sm">{v.label}</CardTitle>
                    <span className="text-[10px] text-muted-foreground">{v.desc}</span>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => copyAll(v.key, v.copy)}>
                    {copiedKey === v.key ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedKey === v.key ? "Copied" : "Copy All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Headline */}
                <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-[10px] text-primary uppercase mb-0.5 flex items-center gap-1"><Zap className="h-3 w-3" />Headline</p>
                  <p className="text-sm font-bold text-foreground">{v.copy.headline}</p>
                </div>

                {/* Hook */}
                <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase mb-0.5 flex items-center gap-1"><Sparkles className="h-3 w-3" />Emotional Hook</p>
                  <p className="text-xs text-foreground italic">{v.copy.hook}</p>
                </div>

                {/* Body */}
                <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
                  <p className="text-[10px] text-muted-foreground uppercase mb-1.5 flex items-center gap-1"><FileText className="h-3 w-3" />Description</p>
                  <pre className="whitespace-pre-wrap text-xs text-foreground/90 leading-relaxed font-sans">{v.copy.body}</pre>
                </div>

                {/* Urgency + CTA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg bg-destructive/5 border border-destructive/10">
                    <p className="text-[10px] text-destructive uppercase mb-0.5 flex items-center gap-1"><Clock className="h-3 w-3" />Urgency Frame</p>
                    <p className="text-xs text-foreground">{v.copy.urgency}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[10px] text-emerald-500 uppercase mb-0.5 flex items-center gap-1"><ArrowRight className="h-3 w-3" />Call-to-Action</p>
                    <p className="text-xs font-medium text-foreground">{v.copy.cta}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Optimization Tips */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Conversion Optimization Principles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { title: "Faster Scanning", tip: "Lead with numbers (beds, size, yield). Bullets > paragraphs. Bold the headline metric.", icon: Eye },
              { title: "Curiosity Activation", tip: "Withhold one key detail (exact view, floor plan) behind the inquiry button. 'Unlock full details' > 'Contact us'.", icon: Sparkles },
              { title: "Perceived Exclusivity", tip: "Use 'select buyers', 'private viewing', 'pre-market release'. Never say 'available' — say 'being presented to'.", icon: Crown },
              { title: "Deal Attractiveness", tip: "Anchor price against area average. Show price/sqm vs comparables. Frame as 'below market' when possible.", icon: TrendingUp },
            ].map((t, i) => (
              <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/20">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <t.icon className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-bold text-foreground">{t.title}</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{t.tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListingCopyGenerator;
