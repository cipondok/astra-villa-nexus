import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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


/* ============================================================
   ASTRA Villa — REOS Landing
   Matches the "Bloomberg Terminal of Real Estate" reference:
   Black / Gold luxury palette, dashboard-style composition.
   ============================================================ */

const tokens = `
  .reos {
    --bg: #0B0B0C;
    --bg-2: #0F0F11;
    --surface: #121214;
    --surface-2: #17171A;
    --line: rgba(200,169,106,0.14);
    --line-strong: rgba(200,169,106,0.32);
    --gold: #C8A96A;
    --gold-2: #E0C384;
    --gold-soft: rgba(200,169,106,0.10);
    --text: #F4F1EA;
    --text-2: #9A958A;
    --text-3: #6B6760;
    --success: #4ADE80;
    --danger: #F87171;
    color: var(--text);
    background: var(--bg);
    font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
    letter-spacing: -0.005em;
  }
  .reos *::selection { background: var(--gold); color: #111; }
  .reos-card { background: var(--surface); border: 1px solid var(--line); border-radius: 16px; }
  .reos-card-2 { background: var(--surface-2); border: 1px solid var(--line); border-radius: 12px; }
  .reos-gold { color: var(--gold-2); }
  .reos-cta { background: linear-gradient(180deg, var(--gold-2), var(--gold)); color: #161208; font-weight: 600; border: 1px solid rgba(255,225,160,0.4); }
  .reos-cta:hover { filter: brightness(1.06); }
  .reos-outline { border: 1px solid var(--line-strong); }
  .reos-chip { border: 1px solid var(--line); color: var(--text-2); }
  .reos-chip:hover { border-color: var(--line-strong); color: var(--text); }
  .reos-tab-active { color: var(--gold-2); }
  .reos-tab-active::after { content:''; position:absolute; left:50%; bottom:-10px; transform:translateX(-50%); width: 28px; height: 2px; background: var(--gold); border-radius: 2px; }
  .reos-divider { background-image: linear-gradient(90deg, transparent, var(--line-strong), transparent); height: 1px; }
  .reos-shadow { box-shadow: 0 24px 60px -28px rgba(200,169,106,0.25); }
  .reos-scrollbar::-webkit-scrollbar{width:6px;height:6px}
  .reos-scrollbar::-webkit-scrollbar-thumb{background:var(--line-strong);border-radius:3px}

  /* === Global override while REOS is mounted — restyle the floating ASTRA chat widget === */
  html[data-reos-theme="on"] {
    --background: 240 4% 6%;
    --foreground: 40 30% 94%;
    --card: 240 5% 8%;
    --card-foreground: 40 30% 94%;
    --popover: 240 5% 8%;
    --popover-foreground: 40 30% 94%;
    --primary: 41 45% 60%;
    --primary-foreground: 30 25% 8%;
    --secondary: 240 4% 12%;
    --secondary-foreground: 40 30% 94%;
    --muted: 240 4% 12%;
    --muted-foreground: 40 8% 60%;
    --accent: 41 60% 70%;
    --accent-foreground: 30 25% 8%;
    --destructive: 0 70% 55%;
    --destructive-foreground: 0 0% 100%;
    --border: 41 25% 22%;
    --input: 41 25% 22%;
    --ring: 41 45% 60%;
    --chart-1: 41 45% 60%;
    --chart-5: 41 60% 70%;
  }
`;

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
  { city: "Phuket",       roi: "16.6%", x: 25, y: 28, slug: "phuket" },
  { city: "Kuala Lumpur", roi: "11.2%", x: 36, y: 38, slug: "kuala-lumpur" },
  { city: "Singapore",    roi: "9.7%",  x: 44, y: 50, slug: "singapore" },
  { city: "Jakarta",      roi: "12.4%", x: 50, y: 70, slug: "jakarta" },
  { city: "Bali",         roi: "18.5%", x: 78, y: 70, slug: "bali" },
  { city: "Lombok",       roi: "24.3%", x: 88, y: 72, slug: "lombok" },
];

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
  const { data: market, loading: marketLoading } = useReosMarket();
  const { search, data: aiData, loading: aiLoading, error: aiError, reset: resetAi } = useReosAiSearch();

  const langRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "ASTRA Villa REOS — AI Real Estate Operating System";
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
        {/* ===================== HEADER ===================== */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--bg)]/80 border-b border-[var(--line)]">
          <div className="mx-auto max-w-[1600px] px-6 h-[68px] flex items-center gap-4 md:gap-6">
            {/* Mobile menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
              className="lg:hidden h-10 w-10 rounded-lg hover:bg-[var(--surface)] flex items-center justify-center"
            >
              <Menu className="h-5 w-5 text-[var(--text)]" />
            </button>

            {/* Logo */}
            <Link to="/" aria-label="ASTRA Villa home" className="flex items-center gap-2.5 shrink-0">
              <img
                src="/astra-logo.png"
                alt="ASTRA Villa"
                className="h-9 w-9 rounded-full object-contain shadow-sm"
              />
              <div className="leading-none hidden sm:block">
                <div className="font-semibold tracking-[0.18em] text-[15px]">ASTRA<span className="reos-gold ml-1">VILLA</span></div>
                <div className="text-[9px] tracking-[0.28em] text-[var(--text-3)] mt-1">REAL ESTATE OPERATING SYSTEM</div>
              </div>
            </Link>

            {/* Center search */}
            <div className="flex-1 max-w-3xl mx-auto relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-2)]" />
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
                placeholder="AI Search: Properties, Locations, ROI, Developers, Laws…"
                aria-label="Search"
                className="w-full h-11 pl-11 pr-12 rounded-xl bg-[var(--surface)] border border-[var(--line)] focus:border-[var(--line-strong)] outline-none text-sm placeholder:text-[var(--text-2)]"
              />
              <button
                type="button"
                onClick={() => navigate("/search-advanced")}
                aria-label="Advanced search"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-md hover:bg-[var(--surface-2)] flex items-center justify-center"
              >
                <Sliders className="h-3.5 w-3.5 text-[var(--text-2)]" />
              </button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 md:gap-2 shrink-0 ml-auto">
              {/* Language */}
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setLangOpen(o => !o)}
                  aria-haspopup="menu"
                  aria-expanded={langOpen}
                  className="h-9 px-3 rounded-lg inline-flex items-center gap-1.5 text-xs hover:bg-[var(--surface)] text-[var(--text-2)]"
                >
                  <Globe className="h-4 w-4" /> {language.toUpperCase()} <ChevronDown className="h-3 w-3" />
                </button>
                {langOpen && (
                  <div role="menu" className="absolute right-0 mt-2 w-32 reos-card p-1 z-50 shadow-2xl">
                    {languages.map(l => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => { setLanguage(l.code); setLangOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-md text-[12px] hover:bg-[var(--surface-2)] ${language === l.code ? "reos-gold" : "text-[var(--text)]"}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="h-9 w-9 rounded-lg hover:bg-[var(--surface)] flex items-center justify-center"
              >
                {theme === "dark" ? <Sun className="h-4 w-4 text-[var(--text-2)]" /> : <Moon className="h-4 w-4 text-[var(--text-2)]" />}
              </button>

              <button
                type="button"
                onClick={() => navigate("/notifications")}
                aria-label="Notifications"
                className="h-9 w-9 rounded-lg hover:bg-[var(--surface)] flex items-center justify-center relative"
              >
                <Bell className="h-4 w-4 text-[var(--text-2)]" />
                <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-[var(--gold)] text-[10px] text-black font-bold flex items-center justify-center">3</span>
              </button>
              <button
                type="button"
                onClick={() => navigate("/favorites")}
                aria-label="Saved"
                className="h-9 w-9 rounded-lg hover:bg-[var(--surface)] flex items-center justify-center"
              >
                <Heart className="h-4 w-4 text-[var(--text-2)]" />
              </button>
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(o => !o)}
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                    className="h-9 pl-1.5 pr-3 rounded-full bg-[var(--surface)] border border-[var(--line)] flex items-center gap-2 hover:border-[var(--line-strong)]"
                  >
                    <div className="h-7 w-7 rounded-full reos-cta flex items-center justify-center text-[11px] font-bold">{(profile?.full_name || user.email || "U").charAt(0).toUpperCase()}</div>
                    <div className="leading-none hidden md:block">
                      <div className="text-[12px] font-medium truncate max-w-[120px] text-left">{profile?.full_name || user.email}</div>
                      <div className="text-[9px] reos-gold mt-0.5 text-left">Premium Investor</div>
                    </div>
                    <ChevronDown className="h-3 w-3 text-[var(--text-2)]" />
                  </button>
                  {profileOpen && (
                    <div role="menu" className="absolute right-0 mt-2 w-48 reos-card p-1 z-50 shadow-2xl">
                      <button type="button" onClick={() => { setProfileOpen(false); navigate("/profile"); }} className="w-full text-left px-3 py-2 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] inline-flex items-center gap-2"><User className="h-3.5 w-3.5" /> My Profile</button>
                      <button type="button" onClick={() => { setProfileOpen(false); navigate("/wallet"); }} className="w-full text-left px-3 py-2 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] inline-flex items-center gap-2"><Wallet className="h-3.5 w-3.5" /> Wallet</button>
                      <button type="button" onClick={() => { setProfileOpen(false); navigate("/favorites"); }} className="w-full text-left px-3 py-2 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] inline-flex items-center gap-2"><Heart className="h-3.5 w-3.5" /> Saved</button>
                      <div className="reos-divider my-1" />
                      <button type="button" onClick={async () => { setProfileOpen(false); await signOut(); }} className="w-full text-left px-3 py-2 rounded-md text-[12.5px] hover:bg-[var(--surface-2)] text-[var(--danger)] inline-flex items-center gap-2"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button type="button" onClick={() => { setAuthInitial("login"); setShowAuth(true); }} className="h-9 px-4 rounded-lg text-[12.5px] hover:bg-[var(--surface)] text-[var(--text)] transition">Sign in</button>
                  <button type="button" onClick={() => { setAuthInitial("register"); setShowAuth(true); }} className="h-9 px-4 rounded-lg reos-cta text-[12.5px] inline-flex items-center gap-1.5">
                    Get Started <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Top tab bar */}
          <div className="border-t border-[var(--line)]">
            <div className="mx-auto max-w-[1600px] px-6 h-[52px] flex items-center gap-8 overflow-x-auto reos-scrollbar">
              {topTabs.map(t => (
                <Link
                  key={t.label}
                  to={t.to}
                  className={`relative inline-flex items-center gap-2 text-[13px] whitespace-nowrap transition-colors ${t.active ? "reos-tab-active font-medium" : "text-[var(--text-2)] hover:text-[var(--text)]"}`}
                >
                  <t.icon className="h-4 w-4" /> {t.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

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
                    <img src="/astra-logo.png" alt="ASTRA Villa" className="h-8 w-8 rounded-full object-contain shadow-sm" />
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
                      {n.badge && <span className="text-[10px] bg-[var(--gold)] text-black font-bold px-1.5 py-0.5 rounded">{n.badge}</span>}
                    </Link>
                  ))}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>


        {/* ===================== LAYOUT ===================== */}
        <div className="mx-auto max-w-[1600px] px-6 py-6 flex gap-6">
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
                    {n.badge && <span className="text-[10px] bg-[var(--gold)] text-black font-bold px-1.5 py-0.5 rounded">{n.badge}</span>}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Investor club promo */}
            <div className="reos-card relative overflow-hidden p-5 text-center" style={{ background: "linear-gradient(180deg, #1a1408, #0e0a04)" }}>
              <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 50% 0%, var(--gold), transparent 60%)" }} />
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
                  <a key={a.n} href={a.href} target="_blank" rel="noopener noreferrer" className="w-full h-11 px-3 rounded-xl bg-black border border-[var(--line)] flex items-center gap-2 text-left hover:border-[var(--line-strong)] transition">
                    <div className="h-5 w-5 rounded reos-gold flex items-center justify-center">●</div>
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
          <main className="flex-1 min-w-0 space-y-6">

            {/* ===== HERO + MARKET OVERVIEW ===== */}
            <Section className="grid grid-cols-12 gap-5">
              {/* Hero */}
              <motion.div variants={fadeUp} className="col-span-12 lg:col-span-9 reos-card overflow-hidden relative min-h-[420px]">
                <img src={heroImg} alt="Luxury villa overlooking the ocean" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(110deg, rgba(11,11,12,0.92) 0%, rgba(11,11,12,0.55) 55%, transparent 100%)" }} />

                <div className="relative p-8 md:p-10 flex flex-col h-full">
                  <h1 className="text-4xl md:text-5xl font-semibold leading-[1.05] tracking-tight max-w-xl">
                    <span className="block">Southeast Asia's</span>
                    <span className="block"><span className="reos-gold">AI-Powered</span> Real Estate</span>
                    <span className="block">Operating System</span>
                  </h1>
                  <p className="mt-4 text-[15px] text-[var(--text-2)] max-w-md">Buy. Invest. Manage. Finance. Verify. Grow.</p>

                  {/* Search box */}
                  <motion.div variants={fadeUp} className="mt-8 max-w-xl">
                    <div className="reos-card-2 p-1.5 inline-flex gap-1 mb-2.5 bg-[var(--surface)]/80 backdrop-blur">
                      {searchTabs.map(t => (
                        <button key={t} onClick={() => setActiveSearchTab(t)}
                          className={`text-[12px] px-3 h-7 rounded-md transition ${activeSearchTab === t ? "bg-[var(--text)] text-black font-medium" : "text-[var(--text-2)] hover:text-[var(--text)]"}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                    <div className="reos-card-2 bg-[var(--surface)]/95 backdrop-blur p-1.5 flex items-center gap-2">
                      <Search className="h-4 w-4 text-[var(--text-2)] ml-2" />
                      <input
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") submitAi(); }}
                        placeholder="Search properties, locations, ROI, developers, laws…"
                        className="flex-1 bg-transparent outline-none text-sm placeholder:text-[var(--text-2)] py-2"
                      />
                      <button onClick={submitAi} disabled={aiLoading} className="h-9 px-4 rounded-lg reos-cta text-xs inline-flex items-center gap-1.5 disabled:opacity-60">
                        {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} AI Search
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {locationChips.map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => navigate(`/search?q=${encodeURIComponent(`Properties in ${c}`)}`)}
                          className="reos-chip text-[11px] px-3 py-1 rounded-full bg-[var(--surface)]/70 backdrop-blur"
                        >
                          {c}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => navigate("/search-advanced")}
                        className="reos-chip text-[11px] px-3 py-1 rounded-full bg-[var(--surface)]/70 backdrop-blur inline-flex items-center gap-1"
                      >
                        More <ChevronDown className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Market overview */}
              <motion.div variants={fadeUp} className="col-span-12 lg:col-span-3 reos-card p-5">
                <div className="flex items-center justify-between">
                  <div className="text-[14px] font-semibold">Market Overview</div>
                  <div className="relative" ref={countryRef}>
                    <button
                      type="button"
                      onClick={() => setCountryOpen(o => !o)}
                      className="text-[11px] text-[var(--text-2)] inline-flex items-center gap-1 hover:text-[var(--text)]"
                      aria-haspopup="menu"
                      aria-expanded={countryOpen}
                    >
                      {country} <ChevronDown className="h-3 w-3" />
                    </button>
                    {countryOpen && (
                      <div role="menu" className="absolute right-0 mt-2 w-40 reos-card p-1 z-30 shadow-2xl">
                        {countries.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => { setCountry(c); setCountryOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-md text-[12px] hover:bg-[var(--surface-2)] ${country === c ? "reos-gold" : "text-[var(--text)]"}`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {marketKPIs.map(k => (
                    <div key={k.label} className="grid grid-cols-[24px_1fr_90px] items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-[var(--gold-soft)] flex items-center justify-center">
                        <BarChart3 className="h-3.5 w-3.5 reos-gold" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] text-[var(--text-2)] truncate">{k.label}</div>
                        <div className="flex items-baseline gap-2">
                          <div className="text-[15px] font-semibold">{k.value}</div>
                          <div className="text-[10px] text-[var(--success)]">▲ {k.delta}</div>
                        </div>
                      </div>
                      <Spark seed={k.seed} color="#C8A96A" />
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/market-heatmap")}
                  className="mt-5 text-[12px] reos-gold inline-flex items-center gap-1 hover:underline"
                >
                  View Full Market Report <ArrowUpRight className="h-3 w-3" />
                </button>
              </motion.div>
            </Section>

            {/* ===== HUB CARDS ===== */}
            <Section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {hubs.map(h => (
                <motion.div key={h.title} variants={fadeUp} whileHover={{ y: -3 }}>
                  <Link to={h.to} className="block reos-card p-4 h-full hover:border-[var(--line-strong)] transition">
                    <div className="h-9 w-9 rounded-lg bg-[var(--gold-soft)] flex items-center justify-center mb-3">
                      <h.icon className="h-4.5 w-4.5 reos-gold" />
                    </div>
                    <div className="text-[13px] font-semibold whitespace-pre-line leading-tight">{h.title}</div>
                    <div className="mt-1.5 text-[11px] text-[var(--text-2)]">{h.desc}</div>
                  </Link>
                </motion.div>
              ))}
            </Section>

            {/* ===== FEATURED + HOTSPOTS + AI RECS ===== */}
            <div className="grid grid-cols-12 gap-5">
              {/* Featured Properties */}
              <Section className="col-span-12 lg:col-span-5 reos-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[14px] font-semibold">Featured Properties</div>
                  <Link to="/properties" className="text-[11px] reos-gold inline-flex items-center gap-1 hover:underline">View All <ArrowUpRight className="h-3 w-3" /></Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {featured.map((p: any) => {
                    const badgeColor: Record<string, string> = {
                      FEATURED: "bg-[var(--gold)] text-black",
                      NEW: "bg-[#3B82F6] text-white",
                      HOT: "bg-[#EF4444] text-white",
                      INVESTMENT: "bg-[#10B981] text-white",
                    };
                    const img = p.cover_image || p.images?.[0] || heroImg;
                    return (
                      <motion.div key={p.id} variants={fadeUp} whileHover={{ y: -3 }} className="reos-card-2 overflow-hidden group">
                        <Link to={`/properties/${p.slug ?? p.id}`}>
                          <div className="relative h-28 overflow-hidden">
                            <img src={img} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                            <span className={`absolute top-2 left-2 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded ${badgeColor[p._badge]}`}>{p._badge}</span>
                          </div>
                          <div className="p-3">
                            <div className="text-[10px] text-[var(--text-2)] truncate">{p.city || p.location}</div>
                            <div className="text-[12px] font-semibold leading-tight mt-0.5 line-clamp-1">{p.title}</div>
                            <div className="text-[10px] text-[var(--text-3)] capitalize">{p.type || "Property"}</div>
                            <div className="mt-2 flex items-baseline justify-between">
                              <div className="text-[12px] font-bold reos-gold">{formatIDR(Number(p.price))}</div>
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
                <div className="mt-4 flex justify-center gap-1.5">
                  {[0,1,2,3].map(i => <span key={i} className={`h-1.5 rounded-full transition-all ${i === 0 ? "w-5 bg-[var(--gold)]" : "w-1.5 bg-[var(--line-strong)]"}`} />)}
                </div>
              </Section>

              {/* Investment Hotspots */}
              <Section className="col-span-12 lg:col-span-4 reos-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[14px] font-semibold">Investment Hotspots</div>
                  <Link to="/market-heatmap" className="text-[11px] reos-gold inline-flex items-center gap-1 hover:underline">View All <ArrowUpRight className="h-3 w-3" /></Link>
                </div>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[var(--line)]" style={{ background: "radial-gradient(ellipse at 60% 60%, rgba(200,169,106,0.06), transparent 70%), #0a0a0c" }}>
                  <div className="absolute inset-0 origin-center transition-transform" style={{ transform: `scale(${hotspotZoom})` }}>
                    <svg viewBox="0 0 100 75" className="absolute inset-0 h-full w-full opacity-30">
                      <path d="M10,40 q15,-10 30,-5 q15,5 25,0 q10,-3 20,5 q5,8 -5,12 q-20,4 -40,2 q-25,-2 -30,-14z" fill="none" stroke="#C8A96A" strokeWidth="0.3" />
                      <path d="M45,55 q10,-3 18,2 q6,8 -4,12 q-12,2 -18,-4 q-4,-6 4,-10z" fill="none" stroke="#C8A96A" strokeWidth="0.3" />
                    </svg>
                    {hotspots.map(h => (
                      <button
                        key={h.city}
                        type="button"
                        onClick={() => navigate(`/invest/${h.slug}`)}
                        aria-label={`${h.city} investment hotspot`}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                        style={{ left: `${h.x}%`, top: `${h.y}%` }}
                      >
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-[var(--gold)] opacity-30 blur-md scale-150 group-hover:opacity-60" />
                          <div className="relative h-2.5 w-2.5 rounded-full bg-[var(--gold-2)] ring-2 ring-[var(--gold)]/40 group-hover:scale-125 transition-transform" />
                        </div>
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-left">
                          <div className="text-[10px] font-semibold">{h.city}</div>
                          <div className="text-[9px] reos-gold">ROI {h.roi}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="absolute bottom-2 left-2 flex flex-col gap-1 z-10">
                    <button type="button" onClick={() => setHotspotZoom(z => Math.min(2, +(z + 0.2).toFixed(2)))} aria-label="Zoom in" className="h-6 w-6 rounded bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center hover:border-[var(--line-strong)]"><Plus className="h-3 w-3" /></button>
                    <button type="button" onClick={() => setHotspotZoom(z => Math.max(0.6, +(z - 0.2).toFixed(2)))} aria-label="Zoom out" className="h-6 w-6 rounded bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center hover:border-[var(--line-strong)]"><Minus className="h-3 w-3" /></button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-[var(--text-2)]">
                  <span>Low ROI</span>
                  <div className="flex-1 mx-3 h-1.5 rounded-full" style={{ background: "linear-gradient(90deg, rgba(200,169,106,0.15), var(--gold))" }} />
                  <span>High ROI</span>
                </div>
              </Section>

              {/* AI Recommendation + Market Intelligence */}
              <div className="col-span-12 lg:col-span-3 space-y-5">
                <Section className="reos-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[13px] font-semibold">AI Recommendation</div>
                    <Link to="/ai-search" className="text-[10px] reos-gold inline-flex items-center gap-1">View All <ArrowUpRight className="h-3 w-3" /></Link>
                  </div>
                  <div className="space-y-3">
                    {aiRecs.map(r => (
                      <motion.div key={r.title} variants={fadeUp} className="flex items-center gap-3">
                        <div className="h-10 w-12 rounded-md overflow-hidden shrink-0">
                          <img src={heroImg} alt={r.city} className="h-full w-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-medium truncate">{r.title}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] reos-gold">ROI {r.roi}</span>
                            <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: `${r.color}20`, color: r.color }}>{r.tag}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </Section>

                <Section className="reos-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[13px] font-semibold">Market Intelligence</div>
                    <Link to="/market-heatmap" className="text-[10px] reos-gold inline-flex items-center gap-1">View All <ArrowUpRight className="h-3 w-3" /></Link>
                  </div>
                  <div className="space-y-2.5">
                    {marketReports.map(r => (
                      <motion.div key={r.title} variants={fadeUp} className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 reos-gold shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-medium truncate">{r.title}</div>
                        </div>
                        <div className="text-[10px] text-[var(--text-2)]">{r.date}</div>
                      </motion.div>
                    ))}
                  </div>
                </Section>
              </div>
            </div>

            {/* ===== BOTTOM STATS ===== */}
            <Section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "My Portfolio Value", value: "IDR 28.6 M", delta: "▲ 8.24%", chart: true },
                { label: "Total Investments", value: "7", sub: "Properties" },
                { label: "Average ROI", value: "15.6%", sub: "Per Year", chart: true },
                { label: "Total Rental Income", value: "IDR 245.8 M", delta: "▲ 12.3% This Year" },
                { label: "Active Tenants", value: "23", sub: "Tenants" },
              ].map(s => (
                <motion.div key={s.label} variants={fadeUp} className="reos-card p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] text-[var(--text-2)]">{s.label}</div>
                    <MoreHorizontal className="h-3.5 w-3.5 text-[var(--text-3)]" />
                  </div>
                  <div className="mt-2 text-[18px] font-semibold reos-gold">{s.value}</div>
                  {s.sub && <div className="text-[10px] text-[var(--text-2)] mt-0.5">{s.sub}</div>}
                  {s.delta && <div className="text-[10px] text-[var(--success)] mt-0.5">{s.delta}</div>}
                  {s.chart && <div className="mt-2"><Spark seed={Math.random() * 10} color="#C8A96A" /></div>}
                </motion.div>
              ))}

              {/* Generate report */}
              <motion.div variants={fadeUp} className="reos-card p-4 relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a1408, #0e0a04)" }}>
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full blur-2xl" style={{ background: "radial-gradient(circle, var(--gold), transparent 70%)" }} />
                <div className="relative">
                  <div className="text-[11px] font-semibold">Get AI Investment Report</div>
                  <div className="text-[10px] text-[var(--text-2)] mt-1 leading-tight">Personalized report based on your investment goals.</div>
                  <button
                    type="button"
                    onClick={() => user ? navigate("/wealth-advisor") : (setAuthInitial("login"), setShowAuth(true))}
                    className="mt-3 h-8 px-3 rounded-lg reos-cta text-[11px] inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="h-3 w-3" /> Generate Now
                  </button>
                </div>
              </motion.div>
            </Section>

            {/* ===== TRUSTED BY ===== */}
            <Section className="reos-card p-5">
              <div className="flex items-center flex-wrap gap-5 justify-between">
                <div className="text-[12px] text-[var(--text-2)]">Trusted By Thousands</div>
                <div className="flex items-center flex-wrap gap-x-7 gap-y-2">
                  {banks.map(b => (
                    <span key={b} className="text-[12px] font-bold tracking-wider text-[var(--text-2)]/70 hover:text-[var(--text)] transition">{b}</span>
                  ))}
                </div>
                <div className="flex items-center gap-5 text-[11px]">
                  {[
                    { icon: CheckCircle2, label: "Verified Properties", sub: "100% Verified" },
                    { icon: Shield, label: "Secure Transactions", sub: "Bank-Level Security" },
                    { icon: LifeBuoy, label: "Expert Support", sub: "24/7 Assistance" },
                  ].map(t => (
                    <div key={t.label} className="flex items-center gap-2">
                      <t.icon className="h-4 w-4 reos-gold" />
                      <div className="leading-tight">
                        <div className="text-[11px] font-medium">{t.label}</div>
                        <div className="text-[9px] text-[var(--text-2)]">{t.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <div className="text-center text-[11px] text-[var(--text-3)] py-6">
              © {new Date().getFullYear()} ASTRA Villa REOS · Built for ASEAN · Enterprise-grade
            </div>
          </main>
        </div>

        {/* ===== AI Results Sheet ===== */}
        <AnimatePresence>
          {showAiSheet && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
              onClick={() => { setShowAiSheet(false); resetAi(); }}>
              <motion.aside
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full md:w-[560px] h-full overflow-y-auto reos-scrollbar border-l border-[var(--line-strong)]"
                style={{ background: "var(--bg)" }}
              >
                <div className="sticky top-0 backdrop-blur-xl bg-[var(--bg)]/85 border-b border-[var(--line)] px-5 py-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 reos-gold" />
                    <span className="text-sm font-semibold tracking-wide">AI Investment Results</span>
                  </div>
                  <button onClick={() => { setShowAiSheet(false); resetAi(); }} className="h-8 w-8 rounded-md hover:bg-[var(--surface)] flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-2)]">Query</div>
                  <div className="reos-card p-3 text-sm">{aiQuery}</div>

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
                              <img src={r.cover_image || heroImg} alt={r.title} className="h-full w-full object-cover" />
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

