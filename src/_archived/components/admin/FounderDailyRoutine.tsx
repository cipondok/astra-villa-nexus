import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Sunrise, Sun, Sunset, Moon, Clock,
  Brain, Handshake, Megaphone, BookOpen,
  ChevronRight, Target, Flame, ShieldAlert,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Founder Daily Execution Routine
   ═══════════════════════════════════════════════════════════ */

interface Task {
  time: string;
  title: string;
  detail: string;
  energy: 'high' | 'medium' | 'low';
}

interface TimeBlock {
  id: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  timeRange: string;
  intent: string;
  tasks: Task[];
  guardrails: string[];
}

const energyDot: Record<string, string> = {
  high: '--panel-success', medium: '--panel-warning', low: '--panel-info',
};

const blocks: TimeBlock[] = [
  {
    id: 'morning', label: 'Morning Focus Block', subtitle: 'Deep Work', icon: Sunrise, color: '--panel-accent',
    timeRange: '06:00 – 10:00', intent: 'Leverage peak cognitive energy for high-impact strategic and product work. Zero meetings. Zero Slack.',
    tasks: [
      { time: '06:00', title: 'Morning routine & intention setting', detail: 'Review today\'s top 3 priorities. Scan overnight alerts from platform dashboards.', energy: 'high' },
      { time: '06:30', title: 'Platform feature planning / AI system review', detail: 'Deep work on product architecture, AI model improvements, or technical design docs.', energy: 'high' },
      { time: '08:00', title: 'Key product decision-making', detail: 'Review PRs, approve sprint scope changes, unblock engineering with decisions.', energy: 'high' },
      { time: '09:00', title: 'Investor / partnership strategy prep', detail: 'Prepare pitch decks, partnership proposals, or fundraising materials.', energy: 'high' },
    ],
    guardrails: ['No meetings before 10:00', 'Phone on DND — async only', 'Email checked once at 09:30, not before'],
  },
  {
    id: 'midday', label: 'Midday Market Action', subtitle: 'Outreach & Deals', icon: Sun, color: '--panel-info',
    timeRange: '10:00 – 14:00', intent: 'Convert morning preparation into external momentum — meetings, calls, and marketplace operations.',
    tasks: [
      { time: '10:00', title: 'Agent / developer outreach', detail: 'Cold or warm outreach to prospective partners. Follow up on pending LOIs.', energy: 'medium' },
      { time: '11:00', title: 'Investor demo or networking call', detail: 'Scheduled demos, VC catch-ups, or strategic advisor syncs.', energy: 'high' },
      { time: '12:00', title: 'Lunch + informal networking', detail: 'Use lunch for relationship building — coffee meetings or team bonding.', energy: 'low' },
      { time: '13:00', title: 'Marketplace listing onboarding review', detail: 'Review new listing quality, agent activation metrics, and ops bottlenecks.', energy: 'medium' },
    ],
    guardrails: ['Max 3 external meetings per day', 'Always prep 5-min brief before calls', 'Log every meeting outcome immediately'],
  },
  {
    id: 'afternoon', label: 'Afternoon Growth Execution', subtitle: 'Marketing & Data', icon: Sunset, color: '--panel-success',
    timeRange: '14:00 – 18:00', intent: 'Execute on growth levers — content, campaigns, and data-driven adjustments.',
    tasks: [
      { time: '14:00', title: 'Social media content review', detail: 'Approve or create content for Instagram, TikTok, LinkedIn. Review engagement metrics.', energy: 'medium' },
      { time: '15:00', title: 'Marketing campaign adjustment', detail: 'Review ad spend ROI, adjust targeting, approve new creatives or copy.', energy: 'medium' },
      { time: '16:00', title: 'Data & performance dashboard review', detail: 'Deep dive into KPI dashboards — AI Command Center, revenue intelligence, platform health.', energy: 'medium' },
      { time: '17:00', title: 'Team sync & blocker resolution', detail: 'Quick standups with leads. Clear any cross-team blockers before end of day.', energy: 'low' },
    ],
    guardrails: ['Batch social media to one time slot', 'Dashboard review is analysis, not browsing', 'End team syncs by 17:30 sharp'],
  },
  {
    id: 'evening', label: 'Night Strategic Reflection', subtitle: 'Think & Plan', icon: Moon, color: '--panel-warning',
    timeRange: '20:00 – 21:30', intent: 'Decompress from execution mode. Reflect, document, and set tomorrow\'s trajectory.',
    tasks: [
      { time: '20:00', title: 'Review daily progress metrics', detail: 'Check what moved: deals closed, features shipped, leads generated, revenue signals.', energy: 'low' },
      { time: '20:30', title: 'Document insights & next priorities', detail: 'Journal key learnings. Update tomorrow\'s top 3 priorities in task system.', energy: 'low' },
      { time: '21:00', title: 'Long-term vision thinking', detail: 'Read industry research, refine platform roadmap ideas, think about moat deepening.', energy: 'low' },
    ],
    guardrails: ['No new tasks after 21:00', 'Screen off by 22:00', 'This block is optional on high-output days'],
  },
];

const FounderDailyRoutine: React.FC = () => {
  const [activeBlock, setActiveBlock] = useState('morning');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const active = blocks.find(b => b.id === activeBlock)!;
  const totalTasks = blocks.reduce((s, b) => s + b.tasks.length, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Flame className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Founder Daily Execution Routine</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Disciplined time allocation — product building, market expansion & strategic thinking</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Time Blocks', value: String(blocks.length), color: '--panel-accent' },
            { label: 'Daily Tasks', value: String(totalTasks), color: '--panel-info' },
            { label: 'Deep Work', value: '4 hours', color: '--panel-success' },
            { label: 'Philosophy', value: 'Proactive > Reactive', color: '--panel-warning' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Block selectors */}
      <div className="grid grid-cols-4 gap-3">
        {blocks.map(b => (
          <button key={b.id} onClick={() => { setActiveBlock(b.id); setExpandedTask(null); }}
            className={cn(
              "rounded-lg border p-3 transition-all text-left",
              activeBlock === b.id
                ? `bg-[hsl(var(${b.color})/.08)] border-[hsl(var(${b.color})/.25)]`
                : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border))] hover:bg-[hsl(var(--panel-hover)/.3)]"
            )} style={{ boxShadow: 'var(--panel-shadow)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <b.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${b.color}))` }} />
              <span className="text-[10px] font-bold" style={{ color: `hsl(var(${b.color}))` }}>{b.label}</span>
            </div>
            <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{b.timeRange}</span>
          </button>
        ))}
      </div>

      {/* Active block detail */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-3 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
          <div className="flex items-center gap-2 mb-1">
            <active.icon className="h-4 w-4" style={{ color: `hsl(var(${active.color}))` }} />
            <span className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{active.label}</span>
            <span className="text-[9px] font-mono text-[hsl(var(--panel-text-muted))]">· {active.timeRange}</span>
          </div>
          <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] ml-6">{active.intent}</p>
        </div>

        <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
          {active.tasks.map((task, idx) => {
            const key = `${active.id}-${idx}`;
            const isOpen = expandedTask === key;
            const ec = energyDot[task.energy];
            return (
              <div key={key}>
                <button onClick={() => setExpandedTask(isOpen ? null : key)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.15)] transition-colors text-left">
                  <span className="text-[10px] font-mono font-bold w-10 shrink-0" style={{ color: `hsl(var(${active.color}))` }}>{task.time}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))] block">{task.title}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${ec}))` }} />
                      <span className="text-[8px] capitalize" style={{ color: `hsl(var(${ec}))` }}>{task.energy} energy</span>
                    </div>
                  </div>
                  <ChevronRight className={cn("h-3 w-3 text-[hsl(var(--panel-text-muted))] shrink-0 transition-transform", isOpen && "rotate-90")} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed ml-[52px] p-2.5 rounded-md border border-[hsl(var(--panel-border-subtle))]">{task.detail}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Guardrails */}
        <div className="px-4 py-3 border-t border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.1)]">
          <div className="flex items-center gap-1.5 mb-2">
            <ShieldAlert className="h-2.5 w-2.5 text-[hsl(var(--panel-error))]" />
            <span className="text-[8px] font-bold uppercase tracking-wider text-[hsl(var(--panel-error))]">Guardrails</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {active.guardrails.map(g => (
              <span key={g} className="text-[8px] px-2 py-1 rounded-full border text-[hsl(var(--panel-text-secondary))]" style={{
                borderColor: 'hsl(var(--panel-error) / 0.2)', backgroundColor: 'hsl(var(--panel-error) / 0.03)',
              }}>{g}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Daily energy map */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
          <Target className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
          <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">Daily Energy Allocation Philosophy</span>
        </div>
        <div className="grid grid-cols-4 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {[
            { phase: 'Create', hours: '06–10', pct: '40%', desc: 'Highest cognitive output on product, strategy, and architecture decisions.', color: '--panel-accent' },
            { phase: 'Connect', hours: '10–14', pct: '25%', desc: 'External momentum — partnerships, demos, marketplace operations.', color: '--panel-info' },
            { phase: 'Execute', hours: '14–18', pct: '25%', desc: 'Growth levers — content, campaigns, data analysis, team coordination.', color: '--panel-success' },
            { phase: 'Reflect', hours: '20–21:30', pct: '10%', desc: 'Wind down with metrics review, journaling, and vision refinement.', color: '--panel-warning' },
          ].map(p => (
            <div key={p.phase} className="bg-[hsl(var(--panel-bg))] p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold" style={{ color: `hsl(var(${p.color}))` }}>{p.phase}</span>
                <span className="text-[9px] font-mono" style={{ color: `hsl(var(${p.color}))` }}>{p.pct}</span>
              </div>
              <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))] block mb-1">{p.hours}</span>
              <p className="text-[8px] text-[hsl(var(--panel-text-muted))] leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Founder Routine v1.0 — {blocks.length} time blocks · {totalTasks} structured tasks · Energy-mapped for peak performance
      </p>
    </div>
  );
};

export default FounderDailyRoutine;
