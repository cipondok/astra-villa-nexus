import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  ShieldCheck, Search, AlertTriangle, Users, FileCheck, BarChart3,
  CheckCircle2, Clock, XCircle, ArrowRight, Eye, Flag, Gavel,
  ChevronDown, ChevronUp, Layers, Zap, TrendingUp, Star,
  type LucideIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   ASTRA Villa — Marketplace Integrity & QC Dashboard
   ═══════════════════════════════════════════════════════════ */

type Tab = 'listings' | 'providers' | 'transactions' | 'disputes' | 'health';

const tabs: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'health', label: 'Marketplace Health', icon: BarChart3 },
  { id: 'listings', label: 'Listing Verification', icon: Search },
  { id: 'providers', label: 'Provider Monitoring', icon: Users },
  { id: 'transactions', label: 'Transaction Integrity', icon: FileCheck },
  { id: 'disputes', label: 'Dispute Resolution', icon: Gavel },
];

/* ─── Health score components ─── */
const healthComponents = [
  { name: 'Listing Accuracy', weight: 25, description: 'Verified listings / total active listings ratio', target: '≥ 95%', signals: ['Verification rate', 'Duplicate detection rate', 'Pricing anomaly rate'] },
  { name: 'Provider Reliability', weight: 20, description: 'Active providers meeting performance thresholds', target: '≥ 90%', signals: ['Avg rating ≥ 4.0', 'Job completion rate ≥ 85%', 'Response time < 24h'] },
  { name: 'Transaction Trust', weight: 25, description: 'Clean transactions without disputes', target: '≥ 97%', signals: ['Dispute rate', 'Document verification pass rate', 'Commission accuracy'] },
  { name: 'User Satisfaction', weight: 15, description: 'NPS and CSAT from marketplace interactions', target: 'NPS ≥ 50', signals: ['Post-transaction NPS', 'Service review score', 'Support ticket volume'] },
  { name: 'Response Time', weight: 15, description: 'Average time to first meaningful action', target: '< 4 hours', signals: ['Listing approval time', 'Dispute first response', 'Flag review time'] },
];

/* ─── Listing verification workflows ─── */
const listingWorkflows = [
  {
    name: 'New Listing Approval', icon: CheckCircle2, color: '--panel-accent',
    trigger: 'New listing submitted by agent/owner/developer',
    steps: ['Auto-check: required fields completeness (title, price, location, photos)', 'AI scan: pricing anomaly detection vs city/district median', 'AI scan: duplicate title/address detection (fuzzy match)', 'AI scan: suspicious keyword flagging (fraud indicators)', 'Photo quality check: minimum 3 photos, resolution ≥ 800px', 'Manual review: assigned to QC specialist if any flag triggered', 'Approval → listing goes live / Rejection → feedback sent to submitter'],
    sla: 'Auto-approve if 0 flags (< 30s) / Manual review within 4 hours',
  },
  {
    name: 'Duplicate Detection', icon: Search, color: '--panel-info',
    trigger: 'Runs on submission + daily batch scan',
    steps: ['Title similarity check (Levenshtein distance < 0.3)', 'Address normalization and exact match', 'Price + area + bedroom combination match', 'Photo hash comparison for identical images', 'Flag as potential duplicate with confidence score', 'Admin resolves: merge, remove, or mark as distinct'],
    sla: 'Batch scan completes nightly / Flagged items reviewed within 24h',
  },
  {
    name: 'Pricing Anomaly Alerts', icon: AlertTriangle, color: '--panel-warning',
    trigger: 'Triggered on submission + weekly market recalibration',
    steps: ['Compare price/sqm against city district median', 'Flag if deviation > 40% below or > 60% above median', 'Cross-reference with recent transaction prices in area', 'Generate anomaly score (0–100) with severity classification', 'Auto-flag Critical (score > 80) for immediate review', 'Notify listing owner of pricing concern for self-correction'],
    sla: 'Critical anomalies surfaced within 1 hour / Others within 24h',
  },
];

/* ─── Provider monitoring ─── */
const providerMetrics = [
  { metric: 'Rating Threshold Alert', threshold: '< 3.5 / 5.0 avg', action: 'Auto-flag for review after 5+ reviews below threshold. Warning notification sent to provider. Second offense → temporary suspension pending review.', color: '--panel-warning' },
  { metric: 'Job Completion Rate', threshold: '< 80% completion', action: 'Track confirmed completions vs accepted jobs. Flag providers dropping below 80% in any 30-day window. Require improvement plan or face listing demotion.', color: '--panel-error' },
  { metric: 'Response Time', threshold: '> 48h avg response', action: 'Monitor time from inquiry received to first response. Alert providers exceeding 48h average. Reduce visibility ranking for slow responders.', color: '--panel-info' },
  { metric: 'Dispute Frequency', threshold: '> 2 disputes / month', action: 'Flag providers with recurring disputes. Mandatory mediation after 3rd dispute. Suspension after 5 unresolved disputes in 90 days.', color: '--panel-error' },
  { metric: 'Document Compliance', threshold: '< 100% required docs', action: 'Verify business license, insurance, and certification uploads. Grace period of 14 days for missing documents. Auto-suspend if not resolved.', color: '--panel-accent' },
];

/* ─── Transaction integrity ─── */
const transactionChecks = [
  {
    area: 'Offer Negotiation Audit', icon: Eye, color: '--panel-accent',
    checks: ['Full message thread preserved in offer_messages table', 'Price change history tracked with timestamps', 'Counter-offer chain integrity (no gaps or modifications)', 'User identity verified for both parties at each stage', 'Automated snapshot of offer state at each status transition'],
  },
  {
    area: 'Document Authenticity', icon: FileCheck, color: '--panel-info',
    checks: ['SHM/SHGB certificate number validation format', 'AJB/PPJB document completeness checklist', 'Digital signature timestamp and IP recording', 'Document hash stored for tamper detection', 'Cross-reference property address with certificate data', 'IMB and PBB tax receipt verification'],
  },
  {
    area: 'Commission Validation', icon: BarChart3, color: '--panel-success',
    checks: ['Commission rate matches agreed partnership tier', 'Transaction value verified against offer acceptance record', 'Split calculations confirmed for multi-agent deals', 'Payment timing aligned with transaction completion status', 'Audit trail for any manual commission adjustments', 'Monthly reconciliation report generation'],
  },
];

/* ─── Dispute resolution flow ─── */
const disputeStages = [
  { stage: 'Report Filed', description: 'User submits dispute with category, evidence, and desired resolution', sla: 'Acknowledge within 2 hours', color: '--panel-accent' },
  { stage: 'Evidence Collection', description: 'Both parties provide documentation, screenshots, and transaction records', sla: 'Complete within 48 hours', color: '--panel-info' },
  { stage: 'Mediation', description: 'Support specialist mediates between parties, proposes resolution options', sla: 'First mediation attempt within 72 hours', color: '--panel-warning' },
  { stage: 'Resolution', description: 'Agreement reached or admin decision enforced. Actions: refund, compensation, warning, suspension', sla: 'Resolve within 7 business days', color: '--panel-success' },
  { stage: 'Follow-Up', description: 'Satisfaction check 7 days post-resolution. Update provider/user trust scores accordingly', sla: '7-day follow-up', color: '--panel-accent' },
];

const disputeCategories = [
  { category: 'Listing Misrepresentation', severity: 'High', examples: 'Photos don\'t match property, inaccurate area/bedroom count, hidden defects' },
  { category: 'Service Provider Complaint', severity: 'Medium', examples: 'Incomplete work, missed deadlines, quality below standard, overcharging' },
  { category: 'Transaction Dispute', severity: 'Critical', examples: 'Payment not received, commission disagreement, contract breach' },
  { category: 'Communication Issues', severity: 'Low', examples: 'Unresponsive agent, delayed updates, unprofessional conduct' },
];

const MarketplaceIntegrity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('health');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const toggle = (key: string) => setExpandedItem(expandedItem === key ? null : key);
  const sevColor: Record<string, string> = { Critical: '--panel-error', High: '--panel-warning', Medium: '--panel-info', Low: '--panel-accent' };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] px-5 py-4" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--panel-accent)/.08)] border border-[hsl(var(--panel-accent)/.18)]">
            <ShieldCheck className="h-4.5 w-4.5 text-[hsl(var(--panel-accent))]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--panel-text))] tracking-tight">Marketplace Integrity & Quality Control</h1>
            <p className="text-[11px] text-[hsl(var(--panel-text-secondary))] mt-0.5">Listing verification, provider monitoring, transaction integrity, and dispute resolution</p>
          </div>
        </div>
        <div className="flex items-center gap-6 mt-3 pt-3 border-t border-[hsl(var(--panel-border-subtle))]">
          {[
            { label: 'QC Workflows', value: String(listingWorkflows.length), color: '--panel-accent' },
            { label: 'Provider Metrics', value: String(providerMetrics.length), color: '--panel-info' },
            { label: 'Integrity Checks', value: String(transactionChecks.reduce((s, t) => s + t.checks.length, 0)), color: '--panel-success' },
            { label: 'Dispute Stages', value: String(disputeStages.length), color: '--panel-warning' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `hsl(var(${s.color}))` }} />
              <span className="text-[10px] font-bold font-mono" style={{ color: `hsl(var(${s.color}))` }}>{s.value}</span>
              <span className="text-[9px] text-[hsl(var(--panel-text-muted))] uppercase tracking-wider">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="rounded-xl bg-[hsl(var(--panel-bg))] border border-[hsl(var(--panel-border))] overflow-hidden" style={{ boxShadow: 'var(--panel-shadow)' }}>
        <div className="flex items-center gap-px px-2 py-1.5 border-b border-[hsl(var(--panel-border))] bg-[hsl(var(--panel-hover)/.3)] overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setExpandedItem(null); }} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium transition-all whitespace-nowrap",
              activeTab === tab.id
                ? "bg-[hsl(var(--panel-accent)/.1)] text-[hsl(var(--panel-accent))] border border-[hsl(var(--panel-accent)/.2)]"
                : "text-[hsl(var(--panel-text-muted))] hover:text-[hsl(var(--panel-text-secondary))] hover:bg-[hsl(var(--panel-hover))]"
            )}>
              <tab.icon className="h-3 w-3" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* ── Health ── */}
          {activeTab === 'health' && (
            <div className="animate-in fade-in duration-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-3.5 w-3.5 text-[hsl(var(--panel-accent))]" />
                <span className="text-[11px] font-bold text-[hsl(var(--panel-text))]">Marketplace Health Score Components</span>
                <span className="text-[9px] text-[hsl(var(--panel-text-muted))]">— Weighted composite of 5 trust dimensions</span>
              </div>
              <div className="space-y-3">
                {healthComponents.map((hc, idx) => {
                  const colors = ['--panel-accent', '--panel-info', '--panel-success', '--panel-warning', '--panel-error'];
                  const c = colors[idx % colors.length];
                  return (
                    <div key={hc.name} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold" style={{ color: `hsl(var(${c}))` }}>{hc.name}</span>
                          <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold font-mono" style={{
                            color: `hsl(var(${c}))`, backgroundColor: `hsl(var(${c}) / 0.08)`, border: `1px solid hsl(var(${c}) / 0.2)`,
                          }}>{hc.weight}% weight</span>
                        </div>
                        <span className="text-[9px] font-mono text-[hsl(var(--panel-text-secondary))]">Target: {hc.target}</span>
                      </div>
                      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] mb-2">{hc.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-[hsl(var(--panel-text-muted))]">Signals:</span>
                        {hc.signals.map((s) => (
                          <span key={s} className="text-[8px] px-1.5 py-0.5 rounded-md bg-[hsl(var(--panel-hover))] text-[hsl(var(--panel-text-secondary))] border border-[hsl(var(--panel-border-subtle))]">{s}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Listings ── */}
          {activeTab === 'listings' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {listingWorkflows.map((wf) => {
                const isOpen = expandedItem === wf.name;
                return (
                  <div key={wf.name} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                    <button onClick={() => toggle(wf.name)} className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(var(--panel-hover)/.2)] hover:bg-[hsl(var(--panel-hover)/.4)] transition-colors text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-7 h-7 rounded-md" style={{ backgroundColor: `hsl(var(${wf.color}) / 0.08)`, border: `1px solid hsl(var(${wf.color}) / 0.2)` }}>
                          <wf.icon className="h-3.5 w-3.5" style={{ color: `hsl(var(${wf.color}))` }} />
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))]">{wf.name}</span>
                          <span className="text-[9px] text-[hsl(var(--panel-text-muted))] block">{wf.trigger}</span>
                        </div>
                      </div>
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))]" /> : <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))]" />}
                    </button>
                    {isOpen && (
                      <div className="border-t border-[hsl(var(--panel-border-subtle))] animate-in fade-in duration-200">
                        <div className="p-3">
                          <div className="space-y-1.5 mb-3">
                            {wf.steps.map((s, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-[9px] font-bold font-mono shrink-0 w-4 text-right" style={{ color: `hsl(var(${wf.color}) / 0.6)` }}>{i + 1}.</span>
                                <span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{s}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[hsl(var(--panel-hover)/.3)]">
                            <Clock className="h-2.5 w-2.5 text-[hsl(var(--panel-info))]" />
                            <span className="text-[8px] font-bold uppercase tracking-wider text-[hsl(var(--panel-info))]">SLA:</span>
                            <span className="text-[9px] text-[hsl(var(--panel-text-secondary))]">{wf.sla}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Providers ── */}
          {activeTab === 'providers' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {providerMetrics.map((pm) => (
                <div key={pm.metric} className="rounded-lg border p-3" style={{ borderColor: `hsl(var(${pm.color}) / 0.2)`, backgroundColor: `hsl(var(${pm.color}) / 0.02)` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold" style={{ color: `hsl(var(${pm.color}))` }}>{pm.metric}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold font-mono" style={{
                      color: `hsl(var(${pm.color}))`, backgroundColor: `hsl(var(${pm.color}) / 0.08)`, border: `1px solid hsl(var(${pm.color}) / 0.2)`,
                    }}>Threshold: {pm.threshold}</span>
                  </div>
                  <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{pm.action}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Transactions ── */}
          {activeTab === 'transactions' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              {transactionChecks.map((tc) => {
                const isOpen = expandedItem === tc.area;
                return (
                  <div key={tc.area} className="rounded-lg border border-[hsl(var(--panel-border-subtle))] overflow-hidden">
                    <button onClick={() => toggle(tc.area)} className="w-full flex items-center justify-between px-4 py-3 bg-[hsl(var(--panel-hover)/.2)] hover:bg-[hsl(var(--panel-hover)/.4)] transition-colors text-left">
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center justify-center w-6 h-6 rounded-md" style={{ backgroundColor: `hsl(var(${tc.color}) / 0.08)`, border: `1px solid hsl(var(${tc.color}) / 0.2)` }}>
                          <tc.icon className="h-3 w-3" style={{ color: `hsl(var(${tc.color}))` }} />
                        </div>
                        <span className="text-[11px] font-semibold text-[hsl(var(--panel-text))]">{tc.area}</span>
                        <span className="text-[9px] font-mono text-[hsl(var(--panel-text-muted))]">{tc.checks.length} checks</span>
                      </div>
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))]" /> : <ChevronDown className="h-3.5 w-3.5 text-[hsl(var(--panel-text-muted))]" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 border-t border-[hsl(var(--panel-border-subtle))] pt-2.5 animate-in fade-in duration-200">
                        <div className="space-y-1.5">
                          {tc.checks.map((ck, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="h-2.5 w-2.5 shrink-0 mt-0.5" style={{ color: `hsl(var(${tc.color}) / 0.5)` }} />
                              <span className="text-[9px] text-[hsl(var(--panel-text-secondary))] leading-relaxed">{ck}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Disputes ── */}
          {activeTab === 'disputes' && (
            <div className="animate-in fade-in duration-200">
              {/* Resolution flow */}
              <div className="flex items-center gap-2 mb-3">
                <Gavel className="h-3.5 w-3.5 text-[hsl(var(--panel-accent))]" />
                <span className="text-[11px] font-bold text-[hsl(var(--panel-text))]">Resolution Pipeline</span>
              </div>
              <div className="space-y-2 mb-5">
                {disputeStages.map((ds, idx) => (
                  <div key={ds.stage} className="flex items-start gap-3">
                    <div className="flex flex-col items-center shrink-0 pt-1">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: `hsl(var(${ds.color}) / 0.1)`, border: `1px solid hsl(var(${ds.color}) / 0.25)` }}>
                        <span className="text-[9px] font-bold font-mono" style={{ color: `hsl(var(${ds.color}))` }}>{idx + 1}</span>
                      </div>
                      {idx < disputeStages.length - 1 && <div className="w-px h-full min-h-[16px] bg-[hsl(var(--panel-border-subtle))]" />}
                    </div>
                    <div className="flex-1 rounded-md border border-[hsl(var(--panel-border-subtle))] px-3 py-2 mb-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-[hsl(var(--panel-text))]">{ds.stage}</span>
                        <span className="text-[8px] font-mono text-[hsl(var(--panel-text-muted))]">{ds.sla}</span>
                      </div>
                      <p className="text-[9px] text-[hsl(var(--panel-text-secondary))] mt-0.5">{ds.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dispute categories */}
              <div className="flex items-center gap-2 mb-3">
                <Flag className="h-3.5 w-3.5 text-[hsl(var(--panel-warning))]" />
                <span className="text-[11px] font-bold text-[hsl(var(--panel-text))]">Dispute Categories</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {disputeCategories.map((dc) => (
                  <div key={dc.category} className="rounded-lg border p-3" style={{ borderColor: `hsl(var(${sevColor[dc.severity]}) / 0.2)`, backgroundColor: `hsl(var(${sevColor[dc.severity]}) / 0.02)` }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-[hsl(var(--panel-text))]">{dc.category}</span>
                      <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{
                        color: `hsl(var(${sevColor[dc.severity]}))`,
                        backgroundColor: `hsl(var(${sevColor[dc.severity]}) / 0.08)`,
                        border: `1px solid hsl(var(${sevColor[dc.severity]}) / 0.2)`,
                      }}>{dc.severity}</span>
                    </div>
                    <p className="text-[8px] text-[hsl(var(--panel-text-muted))] leading-relaxed">{dc.examples}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <p className="text-[9px] text-[hsl(var(--panel-text-muted))] text-center">
        ASTRA Villa Marketplace Integrity v1.0 — Automated detection + human oversight for scalable trust
      </p>
    </div>
  );
};

export default MarketplaceIntegrity;
