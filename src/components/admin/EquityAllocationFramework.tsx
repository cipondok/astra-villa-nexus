import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  PieChart, Users, Shield, TrendingUp, Clock, ArrowRight,
  CheckCircle2, AlertTriangle, Briefcase, Award, Lock,
  Layers, BarChart3, Eye, Zap, type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Startup Equity Allocation Framework
   Ownership distribution, vesting, ESOP, governance
   ═══════════════════════════════════════════════════════════ */

type TabKey = 'allocation' | 'vesting' | 'esop' | 'dilution' | 'governance';
const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'allocation', label: 'Equity Allocation', icon: PieChart },
  { key: 'vesting', label: 'Vesting Schedules', icon: Clock },
  { key: 'esop', label: 'ESOP & Options', icon: Award },
  { key: 'dilution', label: 'Dilution Planning', icon: TrendingUp },
  { key: 'governance', label: 'Governance', icon: Shield },
];

const SectionBlock: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
      <Icon className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
      <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">{title}</span>
    </div>
    {children}
  </div>
);

// ── Data ────────────────────────────────────────────────

const allocationSlices = [
  { holder: 'CEO / Lead Founder', pct: 55, color: '--panel-accent', role: 'Vision, strategy, fundraising, product direction', vesting: '4-year with 1-year cliff' },
  { holder: 'Co-Founder / CTO', pct: 20, color: '--panel-info', role: 'Technical architecture, AI/ML, engineering leadership', vesting: '4-year with 1-year cliff' },
  { holder: 'ESOP Pool (Team)', pct: 15, color: '--panel-success', role: 'Early engineers, designers, key hires — performance grants', vesting: '4-year with 1-year cliff per grant' },
  { holder: 'Advisor Pool', pct: 5, color: '--panel-warning', role: 'Industry advisors, proptech mentors, strategic connectors', vesting: '2-year with 6-month cliff' },
  { holder: 'Reserved / Unallocated', pct: 5, color: '--panel-text-muted', role: 'Buffer for co-founder adjustments or strategic grants', vesting: 'Locked until board approval' },
];

const vestingSchedules = [
  {
    type: 'Standard Founder Vesting',
    color: '--panel-accent',
    cliff: '12 months',
    total: '48 months',
    schedule: [
      { period: 'Month 0–12', event: 'Cliff period — 0% vested', pct: 0 },
      { period: 'Month 12', event: 'Cliff vests — 25% unlocked', pct: 25 },
      { period: 'Month 13–48', event: 'Monthly pro-rata vesting (2.08%/mo)', pct: 100 },
    ],
    notes: ['Cliff protects company if founder leaves early', 'Monthly vesting after cliff keeps founders aligned', 'Acceleration clause recommended on change of control'],
  },
  {
    type: 'ESOP / Employee Grants',
    color: '--panel-success',
    cliff: '12 months',
    total: '48 months',
    schedule: [
      { period: 'Month 0–12', event: 'Cliff period — 0% vested', pct: 0 },
      { period: 'Month 12', event: 'Cliff vests — 25% unlocked', pct: 25 },
      { period: 'Month 13–48', event: 'Monthly pro-rata vesting', pct: 100 },
    ],
    notes: ['Stock options at fair market value (FMV) at grant date', 'Exercise window: 90 days post-departure (standard) or 10 years (founder-friendly)', 'Performance milestones can accelerate vesting'],
  },
  {
    type: 'Advisor Vesting',
    color: '--panel-warning',
    cliff: '6 months',
    total: '24 months',
    schedule: [
      { period: 'Month 0–6', event: 'Cliff period — 0% vested', pct: 0 },
      { period: 'Month 6', event: 'Cliff vests — 25% unlocked', pct: 25 },
      { period: 'Month 7–24', event: 'Monthly pro-rata vesting', pct: 100 },
    ],
    notes: ['Shorter cycle reflects advisory nature', 'Tied to deliverable milestones where possible', 'Standard: 0.25%–1.0% per advisor depending on contribution'],
  },
];

const esopTiers = [
  { role: 'VP / Head of Engineering', rangeMin: 1.0, rangeMax: 3.0, color: '--panel-accent', timing: 'Seed stage hire' },
  { role: 'Senior Engineer (Early)', rangeMin: 0.5, rangeMax: 1.5, color: '--panel-info', timing: 'Pre-Seed to Seed' },
  { role: 'Product Manager', rangeMin: 0.3, rangeMax: 1.0, color: '--panel-success', timing: 'Seed stage' },
  { role: 'Mid-Level Engineer', rangeMin: 0.1, rangeMax: 0.5, color: '--panel-warning', timing: 'Seed to Series A' },
  { role: 'Designer / Marketer', rangeMin: 0.1, rangeMax: 0.3, color: '--panel-error', timing: 'Seed to Series A' },
  { role: 'Junior Hire', rangeMin: 0.01, rangeMax: 0.1, color: '--panel-text-muted', timing: 'Series A+' },
];

const dilutionTable = [
  { round: 'Founding', shares: '10,000,000', newShares: '—', ownership: '100%', valuation: '—' },
  { round: 'Pre-Seed (10–15%)', shares: '10,000,000', newShares: '1,176,471', ownership: '85–90%', valuation: 'IDR 8–15B' },
  { round: 'Seed (15–20%)', shares: '11,176,471', newShares: '2,794,118', ownership: '68–72%', valuation: 'IDR 40–80B' },
  { round: 'Series A (20–25%)', shares: '13,970,589', newShares: '4,656,863', ownership: '51–54%', valuation: 'IDR 250–500B' },
  { round: 'Series B (15–20%)', shares: '18,627,452', newShares: '4,656,863', ownership: '41–43%', valuation: 'IDR 1T–3T' },
];

const governanceItems = [
  {
    area: 'Board Composition',
    icon: Users,
    color: '--panel-accent',
    current: 'Founder-controlled (Pre-Seed)',
    evolution: [
      { stage: 'Pre-Seed', structure: '2 Founder seats', control: 'Full founder control' },
      { stage: 'Seed', structure: '2 Founder + 1 Investor + 1 Independent', control: 'Founder majority' },
      { stage: 'Series A', structure: '2 Founder + 2 Investor + 1 Independent', control: 'Balanced with protective provisions' },
      { stage: 'Series B+', structure: '2 Founder + 2 Investor + 2 Independent', control: 'Governance-grade board' },
    ],
  },
  {
    area: 'Decision Rights Matrix',
    icon: Lock,
    color: '--panel-info',
    rights: [
      { decision: 'Day-to-day operations', authority: 'CEO', approval: 'None required' },
      { decision: 'Hiring (under VP level)', authority: 'CEO', approval: 'Budget approval' },
      { decision: 'Expenditure > IDR 500M', authority: 'CEO + Board', approval: 'Board majority' },
      { decision: 'New fundraising round', authority: 'Board', approval: 'Board + existing investor consent' },
      { decision: 'Equity grants from ESOP', authority: 'Board', approval: 'Board majority' },
      { decision: 'M&A / exit decisions', authority: 'Board + Shareholders', approval: 'Supermajority (75%)' },
      { decision: 'Change of company charter', authority: 'Shareholders', approval: 'Supermajority (75%)' },
    ],
  },
];

const founderRoles = [
  { role: 'CEO / Lead Founder', responsibilities: ['Company vision & strategy', 'Fundraising & investor relations', 'Product direction & roadmap', 'Key partnerships & BD', 'Team culture & hiring'], kpis: ['Revenue growth', 'Fundraise success', 'Strategic partnerships', 'Team retention'], color: '--panel-accent' },
  { role: 'CTO / Technical Co-Founder', responsibilities: ['Technical architecture', 'AI/ML model development', 'Engineering team leadership', 'Infrastructure & security', 'Technology due diligence readiness'], kpis: ['Platform uptime', 'AI accuracy', 'Engineering velocity', 'Tech debt ratio'], color: '--panel-info' },
];

const EquityAllocationFramework: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('allocation');

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <PieChart className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Startup Equity Allocation Framework</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Ownership distribution, vesting schedules, ESOP planning, dilution modeling, and governance structure</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Founder Stake', value: '75%', color: '--panel-accent' },
            { label: 'ESOP Pool', value: '15%', color: '--panel-success' },
            { label: 'Advisor Pool', value: '5%', color: '--panel-warning' },
            { label: 'Vesting Period', value: '4 Years', color: '--panel-info' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-px px-2 py-1.5 border-b border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-hover)/.3)] overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap",
              activeTab === tab.key
                ? "bg-[hsl(var(--panel-accent)/.1)] text-[hsl(var(--panel-accent))] border border-[hsl(var(--panel-accent)/.2)]"
                : "text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text-secondary))] hover:bg-[hsl(var(--panel-hover))]"
            )}>
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">

          {/* ── Equity Allocation ───────────── */}
          {activeTab === 'allocation' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Pie-like visual bar */}
              <SectionBlock title="Founding Cap Table — Initial Allocation" icon={PieChart}>
                <div className="p-4">
                  <div className="flex h-8 rounded-lg overflow-hidden gap-[2px]">
                    {allocationSlices.map((s) => (
                      <div key={s.holder} className="relative group flex items-center justify-center transition-all hover:opacity-90" style={{ width: `${s.pct}%`, backgroundColor: `hsl(var(${s.color}) / 0.6)` }}>
                        <span className="text-[8px] font-bold text-white drop-shadow-sm">{s.pct}%</span>
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[hsl(var(--panel-bg-elevated))] border border-[hsl(var(--panel-border))] rounded px-2 py-1 text-[7px] text-[hsl(var(--panel-text))] whitespace-nowrap z-10" style={{ boxShadow: 'var(--panel-shadow)' }}>
                          {s.holder}: {s.pct}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 justify-center flex-wrap">
                    {allocationSlices.map((s) => (
                      <div key={s.holder} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `hsl(var(${s.color}) / 0.6)` }} />
                        <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">{s.holder}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionBlock>

              {/* Detail cards */}
              {allocationSlices.map((s) => (
                <div key={s.holder} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: `hsl(var(${s.color}) / 0.6)` }} />
                      <span className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{s.holder}</span>
                    </div>
                    <span className="text-[14px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.pct}%</span>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-[hsl(var(--panel-border-subtle))]">
                    <div className="p-3">
                      <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Role & Responsibility</span>
                      <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] mt-1">{s.role}</p>
                    </div>
                    <div className="p-3">
                      <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Vesting Terms</span>
                      <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] mt-1">{s.vesting}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Vesting Schedules ──────────── */}
          {activeTab === 'vesting' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {vestingSchedules.map((vs) => (
                <div key={vs.type} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" style={{ color: `hsl(var(${vs.color}))` }} />
                      <span className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{vs.type}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Cliff: <strong className="font-mono" style={{ color: `hsl(var(${vs.color}))` }}>{vs.cliff}</strong></span>
                      <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Total: <strong className="font-mono" style={{ color: `hsl(var(${vs.color}))` }}>{vs.total}</strong></span>
                    </div>
                  </div>
                  {/* Visual timeline */}
                  <div className="p-4">
                    <div className="relative">
                      <div className="h-2 rounded-full bg-[hsl(var(--panel-border-subtle))] overflow-hidden">
                        {vs.schedule.map((s, i) => (
                          <div key={i} className="absolute top-0 h-full rounded-full" style={{
                            left: i === 0 ? '0%' : i === 1 ? '25%' : '25%',
                            width: i === 0 ? '25%' : i === 1 ? '0.5%' : '75%',
                            backgroundColor: i === 0 ? `hsl(var(${vs.color}) / 0.15)` : `hsl(var(${vs.color}) / 0.5)`,
                          }} />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[7px] text-[hsl(var(--panel-text-muted))]">Month 0</span>
                        <span className="text-[7px] font-bold" style={{ color: `hsl(var(${vs.color}))` }}>Cliff</span>
                        <span className="text-[7px] text-[hsl(var(--panel-text-muted))]">100% Vested</span>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1.5">
                      {vs.schedule.map((s, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-mono font-bold" style={{ color: `hsl(var(${vs.color}))` }}>{s.period}</span>
                            <span className="text-[8px] text-[hsl(var(--panel-text-secondary))]">{s.event}</span>
                          </div>
                          <span className="text-[9px] font-mono font-bold" style={{ color: `hsl(var(${vs.color}))` }}>{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-[hsl(var(--panel-border-subtle))] space-y-1">
                      {vs.notes.map((n, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <ArrowRight className="h-2 w-2 shrink-0 mt-0.5 text-[hsl(var(--panel-accent)/.5)]" />
                          <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">{n}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── ESOP & Options ─────────────── */}
          {activeTab === 'esop' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <SectionBlock title="ESOP Pool Overview" icon={Award}>
                <div className="grid grid-cols-3 gap-px bg-[hsl(var(--panel-border-subtle))]">
                  {[
                    { label: 'Total Pool', value: '15%', desc: 'Of fully-diluted shares at founding' },
                    { label: 'Authorized Shares', value: '1,500,000', desc: 'From 10M total authorized' },
                    { label: 'Expansion', value: 'At each round', desc: 'Board may increase pool by 2–5%' },
                  ].map((o) => (
                    <div key={o.label} className="bg-[hsl(var(--panel-bg))] p-4 text-center">
                      <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">{o.label}</span>
                      <p className="text-[16px] font-bold font-mono text-[hsl(var(--panel-success))] mt-1">{o.value}</p>
                      <p className="text-[8px] text-[hsl(var(--panel-text-muted))] mt-0.5">{o.desc}</p>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              <SectionBlock title="Equity Grant Ranges by Role" icon={Layers}>
                <div className="overflow-x-auto">
                  <table className="w-full text-[9px]">
                    <thead>
                      <tr className="border-b border-[hsl(var(--panel-border))]">
                        {['Role', 'Equity Range', 'Visual', 'Typical Timing'].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {esopTiers.map((t) => (
                        <tr key={t.role} className="border-b border-[hsl(var(--panel-border-subtle))] hover:bg-[hsl(var(--panel-hover))] transition-colors">
                          <td className="px-3 py-2 font-medium text-[hsl(var(--panel-text))]">{t.role}</td>
                          <td className="px-3 py-2 font-mono font-bold" style={{ color: `hsl(var(${t.color}))` }}>{t.rangeMin}% – {t.rangeMax}%</td>
                          <td className="px-3 py-2">
                            <div className="h-2 w-full max-w-[120px] rounded-full bg-[hsl(var(--panel-border-subtle))] overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${(t.rangeMax / 3) * 100}%`, backgroundColor: `hsl(var(${t.color}) / 0.5)` }} />
                            </div>
                          </td>
                          <td className="px-3 py-2 text-[hsl(var(--panel-text-muted))]">{t.timing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionBlock>

              <SectionBlock title="Performance-Based Acceleration Criteria" icon={Zap}>
                <div className="p-3 space-y-2">
                  {[
                    { trigger: 'Platform reaches 10,000 MAU', acceleration: '+6 months vesting acceleration', scope: 'All ESOP holders' },
                    { trigger: 'Series A close', acceleration: '+3 months vesting acceleration', scope: 'Pre-Seed/Seed hires' },
                    { trigger: 'Individual exceeds OKR targets (2 consecutive quarters)', acceleration: '+3 months vesting acceleration', scope: 'Individual grant' },
                    { trigger: 'Change of control (acquisition)', acceleration: 'Single-trigger: 50% acceleration / Double-trigger: 100%', scope: 'All vested holders' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-start justify-between py-1.5 border-b border-[hsl(var(--panel-border-subtle))] last:border-0">
                      <div className="flex-1">
                        <span className="text-[9px] font-semibold text-[hsl(var(--panel-text))]">{p.trigger}</span>
                        <p className="text-[8px] text-[hsl(var(--panel-text-muted))] mt-0.5">{p.scope}</p>
                      </div>
                      <span className="text-[8px] font-mono font-bold text-[hsl(var(--panel-success))] shrink-0 ml-3">{p.acceleration}</span>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            </div>
          )}

          {/* ── Dilution Planning ──────────── */}
          {activeTab === 'dilution' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <SectionBlock title="Founder Ownership Through Funding Rounds" icon={TrendingUp}>
                <div className="overflow-x-auto">
                  <table className="w-full text-[9px]">
                    <thead>
                      <tr className="border-b border-[hsl(var(--panel-border))]">
                        {['Round', 'Pre-Money Shares', 'New Shares Issued', 'Founder Ownership', 'Valuation'].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dilutionTable.map((r, i) => (
                        <tr key={r.round} className={cn("border-b border-[hsl(var(--panel-border-subtle))] hover:bg-[hsl(var(--panel-hover))] transition-colors", i === 0 && "bg-[hsl(var(--panel-accent)/.03)]")}>
                          <td className="px-3 py-2 font-semibold text-[hsl(var(--panel-text))]">{r.round}</td>
                          <td className="px-3 py-2 font-mono text-[hsl(var(--panel-text-secondary))]">{r.shares}</td>
                          <td className="px-3 py-2 font-mono text-[hsl(var(--panel-info))]">{r.newShares}</td>
                          <td className="px-3 py-2 font-mono font-bold text-[hsl(var(--panel-accent))]">{r.ownership}</td>
                          <td className="px-3 py-2 font-mono text-[hsl(var(--panel-success))]">{r.valuation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionBlock>

              {/* Visual dilution bar */}
              <SectionBlock title="Visual Dilution Waterfall" icon={BarChart3}>
                <div className="p-4 space-y-3">
                  {[
                    { stage: 'Founding', pct: 100, color: '--panel-accent' },
                    { stage: 'After Pre-Seed', pct: 87.5, color: '--panel-info' },
                    { stage: 'After Seed', pct: 70, color: '--panel-success' },
                    { stage: 'After Series A', pct: 52.5, color: '--panel-warning' },
                    { stage: 'After Series B', pct: 42, color: '--panel-error' },
                  ].map((d) => (
                    <div key={d.stage} className="flex items-center gap-3">
                      <span className="text-[8px] text-[hsl(var(--panel-text-muted))] w-24 text-right shrink-0">{d.stage}</span>
                      <div className="flex-1 h-4 rounded-full bg-[hsl(var(--panel-border-subtle))] overflow-hidden">
                        <div className="h-full rounded-full transition-all flex items-center justify-end pr-2" style={{ width: `${d.pct}%`, backgroundColor: `hsl(var(${d.color}) / 0.5)` }}>
                          <span className="text-[7px] font-bold text-white drop-shadow-sm">{d.pct}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              <div className="rounded-lg bg-[hsl(var(--panel-accent)/.03)] border border-[hsl(var(--panel-accent)/.12)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-[hsl(var(--panel-warning))]" />
                  <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">
                    Anti-dilution protection: Negotiate broad-based weighted average (not full ratchet) to protect founder economics in down-rounds.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Governance ─────────────────── */}
          {activeTab === 'governance' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Board evolution */}
              <SectionBlock title="Board Composition Evolution" icon={Users}>
                <div className="overflow-x-auto">
                  <table className="w-full text-[9px]">
                    <thead>
                      <tr className="border-b border-[hsl(var(--panel-border))]">
                        {['Stage', 'Board Structure', 'Control Dynamic'].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {governanceItems[0].evolution?.map((e) => (
                        <tr key={e.stage} className="border-b border-[hsl(var(--panel-border-subtle))] hover:bg-[hsl(var(--panel-hover))] transition-colors">
                          <td className="px-3 py-2 font-bold text-[hsl(var(--panel-accent))]">{e.stage}</td>
                          <td className="px-3 py-2 text-[hsl(var(--panel-text-secondary))]">{e.structure}</td>
                          <td className="px-3 py-2 font-medium text-[hsl(var(--panel-text))]">{e.control}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionBlock>

              {/* Decision rights */}
              <SectionBlock title="Decision-Making Authority Matrix" icon={Lock}>
                <div className="overflow-x-auto">
                  <table className="w-full text-[9px]">
                    <thead>
                      <tr className="border-b border-[hsl(var(--panel-border))]">
                        {['Decision', 'Authority', 'Approval Required'].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {governanceItems[1].rights?.map((r) => (
                        <tr key={r.decision} className="border-b border-[hsl(var(--panel-border-subtle))] hover:bg-[hsl(var(--panel-hover))] transition-colors">
                          <td className="px-3 py-2 text-[hsl(var(--panel-text))]">{r.decision}</td>
                          <td className="px-3 py-2 font-bold text-[hsl(var(--panel-info))]">{r.authority}</td>
                          <td className="px-3 py-2 text-[hsl(var(--panel-text-muted))]">{r.approval}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionBlock>

              {/* Founder roles */}
              <SectionBlock title="Founder Role Responsibility Alignment" icon={Briefcase}>
                <div className="grid grid-cols-2 gap-px bg-[hsl(var(--panel-border-subtle))]">
                  {founderRoles.map((fr) => (
                    <div key={fr.role} className="bg-[hsl(var(--panel-bg))] p-4">
                      <span className="text-[11px] font-bold" style={{ color: `hsl(var(${fr.color}))` }}>{fr.role}</span>
                      <div className="mt-2.5 space-y-1.5">
                        <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Responsibilities</span>
                        {fr.responsibilities.map((r, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <ArrowRight className="h-2 w-2 shrink-0 text-[hsl(var(--panel-accent)/.5)]" />
                            <span className="text-[8px] text-[hsl(var(--panel-text-secondary))]">{r}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2.5 space-y-1">
                        <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Success KPIs</span>
                        <div className="flex flex-wrap gap-1">
                          {fr.kpis.map((k, i) => (
                            <span key={i} className="text-[7px] px-1.5 py-0.5 rounded border font-medium" style={{ color: `hsl(var(${fr.color}))`, borderColor: `hsl(var(${fr.color}) / 0.2)`, backgroundColor: `hsl(var(${fr.color}) / 0.05)` }}>
                              {k}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            </div>
          )}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Equity Framework v1.0 — Conceptual model for strategic planning; consult legal counsel before formalizing
      </p>
    </div>
  );
};

export default EquityAllocationFramework;
