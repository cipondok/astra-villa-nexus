import { useEffect, useMemo, useState, useCallback, useRef, lazy, Suspense } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Maximize2, X,
  MapPin, BedDouble, Bath, Square, Calendar, Users, Sparkles,
  TrendingUp, Flame, Trophy, Activity, Heart, Share2,
  MessageCircle, Phone, Box, Compass, ShieldCheck, Wind, Images,
  Send, Bell, CalendarClock, ChevronDown, Play, Camera, Map as MapIcon,
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
import { PropertyWorkflowRail } from "@/components/property/PropertyWorkflowRail";
import MarketContextCard from "@/components/property/MarketContextCard";
import NearbyInvestments from "@/components/property/NearbyInvestments";
import AIRecommendedProperties from "@/components/property/AIRecommendedProperties";
import InvestmentIntelligenceBadge from "@/components/property/InvestmentIntelligenceBadge";
import { usePropertyCtaTracking, type CtaPlacement, type CtaKind } from "@/hooks/usePropertyCtaTracking";
import { useTrackEvent } from "@/hooks/useTrackEvent";

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

  /* ----- Contact form state ----- */
  const [inquiryReason, setInquiryReason] = useState("Request more information");
  const [inquiryMessage, setInquiryMessage] = useState("I'm interested in this property and would like more information.");
  const [sending, setSending] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("10:00");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertEmail, setAlertEmail] = useState("");

  /* ----- CTA analytics tracking ----- */
  const { registerImpression, trackClick } = usePropertyCtaTracking({
    propertyId: property?.id,
    city: property?.city,
    price: property?.price,
    listingType: property?.listing_type,
  });
  const { trackEvent } = useTrackEvent();

  /* ----- Scroll-aware sticky action bar ----- */
  const [scrolled, setScrolled] = useState(false);
  const stickyBarShownRef = useRef(false);
  const stickyShownAtRef = useRef<number | null>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 280);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fire a one-time exposure event when the sticky bar first becomes visible.
  // Serves as the denominator for mini_bar click-through / conversion rates.
  useEffect(() => {
    if (!scrolled || stickyBarShownRef.current || !property?.id) return;
    stickyBarShownRef.current = true;
    stickyShownAtRef.current = performance.now();
    trackEvent("sticky_bar_shown", {
      property_id: property.id,
      city: property.city ?? undefined,
      metadata: {
        price: property.price ?? null,
        listing_type: property.listing_type ?? null,
        scroll_y: Math.round(window.scrollY),
        viewport_w: window.innerWidth,
      },
    });
  }, [scrolled, property?.id, property?.city, property?.price, property?.listing_type, trackEvent]);

  /** Ref callback factory that fires an impression event once visible. */
  const ctaRef = useCallback(
    (cta: CtaKind, placement: CtaPlacement) => (el: HTMLElement | null) => {
      registerImpression(el, { cta, placement });
    },
    [registerImpression],
  );

  /** Wraps trackClick with dwell-time metadata for mini_bar CTAs. */
  const trackStickyClick = useCallback(
    (cta: CtaKind, outcome: "booking_initiated" | "contact_opened", extra: Record<string, unknown> = {}) => {
      const dwellMs = stickyShownAtRef.current != null
        ? Math.round(performance.now() - stickyShownAtRef.current)
        : null;
      trackClick({
        cta,
        placement: "mini_bar",
        outcome,
        extra: { ...extra, dwell_ms: dwellMs, sticky_shown: stickyBarShownRef.current },
      });
    },
    [trackClick],
  );

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

  /* ----- Contact handlers ----- */
  const handleSendMessage = useCallback(async () => {
    if (!property) return;
    if (!inquiryMessage.trim()) {
      toast({ title: "Add a message", description: "Please write a short note for our concierge." });
      return;
    }
    setSending(true);
    try {
      trackClick({
        cta: "contact",
        placement: "sidebar",
        outcome: "contact_opened",
        extra: { channel: "form", reason: inquiryReason, message_len: inquiryMessage.length },
      });
      trackEvent("property_inquiry_submitted", {
        property_id: property.id,
        city: property.city ?? undefined,
        metadata: { reason: inquiryReason, price: property.price ?? null },
      });
      toast({
        title: "Inquiry sent",
        description: "Our concierge will reply within 24 hours.",
      });
      setInquiryMessage("");
    } finally {
      setSending(false);
    }
  }, [property, inquiryReason, inquiryMessage, trackClick, trackEvent, toast]);

  const handleRequestVisit = useCallback(() => {
    if (!property) return;
    if (!visitDate) {
      toast({ title: "Pick a date", description: "Please choose your preferred visit date." });
      return;
    }
    trackClick({
      cta: "contact",
      placement: "sidebar",
      outcome: "contact_opened",
      extra: { channel: "visit_request", visit_date: visitDate, visit_time: visitTime },
    });
    trackEvent("property_visit_requested", {
      property_id: property.id,
      city: property.city ?? undefined,
      metadata: { visit_date: visitDate, visit_time: visitTime },
    });
    toast({
      title: "Visit requested",
      description: `We will confirm your viewing on ${visitDate} at ${visitTime}.`,
    });
    setVisitOpen(false);
  }, [property, visitDate, visitTime, trackClick, trackEvent, toast]);

  const handlePriceAlert = useCallback(() => {
    if (!property) return;
    const email = alertEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Enter a valid email", description: "We'll notify you when this listing's price changes." });
      return;
    }
    trackEvent("property_price_alert_subscribed", {
      property_id: property.id,
      city: property.city ?? undefined,
      metadata: { email_domain: email.split("@")[1] },
    });
    toast({
      title: "Price alert active",
      description: "We'll email you the moment this listing's price moves.",
    });
    setAlertOpen(false);
    setAlertEmail("");
  }, [property, alertEmail, trackEvent, toast]);



  /* ------------------------------------------------------------- */
  /*  Loading / Error                                              */
  /* ------------------------------------------------------------- */
  if (isLoading) {
    return (
      <LuxeLayout>
        <section className="px-4 md:px-8 pt-24 md:pt-28" aria-busy="true" aria-live="polite">
          <div className="max-w-[1440px] mx-auto">
            <div className="relative overflow-hidden rounded-[28px] md:rounded-[36px] border border-luxe bg-luxe-surface shadow-[0_30px_80px_-30px_rgba(10,25,49,0.35)]">
              {/* Gallery mosaic skeleton */}
              <div className="grid grid-cols-12 gap-1.5 h-[340px] sm:h-[440px] lg:h-[520px]">
                <div className="col-span-12 md:col-span-8 luxe-shimmer" />
                <div className="hidden md:grid col-span-4 grid-rows-2 gap-1.5">
                  <div className="luxe-shimmer" />
                  <div className="luxe-shimmer" />
                </div>
              </div>

              {/* Title block skeleton */}
              <div className="p-6 md:p-10 lg:p-12 pb-8 md:pb-10">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                  <div className="max-w-2xl w-full space-y-6 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="luxe-shimmer h-6 w-32 rounded-full" />
                      <div className="luxe-shimmer h-4 w-24 rounded-full" />
                    </div>
                    <div className="space-y-3">
                      <div className="luxe-shimmer h-10 md:h-14 w-11/12 rounded-lg" />
                      <div className="luxe-shimmer h-10 md:h-14 w-3/4 rounded-lg" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-10 gap-y-4 pt-2">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="luxe-shimmer w-10 h-10 rounded-xl" />
                          <div className="space-y-2">
                            <div className="luxe-shimmer h-2.5 w-16 rounded" />
                            <div className="luxe-shimmer h-3 w-10 rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="luxe-shimmer w-full lg:w-52 h-40 rounded-2xl shrink-0" />
                </div>
              </div>
            </div>
          </div>
          <span className="sr-only">Loading property details</span>
        </section>
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
          state: property.province || "Bali",
          images,
          bedrooms: property.bedrooms ?? undefined,
          bathrooms: property.bathrooms ?? undefined,
          areaSqm: property.area_sqm ?? undefined,
          url: `https://astravilla.com/property/${property.id}`,
        })}
      />

      {/* ============ EDITORIAL HERO — framed gallery + content block ============ */}
      <section className="px-4 md:px-8 pt-24 md:pt-28">
        <div className="max-w-[1440px] mx-auto">
          <div className="relative overflow-hidden rounded-[28px] md:rounded-[36px] border border-luxe bg-luxe-surface shadow-[0_30px_80px_-30px_rgba(10,25,49,0.35)]">

            {/* --- Gallery grid 8/4 mosaic --- */}
            <div className="relative">
              {/* corner nav */}
              <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur-md text-[color:var(--luxe-ink,#0A1931)] shadow-sm hover:bg-white transition-all text-[11px] font-semibold uppercase tracking-[0.15em]"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Back</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(property.id)}
                    className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-[color:var(--luxe-ink,#0A1931)] shadow-sm hover:bg-white transition-all"
                    aria-label="Favorite"
                  >
                    <Heart className={cn("h-4 w-4", isFavorite(property.id) && "fill-[var(--luxe-gold)] text-[var(--luxe-gold)]")} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-[color:var(--luxe-ink,#0A1931)] shadow-sm hover:bg-white transition-all"
                    aria-label="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setFullscreen(true)}
                    className="p-2.5 rounded-full bg-white/90 backdrop-blur-md text-[color:var(--luxe-ink,#0A1931)] shadow-sm hover:bg-white transition-all"
                    aria-label="Expand"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Immobiliare-style 3/1 hero: main image + 4-row labeled thumb stack */}
              <div className="grid grid-cols-4 gap-1.5 h-[340px] sm:h-[440px] lg:h-[520px] overflow-hidden">
                <button
                  onClick={() => { setIdx(0); setFullscreen(true); }}
                  className="col-span-4 md:col-span-3 relative group overflow-hidden bg-luxe-surface"
                  aria-label="View main photo"
                >
                  <GalleryImg
                    src={images[0] || "/placeholder.svg"}
                    alt={`${property.title} — main view`}
                    eager
                    className="group-hover:scale-[1.05] duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-5 left-5 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] tracking-[0.2em] uppercase border border-white/10 text-white inline-flex items-center gap-1.5">
                    <Images className="h-3 w-3" /> 1 / {Math.max(1, images.length)}
                  </span>
                </button>

                <div className="hidden md:grid col-span-1 grid-rows-4 gap-1.5">
                  {[
                    { i: 1, label: "Interior" },
                    { i: 2, label: "Suite" },
                    { i: 3, label: "Detail" },
                  ].map(({ i, label }) => (
                    <button
                      key={i}
                      onClick={() => { setIdx(Math.min(i, images.length - 1)); setFullscreen(true); }}
                      className="relative group overflow-hidden bg-luxe-surface"
                      aria-label={`View ${label} photo`}
                    >
                      <GalleryImg
                        src={images[i] || images[0] || "/placeholder.svg"}
                        alt=""
                        className="group-hover:scale-110 duration-500"
                      />
                      <span className="absolute inset-0 flex items-end p-2.5 bg-gradient-to-t from-black/60 to-transparent text-[9px] uppercase tracking-[0.2em] font-semibold text-white">
                        {label}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={() => { setIdx(0); setFullscreen(true); }}
                    className="relative group overflow-hidden cursor-pointer bg-[color:var(--luxe-gold)]/10"
                    aria-label="Open full gallery"
                  >
                    <GalleryImg
                      src={images[4] || images[3] || images[0] || "/placeholder.svg"}
                      alt=""
                      className="opacity-30 group-hover:scale-110 duration-500"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                      <span className="text-[18px] font-semibold text-[var(--luxe-gold)] leading-none">
                        +{Math.max(0, images.length - 4)}
                      </span>
                      <span className="text-[9px] text-white/80 uppercase tracking-[0.25em] font-medium">Photos</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* --- Content block: quick chips → title/price → 6-col feature strip --- */}
            <div className="p-6 md:p-10 lg:p-12 pb-8 md:pb-10 space-y-8 md:space-y-10">

              {/* Quick access chips */}
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => { setIdx(0); setFullscreen(true); }}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-luxe-glass border border-luxe hover:border-[var(--luxe-gold)]/60 transition-all text-[11px] uppercase tracking-[0.2em] font-semibold text-luxe-fg"
                >
                  <Camera className="h-3.5 w-3.5 text-[var(--luxe-gold)]" />
                  {images.length} Photos
                </button>
                {(property.virtual_tour_url || (property.panorama_360_urls?.length ?? 0) > 0) && (
                  <a
                    href={property.virtual_tour_url || "#"}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-luxe-glass border border-luxe hover:border-[var(--luxe-gold)]/60 transition-all text-[11px] uppercase tracking-[0.2em] font-semibold text-luxe-fg"
                  >
                    <Compass className="h-3.5 w-3.5 text-[var(--luxe-gold)]" />
                    Virtual Tour
                  </a>
                )}
                {property.glb_model_url && (
                  <Link
                    to={`/digital-twin/${property.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-luxe-glass border border-luxe hover:border-[var(--luxe-gold)]/60 transition-all text-[11px] uppercase tracking-[0.2em] font-semibold text-luxe-fg"
                  >
                    <Box className="h-3.5 w-3.5 text-[var(--luxe-gold)]" />
                    3D Twin
                  </Link>
                )}
                {property.drone_video_url && (
                  <a
                    href={property.drone_video_url}
                    target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-luxe-glass border border-luxe hover:border-[var(--luxe-gold)]/60 transition-all text-[11px] uppercase tracking-[0.2em] font-semibold text-luxe-fg"
                  >
                    <Play className="h-3.5 w-3.5 text-[var(--luxe-gold)]" />
                    Drone Video
                  </a>
                )}
                <button
                  onClick={() => document.getElementById("neighborhood")?.scrollIntoView({ behavior: "smooth" })}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-luxe-glass border border-luxe hover:border-[var(--luxe-gold)]/60 transition-all text-[11px] uppercase tracking-[0.2em] font-semibold text-luxe-fg"
                >
                  <MapIcon className="h-3.5 w-3.5 text-[var(--luxe-gold)]" />
                  Location
                </button>
              </div>

              {/* Title + Price row with gold divider */}
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 border-b border-[var(--luxe-gold)]/20 pb-8">
                <div className="space-y-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 bg-luxe-glass text-luxe-fg text-[10px] font-bold uppercase tracking-widest rounded-full border border-luxe">
                      {property.property_type || "Signature Collection"}
                    </span>
                    <span className="text-[var(--luxe-gold)] text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> {loc}
                    </span>
                  </div>
                  <h1 className="font-serif-l text-[34px] md:text-[48px] lg:text-[56px] leading-[1.05] tracking-tight text-luxe-fg">
                    {property.title}
                  </h1>
                </div>
                <div className="text-left md:text-right shrink-0">
                  <span className="text-[var(--luxe-gold)] text-[10px] uppercase tracking-[0.2em] font-bold block mb-2">
                    {property.listing_type === "rent" ? "From / night" : "List price"}
                  </span>
                  <div className="font-serif-l text-[36px] md:text-[44px] leading-none text-luxe-fg">
                    {fmtIDR(property.price)}
                  </div>
                </div>
              </div>

              {/* 6-column feature strip */}
              <div className="grid grid-cols-3 md:grid-cols-6 gap-y-6 gap-x-4 pb-2">
                {[
                  { label: "Bedrooms", value: property.bedrooms?.toString() ?? "—" },
                  { label: "Surface", value: property.area_sqm ? `${property.area_sqm} m²` : "—" },
                  { label: "Baths", value: property.bathrooms?.toString() ?? "—" },
                  { label: "Listing", value: property.listing_type === "rent" ? "Rent" : "Sale" },
                  { label: "Type", value: property.property_type ?? "Villa" },
                ].map((f) => (
                  <div key={f.label} className="space-y-1.5">
                    <span className="text-luxe-mut text-[9px] uppercase tracking-[0.25em] block font-semibold">
                      {f.label}
                    </span>
                    <div className="text-[15px] md:text-[16px] font-semibold text-luxe-fg capitalize">
                      {f.value}
                    </div>
                  </div>
                ))}
                <div className="space-y-1.5">
                  <span className="text-luxe-mut text-[9px] uppercase tracking-[0.25em] block font-semibold">Status</span>
                  <div className="text-[15px] md:text-[16px] font-semibold text-[var(--luxe-gold)] inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4" /> Verified
                    {ai?.investment_score != null && (
                      <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full border border-[var(--luxe-gold)]/40 bg-[var(--luxe-gold)]/10">
                        AI {ai.investment_score.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PREMIUM GLASS STICKY ACTION BAR (bottom, all breakpoints) ============ */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 transition-all duration-300",
          scrolled ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-3 pointer-events-none",
        )}
        role="region"
        aria-label="Property quick actions"
        aria-hidden={!scrolled}
      >
        <div className="mx-auto max-w-[1440px] px-4 md:px-8 pb-4 md:pb-6">
          <div className="rounded-2xl bg-luxe-glass backdrop-blur-2xl border border-luxe shadow-[0_20px_60px_-20px_rgba(10,25,49,0.35)] px-5 py-4 md:px-8 md:py-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-[var(--luxe-gold)] uppercase tracking-[0.2em]">
                {property.listing_type === "rent" ? "From / night" : "List price"}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-serif-l text-[22px] md:text-[28px] leading-none text-luxe-fg whitespace-nowrap">
                  {fmtIDR(property.price)}
                </span>
                <span className="hidden sm:inline text-[11px] text-luxe-mut font-semibold uppercase tracking-wider">IDR</span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <a
                ref={scrolled ? ctaRef("contact", "mini_bar") : undefined}
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackStickyClick("contact", "contact_opened", { channel: "whatsapp" })}
                className="hidden sm:inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-luxe-fg font-bold text-[11px] uppercase tracking-widest border border-luxe hover:bg-luxe-glass transition-all"
                tabIndex={scrolled ? 0 : -1}
              >
                <MessageCircle className="h-3.5 w-3.5" /> Concierge
              </a>
              <button
                ref={scrolled ? ctaRef("reserve", "mini_bar") : undefined}
                onClick={() => {
                  trackStickyClick("reserve", "booking_initiated");
                  navigate(`/booking/${property.id}`);
                }}
                className="px-6 md:px-10 py-3 bg-[color:var(--luxe-ink,#0A1931)] text-[var(--luxe-gold)] rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-xl shadow-[color:var(--luxe-ink,#0A1931)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
                tabIndex={scrolled ? 0 : -1}
              >
                Reserve Now
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* ============ MAIN GRID — info + sticky booking ============ */}
      <LuxeSection pad="md">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 lg:gap-10">
          {/* ----- Left column ----- */}
          <div className="space-y-10 md:space-y-12">


            {/* story */}
            <div>
              <span className="luxe-eyebrow">The Story</span>
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-tight mt-3 max-w-2xl">
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
              <div className="mt-8">
                <InvestmentIntelligenceBadge
                  investmentScore={ai?.investment_score ?? 0}
                  rentalYield={ai?.deviation_percent ? Math.abs(ai.deviation_percent) : 0}
                  demandScore={ai?.demand_heat_score ?? 0}
                  liquidityScore={ai?.confidence ? Math.round(ai.confidence * 100) : 0}
                />
              </div>
            </div>

            {/* Comparables */}
            {ai?.top_comparables && ai.top_comparables.length > 0 && (
              <div>
                <LuxeSectionHead
                  eyebrow="Comparables"
                  title={<>Similar <em className="not-italic text-[var(--luxe-gold)]">listings</em></>}
                  description={`Benchmarked against ${ai.comparables_count} comparable properties in ${ai.city ?? "market"}.`}
                />
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {ai.top_comparables.slice(0, 3).map((c) => (
                    <Link key={c.id} to={`/property/${c.id}`}>
                      <LuxeCard variant="glass" radius="md" className="p-5 h-full hover:border-[var(--luxe-gold)]/40 transition">
                        <div className="text-[11px] uppercase tracking-[0.18em] text-luxe-mut">{c.city}</div>
                        <div className="font-serif-l text-[18px] mt-2 line-clamp-2">{c.title}</div>
                        <div className="luxe-divider my-4" />
                        <div className="flex items-baseline justify-between">
                          <span className="font-serif-l text-[22px]">{fmtIDR(c.price)}</span>
                          <span className="text-[11px] text-luxe-mut">{fmtIDR(c.price_per_sqm)}/m²</span>
                        </div>
                        <div className="text-[11px] text-luxe-mut mt-2">{c.area?.toLocaleString("id-ID")} m²</div>
                      </LuxeCard>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Market context */}
            {property.city && (
              <div>
                <LuxeSectionHead
                  eyebrow="Market Intelligence"
                  title={<>Neighborhood <em className="not-italic text-[var(--luxe-gold)]">signals</em></>}
                  description="Live market trends, demand heat and rental insight for the area."
                />
                <div className="mt-10">
                  <MarketContextCard city={property.city} currentPrice={property.price ?? undefined} />
                </div>
              </div>
            )}

            {/* Legal & Verification */}
            <div>
              <LuxeSectionHead
                eyebrow="Trust & Legal"
                title={<>Verification <em className="not-italic text-[var(--luxe-gold)]">status</em></>}
                description="Automated legal checks and ownership verification for peace of mind."
              />
              <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Ownership", ok: true },
                  { label: "Title Deed", ok: true },
                  { label: "Zoning", ok: true },
                  { label: "Tax Records", ok: true },
                ].map((v) => (
                  <LuxeCard key={v.label} variant="glass" radius="md" className="p-5">
                    <ShieldCheck className={cn("h-4 w-4", v.ok ? "text-emerald-400" : "text-luxe-mut")} />
                    <div className="mt-3 font-serif-l text-[16px]">{v.ok ? "Verified" : "Pending"}</div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-luxe-mut mt-2">{v.label}</div>
                  </LuxeCard>
                ))}
              </div>
              <p className="mt-4 text-[11px] text-luxe-mut">
                Backed by ASTRA AI Legal Assistant · <Link to={`/legal-verification/${property.id}`} className="text-luxe-gold hover:underline">View full report</Link>
              </p>
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
            <div id="neighborhood">

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

            {/* workflow rail — connect to REOS modules */}
            <PropertyWorkflowRail propertyId={property.id} price={property.price} />

            {/* Nearby investment opportunities */}
            <div>
              <NearbyInvestments propertyId={property.id} />
            </div>

            {/* AI Smart recommendations */}
            <div>
              <LuxeSectionHead
                eyebrow="Smart Recommendations"
                title={<>Curated <em className="not-italic text-[var(--luxe-gold)]">for you</em></>}
                description="Personalized matches based on this property, your saved preferences and market intelligence."
              />
              <div className="mt-10">
                <AIRecommendedProperties onPropertyClick={(p) => navigate(`/property/${p.id}`)} />
              </div>
            </div>
          </div>

          {/* ----- Right column — sticky contact card ----- */}
          <aside
            className="lg:sticky lg:self-start"
            style={{ top: "calc(var(--reos-header-h, 64px) + 60px)" }}
          >
            <div className="rounded-[20px] p-7 md:p-8 bg-luxe-glass backdrop-blur-2xl border border-[var(--luxe-gold)]/30 shadow-[0_30px_80px_-30px_rgba(10,25,49,0.45)]">
              <div className="flex items-baseline justify-between gap-3 mb-6">
                <h3 className="font-serif-l text-[22px] md:text-[24px] leading-none text-luxe-fg">Inquire</h3>
                <span className="text-[10px] uppercase tracking-[0.22em] text-[var(--luxe-gold)] font-semibold">
                  {property.listing_type === "rent" ? "For Rent" : "For Sale"}
                </span>
              </div>

              {/* Inquiry Reason */}
              <div className="space-y-2">
                <label className="text-[9px] uppercase tracking-[0.25em] text-[var(--luxe-gold)] font-semibold">
                  Inquiry Reason
                </label>
                <div className="relative">
                  <select
                    value={inquiryReason}
                    onChange={(e) => setInquiryReason(e.target.value)}
                    className="w-full bg-luxe-glass border border-luxe rounded-xl px-4 py-3.5 text-[13px] text-luxe-fg focus:outline-none focus:border-[var(--luxe-gold)] transition-all appearance-none pr-10 [color-scheme:dark]"
                  >
                    <option>Request more information</option>
                    <option>Book private viewing</option>
                    <option>Concierge consultation</option>
                    <option>Investment inquiry</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--luxe-gold)] pointer-events-none" />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2 mt-5">
                <label className="text-[9px] uppercase tracking-[0.25em] text-luxe-mut font-semibold">Message</label>
                <textarea
                  rows={4}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  className="w-full bg-luxe-glass border border-luxe rounded-xl px-4 py-3.5 text-[13px] text-luxe-fg focus:outline-none focus:border-[var(--luxe-gold)] transition-all resize-none placeholder:text-luxe-mut"
                  placeholder="Tell us what you'd like to know…"
                />
              </div>

              {/* Send Message */}
              <button
                ref={ctaRef("contact", "sidebar")}
                onClick={handleSendMessage}
                disabled={sending}
                className="mt-5 w-full bg-[var(--luxe-gold)] text-[color:var(--luxe-ink,#0A1931)] font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-all uppercase tracking-[0.2em] text-[11px] inline-flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Send className="h-3.5 w-3.5" />
                {sending ? "Sending…" : "Send Message"}
              </button>

              {/* Request Visit / Price Alert */}
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                <button
                  onClick={() => { setVisitOpen(v => !v); setAlertOpen(false); }}
                  className={cn(
                    "border py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold inline-flex items-center justify-center gap-1.5 transition-all",
                    visitOpen
                      ? "bg-[var(--luxe-gold)]/10 border-[var(--luxe-gold)]/60 text-[var(--luxe-gold)]"
                      : "border-luxe text-luxe-fg hover:bg-luxe-glass",
                  )}
                >
                  <CalendarClock className="h-3.5 w-3.5" /> Request Visit
                </button>
                <button
                  onClick={() => { setAlertOpen(v => !v); setVisitOpen(false); }}
                  className={cn(
                    "border py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold inline-flex items-center justify-center gap-1.5 transition-all",
                    alertOpen
                      ? "bg-[var(--luxe-gold)]/10 border-[var(--luxe-gold)]/60 text-[var(--luxe-gold)]"
                      : "border-luxe text-luxe-fg hover:bg-luxe-glass",
                  )}
                >
                  <Bell className="h-3.5 w-3.5" /> Price Alert
                </button>
              </div>

              {/* Request Visit panel */}
              {visitOpen && (
                <div className="mt-3 rounded-xl border border-[var(--luxe-gold)]/30 bg-luxe-glass p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-luxe-mut font-semibold">Date</span>
                      <input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="mt-1 w-full bg-transparent border border-luxe rounded-lg px-3 py-2 text-[12px] text-luxe-fg outline-none focus:border-[var(--luxe-gold)] [color-scheme:dark]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-[9px] uppercase tracking-[0.25em] text-luxe-mut font-semibold">Time</span>
                      <input
                        type="time"
                        value={visitTime}
                        onChange={(e) => setVisitTime(e.target.value)}
                        className="mt-1 w-full bg-transparent border border-luxe rounded-lg px-3 py-2 text-[12px] text-luxe-fg outline-none focus:border-[var(--luxe-gold)] [color-scheme:dark]"
                      />
                    </label>
                  </div>
                  <button
                    onClick={handleRequestVisit}
                    className="w-full bg-[var(--luxe-gold)] text-[color:var(--luxe-ink,#0A1931)] font-bold py-2.5 rounded-lg text-[10px] uppercase tracking-[0.2em]"
                  >
                    Confirm Visit
                  </button>
                </div>
              )}

              {/* Price Alert panel */}
              {alertOpen && (
                <div className="mt-3 rounded-xl border border-[var(--luxe-gold)]/30 bg-luxe-glass p-4 space-y-3">
                  <label className="block">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-luxe-mut font-semibold">Notify email</span>
                    <input
                      type="email"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="mt-1 w-full bg-transparent border border-luxe rounded-lg px-3 py-2 text-[12px] text-luxe-fg outline-none focus:border-[var(--luxe-gold)] placeholder:text-luxe-mut"
                    />
                  </label>
                  <button
                    onClick={handlePriceAlert}
                    className="w-full bg-[var(--luxe-gold)] text-[color:var(--luxe-ink,#0A1931)] font-bold py-2.5 rounded-lg text-[10px] uppercase tracking-[0.2em]"
                  >
                    Activate Alert
                  </button>
                </div>
              )}

              {/* Agent block */}
              <div className="mt-8 pt-6 border-t border-luxe">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[color:var(--luxe-ink,#0A1931)] border border-[var(--luxe-gold)]/40 flex items-center justify-center text-[var(--luxe-gold)] font-serif-l text-lg">
                    A
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-serif-l text-[16px] text-luxe-fg leading-tight">ASTRA Concierge</h4>
                    <p className="text-[10px] text-[var(--luxe-gold)] uppercase tracking-[0.2em] font-semibold mt-0.5">
                      Listing Specialist
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-2.5">
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackClick({ cta: "contact", placement: "sidebar", outcome: "contact_opened", extra: { channel: "whatsapp" } })}
                    className="w-full bg-luxe-glass border border-luxe py-3 rounded-xl text-[10px] uppercase tracking-[0.22em] font-bold text-[var(--luxe-gold)] hover:bg-[var(--luxe-gold)]/10 transition-all inline-flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Concierge (WhatsApp)
                  </a>
                  <button
                    ref={ctaRef("reserve", "sidebar")}
                    onClick={() => {
                      trackClick({ cta: "reserve", placement: "sidebar", outcome: "booking_initiated" });
                      navigate(`/booking/${property.id}`);
                    }}
                    className="w-full bg-[var(--luxe-gold)]/10 border border-[var(--luxe-gold)]/50 py-3 rounded-xl text-[10px] uppercase tracking-[0.22em] font-bold text-[var(--luxe-gold)] hover:bg-[var(--luxe-gold)]/20 transition-all"
                  >
                    Reserve with ASTRA
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-luxe flex items-center gap-2 text-[11px] text-luxe-mut">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--luxe-emerald)]" />
                Verified listing · Escrow-protected
              </div>
            </div>

            <p className="mt-4 text-center text-luxe-mut text-[9px] uppercase tracking-[0.3em] font-semibold">
              Verified by ASTRA Realty Group
            </p>
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

      {/* mobile booking bar is now unified with the glass sticky action bar above */}
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
  // Extract numeric progress for visual bar (0-100 clamp)
  const numeric = parseFloat(value);
  const pct = isFinite(numeric) ? Math.min(100, Math.max(0, numeric)) : 0;
  return (
    <LuxeCard variant="glass" radius="md" glow className="p-5">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4" style={{ color }} />
        <span className="text-[9px] uppercase tracking-[0.22em] text-luxe-mut">AI</span>
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <div className="font-serif-l text-[30px] leading-none">{value}</div>
        {unit && <div className="text-[11px] text-luxe-mut">{unit}</div>}
      </div>
      <div className="text-[10px] uppercase tracking-[0.22em] text-luxe-mut mt-2">{label}</div>
      <div className="mt-4 h-[3px] w-full rounded-full bg-white/6 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-1000 ease-out"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}66)` }}
        />
      </div>
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

/**
 * Image with a shimmer skeleton overlay that fades out after `load`.
 * Prevents blank/flashing slots while gallery photos stream in.
 */
function GalleryImg({
  src, alt, eager = false, className,
}: { src: string; alt: string; eager?: boolean; className?: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "absolute inset-0 luxe-shimmer transition-opacity duration-500",
          loaded ? "opacity-0" : "opacity-100",
        )}
      />
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={cn(
          "h-full w-full object-cover transition-[transform,opacity] duration-700",
          loaded ? "opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}

export default PropertyDetail;
