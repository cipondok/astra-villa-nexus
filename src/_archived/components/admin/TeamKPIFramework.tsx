import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Target, Code2, Brain, Building2, Megaphone, HeadphonesIcon,
  TrendingUp, Clock, Zap, Star, BarChart3, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Internal Team KPI Framework
   ═══════════════════════════════════════════════════════════ */

interface KPI {
  name: string;
  target: string;
  frequency: string;
  weight: number;
  formula: string;
  redFlag: string;
}

interface TeamKPIs {
  id: string;
  team: string;
  icon: LucideIcon;
  color: string;
  owner: string;
  mission: string;
  kpis: KPI[];
}

const teams: TeamKPIs[] = [
  {
    id: 'engineering', team: 'Engineering', icon: Code2, color: '--panel-accent',
    owner: 'Senior Full-Stack Engineer', mission: 'Ship reliable features fast and keep the platform performant at scale',
    kpis: [
      { name: 'Sprint Delivery Rate', target: '≥ 85%', frequency: 'Per sprint (2w)', weight: 30, formula: 'Completed story points / committed story points × 100', redFlag: '< 70% for 2 consecutive sprints' },
      { name: 'Platform Uptime', target: '≥ 99.5%', frequency: 'Monthly', weight: 25, formula: '(Total minutes − downtime minutes) / total minutes × 100', redFlag: '< 99% or any unplanned outage > 30 min' },
      { name: 'Page Load Speed (P75)', target: '< 2.5s', frequency: 'Weekly', weight: 20, formula: '75th percentile of Largest Contentful Paint across all pages', redFlag: '> 4s on any critical path (search, detail, dashboard)' },
      { name: 'Bug Escape Rate', target: '< 5%', frequency: 'Per sprint', weight: 15, formula: 'Bugs found in production / total stories shipped × 100', redFlag: '> 10% or any P1 bug escape' },
      { name: 'Tech Debt Ratio', target: '< 20%', frequency: 'Monthly', weight: 10, formula: 'Tech debt stories / total backlog stories × 100', redFlag: '> 30% indicating accumulation risk' },
    ],
  },
  {
    id: 'ai-data', team: 'AI / Data', icon: Brain, color: '--panel-info',
    owner: 'AI / Data Engineer', mission: 'Continuously improve prediction accuracy and deliver actionable intelligence',
    kpis: [
      { name: 'Scoring Accuracy', target: '≥ 90%', frequency: 'Monthly', weight: 30, formula: 'Predicted outcomes within ±10% of actual / total predictions × 100', redFlag: '< 85% or downward trend for 3+ months' },
      { name: 'Alert Engagement Rate', target: '≥ 35%', frequency: 'Weekly', weight: 25, formula: 'Alerts clicked or acted upon / total alerts sent × 100', redFlag: '< 20% indicating low relevance' },
      { name: 'Model Update Frequency', target: '≥ 2/month', frequency: 'Monthly', weight: 15, formula: 'Count of model retraining deployments per month', redFlag: '0 updates in 30 days (stale models)' },
      { name: 'Data Pipeline Reliability', target: '≥ 99%', frequency: 'Weekly', weight: 15, formula: 'Successful pipeline runs / scheduled runs × 100', redFlag: '< 95% or any data loss incident' },
      { name: 'Prediction Coverage', target: '≥ 80%', frequency: 'Monthly', weight: 15, formula: 'Properties with active predictions / total active listings × 100', redFlag: '< 60% leaving marketplace intelligence gaps' },
    ],
  },
  {
    id: 'marketplace', team: 'Marketplace Operations', icon: Building2, color: '--panel-success',
    owner: 'Property Marketplace Ops Manager', mission: 'Build marketplace liquidity through quality supply and engaged agents',
    kpis: [
      { name: 'Weekly New Listings', target: '≥ 50/week', frequency: 'Weekly', weight: 30, formula: 'Count of verified new listings published this week', redFlag: '< 25/week for 2+ consecutive weeks' },
      { name: 'Active Agent Partnerships', target: '+10%/month', frequency: 'Monthly', weight: 25, formula: 'Net new active agents this month / active agents last month × 100', redFlag: 'Net negative growth or > 15% churn' },
      { name: 'Inquiry-to-Response Rate', target: '≥ 80% within 24h', frequency: 'Weekly', weight: 20, formula: 'Inquiries responded to within 24h / total inquiries × 100', redFlag: '< 60% indicating agent engagement problem' },
      { name: 'Listing Quality Score', target: '≥ 75/100 avg', frequency: 'Weekly', weight: 15, formula: 'Average completeness score (photos, description, price, docs)', redFlag: '< 60 avg or > 20% listings below 50' },
      { name: 'Listing-to-Inquiry Ratio', target: '≥ 15%', frequency: 'Monthly', weight: 10, formula: 'Listings receiving ≥ 1 inquiry / total active listings × 100', redFlag: '< 8% indicating demand-supply mismatch' },
    ],
  },
  {
    id: 'growth', team: 'Growth Marketing', icon: Megaphone, color: '--panel-warning',
    owner: 'Digital Growth Marketer', mission: 'Drive qualified investor acquisition at efficient unit economics',
    kpis: [
      { name: 'Investor CAC', target: '< IDR 350K', frequency: 'Monthly', weight: 30, formula: 'Total marketing spend / new investor signups', redFlag: '> IDR 600K or rising trend for 3+ months' },
      { name: 'Weekly Qualified Leads', target: '≥ 100/week', frequency: 'Weekly', weight: 25, formula: 'New signups completing profile + first property search', redFlag: '< 50/week consistently' },
      { name: 'Social Media Lead Volume', target: '≥ 200/month', frequency: 'Monthly', weight: 15, formula: 'Leads attributed to social media channels (IG, TikTok, LinkedIn)', redFlag: '< 100/month or declining engagement rates' },
      { name: 'Referral Traffic Share', target: '≥ 15%', frequency: 'Monthly', weight: 15, formula: 'Sessions from referral/affiliate links / total sessions × 100', redFlag: '< 8% indicating underperforming referral program' },
      { name: 'Organic Traffic Growth', target: '+20% MoM', frequency: 'Monthly', weight: 15, formula: 'Organic search sessions this month / last month × 100 − 100', redFlag: 'Flat or declining for 2+ months' },
    ],
  },
  {
    id: 'success', team: 'Customer Success', icon: HeadphonesIcon, color: '--panel-error',
    owner: 'Customer Success & Support Lead', mission: 'Build trust and retention through fast, helpful support',
    kpis: [
      { name: 'Avg Resolution Time', target: '< 4 hours', frequency: 'Weekly', weight: 25, formula: 'Sum of resolution times / total resolved tickets', redFlag: '> 8 hours avg or any P1 ticket > 2 hours' },
      { name: 'CSAT Score', target: '≥ 4.5 / 5.0', frequency: 'Weekly', weight: 25, formula: 'Average post-ticket satisfaction rating', redFlag: '< 4.0 or downward trend for 4+ weeks' },
      { name: 'First Contact Resolution', target: '≥ 70%', frequency: 'Monthly', weight: 20, formula: 'Tickets resolved on first interaction / total tickets × 100', redFlag: '< 55% indicating knowledge or process gaps' },
      { name: 'Repeat Investor Engagement', target: '≥ 60%', frequency: 'Monthly', weight: 15, formula: 'Premium users active this month who were active last month / total premium users × 100', redFlag: '< 45% indicating retention problem' },
      { name: 'NPS (Support)', target: '≥ 50', frequency: 'Quarterly', weight: 15, formula: '% Promoters (9–10) − % Detractors (0–6)', redFlag: '< 30 or declining quarter-over-quarter' },
    ],
  },
];

const freqColor: Record<string, string> = {
  'Per sprint (2w)': '--panel-accent', 'Per sprint': '--panel-accent',
  Weekly: '--panel-info', Monthly: '--panel-success', Quarterly: '--panel-warning',
};

const TeamKPIFramework: React.FC = () => {
  const [activeTeam, setActiveTeam] = useState('engineering');
  const [expandedKPI, setExpandedKPI] = useState<string | null>(null);

  const active = teams.find(t => t.id === activeTeam)!;
  const totalKPIs = teams.reduce((s, t) => s + t.kpis.length, 0);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <Target className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Team Performance KPI Framework</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Measurable outcomes aligned with platform growth — accountability across all functions</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Teams', value: String(teams.length), color: '--panel-accent' },
            { label: 'Total KPIs', value: String(totalKPIs), color: '--panel-info' },
            { label: 'Review Cadence', value: 'Weekly', color: '--panel-success' },
            { label: 'Framework', value: 'Weighted', color: '--panel-warning' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Team selector cards */}
      <div className="grid grid-cols-5 gap-3">
        {teams.map((t) => (
          <button key={t.id} onClick={() => { setActiveTeam(t.id); setExpandedKPI(null); }}
            className={cn(
              "rounded-lg border p-3 transition-all text-left",
              activeTeam === t.id
                ? `bg-[hsl(var(${t.color})/.08)] border-[hsl(var(${t.color})/.25)]`
                : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border))] hover:bg-[hsl(var(--panel-hover)/.3)]"
            )} style={{ boxShadow: 'var(--panel-shadow)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <t.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${t.color}))` }} />
              <span className="text-[10px] font-bold" style={{ color: `hsl(var(${t.color}))` }}>{t.team}</span>
            </div>
            <span className="text-[9px] font-mono text-[hsl(var(--panel-text-muted))]">{t.kpis.length} KPIs</span>
          </button>
        ))}
      </div>

      {/* Active team KPIs */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        {/* Team header */}
        <div className="px-4 py-3 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)]">
          <div className="flex items-center gap-2 mb-1">
            <active.icon className="h-4 w-4" style={{ color: `hsl(var(${active.color}))` }} />
            <span className="text-[11px] font-bold text-[hsl(var(--panel-text))]">{active.team}</span>
            <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">· Owner: {active.owner}</span>
          </div>
          <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] ml-6">{active.mission}</p>
        </div>

        {/* KPI list */}
        <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
          {active.kpis.map((kpi) => {
            const isOpen = expandedKPI === `${active.id}-${kpi.name}`;
            const fc = freqColor[kpi.frequency] || '--panel-accent';
            return (
              <div key={kpi.name}>
                <button onClick={() => setExpandedKPI(isOpen ? null : `${active.id}-${kpi.name}`)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.15)] transition-colors text-left">
                  {/* Weight bar */}
                  <div className="w-10 shrink-0">
                    <div className="h-1.5 rounded-full bg-[hsl(var(--panel-hover))] overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${kpi.weight * 3.3}%`, backgroundColor: `hsl(var(${active.color}))` }} />
                    </div>
                    <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))] block text-center mt-0.5">{kpi.weight}%</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))] block">{kpi.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold font-mono" style={{ color: `hsl(var(${active.color}))` }}>{kpi.target}</span>
                      <span className="text-[7px] px-1.5 py-0.5 rounded-full font-medium" style={{
                        color: `hsl(var(${fc}))`, backgroundColor: `hsl(var(${fc}) / 0.08)`, border: `1px solid hsl(var(${fc}) / 0.2)`,
                      }}>{kpi.frequency}</span>
                    </div>
                  </div>

                  {isOpen ? <ChevronUp className="h-3 w-3 text-[hsl(var(--panel-text-muted))] shrink-0" /> : <ChevronDown className="h-3 w-3 text-[hsl(var(--panel-text-muted))] shrink-0" />}
                </button>

                {isOpen && (
                  <div className="px-4 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-3 ml-[52px]">
                      <div className="rounded-md border border-[hsl(var(--panel-border-subtle))] p-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <BarChart3 className="h-2.5 w-2.5 text-[hsl(var(--panel-info))]" />
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[hsl(var(--panel-info))]">Calculation Formula</span>
                        </div>
                        <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed font-mono">{kpi.formula}</p>
                      </div>
                      <div className="rounded-md border p-2.5" style={{ borderColor: 'hsl(var(--panel-error) / 0.2)', backgroundColor: 'hsl(var(--panel-error) / 0.02)' }}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AlertTriangle className="h-2.5 w-2.5 text-[hsl(var(--panel-error))]" />
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[hsl(var(--panel-error))]">Red Flag Trigger</span>
                        </div>
                        <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{kpi.redFlag}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Review cadence */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-2 px-4 py-2 bg-[hsl(var(--panel-hover)/.3)] border-b border-[hsl(var(--panel-border-subtle))]">
          <Clock className="h-3 w-3 text-[hsl(var(--panel-accent))]" />
          <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">Review Cadence & Accountability</span>
        </div>
        <div className="grid grid-cols-4 gap-px bg-[hsl(var(--panel-border-subtle))]">
          {[
            { cadence: 'Weekly Standup', desc: 'Each team lead reports top 3 KPIs. Flag red items. 15 min max.', color: '--panel-accent' },
            { cadence: 'Bi-Weekly Sprint Review', desc: 'Engineering + AI demo completed work. Connect features to KPI impact.', color: '--panel-info' },
            { cadence: 'Monthly All-Hands', desc: 'Full KPI scorecard review. Celebrate wins. Address systemic red flags.', color: '--panel-success' },
            { cadence: 'Quarterly OKR Alignment', desc: 'Recalibrate targets based on growth stage. Adjust weights if strategy shifts.', color: '--panel-warning' },
          ].map((r) => (
            <div key={r.cadence} className="bg-[hsl(var(--panel-bg))] p-3">
              <span className="text-[10px] font-bold block mb-1" style={{ color: `hsl(var(${r.color}))` }}>{r.cadence}</span>
              <p className="text-[8px] text-[hsl(var(--panel-text-muted))] leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Team KPI Framework v1.0 — {totalKPIs} weighted metrics across {teams.length} functions with red-flag escalation triggers
      </p>
    </div>
  );
};

export default TeamKPIFramework;
