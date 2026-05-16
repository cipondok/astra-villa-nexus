import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Activity, Droplets, Brain, Megaphone, Rocket, Anchor,
  ChevronRight, TrendingUp, AlertTriangle, Target, Shield,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Success Probability Enhancement Framework
   ═══════════════════════════════════════════════════════════ */

interface Lever {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  weight: number;
  thesis: string;
  drivers: { action: string; rationale: string; metric: string }[];
  failureMode: string;
  survivalImpact: string;
}

const levers: Lever[] = [
  {
    id: 'liquidity', label: 'Marketplace Liquidity', icon: Droplets, color: '--panel-accent', weight: 30,
    thesis: 'Marketplaces die from liquidity starvation. Continuous growth of quality supply paired with engaged demand creates the self-reinforcing flywheel that defines marketplace winners.',
    drivers: [
      { action: 'Grow quality listing inventory week-over-week', rationale: 'Supply attracts demand. Investors come for selection — no listings, no platform.', metric: 'Net new listings/week ≥ 50' },
      { action: 'Maintain investor discovery engagement loops', rationale: 'Watchlists, alerts, and recommendations keep investors returning without marketing spend.', metric: 'WAU retention ≥ 40%' },
      { action: 'Reduce time-to-first-inquiry for new listings', rationale: 'Fast demand signal validates supply quality and keeps agents motivated to list more.', metric: 'Median time-to-inquiry < 72h' },
    ],
    failureMode: 'Chicken-and-egg death spiral: no supply → no demand → agents leave → platform irrelevance.',
    survivalImpact: 'Liquidity is the #1 predictor of marketplace survival. Without it, no other lever matters.',
  },
  {
    id: 'intelligence', label: 'Intelligence Differentiation', icon: Brain, color: '--panel-info', weight: 25,
    thesis: 'In a market of commodity property listings, AI-powered intelligence is the only sustainable moat. Scoring accuracy and predictive insights create switching costs that directory listings never will.',
    drivers: [
      { action: 'Continuously improve AI scoring accuracy', rationale: 'Higher accuracy → higher trust → more user reliance → stronger moat. Target: 90%+ accuracy.', metric: 'Scoring accuracy ≥ 90%' },
      { action: 'Highlight data advantage as core narrative', rationale: 'Investors don\'t pay for listings — they pay for intelligence that reduces decision risk.', metric: 'Intelligence features cited in 60%+ of user testimonials' },
      { action: 'Expand predictive capabilities monthly', rationale: 'Market cycle detection, capital flows, and price forecasting create institutional-grade value.', metric: '≥ 2 new intelligence features/quarter' },
    ],
    failureMode: 'Becoming "just another property portal" — competing on price instead of intelligence value.',
    survivalImpact: 'Intelligence moat determines whether ASTRA Villa commands premium pricing or races to the bottom.',
  },
  {
    id: 'distribution', label: 'Distribution Strength', icon: Megaphone, color: '--panel-success', weight: 20,
    thesis: 'Product quality is necessary but insufficient. Distribution channels — developer partnerships and organic content authority — determine whether great products find their market.',
    drivers: [
      { action: 'Build developer partnership pipeline', rationale: 'Developer projects bring bulk supply and institutional credibility simultaneously.', metric: '10+ developer partnerships signed/quarter' },
      { action: 'Invest in content-driven organic traffic', rationale: 'SEO content compounds over time — each article is a permanent acquisition channel.', metric: 'Organic traffic growth ≥ 20% MoM' },
      { action: 'Activate agent referral network', rationale: 'Agents are distribution multipliers — each one brings their client network to the platform.', metric: 'Agent referral contribution ≥ 25% of new users' },
    ],
    failureMode: 'Building a great product nobody discovers. Relying solely on paid ads with unsustainable CAC.',
    survivalImpact: 'Distribution determines growth efficiency. High CAC kills startups faster than bad product.',
  },
  {
    id: 'speed', label: 'Execution Speed', icon: Rocket, color: '--panel-warning', weight: 15,
    thesis: 'Speed of learning — not speed of coding — is the competitive advantage. Ship, measure, adapt. The fastest learning organization wins the market.',
    drivers: [
      { action: 'Ship incremental improvements every sprint', rationale: 'Continuous deployment creates continuous learning. Stalled shipping = stalled intelligence.', metric: 'Sprint delivery rate ≥ 85%' },
      { action: 'Test market feedback within 48 hours', rationale: 'Fast feedback loops prevent building the wrong thing for months before discovering it.', metric: 'Feedback-to-backlog triage < 48h' },
      { action: 'Adapt positioning based on data signals', rationale: 'Market positioning is a hypothesis — test it like a feature, not a religion.', metric: 'Monthly positioning review with data backing' },
    ],
    failureMode: 'Slow iteration cycles that let faster competitors capture user habits first.',
    survivalImpact: 'Execution speed is the equalizer — small teams beat large ones through iteration velocity.',
  },
  {
    id: 'persistence', label: 'Founder Persistence', icon: Anchor, color: '--panel-error', weight: 10,
    thesis: 'The #1 reason startups fail isn\'t product or market — it\'s founders who quit too early. Multi-year commitment through uncertainty is the most underrated success factor.',
    drivers: [
      { action: 'Maintain 3+ year commitment horizon', rationale: 'Marketplace businesses take 3-5 years to reach escape velocity. Patience is structural.', metric: 'Annual re-commitment assessment: YES' },
      { action: 'Avoid premature pivots without data validation', rationale: 'Pivoting from discomfort ≠ pivoting from data. Require 90 days of signal before major direction changes.', metric: 'No strategic pivot without 90-day data support' },
      { action: 'Build support systems for sustained motivation', rationale: 'Peer founders, advisors, and personal routines prevent isolation-driven abandonment.', metric: 'Bi-weekly founder peer connection maintained' },
    ],
    failureMode: 'Quitting at the "trough of sorrow" — 12-18 months in when growth feels impossible but compounding hasn\'t kicked in yet.',
    survivalImpact: 'Persistence through the valley of death is literally the difference between 0 and 1.',
  },
];

const totalWeight = levers.reduce((s, l) => s + l.weight, 0);

const SuccessProbabilityFramework: React.FC = () => {
  const [activeLever, setActiveLever] = useState('liquidity');
  const [expandedDriver, setExpandedDriver] = useState<number | null>(null);

  const active = levers.find(l => l.id === activeLever)!;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Activity className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Success Probability Enhancement Framework</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Weighted leverage factors that maximize market traction and investor confidence</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Levers', value: String(levers.length), color: '--panel-accent' },
            { label: 'Total Drivers', value: String(levers.reduce((s, l) => s + l.drivers.length, 0)), color: '--panel-info' },
            { label: 'Model', value: 'Weighted Impact', color: '--panel-success' },
            { label: 'Goal', value: 'Maximize P(survival)', color: '--panel-warning' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lever weight bar overview */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-text-muted))] block mb-2">Impact Weight Distribution</span>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {levers.map(l => (
            <button key={l.id} onClick={() => { setActiveLever(l.id); setExpandedDriver(null); }}
              className="relative transition-all hover:opacity-80"
              style={{ width: `${(l.weight / totalWeight) * 100}%`, backgroundColor: `hsl(var(${l.color}))`, opacity: activeLever === l.id ? 1 : 0.4 }}
              title={`${l.label}: ${l.weight}%`} />
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          {levers.map(l => (
            <span key={l.id} className="text-[7px] font-mono font-bold" style={{ color: `hsl(var(${l.color}))`, opacity: activeLever === l.id ? 1 : 0.5 }}>{l.weight}%</span>
          ))}
        </div>
      </div>

      {/* Lever selectors */}
      <div className="grid grid-cols-5 gap-3">
        {levers.map(l => (
          <button key={l.id} onClick={() => { setActiveLever(l.id); setExpandedDriver(null); }}
            className={cn(
              "rounded-lg border p-3 transition-all text-left",
              activeLever === l.id
                ? `bg-[hsl(var(${l.color})/.08)] border-[hsl(var(${l.color})/.25)]`
                : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border))] hover:bg-[hsl(var(--panel-hover)/.3)]"
            )} style={{ boxShadow: 'var(--panel-shadow)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <l.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${l.color}))` }} />
              <span className="text-[9px] font-bold" style={{ color: `hsl(var(${l.color}))` }}>{l.label}</span>
            </div>
            <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{l.weight}% weight · {l.drivers.length} drivers</span>
          </button>
        ))}
      </div>

      {/* Thesis */}
      <div className="rounded-lg border border-[hsl(var(--panel-border-subtle))] px-4 py-3 bg-[hsl(var(--panel-hover)/.15)]">
        <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">
          <span className="font-bold" style={{ color: `hsl(var(${active.color}))` }}>Thesis: </span>{active.thesis}
        </p>
      </div>

      {/* Drivers */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
          <span className="text-[10px] font-bold text-[hsl(var(--panel-text))]">Growth Drivers</span>
        </div>
        <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
          {active.drivers.map((d, idx) => {
            const isOpen = expandedDriver === idx;
            return (
              <div key={idx}>
                <button onClick={() => setExpandedDriver(isOpen ? null : idx)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.15)] transition-colors text-left">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md text-[9px] font-bold font-mono" style={{
                    color: `hsl(var(${active.color}))`, backgroundColor: `hsl(var(${active.color}) / 0.08)`, border: `1px solid hsl(var(${active.color}) / 0.2)`,
                  }}>{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))] block">{d.action}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Target className="h-2 w-2" style={{ color: `hsl(var(${active.color}))` }} />
                      <span className="text-[8px] font-mono" style={{ color: `hsl(var(${active.color}))` }}>{d.metric}</span>
                    </div>
                  </div>
                  <ChevronRight className={cn("h-3 w-3 text-[hsl(var(--panel-text-muted))] shrink-0 transition-transform", isOpen && "rotate-90")} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed ml-9 p-2.5 rounded-md border border-[hsl(var(--panel-border-subtle))]">
                      <span className="font-bold text-[hsl(var(--panel-text))]">Why: </span>{d.rationale}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Failure mode + survival impact */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-3" style={{ boxShadow: 'var(--panel-shadow)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3 w-3 text-[hsl(var(--panel-error))]" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-error))]">Failure Mode</span>
          </div>
          <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{active.failureMode}</p>
        </div>
        <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-3" style={{ boxShadow: 'var(--panel-shadow)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Shield className="h-3 w-3" style={{ color: `hsl(var(${active.color}))` }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: `hsl(var(${active.color}))` }}>Survival Impact</span>
          </div>
          <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{active.survivalImpact}</p>
        </div>
      </div>

      {/* Compounding model */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
          <TrendingUp className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
          <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">The Compounding Success Model</span>
        </div>
        <div className="grid grid-cols-5 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {levers.map(l => (
            <div key={l.id} className="bg-[hsl(var(--panel-bg))] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <l.icon className="h-3 w-3" style={{ color: `hsl(var(${l.color}))` }} />
                <span className="text-[8px] font-bold" style={{ color: `hsl(var(${l.color}))` }}>{l.weight}%</span>
              </div>
              <span className="text-[8px] font-bold text-[hsl(var(--panel-text))] block mb-0.5">{l.label}</span>
              <p className="text-[7px] text-[hsl(var(--panel-text-muted))] leading-relaxed">
                {l.id === 'liquidity' && 'Supply + demand flywheel creates self-reinforcing growth.'}
                {l.id === 'intelligence' && 'AI moat increases switching costs and premium pricing power.'}
                {l.id === 'distribution' && 'Channels compound — each partnership and article is permanent.'}
                {l.id === 'speed' && 'Fast iteration = fast learning = faster product-market fit.'}
                {l.id === 'persistence' && 'Time in market enables all other levers to compound.'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Success Probability Framework v1.0 — {levers.length} weighted levers · {levers.reduce((s, l) => s + l.drivers.length, 0)} growth drivers · Maximize P(survival) through disciplined focus
      </p>
    </div>
  );
};

export default SuccessProbabilityFramework;
