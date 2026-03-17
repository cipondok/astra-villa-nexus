import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Crown, Layers, Brain, DollarSign, Rocket, Sparkles,
  TrendingUp, Users, Globe, Building2, ChevronRight,
  Target, Zap, Shield, BarChart3, type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Ultimate Master Plan Blueprint
   ═══════════════════════════════════════════════════════════ */

interface Phase {
  id: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  modules: { name: string; status: 'live' | 'building' | 'planned' }[];
}

interface StrategyPillar {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  items: { title: string; detail: string }[];
}

const phases: Phase[] = [
  {
    id: 'core', label: 'Phase 1', subtitle: 'Marketplace Core', icon: Building2, color: '--panel-accent',
    modules: [
      { name: 'Property buy & sale listings', status: 'live' },
      { name: 'Rental booking marketplace', status: 'live' },
      { name: 'Global intelligent search', status: 'live' },
      { name: 'Watchlist and inquiry workflow', status: 'live' },
      { name: 'Offer negotiation system', status: 'live' },
    ],
  },
  {
    id: 'intelligence', label: 'Phase 2', subtitle: 'Intelligence Differentiation', icon: Brain, color: '--panel-info',
    modules: [
      { name: 'Opportunity scoring engine', status: 'live' },
      { name: 'Automated property valuation', status: 'live' },
      { name: 'Price prediction analytics', status: 'live' },
      { name: 'AI recommendation feed', status: 'live' },
      { name: 'Property comparison tools', status: 'live' },
    ],
  },
  {
    id: 'revenue', label: 'Phase 3', subtitle: 'Revenue Ecosystem', icon: DollarSign, color: '--panel-success',
    modules: [
      { name: 'Developer project launch system', status: 'live' },
      { name: 'Service marketplace (repair, renovation, legal)', status: 'live' },
      { name: 'Mortgage & financing support', status: 'live' },
      { name: 'Commission & subscription monetization', status: 'live' },
    ],
  },
  {
    id: 'authority', label: 'Phase 4', subtitle: 'Platform Authority', icon: BarChart3, color: '--panel-warning',
    modules: [
      { name: 'Portfolio analytics dashboard', status: 'live' },
      { name: 'Market heat geo intelligence', status: 'live' },
      { name: 'Autonomous deal hunter alerts', status: 'live' },
      { name: 'SEO growth & referral acquisition engine', status: 'live' },
    ],
  },
  {
    id: 'innovation', label: 'Phase 5', subtitle: 'Future Innovation', icon: Sparkles, color: '--panel-error',
    modules: [
      { name: 'AI chat investment assistant', status: 'live' },
      { name: 'Institutional analytics dashboard', status: 'building' },
      { name: 'Fractional investment concept', status: 'planned' },
      { name: 'Virtual immersive property exploration', status: 'live' },
    ],
  },
];

const marketExecution: StrategyPillar[] = [
  {
    id: 'supply', label: 'Supply Growth', icon: TrendingUp, color: '--panel-accent',
    items: [
      { title: 'Daily agent onboarding discipline', detail: 'Systematic recruitment pipeline maintaining ≥15 new agents/week' },
      { title: 'Developer JV partnership pipeline', detail: 'Structured outreach securing bulk inventory through project partnerships' },
      { title: 'Continuous listing inventory expansion', detail: 'Net new listings growth tracked and incentivized weekly' },
    ],
  },
  {
    id: 'demand', label: 'Demand Growth', icon: Users, color: '--panel-info',
    items: [
      { title: 'AI opportunity insight content marketing', detail: 'Intelligence-driven content attracting high-intent investors' },
      { title: 'Investor demo funnel activation', detail: 'Structured conversion journey from discovery to first transaction' },
      { title: 'Organic SEO city traffic capture', detail: 'Location-specific content authority driving sustainable acquisition' },
    ],
  },
  {
    id: 'brand', label: 'Brand Positioning', icon: Globe, color: '--panel-success',
    items: [
      { title: 'Intelligent investment discovery platform', detail: 'Not a listing portal — an intelligence layer for smarter decisions' },
      { title: 'Data-driven property decision ecosystem', detail: 'Scoring, prediction, and analysis replacing gut-feel investing' },
      { title: 'Modern luxury proptech identity', detail: 'Premium visual identity signaling institutional-grade quality' },
    ],
  },
];

const revenueStreams = [
  { name: 'Property Sales Commission', pct: '1.0–2.5%', color: '--panel-accent' },
  { name: 'Developer Promotion Fees', pct: 'Per project', color: '--panel-info' },
  { name: 'Service Marketplace Margin', pct: '5–15%', color: '--panel-success' },
  { name: 'Premium Analytics Subscription', pct: 'SaaS tiers', color: '--panel-warning' },
];

const techAdvantage = [
  { label: 'Real-time opportunity ranking algorithms', icon: Zap, color: '--panel-accent' },
  { label: 'Predictive pricing analytics engine', icon: BarChart3, color: '--panel-info' },
  { label: 'Behavioral recommendation learning loop', icon: Brain, color: '--panel-success' },
  { label: 'Scalable cloud deployment architecture', icon: Layers, color: '--panel-warning' },
  { label: 'Realtime investor alert signal channels', icon: Target, color: '--panel-error' },
  { label: 'Automated background intelligence workers', icon: Rocket, color: '--panel-accent' },
];

const founderSystem = [
  { period: 'Daily', actions: ['Build product improvements', 'Grow marketplace supply', 'Engage investor demand'], color: '--panel-accent' },
  { period: 'Weekly', actions: ['Track traction metrics', 'Refine strategic positioning', 'Strengthen partnerships'], color: '--panel-info' },
  { period: 'Year 1', actions: ['Achieve intelligent marketplace traction'], color: '--panel-success' },
  { period: 'Year 2', actions: ['Expand ecosystem and AI depth'], color: '--panel-warning' },
  { period: 'Year 3', actions: ['Position as regional proptech intelligence leader'], color: '--panel-error' },
];

const successPrinciples = [
  { label: 'Consistent execution speed', icon: Rocket },
  { label: 'Marketplace liquidity dominance', icon: TrendingUp },
  { label: 'Intelligence differentiation clarity', icon: Brain },
  { label: 'Long-term founder persistence', icon: Shield },
];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  live: { bg: 'hsl(var(--panel-success) / 0.1)', text: 'hsl(var(--panel-success))', label: 'LIVE' },
  building: { bg: 'hsl(var(--panel-warning) / 0.1)', text: 'hsl(var(--panel-warning))', label: 'BUILDING' },
  planned: { bg: 'hsl(var(--panel-text-muted) / 0.1)', text: 'hsl(var(--panel-text-muted))', label: 'PLANNED' },
};

const UltimateMasterPlan: React.FC = () => {
  const [activePhase, setActivePhase] = useState('core');
  const [activeStrategy, setActiveStrategy] = useState('supply');
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const phase = phases.find(p => p.id === activePhase)!;
  const strategy = marketExecution.find(s => s.id === activeStrategy)!;
  const totalModules = phases.reduce((s, p) => s + p.modules.length, 0);
  const liveModules = phases.reduce((s, p) => s + p.modules.filter(m => m.status === 'live').length, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Hero header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[hsl(var(--panel-accent)/.15)] to-[hsl(var(--panel-warning)/.1)] border border-[hsl(var(--panel-accent)/.2)]">
            <Crown className="h-5 w-5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">ASTRA Villa — Ultimate Master Plan</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">AI Real Estate Intelligence Platform Blueprint</p>
          </div>
        </div>

        {/* Vision strip */}
        <div className="mt-3 p-2.5 rounded-lg border border-[hsl(var(--panel-accent)/.15)] bg-[hsl(var(--panel-accent)/.04)]">
          <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">
            <span className="font-bold text-[hsl(var(--panel-accent))]">Vision: </span>
            Build the leading intelligent real estate investment ecosystem that transforms how people discover, analyze, and transact property opportunities.
          </p>
        </div>

        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Phases', value: String(phases.length), color: '--panel-accent' },
            { label: 'Total Modules', value: String(totalModules), color: '--panel-info' },
            { label: 'Live', value: `${liveModules}/${totalModules}`, color: '--panel-success' },
            { label: 'Revenue Streams', value: String(revenueStreams.length), color: '--panel-warning' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── PRODUCT STRATEGY ─── */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
          <span className="text-[10px] font-bold text-[hsl(var(--panel-text))] uppercase tracking-wider">Product Strategy Foundation</span>
        </div>

        {/* Phase selectors */}
        <div className="grid grid-cols-5 gap-2 p-3">
          {phases.map(p => {
            const live = p.modules.filter(m => m.status === 'live').length;
            return (
              <button key={p.id} onClick={() => { setActivePhase(p.id); setExpandedModule(null); }}
                className={cn(
                  "rounded-lg border p-2.5 transition-all text-left",
                  activePhase === p.id
                    ? `bg-[hsl(var(${p.color})/.08)] border-[hsl(var(${p.color})/.25)]`
                    : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border))] hover:bg-[hsl(var(--panel-hover)/.3)]"
                )}>
                <div className="flex items-center gap-1.5 mb-1">
                  <p.icon className="h-3 w-3" style={{ color: `hsl(var(${p.color}))` }} />
                  <span className="text-[8px] font-bold font-mono" style={{ color: `hsl(var(${p.color}))` }}>{p.label}</span>
                </div>
                <span className="text-[9px] font-semibold text-[hsl(var(--panel-text))] block">{p.subtitle}</span>
                <span className="text-[7px] font-mono text-[hsl(var(--panel-text-muted))]">{live}/{p.modules.length} live</span>
              </button>
            );
          })}
        </div>

        {/* Phase modules */}
        <div className="divide-y divide-[hsl(var(--panel-border-subtle))] border-t border-[hsl(var(--panel-border-subtle))]">
          {phase.modules.map((m, idx) => {
            const sc = statusColors[m.status];
            return (
              <div key={idx} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(var(--panel-hover)/.1)] transition-colors">
                <div className="flex items-center justify-center w-5 h-5 rounded text-[8px] font-bold font-mono" style={{
                  color: `hsl(var(${phase.color}))`, backgroundColor: `hsl(var(${phase.color}) / 0.08)`, border: `1px solid hsl(var(${phase.color}) / 0.2)`,
                }}>{idx + 1}</div>
                <span className="text-[10px] font-medium text-[hsl(var(--panel-text))] flex-1">{m.name}</span>
                <span className="text-[7px] font-bold font-mono px-2 py-0.5 rounded-full" style={{ color: sc.text, backgroundColor: sc.bg }}>{sc.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── MARKET EXECUTION ─── */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
          <span className="text-[10px] font-bold text-[hsl(var(--panel-text))] uppercase tracking-wider">Market Execution Engine</span>
        </div>
        <div className="flex border-b border-[hsl(var(--panel-border-subtle))]">
          {marketExecution.map(s => (
            <button key={s.id} onClick={() => setActiveStrategy(s.id)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 text-[9px] font-bold transition-all border-b-2",
                activeStrategy === s.id
                  ? `border-[hsl(var(${s.color}))] text-[hsl(var(${s.color}))]`
                  : "border-transparent text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text-secondary))]"
              )}>
              <s.icon className="h-3 w-3" />
              {s.label}
            </button>
          ))}
        </div>
        <div className="p-3 space-y-2">
          {strategy.items.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[hsl(var(--panel-border-subtle))]">
              <div className="flex items-center justify-center w-5 h-5 rounded shrink-0 text-[8px] font-bold font-mono mt-0.5" style={{
                color: `hsl(var(${strategy.color}))`, backgroundColor: `hsl(var(${strategy.color}) / 0.08)`, border: `1px solid hsl(var(${strategy.color}) / 0.2)`,
              }}>{i + 1}</div>
              <div>
                <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))] block">{item.title}</span>
                <span className="text-[8px] text-[hsl(var(--panel-text-muted))] block mt-0.5">{item.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── REVENUE + TECH side by side ─── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Revenue */}
        <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
          <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
            <span className="text-[10px] font-bold text-[hsl(var(--panel-text))] uppercase tracking-wider">Revenue Model</span>
          </div>
          <div className="p-3 space-y-2">
            {revenueStreams.map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md border border-[hsl(var(--panel-border-subtle))]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: `hsl(var(${r.color}))` }} />
                <span className="text-[9px] font-medium text-[hsl(var(--panel-text))] flex-1">{r.name}</span>
                <span className="text-[8px] font-mono font-bold" style={{ color: `hsl(var(${r.color}))` }}>{r.pct}</span>
              </div>
            ))}
            <div className="mt-2 p-2 rounded-md bg-[hsl(var(--panel-hover)/.15)] border border-[hsl(var(--panel-border-subtle))]">
              <span className="text-[8px] font-bold text-[hsl(var(--panel-text-muted))] uppercase tracking-wider block mb-1">Scalability Logic</span>
              <p className="text-[8px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">Network effects from listing liquidity · Proprietary market intelligence dataset growth · Regional expansion opportunity</p>
            </div>
          </div>
        </div>

        {/* Tech advantage */}
        <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
          <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
            <span className="text-[10px] font-bold text-[hsl(var(--panel-text))] uppercase tracking-wider">Technology & Data Advantage</span>
          </div>
          <div className="p-3 space-y-1.5">
            {techAdvantage.map((t, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md border border-[hsl(var(--panel-border-subtle))]">
                <t.icon className="h-3 w-3 shrink-0" style={{ color: `hsl(var(${t.color}))` }} />
                <span className="text-[9px] font-medium text-[hsl(var(--panel-text))]">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FOUNDER EXECUTION + SUCCESS ─── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Founder system */}
        <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
          <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
            <span className="text-[10px] font-bold text-[hsl(var(--panel-text))] uppercase tracking-wider">Founder Execution System</span>
          </div>
          <div className="p-3 space-y-2">
            {founderSystem.map((f, i) => (
              <div key={i} className="p-2 rounded-md border border-[hsl(var(--panel-border-subtle))]">
                <span className="text-[8px] font-bold font-mono uppercase" style={{ color: `hsl(var(${f.color}))` }}>{f.period}</span>
                <div className="mt-1 space-y-0.5">
                  {f.actions.map((a, j) => (
                    <div key={j} className="flex items-center gap-1.5">
                      <ChevronRight className="h-2 w-2 text-[hsl(var(--panel-text-muted))]" />
                      <span className="text-[8px] text-[hsl(var(--panel-text-secondary))]">{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success principles */}
        <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
          <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
            <span className="text-[10px] font-bold text-[hsl(var(--panel-text))] uppercase tracking-wider">Success Principles</span>
          </div>
          <div className="p-3 space-y-2">
            {successPrinciples.map((sp, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-md border border-[hsl(var(--panel-border-subtle))]">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[hsl(var(--panel-accent)/.06)] border border-[hsl(var(--panel-accent)/.15)]">
                  <sp.icon className="h-3.5 w-3.5 text-[hsl(var(--panel-accent))]" />
                </div>
                <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">{sp.label}</span>
              </div>
            ))}
          </div>

          {/* Final objective */}
          <div className="mx-3 mb-3 p-2.5 rounded-lg border border-[hsl(var(--panel-accent)/.2)] bg-[hsl(var(--panel-accent)/.04)]">
            <span className="text-[8px] font-bold text-[hsl(var(--panel-accent))] uppercase tracking-wider block mb-1">Final Objective</span>
            <p className="text-[8px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">
              Transform ASTRA Villa into a trusted real estate investment intelligence infrastructure powering smarter property decisions across markets.
            </p>
          </div>
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Ultimate Master Plan v1.0 — {phases.length} phases · {totalModules} modules · {liveModules} live · {revenueStreams.length} revenue streams
      </p>
    </div>
  );
};

export default UltimateMasterPlan;
