import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Rocket, Target, TrendingUp, DollarSign, Shield, Globe,
  ArrowRight, CheckCircle2, AlertTriangle, Zap, Building2,
  Users, Brain, BarChart3, Crown, Handshake, Eye, Layers,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Fundraising & Exit Preparation Roadmap
   Staged capital raising + long-term exit positioning
   ═══════════════════════════════════════════════════════════ */

type TabKey = 'stages' | 'milestones' | 'exit' | 'timeline' | 'checklist';
const tabs: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'stages', label: 'Funding Stages', icon: Rocket },
  { key: 'milestones', label: 'Signal Metrics', icon: Target },
  { key: 'exit', label: 'Exit Positioning', icon: Crown },
  { key: 'timeline', label: 'Capital Timeline', icon: BarChart3 },
  { key: 'checklist', label: 'Readiness Checklist', icon: CheckCircle2 },
];

interface FundingStage {
  stage: string;
  label: string;
  color: string;
  targetRaise: string;
  valuationRange: string;
  timing: string;
  useOfFunds: string[];
  signals: { metric: string; target: string; status: 'pending' | 'partial' | 'met' }[];
  investorType: string[];
  dilution: string;
}

const fundingStages: FundingStage[] = [
  {
    stage: 'pre-seed', label: 'Pre-Seed', color: '--panel-info',
    targetRaise: 'IDR 1–3B ($60K–$180K)', valuationRange: 'IDR 8–15B ($500K–$1M)',
    timing: 'Month 1–6', dilution: '10–15%',
    useOfFunds: ['MVP completion & launch', 'Initial marketing & PR', 'Core team formation (3–5 people)', 'First 200 property listings onboarding'],
    signals: [
      { metric: 'Working MVP platform', target: 'Live & functional', status: 'met' },
      { metric: 'Property listings', target: '200+ active', status: 'partial' },
      { metric: 'Registered users', target: '500+', status: 'pending' },
      { metric: 'AI scoring operational', target: 'Investment scores live', status: 'met' },
    ],
    investorType: ['Angel investors', 'Founder friends & family', 'Proptech micro-VCs', 'Startup accelerators'],
  },
  {
    stage: 'seed', label: 'Seed', color: '--panel-accent',
    targetRaise: 'IDR 8–20B ($500K–$1.2M)', valuationRange: 'IDR 40–80B ($2.5M–$5M)',
    timing: 'Month 6–12', dilution: '15–20%',
    useOfFunds: ['Scale engineering team (8–12)', 'Marketing & user acquisition ramp', 'Developer partnership expansion', 'AI model enhancement & data pipeline'],
    signals: [
      { metric: 'Monthly revenue', target: 'IDR 50M+ MRR', status: 'pending' },
      { metric: 'Developer partnerships', target: '10+ active projects', status: 'pending' },
      { metric: 'AI recommendation accuracy', target: '85%+ validation', status: 'partial' },
      { metric: 'Monthly active users', target: '5,000+', status: 'pending' },
      { metric: 'Transaction pipeline', target: '10+ facilitated deals', status: 'pending' },
    ],
    investorType: ['Seed-stage VCs (SEA focus)', 'Proptech-specialized funds', 'Strategic angels (real estate)', 'Corporate venture arms'],
  },
  {
    stage: 'series-a', label: 'Series A', color: '--panel-success',
    targetRaise: 'IDR 50–160B ($3M–$10M)', valuationRange: 'IDR 250–500B ($15M–$30M)',
    timing: 'Month 18–24', dilution: '20–25%',
    useOfFunds: ['Regional expansion (3+ Indonesian cities)', 'Enterprise sales team', 'Institutional investor product', 'Data infrastructure & AI R&D', 'Regulatory compliance scaling'],
    signals: [
      { metric: 'ARR run rate', target: 'IDR 3B+ ($180K+)', status: 'pending' },
      { metric: 'User base', target: '50,000+ registered', status: 'pending' },
      { metric: 'Premium subscribers', target: '500+ paid users', status: 'pending' },
      { metric: 'Gross margin', target: '70%+', status: 'pending' },
      { metric: 'City coverage', target: '5+ major cities', status: 'pending' },
      { metric: 'Institutional interest', target: '3+ LOIs from funds', status: 'pending' },
    ],
    investorType: ['Series A VCs', 'Regional tech funds', 'Real estate PE firms', 'Strategic corporate investors'],
  },
  {
    stage: 'series-b', label: 'Series B+', color: '--panel-warning',
    targetRaise: 'IDR 250–800B ($15M–$50M)', valuationRange: 'IDR 1T–3T ($60M–$180M)',
    timing: 'Month 30–42', dilution: '15–20%',
    useOfFunds: ['Southeast Asia expansion', 'B2B institutional SaaS product', 'M&A of complementary platforms', 'AI research lab establishment', 'IPO preparation activities'],
    signals: [
      { metric: 'ARR', target: 'IDR 25B+ ($1.5M+)', status: 'pending' },
      { metric: 'Multi-country presence', target: '3+ SEA markets', status: 'pending' },
      { metric: 'Institutional clients', target: '20+ enterprise accounts', status: 'pending' },
      { metric: 'Data moat', target: 'Proprietary market dataset', status: 'pending' },
      { metric: 'Team size', target: '80+ employees', status: 'pending' },
    ],
    investorType: ['Growth-stage VCs', 'Global proptech funds', 'Sovereign wealth funds', 'Strategic acquirers (minority)'],
  },
];

interface ExitPath {
  path: string;
  icon: LucideIcon;
  color: string;
  probability: string;
  timeframe: string;
  valuationMultiple: string;
  description: string;
  prerequisites: string[];
  potentialAcquirers: string[];
}

const exitPaths: ExitPath[] = [
  {
    path: 'Strategic Acquisition', icon: Handshake, color: '--panel-accent',
    probability: 'High (most likely)', timeframe: 'Year 5–7', valuationMultiple: '8–15x ARR',
    description: 'Acquired by global property portal, regional super-app, or financial institution seeking AI real estate intelligence capabilities.',
    prerequisites: ['Proprietary market data covering 5+ SEA countries', 'Proven AI models with 90%+ accuracy', 'Strong user base with network effects', '50,000+ active investors on platform'],
    potentialAcquirers: ['PropertyGuru / 99.co', 'Grab / GoTo (super-app expansion)', 'Regional banks (digital transformation)', 'Global portals (Zillow, REA Group)'],
  },
  {
    path: 'B2B Intelligence SaaS Pivot', icon: Brain, color: '--panel-info',
    probability: 'Medium-High', timeframe: 'Year 4–6', valuationMultiple: '12–20x ARR',
    description: 'Pivot core AI engine into institutional-grade real estate intelligence platform serving funds, banks, and developers.',
    prerequisites: ['Enterprise API product with SLA guarantees', '20+ institutional clients', 'Recurring B2B revenue >60% of total', 'SOC 2 / ISO 27001 certification'],
    potentialAcquirers: ['CoStar Group', 'MSCI (real estate analytics)', 'Bloomberg (alternative data)', 'CoreLogic'],
  },
  {
    path: 'IPO / Public Markets', icon: Globe, color: '--panel-success',
    probability: 'Lower (long-term)', timeframe: 'Year 7–10', valuationMultiple: '15–30x ARR',
    description: 'List on IDX or regional exchange as the definitive proptech intelligence platform in Southeast Asia.',
    prerequisites: ['ARR >IDR 150B ($9M+)', 'Positive EBITDA for 4+ quarters', 'Multi-country operations', 'Robust governance & audit trail', '200+ employees'],
    potentialAcquirers: ['IDX listing (Indonesia Stock Exchange)', 'SGX (Singapore)', 'Dual listing strategy'],
  },
];

const timelinePhases = [
  { phase: 'Foundation', period: 'M1–M6', color: '--panel-info', items: ['MVP launch & validation', 'First 200 listings', 'Angel outreach', 'Accelerator applications', 'Pre-seed close'] },
  { phase: 'Traction', period: 'M6–M12', color: '--panel-accent', items: ['Revenue activation', 'Seed fundraise', '10+ dev partnerships', '5,000 MAU milestone', 'AI accuracy proof'] },
  { phase: 'Scale', period: 'M12–M24', color: '--panel-success', items: ['Series A preparation', 'Multi-city expansion', '50K users', 'Institutional product', 'IDR 3B+ ARR'] },
  { phase: 'Dominance', period: 'M24–M42', color: '--panel-warning', items: ['Series B+ raise', 'SEA expansion', 'B2B SaaS launch', 'Data moat solidification', 'Exit preparation'] },
];

const readinessChecklist: { category: string; icon: LucideIcon; color: string; items: { task: string; stage: string; done: boolean }[] }[] = [
  {
    category: 'Legal & Corporate', icon: Shield, color: '--panel-info',
    items: [
      { task: 'PT entity incorporated with clean cap table', stage: 'Pre-Seed', done: false },
      { task: 'SHA (Shareholder Agreement) with vesting schedules', stage: 'Pre-Seed', done: false },
      { task: 'IP assignment agreements signed', stage: 'Pre-Seed', done: false },
      { task: 'ESOP pool established (10–15%)', stage: 'Seed', done: false },
      { task: 'Data room prepared (financials, contracts, metrics)', stage: 'Seed', done: false },
      { task: 'Board composition formalized', stage: 'Series A', done: false },
    ],
  },
  {
    category: 'Financial Metrics', icon: DollarSign, color: '--panel-success',
    items: [
      { task: 'Monthly P&L tracking established', stage: 'Pre-Seed', done: false },
      { task: 'Unit economics defined (CAC, LTV, payback)', stage: 'Seed', done: false },
      { task: 'MRR/ARR reporting automated', stage: 'Seed', done: false },
      { task: 'Cohort retention analysis available', stage: 'Series A', done: false },
      { task: 'Audited financial statements', stage: 'Series A', done: false },
      { task: 'Revenue forecasting model validated', stage: 'Series A', done: false },
    ],
  },
  {
    category: 'Product & Data Moat', icon: Brain, color: '--panel-accent',
    items: [
      { task: 'AI scoring model accuracy benchmarked', stage: 'Pre-Seed', done: false },
      { task: 'Proprietary dataset size documented', stage: 'Seed', done: false },
      { task: 'Platform network effects quantified', stage: 'Seed', done: false },
      { task: 'Competitive differentiation deck prepared', stage: 'Seed', done: false },
      { task: 'Technology due diligence package ready', stage: 'Series A', done: false },
      { task: 'Patent/trade secret strategy defined', stage: 'Series A', done: false },
    ],
  },
  {
    category: 'Growth & Traction', icon: TrendingUp, color: '--panel-warning',
    items: [
      { task: 'User growth rate tracked (WoW/MoM)', stage: 'Pre-Seed', done: false },
      { task: 'NPS / satisfaction surveys running', stage: 'Seed', done: false },
      { task: 'Viral coefficient measured', stage: 'Seed', done: false },
      { task: 'Market size (TAM/SAM/SOM) quantified', stage: 'Pre-Seed', done: false },
      { task: 'Case studies from early users/developers', stage: 'Seed', done: false },
      { task: 'Press coverage and media mentions log', stage: 'Series A', done: false },
    ],
  },
];

const StatusDot: React.FC<{ status: 'pending' | 'partial' | 'met' }> = ({ status }) => {
  const colors = { met: '--panel-success', partial: '--panel-warning', pending: '--panel-text-muted' };
  const labels = { met: 'Met', partial: 'In Progress', pending: 'Pending' };
  return (
    <span className="flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${colors[status]}))` }} />
      <span className="text-[7px] uppercase tracking-wider" style={{ color: `hsl(var(${colors[status]}))` }}>{labels[status]}</span>
    </span>
  );
};

const SectionBlock: React.FC<{ title: string; icon: LucideIcon; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <div className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
      <Icon className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
      <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">{title}</span>
    </div>
    {children}
  </div>
);

const FundraisingExitRoadmap: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('stages');

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Rocket className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Fundraising & Exit Roadmap</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Staged capital raising milestones, signal metrics, and long-term exit positioning strategy</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Stages Defined', value: '4', color: '--panel-accent' },
            { label: 'Exit Paths', value: '3', color: '--panel-success' },
            { label: 'Target Valuation (Series A)', value: '$15–30M', color: '--panel-info' },
            { label: 'Exit Horizon', value: '5–7 Years', color: '--panel-warning' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab bar + content */}
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

          {/* ── Funding Stages ──────────────── */}
          {activeTab === 'stages' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {fundingStages.map((fs) => (
                <div key={fs.stage} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md border" style={{ backgroundColor: `hsl(var(${fs.color}) / 0.1)`, borderColor: `hsl(var(${fs.color}) / 0.2)` }}>
                        <Rocket className="h-3.5 w-3.5" style={{ color: `hsl(var(${fs.color}))` }} />
                      </div>
                      <div>
                        <h3 className="text-[12px] font-bold text-[hsl(var(--panel-text))]">{fs.label}</h3>
                        <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">{fs.timing}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[8px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider block">Target Raise</span>
                        <span className="text-[11px] font-bold font-mono" style={{ color: `hsl(var(${fs.color}))` }}>{fs.targetRaise}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider block">Valuation</span>
                        <span className="text-[11px] font-bold font-mono text-[hsl(var(--panel-text-secondary))]">{fs.valuationRange}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider block">Dilution</span>
                        <span className="text-[10px] font-mono text-[hsl(var(--panel-error))]">{fs.dilution}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 divide-x divide-[hsl(var(--panel-border-subtle))]">
                    {/* Use of Funds */}
                    <div className="p-3 space-y-1.5">
                      <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Use of Funds</span>
                      {fs.useOfFunds.map((u, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <ArrowRight className="h-2 w-2 shrink-0 text-[hsl(var(--panel-accent)/.5)]" />
                          <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{u}</span>
                        </div>
                      ))}
                    </div>
                    {/* Signals */}
                    <div className="p-3 space-y-1.5">
                      <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Readiness Signals</span>
                      {fs.signals.map((s, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{s.metric}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{s.target}</span>
                            <StatusDot status={s.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Investor Types */}
                    <div className="p-3 space-y-1.5">
                      <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Target Investors</span>
                      {fs.investorType.map((inv, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Users className="h-2 w-2 shrink-0 text-[hsl(var(--panel-info)/.5)]" />
                          <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{inv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Signal Metrics ──────────────── */}
          {activeTab === 'milestones' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {fundingStages.map((fs) => (
                <SectionBlock key={fs.stage} title={`${fs.label} — Key Signal Metrics`} icon={Target}>
                  <div className="p-3">
                    <div className="space-y-2">
                      {fs.signals.map((s, i) => {
                        const pct = s.status === 'met' ? 100 : s.status === 'partial' ? 50 : 0;
                        const barColor = s.status === 'met' ? '--panel-success' : s.status === 'partial' ? '--panel-warning' : '--panel-text-muted';
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[9px] font-medium text-[hsl(var(--panel-text))]">{s.metric}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{s.target}</span>
                                <StatusDot status={s.status} />
                              </div>
                            </div>
                            <div className="h-1 rounded-full bg-[hsl(var(--panel-border-subtle))] overflow-hidden">
                              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: `hsl(var(${barColor}))` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </SectionBlock>
              ))}
            </div>
          )}

          {/* ── Exit Positioning ─────────────── */}
          {activeTab === 'exit' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Exit strategy pillars */}
              <SectionBlock title="Long-Term Value Creation Pillars" icon={Shield}>
                <div className="grid grid-cols-3 gap-px bg-[hsl(var(--panel-border-subtle))]">
                  {[
                    { title: 'Proprietary Data Moat', icon: Layers, color: '--panel-accent', items: ['Historical pricing data across cities', 'AI-scored investment properties', 'User behavior & preference signals', 'Market cycle prediction models'] },
                    { title: 'Network Effects Dominance', icon: Users, color: '--panel-info', items: ['Investor ↔ developer matching', 'Agent ecosystem stickiness', 'Service marketplace flywheel', 'Content & review loop'] },
                    { title: 'Intelligence Infrastructure', icon: Brain, color: '--panel-success', items: ['Real estate AI as a platform', 'Institutional-grade analytics API', 'Predictive market reports', 'Automated deal detection engine'] },
                  ].map((p) => (
                    <div key={p.title} className="bg-[hsl(var(--panel-bg))] p-4">
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="flex items-center justify-center w-6 h-6 rounded-md border" style={{ backgroundColor: `hsl(var(${p.color}) / 0.1)`, borderColor: `hsl(var(${p.color}) / 0.2)` }}>
                          <p.icon className="h-3 w-3" style={{ color: `hsl(var(${p.color}))` }} />
                        </div>
                        <span className="text-[10px] font-bold text-[hsl(var(--panel-text))]">{p.title}</span>
                      </div>
                      <div className="space-y-1.5">
                        {p.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <ArrowRight className="h-2 w-2 shrink-0 text-[hsl(var(--panel-accent)/.5)]" />
                            <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionBlock>

              {/* Exit paths */}
              {exitPaths.map((ep) => (
                <div key={ep.path} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-6 h-6 rounded-md border" style={{ backgroundColor: `hsl(var(${ep.color}) / 0.1)`, borderColor: `hsl(var(${ep.color}) / 0.2)` }}>
                        <ep.icon className="h-3 w-3" style={{ color: `hsl(var(${ep.color}))` }} />
                      </div>
                      <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{ep.path}</h4>
                    </div>
                    <div className="flex items-center gap-4">
                      {[
                        { label: 'Probability', val: ep.probability },
                        { label: 'Timeframe', val: ep.timeframe },
                        { label: 'Valuation Multiple', val: ep.valuationMultiple },
                      ].map((m) => (
                        <div key={m.label} className="text-right">
                          <span className="text-[7px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider block">{m.label}</span>
                          <span className="text-[9px] font-bold font-mono" style={{ color: `hsl(var(${ep.color}))` }}>{m.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] mb-3">{ep.description}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Prerequisites</span>
                        {ep.prerequisites.map((p, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-2 w-2 shrink-0 text-[hsl(var(--panel-text-muted)/.4)]" />
                            <span className="text-[8px] text-[hsl(var(--panel-text-secondary))]">{p}</span>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))] font-semibold">Potential Acquirers / Venues</span>
                        {ep.potentialAcquirers.map((a, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <Building2 className="h-2 w-2 shrink-0 text-[hsl(var(--panel-info)/.5)]" />
                            <span className="text-[8px] text-[hsl(var(--panel-text-secondary))]">{a}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Capital Timeline ─────────────── */}
          {activeTab === 'timeline' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-4 gap-px bg-[hsl(var(--panel-border-subtle))] rounded-lg overflow-hidden">
                {timelinePhases.map((tp, idx) => (
                  <div key={tp.phase} className="bg-[hsl(var(--panel-bg))] p-4 relative">
                    {idx < timelinePhases.length - 1 && (
                      <ArrowRight className="absolute top-4 -right-1.5 h-3 w-3 text-[hsl(var(--panel-text-muted)/.3)] z-10" />
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: `hsl(var(${tp.color}))` }} />
                      <span className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{tp.phase}</span>
                    </div>
                    <span className="text-[9px] font-mono" style={{ color: `hsl(var(${tp.color}))` }}>{tp.period}</span>
                    <div className="mt-3 space-y-1.5">
                      {tp.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Zap className="h-2 w-2 shrink-0" style={{ color: `hsl(var(${tp.color}) / 0.5)` }} />
                          <span className="text-[8px] text-[hsl(var(--panel-text-secondary))]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cap table evolution */}
              <SectionBlock title="Illustrative Cap Table Evolution" icon={Eye}>
                <div className="overflow-x-auto">
                  <table className="w-full text-[9px]">
                    <thead>
                      <tr className="border-b border-[hsl(var(--panel-border))]">
                        {['Stakeholder', 'Pre-Seed', 'After Seed', 'After Series A', 'After Series B'].map((h) => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { who: 'Founders', ps: '85–90%', seed: '68–72%', a: '51–54%', b: '41–43%' },
                        { who: 'ESOP Pool', ps: '10–15%', seed: '10–12%', a: '10%', b: '10%' },
                        { who: 'Pre-Seed Investors', ps: '—', seed: '5–8%', a: '4–6%', b: '3–5%' },
                        { who: 'Seed Investors', ps: '—', seed: '15–20%', a: '12–16%', b: '10–13%' },
                        { who: 'Series A Investors', ps: '—', seed: '—', a: '20–25%', b: '16–20%' },
                        { who: 'Series B+ Investors', ps: '—', seed: '—', a: '—', b: '15–20%' },
                      ].map((row) => (
                        <tr key={row.who} className="border-b border-[hsl(var(--panel-border-subtle))] hover:bg-[hsl(var(--panel-hover))] transition-colors">
                          <td className="px-3 py-1.5 font-semibold text-[hsl(var(--panel-text))]">{row.who}</td>
                          <td className="px-3 py-1.5 font-mono text-[hsl(var(--panel-info))]">{row.ps}</td>
                          <td className="px-3 py-1.5 font-mono text-[hsl(var(--panel-accent))]">{row.seed}</td>
                          <td className="px-3 py-1.5 font-mono text-[hsl(var(--panel-success))]">{row.a}</td>
                          <td className="px-3 py-1.5 font-mono text-[hsl(var(--panel-warning))]">{row.b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionBlock>

              <div className="rounded-lg bg-[hsl(var(--panel-accent)/.03)] border border-[hsl(var(--panel-accent)/.12)] px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3 w-3 text-[hsl(var(--panel-warning))]" />
                  <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">
                    Cap table percentages are illustrative. Actual dilution depends on valuations, round sizes, and negotiation outcomes.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Readiness Checklist ──────────── */}
          {activeTab === 'checklist' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {readinessChecklist.map((cat) => (
                <SectionBlock key={cat.category} title={cat.category} icon={cat.icon}>
                  <div className="p-3 space-y-2">
                    {cat.items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-1 border-b border-[hsl(var(--panel-border-subtle))] last:border-0">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-3.5 h-3.5 rounded border flex items-center justify-center",
                            item.done
                              ? "bg-[hsl(var(--panel-success)/.1)] border-[hsl(var(--panel-success)/.3)]"
                              : "border-[hsl(var(--panel-border))]"
                          )}>
                            {item.done && <CheckCircle2 className="h-2.5 w-2.5 text-[hsl(var(--panel-success))]" />}
                          </div>
                          <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{item.task}</span>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full border font-medium" style={{
                          color: `hsl(var(${item.stage === 'Pre-Seed' ? '--panel-info' : item.stage === 'Seed' ? '--panel-accent' : '--panel-success'}))`,
                          borderColor: `hsl(var(${item.stage === 'Pre-Seed' ? '--panel-info' : item.stage === 'Seed' ? '--panel-accent' : '--panel-success'}) / 0.2)`,
                          backgroundColor: `hsl(var(${item.stage === 'Pre-Seed' ? '--panel-info' : item.stage === 'Seed' ? '--panel-accent' : '--panel-success'}) / 0.06)`,
                        }}>{item.stage}</span>
                      </div>
                    ))}
                  </div>
                </SectionBlock>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Fundraising & Exit Roadmap v1.0 — Strategic framework for capital raising and long-term value maximization
      </p>
    </div>
  );
};

export default FundraisingExitRoadmap;
