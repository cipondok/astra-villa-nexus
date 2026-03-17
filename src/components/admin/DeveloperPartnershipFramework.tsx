import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Building2, Users, DollarSign, BarChart3, Rocket, Target,
  Globe, Sparkles, ArrowRight, CheckCircle2, Layers, TrendingUp,
  FileText, Handshake, Eye, Megaphone, PieChart, Zap,
  ChevronRight, ChevronDown, Shield, Star, Crown,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Developer Partnership Framework
   Scalable collaboration model for platform × developer alignment
   ═══════════════════════════════════════════════════════════ */

// ── Types ────────────────────────────────────────────────
interface TierData {
  name: string;
  icon: LucideIcon;
  color: string;
  commission: string;
  features: string[];
  idealFor: string;
  badge: string;
}

interface ProcessStep {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
  details: string[];
}

interface MetricCard {
  label: string;
  description: string;
  icon: LucideIcon;
  kpis: string[];
}

// ── Data ─────────────────────────────────────────────────
const partnershipTiers: TierData[] = [
  {
    name: 'Explorer',
    icon: Globe,
    color: '--panel-text-secondary',
    commission: '1.0%',
    features: [
      'Standard project listing page',
      'Basic lead forwarding',
      'Monthly performance summary',
      'Platform marketplace visibility',
    ],
    idealFor: 'Small developers testing the platform',
    badge: 'Starter',
  },
  {
    name: 'Accelerator',
    icon: Rocket,
    color: '--panel-info',
    commission: '1.5%',
    features: [
      'Featured listing placement (homepage rotation)',
      'AI demand analytics dashboard access',
      'Priority lead forwarding with qualification scoring',
      'Dedicated project launch page with masterplan',
      'Monthly strategy call with growth team',
    ],
    idealFor: 'Mid-size developers with 5–20 unit projects',
    badge: 'Growth',
  },
  {
    name: 'Strategic',
    icon: Crown,
    color: '--panel-accent',
    commission: '2.0–2.5%',
    features: [
      'Premium AI demand forecasting & pricing intelligence',
      'Co-branded marketing campaigns (paid media)',
      'Exclusive investor database access (qualified HNW)',
      'Real-time buyer pipeline reporting dashboard',
      'Launch event promotion & PR coordination',
      'Custom analytics API integration',
      'Dedicated partnership manager',
    ],
    idealFor: 'Large developers with flagship projects',
    badge: 'Premium',
  },
];

const promotionScope: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: 'Dedicated Project Launch Page', desc: 'Interactive masterplan, unit inventory, 3D views, and AI demand signals embedded directly into the project profile.', icon: Globe },
  { title: 'Featured Listing Placement', desc: 'Homepage carousel rotation, search result priority boost, and "Featured Developer" badge across the marketplace.', icon: Star },
  { title: 'AI Demand Analytics Access', desc: 'Developer dashboard with absorption speed predictions, optimal pricing bands, area readiness scores, and investor sentiment tracking.', icon: Sparkles },
  { title: 'Targeted Investor Matching', desc: 'AI-powered matching engine connects projects with pre-qualified investors based on budget, location preference, and investment style.', icon: Target },
];

const leadProcess: ProcessStep[] = [
  {
    step: 1,
    title: 'Investor Discovery',
    description: 'Investor browses marketplace or receives AI alert',
    icon: Eye,
    details: ['AI opportunity scoring triggers alerts', 'Search result impression tracking', 'Watchlist addition signals intent'],
  },
  {
    step: 2,
    title: 'Inquiry Capture',
    description: 'Platform captures structured inquiry with qualification data',
    icon: FileText,
    details: ['Budget range validation', 'Investment timeline capture', 'Financing readiness assessment', 'Contact preference collection'],
  },
  {
    step: 3,
    title: 'Lead Qualification',
    description: 'AI scores and qualifies lead before forwarding',
    icon: Zap,
    details: ['Lead scoring algorithm (0–100)', 'Budget-to-unit price alignment check', 'Engagement depth analysis', 'Duplicate detection & merging'],
  },
  {
    step: 4,
    title: 'Developer Handoff',
    description: 'Qualified lead forwarded with full intelligence package',
    icon: Handshake,
    details: ['Real-time notification to developer CRM', 'Investor profile with behavioral signals', 'Suggested follow-up strategy', 'SLA: 4-hour max response time'],
  },
  {
    step: 5,
    title: 'Conversion Tracking',
    description: 'End-to-end tracking from inquiry to sale',
    icon: TrendingUp,
    details: ['Pipeline stage tracking (New → Negotiation → Closed)', 'Attribution modeling per channel', 'Commission calculation on close', 'Post-sale satisfaction survey'],
  },
];

const revenueStreams: { stream: string; model: string; range: string; icon: LucideIcon }[] = [
  { stream: 'Unit Sale Commission', model: 'Per successful transaction', range: '1.0% – 2.5%', icon: DollarSign },
  { stream: 'Marketing Campaign Fee', model: 'Optional paid media packages', range: 'Rp 5M – 50M/campaign', icon: Megaphone },
  { stream: 'Data Insights Subscription', model: 'Monthly AI analytics access', range: 'Rp 2M – 15M/month', icon: PieChart },
  { stream: 'Launch Event Package', model: 'PR coordination + promotion', range: 'Rp 10M – 100M/event', icon: Rocket },
];

const performanceMetrics: MetricCard[] = [
  {
    label: 'Lead Conversion Tracking',
    description: 'End-to-end funnel analytics from impression to closed sale',
    icon: TrendingUp,
    kpis: ['Inquiry-to-viewing rate', 'Viewing-to-offer rate', 'Offer-to-close rate', 'Average days to conversion', 'Lead quality score distribution'],
  },
  {
    label: 'Project Visibility Analytics',
    description: 'Comprehensive exposure and engagement metrics',
    icon: Eye,
    kpis: ['Page views & unique visitors', 'Search impression share', 'Featured placement CTR', 'Investor watchlist additions', 'Social share velocity'],
  },
  {
    label: 'Demand Trend Reporting',
    description: 'AI-powered market intelligence for strategic decisions',
    icon: BarChart3,
    kpis: ['Absorption speed prediction', 'Price sensitivity analysis', 'Competitor benchmark index', 'Seasonal demand patterns', 'Geographic demand heat'],
  },
];

// ── Component ────────────────────────────────────────────
const DeveloperPartnershipFramework: React.FC = () => {
  const [expandedTier, setExpandedTier] = useState<number | null>(1);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* ── Header ──────────────────────────────── */}
      <div
        className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4"
        style={{ boxShadow: 'var(--panel-shadow)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Handshake className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">
              Developer Partnership Framework
            </h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">
              Structured collaboration model aligning platform promotion with developer sales objectives
            </p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Tiers', value: '3', color: '--panel-accent' },
            { label: 'Revenue Streams', value: '4', color: '--panel-success' },
            { label: 'Process Steps', value: '5', color: '--panel-info' },
            { label: 'KPI Metrics', value: '15', color: '--panel-warning' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 1. Partnership Tiers ──────────────────── */}
      <SectionCard title="Partnership Tiers" subtitle="Tiered collaboration model with escalating benefits and commission rates" icon={Layers}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {partnershipTiers.map((tier, i) => {
            const isExpanded = expandedTier === i;
            return (
              <div
                key={tier.name}
                className={cn(
                  "bg-[hsl(var(--panel-bg))] p-4 transition-all cursor-pointer",
                  isExpanded && "ring-1 ring-[hsl(var(--panel-accent)/.3)]",
                )}
                style={isExpanded ? { background: `hsl(var(${tier.color}) / 0.02)` } : undefined}
                onClick={() => setExpandedTier(isExpanded ? null : i)}
              >
                {/* Tier header */}
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="flex items-center justify-center w-7 h-7 rounded-lg border"
                    style={{ backgroundColor: `hsl(var(${tier.color}) / 0.08)`, borderColor: `hsl(var(${tier.color}) / 0.2)` }}
                  >
                    <tier.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${tier.color}))` }} />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-bold text-[hsl(var(--panel-text))]">{tier.name}</h3>
                    <span
                      className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `hsl(var(${tier.color}) / 0.1)`, color: `hsl(var(${tier.color}))` }}
                    >
                      {tier.badge}
                    </span>
                  </div>
                  <div className="ml-auto text-right">
                    <span className="text-sm font-bold font-mono" style={{ color: `hsl(var(${tier.color}))` }}>
                      {tier.commission}
                    </span>
                    <span className="block text-[8px] text-[hsl(var(--panel-text-muted))]">commission</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1.5">
                  {tier.features.map((f, fi) => (
                    <div key={fi} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-3 w-3 shrink-0 mt-0.5" style={{ color: `hsl(var(${tier.color}))` }} />
                      <span className="text-[10px] text-[hsl(var(--panel-text-secondary))] leading-tight">{f}</span>
                    </div>
                  ))}
                </div>

                {/* Ideal for */}
                <div className="mt-3 pt-2 border-t border-[hsl(var(--panel-border-subtle))]">
                  <span className="text-[8px] uppercase tracking-wider text-[hsl(var(--panel-text-muted))]">Ideal for</span>
                  <p className="text-[10px] text-[hsl(var(--panel-text))] font-medium mt-0.5">{tier.idealFor}</p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── 2. Project Promotion Scope ────────────── */}
      <SectionCard title="Project Promotion Scope" subtitle="Comprehensive exposure capabilities for developer projects" icon={Megaphone}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {promotionScope.map((item) => (
            <div key={item.title} className="bg-[hsl(var(--panel-bg))] p-4 hover:bg-[hsl(var(--panel-hover))] transition-colors">
              <div className="flex items-start gap-2.5">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.15)] shrink-0">
                  <item.icon className="h-3.5 w-3.5 text-[hsl(var(--panel-accent))]" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{item.title}</h4>
                  <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] leading-relaxed mt-1">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── 3. Lead Generation Process ────────────── */}
      <SectionCard title="Lead Generation Collaboration" subtitle="5-step investor inquiry forwarding and qualification pipeline" icon={Users}>
        <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
          {leadProcess.map((step) => {
            const isExpanded = expandedStep === step.step;
            return (
              <button
                key={step.step}
                onClick={() => setExpandedStep(isExpanded ? null : step.step)}
                className="w-full text-left px-4 py-3 hover:bg-[hsl(var(--panel-hover))] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Step number */}
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[hsl(var(--panel-info)/.1)] border border-[hsl(var(--panel-info)/.2)] shrink-0">
                    <span className="text-[10px] font-bold font-mono text-[hsl(var(--panel-info))]">{step.step}</span>
                  </div>
                  {/* Icon */}
                  <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[hsl(var(--panel-hover))] shrink-0">
                    <step.icon className="h-3 w-3 text-[hsl(var(--panel-text-secondary))]" />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{step.title}</h4>
                    <p className="text-[9px] text-[hsl(var(--panel-text-muted))]">{step.description}</p>
                  </div>
                  {/* Connector arrow */}
                  <ChevronDown className={cn(
                    "h-3 w-3 text-[hsl(var(--panel-text-muted))] transition-transform",
                    isExpanded && "rotate-180"
                  )} />
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="mt-2 ml-[60px] space-y-1 animate-in fade-in slide-in-from-top-1 duration-150">
                    {step.details.map((d, di) => (
                      <div key={di} className="flex items-center gap-1.5">
                        <ArrowRight className="h-2 w-2 text-[hsl(var(--panel-info))]" />
                        <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{d}</span>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Pipeline visual */}
        <div className="px-4 py-3 border-t border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-hover)/.3)]">
          <div className="flex items-center gap-1">
            {leadProcess.map((step, i) => (
              <React.Fragment key={step.step}>
                <div className="flex-1 h-1.5 rounded-full bg-[hsl(var(--panel-info)/.15)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[hsl(var(--panel-info))]"
                    style={{ width: `${((i + 1) / leadProcess.length) * 100}%`, boxShadow: '0 0 6px hsl(var(--panel-info) / 0.3)' }}
                  />
                </div>
                {i < leadProcess.length - 1 && (
                  <ChevronRight className="h-2.5 w-2.5 text-[hsl(var(--panel-text-muted))] shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-[hsl(var(--panel-text-muted))]">Discovery</span>
            <span className="text-[8px] text-[hsl(var(--panel-info))] font-medium">Conversion</span>
          </div>
        </div>
      </SectionCard>

      {/* ── 4. Revenue Model ─────────────────────── */}
      <SectionCard title="Revenue Model" subtitle="Multi-stream monetization aligned with developer success" icon={DollarSign}>
        <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
          {revenueStreams.map((stream) => (
            <div key={stream.stream} className="flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover))] transition-colors">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[hsl(var(--panel-success)/.08)] border border-[hsl(var(--panel-success)/.15)] shrink-0">
                <stream.icon className="h-3.5 w-3.5 text-[hsl(var(--panel-success))]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{stream.stream}</h4>
                <p className="text-[9px] text-[hsl(var(--panel-text-muted))]">{stream.model}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-bold font-mono text-[hsl(var(--panel-success))]">{stream.range}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue projection note */}
        <div className="px-4 py-2.5 border-t border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-accent)/.03)]">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
            <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">
              Revenue model designed for scalable growth — commissions only charged on successful transactions, ensuring alignment with developer success.
            </span>
          </div>
        </div>
      </SectionCard>

      {/* ── 5. Performance Metrics ────────────────── */}
      <SectionCard title="Performance Metrics" subtitle="Comprehensive tracking framework for partnership effectiveness" icon={BarChart3}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {performanceMetrics.map((metric) => (
            <div key={metric.label} className="bg-[hsl(var(--panel-bg))] p-4 hover:bg-[hsl(var(--panel-hover))] transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[hsl(var(--panel-warning)/.08)] border border-[hsl(var(--panel-warning)/.15)]">
                  <metric.icon className="h-3 w-3 text-[hsl(var(--panel-warning))]" />
                </div>
                <h4 className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{metric.label}</h4>
              </div>
              <p className="text-[9px] text-[hsl(var(--panel-text-muted))] mb-2">{metric.description}</p>
              <div className="space-y-1">
                {metric.kpis.map((kpi, ki) => (
                  <div key={ki} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-[hsl(var(--panel-warning)/.5)]" />
                    <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{kpi}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Footer ────────────────────────────────── */}
      <div className="px-2 py-2">
        <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
          ASTRA Villa Developer Partnership Framework v1.0 — Designed for scalable monetization and project sales acceleration
        </p>
      </div>
    </div>
  );
};

/* ── Reusable Section Card ────────────────────────── */
const SectionCard: React.FC<{
  title: string;
  subtitle: string;
  icon: LucideIcon;
  children: React.ReactNode;
}> = ({ title, subtitle, icon: Icon, children }) => (
  <div
    className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden"
    style={{ boxShadow: 'var(--panel-shadow)' }}
  >
    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[hsl(var(--panel-border))]">
      <div className="flex items-center justify-center w-6 h-6 rounded-md bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.15)]">
        <Icon className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
      </div>
      <div>
        <h2 className="text-[12px] font-bold text-[hsl(var(--panel-text))] tracking-tight">{title}</h2>
        <p className="text-[9px] text-[hsl(var(--panel-text-muted))]">{subtitle}</p>
      </div>
    </div>
    {children}
  </div>
);

export default DeveloperPartnershipFramework;
