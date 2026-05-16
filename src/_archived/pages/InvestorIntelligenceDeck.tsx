import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft, ChevronRight, ArrowRight, Sparkles, Target,
  BarChart3, TrendingUp, Globe, Zap, Users, Building,
  DollarSign, Layers, Search, Eye, MessageSquare, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TOTAL_SLIDES = 8;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
};

/* ================================================================
   SLIDE COMPONENTS
   ================================================================ */

function Slide1() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] max-w-4xl">
          Reinventing Property Investment Intelligence
          <span className="block text-primary mt-2">in Emerging Markets</span>
        </h1>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-lg sm:text-xl text-muted-foreground max-w-2xl"
      >
        AI-driven marketplace unlocking hidden real estate alpha.
      </motion.p>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 text-xs text-muted-foreground/50 uppercase tracking-[0.3em]"
      >
        ASTRA AI · Investor Briefing
      </motion.div>
    </div>
  );
}

function Slide2() {
  const problems = [
    { icon: Search, title: 'Fragmented Listings', desc: 'Property data scattered across hundreds of informal channels with no standardization.' },
    { icon: BarChart3, title: 'No Investment-Grade Analytics', desc: 'Investors make billion-rupiah decisions without scoring, benchmarking, or predictive intelligence.' },
    { icon: Eye, title: 'Poor Deal Transparency', desc: 'Opaque pricing, hidden fees, and no comparable transaction data for informed negotiation.' },
  ];
  return (
    <div className="flex flex-col justify-center h-full px-8 sm:px-16 max-w-5xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-4">The Problem</div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-12">
          A $300B market running on gut instinct
        </h2>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6">
        {problems.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
              <p.icon className="w-5 h-5 text-destructive" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-2">{p.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Slide3() {
  const solutions = [
    { icon: Target, title: 'AI Opportunity Scoring', desc: 'Proprietary composite model analyzing ROI projection, demand heat, valuation gaps, and rental yield across 100K+ properties.', metric: '0–100 Score' },
    { icon: Users, title: 'Behavioral Demand Intelligence', desc: 'Real-time tracking of investor behavior signals — views, saves, inquiries — to surface demand momentum before the market sees it.', metric: '14 Event Types' },
    { icon: Zap, title: 'Smart Deal Matching', desc: 'AI-powered investor-property matching using DNA profiling, behavioral fit, and opportunity alignment.', metric: '94% Match Accuracy' },
  ];
  return (
    <div className="flex flex-col justify-center h-full px-8 sm:px-16 max-w-5xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-4">The ASTRA Solution</div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-12">
          Intelligence-first infrastructure
        </h2>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6">
        {solutions.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12 }}
            className="bg-card border border-border rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <s.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
            <div className="text-[10px] font-mono text-primary bg-primary/5 rounded-full px-3 py-1 w-fit">{s.metric}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Slide4() {
  const steps = [
    { icon: Building, label: 'Listings', sub: '100K+ properties' },
    { icon: Target, label: 'AI Scoring', sub: '6-factor engine' },
    { icon: Users, label: 'Investor Matching', sub: 'DNA profiling' },
    { icon: MessageSquare, label: 'Deal Room', sub: 'Smart negotiation' },
    { icon: TrendingUp, label: 'Transaction Signals', sub: 'Exit intelligence' },
  ];
  return (
    <div className="flex flex-col justify-center h-full px-8 sm:px-16 max-w-5xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-4">Product Ecosystem</div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-16">
          End-to-end intelligence pipeline
        </h2>
      </motion.div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
        {steps.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-4"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
                <s.icon className="w-7 h-7 text-primary" />
              </div>
              <div className="text-xs font-semibold text-foreground">{s.label}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.sub}</div>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="w-5 h-5 text-primary/40 hidden sm:block shrink-0" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Slide5() {
  const metrics = [
    { label: 'Active Listings', value: '12,400+', growth: '+340% YoY', chart: [20, 35, 45, 62, 78, 100] },
    { label: 'Investor Signups', value: '4,200+', growth: '+180% QoQ', chart: [30, 40, 55, 65, 80, 95] },
    { label: 'Deal Conversations', value: '1,800+', growth: '+220% QoQ', chart: [15, 25, 40, 55, 75, 90] },
  ];
  return (
    <div className="flex flex-col justify-center h-full px-8 sm:px-16 max-w-5xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-4">Traction</div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-12">
          Momentum signals
        </h2>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="text-xs text-muted-foreground mb-2">{m.label}</div>
            <div className="text-3xl font-bold text-foreground mb-1">{m.value}</div>
            <div className="text-xs font-semibold text-chart-1 mb-4">{m.growth}</div>
            {/* Mini chart */}
            <div className="flex items-end gap-1 h-12">
              {m.chart.map((v, j) => (
                <motion.div
                  key={j}
                  className="flex-1 bg-primary/20 rounded-sm"
                  initial={{ height: 0 }}
                  animate={{ height: `${v}%` }}
                  transition={{ delay: 0.5 + j * 0.08 }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Slide6() {
  const streams = [
    { icon: Shield, title: 'Premium Intelligence Subscription', desc: 'Investor-tier access to AI reports, opportunity alerts, and portfolio analytics.', tag: 'SaaS Recurring' },
    { icon: Building, title: 'Developer Listing Packages', desc: 'Featured placement, AI-enhanced listings, and demand analytics for property developers.', tag: 'Marketplace' },
    { icon: DollarSign, title: 'Transaction Success Fees', desc: 'Commission on completed deals facilitated through the ASTRA Deal Room.', tag: 'Transactional' },
  ];
  return (
    <div className="flex flex-col justify-center h-full px-8 sm:px-16 max-w-5xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-4">Revenue Model</div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-12">
          Three monetization vectors
        </h2>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6">
        {streams.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.12 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-[9px] font-mono text-primary bg-primary/5 rounded-full px-2.5 py-1">{s.tag}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-2">{s.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Slide7() {
  const markets = [
    { label: 'Indonesia', status: 'Active', cities: 'Jakarta · Bali · Bandung · Surabaya', phase: 'Phase 1' },
    { label: 'Southeast Asia', status: 'Next', cities: 'Vietnam · Thailand · Philippines', phase: 'Phase 2' },
    { label: 'Global Emerging', status: 'Vision', cities: 'LATAM · Africa · South Asia', phase: 'Phase 3' },
  ];
  return (
    <div className="flex flex-col justify-center h-full px-8 sm:px-16 max-w-5xl mx-auto w-full">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="text-xs text-primary font-semibold uppercase tracking-[0.2em] mb-4">Expansion</div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-12">
          From Indonesia to the world
        </h2>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6">
        {markets.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            className={cn(
              'border rounded-2xl p-6 relative overflow-hidden',
              i === 0 ? 'bg-primary/5 border-primary/20' : 'bg-card border-border'
            )}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">{m.phase}</span>
              <span className={cn(
                'text-[9px] font-semibold px-2 py-0.5 rounded-full',
                m.status === 'Active' ? 'bg-chart-1/15 text-chart-1' :
                m.status === 'Next' ? 'bg-chart-4/15 text-chart-4' :
                'bg-secondary text-muted-foreground'
              )}>{m.status}</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">{m.label}</h3>
            </div>
            <p className="text-xs text-muted-foreground">{m.cities}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Slide8() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
          <Layers className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] max-w-3xl mb-6">
          Join the future of
          <span className="block text-primary mt-2">intelligent property investing</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
          Partner with ASTRA to reshape how emerging market real estate is discovered, analyzed, and transacted.
        </p>
        <Button size="lg" className="h-14 px-10 text-base font-semibold gap-2 rounded-xl">
          <MessageSquare className="w-5 h-5" />Start a Conversation
        </Button>
        <div className="mt-16 text-[10px] text-muted-foreground/40 uppercase tracking-[0.3em]">
          ASTRA AI · Confidential
        </div>
      </motion.div>
    </div>
  );
}

const SLIDES = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6, Slide7, Slide8];
const SLIDE_LABELS = ['Vision', 'Problem', 'Solution', 'Product', 'Traction', 'Revenue', 'Expansion', 'Partner'];

/* ================================================================
   MAIN DECK COMPONENT
   ================================================================ */

export default function InvestorIntelligenceDeck() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const go = useCallback((next: number) => {
    if (next < 0 || next >= TOTAL_SLIDES) return;
    setDirection(next > current ? 1 : -1);
    setCurrent(next);
  }, [current]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); go(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(current - 1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [current, go]);

  const SlideComponent = SLIDES[current];

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden select-none">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-card/50 backdrop-blur-sm z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-foreground tracking-wide">ASTRA Investor Deck</span>
        </div>
        <div className="flex items-center gap-1.5">
          {SLIDE_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[10px] font-medium transition-all',
                current === i
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">
          {current + 1} / {TOTAL_SLIDES}
        </div>
      </div>

      {/* Slide area */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <SlideComponent />
          </motion.div>
        </AnimatePresence>

        {/* Nav arrows */}
        {current > 0 && (
          <button
            onClick={() => go(current - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {current < TOTAL_SLIDES - 1 && (
          <button
            onClick={() => go(current + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-secondary shrink-0">
        <motion.div
          className="h-full bg-primary"
          animate={{ width: `${((current + 1) / TOTAL_SLIDES) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
