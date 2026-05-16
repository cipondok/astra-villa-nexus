import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search, BarChart3, CheckCircle2, FileText, Link2, Image, MapPin,
  TrendingUp, Eye, Target, Sparkles, Download, Zap, ChevronRight,
  Type, Globe, DollarSign, ArrowUpRight, CircleCheck, Circle, AlertCircle
} from 'lucide-react';

/* ── gauge ── */
const ScoreGauge = ({ score, label, size = 120 }: { score: number; label: string; size?: number }) => {
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r * 0.75;
  const offset = circ * (1 - score / 100);
  const color = score >= 80 ? 'hsl(var(--chart-2, 142 71% 45%))' : score >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))';
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size * 0.8} viewBox={`0 0 ${size} ${size * 0.85}`}>
        <path d={`M ${size * 0.1} ${size * 0.7} A ${r} ${r} 0 1 1 ${size * 0.9} ${size * 0.7}`}
          fill="none" stroke="hsl(var(--border))" strokeWidth="6" strokeLinecap="round" opacity="0.3" />
        <path d={`M ${size * 0.1} ${size * 0.7} A ${r} ${r} 0 1 1 ${size * 0.9} ${size * 0.7}`}
          fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-1000" />
        <text x={size / 2} y={size * 0.52} textAnchor="middle" className="fill-foreground text-xl font-bold">{score}</text>
        <text x={size / 2} y={size * 0.68} textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: 9 }}>/100</text>
      </svg>
      <span className="text-xs font-medium text-muted-foreground mt-1">{label}</span>
    </div>
  );
};

/* ── checklist ── */
const checklistItems = [
  { label: 'Primary keyword in title', done: true },
  { label: 'Meta description optimized', done: true },
  { label: 'H1/H2 hierarchy structured', done: true },
  { label: 'Image alt-tags complete', done: false },
  { label: 'Internal links added (3+)', done: false },
  { label: 'Schema markup generated', done: true },
  { label: 'Mobile speed optimized', done: true },
];

/* ── optimization cards ── */
const optimizationCards = [
  { icon: Type, title: 'Title Keyword Strength', score: 88, status: 'Strong', desc: 'Primary + location keywords present in H1' },
  { icon: MapPin, title: 'Location Search Demand', score: 74, status: 'Good', desc: '"Bali villa investment" — 8.2K monthly searches' },
  { icon: DollarSign, title: 'Investment Intent Coverage', score: 81, status: 'Strong', desc: 'ROI, yield, and capital growth phrases detected' },
  { icon: Image, title: 'Image Alt-Tag Optimization', score: 45, status: 'Needs Work', desc: '3 of 8 images missing descriptive alt attributes' },
  { icon: Link2, title: 'Internal Linking Score', score: 62, status: 'Moderate', desc: '2 contextual links found — target is 5+' },
];

/* ── traffic curve ── */
const trafficData = [12, 18, 22, 28, 35, 42, 48, 56, 64, 71, 78, 82];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ListingSEOTrafficEngine() {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const completedCount = checklistItems.filter(c => c.done).length;
  const completionPct = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">

        {/* header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium">
            <Search className="w-3 h-3" /> SEO Intelligence Tool
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">AI SEO Listing Optimizer</h1>
          <p className="text-muted-foreground text-sm">Structure property pages to capture high-intent investor search traffic</p>
        </motion.div>

        {/* ═══ SEO SCORE PANEL ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* gauges */}
          <div className="rounded-xl border border-border bg-card p-5 flex items-center justify-around">
            <ScoreGauge score={76} label="Visibility Score" />
            <ScoreGauge score={82} label="Keyword Strength" />
          </div>

          {/* checklist */}
          <div className="md:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Content Completeness
              </h3>
              <span className="text-xs font-medium text-muted-foreground">{completedCount}/{checklistItems.length} · {completionPct}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted/40 mb-4">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${completionPct}%` }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {checklistItems.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-sm">
                  {item.done
                    ? <CircleCheck className="w-4 h-4 text-primary shrink-0" />
                    : <Circle className="w-4 h-4 text-muted-foreground/40 shrink-0" />}
                  <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══ OPTIMIZATION GRID ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" /> Optimization Modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {optimizationCards.map((card, i) => {
              const barColor = card.score >= 80 ? 'bg-emerald-500' : card.score >= 60 ? 'bg-primary' : 'bg-amber-500';
              return (
                <motion.div key={card.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                  onMouseEnter={() => setActiveCard(i)} onMouseLeave={() => setActiveCard(null)}
                  className="rounded-xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all cursor-default">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                        <card.icon className="w-4 h-4 text-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{card.title}</p>
                        <p className="text-[10px] text-muted-foreground">{card.status}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-foreground">{card.score}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${card.score}%` }}
                      transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                      className={`h-full rounded-full ${barColor}`} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{card.desc}</p>
                </motion.div>
              );
            })}

            {/* empty upgrade card */}
            <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 flex flex-col items-center justify-center text-center gap-2 min-h-[140px]">
              <Sparkles className="w-5 h-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">More modules coming soon</p>
              <p className="text-[10px] text-muted-foreground">Schema, backlinks, competitor gap</p>
            </div>
          </div>
        </motion.div>

        {/* ═══ CONTENT PREVIEW ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> AI-Generated Content Preview
          </h2>

          <div className="space-y-3">
            <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">SEO Title</span>
              <p className="text-sm font-medium text-primary mt-1">
                Luxury Bali Villa Investment — 12.4% Rental Yield | ASTRA Properties
              </p>
              <span className="text-[10px] text-muted-foreground">58 characters · ✓ Within optimal range</span>
            </div>

            <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Meta Description</span>
              <p className="text-sm text-foreground mt-1">
                Discover this premium 3-bedroom villa in Canggu with projected 12.4% annual rental yield. AI-verified pricing, market growth analysis, and investment scoring included.
              </p>
              <span className="text-[10px] text-muted-foreground">156 characters · ✓ Optimal length</span>
            </div>

            <div className="rounded-lg bg-muted/20 border border-border/50 p-3">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Suggested H2 Structure</span>
              <div className="mt-2 space-y-1.5">
                {[
                  'Investment Overview & AI Score',
                  'Location Demand Analysis — Canggu',
                  'Rental Yield Projection & ROI Forecast',
                  'Comparable Properties & Market Position',
                  'Developer Track Record & Trust Score',
                ].map((h, i) => (
                  <p key={i} className="text-sm text-foreground flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-mono">H2</span> {h}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ TRAFFIC PROJECTION ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div className="md:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Estimated Monthly Search Reach
              </h3>
              <span className="text-xs text-muted-foreground">12-month projection</span>
            </div>
            <div className="relative h-40">
              <svg viewBox="0 0 480 140" className="w-full h-full" preserveAspectRatio="none">
                {/* grid */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line key={i} x1="0" y1={i * 35} x2="480" y2={i * 35}
                    stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3" />
                ))}
                {/* area */}
                <defs>
                  <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path fill="url(#trafficGrad)"
                  d={`M 0 140 ${trafficData.map((v, i) => `L ${i * (480 / 11)} ${140 - v * 1.6}`).join(' ')} L 480 140 Z`} />
                <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="2"
                  points={trafficData.map((v, i) => `${i * (480 / 11)},${140 - v * 1.6}`).join(' ')} />
                {/* dots */}
                {trafficData.map((v, i) => (
                  <circle key={i} cx={i * (480 / 11)} cy={140 - v * 1.6} r="3"
                    fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
                ))}
                {/* labels */}
                {months.map((m, i) => (
                  <text key={m} x={i * (480 / 11)} y={156} textAnchor="middle"
                    className="fill-muted-foreground" style={{ fontSize: 8 }}>{m}</text>
                ))}
              </svg>
            </div>
            <div className="flex gap-4 mt-3 text-xs">
              <span className="text-muted-foreground">Current: <strong className="text-foreground">~1,200 visits/mo</strong></span>
              <span className="text-muted-foreground">Projected: <strong className="text-primary">~8,200 visits/mo</strong></span>
            </div>
          </div>

          {/* click probability */}
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
              <Eye className="w-4 h-4 text-primary" /> Click Probability
            </h3>
            <div className="space-y-3 flex-1">
              {[
                { label: 'Position 1–3', pct: 34, desc: 'High intent clicks' },
                { label: 'Position 4–10', pct: 18, desc: 'Moderate discovery' },
                { label: 'Featured snippet', pct: 42, desc: 'If schema activated' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-foreground font-medium">{item.label}</span>
                    <span className="text-muted-foreground">{item.pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted/30">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${item.pct}%` }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══ ACTIONS ═══ */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          className="flex flex-wrap gap-3 justify-center pb-8">
          {[
            { label: 'Apply SEO Optimization', icon: Zap, primary: true },
            { label: 'Generate Listing Content', icon: Sparkles, primary: false },
            { label: 'Export Search Strategy Report', icon: Download, primary: false },
          ].map(btn => (
            <button key={btn.label}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${btn.primary
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/15 hover:brightness-110'
                : 'border border-border bg-card text-foreground hover:bg-accent/50'}`}>
              <btn.icon className="w-4 h-4" /> {btn.label} <ChevronRight className="w-3 h-3" />
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
