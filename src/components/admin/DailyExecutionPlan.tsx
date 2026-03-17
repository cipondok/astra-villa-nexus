import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Clock, Code, Store, Megaphone, Brain, Bug,
  ChevronRight, Circle, CheckCircle2, Target,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — 8-Hour Daily Execution Plan
   ═══════════════════════════════════════════════════════════ */

type BlockTrack = 'product' | 'supply' | 'demand' | 'strategy' | 'quality';

interface Task {
  text: string;
  deliverable: string;
}

interface TimeBlock {
  id: string;
  hours: string;
  label: string;
  track: BlockTrack;
  icon: LucideIcon;
  color: string;
  tasks: Task[];
  exitCriteria: string;
}

const blocks: TimeBlock[] = [
  {
    id: 'h1', hours: 'Hour 1–2', label: 'Product Improvement', track: 'product', icon: Code, color: '--panel-accent',
    tasks: [
      { text: 'Improve property listing card UI layout', deliverable: 'Cleaner card with visual hierarchy' },
      { text: 'Ensure opportunity score badge is clearly visible', deliverable: 'Score ring prominent on every card' },
      { text: 'Optimize search filter usability', deliverable: 'Faster filter response, better mobile UX' },
    ],
    exitCriteria: 'Property cards visually improved + score badge prominent + filters snappy',
  },
  {
    id: 'h2', hours: 'Hour 3–4', label: 'Marketplace Supply', track: 'supply', icon: Store, color: '--panel-info',
    tasks: [
      { text: 'Contact at least 5 property agents', deliverable: '5 outreach messages sent with follow-up dates' },
      { text: 'Request listing data or photos', deliverable: 'Pending assets from ≥ 3 agents' },
      { text: 'Add minimum 3 new listings into platform', deliverable: '3 verified listings live on marketplace' },
    ],
    exitCriteria: '5 agents contacted + 3 new listings published',
  },
  {
    id: 'h3', hours: 'Hour 5–6', label: 'Investor Demand', track: 'demand', icon: Megaphone, color: '--panel-success',
    tasks: [
      { text: 'Create short social media video showing AI deal discovery', deliverable: '1 video posted on Instagram/TikTok' },
      { text: 'Post elite opportunity insight content', deliverable: '1 insight post with engagement tracking' },
      { text: 'Respond to potential investor messages', deliverable: 'All pending DMs/emails replied within 2h' },
    ],
    exitCriteria: '1 video + 1 insight post published + all investor messages answered',
  },
  {
    id: 'h4', hours: 'Hour 7', label: 'Strategic Thinking', track: 'strategy', icon: Brain, color: '--panel-warning',
    tasks: [
      { text: 'Review next feature priority based on user signals', deliverable: 'Top 3 features ranked for tomorrow' },
      { text: 'Write improvement notes for tomorrow build', deliverable: 'Written spec or bullet notes saved' },
    ],
    exitCriteria: 'Tomorrow\'s build plan documented with clear priorities',
  },
  {
    id: 'h5', hours: 'Hour 8', label: 'Quality Check', track: 'quality', icon: Bug, color: '--panel-error',
    tasks: [
      { text: 'Test listing inquiry flow end-to-end', deliverable: 'Inquiry submitted and received successfully' },
      { text: 'Test watchlist add/remove interaction', deliverable: 'Watchlist CRUD confirmed working' },
      { text: 'Document bugs or UX friction found', deliverable: 'Bug list with severity tags' },
    ],
    exitCriteria: 'Core flows verified + all issues documented',
  },
];

const totalTasks = blocks.reduce((s, b) => s + b.tasks.length, 0);

const DailyExecutionPlan: React.FC = () => {
  const [activeBlock, setActiveBlock] = useState('h1');
  const [expandedTask, setExpandedTask] = useState<number | null>(null);

  const block = blocks.find(b => b.id === activeBlock)!;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Clock className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">8-Hour Daily Execution Plan</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Focused daily sprint — product, supply, demand, strategy, and quality</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Time Blocks', value: String(blocks.length), color: '--panel-accent' },
            { label: 'Total Tasks', value: String(totalTasks), color: '--panel-info' },
            { label: 'Duration', value: '8 Hours', color: '--panel-success' },
            { label: 'Daily Target', value: 'Ship + Grow + Learn', color: '--panel-warning' },
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
        <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-text-muted))] block mb-2">Daily Timeline</span>
        <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
          {blocks.map(b => (
            <button key={b.id} onClick={() => { setActiveBlock(b.id); setExpandedTask(null); }}
              className="relative transition-all hover:opacity-80"
              style={{
                flex: b.id === 'h4' || b.id === 'h5' ? 1 : 2,
                backgroundColor: `hsl(var(${b.color}))`,
                opacity: activeBlock === b.id ? 1 : 0.35,
              }}
              title={`${b.hours}: ${b.label}`} />
          ))}
        </div>
        <div className="flex mt-1.5">
          {blocks.map(b => (
            <span key={b.id} className="text-[7px] font-mono font-bold text-center"
              style={{
                flex: b.id === 'h4' || b.id === 'h5' ? 1 : 2,
                color: `hsl(var(${b.color}))`,
                opacity: activeBlock === b.id ? 1 : 0.5,
              }}>{b.hours}</span>
          ))}
        </div>
      </div>

      {/* Block selectors */}
      <div className="grid grid-cols-5 gap-2">
        {blocks.map(b => (
          <button key={b.id} onClick={() => { setActiveBlock(b.id); setExpandedTask(null); }}
            className={cn(
              "rounded-lg border p-2.5 transition-all text-left",
              activeBlock === b.id
                ? `bg-[hsl(var(${b.color})/.08)] border-[hsl(var(${b.color})/.25)]`
                : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border))] hover:bg-[hsl(var(--panel-hover)/.3)]"
            )} style={{ boxShadow: 'var(--panel-shadow)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <b.icon className="h-3 w-3" style={{ color: `hsl(var(${b.color}))` }} />
              <span className="text-[8px] font-bold font-mono" style={{ color: `hsl(var(${b.color}))` }}>{b.hours}</span>
            </div>
            <span className="text-[9px] font-semibold text-[hsl(var(--panel-text))] block">{b.label}</span>
            <span className="text-[7px] font-mono text-[hsl(var(--panel-text-muted))]">{b.tasks.length} tasks</span>
          </button>
        ))}
      </div>

      {/* Tasks */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)] flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <block.icon className="h-3 w-3" style={{ color: `hsl(var(${block.color}))` }} />
            <span className="text-[10px] font-bold text-[hsl(var(--panel-text))]">{block.label} — Tasks</span>
          </div>
          <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{block.hours}</span>
        </div>
        <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
          {block.tasks.map((t, idx) => {
            const isOpen = expandedTask === idx;
            return (
              <div key={idx}>
                <button onClick={() => setExpandedTask(isOpen ? null : idx)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.15)] transition-colors text-left">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md text-[9px] font-bold font-mono" style={{
                    color: `hsl(var(${block.color}))`,
                    backgroundColor: `hsl(var(${block.color}) / 0.08)`,
                    border: `1px solid hsl(var(${block.color}) / 0.2)`,
                  }}>{idx + 1}</div>
                  <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))] flex-1">{t.text}</span>
                  <ChevronRight className={cn("h-3 w-3 text-[hsl(var(--panel-text-muted))] shrink-0 transition-transform", isOpen && "rotate-90")} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="ml-9 p-2.5 rounded-md border border-[hsl(var(--panel-border-subtle))] flex items-center gap-2">
                      <Target className="h-2.5 w-2.5 shrink-0" style={{ color: `hsl(var(${block.color}))` }} />
                      <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">
                        <span className="font-bold" style={{ color: `hsl(var(${block.color}))` }}>Deliverable: </span>{t.deliverable}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Exit criteria */}
      <div className="rounded-lg border border-[hsl(var(--panel-border-subtle))] px-4 py-3 bg-[hsl(var(--panel-hover)/.15)]">
        <div className="flex items-center gap-1.5 mb-1">
          <CheckCircle2 className="h-3 w-3" style={{ color: `hsl(var(${block.color}))` }} />
          <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: `hsl(var(${block.color}))` }}>Exit Criteria</span>
        </div>
        <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{block.exitCriteria}</p>
      </div>

      {/* Daily summary grid */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
          <span className="text-[10px] font-bold text-[hsl(var(--panel-text))] uppercase tracking-wider">End-of-Day Success Checklist</span>
        </div>
        <div className="grid grid-cols-5 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {blocks.map(b => (
            <div key={b.id} className="bg-[hsl(var(--panel-bg))] p-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <b.icon className="h-3 w-3" style={{ color: `hsl(var(${b.color}))` }} />
                <span className="text-[8px] font-bold" style={{ color: `hsl(var(${b.color}))` }}>{b.label}</span>
              </div>
              {b.tasks.map((t, i) => (
                <div key={i} className="flex items-start gap-1 mb-0.5">
                  <Circle className="h-1.5 w-1.5 mt-1 shrink-0 text-[hsl(var(--panel-text-muted))]" />
                  <span className="text-[7px] text-[hsl(var(--panel-text-secondary))] leading-tight">{t.deliverable}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Final target */}
      <div className="rounded-lg border border-[hsl(var(--panel-accent)/.2)] bg-[hsl(var(--panel-accent)/.04)] px-4 py-3">
        <div className="flex items-center gap-1.5 mb-1">
          <CheckCircle2 className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-accent))]">Daily Target</span>
        </div>
        <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">
          Platform becomes better + marketplace grows + investor awareness increases. Ship visible improvements, add real supply, and create demand signals — every single day.
        </p>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa 8-Hour Execution Plan v1.0 — {blocks.length} time blocks · {totalTasks} tasks · Product + Supply + Demand + Strategy + Quality
      </p>
    </div>
  );
};

export default DailyExecutionPlan;
