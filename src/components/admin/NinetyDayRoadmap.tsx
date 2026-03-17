import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  CalendarClock, Package, Store, Megaphone, ChevronRight,
  CheckCircle2, Circle, Target, Zap, type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — 90-Day Execution Roadmap
   ═══════════════════════════════════════════════════════════ */

type Track = 'product' | 'marketplace' | 'growth';

interface Action {
  text: string;
  track: Track;
}

interface PhaseData {
  id: string;
  label: string;
  days: string;
  subtitle: string;
  color: string;
  actions: Action[];
}

const trackMeta: Record<Track, { label: string; icon: LucideIcon; color: string }> = {
  product: { label: 'Product', icon: Package, color: '--panel-accent' },
  marketplace: { label: 'Marketplace', icon: Store, color: '--panel-info' },
  growth: { label: 'Growth', icon: Megaphone, color: '--panel-success' },
};

const phases: PhaseData[] = [
  {
    id: 'foundation', label: 'Phase 1', days: 'Days 1–30', subtitle: 'Foundation Build', color: '--panel-accent',
    actions: [
      { text: 'Finalize listing system core UX', track: 'product' },
      { text: 'Implement search + filter performance optimization', track: 'product' },
      { text: 'Deploy opportunity score display on property cards', track: 'product' },
      { text: 'Onboard minimum 50 active listings', track: 'marketplace' },
      { text: 'Secure at least one developer project partnership', track: 'marketplace' },
      { text: 'Build simple CRM tracker for agent conversations', track: 'marketplace' },
      { text: 'Publish daily AI property insight social content', track: 'growth' },
      { text: 'Launch early investor waitlist landing page', track: 'growth' },
      { text: 'Conduct weekly live demo sessions', track: 'growth' },
    ],
  },
  {
    id: 'engagement', label: 'Phase 2', days: 'Days 31–60', subtitle: 'Engagement & Differentiation', color: '--panel-info',
    actions: [
      { text: 'Launch watchlist and alert notification features', track: 'product' },
      { text: 'Deploy AI price drop detection engine', track: 'product' },
      { text: 'Release property comparison tool', track: 'product' },
      { text: 'Expand listings to second city', track: 'marketplace' },
      { text: 'Start service provider onboarding pilot', track: 'marketplace' },
      { text: 'Initiate first JV project promotion campaign', track: 'marketplace' },
      { text: 'Run targeted paid ads testing investor acquisition', track: 'growth' },
      { text: 'Publish SEO city landing pages', track: 'growth' },
      { text: 'Activate referral incentive system', track: 'growth' },
    ],
  },
  {
    id: 'monetization', label: 'Phase 3', days: 'Days 61–90', subtitle: 'Monetization & Scale Signal', color: '--panel-warning',
    actions: [
      { text: 'Launch developer project dashboard', track: 'product' },
      { text: 'Deploy basic portfolio analytics feature', track: 'product' },
      { text: 'Implement commission tracking admin panel', track: 'product' },
      { text: 'Push first transaction closure focus', track: 'marketplace' },
      { text: 'Strengthen agent partnership retention', track: 'marketplace' },
      { text: 'Grow developer pipeline discussions', track: 'marketplace' },
      { text: 'Publish investment trend report content', track: 'growth' },
      { text: 'Approach potential angel investors', track: 'growth' },
      { text: 'Refine pitch narrative using traction metrics', track: 'growth' },
    ],
  },
];

const NinetyDayRoadmap: React.FC = () => {
  const [activePhase, setActivePhase] = useState('foundation');
  const [trackFilter, setTrackFilter] = useState<Track | 'all'>('all');

  const phase = phases.find(p => p.id === activePhase)!;
  const filtered = trackFilter === 'all' ? phase.actions : phase.actions.filter(a => a.track === trackFilter);
  const totalActions = phases.reduce((s, p) => s + p.actions.length, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <CalendarClock className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">90-Day Execution Roadmap</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Structured launch plan — product, marketplace, and growth in parallel</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Phases', value: '3', color: '--panel-accent' },
            { label: 'Total Actions', value: String(totalActions), color: '--panel-info' },
            { label: 'Tracks', value: '3', color: '--panel-success' },
            { label: 'Goal', value: 'PMF Traction', color: '--panel-warning' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline bar */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-text-muted))] block mb-2">Execution Timeline</span>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {phases.map(p => (
            <button key={p.id} onClick={() => { setActivePhase(p.id); setTrackFilter('all'); }}
              className="relative flex-1 transition-all hover:opacity-80"
              style={{ backgroundColor: `hsl(var(${p.color}))`, opacity: activePhase === p.id ? 1 : 0.35 }}
              title={`${p.days}: ${p.subtitle}`} />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {phases.map(p => (
            <span key={p.id} className="text-[8px] font-mono font-bold" style={{ color: `hsl(var(${p.color}))`, opacity: activePhase === p.id ? 1 : 0.5 }}>{p.days}</span>
          ))}
        </div>
      </div>

      {/* Phase selectors */}
      <div className="grid grid-cols-3 gap-3">
        {phases.map(p => (
          <button key={p.id} onClick={() => { setActivePhase(p.id); setTrackFilter('all'); }}
            className={cn(
              "rounded-lg border p-3 transition-all text-left",
              activePhase === p.id
                ? `bg-[hsl(var(${p.color})/.08)] border-[hsl(var(${p.color})/.25)]`
                : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border))] hover:bg-[hsl(var(--panel-hover)/.3)]"
            )} style={{ boxShadow: 'var(--panel-shadow)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <Zap className="h-3 w-3" style={{ color: `hsl(var(${p.color}))` }} />
              <span className="text-[9px] font-bold font-mono" style={{ color: `hsl(var(${p.color}))` }}>{p.label}</span>
            </div>
            <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))] block">{p.subtitle}</span>
            <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{p.days} · {p.actions.length} actions</span>
          </button>
        ))}
      </div>

      {/* Track filter tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTrackFilter('all')}
          className={cn(
            "px-3 py-1.5 rounded-md text-[9px] font-bold transition-all border",
            trackFilter === 'all'
              ? "bg-[hsl(var(--panel-text)/.08)] border-[hsl(var(--panel-text)/.2)] text-[hsl(var(--panel-text))]"
              : "border-[hsl(var(--panel-border))] text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text-secondary))]"
          )}>All Tracks</button>
        {(Object.entries(trackMeta) as [Track, typeof trackMeta[Track]][]).map(([key, meta]) => (
          <button key={key} onClick={() => setTrackFilter(key)}
            className={cn(
              "px-3 py-1.5 rounded-md text-[9px] font-bold transition-all border flex items-center gap-1.5",
              trackFilter === key
                ? `bg-[hsl(var(${meta.color})/.08)] border-[hsl(var(${meta.color})/.25)]`
                : "border-[hsl(var(--panel-border))] text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text-secondary))]"
            )}>
            <meta.icon className="h-3 w-3" style={{ color: `hsl(var(${meta.color}))` }} />
            <span style={{ color: trackFilter === key ? `hsl(var(${meta.color}))` : undefined }}>{meta.label}</span>
          </button>
        ))}
      </div>

      {/* Actions list */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Target className="h-3 w-3" style={{ color: `hsl(var(${phase.color}))` }} />
            <span className="text-[10px] font-bold text-[hsl(var(--panel-text))]">{phase.subtitle} — Action Items</span>
          </div>
          <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{filtered.length} items</span>
        </div>
        <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
          {filtered.map((a, idx) => {
            const tm = trackMeta[a.track];
            return (
              <div key={idx} className="flex items-center gap-3 px-4 py-2.5 hover:bg-[hsl(var(--panel-hover)/.1)] transition-colors">
                <Circle className="h-2.5 w-2.5 shrink-0" style={{ color: `hsl(var(${tm.color}))` }} />
                <span className="text-[10px] font-medium text-[hsl(var(--panel-text))] flex-1">{a.text}</span>
                <span className="text-[7px] font-bold font-mono px-2 py-0.5 rounded-full shrink-0" style={{
                  color: `hsl(var(${tm.color}))`,
                  backgroundColor: `hsl(var(${tm.color}) / 0.08)`,
                  border: `1px solid hsl(var(${tm.color}) / 0.2)`,
                }}>{tm.label.toUpperCase()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Track distribution per phase */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
          <span className="text-[10px] font-bold text-[hsl(var(--panel-text))] uppercase tracking-wider">Track Distribution Across Phases</span>
        </div>
        <div className="grid grid-cols-3 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {phases.map(p => {
            const counts: Record<Track, number> = { product: 0, marketplace: 0, growth: 0 };
            p.actions.forEach(a => counts[a.track]++);
            return (
              <div key={p.id} className="bg-[hsl(var(--panel-bg))] p-3">
                <span className="text-[8px] font-bold font-mono block mb-2" style={{ color: `hsl(var(${p.color}))` }}>{p.days}</span>
                {(Object.entries(counts) as [Track, number][]).map(([track, count]) => {
                  const tm = trackMeta[track];
                  return (
                    <div key={track} className="flex items-center gap-2 mb-1">
                      <tm.icon className="h-2.5 w-2.5" style={{ color: `hsl(var(${tm.color}))` }} />
                      <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--panel-border-subtle))] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${(count / p.actions.length) * 100}%`,
                          backgroundColor: `hsl(var(${tm.color}))`,
                        }} />
                      </div>
                      <span className="text-[7px] font-mono font-bold" style={{ color: `hsl(var(${tm.color}))` }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Final goal */}
      <div className="rounded-lg border border-[hsl(var(--panel-accent)/.2)] bg-[hsl(var(--panel-accent)/.04)] px-4 py-3">
        <div className="flex items-center gap-1.5 mb-1">
          <CheckCircle2 className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-accent))]">90-Day Objective</span>
        </div>
        <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">
          Achieve early product-market traction signals and initial monetization readiness — validated through active listings, engaged investors, first transactions, and a data-backed pitch narrative.
        </p>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa 90-Day Execution Roadmap v1.0 — 3 phases · {totalActions} actions · 3 parallel tracks · Product-market fit within 90 days
      </p>
    </div>
  );
};

export default NinetyDayRoadmap;
