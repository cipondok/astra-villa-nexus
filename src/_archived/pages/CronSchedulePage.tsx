import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, Zap, ChevronDown, Search, ArrowRight, Shield, Activity,
  Timer, Calendar, Database, Server, Target, Layers, Hash,
  Brain, Building2, TrendingUp, BarChart3, RefreshCw, AlertTriangle,
  CheckCircle2, Circle, Pause, Play, Gauge, ArrowDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type WorkerStatus = 'active' | 'scheduled' | 'planned';
type FrequencyTier = '5m' | '10m' | '15m' | '30m' | '1h' | '2h' | '6h' | 'daily';

interface CronWorker {
  name: string;
  functionName: string;
  rpc?: string;
  description: string;
  status: WorkerStatus;
  batchSize: number;
  avgDuration: string;
  safetyRules: string[];
  logTable: string;
}

interface ScheduleTier {
  frequency: FrequencyTier;
  cronExpr: string;
  label: string;
  subtitle: string;
  purpose: string;
  icon: typeof Clock;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  workers: CronWorker[];
}

const STATUS_STYLES: Record<WorkerStatus, { label: string; icon: typeof CheckCircle2; cls: string }> = {
  active: { label: 'Active', icon: CheckCircle2, cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  scheduled: { label: 'Scheduled', icon: Clock, cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  planned: { label: 'Planned', icon: Circle, cls: 'text-muted-foreground bg-muted/10 border-border/30' },
};

const SCHEDULE_TIERS: ScheduleTier[] = [
  {
    frequency: '5m',
    cronExpr: '*/5 * * * *',
    label: 'Every 5 Minutes',
    subtitle: 'Real-time signal detection',
    purpose: 'Detect time-sensitive market signals — price drops, demand spikes, and deal opportunities. These workers scan only unprocessed events and new data, keeping each run under 5 seconds.',
    icon: Zap,
    accentClass: 'text-rose-400', borderClass: 'border-rose-400/30', bgClass: 'bg-rose-400',
    workers: [
      {
        name: 'Deal Hunter Scanner',
        functionName: 'scan-deal-opportunities',
        rpc: 'scan_deal_alerts',
        description: 'Scan for undervalued properties (score ≥75) and emit deal signals to ai_event_signals',
        status: 'active', batchSize: 100, avgDuration: '~2s',
        safetyRules: ['Only scans status = active listings', 'Deduplicates signals within 2-min window', 'Skips properties scored within last 5 minutes'],
        logTable: 'intelligence_worker_runs',
      },
      {
        name: 'Event Pipeline Processor',
        functionName: 'process-ai-events',
        description: 'Claim unprocessed ai_event_signals and dispatch targeted worker recalculations via EVENT_WORKER_MAP',
        status: 'active', batchSize: 100, avgDuration: '~3s',
        safetyRules: ['Claims signals atomically (is_processed = true)', 'Fire-and-forget worker dispatch', 'Logs dispatch results per worker'],
        logTable: 'intelligence_worker_runs',
      },
    ],
  },
  {
    frequency: '10m',
    cronExpr: '*/10 * * * *',
    label: 'Every 10 Minutes',
    subtitle: 'Core scoring recalculation',
    purpose: 'Recalculate the primary investment scoring engine. Only processes properties whose scores are stale (updated >10 minutes ago) or flagged by event signals.',
    icon: Brain,
    accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    workers: [
      {
        name: 'Opportunity Scoring Engine',
        functionName: 'compute-opportunity-scores',
        rpc: 'recalc_opportunity_scores',
        description: 'Batch recalculate weighted opportunity scores (ROI 30%, Demand 20%, Valuation Gap 20%, Inquiry Velocity 15%, Rental Yield 10%, Luxury 5%)',
        status: 'active', batchSize: 500, avgDuration: '~4s',
        safetyRules: ['Processes only stale scores (score_updated_at > 10m ago)', 'Skips archived/draft listings', 'Batch size capped at 500 per run'],
        logTable: 'intelligence_worker_runs',
      },
    ],
  },
  {
    frequency: '15m',
    cronExpr: '*/15 * * * *',
    label: 'Every 15 Minutes',
    subtitle: 'Price signals and demand heat',
    purpose: 'Detect price drop signals across active listings and refresh micro-location demand heat cluster indicators. These feed the watchlist alert system and market heat map.',
    icon: TrendingUp,
    accentClass: 'text-sky-400', borderClass: 'border-sky-400/30', bgClass: 'bg-sky-400',
    workers: [
      {
        name: 'Price Drop Signal Detector',
        functionName: 'predict-property-prices',
        rpc: 'detect_price_drop_signals',
        description: 'Compare current prices against 24h/7d history — emit alerts at 3% (Minor), 5% (Opportunity), 10% (Elite) thresholds',
        status: 'active', batchSize: 200, avgDuration: '~3s',
        safetyRules: ['Only active listings with price_history entries', 'Deduplicates alerts per property per 24h window', 'Triggers watchlist notifications via notification-engine'],
        logTable: 'intelligence_worker_runs',
      },
      {
        name: 'Demand Heat Cluster Refresh',
        functionName: 'aggregate-market-heat',
        rpc: 'aggregate_market_clusters',
        description: 'Geo-aggregate property density and engagement into micro-location heat scores (0-100) with tier classification',
        status: 'active', batchSize: 0, avgDuration: '~5s',
        safetyRules: ['Processes all city/area combinations', 'Upserts into market_clusters (no duplicates)', 'Syncs heat scores back to individual properties'],
        logTable: 'intelligence_worker_runs',
      },
    ],
  },
  {
    frequency: '1h',
    cronExpr: '0 * * * *',
    label: 'Every 1 Hour',
    subtitle: 'Valuation and revenue monitoring',
    purpose: 'Run property valuation estimates using comparable analysis and check revenue alert thresholds. These are compute-heavier operations that benefit from hourly cadence.',
    icon: BarChart3,
    accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    workers: [
      {
        name: 'Property Valuation Engine',
        functionName: 'predict-property-prices',
        rpc: 'compute_price_predictions',
        description: 'Estimate fair market value and forecast 3m/6m/12m price trends using demand signals and location intelligence',
        status: 'active', batchSize: 300, avgDuration: '~8s',
        safetyRules: ['Only properties with sufficient comparables (≥3)', 'Generates ai_price_confidence score per property', 'Skips properties valued within last hour'],
        logTable: 'intelligence_worker_runs',
      },
      {
        name: 'Revenue Alert Monitor',
        functionName: 'check_revenue_alerts (SQL)',
        rpc: 'check_revenue_alerts',
        description: 'Monitor daily revenue, commission payouts, and rental income against configured thresholds in revenue_alert_config',
        status: 'active', batchSize: 0, avgDuration: '~1s',
        safetyRules: ['Reads from payment_logs and transaction_commissions', 'Triggers admin_alerts on threshold breach', 'Configurable thresholds per metric type'],
        logTable: 'admin_alerts',
      },
    ],
  },
  {
    frequency: '2h',
    cronExpr: '0 */2 * * *',
    label: 'Every 2 Hours',
    subtitle: 'Portfolio and investor analytics',
    purpose: 'Refresh investor portfolio snapshots and sync demand heat scores to individual property records. These operations aggregate across multiple tables.',
    icon: Gauge,
    accentClass: 'text-emerald-400', borderClass: 'border-emerald-400/30', bgClass: 'bg-emerald-400',
    workers: [
      {
        name: 'Portfolio Snapshot Engine',
        functionName: 'intelligence-cron',
        rpc: 'compute_portfolio_snapshots',
        description: 'Compute portfolio ROI, diversification metrics, and risk scores for all active investor profiles',
        status: 'active', batchSize: 0, avgDuration: '~6s',
        safetyRules: ['Only investors with ≥1 watchlist or saved property', 'Calculates weighted portfolio value and yield', 'Updates portfolio_snapshots table with timestamp'],
        logTable: 'intelligence_worker_runs',
      },
      {
        name: 'Demand Heat Sync',
        functionName: 'intelligence-cron',
        rpc: 'sync_demand_heat_scores',
        description: 'Propagate cluster-level heat scores to individual property demand_heat_score columns',
        status: 'active', batchSize: 500, avgDuration: '~3s',
        safetyRules: ['Batch updates in chunks of 500', 'Only active properties in scored clusters', 'Preserves manually overridden scores'],
        logTable: 'intelligence_worker_runs',
      },
    ],
  },
  {
    frequency: '6h',
    cronExpr: '0 */6 * * *',
    label: 'Every 6 Hours',
    subtitle: 'Macro intelligence and self-learning',
    purpose: 'Run macro market trend analysis, developer demand forecasting, and the self-learning weight calibration engine. These are the heaviest analytical operations.',
    icon: Brain,
    accentClass: 'text-primary', borderClass: 'border-primary/30', bgClass: 'bg-primary',
    workers: [
      {
        name: 'Learning Engine',
        functionName: 'learning-engine',
        description: 'Self-calibrating scoring weights based on actual investment outcomes (conversion rates, price accuracy, yield actuals)',
        status: 'active', batchSize: 0, avgDuration: '~12s',
        safetyRules: ['Compares predictions vs actuals from last 30 days', 'Adjusts weights within ±5% safety bounds per cycle', 'Logs weight changes for audit trail'],
        logTable: 'intelligence_worker_runs',
      },
      {
        name: 'Macro Market Trends',
        functionName: 'market-intelligence-feed',
        description: 'Aggregate city-level market cycle detection (Expansion, Peak, Correction, Recovery) and supply/demand ratios',
        status: 'active', batchSize: 0, avgDuration: '~8s',
        safetyRules: ['Analyzes 90-day rolling window of transactions', 'Generates market_cycle_phase per city', 'Emits admin alerts on phase transitions'],
        logTable: 'intelligence_worker_runs',
      },
      {
        name: 'Developer Demand Forecast',
        functionName: 'developer-demand-forecast',
        description: 'Predict demand trends for developer project types by location using inquiry velocity and search pattern analysis',
        status: 'active', batchSize: 0, avgDuration: '~6s',
        safetyRules: ['Requires ≥50 data points per location', 'Generates 3-month forward demand curves', 'Updates developer project dashboards'],
        logTable: 'intelligence_worker_runs',
      },
    ],
  },
  {
    frequency: 'daily',
    cronExpr: '0 0 * * *',
    label: 'Daily Midnight (UTC)',
    subtitle: 'Reports, archival, and maintenance',
    purpose: 'Generate daily investor recommendation reports, compute full portfolio ROI snapshots, archive stale listing analytics, and run system health diagnostics.',
    icon: Calendar,
    accentClass: 'text-pink-400', borderClass: 'border-pink-400/30', bgClass: 'bg-pink-400',
    workers: [
      {
        name: 'Recommendation Report Generator',
        functionName: 'generate-recommendations',
        description: 'Generate personalized investment recommendation reports matching investor profiles to top-scored properties',
        status: 'active', batchSize: 50, avgDuration: '~15s',
        safetyRules: ['Only active investors with complete profiles', 'Generates tiered recommendations (Strong Buy → Hold)', 'Stores in ai_investment_recommendations table'],
        logTable: 'intelligence_worker_runs',
      },
      {
        name: 'Full Portfolio ROI Snapshot',
        functionName: 'portfolio-roi-tracker',
        description: 'Comprehensive daily portfolio valuation with historical tracking for trend analysis',
        status: 'active', batchSize: 0, avgDuration: '~10s',
        safetyRules: ['Includes unrealized gains from AI price predictions', 'Calculates IRR and cash-on-cash returns', 'Archives previous snapshot for comparison'],
        logTable: 'intelligence_worker_runs',
      },
      {
        name: 'Stale Listing Archiver',
        functionName: 'scheduler',
        description: 'Identify listings inactive >90 days and transition to archived status with analytics snapshot',
        status: 'active', batchSize: 100, avgDuration: '~4s',
        safetyRules: ['Only listings with zero inquiries in 90 days', 'Preserves listing data (soft archive, not delete)', 'Notifies listing owners before archival'],
        logTable: 'intelligence_worker_runs',
      },
      {
        name: 'System Health Diagnostic',
        functionName: 'health-monitor',
        description: 'Check all worker health, signal pipeline backlog, database connection pool, and storage usage',
        status: 'active', batchSize: 0, avgDuration: '~2s',
        safetyRules: ['Alerts admin if any worker failed in last 24h', 'Checks event pipeline backlog (threshold: >50)', 'Reports stale score coverage percentage'],
        logTable: 'admin_alerts',
      },
    ],
  },
];

const SAFETY_PRINCIPLES = [
  { icon: RefreshCw, title: 'Async Execution', desc: 'All workers run as Edge Functions invoked via pg_cron + pg_net HTTP POST. No blocking of user requests.', impact: 'Zero impact on real-time user experience' },
  { icon: Timer, title: 'Duration Logging', desc: 'Every run logs start time, duration_ms, rows_affected, and status to intelligence_worker_runs table.', impact: 'Full observability via Worker Health Panel' },
  { icon: Pause, title: 'Skip Inactive', desc: 'Workers filter on status = "active" and skip recently-scored properties using score_updated_at timestamps.', impact: 'Eliminates redundant computation by 60-80%' },
  { icon: Shield, title: 'Concurrency Cap', desc: 'MAX_CONCURRENT_TRIGGERS = 3 with ai_batch_locks table prevents duplicate execution and cascade spikes.', impact: 'Prevents resource contention under load' },
  { icon: AlertTriangle, title: 'Error Recovery', desc: 'Failed workers are logged with error_message. Watchdog RPC resets stalled jobs (>15m) for automatic retry.', impact: 'Self-healing pipeline without manual intervention' },
  { icon: Database, title: 'Batch Chunking', desc: 'Large operations process 20-50 items per DB call chunk, preventing URI-too-long and memory spike errors.', impact: 'Stable execution at 100k+ property scale' },
];

function WorkerRow({ worker }: { worker: CronWorker }) {
  const [expanded, setExpanded] = useState(false);
  const ss = STATUS_STYLES[worker.status];
  const SIcon = ss.icon;

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <Activity className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-foreground">{worker.name}</span>
            <Badge variant="outline" className={`text-[8px] h-4 gap-0.5 border ${ss.cls}`}><SIcon className="h-2 w-2" /> {ss.label}</Badge>
            {worker.batchSize > 0 && <Badge variant="outline" className="text-[8px] h-4 text-muted-foreground border-border/30">batch: {worker.batchSize}</Badge>}
            <Badge variant="outline" className="text-[8px] h-4 text-muted-foreground border-border/30">{worker.avgDuration}</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{worker.description}</p>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-2.5 space-y-1.5">
              <Separator className="opacity-10" />
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div>
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Edge Function</span>
                  <code className="block text-foreground font-mono mt-0.5">{worker.functionName}</code>
                </div>
                {worker.rpc && (
                  <div>
                    <span className="text-muted-foreground/60 uppercase tracking-wider">SQL RPC</span>
                    <code className="block text-violet-400 font-mono mt-0.5">{worker.rpc}()</code>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground/60 uppercase tracking-wider">Log Table</span>
                  <code className="block text-foreground font-mono mt-0.5">{worker.logTable}</code>
                </div>
              </div>
              <div>
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Safety Rules</span>
                <div className="space-y-0.5 mt-0.5">
                  {worker.safetyRules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <Shield className="h-2.5 w-2.5 text-emerald-400/60 mt-0.5 shrink-0" />
                      <span className="text-[9px] text-muted-foreground">{rule}</span>
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

function TierCard({ tier }: { tier: ScheduleTier }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = tier.icon;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${tier.borderClass} ${tier.bgClass}/10 shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${tier.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{tier.label}</h3>
            <Badge variant="outline" className="text-[9px] h-5 font-mono">{tier.cronExpr}</Badge>
            <Badge variant="outline" className="text-[9px] h-5">{tier.workers.length} workers</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">{tier.subtitle}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 space-y-2">
              <Separator className="opacity-15" />
              <div className={`rounded-lg border ${tier.borderClass} ${tier.bgClass}/5 p-2.5`}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className={`h-3 w-3 ${tier.accentClass}`} />
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${tier.accentClass}`}>Purpose</span>
                </div>
                <p className="text-[10px] text-foreground leading-relaxed">{tier.purpose}</p>
              </div>
              <div className="space-y-1.5">
                {tier.workers.map(w => <WorkerRow key={w.name} worker={w} />)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CronSchedulePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const allWorkers = SCHEDULE_TIERS.flatMap(t => t.workers);
    const active = allWorkers.filter(w => w.status === 'active').length;
    return { tiers: SCHEDULE_TIERS.length, workers: allWorkers.length, active };
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return SCHEDULE_TIERS;
    const q = searchQuery.toLowerCase();
    return SCHEDULE_TIERS.map(t => ({
      ...t,
      workers: t.workers.filter(w =>
        w.name.toLowerCase().includes(q) || w.functionName.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) || (w.rpc?.toLowerCase().includes(q) ?? false)
      ),
    })).filter(t => t.workers.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Timer className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Background Worker Schedule</h1>
              <p className="text-xs text-muted-foreground">pg_cron execution plan — AI intelligence and marketplace maintenance</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Schedule Tiers', value: stats.tiers, icon: Layers },
              { label: 'Total Workers', value: stats.workers, icon: Activity },
              { label: 'Active Workers', value: stats.active, icon: CheckCircle2 },
              { label: 'Log Table', value: 'worker_runs', icon: Database },
            ].map(s => (
              <div key={s.label} className="rounded-xl border border-border/20 bg-card/30 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  {typeof s.value === 'number' ? (
                    <span className="text-2xl font-bold text-foreground">{s.value}</span>
                  ) : (
                    <span className="text-sm font-bold font-mono text-foreground">{s.value}</span>
                  )}
                </div>
                <p className="text-[9px] text-muted-foreground uppercase mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Execution timeline */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Execution Architecture</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {[
                { label: 'pg_cron', sub: 'Scheduler' },
                { label: 'pg_net HTTP POST', sub: 'Trigger' },
                { label: 'Edge Function', sub: 'Worker' },
                { label: 'SQL RPC', sub: 'Compute' },
                { label: 'intelligence_worker_runs', sub: 'Log' },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  <div className="px-2.5 py-1.5 rounded-lg border border-border/20 bg-muted/5 text-center">
                    <span className="text-muted-foreground font-medium block">{step.label}</span>
                    <span className="text-muted-foreground/50 text-[8px]">{step.sub}</span>
                  </div>
                  {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Safety principles */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-bold text-foreground">Performance Safety Guarantees</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {SAFETY_PRINCIPLES.map(s => (
                <div key={s.title} className="rounded-lg border border-border/10 bg-muted/5 p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] font-bold text-foreground">{s.title}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">{s.desc}</p>
                  <p className="text-[9px] text-emerald-400 mt-1 font-medium">↗ {s.impact}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search workers, functions, RPCs..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {filtered.map(tier => <TierCard key={tier.frequency} tier={tier} />)}
      </div>
    </div>
  );
}
