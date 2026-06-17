import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search, Bell, MessageSquare, Globe, Sun, Moon, User,
  LayoutDashboard, Building2, TrendingUp, Banknote, Scale,
  Wrench, Store, BarChart3, Crown, Sparkles, Settings as Cog,
  ArrowUpRight, ShieldCheck, MapPin, Cpu, Zap, ChevronRight,
  Activity, DollarSign, Eye, Star,
} from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from "recharts";
import heroImg from "@/assets/reos-hero.jpg";

/* ============================================================
   ASTRA Villa — REOS Landing
   Scoped luxury design system (dark-first + light mode)
   ============================================================ */

const tokens = `
  .reos-root {
    --bg: #050505;
    --card: #0D0D0D;
    --card-2: #111111;
    --gold: #D4AF37;
    --gold-bright: #FFD700;
    --text: #FFFFFF;
    --text-2: #B8B8B8;
    --border: rgba(255,215,0,0.12);
    --border-strong: rgba(255,215,0,0.28);
    --success: #22C55E;
    --danger: #EF4444;
    --info: #3B82F6;
    --grid: rgba(255,255,255,0.04);
    color: var(--text);
    background: var(--bg);
    font-family: 'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif;
    font-feature-settings: 'ss01','cv11';
    letter-spacing: -0.01em;
  }
  .reos-root.light {
    --bg: #F8F9FB;
    --card: #FFFFFF;
    --card-2: #FAFAFA;
    --gold: #B8941F;
    --gold-bright: #D4AF37;
    --text: #111111;
    --text-2: #666666;
    --border: #EAEAEA;
    --border-strong: rgba(184,148,31,0.35);
    --grid: rgba(0,0,0,0.04);
  }
  .reos-glass {
    background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid var(--border);
  }
  .reos-root.light .reos-glass {
    background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7));
  }
  .reos-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 16px;
    transition: transform .3s ease, border-color .3s ease, box-shadow .3s ease;
  }
  .reos-card:hover {
    border-color: var(--border-strong);
    transform: translateY(-2px);
    box-shadow: 0 24px 60px -28px rgba(212,175,55,0.35);
  }
  .reos-gold { color: var(--gold-bright); }
  .reos-grid-bg {
    background-image:
      linear-gradient(var(--grid) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid) 1px, transparent 1px);
    background-size: 56px 56px;
  }
  .reos-divider { height:1px; background: linear-gradient(90deg, transparent, var(--border-strong), transparent); }
  .reos-pulse::after{
    content:""; position:absolute; inset:-2px; border-radius:inherit;
    border:1px solid var(--gold); opacity:.0; animation: reos-pulse 2.4s ease-out infinite;
  }
  @keyframes reos-pulse {
    0%{opacity:.6; transform:scale(1)}
    100%{opacity:0; transform:scale(1.08)}
  }
  .reos-shine {
    background: linear-gradient(110deg, transparent 30%, rgba(255,215,0,0.18) 50%, transparent 70%);
    background-size: 200% 100%;
    animation: reos-shine 6s linear infinite;
  }
  @keyframes reos-shine { from{background-position:200% 0} to{background-position:-200% 0} }
  .reos-cta {
    background: linear-gradient(135deg, var(--gold), var(--gold-bright));
    color: #0a0a0a; font-weight: 600;
  }
  .reos-cta:hover { filter: brightness(1.08); }
  .reos-outline {
    border: 1px solid var(--border-strong);
    color: var(--text);
  }
`;

/* ---------- mini data ---------- */
const indexSeries = Array.from({ length: 24 }, (_, i) => ({
  i, v: 100 + Math.sin(i / 2) * 6 + i * 0.9 + (i % 3),
}));
const yieldSeries = Array.from({ length: 24 }, (_, i) => ({
  i, v: 6 + Math.cos(i / 3) * 1.2 + i * 0.05,
}));

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

const properties = [
  { city: "Uluwatu, Bali", type: "Cliffside Villa", price: "$2.4M", roi: 14.2, yld: 9.1, score: 94 },
  { city: "Canggu, Bali", type: "Modern Villa", price: "$890K", roi: 12.8, yld: 8.4, score: 91 },
  { city: "Seminyak, Bali", type: "Luxury Apartment", price: "$420K", roi: 11.5, yld: 7.8, score: 88 },
  { city: "Lombok", type: "Beachfront Resort", price: "$5.1M", roi: 15.6, yld: 10.2, score: 96 },
];

const markets = [
  { name: "Bali", roi: 14.2, growth: 18 },
  { name: "Jakarta", roi: 9.4, growth: 11 },
  { name: "Lombok", roi: 15.6, growth: 22 },
  { name: "Batam", roi: 10.1, growth: 14 },
  { name: "Phuket", roi: 12.8, growth: 16 },
  { name: "KL", roi: 8.6, growth: 9 },
  { name: "Singapore", roi: 5.2, growth: 6 },
  { name: "Vietnam", roi: 11.2, growth: 17 },
];

/* ---------- atoms ---------- */
const Stat = ({ label, value, delta, positive = true }: { label: string; value: string; delta: string; positive?: boolean }) => (
  <div className="reos-card p-4">
    <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--text-2)]">{label}</div>
    <div className="mt-2 flex items-baseline justify-between">
      <div className="text-2xl font-semibold">{value}</div>
      <div className={`text-xs font-medium ${positive ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
        {positive ? "▲" : "▼"} {delta}
      </div>
    </div>
  </div>
);

const ModuleCard = ({ icon: Icon, title, desc, to }: any) => (
  <Link to={to}>
    <motion.div
      whileHover={{ y: -4 }}
      className="reos-card p-5 h-full group relative overflow-hidden"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"
           style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 60%)" }} />
      <div className="flex items-start justify-between">
        <div className="h-11 w-11 rounded-xl reos-glass flex items-center justify-center">
          <Icon className="h-5 w-5 reos-gold" />
        </div>
        <ArrowUpRight className="h-4 w-4 text-[var(--text-2)] group-hover:reos-gold transition-colors" />
      </div>
      <div className="mt-4 text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm text-[var(--text-2)]">{desc}</div>
    </motion.div>
  </Link>
);

/* ---------- page ---------- */
export default function AstraReosHome() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [aiQuery, setAiQuery] = useState("");
  useEffect(() => { document.title = "ASTRA Villa — Southeast Asia's AI Real Estate Operating System"; }, []);

  return (
    <>
      <style>{tokens}</style>
      <div className={`reos-root ${theme === "light" ? "light" : ""} min-h-screen`}>
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
                <button key={it.label}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${idx === 0 ? "bg-[var(--card-2)] reos-gold" : "text-[var(--text-2)] hover:bg-[var(--card-2)] hover:text-[var(--text)]"}`}>
                  <it.icon className="h-4 w-4" />
                  <span>{it.label}</span>
                </button>
              ))}
            </nav>
            <div className="mt-auto p-4">
              <div className="reos-card p-4">
                <div className="flex items-center gap-2 text-xs reos-gold"><Crown className="h-3.5 w-3.5" /> Investor Club</div>
                <div className="mt-1 text-sm">Unlock Platinum reports</div>
                <button className="mt-3 w-full h-8 text-xs reos-cta rounded-md">Upgrade</button>
              </div>
            </div>
          </aside>

          {/* MAIN */}
          <main className="flex-1 min-w-0">
            {/* HERO */}
            <section className="relative overflow-hidden">
              <img src={heroImg} alt="Luxury villa overlooking the ocean at sunset" width={1920} height={1080}
                   className="absolute inset-0 w-full h-full object-cover opacity-70" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0.85) 60%, var(--bg) 100%)" }} />
              <div className="relative px-6 md:px-10 pt-20 pb-28">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full reos-glass text-[11px] uppercase tracking-[0.22em]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-pulse" />
                    Live · ASEAN Real Estate Operating System
                  </div>
                  <h1 className="mt-6 text-5xl md:text-7xl font-bold leading-[1.02] tracking-tight max-w-4xl">
                    Southeast Asia's<br />
                    <span className="reos-gold">AI-Powered Real Estate</span><br />
                    Operating System
                  </h1>
                  <p className="mt-6 text-lg text-[var(--text-2)] max-w-2xl">
                    Buy. Invest. Manage. Finance. Verify. Grow. One terminal for property,
                    capital and intelligence across the region.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to="/properties" className="h-12 px-6 rounded-xl reos-cta inline-flex items-center gap-2 text-sm">
                      Explore Properties <ChevronRight className="h-4 w-4" />
                    </Link>
                    <Link to="/investment" className="h-12 px-6 rounded-xl reos-outline inline-flex items-center gap-2 text-sm hover:bg-[var(--card-2)]">
                      <TrendingUp className="h-4 w-4" /> Start Investing
                    </Link>
                    <Link to="/ai" className="h-12 px-6 rounded-xl reos-outline inline-flex items-center gap-2 text-sm hover:bg-[var(--card-2)]">
                      <Sparkles className="h-4 w-4 reos-gold" /> AI Investment Advisor
                    </Link>
                  </div>
                </motion.div>

                {/* Floating market ticker */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
                  className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl">
                  <Stat label="Price Index" value="142.8" delta="+4.2%" />
                  <Stat label="Avg Yield" value="8.7%" delta="+0.6%" />
                  <Stat label="Active Investors" value="12,840" delta="+18%" />
                  <Stat label="Foreign Capital" value="$1.2B" delta="+23%" />
                </motion.div>
              </div>
            </section>

            {/* AI COMMAND CENTER */}
            <section className="px-6 md:px-10 -mt-12 relative z-10">
              <div className="reos-card p-6 md:p-8 relative overflow-hidden">
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
                    <Activity className="h-3.5 w-3.5 reos-gold" /> Streaming · ASEAN data live
                  </div>
                </div>

                <div className="mt-5 relative">
                  <textarea
                    rows={3}
                    placeholder="e.g. Show me Bali villas under $1M with ROI above 12% near Canggu, and forecast 5-year yield."
                    className="w-full p-4 rounded-xl bg-[var(--card-2)] border border-[var(--border)] focus:border-[var(--border-strong)] outline-none text-sm placeholder:text-[var(--text-2)] resize-none"
                  />
                  <button className="absolute bottom-3 right-3 h-9 px-4 rounded-lg reos-cta text-xs inline-flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5" /> Ask AI
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["Top ROI in Bali", "Compare KPR rates", "Verify legal status", "Find off-market deals", "Forecast Lombok yields"].map(s => (
                    <button key={s} className="text-xs px-3 py-1.5 rounded-full border border-[var(--border)] text-[var(--text-2)] hover:reos-gold hover:border-[var(--border-strong)]">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* LIVE MARKET OVERVIEW */}
            <section className="px-6 md:px-10 mt-12">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] reos-gold">Live Market</div>
                  <h2 className="text-2xl md:text-3xl font-semibold mt-1">ASEAN Property Intelligence</h2>
                </div>
                <Link to="/intelligence" className="text-xs text-[var(--text-2)] hover:reos-gold inline-flex items-center gap-1">
                  Open terminal <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="reos-card p-5 lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-[var(--text-2)] uppercase tracking-[0.18em]">Property Price Index</div>
                      <div className="text-3xl font-semibold mt-1">142.8 <span className="text-sm text-[var(--success)]">+4.2%</span></div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-2)]">
                      <span className="px-2 py-1 rounded-md border border-[var(--border)]">1D</span>
                      <span className="px-2 py-1 rounded-md reos-gold border border-[var(--border-strong)]">1M</span>
                      <span className="px-2 py-1 rounded-md border border-[var(--border)]">1Y</span>
                    </div>
                  </div>
                  <div className="h-56 mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={indexSeries}>
                        <defs>
                          <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FFD700" stopOpacity={0.45} />
                            <stop offset="100%" stopColor="#FFD700" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="i" hide />
                        <YAxis hide domain={["dataMin-2", "dataMax+2"]} />
                        <Tooltip contentStyle={{ background: "#0D0D0D", border: "1px solid rgba(255,215,0,0.25)", borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="v" stroke="#FFD700" strokeWidth={2} fill="url(#gd)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="reos-card p-5">
                    <div className="text-xs text-[var(--text-2)] uppercase tracking-[0.18em]">Rental Yield Index</div>
                    <div className="text-2xl font-semibold mt-1">8.7% <span className="text-xs text-[var(--success)]">+0.6%</span></div>
                    <div className="h-20 mt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={yieldSeries}>
                          <Line type="monotone" dataKey="v" stroke="#22C55E" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="reos-card p-5">
                    <div className="text-xs text-[var(--text-2)] uppercase tracking-[0.18em]">Foreign Investor Activity</div>
                    <div className="text-2xl font-semibold mt-1">$1.2B <span className="text-xs text-[var(--success)]">+23%</span></div>
                    <div className="mt-3 space-y-2">
                      {[["Bali", 92], ["Lombok", 78], ["Jakarta", 64]].map(([c, v]) => (
                        <div key={c as string}>
                          <div className="flex justify-between text-[11px] text-[var(--text-2)]"><span>{c}</span><span>{v}%</span></div>
                          <div className="h-1.5 rounded-full bg-[var(--card-2)] overflow-hidden">
                            <div className="h-full reos-cta" style={{ width: `${v}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ECOSYSTEM MODULES */}
            <section className="px-6 md:px-10 mt-16">
              <div className="text-xs uppercase tracking-[0.22em] reos-gold">Operating System</div>
              <h2 className="text-2xl md:text-3xl font-semibold mt-1">Eight modules. One terminal.</h2>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {modules.map(m => <ModuleCard key={m.title} {...m} />)}
              </div>
            </section>

            {/* FEATURED PROPERTIES */}
            <section className="px-6 md:px-10 mt-16">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] reos-gold">Featured</div>
                  <h2 className="text-2xl md:text-3xl font-semibold mt-1">Luxury Investment Properties</h2>
                </div>
                <Link to="/properties" className="text-xs text-[var(--text-2)] hover:reos-gold inline-flex items-center gap-1">
                  View all <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {properties.map((p, i) => (
                  <motion.div key={p.city} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                    className="reos-card overflow-hidden group">
                    <div className="relative h-44 overflow-hidden">
                      <img src={heroImg} alt={p.city} loading="lazy" width={800} height={600}
                           className="h-full w-full object-cover scale-110 group-hover:scale-100 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--card)] via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        <span className="text-[10px] uppercase tracking-[0.15em] px-2 py-1 rounded-md reos-glass reos-gold">3D Tour</span>
                        <span className="text-[10px] uppercase tracking-[0.15em] px-2 py-1 rounded-md reos-glass inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3 reos-gold" /> Verified</span>
                      </div>
                      <div className="absolute top-3 right-3 text-[10px] reos-glass px-2 py-1 rounded-md inline-flex items-center gap-1">
                        <Star className="h-3 w-3 reos-gold" /> {p.score}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center text-xs text-[var(--text-2)] gap-1">
                        <MapPin className="h-3 w-3" /> {p.city}
                      </div>
                      <div className="mt-1 font-semibold">{p.type}</div>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-lg font-semibold reos-gold">{p.price}</div>
                        <div className="text-right text-[11px] text-[var(--text-2)]">
                          ROI <span className="text-[var(--success)] font-medium">{p.roi}%</span> · Yield <span className="text-[var(--text)] font-medium">{p.yld}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* ASEAN MAP / MARKET HEATMAP */}
            <section className="px-6 md:px-10 mt-16">
              <div className="reos-card p-6 md:p-8 relative overflow-hidden reos-grid-bg">
                <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] reos-gold">ASEAN Network</div>
                    <h2 className="text-2xl md:text-3xl font-semibold mt-1">Regional ROI & Growth Heatmap</h2>
                  </div>
                  <div className="text-xs text-[var(--text-2)] flex items-center gap-3">
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--gold-bright)]" /> ROI</span>
                    <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[var(--success)]" /> Growth</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {markets.map(m => (
                    <div key={m.name} className="reos-glass rounded-xl p-4 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{m.name}</div>
                        <MapPin className="h-3.5 w-3.5 reos-gold" />
                      </div>
                      <div className="mt-3 flex items-baseline gap-2">
                        <div className="text-2xl font-semibold reos-gold">{m.roi}%</div>
                        <div className="text-[11px] text-[var(--text-2)]">ROI</div>
                      </div>
                      <div className="mt-1 text-xs text-[var(--success)]">+{m.growth}% growth</div>
                      <div className="absolute -bottom-6 -right-6 h-20 w-20 rounded-full blur-2xl"
                           style={{ background: "radial-gradient(circle, rgba(212,175,55,0.35), transparent 70%)" }} />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* INVESTOR CLUB */}
            <section className="px-6 md:px-10 mt-16">
              <div className="text-xs uppercase tracking-[0.22em] reos-gold">Investor Club</div>
              <h2 className="text-2xl md:text-3xl font-semibold mt-1">Private access. Institutional intelligence.</h2>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { tier: "Silver", price: "$99/mo", perks: ["Weekly market reports", "Standard alerts", "Email support"] },
                  { tier: "Gold", price: "$299/mo", perks: ["Daily intelligence briefings", "Exclusive deals", "Dedicated advisor"], featured: true },
                  { tier: "Platinum", price: "$999/mo", perks: ["Private deal flow", "VIP property tours", "Bespoke wealth planning"] },
                ].map(t => (
                  <div key={t.tier} className={`reos-card p-6 relative ${t.featured ? "ring-1 ring-[var(--gold-bright)]" : ""}`}>
                    {t.featured && <div className="absolute -top-3 left-6 text-[10px] uppercase tracking-[0.2em] reos-cta px-2 py-1 rounded-md">Most Popular</div>}
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 reos-gold" />
                      <span className="text-sm uppercase tracking-[0.18em]">{t.tier}</span>
                    </div>
                    <div className="mt-3 text-3xl font-semibold">{t.price}</div>
                    <ul className="mt-5 space-y-2 text-sm text-[var(--text-2)]">
                      {t.perks.map(p => <li key={p} className="flex items-center gap-2"><Eye className="h-3.5 w-3.5 reos-gold" />{p}</li>)}
                    </ul>
                    <button className={`mt-6 w-full h-11 rounded-xl text-sm ${t.featured ? "reos-cta" : "reos-outline hover:bg-[var(--card-2)]"}`}>
                      Join {t.tier}
                    </button>
                  </div>
                ))}
              </div>
            </section>

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
                    <DollarSign className="h-3 w-3 reos-gold" /> $4.8B assets tracked · 12,840 investors
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
                      {c.l.map(i => <li key={i}><a href="#" className="hover:text-[var(--text)]">{i}</a></li>)}
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
      </div>
    </>
  );
}
