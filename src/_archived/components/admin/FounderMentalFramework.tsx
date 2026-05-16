import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Brain, Crosshair, Wind, ShieldAlert,
  ChevronRight, Zap, Heart, Eye, RotateCcw,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Founder Mental & Decision Framework
   ═══════════════════════════════════════════════════════════ */

interface FrameworkItem {
  title: string;
  mantra: string;
  description: string;
  practices: string[];
}

interface FrameworkSection {
  id: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  items: FrameworkItem[];
}

const sections: FrameworkSection[] = [
  {
    id: 'decisions', label: 'Decision Principles', subtitle: 'Clarity Under Pressure', icon: Crosshair, color: '--panel-accent',
    items: [
      {
        title: 'High-Impact Actions First',
        mantra: '"If it won\'t move the needle this week, it can wait."',
        description: 'Apply the 80/20 rule ruthlessly. Identify the 2–3 decisions each day that create disproportionate value. Everything else is delegation or deferral.',
        practices: ['Start each morning asking: "What is the ONE thing that makes everything else easier?"', 'Use the Eisenhower matrix: urgent+important gets your time, everything else gets delegated', 'Score decisions by revenue impact × speed of execution before committing resources'],
      },
      {
        title: 'Imperfect Progress Over Delayed Perfection',
        mantra: '"70% confident and reversible? Ship it. Learn. Iterate."',
        description: 'In early-stage startups, speed of learning compounds faster than quality of planning. Most decisions are reversible — treat them that way.',
        practices: ['Set a 15-minute decision timer for reversible choices', 'Ask: "What\'s the cost of waiting one more week?" — if low risk, decide now', 'Ship MVPs and let user data reveal the right direction'],
      },
      {
        title: 'Signal vs. Noise Separation',
        mantra: '"One user complaint is noise. A pattern across 50 is signal."',
        description: 'Founders are bombarded with inputs — investor opinions, user feedback, competitor moves, team concerns. Discipline is filtering for structural patterns, not reacting to every ping.',
        practices: ['Review feedback in weekly batches, not real-time', 'Track recurring themes on a tally board before acting', 'Ask: "Will this matter in 6 months?" — if no, it\'s noise'],
      },
    ],
  },
  {
    id: 'stress', label: 'Stress Management', subtitle: 'Sustainable Energy', icon: Wind, color: '--panel-info',
    items: [
      {
        title: 'Structured Work + Hard Shutdown',
        mantra: '"Energy is finite. Protect it like runway."',
        description: 'Burnout is the #1 founder killer. Structured time blocks with a non-negotiable shutdown ritual prevent cognitive drain from bleeding into recovery time.',
        practices: ['Hard shutdown at 21:30 — no Slack, no email, no "quick checks"', 'Use a shutdown ritual: review tomorrow\'s top 3, close all tabs, write one gratitude', 'Protect weekends: Saturday = recovery, Sunday = light strategic thinking only'],
      },
      {
        title: 'Weekly Strategic Thinking Break',
        mantra: '"You can\'t see the forest from inside the trees."',
        description: 'Block 2 hours every week for pure strategic thinking — no laptop, no meetings. Walk, whiteboard, or journal. This is where breakthrough insights emerge.',
        practices: ['Friday afternoon: 2-hour "CEO think time" — non-negotiable calendar block', 'Prompt yourself with: "What would I do differently if I started today?"', 'Journal one strategic insight per week — review monthly for pattern recognition'],
      },
      {
        title: 'Physical & Mindfulness Routine',
        mantra: '"The body runs the mind. Neglect it and decisions suffer."',
        description: 'Physical activity is not optional for founders — it\'s cognitive infrastructure. 30 minutes of movement daily dramatically improves decision quality and emotional regulation.',
        practices: ['Morning: 30 min exercise before any screen time', 'Midday: 5-minute breathing reset between meeting blocks', 'Track sleep quality — below 6 hours = reduced decision-making capacity flag'],
      },
    ],
  },
  {
    id: 'crisis', label: 'Crisis Response Mindset', subtitle: 'Calm Under Fire', icon: ShieldAlert, color: '--panel-error',
    items: [
      {
        title: 'Protect Platform Trust First',
        mantra: '"Trust takes years to build, seconds to destroy."',
        description: 'In any crisis — data breach, service outage, partner dispute — the first priority is always user trust. Revenue can recover. Trust lost is exponentially harder to regain.',
        practices: ['Within 30 minutes: assess user impact scope and communicate status', 'Default to over-communication — silence breeds distrust', 'Post-incident: publish transparent root cause analysis within 48 hours'],
      },
      {
        title: 'Transparent Partner Communication',
        mantra: '"Bad news delivered early is manageable. Bad news discovered late is fatal."',
        description: 'Agents, developers, and investors are partners, not just users. During crisis, proactive honesty strengthens relationships — even when the news is uncomfortable.',
        practices: ['Call top 5 partners personally during major incidents', 'Provide specific timelines, not vague "we\'re working on it" responses', 'Follow up after resolution with what changed and what you learned'],
      },
      {
        title: 'Recovery Actions Over Blame',
        mantra: '"What do we fix in the next 2 hours? Everything else is noise."',
        description: 'Post-mortems are valuable. But during a crisis, every minute spent assigning blame is a minute not spent fixing the problem. Action-oriented recovery first, analysis later.',
        practices: ['Crisis standup format: What\'s broken → Who\'s fixing → ETA → Next update time', 'Ban the word "fault" during active incidents — replace with "what\'s the next action?"', 'Schedule blameless post-mortem 48 hours after resolution, not during'],
      },
    ],
  },
];

const FounderMentalFramework: React.FC = () => {
  const [activeSection, setActiveSection] = useState('decisions');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const active = sections.find(s => s.id === activeSection)!;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Brain className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Founder Mental & Decision Framework</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Clarity, resilience, and rational strategic thinking through uncertainty</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Pillars', value: String(sections.length), color: '--panel-accent' },
            { label: 'Principles', value: String(sections.reduce((s, sec) => s + sec.items.length, 0)), color: '--panel-info' },
            { label: 'Core Rule', value: 'Proactive > Reactive', color: '--panel-success' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section selectors */}
      <div className="grid grid-cols-3 gap-3">
        {sections.map(s => (
          <button key={s.id} onClick={() => { setActiveSection(s.id); setExpandedIdx(null); }}
            className={cn(
              "rounded-lg border p-3 transition-all text-left",
              activeSection === s.id
                ? `bg-[hsl(var(${s.color})/.08)] border-[hsl(var(${s.color})/.25)]`
                : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border))] hover:bg-[hsl(var(--panel-hover)/.3)]"
            )} style={{ boxShadow: 'var(--panel-shadow)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <s.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold" style={{ color: `hsl(var(${s.color}))` }}>{s.label}</span>
            </div>
            <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">{s.subtitle} · {s.items.length} principles</span>
          </button>
        ))}
      </div>

      {/* Active section items */}
      <div className="space-y-3">
        {active.items.map((item, idx) => {
          const isOpen = expandedIdx === idx;
          return (
            <div key={idx} className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
              <button onClick={() => setExpandedIdx(isOpen ? null : idx)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.15)] transition-colors text-left">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{
                  backgroundColor: `hsl(var(${active.color}) / 0.08)`, border: `1px solid hsl(var(${active.color}) / 0.2)`,
                }}>
                  <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${active.color}))` }}>{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-[hsl(var(--panel-text))] block">{item.title}</span>
                  <span className="text-[9px] italic text-[hsl(var(--panel-text-muted))]">{item.mantra}</span>
                </div>
                <ChevronRight className={cn("h-3 w-3 text-[hsl(var(--panel-text-muted))] shrink-0 transition-transform", isOpen && "rotate-90")} />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-200 border-t border-[hsl(var(--panel-border-subtle))]">
                  <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] leading-relaxed mt-3 mb-3">{item.description}</p>
                  <div className="rounded-md border border-[hsl(var(--panel-border-subtle))] p-2.5">
                    <span className="text-[8px] font-bold uppercase tracking-wider block mb-2" style={{ color: `hsl(var(${active.color}))` }}>Actionable Practices</span>
                    <ul className="space-y-2">
                      {item.practices.map(p => (
                        <li key={p} className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: `hsl(var(${active.color}))` }} />
                          {p}
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

      {/* Mental model summary */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
          <Zap className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
          <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">Mental Model Summary</span>
        </div>
        <div className="grid grid-cols-3 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {[
            { model: 'Decide Fast, Correct Often', desc: 'Speed of iteration beats quality of planning in early-stage. Make reversible decisions at 70% confidence.', color: '--panel-accent' },
            { model: 'Energy = Strategic Asset', desc: 'Protect cognitive energy like cash runway. Structured blocks, hard shutdowns, physical investment.', color: '--panel-info' },
            { model: 'Trust is the Product', desc: 'During crisis, trust preservation outranks revenue recovery. Over-communicate. Fix first, analyze later.', color: '--panel-error' },
          ].map(m => (
            <div key={m.model} className="bg-[hsl(var(--panel-bg))] p-3">
              <span className="text-[10px] font-bold block mb-1" style={{ color: `hsl(var(${m.color}))` }}>{m.model}</span>
              <p className="text-[8px] text-[hsl(var(--panel-text-muted))] leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Founder Mental Framework v1.0 — {sections.length} pillars · {sections.reduce((s, sec) => s + sec.items.length, 0)} principles · Built for resilient startup leadership
      </p>
    </div>
  );
};

export default FounderMentalFramework;
