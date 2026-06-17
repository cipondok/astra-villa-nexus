import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, Bell, MessageSquare, Globe, Sun, Moon, User,
  LayoutDashboard, Building2, TrendingUp, Banknote, Scale,
  Wrench, Store, BarChart3, Crown, Sparkles, Settings as Cog,
  ArrowUpRight, ShieldCheck, MapPin, Cpu, Zap, ChevronRight,
  Activity, DollarSign, Eye, Star, Loader2, X,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from "recharts";
import heroImg from "@/assets/reos-hero.jpg";
import { useReosMarket, formatIDR } from "@/hooks/useReosMarket";
import { useReosAiSearch, type ReosAiResult } from "@/hooks/useReosAiSearch";

/* ============================================================
   ASTRA Villa — REOS Landing (motion + live data + AI search)
   ============================================================ */

const tokens = `
  .reos-root {
    --bg: #050505; --card: #0D0D0D; --card-2: #111111;
    --gold: #D4AF37; --gold-bright: #FFD700;
    --text: #FFFFFF; --text-2: #B8B8B8;
    --border: rgba(255,215,0,0.12); --border-strong: rgba(255,215,0,0.28);
    --success: #22C55E; --danger: #EF4444; --info: #3B82F6;
    --grid: rgba(255,255,255,0.04);
    color: var(--text); background: var(--bg);
    font-family: 'Inter', 'SF Pro Display', system-ui, sans-serif;
    font-feature-settings: 'ss01','cv11'; letter-spacing: -0.01em;
  }
  .reos-root.light {
    --bg: #F8F9FB; --card: #FFFFFF; --card-2: #FAFAFA;
    --gold: #B8941F; --gold-bright: #D4AF37;
    --text: #111111; --text-2: #666666;
    --border: #EAEAEA; --border-strong: rgba(184,148,31,0.35);
    --grid: rgba(0,0,0,0.04);
  }
  .reos-glass { background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01)); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1px solid var(--border); }
  .reos-root.light .reos-glass { background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7)); }
  .reos-card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; transition: transform .35s cubic-bezier(.2,.7,.2,1), border-color .35s, box-shadow .35s; }
  .reos-card:hover { border-color: var(--border-strong); transform: translateY(-3px); box-shadow: 0 24px 60px -28px rgba(212,175,55,0.35); }
  .reos-gold { color: var(--gold-bright); }
  .reos-grid-bg { background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px); background-size: 56px 56px; }
  .reos-pulse::after{ content:""; position:absolute; inset:-2px; border-radius:inherit; border:1px solid var(--gold); opacity:.0; animation: reos-pulse 2.4s ease-out infinite; }
  @keyframes reos-pulse { 0%{opacity:.6; transform:scale(1)} 100%{opacity:0; transform:scale(1.08)} }
  .reos-shine { background: linear-gradient(110deg, transparent 30%, rgba(255,215,0,0.18) 50%, transparent 70%); background-size: 200% 100%; animation: reos-shine 6s linear infinite; }
  @keyframes reos-shine { from{background-position:200% 0} to{background-position:-200% 0} }
  .reos-cta { background: linear-gradient(135deg, var(--gold), var(--gold-bright)); color: #0a0a0a; font-weight: 600; }
  .reos-cta:hover { filter: brightness(1.08); }
  .reos-outline { border: 1px solid var(--border-strong); color: var(--text); }
  .reos-scrollbar::-webkit-scrollbar{width:6px;height:6px}
  .reos-scrollbar::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:3px}
`;

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: Building2, label: "Properties" },
  { icon: TrendingUp, label: "Investment" },
  { icon: Banknote, label: "Finance" },
  { icon: Scale, label: "Legal" },
  { icon: Wrench, label: "Management" },
  { icon: Store, label: "Vendors" },
  { icon: BarChart3, label: "Market Intel" },
  { icon: Crown, label: "Investor Club" },
  { icon: Sparkles, label: "AI Center" },
  { icon: Cog, label: "Settings" },
];

const modules = [
  { icon: Building2, title: "Properties Marketplace", desc: "Villas, apartments, hotels, land", to: "/properties" },
  { icon: TrendingUp, title: "Investment Hub", desc: "Fractional & full-asset opportunities", to: "/investment" },
  { icon: Banknote, title: "Finance Hub", desc: "Mortgages, KPR, escrow, insurance", to: "/finance" },
  { icon: Scale, title: "Legal Hub", desc: "Due diligence, PMA, compliance", to: "/legal" },
  { icon: Wrench, title: "Property Management", desc: "Occupancy, rent, maintenance", to: "/management" },
  { icon: Cpu, title: "AI Advisor", desc: "Investment intelligence on demand", to: "/ai" },
  { icon: Store, title: "Vendor Marketplace", desc: "Verified architects & contractors", to: "/vendors" },
  { icon: BarChart3, title: "Data Intelligence", desc: "Price, yield, demand, sentiment", to: "/intelligence" },
];

/* ---------- motion presets ---------- */
const fadeUp: any = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger: any = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/* ---------- atoms ---------- */
const Stat = ({ label, value, delta, positive = true }: { label: string; value: string; delta?: string; positive?: boolean }) => (
  <motion.div variants={fadeUp} className="reos-card p-4">
    <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-2)]">{label}</div>
    <div className="mt-2 flex items-baseline justify-between">
      <div className="text-2xl font-semibold">{value}</div>
      {delta && (
        <div className={`text-xs font-medium ${positive ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
          {positive ? "▲" : "▼"} {delta}
        </div>
      )}
    </div>
  </motion.div>
);

const Section = ({ children, className = "" }: any) => (
  <motion.section
    initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
    variants={stagger} className={className}
  >
    {children}
  </motion.section>
);

/* ---------- page ---------- */
export default function AstraReosHome() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [aiQuery, setAiQuery] = useState("");
  const [showAiSheet, setShowAiSheet] = useState(false);
  const { data: market, loading: marketLoading } = useReosMarket();
  const { search, data: aiData, loading: aiLoading, error: aiError, reset: resetAi } = useReosAiSearch();

  useEffect(() => {
    document.title = "ASTRA Villa — Southeast Asia's AI Real Estate Operating System";
  }, []);

  // Hero parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroImgY = useTransform(scrollY, [0, 600], [0, 140]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.55]);

  const trendData = useMemo(() => {
    if (!market?.trend?.length) {
      return Array.from({ length: 12 }, (_, i) => ({ i, v: 100 + Math.sin(i / 2) * 6 + i * 0.8 }));
    }
    return market.trend.map(t => ({ i: t.i, v: t.listings || 1, price: t.avg_price }));
  }, [market]);

  const cityCards = useMemo(() => {
    if (!market?.by_city?.length) {
      return [
        { city: "Bali", active_listings: 0, avg_yield: 8.4, avg_roi: 14.2 },
        { city: "Jakarta", active_listings: 0, avg_yield: 6.1, avg_roi: 9.4 },
        { city: "Lombok", active_listings: 0, avg_yield: 9.2, avg_roi: 15.6 },
        { city: "Batam", active_listings: 0, avg_yield: 7.0, avg_roi: 10.1 },
      ];
    }
    return market.by_city.slice(0, 8);
  }, [market]);

  const submitAi = async () => {
    if (!aiQuery.trim()) return;
    setShowAiSheet(true);
    await search(aiQuery);
  };

  return (
    <>
      <style>{tokens}</style>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
        className={`reos-root ${theme === "light" ? "light" : ""} min-h-screen`}
      >
        {/* HEADER */}
        <header className="sticky top-0 z-40 reos-glass border-b border-[var(--border)]">
          <div className="mx-auto max-w-[1600px] px-5 h-16 flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg reos-cta flex items-center justify-center">
                <span className="text-[13px] font-bold">A</span>
              </div>
              <span className="font-semibold tracking-[0.2em] text-sm">ASTRA VILLA</span>
              <span className="text-[10px] uppercase tracking-[0.2em] reos-gold ml-1">REOS</span>
            </Link>
            <div className="flex-1 max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-2)]" />
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submitAi(); }}
                placeholder="Search properties, ROI, developers, laws, vendors, opportunities…"
                className="w-full h-10 pl-9 pr-20 rounded-xl bg-transparent border border-[var(--border)] focus:border-[var(--border-strong)] outline-none text-sm placeholder:text-[var(--text-2)]"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.18em] reos-gold border border-[var(--border-strong)] px-2 py-1 rounded-md">AI · ⌘K</span>
            </div>
            <div className="flex items-center gap-1">
              <button className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-[var(--card-2)]"><Bell className="h-4 w-4" /></button>
              <button className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-[var(--card-2)]"><MessageSquare className="h-4 w-4" /></button>
              <button className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-[var(--card-2)]"><Globe className="h-4 w-4" /></button>
              <button onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-[var(--card-2)]">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <div className="h-9 w-9 rounded-full reos-glass flex items-center justify-center ml-1"><User className="h-4 w-4" /></div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1600px] flex">
          {/* SIDEBAR */}
          <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-[var(--border)] min-h-[calc(100vh-64px)] sticky top-16 self-start">
            <nav className="p-3 space-y-1">
              {sidebarItems.map((it, idx) => (
                <motion.button
                  key={it.label}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * idx, duration: 0.4 }}
                  whileHover={{ x: 3 }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${idx === 0 ? "bg-[var(--card-2)] reos-gold" : "text-[var(--text-2)] hover:bg-[var(--card-2)] hover:text-[var(--text)]"}`}
                >
                  <it.icon className="h-4 w-4" />
                  <span>{it.label}</span>
                </motion.button>
              ))}
            </nav>
            <div className="mt-auto p-4">
              <motion.div whileHover={{ y: -2 }} className="reos-card p-4">
                <div className="flex items-center gap-2 text-xs reos-gold"><Crown className="h-3.5 w-3.5" /> Investor Club</div>
                <div className="mt-1 text-sm">Unlock Platinum reports</div>
                <button className="mt-3 w-full h-8 text-xs reos-cta rounded-md">Upgrade</button>
              </motion.div>
            </div>
          </aside>

          {/* MAIN */}
          <main className="flex-1 min-w-0">
            {/* HERO */}
            <section ref={heroRef} className="relative overflow-hidden">
              <motion.img
                src={heroImg} alt="Luxury villa overlooking the ocean at sunset"
                width={1920} height={1080}
                style={{ y: heroImgY, opacity: heroOpacity }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.85) 60%, var(--bg) 100%)" }} />
              <div className="relative px-6 md:px-10 pt-20 pb-28">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full reos-glass text-[11px] uppercase tracking-[0.22em]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                    Live · ASEAN Real Estate Operating System
                  </div>
                  <h1 className="mt-6 text-5xl md:text-7xl font-bold leading-[1.02] tracking-tight max-w-4xl">
                    <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.7 }} className="block">Southeast Asia's</motion.span>
                    <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }} className="block reos-gold">AI-Powered Real Estate</motion.span>
                    <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }} className="block">Operating System</motion.span>
                  </h1>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-lg text-[var(--text-2)] max-w-2xl">
                    Buy. Invest. Manage. Finance. Verify. Grow. One terminal for property, capital and intelligence across the region.
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 flex flex-wrap gap-3">
                    <Link to="/properties" className="h-12 px-6 rounded-xl reos-cta inline-flex items-center gap-2 text-sm transition-transform hover:-translate-y-0.5">
                      Explore Properties <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link to="/investment" className="h-12 px-6 rounded-xl reos-outline inline-flex items-center gap-2 text-sm hover:bg-[var(--card-2)] transition">
                      <TrendingUp className="h-4 w-4" /> Start Investing
                    </Link>
                    <button onClick={() => { setAiQuery("Best ROI villas in Bali under $1M"); setShowAiSheet(true); search("Best ROI villas in Bali under $1M"); }}
                      className="h-12 px-6 rounded-xl reos-outline inline-flex items-center gap-2 text-sm hover:bg-[var(--card-2)] transition">
                      <Sparkles className="h-4 w-4 reos-gold" /> AI Investment Advisor
                    </button>
                  </motion.div>
                </motion.div>

                <motion.div initial="hidden" animate="show" variants={stagger}
                  className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
                  <Stat label="Active Listings" value={marketLoading ? "…" : (market?.totals.active_listings ?? 0).toLocaleString("id-ID")} delta="live" />
                  <Stat label="Avg Yield" value={marketLoading ? "…" : `${market?.totals.avg_yield ?? 0}%`} delta="+0.6%" />
                  <Stat label="Avg ROI" value={marketLoading ? "…" : `${market?.totals.avg_roi ?? 0}%`} delta="+1.2%" />
                  <Stat label="Avg Price" value={marketLoading ? "…" : formatIDR(market?.totals.avg_price_idr ?? 0)} delta="+4.2%" />
                </motion.div>
              </div>
            </section>

            {/* AI COMMAND CENTER */}
            <Section className="px-6 md:px-10 -mt-12 relative z-10">
              <motion.div variants={fadeUp} className="reos-card p-6 md:p-8 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 reos-shine h-px" />
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-xl reos-cta flex items-center justify-center reos-pulse">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] reos-gold">AI Command Center</div>
                      <div className="text-lg font-semibold">Ask anything about property, capital, or markets</div>
                    </div>
                  </div>
                  <div className="text-xs text-[var(--text-2)] flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 reos-gold" /> Live · ASEAN data
                  </div>
                </div>

                <div className="mt-5 relative">
                  <textarea
                    rows={3}
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submitAi(); }}
                    placeholder="e.g. Show me Bali villas under Rp 5M with ROI above 12% near Canggu."
                    className="w-full p-4 pr-32 rounded-xl bg-[var(--card-2)] border border-[var(--border)] focus:border-[var(--border-strong)] outline-none text-sm placeholder:text-[var(--text-2)] resize-none"
                  />
                  <button
                    onClick={submitAi}
                    disabled={aiLoading || !aiQuery.trim()}
                    className="absolute bottom-3 right-3 h-9 px-4 rounded-lg reos-cta text-xs inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    {aiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
                    {aiLoading ? "Thinking…" : "Ask AI"}
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {[
                    "Top ROI properties in Bali",
                    "Houses under Rp 1M with high yield",
                    "Commercial in Jakarta with strong demand",
                    "Beachfront listings best for rental",
                    "Most liquid properties this month",
                  ].map(s => (
                    <button key={s} onClick={() => { setAiQuery(s); setShowAiSheet(true); search(s); }}
                      className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-2)] hover:text-[var(--gold-bright)] hover:border-[var(--border-strong)] transition">
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            </Section>

            {/* LIVE MARKET OVERVIEW */}
            <Section className="px-6 md:px-10 mt-12">
              <motion.div variants={fadeUp} className="flex items-end justify-between mb-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] reos-gold">Live Market</div>
                  <h2 className="text-2xl md:text-3xl font-semibold mt-1">ASEAN Property Intelligence</h2>
                </div>
                <Link to="/intelligence" className="text-xs text-[var(--text-2)] hover:reos-gold inline-flex items-center gap-1">
                  Open terminal <ArrowUpRight className="h-3 w-3" />
                </Link>
              </motion.div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <motion.div variants={fadeUp} className="reos-card p-5 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--text-2)] uppercase tracking-[0.18em]">Listing Velocity (12-week)</div>
                      <div className="text-3xl font-semibold mt-1">
                        {marketLoading ? "…" : (market?.totals.active_listings ?? 0).toLocaleString("id-ID")}{" "}
                        <span className="text-sm text-[var(--success)]">active</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-2)]">
                      <span className="px-2 py-1 rounded-md border border-[var(--border)]">1W</span>
                      <span className="px-2 py-1 rounded-md reos-gold border border-[var(--border-strong)]">12W</span>
                      <span className="px-2 py-1 rounded-md border border-[var(--border)]">1Y</span>
                    </div>
                  </div>
                  <div className="h-56 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FFD700" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#FFD700" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="i" hide />
                        <YAxis hide domain={["dataMin", "dataMax+2"]} />
                        <Tooltip contentStyle={{ background: "#0D0D0D", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="v" stroke="#FFD700" strokeWidth={2} fill="url(#gd)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                <motion.div variants={fadeUp} className="space-y-4">
                  <div className="reos-card p-5">
                    <div className="text-xs text-[var(--text-2)] uppercase tracking-[0.18em]">Average Rental Yield</div>
                    <div className="text-2xl font-semibold mt-1">{marketLoading ? "…" : `${market?.totals.avg_yield ?? 0}%`}</div>
                    <div className="h-20 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <Line type="monotone" dataKey="v" stroke="#22C55E" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="reos-card p-5">
                    <div className="text-xs text-[var(--text-2)] uppercase tracking-[0.18em]">Top Cities by Inventory</div>
                    <div className="mt-3 space-y-2">
                      {cityCards.slice(0, 4).map(c => {
                        const max = Math.max(...cityCards.map(x => x.active_listings)) || 1;
                        const pct = Math.round((c.active_listings / max) * 100);
                        return (
                          <div key={c.city}>
                            <div className="flex justify-between text-[11px] text-[var(--text-2)]">
                              <span>{c.city}</span><span>{c.active_listings.toLocaleString("id-ID")}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-[var(--card-2)] overflow-hidden">
                              <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full reos-cta" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>
            </Section>

            {/* ECOSYSTEM MODULES */}
            <Section className="px-6 md:px-10 mt-16">
              <motion.div variants={fadeUp}>
                <div className="text-xs uppercase tracking-[0.22em] reos-gold">Operating System</div>
                <h2 className="text-2xl md:text-3xl font-semibold mt-1">Eight modules. One terminal.</h2>
              </motion.div>
              <motion.div variants={stagger} className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {modules.map(m => (
                  <motion.div key={m.title} variants={fadeUp} whileHover={{ y: -4 }}>
                    <Link to={m.to} className="block reos-card p-5 h-full group relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 60%)" }} />
                      <div className="flex items-start justify-between">
                        <div className="h-11 w-11 rounded-xl reos-glass flex items-center justify-center">
                          <m.icon className="h-5 w-5 reos-gold" />
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-[var(--text-2)] group-hover:reos-gold transition-colors" />
                      </div>
                      <div className="mt-4 text-base font-semibold">{m.title}</div>
                      <div className="mt-1 text-sm text-[var(--text-2)]">{m.desc}</div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </Section>

            {/* FEATURED PROPERTIES (live) */}
            <Section className="px-6 md:px-10 mt-16">
              <motion.div variants={fadeUp} className="flex items-end justify-between mb-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] reos-gold">Featured</div>
                  <h2 className="text-2xl md:text-3xl font-semibold mt-1">Live Investment Properties</h2>
                </div>
                <Link to="/properties" className="text-xs text-[var(--text-2)] hover:reos-gold inline-flex items-center gap-1">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Link>
              </motion.div>
              <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(market?.featured ?? []).map((p: any) => {
                  const img = p.cover_image || p.images?.[0] || heroImg;
                  return (
                    <motion.div key={p.id} variants={fadeUp} whileHover={{ y: -4 }} className="reos-card overflow-hidden group">
                      <Link to={`/property/${p.slug ?? p.id}`}>
                        <div className="relative h-44 overflow-hidden">
                          <img src={img} alt={p.title} loading="lazy" width={800} height={600}
                            className="h-full w-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 flex gap-1.5">
                            <span className="text-[10px] uppercase tracking-[0.15em] px-2 py-1 rounded-md reos-glass inline-flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3 reos-gold" /> Verified
                            </span>
                          </div>
                          {p.investment_score != null && (
                            <div className="absolute top-3 right-3 text-[10px] reos-glass px-2 py-1 rounded-md inline-flex items-center gap-1">
                              <Star className="h-3 w-3 reos-gold" /> {Math.round(Number(p.investment_score))}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex items-center text-xs text-[var(--text-2)] gap-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{p.city || p.location}</span>
                          </div>
                          <div className="mt-1 font-semibold line-clamp-1">{p.title}</div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-lg font-semibold reos-gold">{formatIDR(Number(p.price))}</div>
                            <div className="text-right text-[11px] text-[var(--text-2)]">
                              {p.roi_percentage != null && <>ROI <span className="text-[var(--success)] font-medium">{Number(p.roi_percentage).toFixed(1)}%</span></>}
                              {p.rental_yield_percentage != null && <> · Yield <span className="font-medium">{Number(p.rental_yield_percentage).toFixed(1)}%</span></>}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
                {!marketLoading && !(market?.featured?.length) && (
                  <div className="col-span-full text-sm text-[var(--text-2)] text-center py-8">No featured properties yet.</div>
                )}
              </motion.div>
            </Section>

            {/* ASEAN HEATMAP (real city aggregates) */}
            <Section className="px-6 md:px-10 mt-16">
              <motion.div variants={fadeUp} className="reos-card p-6 md:p-8 relative overflow-hidden reos-grid-bg">
                <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] reos-gold">ASEAN Network</div>
                    <h2 className="text-2xl md:text-3xl font-semibold mt-1">Regional Yield & Inventory Heatmap</h2>
                  </div>
                  <div className="text-xs text-[var(--text-2)] flex items-center gap-3">
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--gold-bright)]" /> Yield</span>
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--success)] " /> Listings</span>
                  </div>
                </div>
                <motion.div variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {cityCards.map(c => (
                    <motion.div key={c.city} variants={fadeUp} whileHover={{ y: -3 }} className="reos-glass rounded-xl p-4 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="font-medium truncate">{c.city}</div>
                        <MapPin className="h-3.5 w-3.5 reos-gold shrink-0" />
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <div className="text-2xl font-semibold reos-gold">{c.avg_yield || 0}%</div>
                        <div className="text-[11px] text-[var(--text-2)]">avg yield</div>
                      </div>
                      <div className="mt-1 text-xs text-[var(--success)]">{c.active_listings.toLocaleString("id-ID")} listings</div>
                      <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl"
                        style={{ background: "radial-gradient(circle, rgba(212,175,55,0.35), transparent 70%)" }} />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            </Section>

            {/* INVESTOR CLUB */}
            <Section className="px-6 md:px-10 mt-16">
              <motion.div variants={fadeUp}>
                <div className="text-xs uppercase tracking-[0.22em] reos-gold">Investor Club</div>
                <h2 className="text-2xl md:text-3xl font-semibold mt-1">Private access. Institutional intelligence.</h2>
              </motion.div>
              <motion.div variants={stagger} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { tier: "Silver", price: "$99/mo", perks: ["Weekly market reports", "Standard alerts", "Email support"] },
                  { tier: "Gold", price: "$299/mo", perks: ["Daily intelligence briefings", "Exclusive deals", "Dedicated advisor"], featured: true },
                  { tier: "Platinum", price: "$999/mo", perks: ["Private deal flow", "VIP property tours", "Bespoke wealth planning"] },
                ].map(t => (
                  <motion.div key={t.tier} variants={fadeUp} whileHover={{ y: -4 }} className={`reos-card p-6 relative ${t.featured ? "ring-1 ring-[var(--gold-bright)]" : ""}`}>
                    {t.featured && <div className="absolute -top-3 left-6 text-[10px] uppercase tracking-[0.2em] reos-cta px-2 py-1 rounded-md">Most Popular</div>}
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 reos-gold" />
                      <span className="text-sm uppercase tracking-[0.18em]">{t.tier}</span>
                    </div>
                    <div className="mt-3 text-3xl font-semibold">{t.price}</div>
                    <ul className="mt-5 space-y-2 text-sm text-[var(--text-2)]">
                      {t.perks.map(p => <li key={p} className="flex items-center gap-2"><Eye className="h-3.5 w-3.5 reos-gold" />{p}</li>)}
                    </ul>
                    <button className={`mt-6 w-full h-11 rounded-xl text-sm transition ${t.featured ? "reos-cta" : "reos-outline hover:bg-[var(--card-2)]"}`}>
                      Join {t.tier}
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            </Section>

            {/* FOOTER */}
            <footer className="mt-20 border-t border-[var(--border)]">
              <div className="px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
                <div className="col-span-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg reos-cta flex items-center justify-center"><span className="text-[13px] font-bold">A</span></div>
                    <span className="font-semibold tracking-[0.2em]">ASTRA VILLA</span>
                  </div>
                  <p className="mt-3 text-[var(--text-2)] max-w-sm">
                    Southeast Asia's AI-powered Real Estate Operating System. Buy. Invest. Manage. Finance. Verify. Grow.
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-2)]">
                    <DollarSign className="h-3 w-3 reos-gold" />
                    {market?.totals.active_listings ?? 0} listings · {market?.totals.investors_tracked ?? 0} investors
                  </div>
                </div>
                {[
                  { h: "Platform", l: ["Properties", "Investment", "Finance", "Legal"] },
                  { h: "Company", l: ["About", "Investors", "Careers", "Contact"] },
                  { h: "Legal", l: ["Privacy", "Terms", "Compliance", "Security"] },
                ].map(c => (
                  <div key={c.h}>
                    <div className="text-xs uppercase tracking-[0.22em] reos-gold mb-3">{c.h}</div>
                    <ul className="space-y-2 text-[var(--text-2)]">
                      {c.l.map(i => <li key={i}><a href="#" className="hover:text-[var(--text)] transition">{i}</a></li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="px-6 md:px-10 py-5 border-t border-[var(--border)] text-xs text-[var(--text-2)] flex flex-wrap items-center justify-between gap-3">
                <div>© {new Date().getFullYear()} ASTRA Villa REOS. All rights reserved.</div>
                <div className="flex items-center gap-3">
                  <span>Built for ASEAN</span>
                  <span className="reos-gold">●</span>
                  <span>Enterprise-grade · SOC2 ready</span>
                </div>
              </div>
            </footer>
          </main>
        </div>

        {/* AI RESULTS SHEET */}
        <AnimatePresence>
          {showAiSheet && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
              onClick={() => { setShowAiSheet(false); resetAi(); }}
            >
              <motion.aside
                initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 280, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full md:w-[560px] h-full reos-glass border-l border-[var(--border-strong)] overflow-y-auto reos-scrollbar"
                style={{ background: "var(--bg)" }}
              >
                <div className="sticky top-0 reos-glass border-b border-[var(--border)] px-5 py-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 reos-gold" />
                    <span className="text-sm font-semibold tracking-wide">AI Investment Results</span>
                  </div>
                  <button onClick={() => { setShowAiSheet(false); resetAi(); }} className="h-8 w-8 rounded-md hover:bg-[var(--card-2)] flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="text-xs uppercase tracking-[0.2em] text-[var(--text-2)]">Query</div>
                  <div className="reos-card p-3 text-sm">{aiQuery}</div>

                  {aiLoading && (
                    <div className="reos-card p-6 flex items-center gap-3 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin reos-gold" />
                      Scoring properties with AI…
                    </div>
                  )}

                  {aiError && (
                    <div className="reos-card p-4 text-sm text-[var(--danger)]">{aiError}</div>
                  )}

                  {aiData && !aiLoading && (
                    <>
                      {aiData.insight && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="reos-card p-4">
                          <div className="text-xs uppercase tracking-[0.2em] reos-gold mb-2">AI Insight</div>
                          <div className="text-sm leading-relaxed">{aiData.insight}</div>
                        </motion.div>
                      )}
                      <div className="text-xs text-[var(--text-2)]">
                        {aiData.results.length} ranked · {aiData.total_pool} candidates analyzed
                      </div>
                      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-3">
                        {aiData.results.map((r: ReosAiResult) => {
                          const img = r.cover_image || r.images?.[0] || heroImg;
                          return (
                            <motion.div key={r.id} variants={fadeUp}>
                              <Link to={`/property/${r.slug ?? r.id}`} className="reos-card p-3 flex gap-3 hover:border-[var(--border-strong)]">
                                <img src={img} alt={r.title} className="h-20 w-28 rounded-lg object-cover shrink-0" loading="lazy" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold truncate">{r.title}</div>
                                    <div className="text-[10px] uppercase tracking-[0.15em] reos-cta px-2 py-0.5 rounded-md shrink-0">
                                      AI {r.ai_score}
                                    </div>
                                  </div>
                                  <div className="text-xs text-[var(--text-2)] truncate">{r.city} · {r.property_type}</div>
                                  <div className="mt-1 flex items-center justify-between text-[11px]">
                                    <span className="reos-gold font-semibold">{formatIDR(Number(r.price))}</span>
                                    <span className="text-[var(--text-2)]">
                                      {r.rental_yield_percentage != null && <>Yield {Number(r.rental_yield_percentage).toFixed(1)}%</>}
                                      {r.roi_percentage != null && <> · ROI {Number(r.roi_percentage).toFixed(1)}%</>}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-[11px] text-[var(--text-2)] line-clamp-2">{r.ai_reason}</div>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                        {!aiData.results.length && (
                          <div className="reos-card p-4 text-sm text-[var(--text-2)]">No properties matched. Try broadening your query.</div>
                        )}
                      </motion.div>
                    </>
                  )}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
