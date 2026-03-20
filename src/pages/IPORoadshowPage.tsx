import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Maximize2, Minimize2, X, 
  TrendingUp, Globe, Database, DollarSign, Shield,
  BarChart3, Users, Building2, Zap, Target,
  ArrowRight, CircleDot, Layers, Network
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// ─── Slide data ─────────────────────────────────────────────
const slides = [
  // 0 — Title
  {
    id: 'title',
    headline: 'ASTRA VILLA',
    subline: 'AI-Powered Real Estate Liquidity Infrastructure',
    body: 'IPO Investor Roadshow — Confidential',
    accent: 'Redefining how capital meets property.',
    layout: 'title' as const,
  },
  // 1 — Problem
  {
    id: 'problem',
    headline: 'The $280T Problem',
    subline: 'Global real estate is the largest asset class — yet the most inefficient.',
    layout: 'stats' as const,
    stats: [
      { label: 'Avg Days to Close', value: '127', note: 'vs 41 on ASTRA' },
      { label: 'Discovery Fragmentation', value: '73%', note: 'use 3+ portals' },
      { label: 'Price Transparency', value: '< 22%', note: 'of markets' },
      { label: 'Vendor Coordination', value: '9 parties', note: 'per transaction' },
    ],
  },
  // 2 — Solution
  {
    id: 'solution',
    headline: 'One Platform. Full Lifecycle.',
    subline: 'ASTRA unifies discovery, transaction, vendor services, and investment intelligence.',
    layout: 'pillars' as const,
    pillars: [
      { icon: Target, title: 'AI Discovery', desc: 'Smart search, 3D tours, demand signals' },
      { icon: Zap, title: 'Deal Execution', desc: 'Digital offers, timeline automation' },
      { icon: Building2, title: 'Vendor Marketplace', desc: 'Renovation, legal, furnishing' },
      { icon: TrendingUp, title: 'Investor Intelligence', desc: 'Yield analytics, deal matching' },
    ],
  },
  // 3 — Traction
  {
    id: 'traction',
    headline: 'Platform Traction',
    subline: 'Key operating metrics demonstrating product-market fit.',
    layout: 'stats' as const,
    stats: [
      { label: 'Monthly GMV', value: 'Rp 85B', note: '+34% QoQ' },
      { label: 'Active Listings', value: '12,847', note: 'verified' },
      { label: 'Deals / Month', value: '48', note: '6.4% conversion' },
      { label: 'ARR Run-Rate', value: 'Rp 11.7B', note: 'multi-stream' },
    ],
  },
  // 4 — Data Moat
  {
    id: 'data-moat',
    headline: 'Proprietary Data Moat',
    subline: 'Every transaction deepens our intelligence advantage.',
    layout: 'flywheel' as const,
    steps: [
      'More listings attract more users',
      'More users generate richer behavior data',
      'Better data powers superior pricing intelligence',
      'Faster deals attract more inventory',
      'Network effects compound — competitors cannot replicate',
    ],
  },
  // 5 — Revenue
  {
    id: 'revenue',
    headline: 'Diversified Revenue Engine',
    subline: 'Five monetization layers — not a single-stream business.',
    layout: 'revenue' as const,
    streams: [
      { name: 'Transaction Commissions', pct: 38, value: '0.5–2% take-rate' },
      { name: 'Investor SaaS', pct: 26, value: 'Rp 299K–50M/mo' },
      { name: 'Vendor Subscriptions', pct: 18, value: 'Growth → Dominance' },
      { name: 'Premium Listings', pct: 12, value: 'Visibility slots' },
      { name: 'Data Intelligence API', pct: 6, value: 'Institutional licensing' },
    ],
  },
  // 6 — Unit Economics
  {
    id: 'unit-economics',
    headline: 'Unit Economics at Scale',
    subline: 'Strong margin expansion as platform effects compound.',
    layout: 'stats' as const,
    stats: [
      { label: 'Gross Margin', value: '78%', note: 'asset-light' },
      { label: 'LTV / CAC', value: '6.2x', note: 'investor segment' },
      { label: 'Net Revenue Retention', value: '134%', note: 'expansion driven' },
      { label: 'Payback Period', value: '4.3 mo', note: 'improving' },
    ],
  },
  // 7 — Expansion
  {
    id: 'expansion',
    headline: 'Regional Dominance → Global Scale',
    subline: 'City-by-city expansion playbook with proven unit economics.',
    layout: 'expansion' as const,
    phases: [
      { phase: 'NOW', cities: 'Jakarta, Bali, Surabaya', status: 'Established' },
      { phase: '2026', cities: 'Bandung, Medan, Makassar', status: 'Launching' },
      { phase: '2027', cities: 'KL, Bangkok, Manila', status: 'Planned' },
      { phase: '2028+', cities: 'Singapore, HK, Dubai', status: 'Gateway Markets' },
    ],
  },
  // 8 — Valuation
  {
    id: 'valuation',
    headline: 'Valuation Framework',
    subline: 'Platform infrastructure deserves infrastructure multiples.',
    layout: 'valuation' as const,
    comparables: [
      { name: 'PropertyGuru', multiple: '8.2x', metric: 'Revenue' },
      { name: 'CoStar Group', multiple: '18.4x', metric: 'Revenue' },
      { name: 'Zillow', multiple: '4.7x', metric: 'Revenue' },
      { name: 'ASTRA (Target)', multiple: '12–15x', metric: 'Fwd Revenue' },
    ],
  },
  // 9 — Risk Mitigation
  {
    id: 'risk',
    headline: 'Risk Mitigation',
    subline: 'Proactive strategies for key investor concerns.',
    layout: 'risks' as const,
    risks: [
      { risk: 'Market cyclicality', mitigation: 'SaaS revenue provides counter-cyclical stability' },
      { risk: 'Regulatory complexity', mitigation: 'Local compliance teams + legal automation' },
      { risk: 'Competition from portals', mitigation: 'Data moat + full-lifecycle lock-in' },
      { risk: 'Execution risk', mitigation: 'Proven city-launch playbook, <9mo breakeven' },
    ],
  },
  // 10 — Call to Action
  {
    id: 'cta',
    headline: 'The Opportunity',
    subline: 'Invest in the liquidity layer of the world\'s largest asset class.',
    body: 'ASTRA is building the operating system for real estate capital.',
    accent: 'investor-relations@astravilla.com',
    layout: 'title' as const,
  },
];

// ─── Slide renderers ────────────────────────────────────────

function TitleSlide({ slide }: { slide: typeof slides[0] }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8 relative overflow-hidden">
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'linear-gradient(hsl(var(--primary)/0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)/0.5) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="text-primary font-mono text-sm tracking-[0.3em] uppercase mb-6 opacity-70">Confidential — Investor Roadshow</div>
        <h1 className="text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[0.95]" style={{ textWrap: 'balance' } as React.CSSProperties}>
          {slide.headline}
        </h1>
        <p className="mt-6 text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto" style={{ textWrap: 'pretty' } as React.CSSProperties}>
          {slide.subline}
        </p>
        {slide.accent && (
          <div className="mt-10 text-sm font-mono text-primary/80 tracking-wide">{slide.accent}</div>
        )}
      </motion.div>
    </div>
  );
}

function StatsSlide({ slide }: { slide: typeof slides[1] }) {
  const stats = (slide as any).stats as { label: string; value: string; note: string }[];
  return (
    <div className="flex flex-col justify-center h-full px-8 md:px-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">{slide.headline}</h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl">{slide.subline}</p>
      </motion.div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.5 }}
            className="rounded-2xl border border-border/60 bg-card/60 p-6 hover:border-primary/30 transition-colors group"
          >
            <div className="text-3xl md:text-4xl font-black text-foreground tabular-nums tracking-tight group-hover:text-primary transition-colors">
              {s.value}
            </div>
            <div className="mt-2 text-sm font-medium text-muted-foreground">{s.label}</div>
            <div className="mt-1 text-xs text-primary/70 font-mono">{s.note}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PillarsSlide({ slide }: { slide: typeof slides[2] }) {
  const pillars = (slide as any).pillars as { icon: any; title: string; desc: string }[];
  return (
    <div className="flex flex-col justify-center h-full px-8 md:px-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">{slide.headline}</h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl">{slide.subline}</p>
      </motion.div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mt-12">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
              className="rounded-2xl border border-border/60 bg-card/60 p-6 hover:shadow-lg hover:border-primary/30 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground text-base">{p.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{p.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function FlywheelSlide({ slide }: { slide: typeof slides[4] }) {
  const steps = (slide as any).steps as string[];
  return (
    <div className="flex flex-col justify-center h-full px-8 md:px-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">{slide.headline}</h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl">{slide.subline}</p>
      </motion.div>
      <div className="mt-12 max-w-2xl space-y-0">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
            className="flex items-start gap-4 py-3"
          >
            <div className="flex flex-col items-center shrink-0">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2",
                "border-primary bg-primary/10 text-primary"
              )}>
                {i + 1}
              </div>
              {i < steps.length - 1 && <div className="w-px h-6 bg-primary/20 mt-1" />}
            </div>
            <p className="text-base text-foreground font-medium pt-1">{step}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function RevenueSlide({ slide }: { slide: typeof slides[5] }) {
  const streams = (slide as any).streams as { name: string; pct: number; value: string }[];
  return (
    <div className="flex flex-col justify-center h-full px-8 md:px-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">{slide.headline}</h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl">{slide.subline}</p>
      </motion.div>
      <div className="mt-12 space-y-3 max-w-2xl">
        {streams.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.4 }}
            className="flex items-center gap-4"
          >
            <div className="w-32 text-sm font-medium text-foreground shrink-0 text-right">{s.name}</div>
            <div className="flex-1 h-8 bg-muted/40 rounded-lg overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${s.pct}%` }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.6, ease: 'easeOut' }}
                className="h-full bg-primary/80 rounded-lg"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground">{s.value}</span>
            </div>
            <div className="w-12 text-right text-sm font-bold text-foreground tabular-nums">{s.pct}%</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ExpansionSlide({ slide }: { slide: typeof slides[7] }) {
  const phases = (slide as any).phases as { phase: string; cities: string; status: string }[];
  return (
    <div className="flex flex-col justify-center h-full px-8 md:px-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">{slide.headline}</h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl">{slide.subline}</p>
      </motion.div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
        {phases.map((p, i) => (
          <motion.div
            key={p.phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.12, duration: 0.4 }}
            className="rounded-2xl border border-border/60 bg-card/60 p-5 relative overflow-hidden"
          >
            <div className="text-2xl font-black text-primary tabular-nums">{p.phase}</div>
            <div className="mt-3 text-sm font-medium text-foreground leading-relaxed">{p.cities}</div>
            <div className={cn(
              "mt-3 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block",
              i === 0 ? "bg-primary/10 text-primary" 
              : i === 1 ? "bg-accent text-accent-foreground"
              : "bg-muted text-muted-foreground"
            )}>
              {p.status}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ValuationSlide({ slide }: { slide: typeof slides[8] }) {
  const comparables = (slide as any).comparables as { name: string; multiple: string; metric: string }[];
  return (
    <div className="flex flex-col justify-center h-full px-8 md:px-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">{slide.headline}</h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl">{slide.subline}</p>
      </motion.div>
      <div className="mt-12 max-w-xl">
        <div className="space-y-3">
          {comparables.map((c, i) => {
            const isAstra = c.name.includes('ASTRA');
            return (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className={cn(
                  "flex items-center justify-between py-3 px-5 rounded-xl border",
                  isAstra ? "border-primary/40 bg-primary/5" : "border-border/40 bg-card/40"
                )}
              >
                <span className={cn("font-semibold text-sm", isAstra ? "text-primary" : "text-foreground")}>{c.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground">{c.metric}</span>
                  <span className={cn("text-lg font-black tabular-nums", isAstra ? "text-primary" : "text-foreground")}>{c.multiple}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RisksSlide({ slide }: { slide: typeof slides[9] }) {
  const risks = (slide as any).risks as { risk: string; mitigation: string }[];
  return (
    <div className="flex flex-col justify-center h-full px-8 md:px-16">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">{slide.headline}</h2>
        <p className="mt-3 text-lg text-muted-foreground max-w-xl">{slide.subline}</p>
      </motion.div>
      <div className="mt-12 max-w-2xl space-y-4">
        {risks.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
            className="flex items-start gap-4 p-4 rounded-xl border border-border/40 bg-card/40"
          >
            <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-foreground">{r.risk}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{r.mitigation}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SlideRenderer({ slide }: { slide: typeof slides[0] }) {
  switch (slide.layout) {
    case 'title': return <TitleSlide slide={slide} />;
    case 'stats': return <StatsSlide slide={slide} />;
    case 'pillars': return <PillarsSlide slide={slide} />;
    case 'flywheel': return <FlywheelSlide slide={slide} />;
    case 'revenue': return <RevenueSlide slide={slide} />;
    case 'expansion': return <ExpansionSlide slide={slide} />;
    case 'valuation': return <ValuationSlide slide={slide} />;
    case 'risks': return <RisksSlide slide={slide} />;
    default: return <TitleSlide slide={slide} />;
  }
}

// ─── Main component ─────────────────────────────────────────

export default function IPORoadshowPage() {
  const [current, setCurrent] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  const total = slides.length;

  const go = useCallback((dir: 1 | -1) => {
    setCurrent(c => Math.max(0, Math.min(total - 1, c + dir)));
  }, [total]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'Escape') {
        if (document.fullscreenElement) document.exitFullscreen();
        else navigate(-1);
      }
      if (e.key === 'f' || e.key === 'F5') {
        e.preventDefault();
        document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener('keydown', handler);
    const fsHandler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fsHandler);
    return () => { window.removeEventListener('keydown', handler); document.removeEventListener('fullscreenchange', fsHandler); };
  }, [go, navigate]);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col select-none">
      {/* Top bar */}
      <div className="h-11 shrink-0 flex items-center justify-between px-4 border-b border-border/30 bg-card/80 backdrop-blur-sm">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors active:scale-[0.97]">
          <X className="h-3.5 w-3.5" /> Exit
        </button>
        <div className="text-xs font-mono text-muted-foreground tabular-nums">
          {current + 1} / {total}
        </div>
        <button onClick={toggleFullscreen} className="text-muted-foreground hover:text-foreground transition-colors active:scale-[0.97]">
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <SlideRenderer slide={slides[current]} />
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        {current > 0 && (
          <button
            onClick={() => go(-1)}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-all active:scale-95 shadow-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {current < total - 1 && (
          <button
            onClick={() => go(1)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-card/80 border border-border/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card transition-all active:scale-95 shadow-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      <div className="h-14 shrink-0 border-t border-border/30 bg-card/80 backdrop-blur-sm flex items-center gap-1.5 px-4 overflow-x-auto">
        {slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setCurrent(i)}
            className={cn(
              "shrink-0 h-8 px-3 rounded-md text-[10px] font-medium transition-all active:scale-95",
              i === current
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            {i + 1}
          </button>
        ))}
        <div className="ml-auto shrink-0 flex items-center gap-2">
          {/* Progress */}
          <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((current + 1) / total) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
