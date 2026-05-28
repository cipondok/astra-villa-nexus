import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Wand2, Image as ImageIcon, Loader2, Check, RefreshCw, Crown } from "lucide-react";
import MultiStepPropertyForm from "@/components/property/MultiStepPropertyForm";

type AutofillResult = {
  title?: string;
  short_description?: string;
  description?: string;
  amenities?: string[];
  features?: Record<string, boolean>;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  suggested_price_idr?: number;
  roi_estimate_pct?: number;
  luxury_tier?: string;
  seo_title?: string;
  seo_description?: string;
  highlights?: string[];
};

const STYLES = [
  { id: "bali_luxury", label: "Bali Luxury" },
  { id: "modern_tropical", label: "Modern Tropical" },
  { id: "minimalist", label: "Minimalist" },
  { id: "jungle_retreat", label: "Jungle Retreat" },
  { id: "beachfront", label: "Beachfront" },
  { id: "futuristic_smart", label: "Futuristic Smart" },
];

const IMG_MODES = [
  { id: "cinematic", label: "Cinematic" },
  { id: "realistic", label: "Realistic" },
  { id: "architectural", label: "Architectural" },
  { id: "marketing", label: "Marketing" },
  { id: "dusk", label: "Dusk" },
  { id: "aerial", label: "Aerial" },
];

export default function LuxeListingStudio() {
  const { user } = useAuth();
  const { toast } = useToast();

  // AI Brief inputs
  const [location, setLocation] = useState("Seminyak, Bali");
  const [propertyType, setPropertyType] = useState("villa");
  const [listingType, setListingType] = useState("sale");
  const [luxuryLevel, setLuxuryLevel] = useState("premium");
  const [style, setStyle] = useState("bali_luxury");
  const [audience, setAudience] = useState("international investors");
  const [autofilling, setAutofilling] = useState(false);
  const [lastResult, setLastResult] = useState<AutofillResult | null>(null);

  // Image generator
  const [imgPrompt, setImgPrompt] = useState("4-bedroom infinity-pool villa with open living pavilion");
  const [imgStyle, setImgStyle] = useState("bali_luxury");
  const [imgMode, setImgMode] = useState("cinematic");
  const [generating, setGenerating] = useState(false);
  const [gallery, setGallery] = useState<{ url: string; path: string }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const applyToDraft = (data: AutofillResult, images: string[] = []) => {
    if (!user) return;
    const draftKey = `property_draft_${user.id}`;
    const existing = (() => {
      try { return JSON.parse(localStorage.getItem(draftKey) || "null"); } catch { return null; }
    })();

    const formData = {
      ...(existing?.formData ?? {}),
      title: data.title ?? existing?.formData?.title ?? "",
      description: data.description ?? existing?.formData?.description ?? "",
      property_type: propertyType,
      listing_type: listingType,
      price: data.suggested_price_idr ? String(data.suggested_price_idr) : (existing?.formData?.price ?? ""),
      bedrooms: data.bedrooms != null ? String(data.bedrooms) : (existing?.formData?.bedrooms ?? ""),
      bathrooms: data.bathrooms != null ? String(data.bathrooms) : (existing?.formData?.bathrooms ?? ""),
      area_sqm: data.area_sqm != null ? String(data.area_sqm) : (existing?.formData?.area_sqm ?? ""),
      location: location,
      city: existing?.formData?.city ?? "",
      state: existing?.formData?.state ?? "",
      area: "",
      district: "",
      subdistrict: "",
      development_status: existing?.formData?.development_status ?? "completed",
      owner_type: existing?.formData?.owner_type ?? "individual",
      status: existing?.formData?.status ?? "pending_approval",
      rental_periods: existing?.formData?.rental_periods ?? ["monthly"],
      minimum_rental_days: existing?.formData?.minimum_rental_days ?? "30",
      images: [...(existing?.formData?.images ?? []), ...images],
      virtual_tour_url: existing?.formData?.virtual_tour_url ?? "",
      three_d_model_url: existing?.formData?.three_d_model_url ?? "",
      seo_title: data.seo_title,
      seo_description: data.seo_description,
    };

    const features = {
      parking: data.features?.parking ?? existing?.features?.parking ?? false,
      swimming_pool: data.features?.swimming_pool ?? existing?.features?.swimming_pool ?? false,
      garden: data.features?.garden ?? existing?.features?.garden ?? false,
      balcony: data.features?.balcony ?? existing?.features?.balcony ?? false,
      furnished: data.features?.furnished ?? existing?.features?.furnished ?? false,
      air_conditioning: data.features?.air_conditioning ?? existing?.features?.air_conditioning ?? false,
      security: data.features?.security ?? existing?.features?.security ?? false,
      elevator: data.features?.elevator ?? existing?.features?.elevator ?? false,
    };

    localStorage.setItem(draftKey, JSON.stringify({
      formData,
      features,
      currentTab: "basic",
      timestamp: new Date().toISOString(),
      userId: user.id,
    }));
    window.dispatchEvent(new Event("astra:property-imported"));
  };

  const handleAutofill = async () => {
    setAutofilling(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-property-studio", {
        body: {
          mode: "autofill",
          input: {
            location, property_type: propertyType, listing_type: listingType,
            luxury_level: luxuryLevel, style, target_audience: audience, language: "id",
          },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const result: AutofillResult = data.result ?? {};
      setLastResult(result);
      applyToDraft(result);
      toast({ title: "AI brief applied", description: "Form filled with luxury copy. Review and refine below." });
    } catch (e: any) {
      toast({ title: "Autofill failed", description: e.message || "Try again", variant: "destructive" });
    } finally {
      setAutofilling(false);
    }
  };

  const handleGenerateImage = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-property-studio", {
        body: {
          mode: "generate-image",
          input: { prompt: imgPrompt, style: imgStyle, mode_label: imgMode },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setGallery((g) => [{ url: data.url, path: data.path }, ...g].slice(0, 12));
      toast({ title: "Image generated", description: "Preview added to gallery." });
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message || "Try again", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const toggleSelect = (url: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(url) ? n.delete(url) : n.add(url);
      return n;
    });
  };

  const applySelectedImages = () => {
    if (selected.size === 0) {
      toast({ title: "No images selected" });
      return;
    }
    applyToDraft(lastResult ?? {}, Array.from(selected));
    toast({ title: `${selected.size} image(s) added to draft` });
    setSelected(new Set());
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* AI BRIEF PANEL */}
      <section
        className="relative overflow-hidden rounded-2xl border border-primary/20 p-4 md:p-6"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--card)/0.9), hsl(var(--card)/0.6))",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/15 grid place-items-center">
            <Crown className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-foreground">AI Listing Brief</h2>
            <p className="text-xs text-muted-foreground">Generate luxury copy, amenities, pricing and SEO in one click.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Location</Label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Property Type</Label>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="villa">Villa</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="penthouse">Penthouse</SelectItem>
                <SelectItem value="resort">Resort</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Listing Type</Label>
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sale">For Sale</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="lease">Leasehold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Luxury Level</Label>
            <Select value={luxuryLevel} onValueChange={setLuxuryLevel}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="ultra-luxury">Ultra Luxury</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Style</Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Target Audience</Label>
            <Input value={audience} onChange={(e) => setAudience(e.target.value)} className="h-9" />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          <Button onClick={handleAutofill} disabled={autofilling} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {autofilling ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Wand2 className="h-4 w-4 mr-2" />}
            {autofilling ? "Generating brief..." : "Generate & Apply"}
          </Button>
          {lastResult?.luxury_tier && (
            <Badge variant="secondary" className="capitalize">
              Tier: {lastResult.luxury_tier}
            </Badge>
          )}
          {lastResult?.roi_estimate_pct != null && (
            <Badge variant="secondary">ROI ~{lastResult.roi_estimate_pct}%</Badge>
          )}
          {lastResult?.suggested_price_idr != null && (
            <Badge variant="secondary">
              Rp {new Intl.NumberFormat("id-ID").format(lastResult.suggested_price_idr)}
            </Badge>
          )}
        </div>

        {lastResult?.highlights && lastResult.highlights.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {lastResult.highlights.slice(0, 6).map((h, i) => (
              <span key={i} className="text-[10px] md:text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                <Sparkles className="inline h-2.5 w-2.5 mr-1 text-primary" />{h}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* AI IMAGE STUDIO */}
      <section
        className="relative overflow-hidden rounded-2xl border border-primary/20 p-4 md:p-6"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--card)/0.9), hsl(var(--card)/0.6))",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/15 grid place-items-center">
            <ImageIcon className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-foreground">AI Image Studio</h2>
            <p className="text-xs text-muted-foreground">Generate cinematic villa renders. Select to attach to the listing.</p>
          </div>
        </div>

        <div className="space-y-3">
          <Textarea
            value={imgPrompt}
            onChange={(e) => setImgPrompt(e.target.value)}
            placeholder="Describe the villa scene (e.g. infinity pool overlooking ocean at sunset)"
            className="min-h-[70px] text-sm"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Style</Label>
              <Select value={imgStyle} onValueChange={setImgStyle}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STYLES.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Mode</Label>
              <Select value={imgMode} onValueChange={setImgMode}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IMG_MODES.map((m) => <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 flex items-end gap-2">
              <Button onClick={handleGenerateImage} disabled={generating} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                {generating ? "Generating..." : "Generate Image"}
              </Button>
              {gallery.length > 0 && (
                <Button onClick={handleGenerateImage} variant="outline" size="icon" disabled={generating} className="h-9 w-9">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {gallery.length > 0 && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {gallery.map((g) => {
                  const isSel = selected.has(g.url);
                  return (
                    <button
                      key={g.path}
                      onClick={() => toggleSelect(g.url)}
                      className={`group relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all ${
                        isSel ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <img src={g.url} alt="generated villa" className="w-full h-full object-cover" loading="lazy" />
                      {isSel && (
                        <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-primary text-primary-foreground grid place-items-center">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">{selected.size} selected</span>
                <Button size="sm" onClick={applySelectedImages} disabled={selected.size === 0}>
                  Attach to listing
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FORM */}
      <section className="rounded-2xl border border-border bg-card p-2 md:p-5">
        <MultiStepPropertyForm />
      </section>
    </div>
  );
}
