import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Calculator, TrendingUp, DollarSign, BarChart3, ArrowRight,
  Building2, Users, Layers, CreditCard, Server, Megaphone,
  Briefcase, Scale, ChevronDown, AlertTriangle, Target,
  Sparkles, CheckCircle2, ArrowUpRight, ArrowDownRight, Minus,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — 24-Month Financial Projection Model
   Revenue growth, cost structure, break-even, and scenarios
   ═══════════════════════════════════════════════════════════ */

// ── Formatting ──────────────────────────────────────────
const fmtIDR = (v: number) => {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${(v / 1e3).toFixed(0)}K`;
};

// ── Growth Assumptions ──────────────────────────────────
interface Assumptions {
  listingGrowthPct: number;      // monthly listing inventory growth %
  userGrowthPct: number;         // monthly investor user growth %
  conversionImprovement: number; // monthly conversion ratio improvement bps
  initialListings: number;
  initialUsers: number;
  initialConversionRate: number; // base transaction conversion %
  avgPropertyPrice: number;      // IDR
  commissionRate: number;        // %
  devPromoFeePerProject: number; // IDR per developer project/month
  devProjectGrowth: number;      // new dev projects per quarter
  serviceMarketplaceTakeRate: number; // %
  avgServiceTransaction: number;
  premiumSubPrice: number;       // IDR/month avg across tiers
  premiumAdoptionPct: number;    // % of users converting to paid
}

const defaultAssumptions: Assumptions = {
  listingGrowthPct: 15,
  userGrowthPct: 20,
  conversionImprovement: 0.02,
  initialListings: 200,
  initialUsers: 500,
  initialConversionRate: 0.5,
  avgPropertyPrice: 2_500_000_000,
  commissionRate: 1.5,
  devPromoFeePerProject: 15_000_000,
  devProjectGrowth: 2,
  serviceMarketplaceTakeRate: 10,
  avgServiceTransaction: 5_000_000,
  premiumSubPrice: 500_000,
  premiumAdoptionPct: 5,
};

// ── Cost Structure ──────────────────────────────────────
interface MonthlyCosts {
  techDev: number;
  hosting: number;
  marketing: number;
  staffing: number;
  legal: number;
  misc: number;
}

const baseCosts: MonthlyCosts = {
  techDev: 80_000_000,
  hosting: 15_000_000,
  marketing: 50_000_000,
  staffing: 120_000_000,
  legal: 10_000_000,
  misc: 10_000_000,
};

// Cost growth phases
const getCosts = (month: number): MonthlyCosts => {
  const scale = month <= 6 ? 1 : month <= 12 ? 1.3 : month <= 18 ? 1.6 : 2.0;
  const mktScale = month <= 3 ? 0.6 : month <= 6 ? 1 : month <= 12 ? 1.5 : 2.0;
  return {
    techDev: Math.round(baseCosts.techDev * scale),
    hosting: Math.round(baseCosts.hosting * (1 + (month - 1) * 0.08)),
    marketing: Math.round(baseCosts.marketing * mktScale),
    staffing: Math.round(baseCosts.staffing * scale),
    legal: Math.round(baseCosts.legal * (month <= 6 ? 1.5 : 1)),
    misc: Math.round(baseCosts.misc * scale),
  };
};

// ── Projection Engine ───────────────────────────────────
interface MonthData {
  month: number;
  listings: number;
  users: number;
  conversionRate: number;
  transactions: number;
  commissionRevenue: number;
  devPromoRevenue: number;
  serviceRevenue: number;
  subscriptionRevenue: number;
  totalRevenue: number;
  costs: MonthlyCosts;
  totalCosts: number;
  netIncome: number;
  cumNetIncome: number;
}

function generateProjection(a: Assumptions): MonthData[] {
  const data: MonthData[] = [];
  let cumNet = 0;
  let devProjects = 1;

  for (let m = 1; m <= 24; m++) {
    const listings = Math.round(a.initialListings * Math.pow(1 + a.listingGrowthPct / 100, m - 1));
    const users = Math.round(a.initialUsers * Math.pow(1 + a.userGrowthPct / 100, m - 1));
    const conversionRate = Math.min(a.initialConversionRate + (m - 1) * a.conversionImprovement, 3);
    const transactions = Math.max(1, Math.round(users * (conversionRate / 100)));
    const commissionRevenue = Math.round(transactions * a.avgPropertyPrice * (a.commissionRate / 100));

    if (m % 3 === 0) devProjects += a.devProjectGrowth;
    const devPromoRevenue = Math.round(devProjects * a.devPromoFeePerProject);

    const serviceTransactions = Math.round(transactions * 0.3 + users * 0.01);
    const serviceRevenue = Math.round(serviceTransactions * a.avgServiceTransaction * (a.serviceMarketplaceTakeRate / 100));

    const premiumUsers = Math.round(users * (Math.min(a.premiumAdoptionPct + m * 0.3, 15) / 100));
    const subscriptionRevenue = Math.round(premiumUsers * a.premiumSubPrice);

    const totalRevenue = commissionRevenue + devPromoRevenue + serviceRevenue + subscriptionRevenue;
    const costs = getCosts(m);
    const totalCosts = Object.values(costs).reduce((s, c) => s + c, 0);
    const netIncome = totalRevenue - totalCosts;
    cumNet += netIncome;

    data.push({ month: m, listings, users, conversionRate, transactions, commissionRevenue, devPromoRevenue, serviceRevenue, subscriptionRevenue, totalRevenue, costs, totalCosts, netIncome, cumNetIncome: cumNet });
  }
  return data;
};

// ── Tabs ────────────────────────────────────────────────
type TabKey = 'overview' | 'revenue' | 'costs' | 'projection' | 'scenarios';
const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'revenue', label: 'Revenue Streams', icon: DollarSign },
  { key: 'costs', label: 'Cost Structure', icon: CreditCard },
  { key: 'projection', label: 'Monthly Table', icon: Calculator },
  { key: 'scenarios', label: 'Scenarios', icon: Sparkles },
];

// ── Component ───────────────────────────────────────────
const FinancialProjectionModel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const projection = useMemo(() => generateProjection(defaultAssumptions), []);

  const breakEvenMonth = projection.find(d => d.netIncome > 0)?.month ?? null;
  const m6 = projection[5];
  const m12 = projection[11];
  const m18 = projection[17];
  const m24 = projection[23];
  const totalRev24 = projection.reduce((s, d) => s + d.totalRevenue, 0);
  const totalCost24 = projection.reduce((s, d) => s + d.totalCosts, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ── Header ──────────────────────────────── */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Calculator className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">24-Month Financial Projection</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Revenue growth model, cost structure, and break-even analysis for investor discussions</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Break-even', value: breakEvenMonth ? `Month ${breakEvenMonth}` : 'N/A', color: '--panel-success' },
            { label: '24M Revenue', value: fmtIDR(totalRev24), color: '--panel-accent' },
            { label: '24M Costs', value: fmtIDR(totalCost24), color: '--panel-error' },
            { label: 'Month 24 MRR', value: fmtIDR(m24.totalRevenue), color: '--panel-info' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab Bar + Content ───────────────────── */}
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

          {/* ── Overview Tab ─────────────────── */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Milestone cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[hsl(var(--panel-border-subtle))] rounded-lg overflow-hidden">
                {[
                  { label: 'Month 6', rev: m6.totalRevenue, cost: m6.totalCosts, users: m6.users, listings: m6.listings },
                  { label: 'Month 12', rev: m12.totalRevenue, cost: m12.totalCosts, users: m12.users, listings: m12.listings },
                  { label: 'Month 18', rev: m18.totalRevenue, cost: m18.totalCosts, users: m18.users, listings: m18.listings },
                  { label: 'Month 24', rev: m24.totalRevenue, cost: m24.totalCosts, users: m24.users, listings: m24.listings },
                ].map((ms) => (
                  <div key={ms.label} className="bg-[hsl(var(--panel-bg))] p-4">
                    <span className="text-[9px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">{ms.label}</span>
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">Revenue</span>
                        <span className="text-[11px] font-bold font-mono text-[hsl(var(--panel-success))]">{fmtIDR(ms.rev)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">Costs</span>
                        <span className="text-[11px] font-bold font-mono text-[hsl(var(--panel-error))]">{fmtIDR(ms.cost)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">Net</span>
                        <span className={cn("text-[11px] font-bold font-mono", ms.rev - ms.cost >= 0 ? "text-[hsl(var(--panel-success))]" : "text-[hsl(var(--panel-error))]")}>
                          {ms.rev - ms.cost >= 0 ? '+' : ''}{fmtIDR(ms.rev - ms.cost)}
                        </span>
                      </div>
                      <div className="pt-1 border-t border-[hsl(var(--panel-border-subtle))]">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Users</span>
                          <span className="text-[9px] font-mono text-[hsl(var(--panel-info))]">{ms.users.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Listings</span>
                          <span className="text-[9px] font-mono text-[hsl(var(--panel-accent))]">{ms.listings.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue bar chart (simple CSS) */}
              <SectionBlock title="Monthly Revenue vs Costs (24 months)" icon={BarChart3}>
                <div className="p-3">
                  <div className="flex items-end gap-[2px] h-32">
                    {projection.map((d) => {
                      const maxVal = m24.totalRevenue * 1.1;
                      const revH = Math.max(2, (d.totalRevenue / maxVal) * 100);
                      const costH = Math.max(2, (d.totalCosts / maxVal) * 100);
                      return (
                        <div key={d.month} className="flex-1 flex items-end gap-[1px] group relative">
                          <div className="flex-1 rounded-t-sm transition-all" style={{ height: `${revH}%`, backgroundColor: 'hsl(var(--panel-success) / 0.6)' }} />
                          <div className="flex-1 rounded-t-sm transition-all" style={{ height: `${costH}%`, backgroundColor: 'hsl(var(--panel-error) / 0.4)' }} />
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 hidden group-hover:block bg-[hsl(var(--panel-bg-elevated))] border border-[hsl(var(--panel-border))] rounded px-1.5 py-0.5 text-[7px] text-[hsl(var(--panel-text))] whitespace-nowrap z-10" style={{ boxShadow: 'var(--panel-shadow)' }}>
                            M{d.month}: {fmtIDR(d.totalRevenue)} / {fmtIDR(d.totalCosts)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Month 1</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'hsl(var(--panel-success) / 0.6)' }} /><span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Revenue</span></div>
                      <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: 'hsl(var(--panel-error) / 0.4)' }} /><span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Costs</span></div>
                    </div>
                    <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Month 24</span>
                  </div>
                  {breakEvenMonth && (
                    <div className="mt-2 text-center">
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-[hsl(var(--panel-success)/.1)] text-[hsl(var(--panel-success))] font-semibold">
                        ✓ Break-even estimated at Month {breakEvenMonth}
                      </span>
                    </div>
                  )}
                </div>
              </SectionBlock>

              {/* Growth assumptions */}
              <SectionBlock title="Growth Assumption Variables" icon={TrendingUp}>
                <div className="grid grid-cols-3 gap-px bg-[hsl(var(--panel-border-subtle))]">
                  {[
                    { label: 'Listing Growth', value: `${defaultAssumptions.listingGrowthPct}%/mo`, desc: 'Monthly inventory expansion rate' },
                    { label: 'User Growth', value: `${defaultAssumptions.userGrowthPct}%/mo`, desc: 'Investor user growth percentage' },
                    { label: 'Conversion Improvement', value: `+${defaultAssumptions.conversionImprovement * 100} bps/mo`, desc: 'Transaction conversion ratio uplift' },
                  ].map((g) => (
                    <div key={g.label} className="bg-[hsl(var(--panel-bg))] p-3">
                      <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))]">{g.label}</span>
                      <p className="text-[14px] font-bold font-mono text-[hsl(var(--panel-accent))] mt-1">{g.value}</p>
                      <p className="text-[8px] text-[hsl(var(--panel-text-muted))] mt-0.5">{g.desc}</p>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            </div>
          )}

          {/* ── Revenue Streams Tab ──────────── */}
          {activeTab === 'revenue' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {[
                {
                  stream: 'Property Sales Commission',
                  icon: Building2, color: '--panel-accent',
                  model: `${defaultAssumptions.commissionRate}% of transaction value`,
                  m6: m6.commissionRevenue, m12: m12.commissionRevenue, m24: m24.commissionRevenue,
                  assumptions: [`Avg property price: ${fmtIDR(defaultAssumptions.avgPropertyPrice)}`, `Base conversion: ${defaultAssumptions.initialConversionRate}% improving +${defaultAssumptions.conversionImprovement * 100}bps/mo`, 'Commission collected on completed transactions only'],
                },
                {
                  stream: 'Developer Project Promotion',
                  icon: Layers, color: '--panel-info',
                  model: `${fmtIDR(defaultAssumptions.devPromoFeePerProject)}/project/month`,
                  m6: m6.devPromoRevenue, m12: m12.devPromoRevenue, m24: m24.devPromoRevenue,
                  assumptions: [`Starting with 1 developer project`, `+${defaultAssumptions.devProjectGrowth} new projects per quarter`, 'Includes featured listing, launch page, AI analytics access'],
                },
                {
                  stream: 'Service Marketplace Fees',
                  icon: Briefcase, color: '--panel-success',
                  model: `${defaultAssumptions.serviceMarketplaceTakeRate}% platform take rate`,
                  m6: m6.serviceRevenue, m12: m12.serviceRevenue, m24: m24.serviceRevenue,
                  assumptions: [`Avg service transaction: ${fmtIDR(defaultAssumptions.avgServiceTransaction)}`, 'Service usage correlated to property transactions', 'Categories: legal, renovation, inspection, insurance'],
                },
                {
                  stream: 'Premium Subscriptions',
                  icon: CreditCard, color: '--panel-warning',
                  model: `${fmtIDR(defaultAssumptions.premiumSubPrice)}/user/month avg`,
                  m6: m6.subscriptionRevenue, m12: m12.subscriptionRevenue, m24: m24.subscriptionRevenue,
                  assumptions: [`Base adoption: ${defaultAssumptions.premiumAdoptionPct}% growing +0.3%/mo`, 'Tiers: Gold, Platinum, Diamond', 'AI request limits, priority access, private deals'],
                },
              ].map((rs) => (
                <div key={rs.stream} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md border shrink-0" style={{ backgroundColor: `hsl(var(${rs.color}) / 0.1)`, borderColor: `hsl(var(${rs.color}) / 0.2)` }}>
                      <rs.icon className="h-3 w-3" style={{ color: `hsl(var(${rs.color}))` }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{rs.stream}</h4>
                      <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">{rs.model}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-[hsl(var(--panel-border-subtle))]">
                    {[{ label: 'Month 6', val: rs.m6 }, { label: 'Month 12', val: rs.m12 }, { label: 'Month 24', val: rs.m24 }].map((p) => (
                      <div key={p.label} className="bg-[hsl(var(--panel-bg))] p-3 text-center">
                        <span className="text-[8px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{p.label}</span>
                        <p className="text-[12px] font-bold font-mono mt-0.5" style={{ color: `hsl(var(${rs.color}))` }}>{fmtIDR(p.val)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 space-y-1">
                    {rs.assumptions.map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <ArrowRight className="h-2 w-2 text-[hsl(var(--panel-accent)/.5)]" />
                        <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Cost Structure Tab ───────────── */}
          {activeTab === 'costs' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {[
                { cat: 'Technology Development', icon: Server, color: '--panel-info', base: baseCosts.techDev, m12: getCosts(12).techDev, m24: getCosts(24).techDev, items: ['Frontend & backend engineering', 'AI/ML model development', 'Third-party API costs', 'QA and testing'] },
                { cat: 'Hosting & Infrastructure', icon: Server, color: '--panel-accent', base: baseCosts.hosting, m12: getCosts(12).hosting, m24: getCosts(24).hosting, items: ['Supabase / cloud hosting', 'CDN and media storage', 'AI compute costs', 'Monitoring tools'] },
                { cat: 'Marketing & Acquisition', icon: Megaphone, color: '--panel-warning', base: baseCosts.marketing, m12: getCosts(12).marketing, m24: getCosts(24).marketing, items: ['Paid digital advertising', 'Content creation', 'Influencer partnerships', 'PR and events'] },
                { cat: 'Staffing & Operations', icon: Users, color: '--panel-success', base: baseCosts.staffing, m12: getCosts(12).staffing, m24: getCosts(24).staffing, items: ['Core team salaries', 'Partnership managers', 'Customer support', 'Contractors'] },
                { cat: 'Legal & Compliance', icon: Scale, color: '--panel-error', base: baseCosts.legal, m12: getCosts(12).legal, m24: getCosts(24).legal, items: ['Company licensing', 'Legal counsel retainer', 'Data protection compliance', 'Audit and reporting'] },
              ].map((c) => (
                <div key={c.cat} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-2.5 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                    <div className="flex items-center justify-center w-6 h-6 rounded-md border shrink-0" style={{ backgroundColor: `hsl(var(${c.color}) / 0.1)`, borderColor: `hsl(var(${c.color}) / 0.2)` }}>
                      <c.icon className="h-3 w-3" style={{ color: `hsl(var(${c.color}))` }} />
                    </div>
                    <span className="text-[11px] font-bold text-[hsl(var(--panel-text))] flex-1">{c.cat}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-px bg-[hsl(var(--panel-border-subtle))]">
                    {[{ label: 'Month 1', val: c.base }, { label: 'Month 12', val: c.m12 }, { label: 'Month 24', val: c.m24 }].map((p) => (
                      <div key={p.label} className="bg-[hsl(var(--panel-bg))] p-2.5 text-center">
                        <span className="text-[8px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{p.label}</span>
                        <p className="text-[11px] font-bold font-mono text-[hsl(var(--panel-error))] mt-0.5">{fmtIDR(p.val)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 p-3">
                    {c.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-[hsl(var(--panel-text-muted)/.3)]" />
                        <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Total cost summary */}
              <div className="rounded-lg bg-[hsl(var(--panel-error)/.04)] border border-[hsl(var(--panel-error)/.15)] px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">Total 24-Month Operating Costs</span>
                  <span className="text-[13px] font-bold font-mono text-[hsl(var(--panel-error))]">{fmtIDR(totalCost24)}</span>
                </div>
              </div>
            </div>
          )}

          {/* ── Monthly Projection Table ─────── */}
          {activeTab === 'projection' && (
            <div className="animate-in fade-in duration-200">
              <div className="overflow-x-auto">
                <table className="w-full text-[9px]">
                  <thead>
                    <tr className="border-b border-[hsl(var(--panel-border))]">
                      {['M', 'Listings', 'Users', 'Conv%', 'Txn', 'Commission', 'Dev Promo', 'Services', 'Subs', 'Revenue', 'Costs', 'Net'].map((h) => (
                        <th key={h} className="px-2 py-2 text-left font-semibold text-[hsl(var(--panel-text-muted))] uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projection.map((d) => (
                      <tr key={d.month} className={cn(
                        "border-b border-[hsl(var(--panel-border-subtle))] hover:bg-[hsl(var(--panel-hover))] transition-colors",
                        d.month === breakEvenMonth && "bg-[hsl(var(--panel-success)/.05)]"
                      )}>
                        <td className="px-2 py-1.5 font-mono font-bold text-[hsl(var(--panel-accent))]">{d.month}</td>
                        <td className="px-2 py-1.5 font-mono text-[hsl(var(--panel-text-secondary))]">{d.listings.toLocaleString()}</td>
                        <td className="px-2 py-1.5 font-mono text-[hsl(var(--panel-text-secondary))]">{d.users.toLocaleString()}</td>
                        <td className="px-2 py-1.5 font-mono text-[hsl(var(--panel-text-secondary))]">{d.conversionRate.toFixed(2)}%</td>
                        <td className="px-2 py-1.5 font-mono text-[hsl(var(--panel-text-secondary))]">{d.transactions}</td>
                        <td className="px-2 py-1.5 font-mono text-[hsl(var(--panel-success))]">{fmtIDR(d.commissionRevenue)}</td>
                        <td className="px-2 py-1.5 font-mono text-[hsl(var(--panel-info))]">{fmtIDR(d.devPromoRevenue)}</td>
                        <td className="px-2 py-1.5 font-mono text-[hsl(var(--panel-success))]">{fmtIDR(d.serviceRevenue)}</td>
                        <td className="px-2 py-1.5 font-mono text-[hsl(var(--panel-warning))]">{fmtIDR(d.subscriptionRevenue)}</td>
                        <td className="px-2 py-1.5 font-mono font-bold text-[hsl(var(--panel-success))]">{fmtIDR(d.totalRevenue)}</td>
                        <td className="px-2 py-1.5 font-mono text-[hsl(var(--panel-error))]">{fmtIDR(d.totalCosts)}</td>
                        <td className={cn("px-2 py-1.5 font-mono font-bold", d.netIncome >= 0 ? "text-[hsl(var(--panel-success))]" : "text-[hsl(var(--panel-error))]")}>
                          {d.netIncome >= 0 ? '+' : ''}{fmtIDR(d.netIncome)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Scenarios Tab ────────────────── */}
          {activeTab === 'scenarios' && <ScenarioTab projection={projection} breakEvenMonth={breakEvenMonth} />}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Financial Projection Model v1.0 — Estimates for strategic planning; not audited financial forecasts
      </p>
    </div>
  );
};

// ── Scenario Comparison ─────────────────────────────────
const ScenarioTab: React.FC<{ projection: MonthData[]; breakEvenMonth: number | null }> = ({ projection, breakEvenMonth }) => {
  const scenarios = useMemo(() => {
    const conservative = generateProjection({ ...defaultAssumptions, listingGrowthPct: 10, userGrowthPct: 12, conversionImprovement: 0.01 });
    const aggressive = generateProjection({ ...defaultAssumptions, listingGrowthPct: 25, userGrowthPct: 30, conversionImprovement: 0.03 });
    return { conservative, base: projection, aggressive };
  }, [projection]);

  const scenarioData = [
    { name: 'Conservative', color: '--panel-warning', data: scenarios.conservative, growthLabel: '10% listing / 12% user growth' },
    { name: 'Base Case', color: '--panel-accent', data: scenarios.base, growthLabel: '15% listing / 20% user growth' },
    { name: 'Aggressive', color: '--panel-success', data: scenarios.aggressive, growthLabel: '25% listing / 30% user growth' },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[hsl(var(--panel-border-subtle))] rounded-lg overflow-hidden">
        {scenarioData.map((sc) => {
          const m24 = sc.data[23];
          const totalRev = sc.data.reduce((s, d) => s + d.totalRevenue, 0);
          const be = sc.data.find(d => d.netIncome > 0)?.month ?? null;
          return (
            <div key={sc.name} className="bg-[hsl(var(--panel-bg))] p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(var(${sc.color}))` }} />
                <span className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{sc.name}</span>
              </div>
              <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">{sc.growthLabel}</span>
              <div className="mt-3 space-y-2">
                {[
                  { label: 'Month 24 MRR', value: fmtIDR(m24.totalRevenue) },
                  { label: '24M Total Revenue', value: fmtIDR(totalRev) },
                  { label: 'Month 24 Users', value: m24.users.toLocaleString() },
                  { label: 'Month 24 Listings', value: m24.listings.toLocaleString() },
                  { label: 'Break-even', value: be ? `Month ${be}` : 'Beyond M24' },
                ].map((r) => (
                  <div key={r.label} className="flex items-center justify-between">
                    <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">{r.label}</span>
                    <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${sc.color}))` }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue trajectory comparison */}
      <SectionBlock title="Revenue Trajectory Comparison" icon={TrendingUp}>
        <div className="p-3">
          <div className="flex items-end gap-[3px] h-28">
            {[0, 2, 5, 8, 11, 14, 17, 20, 23].map((mi) => {
              const maxVal = scenarios.aggressive[23].totalRevenue * 1.1;
              return (
                <div key={mi} className="flex-1 flex items-end gap-[1px]">
                  {scenarioData.map((sc) => (
                    <div
                      key={sc.name}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${Math.max(2, (sc.data[mi].totalRevenue / maxVal) * 100)}%`,
                        backgroundColor: `hsl(var(${sc.color}) / 0.5)`,
                      }}
                    />
                  ))}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">M1</span>
            <div className="flex items-center gap-3">
              {scenarioData.map((sc) => (
                <div key={sc.name} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: `hsl(var(${sc.color}) / 0.5)` }} />
                  <span className="text-[7px] text-[hsl(var(--panel-text-muted))]">{sc.name}</span>
                </div>
              ))}
            </div>
            <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">M24</span>
          </div>
        </div>
      </SectionBlock>

      <div className="rounded-lg bg-[hsl(var(--panel-accent)/.03)] border border-[hsl(var(--panel-accent)/.12)] px-4 py-2.5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3 w-3 text-[hsl(var(--panel-warning))]" />
          <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">
            Projections are directional estimates for strategic planning. Actual results depend on market conditions, execution speed, and regulatory environment.
          </span>
        </div>
      </div>
    </div>
  );
};

/* ── Reusable Section Block ──────────────────────────── */
const SectionBlock: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
      <Icon className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
      <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">{title}</span>
    </div>
    {children}
  </div>
);

export default FinancialProjectionModel;
