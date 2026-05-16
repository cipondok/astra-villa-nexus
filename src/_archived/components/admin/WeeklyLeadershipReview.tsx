import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  CalendarClock, Building2, Cpu, Rocket, DollarSign,
  CheckSquare, Clock, AlertTriangle, TrendingUp, Users,
  BarChart3, FileText, ChevronRight, type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Weekly Leadership Review Process
   ═══════════════════════════════════════════════════════════ */

interface AgendaItem {
  title: string;
  owner: string;
  duration: string;
  metrics: string[];
  discussion: string[];
  output: string;
}

interface AgendaBlock {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  timeSlot: string;
  items: AgendaItem[];
}

const agenda: AgendaBlock[] = [
  {
    id: 'marketplace', label: 'Marketplace Health Review', icon: Building2, color: '--panel-accent',
    timeSlot: '09:00 – 09:20 (20 min)',
    items: [
      {
        title: 'Listing Inventory Growth',
        owner: 'Marketplace Ops',
        duration: '7 min',
        metrics: ['Net new listings (WoW)', 'Active vs expired ratio', 'City coverage expansion'],
        discussion: ['Supply bottlenecks by region', 'Agent onboarding pipeline status'],
        output: 'Supply health score: GREEN / YELLOW / RED',
      },
      {
        title: 'Investor Activity Metrics',
        owner: 'Growth Lead',
        duration: '6 min',
        metrics: ['WAU (weekly active users)', 'Search-to-inquiry conversion', 'Watchlist additions'],
        discussion: ['Demand signals vs supply gaps', 'Cohort retention trends'],
        output: 'Demand pulse: STRONG / MODERATE / WEAK',
      },
      {
        title: 'Transaction Pipeline',
        owner: 'Sales Lead',
        duration: '7 min',
        metrics: ['Deals in negotiation', 'Closed this week (count + GMV)', 'Avg days-to-close'],
        discussion: ['Stuck deals requiring escalation', 'Commission revenue forecast'],
        output: 'Pipeline velocity: ACCELERATING / STEADY / SLOWING',
      },
    ],
  },
  {
    id: 'product', label: 'Product & AI Progress', icon: Cpu, color: '--panel-info',
    timeSlot: '09:20 – 09:40 (20 min)',
    items: [
      {
        title: 'Feature Delivery Status',
        owner: 'Engineering Lead',
        duration: '7 min',
        metrics: ['Sprint velocity (story points)', 'Release count this week', 'Bug escape rate'],
        discussion: ['Scope changes or delays', 'QA blockers'],
        output: 'Delivery confidence: ON TRACK / AT RISK / BLOCKED',
      },
      {
        title: 'AI Intelligence Performance',
        owner: 'AI / Data Lead',
        duration: '7 min',
        metrics: ['Scoring accuracy (%)' , 'Alert engagement rate', 'Model freshness status'],
        discussion: ['Data quality issues', 'New intelligence features in pipeline'],
        output: 'AI health: HEALTHY / WARNING / CRITICAL',
      },
      {
        title: 'Technical Blockers',
        owner: 'Engineering Lead',
        duration: '6 min',
        metrics: ['Unresolved P1 issues', 'Platform uptime %', 'Infra cost trend'],
        discussion: ['Cross-team dependencies', 'Security or compliance items'],
        output: 'Action items with owners + deadlines',
      },
    ],
  },
  {
    id: 'growth', label: 'Growth & Sales Pipeline', icon: Rocket, color: '--panel-success',
    timeSlot: '09:40 – 10:00 (20 min)',
    items: [
      {
        title: 'Developer Partnership Outreach',
        owner: 'BD Lead',
        duration: '7 min',
        metrics: ['Outreach volume', 'Meeting conversion rate', 'Signed LOIs this month'],
        discussion: ['Top 3 developer prospects', 'Negotiation blockers'],
        output: 'Partnership pipeline stage summary',
      },
      {
        title: 'Marketing Campaign Performance',
        owner: 'Growth Marketing',
        duration: '7 min',
        metrics: ['CAC by channel', 'Social media lead volume', 'Referral traffic %'],
        discussion: ['Campaign ROI vs budget', 'Content pipeline status'],
        output: 'Channel efficiency ranking',
      },
      {
        title: 'Demo & Investor Feedback',
        owner: 'Sales Lead',
        duration: '6 min',
        metrics: ['Demos conducted', 'NPS / feedback score', 'Feature requests logged'],
        discussion: ['Common objections', 'Competitive intelligence updates'],
        output: 'Top 3 product feedback themes',
      },
    ],
  },
  {
    id: 'financial', label: 'Financial Snapshot', icon: DollarSign, color: '--panel-warning',
    timeSlot: '10:00 – 10:15 (15 min)',
    items: [
      {
        title: 'Weekly Revenue Indicators',
        owner: 'Finance / CEO',
        duration: '5 min',
        metrics: ['Commission revenue (WoW)', 'Subscription MRR', 'Affiliate payouts'],
        discussion: ['Revenue vs weekly target', 'Unexpected revenue events'],
        output: 'Revenue status: ABOVE / ON / BELOW target',
      },
      {
        title: 'Expense Review',
        owner: 'Finance / CEO',
        duration: '5 min',
        metrics: ['Burn rate (weekly)', 'Top 3 cost categories', 'Runway months remaining'],
        discussion: ['Cost optimization opportunities', 'Upcoming large expenses'],
        output: 'Burn rate trend: STABLE / RISING / FALLING',
      },
      {
        title: 'Forecast Adjustments',
        owner: 'CEO',
        duration: '5 min',
        metrics: ['Monthly forecast accuracy', 'Updated projection', 'Key assumption changes'],
        discussion: ['Market condition shifts', 'Strategic pivots needed'],
        output: 'Revised weekly/monthly forecast if needed',
      },
    ],
  },
];

const WeeklyLeadershipReview: React.FC = () => {
  const [activeBlock, setActiveBlock] = useState('marketplace');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const active = agenda.find(b => b.id === activeBlock)!;
  const totalMinutes = 75;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <CalendarClock className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Weekly Leadership Review</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Structured 75-min cadence — strategic alignment across product, growth & partnerships</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Duration', value: `${totalMinutes} min`, color: '--panel-accent' },
            { label: 'Blocks', value: String(agenda.length), color: '--panel-info' },
            { label: 'Schedule', value: 'Every Monday', color: '--panel-success' },
            { label: 'Format', value: 'Standup + Deep-dive', color: '--panel-warning' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline block selectors */}
      <div className="grid grid-cols-4 gap-3">
        {agenda.map(b => (
          <button key={b.id} onClick={() => { setActiveBlock(b.id); setExpandedItem(null); }}
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
            <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{b.timeSlot}</span>
          </button>
        ))}
      </div>

      {/* Active block detail */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-3 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
          <div className="flex items-center gap-2 mb-1">
            <active.icon className="h-4 w-4" style={{ color: `hsl(var(${active.color}))` }} />
            <span className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{active.label}</span>
            <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">· {active.timeSlot}</span>
          </div>
        </div>

        <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
          {active.items.map((item, idx) => {
            const key = `${active.id}-${idx}`;
            const isOpen = expandedItem === key;
            return (
              <div key={key}>
                <button onClick={() => setExpandedItem(isOpen ? null : key)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.15)] transition-colors text-left">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md text-[9px] font-bold font-mono" style={{
                    color: `hsl(var(${active.color}))`, backgroundColor: `hsl(var(${active.color}) / 0.08)`, border: `1px solid hsl(var(${active.color}) / 0.2)`,
                  }}>{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))] block">{item.title}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Owner: {item.owner}</span>
                      <span className="text-[8px] font-mono" style={{ color: `hsl(var(${active.color}))` }}>{item.duration}</span>
                    </div>
                  </div>
                  <ChevronRight className={cn("h-3 w-3 text-[hsl(var(--panel-text-muted))] shrink-0 transition-transform", isOpen && "rotate-90")} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-3 gap-3 ml-9">
                      {/* Metrics */}
                      <div className="rounded-md border border-[hsl(var(--panel-border-subtle))] p-2.5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <BarChart3 className="h-2.5 w-2.5 text-[hsl(var(--panel-info))]" />
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[hsl(var(--panel-info))]">Key Metrics</span>
                        </div>
                        <ul className="space-y-1">
                          {item.metrics.map(m => (
                            <li key={m} className="flex items-start gap-1.5">
                              <TrendingUp className="h-2 w-2 mt-0.5 shrink-0 text-[hsl(var(--panel-accent))]" />
                              <span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{m}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Discussion */}
                      <div className="rounded-md border border-[hsl(var(--panel-border-subtle))] p-2.5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Users className="h-2.5 w-2.5 text-[hsl(var(--panel-success))]" />
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[hsl(var(--panel-success))]">Discussion Points</span>
                        </div>
                        <ul className="space-y-1">
                          {item.discussion.map(d => (
                            <li key={d} className="flex items-start gap-1.5">
                              <AlertTriangle className="h-2 w-2 mt-0.5 shrink-0 text-[hsl(var(--panel-warning))]" />
                              <span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Output */}
                      <div className="rounded-md border p-2.5" style={{ borderColor: `hsl(var(${active.color}) / 0.2)`, backgroundColor: `hsl(var(${active.color}) / 0.02)` }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <CheckSquare className="h-2.5 w-2.5" style={{ color: `hsl(var(${active.color}))` }} />
                          <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: `hsl(var(${active.color}))` }}>Required Output</span>
                        </div>
                        <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed font-mono">{item.output}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Meeting rules */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
          <FileText className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
          <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">Meeting Operating Rules</span>
        </div>
        <div className="grid grid-cols-4 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {[
            { rule: 'Start on Time', desc: 'Meeting begins at 09:00 sharp. Latecomers catch up via async notes.', color: '--panel-accent' },
            { rule: 'Data First', desc: 'Every discussion opens with metrics. No opinions without data support.', color: '--panel-info' },
            { rule: 'Action Items Required', desc: 'Each block ends with clear owners + deadlines. No vague next-steps.', color: '--panel-success' },
            { rule: 'Async Follow-up', desc: 'Deep dives scheduled separately. Weekly review stays at 75 min max.', color: '--panel-warning' },
          ].map(r => (
            <div key={r.rule} className="bg-[hsl(var(--panel-bg))] p-3">
              <span className="text-[10px] font-bold block mb-1" style={{ color: `hsl(var(${r.color}))` }}>{r.rule}</span>
              <p className="text-[8px] text-[hsl(var(--panel-text-muted))] leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Weekly Leadership Review v1.0 — {agenda.length} blocks · {agenda.reduce((s, b) => s + b.items.length, 0)} agenda items · {totalMinutes}-minute cadence
      </p>
    </div>
  );
};

export default WeeklyLeadershipReview;
