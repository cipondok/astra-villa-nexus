import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Database, HardDrive, Clock, ChevronDown, Search,
  ArrowRight, AlertTriangle, CheckCircle2, Layers, RefreshCw,
  Server, FileCheck, Activity, Zap, Heart, CircleDot, Archive,
  ShieldCheck, Eye, Radio, Timer, Target, RotateCcw, Gauge
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type Status = 'active' | 'configured' | 'planned';
type Criticality = 'critical' | 'high' | 'medium';

interface Measure {
  name: string;
  description: string;
  implementation: string;
  status: Status;
  criticality: Criticality;
  details: string[];
}

interface StrategyDomain {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Shield;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  measures: Measure[];
}

const STATUS_MAP: Record<Status, { cls: string; label: string; icon: typeof CheckCircle2 }> = {
  active: { cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', label: 'Active', icon: CheckCircle2 },
  configured: { cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30', label: 'Configured', icon: Activity },
  planned: { cls: 'text-muted-foreground bg-muted/10 border-border/30', label: 'Planned', icon: Clock },
};

const CRIT_MAP: Record<Criticality, { cls: string; label: string }> = {
  critical: { cls: 'text-rose-400 bg-rose-400/10 border-rose-400/30', label: 'Critical' },
  high: { cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30', label: 'High' },
  medium: { cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30', label: 'Medium' },
};

const DOMAINS: StrategyDomain[] = [
  {
    id: 'backup', title: 'Database Backup Strategy', subtitle: 'Automated full backups, incremental snapshots, and geo-redundant storage',
    icon: Database, accentClass: 'text-emerald-400', borderClass: 'border-emerald-400/30', bgClass: 'bg-emerald-400',
    measures: [
      {
        name: 'Daily Automated Full Backup',
        description: 'Complete PostgreSQL database dump executed daily at 02:00 UTC during lowest traffic window. Retained for 30 days with automatic rotation.',
        implementation: 'Supabase Pro Plan — automated daily backups',
        status: 'active', criticality: 'critical',
        details: [
          'Supabase Pro: automatic daily backups with 7-day retention (default)',
          'Extended retention: 30-day policy via Supabase backup management',
          'Backup window: 02:00–03:00 UTC (09:00–10:00 WIB, lowest traffic)',
          'Full logical dump: all schemas, RLS policies, functions, and triggers included',
          'Backup size monitored via admin_alerts — alert if >20% growth week-over-week',
        ],
      },
      {
        name: 'Point-in-Time Recovery (PITR)',
        description: 'Continuous WAL archiving enables recovery to any point within the retention window. RPO: seconds, not hours.',
        implementation: 'Supabase Pro PITR — WAL-based continuous archiving',
        status: 'active', criticality: 'critical',
        details: [
          'Write-Ahead Log (WAL) streamed continuously to secure storage',
          'Recovery Point Objective (RPO): < 5 seconds of data loss',
          'Recovery Time Objective (RTO): < 30 minutes for full restore',
          'Granular recovery: restore to exact timestamp (e.g., "before accidental DELETE")',
          'WAL retention: matches backup retention window (7–30 days)',
        ],
      },
      {
        name: 'Geo-Redundant Backup Storage',
        description: 'Backup archives stored in a separate geographic region from the primary database to protect against regional infrastructure failures.',
        implementation: 'Supabase managed backup storage — cross-region replication',
        status: 'active', criticality: 'critical',
        details: [
          'Primary DB region: Singapore (ap-southeast-1) for Indonesian market',
          'Backup storage: replicated to separate availability zone / region',
          'Encryption at rest: AES-256 for all backup archives',
          'Backup integrity: checksums verified on each archive creation',
          'Access control: backup restore requires admin authentication + MFA',
        ],
      },
      {
        name: 'Critical Table Priority Classification',
        description: 'Tables classified by recovery priority to guide restore order during incidents. Financial and transaction data restored first.',
        implementation: 'Documented recovery priority matrix',
        status: 'configured', criticality: 'high',
        details: [
          'P0 (Immediate): property_offers, payment_logs, transaction_commissions, document_signatures',
          'P1 (Critical): properties, profiles, user_sessions, account_lockouts',
          'P2 (Important): ai_intelligence_cache, property_scores, market_clusters, watchlists',
          'P3 (Rebuildable): ai_event_signals, intelligence_worker_runs, ai_feedback_signals',
          'P3 tables can be regenerated by re-running intelligence workers post-restore',
        ],
      },
    ],
  },
  {
    id: 'storage', title: 'Document & Storage Safety', subtitle: 'Versioned object storage with deletion protection',
    icon: Archive, accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    measures: [
      {
        name: 'Versioned Legal Document Storage',
        description: 'Transaction documents (contracts, agreements, KTP, NPWP) stored with version history. Every upload creates a new version, preserving full audit trail.',
        implementation: 'Supabase Storage — transaction-documents bucket + audit trail',
        status: 'active', criticality: 'critical',
        details: [
          'transaction-documents bucket: private, RLS-enforced, owner-only access',
          'document_audit_trail table: immutable insert-only log of all document actions',
          'Each document version linked to signer_id, timestamp, and action type',
          'Previous versions preserved — never overwritten or deleted in-place',
          'Admin restore capability via document version history lookup',
        ],
      },
      {
        name: 'Soft Delete with Recovery Window',
        description: 'Accidental deletions recoverable within 30-day window. Files marked as deleted but retained in storage until expiry.',
        implementation: 'Application-level soft delete + storage retention policy',
        status: 'configured', criticality: 'high',
        details: [
          'Application DELETE marks record as is_deleted=true (soft delete pattern)',
          'Actual storage object retained for 30 days after soft delete',
          'Admin recovery endpoint to restore soft-deleted documents',
          'Hard delete (permanent) requires explicit admin confirmation + audit log',
          'Scheduled cleanup: pg_cron job purges expired soft-deleted files monthly',
        ],
      },
      {
        name: 'Property Image Backup',
        description: 'Property listing images stored in public bucket with CDN replication. Loss of individual images recoverable from CDN edge cache or re-upload.',
        implementation: 'Supabase Storage CDN + multiple size variants',
        status: 'active', criticality: 'medium',
        details: [
          'property-images bucket: public, CDN-cached at 200+ edge locations',
          'Multiple variants stored per image: thumbnail, medium, full resolution',
          'CDN cache serves as secondary backup (edge-cached for 7+ days)',
          'Image metadata preserved in properties table for re-association',
          'Bulk re-upload capability via admin tools if storage bucket restored',
        ],
      },
      {
        name: 'Encryption at Rest for Sensitive Files',
        description: 'All stored documents encrypted at rest using AES-256. Encryption keys managed by Supabase infrastructure.',
        implementation: 'Supabase Storage — automatic encryption at rest',
        status: 'active', criticality: 'critical',
        details: [
          'AES-256 encryption applied to all objects in storage buckets',
          'Encryption keys managed by Supabase — no key management burden',
          'Additional PGP encryption for sensitive database fields (phone, financials)',
          'Vault-managed encryption keys for application-level encryption',
        ],
      },
    ],
  },
  {
    id: 'failover', title: 'Failover & Resilience', subtitle: 'Replica activation, health detection, and graceful degradation',
    icon: RefreshCw, accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    measures: [
      {
        name: 'Standby Database Replica',
        description: 'Hot standby read replica ready for promotion to primary in case of primary database failure. Automatic failover via Supabase infrastructure.',
        implementation: 'Supabase managed HA — automatic failover (Pro+ plans)',
        status: 'active', criticality: 'critical',
        details: [
          'Supabase Pro+: managed high availability with automatic failover',
          'Standby replica receives continuous WAL stream from primary',
          'Failover detection: automatic health monitoring by Supabase infrastructure',
          'Promotion time: < 60 seconds from primary failure detection',
          'Connection string unchanged — client reconnects transparently via pooler',
        ],
      },
      {
        name: 'Automated Health Check Detection',
        description: 'Multi-layer health monitoring detects downtime across database, Edge Functions, and storage. Alerts escalated within 60 seconds.',
        implementation: 'health-monitor Edge Function + admin_alerts + Supabase monitoring',
        status: 'active', criticality: 'critical',
        details: [
          'Daily health-monitor worker: checks all worker status and pipeline backlog',
          'Supabase built-in: database connection monitoring and auto-restart',
          'Edge Function health: deployment status tracked per function',
          'Alert escalation: admin_alerts with urgency_level 5 for infrastructure issues',
          'External uptime monitoring recommended for published URL availability',
        ],
      },
      {
        name: 'Graceful Degradation for AI Features',
        description: 'Non-critical AI intelligence features degrade gracefully during infrastructure stress. Core marketplace operations remain fully available.',
        implementation: 'Feature flags + cached intelligence fallback',
        status: 'configured', criticality: 'high',
        details: [
          'Tier 1 (Never Degrade): property search, offer submission, payments, auth',
          'Tier 2 (Cache Fallback): AI scores served from ai_intelligence_cache (stale OK)',
          'Tier 3 (Skip Silently): recommendation updates, learning engine, forecast refresh',
          'Degradation trigger: ai_batch_locks stall detection (>15 min) halts non-critical workers',
          'Recovery: workers auto-resume when health check confirms infrastructure stability',
        ],
      },
      {
        name: 'Edge Function Isolation & Recovery',
        description: 'Each Edge Function runs in isolated Deno runtime. Individual function failures do not cascade to other functions or platform operations.',
        implementation: 'Supabase Edge Functions — isolated Deno isolates',
        status: 'active', criticality: 'high',
        details: [
          'Function isolation: each invocation runs in separate Deno isolate',
          'Timeout protection: functions killed after 60s (configurable) to prevent hangs',
          'Zero-downtime deployment: rolling updates, old version serves until new is ready',
          'Error logging: all failures captured in Supabase Edge Function logs',
          'Retry strategy: event pipeline retries failed signals automatically',
        ],
      },
    ],
  },
  {
    id: 'recovery', title: 'Recovery Procedures', subtitle: 'Defined restore workflows, incident response, and data verification',
    icon: RotateCcw, accentClass: 'text-sky-400', borderClass: 'border-sky-400/30', bgClass: 'bg-sky-400',
    measures: [
      {
        name: 'Database Restore Workflow',
        description: 'Step-by-step procedure for restoring database from backup, including PITR and full snapshot restore paths.',
        implementation: 'Supabase Dashboard restore + documented runbook',
        status: 'configured', criticality: 'critical',
        details: [
          'Step 1: Identify incident scope (table-level vs full database vs storage)',
          'Step 2: Select restore method — PITR (timestamp) or full backup (daily snapshot)',
          'Step 3: Initiate restore via Supabase Dashboard > Database > Backups',
          'Step 4: Verify restore completeness — run data integrity checks (see below)',
          'Step 5: Reconnect application and verify functionality via health-monitor',
          'Step 6: Post-incident review — update runbook with lessons learned',
        ],
      },
      {
        name: 'Admin Incident Response Checklist',
        description: 'Pre-defined checklist for admin team during data incidents. Covers detection, communication, restore, and post-mortem.',
        implementation: 'Documented SOP + admin_alerts notification chain',
        status: 'configured', criticality: 'critical',
        details: [
          'Detection (0–5 min): automated alert via admin_alerts + manual confirmation',
          'Triage (5–15 min): classify severity (P0–P3), identify affected data scope',
          'Communication (15 min): notify affected users if P0/P1 — status page update',
          'Restore (15–60 min): execute restore workflow per severity classification',
          'Verification (post-restore): run integrity checks on all P0 tables',
          'Post-mortem (24h): document root cause, timeline, and prevention measures',
        ],
      },
      {
        name: 'Data Integrity Verification',
        description: 'Automated checks to verify data consistency after any restore operation. Covers referential integrity, count validation, and financial reconciliation.',
        implementation: 'SQL verification queries + admin dashboard checks',
        status: 'configured', criticality: 'critical',
        details: [
          'Referential integrity: verify all foreign keys resolve (no orphaned records)',
          'Row count validation: compare pre-incident counts with restored counts',
          'Financial reconciliation: sum payment_logs, commissions — match expected totals',
          'Document integrity: verify document_signatures reference valid storage objects',
          'Intelligence state: check ai_intelligence_cache freshness and score coverage %',
          'User sessions: invalidate all active sessions post-restore (force re-auth)',
        ],
      },
      {
        name: 'Intelligence Data Rebuild Procedure',
        description: 'AI-generated data (scores, caches, recommendations) can be fully rebuilt from source data. No permanent intelligence data loss even without backup.',
        implementation: 'Intelligence worker re-execution pipeline',
        status: 'active', criticality: 'medium',
        details: [
          'property_scores: re-run compute-opportunity-scores worker (full batch mode)',
          'market_clusters: re-run aggregate-market-heat for all city/area combinations',
          'ai_intelligence_cache: rebuilt automatically by scheduled workers within 6h',
          'ai_investment_recommendations: re-run generate-recommendations (daily cycle)',
          'portfolio_snapshots: re-run portfolio-roi-tracker for all active investors',
          'Total rebuild time: ~2 hours for full intelligence state reconstruction',
        ],
      },
    ],
  },
];

const RTO_RPO = [
  { metric: 'RPO (Data Loss)', target: '< 5 seconds', method: 'Continuous WAL archiving (PITR)', icon: Timer },
  { metric: 'RTO (Recovery Time)', target: '< 30 minutes', method: 'Managed failover + PITR restore', icon: RotateCcw },
  { metric: 'Failover Time', target: '< 60 seconds', method: 'Supabase HA automatic promotion', icon: Zap },
  { metric: 'AI Rebuild Time', target: '< 2 hours', method: 'Full intelligence worker re-execution', icon: RefreshCw },
];

function MeasureRow({ measure }: { measure: Measure }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_MAP[measure.status];
  const cr = CRIT_MAP[measure.criticality];
  const StIcon = st.icon;

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-foreground">{measure.name}</span>
            <Badge variant="outline" className={`text-[8px] h-4 border ${cr.cls}`}>{cr.label}</Badge>
            <Badge variant="outline" className={`text-[8px] h-4 gap-0.5 border ${st.cls}`}><StIcon className="h-2 w-2" /> {st.label}</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{measure.description}</p>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-2.5 space-y-1.5">
              <Separator className="opacity-10" />
              <div className="text-[9px]">
                <span className="text-muted-foreground/60 uppercase tracking-wider">Implementation</span>
                <code className="block text-violet-400 font-mono mt-0.5">{measure.implementation}</code>
              </div>
              <div>
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Details</span>
                <div className="space-y-0.5 mt-0.5">
                  {measure.details.map((d, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400/60 mt-0.5 shrink-0" />
                      <span className="text-[9px] text-muted-foreground">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DomainCard({ domain }: { domain: StrategyDomain }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = domain.icon;
  const active = domain.measures.filter(m => m.status === 'active').length;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${domain.borderClass} ${domain.bgClass}/10 shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${domain.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{domain.title}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{domain.measures.length} measures</Badge>
            <Badge variant="outline" className="text-[9px] h-5 text-emerald-400 border-emerald-400/30">{active} active</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">{domain.subtitle}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 space-y-1.5">
              <Separator className="opacity-15" />
              {domain.measures.map(m => <MeasureRow key={m.name} measure={m} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DisasterRecoveryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const all = DOMAINS.flatMap(d => d.measures);
    return {
      domains: DOMAINS.length,
      measures: all.length,
      active: all.filter(m => m.status === 'active').length,
      critical: all.filter(m => m.criticality === 'critical').length,
    };
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return DOMAINS;
    const q = searchQuery.toLowerCase();
    return DOMAINS.map(d => ({
      ...d,
      measures: d.measures.filter(m =>
        m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) ||
        m.implementation.toLowerCase().includes(q)
      ),
    })).filter(d => d.measures.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Disaster Recovery Blueprint</h1>
              <p className="text-xs text-muted-foreground">Backup, failover, and recovery strategy — ensuring business continuity and data integrity</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Strategy Domains', value: stats.domains, icon: Layers },
              { label: 'Total Measures', value: stats.measures, icon: ShieldCheck },
              { label: 'Active', value: stats.active, icon: CheckCircle2 },
              { label: 'Critical Priority', value: stats.critical, icon: AlertTriangle },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border/20 bg-card/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-2xl font-bold text-foreground">{s.value}</span>
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* RTO/RPO targets */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Recovery Targets (RTO / RPO)</span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {RTO_RPO.map(r => (
                <div key={r.metric} className="rounded-lg border border-border/10 bg-muted/5 p-2.5 text-center">
                  <r.icon className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                  <span className="text-[10px] text-muted-foreground block">{r.metric}</span>
                  <span className="text-sm font-bold text-foreground block">{r.target}</span>
                  <span className="text-[8px] text-muted-foreground/70 block mt-0.5">{r.method}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Incident flow */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-foreground">Incident Response Flow</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {[
                { label: 'Detect', sub: 'Health monitors' },
                { label: 'Triage', sub: 'Classify P0–P3' },
                { label: 'Failover', sub: 'Auto-promote replica' },
                { label: 'Restore', sub: 'PITR / Snapshot' },
                { label: 'Verify', sub: 'Integrity checks' },
                { label: 'Post-mortem', sub: 'Runbook update' },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  <div className="px-2 py-1.5 rounded-lg border border-border/20 bg-muted/5 text-center min-w-[80px]">
                    <span className="text-foreground font-medium block">{step.label}</span>
                    <span className="text-muted-foreground/50 text-[8px]">{step.sub}</span>
                  </div>
                  {i < 5 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search measures, implementations..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {filtered.map(d => <DomainCard key={d.id} domain={d} />)}
      </div>
    </div>
  );
}
