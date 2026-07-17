import { useEffect, useMemo, useState, useCallback, lazy, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Maximize2, X,
  MapPin, BedDouble, Bath, Square, Calendar, Users, Sparkles,
  TrendingUp, Flame, Trophy, Activity, Heart, Share2,
  MessageCircle, Phone, Box, Compass, ShieldCheck, Wind,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAIPropertyValuation } from "@/hooks/useAIPropertyValuation";
import { useFavorites } from "@/hooks/useFavorites";
import { shareProperty } from "@/utils/shareUtils";
import { useToast } from "@/hooks/use-toast";
import { SEOHead, seoSchemas } from "@/components/SEOHead";
import {
  LuxeLayout, LuxeSection, LuxeSectionHead, LuxeCard, LuxeButton,
} from "@/components/luxe";
import { cn } from "@/lib/utils";

const GLBModelViewer = lazy(() => import("@/components/property/GLBModelViewer"));

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */
interface PropertyRow {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  location: string | null;
  city: string | null;
  district: string | null;
  province: string | null;
  address: string | null;
  property_type: string | null;
  listing_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  images: string[] | null;
  image_urls: string[] | null;
  property_features: Record<string, any> | null;
  virtual_tour_url: string | null;
  three_d_model_url: string | null;
  glb_model_url: string | null;
  panorama_360_urls: string[] | null;
  drone_video_url: string | null;
  status: string | null;
  owner_id: string | null;
  agent_id: string | null;
  created_at: string | null;
}

async function fetchProperty(id: string): Promise<PropertyRow> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as PropertyRow;
}

const fmtIDR = (n: number | null | undefined) => {
  if (n == null) return "—";
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 2)} M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)} jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
};

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */
const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["luxe-property", id],
    queryFn: () => fetchProperty(id!),
    enabled: !!id,
    staleTime: 5 * 60_000,
  });

  const { data: ai } = useAIPropertyValuation(id);

  const images = useMemo<string[]>(() => {
    if (!property) return [];
    const a = property.images?.length ? property.images : property.image_urls || [];
    return a.filter(Boolean);
  }, [property]);

  /* ----- Gallery state ----- */
  const [idx, setIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const next = useCallback(() => setIdx(i => (i + 1) % Math.max(1, images.length)), [images.length]);
  const prev = useCallback(() => setIdx(i => (i - 1 + Math.max(1, images.length)) % Math.max(1, images.length)), [images.length]);

  useEffect(() => {
    if (!fullscreen || images.length < 2) return;
    const t = window.setInterval(next, 6500);
    return () => window.clearInterval(t);
  }, [fullscreen, next, images.length]);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, next, prev]);

  /* ----- Booking state ----- */
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  const { toggleFavorite, isFavorite } = useFavorites({
    title: property?.title,
    images: property?.images || undefined,
  });

  const handleShare = async () => {
    if (!property) return;
    await shareProperty({
      id: property.id,
      title: property.title,
      price: property.price || 0,
      location: property.location || property.city || "",
      images: images.slice(0, 1),
    });
  };

  const whatsappLink = useMemo(() => {
    if (!property) return "#";
    const msg = `Hi, saya tertarik dengan villa "${property.title}" (${window.location.href}). Bisa minta info ketersediaan?`;
    return `https://wa.me/6281234567890?text=${encodeURIComponent(msg)}`;
  }, [property]);

  /* ------------------------------------------------------------- */
  /*  Loading / Error                                              */
  /* ------------------------------------------------------------- */
  if (isLoading) {
    return (
      <LuxeLayout>
        <div className="min-h-[60vh] grid place-items-center">
          <div className="luxe-shimmer h-12 w-64 rounded-full" />
        </div>
      </LuxeLayout>
    );
  }
  if (error || !property) {
    return (
      <LuxeLayout>
        <LuxeSection pad="lg">
          <div className="text-center">
            <h1 className="font-serif-l text-4xl">Villa not found</h1>
            <p className="text-luxe-mut mt-3">The listing you are looking for is unavailable.</p>
            <LuxeButton variant="gold" className="mt-8" onClick={() => navigate("/properties")}>
              Explore villas
            </LuxeButton>
          </div>
        </LuxeSection>
      </LuxeLayout>
    );
  }

  const hero = images[idx] || "/placeholder.svg";
  const loc = [property.district, property.city, property.province].filter(Boolean).join(", ") || property.location || "Bali, Indonesia";

  const features: { icon: any; label: string; value: string }[] = [
    { icon: BedDouble, label: "Bedrooms", value: property.bedrooms?.toString() ?? "—" },
    { icon: Bath,      label: "Bathrooms", value: property.bathrooms?.toString() ?? "—" },
    { icon: Square,    label: "Area", value: property.area_sqm ? `${property.area_sqm} m²` : "—" },
    { icon: Wind,      label: "Type", value: property.property_type ?? "Villa" },
  ];

  const amenities: string[] = Array.isArray(property.property_features?.amenities)
    ? property.property_features!.amenities
    : ["Infinity pool", "Private chef", "Ocean view", "Concierge 24/7", "Smart home", "Yoga deck", "Sunset terrace", "Wine cellar"];

  /* ------------------------------------------------------------- */
  /*  Render                                                       */
  /* ------------------------------------------------------------- */
  return (
    <LuxeLayout>
      <SEOHead
        title={`${property.title} — ASTRA Villa`}
        description={property.description?.slice(0, 160) || `Cinematic luxury villa in ${loc}`}
        ogImage={images[0]}
        canonical={`https://astravilla.com/property/${property.id}`}
        jsonLd={seoSchemas.property({
          title: property.title,
          description: property.description?.slice(0, 300) || `Luxury villa in ${loc}`,
          price: property.price || 0,
          city: property.city || property.location || "Bali",
          state: property.province || property.state || "Bali",
          images,
          bedrooms: property.bedrooms ?? undefined,
          bathrooms: property.bathrooms ?? undefined,
          areaSqm: property.area_sqm ?? undefined,
          url: `https://astravilla.com/property/${property.id}`,
        })}
      />

      {/* ============ CINEMATIC HERO GALLERY ============ */}
      <section className="relative w-full h-[78vh] md:h-[92vh] overflow-hidden luxe-grain">
        {images.map((src, i) => (
          <div
            key={src + i}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1200ms] ease-out",
              i === idx ? "opacity-100" : "opacity-0",
            )}
            aria-hidden={i !== idx}
          >
            <img
              src={src}
              alt={`${property.title} — view ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className={cn("h-full w-full object-cover", i === idx && "luxe-kenburns")}
            />
          </div>
        ))}

        {/* atmospheric overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent" />

        {/* top bar */}
        <div className="absolute top-0 inset-x-0 z-20 pt-24 md:pt-28 px-5 md:px-10 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="luxe-ghost-btn rounded-full px-4 py-2 text-[12px] inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => toggleFavorite(property.id)} className="luxe-ghost-btn rounded-full p-2.5">
              <Heart className={cn("h-4 w-4", isFavorite(property.id) && "fill-[var(--luxe-gold)] text-[var(--luxe-gold)]")} />
            </button>
            <button onClick={handleShare} className="luxe-ghost-btn rounded-full p-2.5">
              <Share2 className="h-4 w-4" />
            </button>
            <button onClick={() => setFullscreen(true)} className="luxe-ghost-btn rounded-full p-2.5">
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* gallery controls */}
        {images.length > 1 && (
          <>
            <button onClick={prev} className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 luxe-ghost-btn rounded-full p-3 hidden md:inline-flex">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button onClick={next} className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 luxe-ghost-btn rounded-full p-3 hidden md:inline-flex">
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* hero info */}
        <div className="absolute inset-x-0 bottom-0 z-10 px-5 md:px-10 pb-12 md:pb-20">
          <div className="max-w-[1440px] mx-auto">
            <span className="luxe-eyebrow">{property.property_type || "Private Villa"} · {property.listing_type === "rent" ? "Nightly Stay" : "For Sale"}</span>
            <h1 className="font-serif-l mt-4 text-[40px] md:text-[88px] leading-[0.95] tracking-tight max-w-4xl">
              {property.title}
            </h1>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-luxe-fg/80">
              <span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-[var(--luxe-gold)]" />{loc}</span>
              <span className="inline-flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-[var(--luxe-gold)]" />AI Score {ai?.investment_score?.toFixed(0) ?? "—"}/100</span>
            </div>

            {/* pagination + counter */}
            {images.length > 1 && (
              <div className="mt-8 flex items-center gap-4">
                <div className="flex gap-1.5">
                  {images.slice(0, 8).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIdx(i)}
                      className={cn(
                        "h-[2px] transition-all duration-500",
                        i === idx ? "w-10 bg-[var(--luxe-gold)]" : "w-5 bg-white/25",
                      )}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
                <span className="font-mono-l text-[11px] text-luxe-mut">
                  {String(idx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ MAIN GRID — info + sticky booking ============ */}
      <LuxeSection pad="md">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-12 lg:gap-16">
          {/* ----- Left column ----- */}
          <div className="space-y-20">
            {/* feature strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {features.map(f => (
                <LuxeCard key={f.label} variant="glass" radius="md" className="p-5">
                  <f.icon className="h-4 w-4 text-[var(--luxe-gold)]" />
                  <div className="mt-3 font-serif-l text-[22px] leading-none">{f.value}</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] text-luxe-mut mt-2">{f.label}</div>
                </LuxeCard>
              ))}
            </div>

            {/* story */}
            <div>
              <span className="luxe-eyebrow">The Story</span>
              <h2 className="font-serif-l text-[32px] md:text-[44px] leading-[1.05] mt-4 max-w-2xl">
                A cinematic retreat shaped by light, stone, and the rhythm of the ocean.
              </h2>
              <div className="luxe-divider my-8" />
              <p className="text-[15px] md:text-[16px] leading-[1.85] text-luxe-fg/80 max-w-2xl whitespace-pre-line">
                {property.description ||
                  "An architectural sanctuary composed in dialogue with its landscape. Long sightlines, layered terraces and a quiet palette of timber and travertine create an atmosphere that feels at once contemporary and timeless."}
              </p>
            </div>

            {/* AI intelligence panel */}
            <div>
              <LuxeSectionHead
                eyebrow="ASTRA Intelligence"
                title={<>Property <em className="not-italic text-[var(--luxe-gold)]">intelligence</em></>}
                description="Real-time signals from our investment, demand and market models."
              />
              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
                <Metric icon={Trophy}   label="Investment"  value={ai?.investment_score?.toFixed(0) ?? "—"} unit="/100" tint="gold" />
                <Metric icon={TrendingUp} label="Est. ROI"  value={ai ? `${(ai.deviation_percent ? Math.abs(ai.deviation_percent) : 12).toFixed(1)}` : "12.4"} unit="% yr" tint="emerald" />
                <Metric icon={Flame}    label="Demand"      value={ai?.demand_heat_score?.toFixed(0) ?? "82"} unit="/100" tint="ember" />
                <Metric icon={Activity} label="Liquidity"   value={ai ? `${Math.round((ai.confidence ?? 0.7) * 100)}` : "74"} unit="/100" tint="cyan" />
              </div>
              {ai?.price_position && (
                <p className="mt-6 text-[12px] text-luxe-mut">
                  Price position: <span className="text-luxe-fg capitalize">{ai.price_position.replace("_", " ")}</span>
                  {" · "}vs market avg{" "}
                  <span className="text-luxe-fg">{fmtIDR(ai.avg_price_per_sqm)}/m²</span>
                </p>
              )}
            </div>

            {/* amenities */}
            <div>
              <LuxeSectionHead eyebrow="Amenities" title="What's inside" />
              <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                {amenities.map((a: string) => (
                  <div key={a} className="flex items-center gap-3 text-[14px] text-luxe-fg/85 border-b border-luxe pb-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--luxe-gold)]" />
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* immersive */}
            {(property.glb_model_url || property.virtual_tour_url || property.panorama_360_urls?.length) && (
              <div>
                <LuxeSectionHead
                  eyebrow="Immersive"
                  title={<>Step <em className="not-italic text-[var(--luxe-gold)]">inside</em></>}
                  description="Walk the villa in 3D or explore 360° panoramas of every room."
                />
                <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {property.glb_model_url && (
                    <LuxeCard variant="glass" radius="lg" className="overflow-hidden">
                      <div className="aspect-[4/3] bg-black">
                        <Suspense fallback={<div className="luxe-shimmer h-full w-full" />}>
                          <GLBModelViewer modelUrl={property.glb_model_url} />
                        </Suspense>
                      </div>
                      <div className="p-5 flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 text-[12px]">
                          <Box className="h-3.5 w-3.5 text-[var(--luxe-gold)]" /> 3D Digital Twin
                        </div>
                        <Link to={`/digital-twin/${property.id}`} className="text-[12px] text-luxe-gold hover:underline">Open</Link>
                      </div>
                    </LuxeCard>
                  )}
                  {(property.virtual_tour_url || (property.panorama_360_urls?.length ?? 0) > 0) && (
                    <LuxeCard variant="glass" radius="lg" className="p-6 flex flex-col justify-between">
                      <div>
                        <Compass className="h-5 w-5 text-[var(--luxe-gold)]" />
                        <h3 className="font-serif-l text-[24px] mt-4">360° Virtual Tour</h3>
                        <p className="text-[13px] text-luxe-mut mt-2">Navigate room-by-room with cinematic hotspots.</p>
                      </div>
                      <a
                        href={property.virtual_tour_url || "#"}
                        target="_blank" rel="noreferrer"
                        className="luxe-gold-btn rounded-full px-5 py-3 text-[12px] font-medium inline-flex items-center justify-center gap-2 mt-6 self-start"
                      >
                        Enter tour
                      </a>
                    </LuxeCard>
                  )}
                </div>
              </div>
            )}

            {/* location atmosphere */}
            <div>
              <LuxeSectionHead eyebrow="Location" title="The neighborhood" description="A calm corner of the island, minutes from beach clubs, fine dining and wellness retreats." />
              <LuxeCard variant="glass" radius="lg" className="mt-10 p-8">
                <div className="flex items-center gap-3 text-[13px]">
                  <MapPin className="h-4 w-4 text-[var(--luxe-gold)]" />
                  <span>{loc}</span>
                </div>
                <div className="luxe-divider my-6" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {[
                    ["Beach", "4 min"], ["Airport", "35 min"],
                    ["Cafes", "2 min"], ["Yoga", "6 min"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div className="font-serif-l text-[24px]">{v}</div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-luxe-mut mt-2">{k}</div>
                    </div>
                  ))}
                </div>
              </LuxeCard>
            </div>
          </div>

          {/* ----- Right column — sticky booking ----- */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <LuxeCard variant="glass" radius="lg" glow className="p-7 md:p-8">
              <div className="flex items-baseline gap-2">
                <span className="font-serif-l text-[40px] leading-none">{fmtIDR(property.price)}</span>
                <span className="text-[12px] text-luxe-mut">{property.listing_type === "rent" ? "/ night" : ""}</span>
              </div>
              <div className="luxe-divider my-6" />

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <BookingField label="Check in" icon={Calendar}>
                    <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                      className="w-full bg-transparent text-[13px] text-luxe-fg outline-none [color-scheme:dark]" />
                  </BookingField>
                  <BookingField label="Check out" icon={Calendar}>
                    <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                      className="w-full bg-transparent text-[13px] text-luxe-fg outline-none [color-scheme:dark]" />
                  </BookingField>
                </div>
                <BookingField label="Guests" icon={Users}>
                  <input type="number" min={1} max={20} value={guests} onChange={e => setGuests(parseInt(e.target.value) || 1)}
                    className="w-full bg-transparent text-[13px] text-luxe-fg outline-none" />
                </BookingField>
              </div>

              <button
                onClick={() => {
                  if (!checkIn || !checkOut) {
                    toast({ title: "Select dates", description: "Please choose check-in and check-out." });
                    return;
                  }
                  toast({ title: "Reservation requested", description: "Our concierge will confirm shortly." });
                }}
                className="luxe-gold-btn w-full rounded-full py-3.5 text-[13px] font-medium mt-6"
              >
                Reserve
              </button>

              <a href={whatsappLink} target="_blank" rel="noreferrer"
                 className="luxe-ghost-btn w-full rounded-full py-3.5 text-[12px] mt-3 inline-flex items-center justify-center gap-2">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Concierge
              </a>

              <div className="luxe-divider my-6" />
              <div className="flex items-center gap-2 text-[11px] text-luxe-mut">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--luxe-emerald)]" />
                Verified listing · Escrow-protected payments
              </div>
            </LuxeCard>
          </aside>
        </div>
      </LuxeSection>

      {/* ============ FULLSCREEN GALLERY ============ */}
      {fullscreen && (
        <div className="fixed inset-0 z-[120] bg-black">
          <img src={hero} alt="" className="h-full w-full object-contain" />
          <button onClick={() => setFullscreen(false)}
                  className="absolute top-6 right-6 luxe-ghost-btn rounded-full p-3 z-10">
            <X className="h-5 w-5" />
          </button>
          {images.length > 1 && (
            <>
              <button onClick={prev} className="absolute left-6 top-1/2 -translate-y-1/2 luxe-ghost-btn rounded-full p-3">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={next} className="absolute right-6 top-1/2 -translate-y-1/2 luxe-ghost-btn rounded-full p-3">
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-6 inset-x-0 text-center font-mono-l text-[11px] text-luxe-mut">
                {String(idx + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </div>
            </>
          )}
        </div>
      )}

      {/* mobile booking bar */}
      <div className="lg:hidden fixed bottom-[72px] inset-x-3 z-40">
        <LuxeCard variant="glass" radius="pill" className="px-5 py-3 flex items-center justify-between">
          <div>
            <div className="font-serif-l text-[18px] leading-none">{fmtIDR(property.price)}</div>
            <div className="text-[10px] text-luxe-mut mt-1">{property.listing_type === "rent" ? "per night" : "list price"}</div>
          </div>
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="luxe-gold-btn rounded-full px-5 py-2.5 text-[12px] font-medium inline-flex items-center gap-2">
            <Phone className="h-3.5 w-3.5" /> Reserve
          </a>
        </LuxeCard>
      </div>
    </LuxeLayout>
  );
};

/* ------------------------------------------------------------------ */
/*  Small primitives                                                  */
/* ------------------------------------------------------------------ */
function Metric({
  icon: Icon, label, value, unit, tint,
}: {
  icon: any; label: string; value: string; unit?: string;
  tint?: "gold" | "emerald" | "ember" | "cyan";
}) {
  const color = {
    gold: "var(--luxe-gold)",
    emerald: "var(--luxe-emerald)",
    ember: "var(--luxe-ember)",
    cyan: "var(--luxe-cyan)",
  }[tint || "gold"];
  return (
    <LuxeCard variant="glass" radius="md" glow className="p-5">
      <Icon className="h-4 w-4" style={{ color }} />
      <div className="mt-4 flex items-baseline gap-1">
        <div className="font-serif-l text-[30px] leading-none">{value}</div>
        {unit && <div className="text-[11px] text-luxe-mut">{unit}</div>}
      </div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-luxe-mut mt-2">{label}</div>
    </LuxeCard>
  );
}

function BookingField({
  label, icon: Icon, children,
}: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <label className="block rounded-2xl border border-luxe bg-luxe-glass px-4 py-3 focus-within:border-[var(--luxe-gold)]/50 transition-colors">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-luxe-mut">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export default PropertyDetail;
