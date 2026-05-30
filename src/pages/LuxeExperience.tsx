import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring, type Variants } from "framer-motion";
import {
  Search, Calendar, Users, Sparkles, ArrowUpRight, MapPin, Star,
  Bot, TrendingUp, LineChart, Compass, Wand2, ShieldCheck, Globe2,
  PlayCircle, ChevronRight, Heart, User2, Box, Home, Menu, X, Bell,
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import heroImg from "@/assets/luxe-hero-bali.jpg";
import brandLogoFallback from "@/assets/astra-logo-optimized.png";
import { useBrandingLogo } from "@/hooks/useBrandingLogo";
import villa1 from "@/assets/luxe-villa-1.jpg";
import villa2 from "@/assets/luxe-villa-2.jpg";
import villa3 from "@/assets/luxe-villa-3.jpg";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LuxeLayout } from "@/components/luxe";


/* Cinematic easing — Apple-like */
const EASE = [0.22, 1, 0.36, 1] as const;

/* Premium scroll reveal — calm: shorter rise, lighter blur, faster ease */
const revealVariants: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
};

function Reveal({
  children, delay = 0, y = 18, className, as = "div",
}: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "article" | "section" | "li" | "span" }) {
  const Tag: any = (motion as any)[as];
  return (
    <Tag
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </Tag>
  );
}

/* Atmospheric divider — soft gold horizon between sections */
function AtmosDivider({ tone = "gold" }: { tone?: "gold" | "emerald" | "cool" }) {
  const tint =
    tone === "emerald" ? "rgba(79,178,134,0.18)"
    : tone === "cool"  ? "rgba(124,231,255,0.14)"
    : "rgba(200,169,107,0.22)";
  return (
    <div aria-hidden className="relative h-32 md:h-44 -my-16 md:-my-20 pointer-events-none overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1/2"
           style={{ background: `linear-gradient(to bottom, transparent, ${tint} 70%, transparent)` }} />
      <div className="absolute inset-x-0 bottom-0 h-1/2"
           style={{ background: "linear-gradient(to top, #050505, transparent)" }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-px"
           style={{ background: "linear-gradient(90deg, transparent, rgba(200,169,107,0.45), transparent)" }} />
    </div>
  );
}

/* Animated count-up for metric values (handles "%", "$", "+", "/", non-numeric strings) */
function CountUp({ value, duration = 1.6 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const matchStr = useMemo(() => value.match(/-?\d+(\.\d+)?/)?.[0] ?? null, [value]);
  const hasDecimal = matchStr?.includes(".") ?? false;
  const [display, setDisplay] = useState(matchStr ? value.replace(matchStr, "0") : value);
  const doneRef = useRef(false);

  useEffect(() => {
    if (!inView || !matchStr || doneRef.current) {
      if (!matchStr) setDisplay(value);
      return;
    }
    const target = parseFloat(matchStr);
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = target * eased;
      const text = hasDecimal ? cur.toFixed(1) : Math.round(cur).toString();
      setDisplay(value.replace(matchStr, text));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // Snap to final exact value
        setDisplay(value);
        doneRef.current = true;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, matchStr, hasDecimal]);

  return <span ref={ref}>{display}</span>;
}

/* Cinematic 3D tilt card */
function TiltCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 140, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 140, damping: 18 });
  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   ASTRA VILLA — Luxe Experience (Property OS, Bali)
   Cinematic dark luxury landing. Self-contained scoped tokens
   so it doesn't fight the app's global theme.
   ============================================================ */

const CHIPS = [
  { label: "Beachfront", to: "/properties?tag=beachfront" },
  { label: "Rice Field View", to: "/properties?tag=rice-field" },
  { label: "Jungle Retreat", to: "/properties?tag=jungle" },
  { label: "Family Friendly", to: "/properties?tag=family" },
  { label: "Newly Added", to: "/properties?sort=newest" },
];
const SUGGESTIONS = [
  "Cliffside villa in Uluwatu with infinity pool…",
  "Jungle sanctuary near Ubud, 4 bedrooms…",
  "Beachfront retreat in Canggu for 6 guests…",
  "Architectural pavilion with private chef…",
];

type NavSubLink = { label: string; to: string; desc?: string };
type NavLink = { label: string; to: string; match?: string; mega?: NavSubLink[] };

const NAV_LINKS: NavLink[] = [
  {
    label: "Villas", to: "/properties", match: "/properties",
    mega: [
      { label: "Luxury Collection",   to: "/properties?collection=luxury",     desc: "Editor-curated icons" },
      { label: "Beachfront Villas",   to: "/properties?tag=beachfront",        desc: "Ocean cliffs & sand" },
      { label: "Jungle Sanctuaries",  to: "/properties?tag=jungle",            desc: "Ubud, Sayan, Tabanan" },
      { label: "Family Villas",       to: "/properties?tag=family",            desc: "4+ bedrooms, secure" },
      { label: "Investment Villas",   to: "/properties?intent=investment",     desc: "ROI-ranked picks" },
    ],
  },
  {
    label: "Investment", to: "/investment", match: "/investment",
    mega: [
      { label: "ROI Insights",        to: "/investment",                       desc: "Yield, occupancy, IRR" },
      { label: "Market Intelligence", to: "/market-intelligence",              desc: "Live Bali micro-market" },
      { label: "Investor Dashboard",  to: "/dashboard",                        desc: "Your portfolio at a glance" },
      { label: "Price Estimator",     to: "/ai-pricing",                       desc: "AI valuation & forecast" },
    ],
  },
  { label: "Virtual Tours", to: "/vr-tour",        match: "/vr-tour" },
  { label: "AI Concierge",  to: "/wealth-advisor", match: "/wealth-advisor" },
  { label: "Dashboard",     to: "/dashboard",      match: "/dashboard" },
  { label: "Contact",       to: "/contact",        match: "/contact" },
];

type FeaturedVilla = {
  id?: string;
  img: string;
  name: string;
  area: string;
  price: string;
  rating: number;
  tag: string;
  investmentScore?: number | null;
  demandScore?: number | null;
  roi?: number | null;
  yieldPct?: number | null;
};

const FEATURED_FALLBACK: FeaturedVilla[] = [
  { img: villa3, name: "Villa Anantara",  area: "Uluwatu · Beachfront",   price: "$2,850", rating: 4.98, tag: "Editor's Pick", investmentScore: 92, demandScore: 88, roi: 9.4, yieldPct: 7.8 },
  { img: villa1, name: "Cliff House No. 9", area: "Bingin · Ocean Cliff", price: "$3,420", rating: 4.96, tag: "New",           investmentScore: 89, demandScore: 94, roi: 10.2, yieldPct: 8.1 },
  { img: villa2, name: "Pavilion Ubud",   area: "Ubud · Jungle Retreat",  price: "$1,980", rating: 4.94, tag: "Concierge",     investmentScore: 86, demandScore: 81, roi: 8.7, yieldPct: 7.2 },
];

function formatPrice(n: number | null | undefined): string {
  if (!n || n <= 0) return "On request";
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function useFeaturedVillas(): { villas: FeaturedVilla[]; isLoading: boolean; isFallback: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ["luxe-featured-villas-v2"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id,title,location,city,area,price,price_idr,images,image_urls,cover_image,investment_score,demand_heat_score,roi_percentage,rental_yield_percentage,is_featured,featured")
        .eq("status", "active")
        .order("is_featured", { ascending: false, nullsFirst: false } as any)
        .order("investment_score", { ascending: false, nullsFirst: false } as any)
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    retry: 0,
  });

  if (isLoading) return { villas: [], isLoading: true, isFallback: false };
  if (!data || data.length === 0) return { villas: FEATURED_FALLBACK, isLoading: false, isFallback: true };

  const tags = ["Editor's Pick", "Trending", "Concierge", "Investor's Choice", "New", "Rare Find"];
  const fallbackImgs = [villa3, villa1, villa2];
  const villas = data.map((p: any, i: number): FeaturedVilla => {
    const img =
      p.cover_image ||
      (Array.isArray(p.image_urls) && p.image_urls[0]) ||
      (Array.isArray(p.images) && p.images[0]) ||
      fallbackImgs[i % 3];
    const priceNum = Number(p.price_idr ?? p.price ?? 0);
    const area = [p.area ?? p.location, p.city].filter(Boolean).join(" · ") || "Bali";
    return {
      id: p.id,
      img,
      name: p.title ?? "Untitled Villa",
      area,
      price: formatPrice(priceNum),
      rating: 4.94,
      tag: p.is_featured || p.featured ? "Editor's Pick" : tags[i % tags.length],
      investmentScore: p.investment_score != null ? Math.round(Number(p.investment_score)) : null,
      demandScore: p.demand_heat_score != null ? Math.round(Number(p.demand_heat_score)) : null,
      roi: p.roi_percentage != null ? Number(p.roi_percentage) : null,
      yieldPct: p.rental_yield_percentage != null ? Number(p.rental_yield_percentage) : null,
    };
  });
  return { villas, isLoading: false, isFallback: false };
}

/* Luxury shimmer skeleton for villa cards */
function VillaSkeleton() {
  return (
    <div className="rounded-3xl border border-luxe bg-luxe-surface overflow-hidden">
      <div className="aspect-[4/5] luxe-shimmer" />
      <div className="p-4 space-y-2">
        <div className="h-4 w-2/3 luxe-shimmer rounded" />
        <div className="h-3 w-1/2 luxe-shimmer rounded" />
      </div>
    </div>
  );
}

/* Compact AI score chip used inside villa cards */
function ScoreChip({ label, value, tone = "gold" }: { label: string; value: string; tone?: "gold" | "ember" | "emerald" }) {
  const color =
    tone === "ember"   ? "text-[#ffb27a] border-[#ffb27a]/30"
    : tone === "emerald" ? "text-[#7be0b3] border-[#7be0b3]/30"
    : "text-luxe-gold border-[color:var(--luxe-gold)]/35";
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] tracking-wider uppercase luxe-glass-card border", color)}>
      <span className="opacity-70">{label}</span>
      <span className="font-medium">{value}</span>
    </span>
  );
}

const AI_CARDS = [
  { icon: Wand2, k: "AI Match Accuracy", v: "98.4%", sub: "Personal taste model" },
  { icon: LineChart, k: "Market Pulse", v: "+12.7%", sub: "Bali YoY appreciation" },
  { icon: TrendingUp, k: "ROI Forecast", v: "9.6%", sub: "Avg net yield, 12mo" },
  { icon: Bot, k: "Concierge", v: "24/7", sub: "Multilingual, on-demand" },
];

const OS_FEATURES = [
  { icon: Sparkles, t: "AI Property Intelligence", d: "Live signals from every listing, transaction and inquiry — synthesized into clarity.", to: "/intelligence-os" },
  { icon: Box, t: "3D Digital Twin", d: "Walk every villa before you arrive. Photoreal, frame-perfect, instant.", to: "/vr-tour" },
  { icon: LineChart, t: "Investment Analytics", d: "Yield, occupancy, micro-market — modeled, ranked, explained.", to: "/investment" },
  { icon: TrendingUp, t: "Predictive Pricing", d: "Demand and seasonality forecasted nightly, not quarterly.", to: "/ai-pricing" },
  { icon: Compass, t: "Immersive Tours", d: "Cinematic walkthroughs with narrated context and lighting moods.", to: "/vr-tour" },
  { icon: Globe2, t: "Global Investor Layer", d: "Curated cross-border deals with verified provenance and escrow.", to: "/global-deal-flow" },
];

const COLLECTIONS = [
  { img: villa3, t: "The Coastal Series",       c: "11 villas", to: "/properties?collection=coastal" },
  { img: villa2, t: "Jungle Sanctuaries",       c: "08 villas", to: "/properties?collection=jungle" },
  { img: villa1, t: "Cliffside Architecture",   c: "06 villas", to: "/properties?collection=cliffside" },
];


/* Adaptive device tier — gates expensive effects on weaker devices */
function useDeviceTier(): "low" | "mid" | "high" {
  const [tier, setTier] = useState<"low" | "mid" | "high">("high");
  useEffect(() => {
    const n: any = navigator;
    const mem = n.deviceMemory ?? 8;
    const cores = n.hardwareConcurrency ?? 8;
    const saveData = n.connection?.saveData === true;
    const slowNet = /(^|-)2g$/.test(n.connection?.effectiveType ?? "");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || saveData || slowNet || mem <= 2 || cores <= 2) setTier("low");
    else if (mem <= 4 || cores <= 4) setTier("mid");
    else setTier("high");
  }, []);
  return tier;
}

export default function LuxeExperience() {
  const { isMobile } = useIsMobile();
  const tier = useDeviceTier();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { villas: FEATURED, isLoading: featuredLoading, isFallback: featuredFallback } = useFeaturedVillas();
  const profileHref = user ? "/profile" : "/auth";
  const { logoUrl: headerLogo } = useBrandingLogo("headerLogo", brandLogoFallback);
  const { logoUrl: footerLogo } = useBrandingLogo("footerLogo", brandLogoFallback);
  const heroRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  // Parallax disabled on mobile to free the scroll thread (eliminates touch stutter)
  const heroY = useTransform(scrollY, [0, 800], [0, isMobile ? 0 : 90]);
  const heroScale = useTransform(scrollY, [0, 800], [1.04, isMobile ? 1.04 : 1.09]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, isMobile ? 1 : 0.5]);

  const [suggestIdx, setSuggestIdx] = useState(0);
  const [searchWhere, setSearchWhere] = useState("Bali, Indonesia");
  const [searchWhen, setSearchWhen] = useState("");
  const [searchGuests, setSearchGuests] = useState(2);

  const handleHeroSearch = (e?: React.FormEvent) => {
    e?.preventDefault();

    // [debug] confirm submit handler fires + show captured values
    // TODO: remove after QA
    console.log("[hero-search] submit fired", {
      where: searchWhere,
      when: searchWhen,
      guests: searchGuests,
    });

    // Guests: must be a whole number >= 1
    const guestsNum = Number(searchGuests);
    if (!Number.isFinite(guestsNum) || guestsNum < 1) {
      toast.error("Please add at least 1 guest.");
      return;
    }

    // When: optional, but if provided must be a valid, non-past date
    if (searchWhen) {
      const d = new Date(searchWhen);
      if (Number.isNaN(d.getTime())) {
        toast.error("Please pick a valid date.");
        return;
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d < today) {
        toast.error("Date cannot be in the past.");
        return;
      }
    }

    const params = new URLSearchParams();
    if (searchWhere.trim()) {
      params.set("q", searchWhere.trim());
      params.set("location", searchWhere.trim());
    }
    if (searchWhen) params.set("when", searchWhen);
    params.set("guests", String(guestsNum));
    const url = `/search?${params.toString()}`;

    // [debug] confirm generated URL — remove after QA
    console.log("[hero-search] navigating to", url);
    toast.success("Searching villas…", { description: url });

    navigate(url);
  };

  useEffect(() => {
    const id = window.setInterval(() => setSuggestIdx(i => (i + 1) % SUGGESTIONS.length), 3200);
    return () => window.clearInterval(id);
  }, []);



  // Preload the hero LCP image at high priority
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload"; link.as = "image"; link.href = heroImg;
    (link as any).fetchPriority = "high";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  // Mouse spotlight — desktop + high-tier only, mutates CSS vars (zero React rerenders)
  useEffect(() => {
    if (isMobile || tier !== "high") return;
    const el = heroRef.current;
    const spot = spotRef.current;
    if (!el || !spot) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        spot.style.setProperty("--sx", `${x}%`);
        spot.style.setProperty("--sy", `${y}%`);
      });
    };
    el.addEventListener("mousemove", onMove, { passive: true });
    return () => { el.removeEventListener("mousemove", onMove); cancelAnimationFrame(raf); };
  }, [isMobile, tier]);

  return (
    <LuxeLayout>
      <SEOHead
        title="ASTRA Villa · The AI Property OS for Bali"
        description="Discover extraordinary villas in Bali with AI-powered intelligence, immersive 3D tours, and a private concierge built for the new luxury."
      />




      {/* ============== HERO ============== */}
      <section ref={heroRef} className="relative min-h-[100svh] overflow-hidden luxe-grain">
        <motion.div
          aria-hidden
          style={{ y: heroY, scale: heroScale, opacity: heroOpacity }}
          className="absolute inset-0 will-change-transform pointer-events-none"
        >
          <img
            src={heroImg}
            alt="Cinematic Bali luxury villa with infinity pool at golden hour"
            className="w-full h-full object-cover luxe-kenburns"
            width={1920} height={1280}
            loading="eager"
            decoding="async"
          />
        </motion.div>

        {/* Ambient bloom layer — single soft glow on high-tier only */}
        {tier === "high" && !isMobile && (
          <div aria-hidden className="absolute inset-0 pointer-events-none luxe-bloom-a"
            style={{ background: "radial-gradient(40% 30% at 78% 22%, rgba(231,206,150,0.22), transparent 70%)" }} />
        )}

        {/* Mouse-tracked cinematic spotlight — desktop high-tier only, mutated via CSS vars */}
        {!isMobile && tier === "high" && (
          <div
            ref={spotRef}
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              ['--sx' as any]: '50%',
              ['--sy' as any]: '40%',
              background: 'radial-gradient(340px 260px at var(--sx) var(--sy), rgba(255,255,255,0.04), transparent 70%)',
            }}
          />
        )}

        {/* Cinematic overlays */}
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "var(--luxe-hero-vignette)" }} />
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "var(--luxe-hero-floor)" }} />
        <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: "var(--luxe-hero-depth)" }} />

        {/* Floating gold particles — high-tier desktop only, minimal count */}
        {tier === "high" && !isMobile && (
          <div className="luxe-particles" aria-hidden="true">
            {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} style={{
              left: `${(i * 17.3) % 100}%`,
              animationDelay: `${(i * 1.1) % 9}s`,
              animationDuration: `${10 + (i % 4)}s`,
              opacity: 0,
            }} />
          ))}
          </div>
        )}


        <div className="relative z-10 mx-auto max-w-[1440px] px-5 md:px-10 pt-28 sm:pt-32 md:pt-44 pb-24 md:pb-20 mobile-safe-bottom">
          <motion.div
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
            className="max-w-3xl"
          >
            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}
              className="flex items-center gap-3 mb-6"
            >
              <span className="luxe-eyebrow">Bali · Est. MMXXVI</span>
              <span className="w-10 h-px bg-[color:var(--luxe-gold)]/60" />
              <span className="text-[11px] text-luxe-mut font-mono-l">AI Property OS · v2.0</span>
            </motion.div>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] } } }}
              className="font-serif-l text-[40px] xs:text-[46px] sm:text-[64px] md:text-[96px] leading-[1.02] sm:leading-[0.98] md:leading-[0.95] tracking-tight text-balance"
              style={{ textShadow: "0 2px 40px rgba(0,0,0,0.55)" }}
            >
              Discover <em className="not-italic luxe-gold-shimmer">Extraordinary</em>
              <br /> Villas in Bali.
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } } }}
              className="mt-6 md:mt-7 max-w-xl text-[15px] md:text-[18px] leading-relaxed text-luxe-fg/80 text-balance"
            >
              AI-powered luxury villa experiences with immersive property intelligence
              and premium concierge services.
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } } }}
              className="mt-9 md:mt-10 flex flex-wrap items-center gap-3"
            >
              <Link to="/properties" className="luxe-gold-btn luxe-tap rounded-full px-6 py-4 md:py-3.5 text-[13px] font-medium tracking-wide inline-flex items-center gap-2 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(200,169,107,0.6)] min-h-[48px]">
                Begin Your Stay <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link to="/vr-tour" className="luxe-tap rounded-full px-5 py-4 md:py-3.5 text-[13px] font-medium tracking-wide bg-luxe-glass border border-luxe hover:border-[color:var(--luxe-gold)] transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center gap-2 min-h-[48px]">
                <PlayCircle className="w-4 h-4 text-luxe-gold" /> Watch the Film
              </Link>

            </motion.div>
          </motion.div>

          {/* Floating AI signal panel */}
          <motion.aside
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="hidden md:block absolute right-10 top-44 w-[280px] luxe-glass-card rounded-2xl p-5 luxe-float"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="luxe-eyebrow">Live Signal</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--luxe-emerald)] shadow-[0_0_12px_rgba(79,178,134,0.8)]" />
            </div>
            <div className="font-serif-l text-3xl mb-1">+12.7%</div>
            <div className="text-[11px] text-luxe-mut mb-4">Bali villa YoY appreciation</div>
            <div className="h-px bg-luxe-line mb-4" />
            <div className="space-y-2.5 text-[12px]">
              {[
                ["Uluwatu", "98% occupancy"],
                ["Canggu",  "Demand · High"],
                ["Ubud",    "+18% inquiries"],
              ].map(([a, b]) => (
                <div key={a} className="flex justify-between"><span className="text-luxe-fg/80">{a}</span><span className="text-luxe-gold">{b}</span></div>
              ))}
            </div>
          </motion.aside>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 md:mt-24"
          >
            <div className="relative">
              <div className="absolute -inset-px rounded-2xl md:rounded-full bg-gradient-to-r from-[color:var(--luxe-gold)]/25 via-transparent to-[color:var(--luxe-emerald)]/15 blur-md opacity-60 pointer-events-none" />
              <form
                onSubmit={handleHeroSearch}
                className="relative luxe-glass-card rounded-2xl md:rounded-full p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-0 luxe-shadow-float"
              >
                <SearchInput
                  icon={MapPin}
                  label="Where"
                  value={searchWhere}
                  onChange={setSearchWhere}
                  onSubmit={handleHeroSearch}
                  placeholder="Bali, Indonesia"
                  type="text"
                />
                <div className="hidden md:block h-10 w-px bg-luxe-line" />
                <SearchInput
                  icon={Calendar}
                  label="When"
                  value={searchWhen}
                  onChange={setSearchWhen}
                  onSubmit={handleHeroSearch}
                  placeholder="Add dates"
                  type="date"
                />
                <div className="hidden md:block h-10 w-px bg-luxe-line" />
                <SearchInput
                  icon={Users}
                  label="Guests"
                  value={String(searchGuests)}
                  onChange={(v) => setSearchGuests(Math.max(1, Number(v) || 1))}
                  onSubmit={handleHeroSearch}
                  placeholder="2"
                  type="number"
                  min={1}
                />
                <button
                  type="submit"
                  className="luxe-gold-btn rounded-xl md:rounded-full px-6 py-3.5 text-[13px] font-medium inline-flex items-center justify-center gap-2 md:ml-2 transition-transform duration-300 hover:-translate-y-0.5 min-h-[48px]"
                >
                  <Search className="w-4 h-4" /> Search Villas
                </button>
              </form>

            </div>

            <div className="mt-4 flex items-center gap-2.5 text-[12px] text-luxe-fg/65 min-h-[20px]" aria-live="polite">
              <Sparkles className="w-3.5 h-3.5 text-luxe-gold shrink-0" />
              <span className="font-mono-l text-[11px] text-luxe-mut">ASTRA suggests</span>
              <motion.span
                key={suggestIdx}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="truncate"
              >
                {SUGGESTIONS[suggestIdx]}
              </motion.span>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {CHIPS.map((c, i) => (
                <motion.span
                  key={c.label}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-block"
                >
                  <Link to={c.to} className="text-[12px] px-3.5 py-1.5 rounded-full bg-luxe-glass border border-luxe hover:border-[color:var(--luxe-gold)] hover:text-luxe-gold transition-all duration-300 hover:-translate-y-0.5 inline-block">
                    {c.label}
                  </Link>
                </motion.span>
              ))}

            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 hidden md:flex flex-col items-center gap-2 text-luxe-mut">
          <span className="luxe-eyebrow text-[10px]">Scroll</span>
          <span className="luxe-cue inline-block w-px h-8 bg-gradient-to-b from-[color:var(--luxe-gold)] to-transparent" />
        </div>
      </section>

      <AtmosDivider tone="gold" />

      {/* ============== AI FEATURES STRIP ============== */}
      <section className="relative py-24 md:py-32 luxe-cv">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <Reveal>
            <SectionHead eyebrow="The Intelligence Layer" title={<>A villa platform that <em className="text-luxe-gold not-italic">thinks</em>.</>} />
          </Reveal>

          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 [perspective:1200px]">
            {AI_CARDS.map((c, i) => (
              <Reveal key={c.k} delay={i * 0.08}>
                <TiltCard className="luxe-glass-card luxe-card-glow rounded-2xl p-6 group hover:border-[color:var(--luxe-gold)] transition-all duration-500 will-change-transform">
                  <div className="flex items-center justify-between mb-8">
                    <c.icon className="w-5 h-5 text-luxe-gold transition-transform duration-500 group-hover:-translate-y-0.5" />
                    <span className="relative flex">
                      <span className="absolute inset-0 rounded-full bg-[color:var(--luxe-emerald)] luxe-pulse" />
                      <span className="relative w-1.5 h-1.5 rounded-full bg-[color:var(--luxe-emerald)]" />
                    </span>
                  </div>
                  <div className="font-serif-l text-4xl mb-2"><CountUp value={c.v} /></div>
                  <div className="text-[13px] text-luxe-fg/85">{c.k}</div>
                  <div className="text-[11px] text-luxe-mut mt-1">{c.sub}</div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <AtmosDivider tone="emerald" />

      {/* ============== FEATURED VILLAS ============== */}
      <section className="relative py-24 md:py-32 luxe-cv">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="flex items-end justify-between gap-6 mb-14">
            <Reveal>
              <SectionHead
                eyebrow={user ? "Curated for you" : "The Collection"}
                title={user
                  ? <>Villas matched to your <em className="not-italic text-luxe-gold">taste signal</em>.</>
                  : <>Hand-picked villas, <em className="not-italic text-luxe-gold">cinematically</em> rendered.</>}
              />
            </Reveal>
            <Reveal delay={0.15}>
              <Link to="/properties" className="hidden md:inline-flex items-center gap-1.5 text-[12px] text-luxe-fg/70 hover:text-luxe-gold transition-colors">
                View all villas <ChevronRight className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>

          {featuredFallback && (
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full luxe-glass-card text-[10px] tracking-wider uppercase text-luxe-mut">
                <span className="w-1.5 h-1.5 rounded-full bg-luxe-gold animate-pulse" />
                Showing concierge preview — live inventory syncing
              </div>
            </Reveal>
          )}


          {/* Mobile: horizontal snap rail. Desktop: 3-col tilt grid */}
          <div className="luxe-snap-x -mx-5 px-5 md:mx-0 md:px-0 flex md:grid md:grid-cols-3 gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none [perspective:1400px] pb-2 md:pb-0">
            {featuredLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={`sk-${i}`} className="snap-center shrink-0 w-[82%] sm:w-[60%] md:w-auto">
                <VillaSkeleton />
              </div>
            ))}
            {!featuredLoading && FEATURED.map((v, i) => {
              const detailHref = v.id ? `/properties/${v.id}` : "/properties";
              return (
              <Reveal key={v.id ?? v.name} delay={i * 0.12} as="article"
                className="snap-center shrink-0 w-[82%] sm:w-[60%] md:w-auto first:pl-0 last:pr-0">
                <TiltCard className="group relative overflow-hidden rounded-3xl border border-luxe bg-luxe-surface luxe-card-glow shadow-[var(--luxe-shadow-card)] hover:shadow-[var(--luxe-shadow-float)] transition-shadow duration-700 will-change-transform luxe-tap">
                  <Link to={detailHref} aria-label={`View ${v.name}`} className="absolute inset-0 z-10" />
                  <div className="aspect-[4/5] overflow-hidden">
                    <img src={v.img} alt={v.name} loading="lazy" width={1280} height={1600}
                         className="w-full h-full object-cover transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.08]" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.75)] via-[rgba(10,10,10,0.25)] to-transparent" />
                  <div aria-hidden className="pointer-events-none absolute -inset-x-1/4 -top-1/2 h-full rotate-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                       style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }} />


                  <div className="absolute top-4 left-4 right-16 flex flex-wrap items-center gap-1.5 z-20">
                    <span className="px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase luxe-glass-card text-luxe-gold">{v.tag}</span>
                    {v.investmentScore != null && <ScoreChip label="AI" value={`${v.investmentScore}`} tone="gold" />}
                    {v.demandScore != null && v.demandScore >= 70 && <ScoreChip label="Heat" value={`${v.demandScore}`} tone="ember" />}
                    {v.roi != null && v.roi > 0 && <ScoreChip label="ROI" value={`${v.roi.toFixed(1)}%`} tone="emerald" />}
                  </div>

                  <div className="absolute top-4 right-4 z-20">
                    <Link to="/favorites" onClick={(e) => e.stopPropagation()} className="w-11 h-11 md:w-9 md:h-9 grid place-items-center rounded-full luxe-glass-card hover:text-luxe-gold hover:scale-110 transition-all duration-300" aria-label="Save">
                      <Heart className="w-4 h-4" />
                    </Link>
                  </div>

                  <div className="absolute inset-x-4 bottom-4 luxe-glass-card rounded-2xl p-4 translate-y-1 group-hover:translate-y-0 transition-transform duration-700 z-20">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 className="font-serif-l text-xl leading-tight">{v.name}</h3>
                        <div className="text-[11px] text-luxe-mut mt-0.5 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" /> {v.area}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-serif-l text-lg text-luxe-gold">{v.price}</div>
                        <div className="text-[10px] text-luxe-mut">/ night</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-luxe">
                      <div className="flex items-center gap-1.5 text-[12px]">
                        <Star className="w-3.5 h-3.5 fill-[color:var(--luxe-gold)] text-[color:var(--luxe-gold)]" />
                        <span>{v.rating}</span>
                        <span className="text-luxe-mut">· 124 stays</span>
                      </div>
                      <Link to="/vr-tour" onClick={(e) => e.stopPropagation()} className="text-[11px] inline-flex items-center gap-1 text-luxe-gold hover:gap-2 transition-all relative">
                        Explore in 3D <Box className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              </Reveal>
              );
            })}

          </div>
        </div>
      </section>

      <AtmosDivider tone="gold" />



      {/* ============== PROPERTY OS — Sage Glass Editorial Bento ============== */}
      <section className="relative py-28 md:py-40 luxe-cv">
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{ background: "radial-gradient(60% 50% at 50% 30%, rgba(125,155,118,0.10), transparent 70%)" }}
        />
        <div className="mx-auto max-w-[1280px] px-5 md:px-10 relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 md:mb-20">
            <div className="max-w-2xl">
              <span className="luxe-eyebrow">The Property Operating System</span>
              <h2 className="font-display-l text-[36px] md:text-[56px] leading-[1.02] mt-5 tracking-tight">
                One quiet interface for <span className="text-luxe-sage">every</span> villa decision.
              </h2>
              <p className="mt-6 text-[15px] md:text-[17px] leading-relaxed text-luxe-fg/65 max-w-xl font-light">
                Unified intelligence layer managing the entire lifecycle of luxury villa investment and experience — through spatial data and predictive modeling.
              </p>
            </div>
            <div className="text-luxe-gold flex items-center gap-3 shrink-0">
              <div className="h-px w-24 bg-[color:var(--luxe-gold)]/30" />
              <span className="text-[11px] font-bold tracking-[0.22em] uppercase">V.2.0 Active</span>
            </div>
          </div>

          {/* Bento Grid — 6 OS tiles */}
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 md:grid-rows-2 gap-5 md:gap-6 md:auto-rows-fr">
            {OS_FEATURES.map((f, i) => {
              const spans = [
                "md:col-span-3 md:row-span-2",            // 0 AI Intelligence (feature)
                "md:col-span-3 lg:col-span-1",            // 1 3D Twin
                "md:col-span-3 lg:col-span-2",            // 2 Investment Analytics
                "md:col-span-2",                          // 3 Predictive Pricing (sage solid)
                "md:col-span-1",                          // 4 Immersive Tours
                "md:col-span-2 lg:col-span-3",            // 5 Global Investor (dashed)
              ];
              const isFeature = i === 0;
              const isPricing = i === 3;
              const isInvestor = i === 5;
              return (
                <motion.div
                  key={f.t}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: i * 0.06, ease: EASE }}
                  className={cn(
                    "relative overflow-hidden rounded-[28px] md:rounded-[32px] p-7 md:p-9 group flex flex-col justify-between",
                    "transition-all duration-500",
                    spans[i],
                    isFeature && "bg-luxe-sage-soft border border-[color:var(--luxe-sage)]/25 min-h-[360px] md:min-h-0",
                    isPricing && "bg-[color:var(--luxe-sage)] text-[color:var(--luxe-bg)] border border-[color:var(--luxe-sage)]",
                    isInvestor && "bg-luxe-surface/40 border-2 border-dashed border-[color:var(--luxe-sage)]/40 hover:border-[color:var(--luxe-sage)]",
                    !isFeature && !isPricing && !isInvestor && "bg-luxe-surface border border-luxe luxe-shadow-card hover:-translate-y-0.5",
                  )}
                >
                  <div className="relative z-10">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-colors",
                        isFeature && "bg-luxe-surface shadow-sm",
                        isPricing && "bg-white/15",
                        isInvestor && "bg-luxe-surface",
                        !isFeature && !isPricing && !isInvestor && "bg-luxe-sage-soft",
                      )}
                    >
                      <f.icon
                        className={cn(
                          "w-5 h-5",
                          isPricing ? "text-[color:var(--luxe-bg)]" : "text-luxe-sage"
                        )}
                      />
                    </div>
                    <h3
                      className={cn(
                        "font-display-l mb-3 leading-tight",
                        isFeature ? "text-[26px] md:text-[34px]" : "text-[18px] md:text-[20px]"
                      )}
                    >
                      {f.t}
                    </h3>
                    <p
                      className={cn(
                        "leading-relaxed font-light",
                        isFeature ? "text-[15px] md:text-[16px] max-w-md text-luxe-fg/70" : "text-[12.5px] text-luxe-fg/65",
                        isPricing && "!text-[color:var(--luxe-bg)]/80"
                      )}
                    >
                      {f.d}
                    </p>
                  </div>

                  <div className="relative z-10 mt-6 flex items-center justify-between gap-3">
                    <Link
                      to={f.to}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[11px] tracking-wide uppercase font-semibold transition-colors",
                        isPricing ? "text-[color:var(--luxe-bg)]/90 hover:text-[color:var(--luxe-bg)]" : "text-luxe-mut group-hover:text-luxe-gold"
                      )}
                    >
                      Learn more <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                    {isInvestor && (
                      <span className="w-11 h-11 rounded-full bg-luxe-surface border border-luxe grid place-items-center group-hover:bg-[color:var(--luxe-sage)] group-hover:text-[color:var(--luxe-bg)] group-hover:border-[color:var(--luxe-sage)] transition-colors">
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {/* Decorative brass hairline on hover for feature tile */}
                  {isFeature && (
                    <div
                      aria-hidden
                      className="absolute -bottom-px left-8 right-8 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                      style={{ background: "linear-gradient(90deg, transparent, var(--luxe-gold), transparent)" }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>


      {/* ============== COLLECTIONS / DESTINATION ============== */}
      <section className="relative py-24 md:py-32 luxe-cv">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <SectionHead eyebrow="Curated Worlds" title={<>Villa <em className="not-italic text-luxe-gold">collections</em>, shaped by intent.</>} />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
            {COLLECTIONS.map((c, i) => (
              <motion.div key={c.t}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}
                className="group relative aspect-[3/4] rounded-3xl overflow-hidden border border-luxe block">
                <Link to={c.to} aria-label={c.t} className="absolute inset-0 z-10" />

                <img src={c.img} alt={c.t} loading="lazy" width={1280} height={1600}
                     className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,10,0.78)] via-[rgba(10,10,10,0.28)] to-transparent" />
                <div className="absolute inset-x-6 bottom-6">
                  <div className="luxe-eyebrow mb-2">{c.c}</div>
                  <h3 className="font-serif-l text-3xl">{c.t}</h3>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-luxe-gold opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all">
                    Enter collection <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AtmosDivider tone="cool" />

      {/* ============== CONCIERGE / INVESTOR DASHBOARD PREVIEW ============== */}
      <section className="relative py-28 md:py-40 luxe-cv">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Reveal>
            <div>
              <span className="luxe-eyebrow">Investor Layer</span>
              <h2 className="font-serif-l text-[36px] md:text-[56px] leading-[1.02] mt-5 tracking-tight">
                Your private <em className="not-italic text-luxe-gold">villa portfolio</em>, always lit.
              </h2>
              <p className="mt-6 text-[15px] leading-relaxed text-luxe-fg/70 max-w-lg">
                Real-time occupancy, yield, and demand. Predictive pricing tuned nightly.
                A concierge that speaks five languages and never sleeps.
              </p>
              <div className="mt-10 grid grid-cols-2 gap-4 max-w-md">
                {[
                  ["98.4%", "AI match accuracy"],
                  ["9.6%", "Avg net yield"],
                  ["24/7", "Concierge desk"],
                  ["142", "Verified villas"],
                ].map(([v, k], i) => (
                  <Reveal key={k} delay={0.1 + i * 0.08}>
                    <div className="luxe-glass-card luxe-card-glow rounded-xl p-4 hover:-translate-y-0.5 transition-transform duration-500">
                      <div className="font-serif-l text-2xl text-luxe-gold"><CountUp value={v} /></div>
                      <div className="text-[11px] text-luxe-mut mt-1">{k}</div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <Link to="/investment" className="luxe-gold-btn mt-10 rounded-full px-6 py-3.5 text-[13px] font-medium inline-flex items-center gap-2 transition-transform duration-300 hover:-translate-y-0.5">
                Open the Investor OS <ArrowUpRight className="w-4 h-4" />
              </Link>

            </div>
          </Reveal>

          {/* Mock dashboard panel */}
          <Reveal delay={0.15}>
            <div className="relative [perspective:1400px]">
              <TiltCard className="luxe-glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-[var(--luxe-shadow-float)] will-change-transform">
                <div aria-hidden className="absolute -top-32 -right-32 w-80 h-80 rounded-full luxe-bloom-a pointer-events-none"
                     style={{ background: "radial-gradient(circle, rgba(200,169,107,0.28), transparent 70%)" }} />
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="relative flex">
                      <span className="absolute inset-0 rounded-full bg-[color:var(--luxe-emerald)] luxe-pulse" />
                      <span className="relative w-2 h-2 rounded-full bg-[color:var(--luxe-emerald)] shadow-[0_0_10px_rgba(79,178,134,0.8)]" />
                    </span>
                    <span className="text-[11px] font-mono-l text-luxe-mut">PORTFOLIO · LIVE</span>
                  </div>
                  <span className="text-[11px] text-luxe-mut">Bali · IDR</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    ["Net Yield", "9.6%", "var(--luxe-emerald)"],
                    ["Occupancy", "92%", "var(--luxe-gold)"],
                    ["ADR", "$2,310", "var(--luxe-cyan)"],
                  ].map(([k, v, color]) => (
                    <div key={k} className="rounded-xl bg-luxe-surface border border-luxe p-4 hover:border-[color:var(--luxe-gold)] transition-colors duration-500">
                      <div className="text-[10px] text-luxe-mut uppercase tracking-wider">{k}</div>
                      <div className="font-serif-l text-2xl mt-2" style={{ color: color as string }}><CountUp value={v} /></div>
                    </div>
                  ))}
                </div>

                {/* Animated chart */}
                <div className="rounded-xl bg-luxe-surface border border-luxe p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] text-luxe-mut uppercase tracking-wider">12-mo Forecast</span>
                    <span className="text-[11px] text-luxe-gold"><CountUp value="+12.7%" /></span>
                  </div>
                  <svg viewBox="0 0 320 80" className="w-full h-20">
                    <defs>
                      <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#C8A96B" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#C8A96B" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <motion.path
                      d="M0 60 L30 50 L60 55 L90 40 L120 45 L150 32 L180 38 L210 24 L240 30 L270 18 L300 22 L320 10 L320 80 L0 80 Z"
                      fill="url(#g)"
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                      viewport={{ once: true }} transition={{ duration: 1.4, delay: 0.6 }}
                    />
                    <motion.path
                      d="M0 60 L30 50 L60 55 L90 40 L120 45 L150 32 L180 38 L210 24 L240 30 L270 18 L300 22 L320 10"
                      fill="none" stroke="#C8A96B" strokeWidth="1.5"
                      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }}
                      viewport={{ once: true }} transition={{ duration: 2, ease: EASE }}
                    />
                  </svg>
                </div>

                <div className="mt-6 flex items-center justify-between text-[11px] text-luxe-mut">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[color:var(--luxe-emerald)] luxe-pulse" />
                    Updated 2s ago
                  </span>
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-[color:var(--luxe-emerald)]" /> Encrypted</span>
                </div>
              </TiltCard>
            </div>
          </Reveal>
        </div>
      </section>

      <AtmosDivider tone="gold" />



      {/* ============== TESTIMONIAL ============== */}
      <section className="relative py-28 md:py-40 luxe-cv">
        <div className="mx-auto max-w-4xl px-5 md:px-10 text-center">
          <span className="luxe-eyebrow">Whispered Praise</span>
          <blockquote className="font-serif-l text-[28px] md:text-[44px] leading-[1.15] mt-8 tracking-tight">
            “The closest thing to a private architect, a market analyst,
            and a Bali insider — <em className="text-luxe-gold not-italic">in one quiet room.</em>”
          </blockquote>
          <div className="mt-10 flex items-center justify-center gap-3 text-[12px] text-luxe-mut">
            <div className="w-8 h-8 rounded-full bg-luxe-glass border border-luxe" />
            <span>Amira Lestari · Family Office, Singapore</span>
          </div>
        </div>
      </section>

      {/* ============== CTA ============== */}
      <section className="relative py-28 md:py-36 luxe-cv">
        <div className="mx-auto max-w-[1240px] px-5 md:px-10">
          <div className="relative overflow-hidden rounded-[32px] border border-luxe luxe-grain"
               style={{ background: "var(--luxe-cta-bg)" }}>
            <div aria-hidden className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full pointer-events-none"
                 style={{ background: "radial-gradient(circle, rgba(200,169,107,0.22), transparent 70%)" }} />
            <div className="relative p-10 md:p-20 grid md:grid-cols-[1.4fr_1fr] gap-10 items-center">
              <div>
                <span className="luxe-eyebrow">Begin</span>
                <h2 className="font-serif-l text-[36px] md:text-[60px] leading-[1.02] mt-5 tracking-tight">
                  Your villa story <em className="not-italic text-luxe-gold">starts</em> with one search.
                </h2>
                <p className="mt-6 text-[14px] md:text-[16px] text-luxe-fg/70 max-w-xl">
                  Step inside the AI Property OS for Bali — built for those who choose by intuition,
                  guided by intelligence.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link to="/properties" className="luxe-gold-btn rounded-full px-6 py-4 text-[13px] font-medium inline-flex items-center justify-center gap-2">
                  Find My Villa <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link to="/wealth-advisor" className="rounded-full px-6 py-4 text-[13px] font-medium bg-luxe-glass border border-luxe hover:border-[color:var(--luxe-gold)] transition-colors inline-flex items-center justify-center gap-2">
                  <Bot className="w-4 h-4 text-luxe-gold" /> Speak to AI Concierge
                </Link>

              </div>
            </div>
          </div>
        </div>
      </section>

    </LuxeLayout>
  );
}




function SectionHead({ eyebrow, title }: { eyebrow: string; title: React.ReactNode }) {
  return (
    <div className="max-w-2xl">
      <span className="luxe-eyebrow">{eyebrow}</span>
      <h2 className="font-serif-l text-[36px] md:text-[56px] leading-[1.02] mt-5 tracking-tight">{title}</h2>
    </div>
  );
}

function SearchField({ icon: Icon, label, value, to }: { icon: any; label: string; value: string; to: string }) {
  return (
    <Link to={to} className="flex-1 flex items-center gap-3 px-5 py-3 rounded-xl md:rounded-full hover:bg-white/5 transition-colors text-left">
      <Icon className="w-4 h-4 text-luxe-gold shrink-0" />
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-[0.2em] text-luxe-mut">{label}</div>
        <div className="text-[13px] truncate">{value}</div>
      </div>
    </Link>
  );
}

function SearchInput({
  icon: Icon, label, value, onChange, onSubmit, placeholder, type = "text", min,
}: {
  icon: any;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  type?: "text" | "date" | "number";
  min?: number;
}) {
  return (
    <label className="flex-1 flex items-center gap-3 px-5 py-2.5 rounded-xl md:rounded-full hover:bg-white/5 transition-colors text-left cursor-text">
      <Icon className="w-4 h-4 text-luxe-gold shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-[0.2em] text-luxe-mut">{label}</div>
        <input
          type={type}
          value={value}
          min={min}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit?.();
            }
          }}
          className="w-full bg-transparent border-0 outline-none text-[13px] text-luxe-fg placeholder:text-luxe-mut/70 p-0 focus:ring-0"
        />
      </div>
    </label>
  );
}


