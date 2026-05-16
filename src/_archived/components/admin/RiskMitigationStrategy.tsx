import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ShieldAlert, Scale, Cpu, Wallet, BadgeCheck, HeartPulse,
  ChevronRight, AlertTriangle, CheckCircle2, Circle, Clock,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Risk Identification & Mitigation Strategy
   ═══════════════════════════════════════════════════════════ */

type Severity = 'critical' | 'high' | 'medium';
type Likelihood = 'high' | 'medium' | 'low';

interface Safeguard {
  action: string;
  owner: string;
  cadence: string;
  kpi: string;
}

interface RiskCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  severity: Severity;
  likelihood: Likelihood;
  description: string;
  earlyWarnings: string[];
  safeguards: Safeguard[];
  worstCase: string;
  recoveryPath: string;
}

const severityColor: Record<Severity, string> = {
  critical: '--panel-error',
  high: '--panel-warning',
  medium: '--panel-info',
};

const likelihoodLabel: Record<Likelihood, string> = {
  high: 'Likely',
  medium: 'Possible',
  low: 'Unlikely',
};

const risks: RiskCategory[] = [
  {
    id: 'marketplace', label: 'Marketplace Imbalance', icon: Scale, color: '--panel-error',
    severity: 'critical', likelihood: 'high',
    description: 'Low listing supply vs investor demand mismatch creates a dead marketplace. Investors arrive, find nothing worth pursuing, and never return.',
    earlyWarnings: [
      'New listings/week trending below 20 for 3 consecutive weeks',
      'Investor session bounce rate exceeding 65%',
      'Time-to-first-inquiry rising above 5 days',
      'Agent churn rate exceeding 10%/month',
    ],
    safeguards: [
      { action: 'Maintain proactive agent onboarding pipeline', owner: 'Growth Lead', cadence: 'Weekly', kpi: '≥ 15 new agent activations/week' },
      { action: 'Run developer partnership outreach sprints', owner: 'BD Lead', cadence: 'Bi-weekly', kpi: '≥ 3 developer meetings/week' },
      { action: 'Launch supply incentive programs for early agents', owner: 'Product', cadence: 'Monthly review', kpi: 'Agent listing rate ≥ 5 listings/agent/month' },
      { action: 'Monitor supply-demand ratio dashboard daily', owner: 'Founder', cadence: 'Daily', kpi: 'Supply:demand ratio ≥ 3:1' },
    ],
    worstCase: 'Chicken-and-egg death spiral — no supply drives away demand, agent departures accelerate, platform becomes a ghost town within 6 months.',
    recoveryPath: 'Emergency supply blitz: temporarily onboard aggregated listings from partner portals while rebuilding direct agent pipeline.',
  },
  {
    id: 'complexity', label: 'Technology Over-Complexity', icon: Cpu, color: '--panel-warning',
    severity: 'high', likelihood: 'medium',
    description: 'Building advanced AI features before validating core marketplace traction wastes runway and delays revenue. Technical sophistication ≠ product-market fit.',
    earlyWarnings: [
      'Sprint velocity declining while feature count increases',
      'Core conversion funnel metrics stagnant despite new features',
      'Engineering time on non-revenue features exceeding 40%',
      'User feedback requesting basics while team ships advanced modules',
    ],
    safeguards: [
      { action: 'Prioritize revenue-impact modules in every sprint', owner: 'Product', cadence: 'Sprint planning', kpi: '≥ 60% sprint capacity on revenue features' },
      { action: 'Enforce "does this drive listings or leads?" filter', owner: 'Founder', cadence: 'Per feature decision', kpi: 'Every feature tied to a growth metric' },
      { action: 'Quarterly tech debt vs feature balance review', owner: 'Engineering', cadence: 'Quarterly', kpi: 'Tech debt allocation ≤ 20%' },
      { action: 'Ship MVP of new features, iterate based on usage', owner: 'Product', cadence: 'Continuous', kpi: 'Feature adoption ≥ 15% within 30 days' },
    ],
    worstCase: 'Running out of runway with an impressive but unused platform. Beautiful AI that nobody pays for.',
    recoveryPath: 'Feature freeze on non-essentials. Redirect 100% of engineering to the 3 features closest to revenue.',
  },
  {
    id: 'financial', label: 'Financial Runway', icon: Wallet, color: '--panel-warning',
    severity: 'high', likelihood: 'medium',
    description: 'Uncontrolled marketing or development spending burns runway before achieving sustainable unit economics. Cash is oxygen.',
    earlyWarnings: [
      'Monthly burn rate exceeding projected budget by 20%+',
      'CAC rising without proportional LTV improvement',
      'Runway dropping below 6 months without revenue trajectory',
      'Marketing spend without measurable conversion attribution',
    ],
    safeguards: [
      { action: 'Maintain lean experimentation budgeting approach', owner: 'Founder', cadence: 'Weekly', kpi: 'Monthly burn within ±10% of plan' },
      { action: 'Require ROI projection for every spend > $500', owner: 'Finance', cadence: 'Per expenditure', kpi: '100% spend justified with expected return' },
      { action: 'Weekly cash position and runway review', owner: 'Founder', cadence: 'Weekly', kpi: 'Runway ≥ 9 months at all times' },
      { action: 'Milestone-gated budget releases for campaigns', owner: 'Growth Lead', cadence: 'Per campaign', kpi: 'Kill underperforming campaigns within 14 days' },
    ],
    worstCase: 'Forced shutdown or desperate fundraising at unfavorable terms. Loss of strategic independence.',
    recoveryPath: 'Immediate cost-cutting to extend runway by 6 months. Shift to revenue-generating activities only. Explore bridge financing.',
  },
  {
    id: 'trust', label: 'Trust & Reputation', icon: BadgeCheck, color: '--panel-info',
    severity: 'high', likelihood: 'medium',
    description: 'Inaccurate listings or failed transactions destroy marketplace credibility. Trust is the hardest thing to rebuild in property markets.',
    earlyWarnings: [
      'User complaint rate exceeding 2% of transactions',
      'Listing accuracy reports flagging > 5% of inventory',
      'Negative reviews appearing on external platforms',
      'Agent verification backlog exceeding 48 hours',
    ],
    safeguards: [
      { action: 'Implement strict quality verification workflows', owner: 'Operations', cadence: 'Per listing', kpi: '100% of listings verified before publication' },
      { action: 'Automated listing accuracy scoring', owner: 'Engineering', cadence: 'Continuous', kpi: 'Accuracy score ≥ 95% across all listings' },
      { action: 'Rapid dispute resolution within 24 hours', owner: 'Support', cadence: 'Per incident', kpi: 'Resolution time < 24h for critical issues' },
      { action: 'Agent credibility scoring and tiering', owner: 'Product', cadence: 'Monthly recalc', kpi: 'Bottom 5% agents flagged for review monthly' },
    ],
    worstCase: 'Platform branded as unreliable. Viral negative sentiment destroys organic growth. Recovery takes 12-18 months.',
    recoveryPath: 'Public transparency report. Remove all unverified listings. Launch "Verified Only" mode. Rebuild through quality over quantity.',
  },
  {
    id: 'burnout', label: 'Founder Burnout', icon: HeartPulse, color: '--panel-accent',
    severity: 'medium', likelihood: 'high',
    description: 'Sustained overwork reduces strategic clarity, decision quality, and emotional resilience. Burnout is the silent killer of startups.',
    earlyWarnings: [
      'Consistent work sessions exceeding 14 hours for 2+ weeks',
      'Decision fatigue — deferring or avoiding strategic choices',
      'Physical symptoms: sleep disruption, persistent fatigue',
      'Emotional detachment from mission or team',
    ],
    safeguards: [
      { action: 'Structured execution routine with recovery blocks', owner: 'Founder', cadence: 'Daily', kpi: '≥ 7h sleep, 1h exercise 5x/week' },
      { action: 'Weekly strategic thinking time (no execution)', owner: 'Founder', cadence: 'Weekly', kpi: '≥ 2h uninterrupted thinking time/week' },
      { action: 'Bi-weekly peer founder check-in', owner: 'Founder', cadence: 'Bi-weekly', kpi: 'Maintained support network contact' },
      { action: 'Quarterly personal sustainability audit', owner: 'Founder', cadence: 'Quarterly', kpi: 'Energy score self-assessment ≥ 7/10' },
    ],
    worstCase: 'Founder incapacitation. Critical decisions delayed or made poorly. Team morale collapses without leadership energy.',
    recoveryPath: 'Forced 1-week reset. Delegate all non-critical decisions. Re-establish daily routine. Consider co-founder or COO hire.',
  },
];

const RiskMitigationStrategy: React.FC = () => {
  const [activeRisk, setActiveRisk] = useState('marketplace');
  const [expandedSafeguard, setExpandedSafeguard] = useState<number | null>(null);

  const active = risks.find(r => r.id === activeRisk)!;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-error)/.08)] border border-[hsl(var(--panel-error)/.18)]">
            <ShieldAlert className="h-4.5 w-4.5 text-[hsl(var(--panel-error))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Risk Identification & Mitigation Strategy</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Proactive safeguards protecting ASTRA Villa's growth trajectory</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'Risk Categories', value: String(risks.length), color: '--panel-error' },
            { label: 'Total Safeguards', value: String(risks.reduce((s, r) => s + r.safeguards.length, 0)), color: '--panel-success' },
            { label: 'Critical Risks', value: String(risks.filter(r => r.severity === 'critical').length), color: '--panel-warning' },
            { label: 'Framework', value: 'Preventive Ops', color: '--panel-info' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk matrix overview */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-text-muted))] block mb-2">Risk Severity × Likelihood Matrix</span>
        <div className="grid grid-cols-5 gap-2">
          {risks.map(r => (
            <button key={r.id} onClick={() => { setActiveRisk(r.id); setExpandedSafeguard(null); }}
              className={cn(
                "rounded-lg border p-2.5 transition-all text-left",
                activeRisk === r.id
                  ? `bg-[hsl(var(${r.color})/.08)] border-[hsl(var(${r.color})/.3)]`
                  : "bg-[hsl(var(--panel-bg))] border-[hsl(var(--panel-border))] hover:bg-[hsl(var(--panel-hover)/.3)]"
              )}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <r.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${r.color}))` }} />
                <span className="text-[9px] font-bold" style={{ color: `hsl(var(${r.color}))` }}>{r.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[7px] font-mono px-1.5 py-0.5 rounded-full" style={{
                  color: `hsl(var(${severityColor[r.severity]}))`,
                  backgroundColor: `hsl(var(${severityColor[r.severity]}) / 0.1)`,
                  border: `1px solid hsl(var(${severityColor[r.severity]}) / 0.2)`,
                }}>{r.severity.toUpperCase()}</span>
                <span className="text-[7px] font-mono text-[hsl(var(--panel-text-muted))]">{likelihoodLabel[r.likelihood]}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg border border-[hsl(var(--panel-border-subtle))] px-4 py-3 bg-[hsl(var(--panel-hover)/.15)]">
        <p className="text-[10px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">
          <span className="font-bold" style={{ color: `hsl(var(${active.color}))` }}>Risk: </span>{active.description}
        </p>
      </div>

      {/* Early warnings */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)] flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3 text-[hsl(var(--panel-warning))]" />
          <span className="text-[10px] font-bold text-[hsl(var(--panel-text))]">Early Warning Signals</span>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          {active.earlyWarnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 p-2 rounded-md border border-[hsl(var(--panel-border-subtle))]">
              <Circle className="h-2 w-2 mt-0.5 shrink-0 text-[hsl(var(--panel-warning))]" />
              <span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{w}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Safeguards */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="px-4 py-2.5 border-b border-[hsl(var(--panel-border-subtle))] bg-[hsl(var(--panel-hover)/.2)] flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 text-[hsl(var(--panel-success))]" />
          <span className="text-[10px] font-bold text-[hsl(var(--panel-text))]">Mitigation Safeguards</span>
        </div>
        <div className="divide-y divide-[hsl(var(--panel-border-subtle))]">
          {active.safeguards.map((s, idx) => {
            const isOpen = expandedSafeguard === idx;
            return (
              <div key={idx}>
                <button onClick={() => setExpandedSafeguard(isOpen ? null : idx)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--panel-hover)/.15)] transition-colors text-left">
                  <div className="flex items-center justify-center w-6 h-6 rounded-md text-[9px] font-bold font-mono" style={{
                    color: `hsl(var(${active.color}))`, backgroundColor: `hsl(var(${active.color}) / 0.08)`, border: `1px solid hsl(var(${active.color}) / 0.2)`,
                  }}>{idx + 1}</div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))] block">{s.action}</span>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">👤 {s.owner}</span>
                      <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]"><Clock className="inline h-2 w-2" /> {s.cadence}</span>
                    </div>
                  </div>
                  <ChevronRight className={cn("h-3 w-3 text-[hsl(var(--panel-text-muted))] shrink-0 transition-transform", isOpen && "rotate-90")} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="ml-9 p-2.5 rounded-md border border-[hsl(var(--panel-border-subtle))] flex items-center gap-2">
                      <span className="text-[8px] font-bold uppercase text-[hsl(var(--panel-success))]">KPI:</span>
                      <span className="text-[9px] font-mono" style={{ color: `hsl(var(${active.color}))` }}>{s.kpi}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Worst case + recovery */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-3" style={{ boxShadow: 'var(--panel-shadow)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="h-3 w-3 text-[hsl(var(--panel-error))]" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-error))]">Worst Case Scenario</span>
          </div>
          <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{active.worstCase}</p>
        </div>
        <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] p-3" style={{ boxShadow: 'var(--panel-shadow)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="h-3 w-3 text-[hsl(var(--panel-success))]" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--panel-success))]">Recovery Path</span>
          </div>
          <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{active.recoveryPath}</p>
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Risk Mitigation Strategy v1.0 — {risks.length} risk categories · {risks.reduce((s, r) => s + r.safeguards.length, 0)} safeguards · {risks.reduce((s, r) => s + r.earlyWarnings.length, 0)} early warning signals
      </p>
    </div>
  );
};

export default RiskMitigationStrategy;
