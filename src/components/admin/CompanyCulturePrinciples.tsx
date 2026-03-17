import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Heart, Database, Zap, ShieldCheck, Users, Brain,
  Calendar, ListOrdered, MessageCircle, RotateCcw,
  ChevronRight, Sparkles, type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Company Culture & Workflow Principles
   ═══════════════════════════════════════════════════════════ */

interface Principle {
  title: string;
  icon: LucideIcon;
  color: string;
  mantra: string;
  description: string;
  behaviors: string[];
  antiPatterns: string[];
}

interface WorkflowPractice {
  title: string;
  icon: LucideIcon;
  color: string;
  cadence: string;
  description: string;
  rituals: string[];
}

const culturePrinciples: Principle[] = [
  {
    title: 'Data-Driven Decisions', icon: Database, color: '--panel-accent',
    mantra: '"Show me the data, then show me the decision."',
    description: 'Every strategic choice is grounded in platform analytics, user behavior signals, and market intelligence — not gut feelings.',
    behaviors: ['Reference KPI dashboards before proposing changes', 'A/B test assumptions before full rollout', 'Share data context in every proposal doc'],
    antiPatterns: ['Making product decisions based on one user complaint', 'Ignoring metrics that contradict a preferred narrative'],
  },
  {
    title: 'Bias Toward Action', icon: Zap, color: '--panel-info',
    mantra: '"Ship it, learn, iterate. Perfect is the enemy of growth."',
    description: 'Speed compounds. We favor reversible decisions made quickly over slow, committee-driven consensus that kills momentum.',
    behaviors: ['Ship MVPs within sprint cycles', 'Default to 70% confidence threshold for reversible decisions', 'Timebox debates to 15 minutes max'],
    antiPatterns: ['Waiting for perfect data to make any move', 'Endless design committee reviews for small features'],
  },
  {
    title: 'Trust & Transparency', icon: ShieldCheck, color: '--panel-success',
    mantra: '"Our users invest money — they deserve radical honesty."',
    description: 'We earn investor and agent trust by being transparent about data accuracy, platform limitations, and fee structures.',
    behaviors: ['Disclose AI confidence levels alongside predictions', 'Proactively communicate issues before users discover them', 'Clear pricing with no hidden fees'],
    antiPatterns: ['Overpromising AI accuracy to close deals', 'Hiding platform incidents from affected users'],
  },
  {
    title: 'Ownership Mentality', icon: Users, color: '--panel-warning',
    mantra: '"Your domain, your accountability, your impact."',
    description: 'Every team member owns outcomes end-to-end. No task is "someone else\'s problem" — if you see it, you own getting it resolved.',
    behaviors: ['Follow through from idea → implementation → measurement', 'Escalate blockers within 24 hours, never silently wait', 'Celebrate shipped impact, not just effort'],
    antiPatterns: ['Saying "that\'s not my job" to a user-facing issue', 'Handing off tasks without context or follow-up'],
  },
  {
    title: 'Continuous AI Experimentation', icon: Brain, color: '--panel-error',
    mantra: '"The intelligence layer is our moat — keep sharpening it."',
    description: 'We treat AI as a living system. Every team member is encouraged to propose intelligence improvements, test hypotheses, and push model boundaries.',
    behaviors: ['Dedicate 10% of sprint capacity to AI experiments', 'Log every model performance observation', 'Cross-pollinate domain insights into AI training data'],
    antiPatterns: ['Treating AI models as "set and forget"', 'Ignoring user feedback signals that could improve predictions'],
  },
];

const workflowPractices: WorkflowPractice[] = [
  {
    title: 'Sprint Planning Discipline', icon: Calendar, color: '--panel-accent',
    cadence: 'Every Monday · 60 min',
    description: 'Two-week sprints with clear commitments. Each sprint starts with prioritized backlog grooming and capacity allocation.',
    rituals: ['Backlog grooming before planning (Friday prior)', 'Story point estimation with full team', 'Sprint goal statement agreed and documented', 'Capacity reserved: 80% features / 10% bugs / 10% tech debt'],
  },
  {
    title: 'Feature Prioritization', icon: ListOrdered, color: '--panel-info',
    cadence: 'Bi-weekly · Async + 30 min sync',
    description: 'ICE scoring (Impact × Confidence × Ease) drives prioritization. Revenue-linked features get 1.5× weight multiplier.',
    rituals: ['Product roadmap updated every 2 weeks', 'ICE scores visible to entire team', 'Top 3 priorities communicated in Slack channel', 'Quarterly OKR alignment check on roadmap'],
  },
  {
    title: 'Open Cross-Team Communication', icon: MessageCircle, color: '--panel-success',
    cadence: 'Daily · Async standup + weekly sync',
    description: 'Product, engineering, and growth share a single source of truth. No information silos. Decisions are documented publicly.',
    rituals: ['Daily async standup: done / doing / blocked', 'Weekly all-hands sync (15 min)', 'Decision log updated for every strategic choice', 'Shared Slack channels per initiative, not per team'],
  },
  {
    title: 'Rapid Feedback Integration', icon: RotateCcw, color: '--panel-warning',
    cadence: 'Continuous · Weekly review',
    description: 'User feedback flows directly into the product backlog. Critical insights from investors and agents are triaged within 48 hours.',
    rituals: ['In-app feedback widget data reviewed weekly', 'Top 5 user pain points tracked on public board', 'Demo feedback logged same-day into backlog', 'Monthly "Voice of Customer" summary shared company-wide'],
  },
];

const CompanyCulturePrinciples: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'culture' | 'workflow'>('culture');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Heart className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Culture & Workflow Principles</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Aligned mindset and execution philosophy — innovation, speed, and long-term vision</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Core Values', value: String(culturePrinciples.length), color: '--panel-accent' },
            { label: 'Workflow Practices', value: String(workflowPractices.length), color: '--panel-info' },
            { label: 'Philosophy', value: 'Ship Fast, Learn Faster', color: '--panel-success' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {([['culture', 'Culture Principles', Sparkles], ['workflow', 'Workflow Practices', Calendar]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => { setActiveTab(id); setExpandedIdx(null); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[10px] font-bold transition-all",
              activeTab === id
                ? "bg-[hsl(var(--panel-accent)/.08)] border-[hsl(var(--panel-accent)/.25)] text-[hsl(var(--panel-accent))]"
                : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border))] text-[hsl(var(--panel-text-muted))] hover:bg-[hsl(var(--panel-hover)/.3)]"
            )}>
            <Icon className="h-3 w-3" />{label}
          </button>
        ))}
      </div>

      {/* Culture principles */}
      {activeTab === 'culture' && (
        <div className="space-y-3">
          {culturePrinciples.map((p, idx) => {
            const isOpen = expandedIdx === idx;
            return (
              <div key={p.title} className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
                <button onClick={() => setExpandedIdx(isOpen ? null : idx)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.15)] transition-colors text-left">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{
                    backgroundColor: `hsl(var(${p.color}) / 0.08)`, border: `1px solid hsl(var(${p.color}) / 0.2)`,
                  }}>
                    <p.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${p.color}))` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-[hsl(var(--panel-text))] block">{p.title}</span>
                    <span className="text-[9px] italic text-[hsl(var(--panel-text-muted))]">{p.mantra}</span>
                  </div>
                  <ChevronRight className={cn("h-3 w-3 text-[hsl(var(--panel-text-muted))] shrink-0 transition-transform", isOpen && "rotate-90")} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-[hsl(var(--panel-border-subtle))]">
                    <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] leading-relaxed mt-3 mb-3">{p.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-md border border-[hsl(var(--panel-border-subtle))] p-2.5">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-[hsl(var(--panel-success))] block mb-2">✓ Expected Behaviors</span>
                        <ul className="space-y-1.5">
                          {p.behaviors.map(b => (
                            <li key={b} className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: `hsl(var(${p.color}))` }} />
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-md border p-2.5" style={{ borderColor: 'hsl(var(--panel-error) / 0.2)', backgroundColor: 'hsl(var(--panel-error) / 0.02)' }}>
                        <span className="text-[8px] font-bold uppercase tracking-wider text-[hsl(var(--panel-error))] block mb-2">✗ Anti-Patterns</span>
                        <ul className="space-y-1.5">
                          {p.antiPatterns.map(a => (
                            <li key={a} className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed flex items-start gap-1.5">
                              <span className="w-1 h-1 rounded-full mt-1.5 shrink-0 bg-[hsl(var(--panel-error))]" />
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Workflow practices */}
      {activeTab === 'workflow' && (
        <div className="space-y-3">
          {workflowPractices.map((w, idx) => {
            const isOpen = expandedIdx === idx;
            return (
              <div key={w.title} className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
                <button onClick={() => setExpandedIdx(isOpen ? null : idx)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.15)] transition-colors text-left">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{
                    backgroundColor: `hsl(var(${w.color}) / 0.08)`, border: `1px solid hsl(var(${w.color}) / 0.2)`,
                  }}>
                    <w.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${w.color}))` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-[hsl(var(--panel-text))] block">{w.title}</span>
                    <span className="text-[8px] font-mono" style={{ color: `hsl(var(${w.color}))` }}>{w.cadence}</span>
                  </div>
                  <ChevronRight className={cn("h-3 w-3 text-[hsl(var(--panel-text-muted))] shrink-0 transition-transform", isOpen && "rotate-90")} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-[hsl(var(--panel-border-subtle))]">
                    <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] leading-relaxed mt-3 mb-3">{w.description}</p>
                    <div className="rounded-md border border-[hsl(var(--panel-border-subtle))] p-2.5">
                      <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: `hsl(var(${w.color}))` }}>Rituals & Practices</span>
                      <ul className="mt-2 space-y-1.5">
                        {w.rituals.map(r => (
                          <li key={r} className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed flex items-start gap-1.5">
                            <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: `hsl(var(${w.color}))` }} />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Culture & Workflow v1.0 — {culturePrinciples.length} core values · {workflowPractices.length} workflow practices · Built for resilient startup execution
      </p>
    </div>
  );
};

export default CompanyCulturePrinciples;
