import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Orbit, Zap, Eye, Battery, Fingerprint,
  ChevronRight, CheckCircle2, AlertTriangle, Clock,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Founder Life Operating System
   ═══════════════════════════════════════════════════════════ */

interface Practice {
  title: string;
  frequency: string;
  description: string;
}

interface Pillar {
  id: string;
  label: string;
  mantra: string;
  icon: LucideIcon;
  color: string;
  philosophy: string;
  practices: Practice[];
  antiPatterns: string[];
  weeklyCheckpoint: string;
}

const pillars: Pillar[] = [
  {
    id: 'execution', label: 'Execution Discipline', mantra: '"What you do daily compounds. What you skip daily decays."',
    icon: Zap, color: '--panel-accent',
    philosophy: 'Consistent high-impact action is the only reliable predictor of startup success. Protect your execution blocks like you protect your runway — because they are your runway.',
    practices: [
      { title: 'Daily Top-3 Commitment', frequency: 'Every morning', description: 'Before any screen, write the 3 highest-impact tasks for today. These are non-negotiable — everything else is secondary.' },
      { title: 'Platform Growth Driver Focus', frequency: 'Daily during deep work', description: 'Prioritize actions that directly grow listings, users, or revenue. Say no to anything that doesn\'t move these needles.' },
      { title: 'Weekly Progress Checkpoint', frequency: 'Every Friday', description: '30-minute self-review: What moved this week? What stalled? Score yourself 1–10 on execution quality.' },
      { title: '90-Day Sprint Rhythm', frequency: 'Quarterly', description: 'Set a single "impossible" goal per quarter. Break it into 12 weekly milestones. Review progress every Friday.' },
    ],
    antiPatterns: ['Filling days with busywork that feels productive but doesn\'t grow the platform', 'Starting mornings with email/Slack instead of deep work', 'Skipping weekly reviews because "there\'s no time"'],
    weeklyCheckpoint: 'Did I complete my Top-3 at least 4 out of 5 days this week?',
  },
  {
    id: 'thinking', label: 'Strategic Thinking Rhythm', mantra: '"The founder who only executes builds a treadmill. The one who thinks builds a flywheel."',
    icon: Eye, color: '--panel-info',
    philosophy: 'Execution without strategic thinking creates motion without progress. Dedicate protected time to zoom out — this is where competitive advantages are discovered, not manufactured.',
    practices: [
      { title: 'Friday Vision Block', frequency: 'Weekly · 2 hours', description: 'No laptop. Walk, whiteboard, or journal. Prompt: "What would I do differently if I restarted ASTRA Villa today?"' },
      { title: 'Market Signal Scanning', frequency: 'Weekly · 30 min', description: 'Review competitor moves, regulatory changes, investor sentiment, and PropTech industry news. Log insights.' },
      { title: 'Roadmap Insight Journal', frequency: 'Ongoing', description: 'Maintain a running document of platform evolution ideas. Review monthly to identify patterns and test hypotheses.' },
      { title: 'Quarterly Strategy Reset', frequency: 'Every 90 days', description: 'Full-day offsite (even solo). Reassess product direction, market positioning, and capital strategy from first principles.' },
    ],
    antiPatterns: ['Treating strategic thinking as a luxury that happens "when things slow down"', 'Confusing reading tech blogs with actual strategic analysis', 'Never writing down insights — letting pattern recognition die on the vine'],
    weeklyCheckpoint: 'Did I protect my 2-hour Friday Vision Block this week?',
  },
  {
    id: 'energy', label: 'Energy & Focus Sustainability', mantra: '"You are the infrastructure. If you crash, the platform crashes."',
    icon: Battery, color: '--panel-success',
    philosophy: 'Founder energy is the most undervalued asset in a startup. Sleep, movement, and recovery are not indulgences — they are the foundation of every decision, every pitch, every line of code you review.',
    practices: [
      { title: 'Sleep Architecture', frequency: 'Nightly', description: '7+ hours non-negotiable. Screen off by 22:00. Below 6 hours = flag next day as reduced decision-making capacity.' },
      { title: 'Morning Movement', frequency: 'Daily · 30 min', description: 'Exercise before any screen. Running, gym, or yoga. This is cognitive infrastructure, not optional wellness.' },
      { title: 'Digital Distraction Protocol', frequency: 'Daily', description: 'Phone on DND during deep work blocks. Social media consumption batched to one 15-min slot. No news before 10:00.' },
      { title: 'Recovery Sabbath', frequency: 'Weekly · Saturday', description: 'One full day with zero work obligations. Nature, relationships, hobbies. This recharges creative capacity for the week.' },
    ],
    antiPatterns: ['Wearing sleep deprivation as a badge of honor', 'Skipping exercise "because there\'s too much to do"', 'Doom-scrolling social media during recovery time'],
    weeklyCheckpoint: 'Did I get 7+ hours of sleep at least 5 nights and exercise at least 4 days?',
  },
  {
    id: 'identity', label: 'Identity Alignment', mantra: '"You are not building an app. You are building the intelligence layer of Southeast Asian real estate."',
    icon: Fingerprint, color: '--panel-warning',
    philosophy: 'The deepest source of founder resilience isn\'t discipline — it\'s identity. When you internalize that you are a builder of intelligent infrastructure, temporary setbacks become data points, not threats.',
    practices: [
      { title: 'Builder Identity Anchoring', frequency: 'Daily · 2 min', description: 'Morning affirmation: "I am building the AI intelligence infrastructure that transforms how people invest in property." Internalize the mission.' },
      { title: 'Long-Term Patience Practice', frequency: 'When frustrated', description: 'When progress feels slow, zoom out to the 3-year roadmap. Ask: "Am I closer to Year 1 milestones than last month?" Almost always yes.' },
      { title: 'Setback Reframing Protocol', frequency: 'When needed', description: 'Every failure gets a 24-hour emotional window, then a written post-mortem: What did I learn? What do I change? Move forward.' },
      { title: 'Founder Peer Connection', frequency: 'Bi-weekly', description: 'Regular conversations with other founders. Not for advice — for perspective. Isolation is the silent killer of founder motivation.' },
    ],
    antiPatterns: ['Tying self-worth to daily metrics instead of long-term trajectory', 'Comparing your Year 1 to someone else\'s Year 5', 'Isolating when things get hard instead of reaching out'],
    weeklyCheckpoint: 'Am I still excited about where ASTRA Villa is heading in 3 years?',
  },
];

const FounderLifeOS: React.FC = () => {
  const [activePillar, setActivePillar] = useState('execution');
  const [expandedPractice, setExpandedPractice] = useState<number | null>(null);

  const active = pillars.find(p => p.id === activePillar)!;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Orbit className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Founder Life Operating System</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Personal discipline, business execution, and long-term vision — unified into one operating philosophy</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Pillars', value: String(pillars.length), color: '--panel-accent' },
            { label: 'Practices', value: String(pillars.reduce((s, p) => s + p.practices.length, 0)), color: '--panel-info' },
            { label: 'Horizon', value: 'Multi-Year', color: '--panel-success' },
            { label: 'Core Rule', value: 'Compound Daily', color: '--panel-warning' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pillar selectors */}
      <div className="grid grid-cols-4 gap-3">
        {pillars.map(p => (
          <button key={p.id} onClick={() => { setActivePillar(p.id); setExpandedPractice(null); }}
            className={cn(
              "rounded-lg border p-3 transition-all text-left",
              activePillar === p.id
                ? `bg-[hsl(var(${p.color})/.08)] border-[hsl(var(${p.color})/.25)]`
                : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border))] hover:bg-[hsl(var(--panel-hover)/.3)]"
            )} style={{ boxShadow: 'var(--panel-shadow)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <p.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${p.color}))` }} />
              <span className="text-[10px] font-bold" style={{ color: `hsl(var(${p.color}))` }}>{p.label}</span>
            </div>
            <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">{p.practices.length} practices</span>
          </button>
        ))}
      </div>

      {/* Mantra + philosophy */}
      <div className="rounded-lg border border-[hsl(var(--panel-border-subtle))] px-4 py-3 bg-[hsl(var(--panel-hover)/.15)]">
        <p className="text-[10px] italic text-[hsl(var(--panel-text-muted))] mb-1.5">{active.mantra}</p>
        <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{active.philosophy}</p>
      </div>

      {/* Practices */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
          <span className="text-[10px] font-bold text-[hsl(var(--panel-text))]">Core Practices</span>
        </div>
        <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
          {active.practices.map((pr, idx) => {
            const isOpen = expandedPractice === idx;
            return (
              <div key={idx}>
                <button onClick={() => setExpandedPractice(isOpen ? null : idx)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.15)] transition-colors text-left">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md text-[9px] font-bold font-mono" style={{
                    color: `hsl(var(${active.color}))`, backgroundColor: `hsl(var(${active.color}) / 0.08)`, border: `1px solid hsl(var(${active.color}) / 0.2)`,
                  }}>{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))] block">{pr.title}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="h-2 w-2 text-[hsl(var(--panel-text-muted))]" />
                      <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{pr.frequency}</span>
                    </div>
                  </div>
                  <ChevronRight className={cn("h-3 w-3 text-[hsl(var(--panel-text-muted))] shrink-0 transition-transform", isOpen && "rotate-90")} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed ml-9 p-2.5 rounded-md border border-[hsl(var(--panel-border-subtle))]">{pr.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Anti-patterns + weekly checkpoint */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-3" style={{ boxShadow: 'var(--panel-shadow)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3 w-3 text-[hsl(var(--panel-error))]" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-error))]">Anti-Patterns to Avoid</span>
          </div>
          <ul className="space-y-1.5">
            {active.antiPatterns.map(a => (
              <li key={a} className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed flex items-start gap-1.5">
                <span className="w-1 h-1 rounded-full mt-1.5 shrink-0 bg-[hsl(var(--panel-error))]" />
                {a}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-3" style={{ boxShadow: 'var(--panel-shadow)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="h-3 w-3" style={{ color: `hsl(var(${active.color}))` }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: `hsl(var(${active.color}))` }}>Weekly Checkpoint Question</span>
          </div>
          <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] leading-relaxed italic">{active.weeklyCheckpoint}</p>
          <p className="text-[8px] text-[hsl(var(--panel-text-muted))] mt-2">Answer honestly every Friday. If "no" for 2+ consecutive weeks, recalibrate immediately.</p>
        </div>
      </div>

      {/* Operating system summary */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
          <Orbit className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
          <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">The Compounding Loop</span>
        </div>
        <div className="grid grid-cols-4 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {pillars.map(p => (
            <div key={p.id} className="bg-[hsl(var(--panel-bg))] p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <p.icon className="h-3 w-3" style={{ color: `hsl(var(${p.color}))` }} />
                <span className="text-[9px] font-bold" style={{ color: `hsl(var(${p.color}))` }}>{p.label}</span>
              </div>
              <p className="text-[8px] text-[hsl(var(--panel-text-muted))] leading-relaxed">
                {p.id === 'execution' && 'Daily actions compound into weekly progress into quarterly milestones.'}
                {p.id === 'thinking' && 'Strategic clarity prevents wasted execution cycles and reveals leverage points.'}
                {p.id === 'energy' && 'Sustained energy ensures decision quality doesn\'t degrade under pressure.'}
                {p.id === 'identity' && 'Mission-aligned identity provides resilience when metrics temporarily dip.'}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Founder Life OS v1.0 — {pillars.length} pillars · {pillars.reduce((s, p) => s + p.practices.length, 0)} practices · Designed for multi-year sustained performance
      </p>
    </div>
  );
};

export default FounderLifeOS;
