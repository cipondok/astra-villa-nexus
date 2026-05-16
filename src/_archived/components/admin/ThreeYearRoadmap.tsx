import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Map, Rocket, TrendingUp, Crown,
  ChevronRight, Target, Flag, DollarSign, Users, Brain, Globe,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — 3-Year Strategic Execution Roadmap
   ═══════════════════════════════════════════════════════════ */

interface Milestone {
  quarter: string;
  title: string;
  objectives: string[];
  keyResult: string;
}

interface StrategicYear {
  id: string;
  year: string;
  theme: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
  vision: string;
  pillars: { label: string; icon: LucideIcon; targets: string[] }[];
  milestones: Milestone[];
  capitalStrategy: string;
  riskMitigation: string;
}

const years: StrategicYear[] = [
  {
    id: 'y1', year: 'Year 1', theme: 'Foundation & Validation', subtitle: '2025–2026', icon: Rocket, color: '--panel-accent',
    vision: 'Achieve product-market fit with a stable AI-powered marketplace. Build critical mass of listings and investors. Validate revenue streams.',
    pillars: [
      { label: 'Product', icon: Brain, targets: ['Launch stable intelligent marketplace MVP', 'AI scoring coverage > 80% of listings', 'Page load < 2.5s P75', 'Mobile-responsive across all flows'] },
      { label: 'Supply', icon: Flag, targets: ['500+ active property listings', '50+ verified agents onboarded', '10+ developer partnerships signed', 'Coverage across 5+ major Indonesian cities'] },
      { label: 'Demand', icon: Users, targets: ['10,000 registered investor profiles', '2,500+ weekly active users', 'Watchlist engagement rate > 15%', 'Inquiry-to-response rate > 70%'] },
      { label: 'Revenue', icon: DollarSign, targets: ['Validate commission model (1–2.5%)', 'Launch subscription tiers (Free–Premium)', '100+ paying subscribers', 'IDR 500M+ gross revenue run rate'] },
    ],
    milestones: [
      { quarter: 'Q1', title: 'MVP Launch & Seed Traction', objectives: ['Core marketplace live with search + AI scoring', 'First 100 listings onboarded', 'Seed funding secured or bootstrapped runway confirmed'], keyResult: '1,000 registered users, 100 listings' },
      { quarter: 'Q2', title: 'Agent Ecosystem Activation', objectives: ['Agent dashboard + CRM tools live', 'Referral program launched', 'First commissions earned'], keyResult: '25 active agents, first IDR 50M revenue' },
      { quarter: 'Q3', title: 'Intelligence Layer Deepening', objectives: ['Investment recommendations engine live', 'Market cycle detection operational', 'Investor watchlist + alerts shipping'], keyResult: 'AI coverage > 60%, WAU > 1,500' },
      { quarter: 'Q4', title: 'Revenue Model Validation', objectives: ['Subscription tiers launched', 'Developer partnership packages tested', 'Unit economics documented'], keyResult: '100 subscribers, IDR 500M run rate' },
    ],
    capitalStrategy: 'Bootstrap or pre-seed (IDR 2–5B). Focus on proving PMF before raising larger round. Keep burn rate < IDR 200M/month.',
    riskMitigation: 'De-risk by validating demand before scaling supply. Maintain 12+ months runway. Build with lean team (5–8 people).',
  },
  {
    id: 'y2', year: 'Year 2', theme: 'Scale & Intelligence Moat', subtitle: '2026–2027', icon: TrendingUp, color: '--panel-info',
    vision: 'Scale marketplace liquidity across Indonesia. Deepen AI predictive capabilities into a defensible moat. Grow recurring revenue aggressively.',
    pillars: [
      { label: 'Product', icon: Brain, targets: ['Capital flow intelligence live', 'Predictive market cycle forecasting', 'Developer launch radar operational', 'API layer for B2B intelligence'] },
      { label: 'Supply', icon: Flag, targets: ['5,000+ active listings', '200+ verified agents', '50+ developer project partnerships', 'Coverage across 15+ cities / 10+ provinces'] },
      { label: 'Demand', icon: Users, targets: ['50,000+ registered users', '15,000+ weekly active users', 'Institutional investor onboarding begun', 'NPS > 50 across user segments'] },
      { label: 'Revenue', icon: DollarSign, targets: ['IDR 5B+ annual revenue', '1,000+ paying subscribers', 'Developer launch packages contributing 20%+ of revenue', 'MRR growth > 15% month-over-month'] },
    ],
    milestones: [
      { quarter: 'Q1', title: 'Regional Expansion Sprint', objectives: ['Expand to 10+ new cities', 'Localized content for Tier 2 markets', 'Regional agent recruitment campaigns'], keyResult: '3,000 listings, 15 cities covered' },
      { quarter: 'Q2', title: 'Intelligence Platform Launch', objectives: ['Capital flow prediction live', 'Global macro intelligence dashboard', 'B2B API beta for institutional clients'], keyResult: 'AI accuracy > 85%, 5 API beta clients' },
      { quarter: 'Q3', title: 'Developer Ecosystem Scale', objectives: ['50+ developer partnerships', 'Launch radar generating pre-marketing leads', 'Developer analytics packages monetized'], keyResult: 'IDR 1B+ from developer revenue stream' },
      { quarter: 'Q4', title: 'Series A Readiness', objectives: ['Unit economics proven at scale', 'Growth metrics documented for fundraise', 'Series A deck and data room prepared'], keyResult: 'IDR 5B ARR, Series A term sheet' },
    ],
    capitalStrategy: 'Seed extension or Series A (IDR 15–30B). Use capital for engineering team scale (15–20 people), regional expansion, and marketing acceleration.',
    riskMitigation: 'Diversify revenue streams to reduce commission dependency. Build data moat through proprietary AI models. Establish regulatory relationships early.',
  },
  {
    id: 'y3', year: 'Year 3', theme: 'Infrastructure & Strategic Positioning', subtitle: '2027–2028', icon: Crown, color: '--panel-success',
    vision: 'Position ASTRA Villa as the essential AI property intelligence infrastructure layer for Southeast Asia. Explore institutional partnerships and international expansion.',
    pillars: [
      { label: 'Product', icon: Brain, targets: ['Full-stack intelligence platform (scoring, forecasting, capital flows)', 'White-label intelligence API for funds and banks', 'Smart city predictor with infrastructure correlation', 'Multi-country property data integration'] },
      { label: 'Supply', icon: Flag, targets: ['25,000+ active listings', '500+ verified agents', '100+ developer partnerships', 'Pan-Indonesia coverage + 1–2 SEA markets'] },
      { label: 'Demand', icon: Users, targets: ['200,000+ registered users', '50,000+ weekly active users', 'Institutional clients (funds, banks, REITs)', 'International investor segment growing'] },
      { label: 'Revenue', icon: DollarSign, targets: ['IDR 25B+ annual revenue', 'B2B intelligence API revenue > 30% of total', '5,000+ paying subscribers', 'Path to profitability demonstrated'] },
    ],
    milestones: [
      { quarter: 'Q1', title: 'Institutional Partnership Launch', objectives: ['First bank/fund intelligence partnerships signed', 'White-label API general availability', 'Enterprise pricing model validated'], keyResult: '3+ institutional clients, IDR 2B+ B2B revenue' },
      { quarter: 'Q2', title: 'International Expansion Pilot', objectives: ['Market research for Malaysia/Thailand/Vietnam', 'Cross-border investment flow tracking', 'Multi-currency and multi-language foundation'], keyResult: '1 SEA market pilot launched' },
      { quarter: 'Q3', title: 'Data Network Effect Acceleration', objectives: ['Proprietary market indices published', 'Media partnerships for market intelligence', 'Data licensing revenue stream explored'], keyResult: 'Brand recognized as market authority' },
      { quarter: 'Q4', title: 'Strategic Options Evaluation', objectives: ['Series B or strategic investment evaluation', 'Acquisition inbound assessment', 'IPO feasibility study if metrics warrant'], keyResult: 'Clear strategic path: raise, partner, or exit' },
    ],
    capitalStrategy: 'Series B (IDR 50–100B) or strategic investment from property portal / super-app. Alternatively, evaluate acquisition offers if > 10× revenue.',
    riskMitigation: 'Build regulatory moat through compliance leadership. Diversify geographically to reduce single-market risk. Retain key AI talent with equity.',
  },
];

const ThreeYearRoadmap: React.FC = () => {
  const [activeYear, setActiveYear] = useState('y1');
  const [expandedQ, setExpandedQ] = useState<string | null>(null);
  const [expandedPillar, setExpandedPillar] = useState<number | null>(null);

  const active = years.find(y => y.id === activeYear)!;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Map className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">3-Year Strategic Execution Roadmap</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">From intelligent marketplace → regional intelligence infrastructure → strategic positioning</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Phases', value: '3 Years', color: '--panel-accent' },
            { label: 'Milestones', value: String(years.reduce((s, y) => s + y.milestones.length, 0)), color: '--panel-info' },
            { label: 'End State', value: 'AI PropTech Leader', color: '--panel-success' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Year selectors */}
      <div className="grid grid-cols-3 gap-3">
        {years.map(y => (
          <button key={y.id} onClick={() => { setActiveYear(y.id); setExpandedQ(null); setExpandedPillar(null); }}
            className={cn(
              "rounded-lg border p-3 transition-all text-left",
              activeYear === y.id
                ? `bg-[hsl(var(${y.color})/.08)] border-[hsl(var(${y.color})/.25)]`
                : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border))] hover:bg-[hsl(var(--panel-hover)/.3)]"
            )} style={{ boxShadow: 'var(--panel-shadow)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <y.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${y.color}))` }} />
              <span className="text-[10px] font-bold" style={{ color: `hsl(var(${y.color}))` }}>{y.year}: {y.theme}</span>
            </div>
            <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{y.subtitle} · {y.milestones.length} milestones</span>
          </button>
        ))}
      </div>

      {/* Vision statement */}
      <div className="rounded-lg border border-[hsl(var(--panel-border-subtle))] px-4 py-3 bg-[hsl(var(--panel-hover)/.15)]">
        <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">
          <span className="font-bold" style={{ color: `hsl(var(${active.color}))` }}>Vision: </span>{active.vision}
        </p>
      </div>

      {/* Strategic pillars */}
      <div className="grid grid-cols-4 gap-3">
        {active.pillars.map((p, idx) => {
          const isOpen = expandedPillar === idx;
          return (
            <div key={p.label} className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
              <button onClick={() => setExpandedPillar(isOpen ? null : idx)}
                className="w-full px-3 py-2.5 hover:bg-[hsl(var(--panel-hover)/.15)] transition-colors text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p.icon className="h-3 w-3" style={{ color: `hsl(var(${active.color}))` }} />
                  <span className="text-[10px] font-bold" style={{ color: `hsl(var(${active.color}))` }}>{p.label}</span>
                </div>
                <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{p.targets.length} targets</span>
              </button>
              {isOpen && (
                <div className="px-3 pb-2.5 border-t border-[hsl(var(--panel-border-subtle))] animate-in fade-in duration-200">
                  <ul className="mt-2 space-y-1.5">
                    {p.targets.map(t => (
                      <li key={t} className="text-[8px] text-[hsl(var(--panel-text-secondary))] leading-relaxed flex items-start gap-1.5">
                        <Target className="h-2 w-2 mt-0.5 shrink-0" style={{ color: `hsl(var(${active.color}))` }} />
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quarterly milestones */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
          <span className="text-[10px] font-bold text-[hsl(var(--panel-text))]">Quarterly Milestones</span>
        </div>
        <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
          {active.milestones.map((m, idx) => {
            const key = `${active.id}-${m.quarter}`;
            const isOpen = expandedQ === key;
            return (
              <div key={key}>
                <button onClick={() => setExpandedQ(isOpen ? null : key)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.15)] transition-colors text-left">
                  <span className="text-[10px] font-bold font-mono w-8 shrink-0" style={{ color: `hsl(var(${active.color}))` }}>{m.quarter}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))] block">{m.title}</span>
                    <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Key Result: {m.keyResult}</span>
                  </div>
                  <ChevronRight className={cn("h-3 w-3 text-[hsl(var(--panel-text-muted))] shrink-0 transition-transform", isOpen && "rotate-90")} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <ul className="ml-11 space-y-1.5">
                      {m.objectives.map(o => (
                        <li key={o} className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: `hsl(var(${active.color}))` }} />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Capital & Risk */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-3" style={{ boxShadow: 'var(--panel-shadow)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <DollarSign className="h-3 w-3" style={{ color: `hsl(var(${active.color}))` }} />
            <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: `hsl(var(${active.color}))` }}>Capital Strategy</span>
          </div>
          <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{active.capitalStrategy}</p>
        </div>
        <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-3" style={{ boxShadow: 'var(--panel-shadow)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Globe className="h-3 w-3 text-[hsl(var(--panel-warning))]" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-warning))]">Risk Mitigation</span>
          </div>
          <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{active.riskMitigation}</p>
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa 3-Year Roadmap v1.0 — {years.reduce((s, y) => s + y.milestones.length, 0)} milestones · {years.reduce((s, y) => s + y.pillars.reduce((ps, p) => ps + p.targets.length, 0), 0)} strategic targets · Foundation → Scale → Infrastructure
      </p>
    </div>
  );
};

export default ThreeYearRoadmap;
