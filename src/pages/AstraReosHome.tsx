import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Bell, Globe, Heart, Sparkles, ChevronDown, ChevronRight,
  LayoutDashboard, Building2, TrendingUp, Banknote, Scale, Wrench,
  Store, Cpu, MoreHorizontal, Eye, BookmarkPlus, Wallet, MessageSquare,
  ArrowLeftRight, Calendar, FileText, LifeBuoy, Crown, ArrowUpRight,
  MapPin, BedDouble, Bath, Maximize, Shield, BarChart3, Loader2, X,
  Sliders, Plus, Minus, CheckCircle2, Sun, Moon, Menu, LogOut, User,
} from "lucide-react";
import {
  LineChart, Line, ResponsiveContainer,
} from "recharts";
import heroImg from "@/assets/reos-hero.jpg";
import { useReosMarket, formatIDR } from "@/hooks/useReosMarket";
import { useReosAiSearch } from "@/hooks/useReosAiSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/components/ThemeProvider";
import { ReosAuthModal } from "@/components/auth/ReosAuthModal";
import { useBrandingLogo } from "@/hooks/useBrandingLogo";
import { reosTokens } from "@/components/reos/ReosShell";


/* ============================================================
   ASTRA Villa — REOS Landing
   Matches the "Bloomberg Terminal of Real Estate" reference:
   Black / Gold luxury palette, dashboard-style composition.
   ============================================================ */

/* Home uses the shared REOS palette (single source of truth in ReosShell). */
const tokens = reosTokens;

/* ---------- Top tabs (under header) ---------- */
const topTabs = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/", active: true },
  { icon: Building2, label: "Properties", to: "/properties" },
  { icon: TrendingUp, label: "Investment", to: "/investment" },
  { icon: Banknote, label: "Finance", to: "/wallet" },
  { icon: Scale, label: "Legal", to: "/legal-services" },
  { icon: Wrench, label: "Management", to: "/agent-dashboard" },
  { icon: Store, label: "Vendors", to: "/services" },
  { icon: Cpu, label: "AI Center", to: "/ai-search" },
  { icon: MoreHorizontal, label: "More", to: "/search" },
];

/* ---------- Sidebar ---------- */
const sideNav = [
  { icon: Eye, label: "Overview", to: "/", active: true },
  { icon: BarChart3, label: "Market Intelligence", to: "/market-heatmap" },
  { icon: BookmarkPlus, label: "Watchlist", to: "/favorites" },
  { icon: Wallet, label: "My Portfolio", to: "/investment-performance" },
  { icon: MessageSquare, label: "Messages", to: "/messages", badge: 12 },
  { icon: ArrowLeftRight, label: "Transactions", to: "/wallet" },
  { icon: Calendar, label: "Calendar", to: "/profile" },
  { icon: FileText, label: "Documents", to: "/documents" },
  { icon: LifeBuoy, label: "Support Center", to: "/support" },
];

/* ---------- Hub cards (6) ---------- */
const hubs = [
  { icon: Building2,  title: "Properties\nMarketplace", desc: "10,234+ Listings", to: "/properties" },
  { icon: BarChart3,  title: "Investment\nHub", desc: "High ROI Opportunities", to: "/investment" },
  { icon: Scale,      title: "Finance\nHub", desc: "KPR & Funding Solutions", to: "/wallet" },
  { icon: Shield,     title: "Legal\nHub", desc: "Verified & Secure", to: "/legal-services" },
  { icon: Sparkles,   title: "AI Investment\nAdvisor", desc: "Smart Recommendations", to: "/ai-search" },
  { icon: Wrench,     title: "Property\nManagement", desc: "Manage Your Assets", to: "/agent-dashboard" },
];

/* ---------- Search tabs ---------- */
const searchTabs = ["All", "Properties", "Investments", "Locations", "Developers", "Vendors", "Laws"];
const locationChips = ["Bali", "Jakarta", "Phuket", "Singapore", "Kuala Lumpur"];

/* ---------- iOS-style swipeable segmented control ---------- */
function SegmentedSearchTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [rects, setRects] = useState<{ left: number; width: number }[]>([]);
  const x = useMotionValue(0);
  const pillWidth = useMotionValue(0);
  const isDragging = useRef(false);
  const didDrag = useRef(false);

  const activeIndex = Math.max(0, tabs.indexOf(value));

  useLayoutEffect(() => {
    const measure = () => {
      const c = containerRef.current;
      if (!c) return;
      const cRect = c.getBoundingClientRect();
      const next = btnRefs.current.map((b) => {
        if (!b) return { left: 0, width: 0 };
        const r = b.getBoundingClientRect();
        return { left: r.left - cRect.left, width: r.width };
      });
      setRects(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    btnRefs.current.forEach((b) => b && ro.observe(b));
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [tabs.length]);

  useEffect(() => {
    if (isDragging.current) return;
    const r = rects[activeIndex];
    if (!r) return;
    const c1 = animate(x, r.left, { type: "spring", stiffness: 500, damping: 38 });
    const c2 = animate(pillWidth, r.width, { type: "spring", stiffness: 500, damping: 38 });
    return () => { c1.stop(); c2.stop(); };
  }, [activeIndex, rects, x, pillWidth]);

  const indexAt = (clientX: number) => {
    const c = containerRef.current;
    if (!c || rects.length === 0) return 0;
    const offset = clientX - c.getBoundingClientRect().left;
    let best = 0;
    let bestDist = Infinity;
    rects.forEach((r, i) => {
      const center = r.left + r.width / 2;
      const d = Math.abs(center - offset);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return best;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Touch: let the browser scroll the tab strip natively; taps are handled by onClick.
    if (e.pointerType === "touch") return;
    if (rects.length === 0) return;
    didDrag.current = false;
    isDragging.current = true;
    const startX = e.clientX;
    const startIdx = indexAt(e.clientX);
    const startRect = rects[startIdx];
    animate(x, startRect.left, { type: "spring", stiffness: 600, damping: 40 });
    animate(pillWidth, startRect.width, { type: "spring", stiffness: 600, damping: 40 });

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      if (Math.abs(dx) > 3) didDrag.current = true;
      const idx = indexAt(ev.clientX);
      const r = rects[idx];
      if (!r) return;
      x.set(r.left);
      pillWidth.set(r.width);
    };

    const handleUp = (ev: PointerEvent) => {
      document.removeEventListener("pointermove", handleMove);
      document.removeEventListener("pointerup", handleUp);
      document.removeEventListener("pointercancel", handleUp);
      const finalIdx = indexAt(ev.clientX);
      const r = rects[finalIdx];
      if (r) {
        animate(x, r.left, { type: "spring", stiffness: 500, damping: 38 });
        animate(pillWidth, r.width, { type: "spring", stiffness: 500, damping: 38 });
      }
      onChange(tabs[finalIdx]);
      setTimeout(() => { isDragging.current = false; }, 30);
    };

    document.addEventListener("pointermove", handleMove);
    document.addEventListener("pointerup", handleUp);
    document.addEventListener("pointercancel", handleUp);
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      role="tablist"
      aria-label="Search category"
      className="relative inline-flex shrink-0 items-center rounded-full p-1 bg-[var(--surface)]/60 backdrop-blur-md border border-[var(--line)]/50 touch-pan-x md:touch-none select-none cursor-pointer"
    >
      {rects.length > 0 && (
        <motion.div
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-[var(--gold)] shadow-sm z-0 pointer-events-none"
          style={{ left: 0, x, width: pillWidth }}
        />
      )}

      {tabs.map((t, i) => (
        <button
          key={t}
          ref={(el) => (btnRefs.current[i] = el)}
          type="button"
          role="tab"
          aria-selected={value === t}
          onClick={(e) => {
            if (didDrag.current) { e.preventDefault(); return; }
            onChange(t);
          }}
          className={`relative z-10 min-w-11 md:min-w-0 px-3.5 md:px-4 lg:px-3 2xl:px-4 h-11 md:h-7 rounded-full transition-colors duration-150 text-[11px] md:text-[12px] font-semibold whitespace-nowrap ${
            value === t
              ? "text-[var(--gold-fg)]"
              : "text-[var(--text-2)] hover:text-[var(--text)]"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* ---------- Mock market sparklines (gold/green) ---------- */
const spark = (seed: number) =>
  Array.from({ length: 24 }, (_, i) => ({ i, v: 50 + Math.sin(i / 2 + seed) * 8 + Math.cos(i / 3 + seed) * 6 + i * 0.4 }));

const marketKPIs = [
  { label: "Property Price Index", value: "132.45", delta: "+6.24%", seed: 1 },
  { label: "Rental Yield Index", value: "8.74%", delta: "+2.13%", seed: 2 },
  { label: "Market Growth", value: "5.62%", delta: "+1.34%", seed: 3 },
  { label: "Tourism Growth", value: "12.38%", delta: "+3.87%", seed: 4 },
];

/* ---------- Hotspots ---------- */
const hotspots = [
  { city: "Phuket",       roi: "16.6%", x: 25, y: 28, slug: "phuket",       label: "left" },
  { city: "Kuala Lumpur", roi: "11.2%", x: 36, y: 38, slug: "kuala-lumpur", label: "right" },
  { city: "Singapore",    roi: "9.7%",  x: 44, y: 50, slug: "singapore",    label: "right" },
  { city: "Jakarta",      roi: "12.4%", x: 50, y: 70, slug: "jakarta",      label: "right" },
  { city: "Bali",         roi: "18.5%", x: 78, y: 70, slug: "bali",         label: "top" },
  { city: "Lombok",       roi: "24.3%", x: 88, y: 72, slug: "lombok",       label: "bottom" },
] as const;

/* Label placement keeps hotspot names from colliding on narrow phone maps. */
const hotspotLabelPos: Record<string, string> = {
  right: "left-4 top-1/2 -translate-y-1/2 text-left",
  left: "right-4 top-1/2 -translate-y-1/2 text-right",
  top: "bottom-3.5 left-1/2 -translate-x-1/2 text-center",
  bottom: "top-3.5 left-1/2 -translate-x-1/2 text-center",
};

const aiRecs = [
  { city: "Bali", title: "Luxury Villa in Bali",  roi: "18.5%", tag: "High Demand",   color: "#4ADE80" },
  { city: "Lombok", title: "Lombok Resort Land",  roi: "24.3%", tag: "High Growth",   color: "#FBBF24" },
  { city: "Jakarta", title: "Jakarta Commercial", roi: "12.9%", tag: "Stable Income", color: "#60A5FA" },
];

const marketReports = [
  { title: "Bali Property Market Report",        date: "May 2024" },
  { title: "Indonesia Property Outlook",         date: "Q2 2024"  },
  { title: "Southeast Asia Investment Report",   date: "May 2024" },
];

const banks = ["BCA", "Mandiri", "CIMB NIAGA", "HSBC", "DBS", "Maybank", "UOB", "OCBC NISP", "BNI", "BRI"];

/* ---------- atoms ---------- */
const Spark = ({ seed, color = "#4ADE80" }: { seed: number; color?: string }) => (
  <div className="h-9 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={spark(seed)}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.6} dot={false} isAnimationActive />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const fadeUp: any = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } } };
const stagger: any = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };

const Section = ({ children, className = "" }: any) => (
  <motion.section initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} variants={stagger} className={className}>
    {children}
  </motion.section>
);

/* ============================================================
   PAGE
   ============================================================ */
export default function AstraReosHome() {
  const [activeSearchTab, setActiveSearchTab] = useState("All");
  const [aiQuery, setAiQuery] = useState("");
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authInitial, setAuthInitial] = useState<"login" | "register">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [country, setCountry] = useState("Indonesia");
  const [hotspotZoom, setHotspotZoom] = useState(1);
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { logoUrl: headerLogo } = useBrandingLogo('headerLogo', '/astra-logo.png');
  const { data: market, loading: marketLoading } = useReosMarket();
  const { search, data: aiData, loading: aiLoading, error: aiError, reset: resetAi } = useReosAiSearch();

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Title is set by <LocalizedHead /> so it stays in sync with the active language.
    document.documentElement.setAttribute("data-reos-theme", "on");
    return () => document.documentElement.removeAttribute("data-reos-theme");
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (langRef.current && !langRef.current.contains(t)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(t)) setProfileOpen(false);
      if (countryRef.current && !countryRef.current.contains(t)) setCountryOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const submitAi = async () => {
    if (!aiQuery.trim()) return;
    setShowAiSheet(true);
    await search(aiQuery);
  };

  const runSearch = () => {
    if (!aiQuery.trim()) {
      navigate("/search");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(aiQuery)}`);
  };

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const languages: { code: any; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "id", label: "ID" },
    { code: "zh", label: "ZH" },
    { code: "ja", label: "JA" },
    { code: "ko", label: "KO" },
    { code: "ru", label: "RU" },
  ];
  const countries = ["Indonesia", "Singapore", "Malaysia", "Thailand", "Vietnam", "Philippines"];


  const featured = useMemo(() => {
    const base = market?.featured ?? [];
    const badges = ["FEATURED", "NEW", "HOT", "INVESTMENT"];
    const fallback = [
      { id: "f1", title: "Luxury Ocean View Villa", city: "Bali, Indonesia",  type: "Villa",     price: 18_500_000_000, roi: 18.5, beds: 4, baths: 5, area: 600,  cover_image: heroImg },
      { id: "f2", title: "Premium Apartment",        city: "Jakarta, Indonesia", type: "Apartment", price: 3_200_000_000,  roi: 12.4, beds: 2, baths: 2, area: 120,  cover_image: heroImg },
      { id: "f3", title: "Beachfront Resort",        city: "Phuket, Thailand",   type: "Resort",    price: 24_700_000_000, roi: 22.1, beds: 8, baths: 10, area: 1200, cover_image: heroImg },
      { id: "f4", title: "Ocean View Land",          city: "Lombok, Indonesia",  type: "Land",      price: 6_800_000_000,  roi: 24.3, area: 1000, cover_image: heroImg },
    ];
    const src = base.length ? base : fallback;
    return src.slice(0, 4).map((p: any, i: number) => ({ ...p, _badge: badges[i % badges.length] }));
  }, [market]);

  return (
    <>
      <style>{tokens}</style>
      <div className="reos min-h-screen">
        {/* Header is rendered globally by ReosHeader in App.tsx */}


        {/* ===================== MOBILE DRAWER ===================== */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.aside
                initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="w-[82%] max-w-[320px] h-full overflow-y-auto reos-scrollbar border-r border-[var(--line-strong)] p-4"
                style={{ background: "var(--bg)" }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <img src={headerLogo} alt="ASTRA Villa" className="h-8 w-8 rounded-full object-contain shadow-sm" />
                    <span className="font-semibold tracking-[0.18em] text-[14px]">ASTRA<span className="reos-gold ml-1">VILLA</span></span>
                  </div>
                  <button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu" className="h-9 w-9 rounded-md hover:bg-[var(--surface)] flex items-center justify-center"><X className="h-4 w-4" /></button>
                </div>
                <div className="space-y-1">
                  {topTabs.map(t => (
                    <Link key={t.label} to={t.to} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
                      <t.icon className="h-4 w-4" /> {t.label}
                    </Link>
                  ))}
                  <div className="reos-divider my-3" />
                  {sideNav.map(n => (
                    <Link key={n.label} to={n.to} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]">
                      <n.icon className="h-4 w-4" /><span className="flex-1">{n.label}</span>
                      {n.badge && <span className="text-[10px] bg-[var(--gold)] text-[var(--gold-fg)] font-bold px-1.5 py-0.5 rounded">{n.badge}</span>}
                    </Link>
                  ))}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>


        {/* ===================== LAYOUT ===================== */}
        <div className="mx-auto max-w-[1600px] px-4 md:px-6 pt-0 pb-6 md:py-6 flex gap-6">
          {/* ============ SIDEBAR ============ */}
          <aside className="hidden xl:flex flex-col w-[230px] shrink-0 gap-4">
            <div className="reos-card p-2">
              {sideNav.map((n, i) => (
                <motion.div key={n.label} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Link
                    to={n.to}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] mb-0.5 transition-colors ${n.active ? "bg-[var(--gold-soft)] reos-gold" : "text-[var(--text-2)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"}`}
                  >
                    <n.icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{n.label}</span>
                    {n.badge && <span className="text-[10px] bg-[var(--gold)] text-[var(--gold-fg)] font-bold px-1.5 py-0.5 rounded">{n.badge}</span>}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Investor club promo */}
            <div className="reos-card relative overflow-hidden p-5 text-center" style={{ background: "var(--promo-gradient)" }}>
              <div className="relative">
                <Crown className="h-6 w-6 reos-gold mx-auto" />
                <div className="mt-2 font-semibold tracking-wider text-sm">ASTRA VILLA</div>
                <div className="text-[10px] tracking-[0.3em] reos-gold">INVESTOR CLUB</div>
                <p className="mt-3 text-[11px] text-[var(--text-2)] leading-relaxed">Join exclusive investor community and get premium benefits.</p>
                <button
                  type="button"
                  onClick={() => user ? navigate("/astra-tokens") : (setAuthInitial("register"), setShowAuth(true))}
                  className="mt-4 w-full h-9 rounded-lg reos-cta text-xs inline-flex items-center justify-center gap-1.5"
                >
                  Join Now <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Apps */}
            <div className="px-1">
              <div className="text-[11px] uppercase tracking-[0.2em] text-[var(--text-2)] mb-2">Download Our Apps</div>
              <div className="space-y-2">
                {[
                  { b: "Download on the", n: "App Store", href: "https://apps.apple.com/" },
                  { b: "GET IT ON", n: "Google Play", href: "https://play.google.com/" },
                ].map(a => (
                  <a key={a.n} href={a.href} target="_blank" rel="noopener noreferrer" aria-label={`${a.b} ${a.n}`} className="w-full h-11 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center gap-2 text-left hover:border-[var(--line-strong)] transition">
                    <div aria-hidden="true" className="h-5 w-5 rounded reos-gold flex items-center justify-center">●</div>
                    <div className="leading-tight">
                      <div className="text-[9px] text-[var(--text-2)]">{a.b}</div>
                      <div className="text-[12px] font-medium">{a.n}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>

          </aside>

          {/* ============ MAIN ============ */}
          <main className="flex-1 min-w-0 space-y-7 md:space-y-6">

            {/* ===== HERO + MARKET OVERVIEW ===== */}
            <Section className="grid grid-cols-12 gap-4 sm:gap-5">
              {/* Hero */}
              <motion.div variants={fadeUp} className="col-span-12 lg:col-span-8 2xl:col-span-9 reos-card reos-m-bleed overflow-hidden relative md:min-h-[480px]">
                {/* Phones: photo band across the top that fades into the page; tablet/desktop: full-card photo. */}
                <div className="absolute inset-x-0 top-0 h-[340px] min-[390px]:h-[380px] md:h-auto md:bottom-0">
                  <img src={heroImg} alt="Luxury villa overlooking the ocean" width={1600} height={900} {...({ fetchpriority: "high" } as Record<string, string>)} decoding="async" className="absolute inset-0 w-full h-full object-cover object-[68%_center] md:object-center" />
                  <div className="absolute inset-0 hidden md:block" style={{ background: "var(--hero-overlay)" }} />
                  <div className="absolute inset-0 md:hidden" style={{ background: "var(--hero-overlay-mobile)" }} />
                </div>

                <div className="relative px-4 pt-[132px] min-[390px]:pt-[150px] pb-2 md:p-10 lg:p-8 2xl:p-10 flex flex-col h-full" style={{ color: "var(--hero-text)" }}>
                  <span className="self-start inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border border-[var(--line-strong)] bg-[var(--bg)]/70 text-[10px] font-semibold uppercase tracking-[0.16em] reos-gold md:hidden">
                    <Sparkles className="h-3 w-3" aria-hidden="true" /> AI Real Estate OS
                  </span>
                  <h1 className="mt-3 md:mt-0 text-[26px] min-[390px]:text-[30px] sm:text-4xl md:text-5xl font-semibold leading-[1.12] md:leading-[1.05] tracking-tight max-w-xl break-words" style={{ color: "var(--hero-text)" }}>
                    <span className="md:block">Southeast Asia's </span>
                    <span className="md:block"><span className="reos-gold">AI-Powered</span> Real Estate </span>
                    <span className="md:block">Operating System</span>
                  </h1>
                  <p className="mt-2.5 md:mt-4 text-[14px] md:text-[15px] max-w-md leading-relaxed" style={{ color: "var(--hero-text-2)" }}>Buy. Invest. Manage. Finance. Verify. Grow.</p>

                  {/* Primary actions: stacked full-width on phones, inline from tablet up */}
                  <div className="mt-5 md:mt-6 grid grid-cols-1 min-[480px]:grid-cols-2 md:flex gap-2.5 max-w-md md:max-w-none">
                    <Link to="/properties" className="h-12 md:h-11 px-5 rounded-full reos-cta text-[14px] md:text-[13px] inline-flex items-center justify-center gap-2">
                      <Building2 className="h-4 w-4" aria-hidden="true" /> Explore Properties
                    </Link>
                    <Link to="/investment" className="h-12 md:h-11 px-5 rounded-full reos-outline bg-[var(--bg)]/60 text-[14px] md:text-[13px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-[var(--surface)]" style={{ color: "var(--hero-text)" }}>
                      <TrendingUp className="h-4 w-4 reos-gold" aria-hidden="true" /> Start Investing
                    </Link>
                  </div>

                  {/* Search Panel */}
                  <div className="mt-6 md:mt-8 w-full max-w-2xl">
                    <div className="reos-card md:backdrop-blur-xl shadow-[var(--shadow-soft)] p-3 md:p-4">
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <div className="w-full md:w-auto max-w-full overflow-x-auto overflow-y-hidden reos-no-scrollbar overscroll-x-contain">
                          <SegmentedSearchTabs
                            tabs={searchTabs}
                            value={activeSearchTab}
                            onChange={setActiveSearchTab}
                          />
                        </div>
                        <div className="hidden md:flex items-center gap-1.5 ml-auto text-[10px] uppercase tracking-[0.2em] text-[var(--text-3)]">
                          <Sparkles className="h-3 w-3 reos-gold" /> AI-Powered Property Search
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex flex-1 min-w-0 items-center gap-2 bg-[var(--surface)]/50 backdrop-blur-md border border-[var(--line)]/60 rounded-full px-1.5 h-12 sm:h-11">
                          <Search className="h-4 w-4 text-[var(--text-2)] ml-3 shrink-0" aria-hidden="true" />
                          <input
                            type="search"
                            enterKeyHint="search"
                            aria-label="Search properties, locations, ROI, developers, laws"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
                            placeholder="Search properties, locations, ROI, developers, laws…"
                            className="flex-1 self-stretch bg-transparent outline-none text-base sm:text-sm placeholder:text-[var(--text-2)] min-w-0 [&::-webkit-search-cancel-button]:hidden"
                          />
                          {aiQuery && (
                            <button
                              type="button"
                              onClick={() => setAiQuery("")}
                              aria-label="Clear search"
                              className="relative reos-hit shrink-0 h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-[var(--surface-2)] text-[var(--text-3)] transition"
                            >
                              <X className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          )}
                          <button onClick={submitAi} disabled={aiLoading} className="hidden sm:inline-flex btn-titanium h-8 pl-1.5 pr-3 rounded-full text-[11px] items-center gap-1.5 font-semibold disabled:opacity-60 shrink-0">
                            <span className="titanium-icon inline-flex items-center justify-center w-6 h-6 rounded-full shrink-0">
                              {aiLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            </span>
                            <span className="relative">AI Search</span>
                          </button>
                        </div>
                        {/* Phones: full-width AI search action under the field */}
                        <button onClick={submitAi} disabled={aiLoading} className="sm:hidden w-full h-11 rounded-full reos-cta text-[13px] inline-flex items-center justify-center gap-2 disabled:opacity-60">
                          {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          AI Search
                        </button>
                      </div>
                      <div className="mt-2.5 -mx-1 px-1 flex gap-1.5 overflow-x-auto overflow-y-hidden reos-no-scrollbar sm:flex-wrap sm:overflow-visible">
                        {locationChips.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => navigate(`/search?q=${encodeURIComponent(`Properties in ${c}`)}`)}
                            className="btn-titanium shrink-0 inline-flex items-center h-11 sm:h-auto text-[12px] sm:text-[10px] md:text-[11px] px-3.5 sm:px-2.5 md:px-3 sm:py-1 rounded-full font-semibold whitespace-nowrap"
                          >
                            {c}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => navigate("/search-advanced")}
                          aria-label="More location filters"
                          className="btn-titanium shrink-0 h-11 sm:h-auto text-[12px] sm:text-[10px] md:text-[11px] px-3.5 sm:px-2.5 md:px-3 sm:py-1 rounded-full font-semibold inline-flex items-center gap-1 whitespace-nowrap"
                        >
                          More <ChevronDown className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>


              {/* Market overview */}
              <motion.div variants={fadeUp} className="col-span-12 lg:col-span-4 2xl:col-span-3 reos-card reos-m-flat p-4 sm:p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-[17px] md:text-[14px] font-semibold">Market Overview</h2>
                  <div className="relative" ref={countryRef}>
                    <button
                      type="button"
                      onClick={() => setCountryOpen(o => !o)}
                      className="min-h-11 -my-2 -mr-2 px-2 text-[11px] text-[var(--text-2)] inline-flex items-center gap-1 hover:text-[var(--text)]"
                      aria-haspopup="menu"
                      aria-expanded={countryOpen}
                    >
                      {country} <ChevronDown className="h-3 w-3" />
                    </button>
                    {countryOpen && (
                      <div role="menu" className="absolute right-0 mt-2 w-40 reos-card p-1 z-30 shadow-[var(--shadow-popover)]">
                        {countries.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => { setCountry(c); setCountryOpen(false); }}
                            className={`w-full text-left px-3 py-2 min-h-11 lg:min-h-0 rounded-md text-[12px] hover:bg-[var(--surface-2)] ${country === c ? "reos-gold" : "text-[var(--text)]"}`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Phones: swipeable KPI tiles; tablet/desktop: compact list */}
                <div className="mt-3 md:mt-4 -mx-4 px-4 flex gap-2.5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-px-4 reos-no-scrollbar overscroll-x-contain md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-1 md:gap-x-8 md:gap-y-4 md:overflow-visible">
                  {marketKPIs.map(k => (
                    <div key={k.label} className="snap-start shrink-0 w-[46%] min-[430px]:w-[42%] rounded-xl bg-[var(--surface)] border border-[var(--line-gold)] p-3 md:w-auto md:p-0 md:bg-transparent md:border-0 md:rounded-none md:grid md:grid-cols-[24px_minmax(0,1fr)_minmax(64px,90px)] md:items-center md:gap-2">
                      <div className="hidden md:flex h-6 w-6 rounded-md bg-[var(--gold-soft)] items-center justify-center">
                        <BarChart3 className="h-3.5 w-3.5 reos-gold" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] text-[var(--text-2)] truncate">{k.label}</div>
                        <div className="flex flex-wrap items-baseline gap-x-2">
                          <div className="text-[18px] md:text-[15px] font-semibold">{k.value}</div>
                          <div className="text-[10px] text-[var(--success)] whitespace-nowrap">▲ {k.delta}</div>
                        </div>
                      </div>
                      <Spark seed={k.seed} color="#C6A66B" />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/market-heatmap")}
                  className="mt-3 min-h-11 text-[12px] reos-gold inline-flex items-center gap-1 hover:underline"
                >
                  View Full Market Report <ArrowUpRight className="h-3 w-3" />
                </button>
              </motion.div>
            </Section>

            {/* ===== HUB CARDS ===== */}
            <Section>
              <h2 className="md:hidden text-[17px] font-semibold mb-3">Explore ASTRA</h2>
              <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5 md:gap-3">
              {hubs.map(h => (
                <motion.div key={h.title} variants={fadeUp} whileHover={{ y: -3 }}>
                  <Link to={h.to} className="flex flex-col items-center text-center md:block md:text-left reos-card px-2 py-3.5 md:p-4 h-full min-h-[104px] md:min-h-[120px] hover:border-[var(--line-strong)] transition">
                    <div className="h-11 w-11 md:h-9 md:w-9 rounded-xl md:rounded-lg bg-[var(--gold-soft)] border border-[var(--line-gold)] md:border-0 flex items-center justify-center mb-2 md:mb-3">
                      <h.icon className="h-5 w-5 md:h-4.5 md:w-4.5 reos-gold" />
                    </div>
                    <div className="text-[11.5px] md:text-[13px] font-semibold whitespace-normal md:whitespace-pre-line leading-tight break-words">{h.title}</div>
                    <div className="hidden md:block mt-1.5 text-[11px] text-[var(--text-2)]">{h.desc}</div>
                  </Link>
                </motion.div>
              ))}
              </div>
            </Section>


            {/* ===== FEATURED + HOTSPOTS + AI RECS ===== */}
            <div className="grid grid-cols-12 gap-4 sm:gap-5">
              {/* Featured Properties */}
              <Section className="col-span-12 lg:col-span-6 2xl:col-span-5 reos-card reos-m-flat p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <h2 className="text-[17px] md:text-[14px] font-semibold">Featured Properties</h2>
                  <Link to="/properties" className="min-h-11 -my-3 text-[11px] reos-gold inline-flex items-center gap-1 hover:underline">View All <ArrowUpRight className="h-3 w-3" /></Link>
                </div>
                {/* Phones: swipeable property cards; tablet/desktop: 2-column grid */}
                <div className="-mx-4 px-4 flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-px-4 reos-no-scrollbar overscroll-x-contain pb-1 md:mx-0 md:px-0 md:grid md:grid-cols-2 md:overflow-visible md:pb-0">
                  {featured.map((p: any) => {
                    const badgeColor: Record<string, string> = {
                      FEATURED: "bg-[var(--gold)] text-[var(--gold-fg)]",
                      NEW: "bg-[#3B82F6] text-white",
                      HOT: "bg-[#EF4444] text-white",
                      INVESTMENT: "bg-[#10B981] text-white",
                    };
                    const img = p.cover_image || p.images?.[0] || heroImg;
                    return (
                      <motion.div key={p.id} variants={fadeUp} whileHover={{ y: -3 }} className="reos-card-2 overflow-hidden group snap-start shrink-0 w-[80%] min-[430px]:w-[72%] md:w-auto">
                        <Link to={`/property/${p.slug ?? p.id}`} className="block h-full">
                          <div className="relative h-44 min-[390px]:h-48 md:h-28 overflow-hidden">
                            <img src={img} alt={p.title} width={400} height={224} loading="lazy" decoding="async" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <span className={`absolute top-2.5 left-2.5 text-[10px] md:text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${badgeColor[p._badge]}`}>{p._badge}</span>
                          </div>
                          <div className="p-3 min-w-0 flex-1">
                            <div className="text-[10px] text-[var(--text-2)] truncate">{p.city || p.location}</div>
                            <div className="text-[15px] md:text-[12px] font-semibold leading-snug mt-0.5 line-clamp-1">{p.title}</div>
                            <div className="text-[10px] text-[var(--text-3)] capitalize">{p.type || "Property"}</div>
                            <div className="mt-2 flex items-baseline justify-between gap-2 flex-wrap">
                              <div className="text-[16px] md:text-[12px] font-bold reos-gold">{formatIDR(Number(p.price))}</div>
                              {(p.roi || p.roi_percentage) && (
                                <div className="text-[10px] text-[var(--success)] font-medium">ROI {Number(p.roi || p.roi_percentage).toFixed(1)}%</div>
                              )}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--text-2)]">
                              {p.beds && <span className="inline-flex items-center gap-1"><BedDouble className="h-3 w-3" />{p.beds}</span>}
                              {p.baths && <span className="inline-flex items-center gap-1"><Bath className="h-3 w-3" />{p.baths}</span>}
                              {p.area && <span className="inline-flex items-center gap-1"><Maximize className="h-3 w-3" />{p.area} m²</span>}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
                <div className="mt-4 hidden md:flex justify-center gap-1.5" aria-hidden="true">
                  {[0,1,2,3].map(i => <span key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? "w-5 bg-[var(--gold)]" : "w-1.5 bg-[var(--line-strong)]"}`} />)}
                </div>
              </Section>

              {/* Investment Hotspots */}
              <Section className="col-span-12 md:col-span-6 2xl:col-span-4 reos-card p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[17px] md:text-[14px] font-semibold">Investment Hotspots</h2>
                  <Link to="/market-heatmap" className="min-h-11 -my-3 text-[11px] reos-gold inline-flex items-center gap-1 hover:underline">View All <ArrowUpRight className="h-3 w-3" /></Link>
                </div>
                {/* Phones: ranked list (easy to tap); tablet/desktop: interactive map */}
                <ol className="md:hidden divide-y divide-[var(--line)] -my-1">
                  {[...hotspots].sort((a, b) => parseFloat(b.roi) - parseFloat(a.roi)).map((h, i) => (
                    <li key={h.city}>
                      <button
                        type="button"
                        onClick={() => navigate(`/invest/${h.slug}`)}
                        className="w-full min-h-[52px] flex items-center gap-3 py-2 text-left"
                      >
                        <span className="h-7 w-7 shrink-0 rounded-full bg-[var(--gold-soft)] border border-[var(--line-gold)] text-[11px] font-semibold reos-gold inline-flex items-center justify-center">{i + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-medium truncate">{h.city}</span>
                          <span className="mt-1 block h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden" aria-hidden="true">
                            <span className="block h-full rounded-full bg-[var(--gold)]" style={{ width: `${Math.min(100, (parseFloat(h.roi) / 25) * 100)}%` }} />
                          </span>
                        </span>
                        <span className="text-[13px] font-semibold reos-gold whitespace-nowrap">ROI {h.roi}</span>
                        <ChevronRight className="h-4 w-4 text-[var(--text-3)] shrink-0" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ol>
                <div className="hidden md:block relative aspect-[4/3] rounded-xl overflow-hidden border border-[var(--line)]" style={{ background: "var(--hotspot-bg)" }}>
                  <div className="absolute inset-0 origin-center transition-transform" style={{ transform: `scale(${hotspotZoom})` }}>
                    <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full opacity-30" style={{ color: "var(--gold)" }}>
                      <path d="M10,40 q15,-10 30,-5 q15,5 25,0 q10,-3 20,5 q5,8 -5,12 q-20,4 -40,2 q-25,-2 -30,-14z" fill="none" stroke="currentColor" strokeWidth="0.3" />
                      <path d="M45,55 q10,-3 18,2 q6,8 -4,12 q-12,2 -18,-4 q-4,-6 4,-10z" fill="none" stroke="currentColor" strokeWidth="0.3" />
                    </svg>

                    {hotspots.map(h => (
                      <button
                        key={h.city}
                        type="button"
                        onClick={() => navigate(`/invest/${h.slug}`)}
                        aria-label={`${h.city} investment hotspot`}
                        className="absolute reos-hit -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                        style={{ left: `${h.x}%`, top: `${h.y}%` }}
                      >
                        <div className="relative">
                          <div className="relative h-2.5 w-2.5 rounded-full bg-[var(--gold-2)] ring-2 ring-[var(--gold)]/40 group-hover:scale-125 transition-transform" />
                        </div>
                        <div className={`absolute whitespace-nowrap pointer-events-none ${hotspotLabelPos[h.label]}`}>
                          <div className="text-[10px] font-semibold">{h.city}</div>
                          <div className="text-[9px] reos-gold">ROI {h.roi}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="absolute bottom-2 left-2 flex flex-col gap-2 z-10">
                    <button type="button" onClick={() => setHotspotZoom(z => Math.min(2, +(z + 0.2).toFixed(2)))} aria-label="Zoom in" className="relative reos-hit h-8 w-8 rounded bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center hover:border-[var(--line-strong)]"><Plus className="h-3 w-3" /></button>
                    <button type="button" onClick={() => setHotspotZoom(z => Math.max(0.6, +(z - 0.2).toFixed(2)))} aria-label="Zoom out" className="relative reos-hit h-8 w-8 rounded bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center hover:border-[var(--line-strong)]"><Minus className="h-3 w-3" /></button>
                  </div>
                </div>
                <div className="mt-3 hidden md:flex items-center justify-between text-[10px] text-[var(--text-2)]">
                  <span>Low ROI</span>
                  <div className="flex-1 mx-3 h-1.5 rounded-full" style={{ background: "linear-gradient(90deg, var(--gold-soft), var(--gold))" }} />
                  <span>High ROI</span>
                </div>
              </Section>

              {/* AI Recommendation + Market Intelligence */}
              <div className="col-span-12 md:col-span-6 lg:col-span-12 2xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-1 gap-4 sm:gap-5 content-start">
                <Section className="reos-card p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[16px] md:text-[13px] font-semibold">AI Recommendation</h2>
                    <Link to="/ai-search" className="min-h-11 -my-3 text-[10px] reos-gold inline-flex items-center gap-1">View All <ArrowUpRight className="h-3 w-3" /></Link>
                  </div>
                  <div className="space-y-3">
                    {aiRecs.map(r => (
                      <motion.div key={r.title} variants={fadeUp} className="flex items-center gap-3">
                        <div className="h-10 w-12 rounded-md overflow-hidden shrink-0">
                          <img src={heroImg} alt={r.city} width={48} height={40} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] md:text-[11px] font-medium truncate">{r.title}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] reos-gold">ROI {r.roi}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${r.color}20`, color: r.color }}>{r.tag}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Section>

                <Section className="reos-card p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[16px] md:text-[13px] font-semibold">Market Intelligence</h2>
                    <Link to="/market-heatmap" className="min-h-11 -my-3 text-[10px] reos-gold inline-flex items-center gap-1">View All <ArrowUpRight className="h-3 w-3" /></Link>
                  </div>
                  <div className="space-y-2.5">
                    {marketReports.map(r => (
                      <motion.div key={r.title} variants={fadeUp} className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 reos-gold shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] md:text-[11px] font-medium truncate">{r.title}</div>
                        </div>
                        <div className="text-[10px] text-[var(--text-2)] shrink-0">{r.date}</div>
                      </motion.div>
                    ))}
                  </div>
                </Section>
              </div>
            </div>

            {/* ===== BOTTOM STATS ===== */}
            <Section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 md:gap-3">
              <h2 className="col-span-2 md:hidden text-[17px] font-semibold">Portfolio Snapshot</h2>
              {[
                { label: "My Portfolio Value", value: "IDR 28.6 M", delta: "▲ 8.24%", chart: true },
                { label: "Total Investments", value: "7", sub: "Properties" },
                { label: "Average ROI", value: "15.6%", sub: "Per Year", chart: true },
                { label: "Total Rental Income", value: "IDR 245.8 M", delta: "▲ 12.3% This Year" },
                { label: "Active Tenants", value: "23", sub: "Tenants" },
              ].map((s, i) => (
                <motion.div key={s.label} variants={fadeUp} className={`reos-card p-3.5 sm:p-4 min-w-0 ${i === 0 ? "col-span-2 md:col-span-1" : ""}`}>
                  <div className="flex items-start justify-between gap-1">
                    <div className="text-[11px] text-[var(--text-2)] leading-snug">{s.label}</div>
                    <MoreHorizontal className="h-3.5 w-3.5 text-[var(--text-3)] shrink-0" aria-hidden="true" />
                  </div>
                  <div className={`mt-2 font-semibold reos-gold whitespace-nowrap ${i === 0 ? "text-[24px] md:text-[18px]" : "text-[17px] sm:text-[18px]"}`}>{s.value}</div>
                  {s.sub && <div className="text-[10px] text-[var(--text-2)] mt-0.5">{s.sub}</div>}
                  {s.delta && <div className="text-[10px] text-[var(--success)] mt-0.5">{s.delta}</div>}
                  {s.chart && <div className="mt-2"><Spark seed={Math.random() * 10} color="#C6A66B" /></div>}
                </motion.div>
              ))}

              {/* Generate report */}
              <motion.div variants={fadeUp} className="col-span-2 md:col-span-1 reos-card p-4 relative overflow-hidden min-w-0" style={{ background: "var(--promo-gradient-diag)" }}>
                <div className="relative">
                  <div className="text-[15px] md:text-[11px] font-semibold">Get AI Investment Report</div>
                  <div className="text-[12px] md:text-[10px] text-[var(--text-2)] mt-1 leading-snug md:leading-tight">Personalized report based on your investment goals.</div>
                  <button
                    type="button"
                    onClick={() => user ? navigate("/wealth-advisor") : (setAuthInitial("login"), setShowAuth(true))}
                    className="mt-3 w-full md:w-auto h-12 md:h-11 lg:h-8 px-3 rounded-full md:rounded-lg reos-cta text-[14px] md:text-[11px] inline-flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="h-3 w-3" /> Generate Now
                  </button>
                </div>
              </motion.div>
            </Section>

          </main>
        </div>

        {/* ===== AI Results Sheet ===== */}
        <AnimatePresence>
          {showAiSheet && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 backdrop-blur-sm flex justify-end"
              style={{ background: "var(--scrim)" }}
              onClick={() => { setShowAiSheet(false); resetAi(); }}>
              <motion.aside
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="AI Investment Results"
                className="w-full md:w-[560px] h-full overflow-y-auto overscroll-contain reos-scrollbar border-l border-[var(--line-strong)]"
                style={{ background: "var(--bg)", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
              >
                <div className="sticky top-0 backdrop-blur-xl bg-[var(--bg)] border-b border-[var(--line)] px-4 sm:px-5 pb-3 flex items-center justify-between z-10" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 reos-gold" />
                    <span className="text-sm font-semibold tracking-wide">AI Investment Results</span>
                  </div>
                  <button onClick={() => { setShowAiSheet(false); resetAi(); }} aria-label="Close AI results" className="h-11 w-11 -mr-2 rounded-md hover:bg-[var(--surface)] flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-2)]">Query</div>
                  <div className="reos-card p-3 text-sm break-words">{aiQuery}</div>

                  {aiLoading && (
                    <div className="reos-card p-6 flex items-center gap-3 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin reos-gold" /> Scoring properties with AI…
                    </div>
                  )}
                  {aiError && <div className="reos-card p-4 text-sm text-[var(--danger)]">{aiError}</div>}

                  {aiData && !aiLoading && (
                    <>
                      {aiData.insight && (
                        <div className="reos-card p-4">
                          <div className="text-xs uppercase tracking-[0.2em] reos-gold mb-2">AI Insight</div>
                          <div className="text-sm text-[var(--text-2)] leading-relaxed">{aiData.insight}</div>
                        </div>
                      )}
                      <div className="space-y-3">
                        {(aiData.results || []).map((r: any, idx: number) => (
                          <motion.div key={r.id ?? idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                            className="reos-card p-4 flex gap-3">
                            <div className="h-16 w-20 rounded-lg overflow-hidden shrink-0">
                              <img src={r.cover_image || heroImg} alt={r.title} width={80} height={64} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold truncate">{r.title}</div>
                              <div className="text-[11px] text-[var(--text-2)] flex items-center gap-1"><MapPin className="h-3 w-3" />{r.city || r.location}</div>
                              <div className="mt-1.5 flex items-baseline gap-3">
                                <div className="text-sm font-semibold reos-gold">{formatIDR(Number(r.price))}</div>
                                {r.ai_score != null && <div className="text-[11px] text-[var(--success)]">Score {Math.round(r.ai_score)}</div>}
                              </div>
                              {r.reason && <div className="mt-1 text-[11px] text-[var(--text-2)] line-clamp-2">{r.reason}</div>}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>

        <ReosAuthModal open={showAuth} onOpenChange={setShowAuth} initialMode={authInitial} />
      </div>
    </>
  );
}

