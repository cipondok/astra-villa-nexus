import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, Server, Database, Globe, Zap, ChevronDown, Search,
  ArrowRight, Shield, Activity, Layers, Monitor, Cpu, HardDrive,
  BarChart3, RefreshCw, AlertTriangle, CheckCircle2, Clock,
  Image, Wifi, GitBranch, Target, Gauge, Eye, Radio
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

type Status = 'deployed' | 'active' | 'planned';
type Priority = 'critical' | 'high' | 'medium';

interface Component {
  name: string;
  description: string;
  technology: string;
  status: Status;
  priority: Priority;
  specs: string[];
}

interface InfraLayer {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Cloud;
  accentClass: string;
  borderClass: string;
  bgClass: string;
  components: Component[];
}

const STATUS_MAP: Record<Status, { cls: string; label: string; icon: typeof CheckCircle2 }> = {
  deployed: { cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30', label: 'Deployed', icon: CheckCircle2 },
  active: { cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30', label: 'Active', icon: Activity },
  planned: { cls: 'text-muted-foreground bg-muted/10 border-border/30', label: 'Planned', icon: Clock },
};

const PRIORITY_MAP: Record<Priority, { cls: string; label: string }> = {
  critical: { cls: 'text-rose-400 bg-rose-400/10 border-rose-400/30', label: 'Critical' },
  high: { cls: 'text-amber-400 bg-amber-400/10 border-amber-400/30', label: 'High' },
  medium: { cls: 'text-sky-400 bg-sky-400/10 border-sky-400/30', label: 'Medium' },
};

const INFRA_LAYERS: InfraLayer[] = [
  {
    id: 'frontend', title: 'Frontend Delivery & CDN', subtitle: 'Global edge distribution with optimized asset delivery',
    icon: Globe, accentClass: 'text-sky-400', borderClass: 'border-sky-400/30', bgClass: 'bg-sky-400',
    components: [
      {
        name: 'Global CDN Distribution',
        description: 'React SPA deployed via Lovable hosting with automatic global CDN edge distribution. Static assets cached at 200+ edge locations.',
        technology: 'Lovable Hosting + Vite Build + CDN Edge Network',
        status: 'deployed', priority: 'critical',
        specs: [
          'Vite production build with tree-shaking, code splitting, and minification',
          'Lazy-loaded routes: 240+ pages loaded on-demand via React.lazy()',
          'Brotli/gzip compression on all static assets (JS, CSS, HTML)',
          'Cache-Control: public, max-age=31536000 for hashed assets',
          'Automatic cache invalidation on each publish/deploy cycle',
        ],
      },
      {
        name: 'Edge Caching for Public Listings',
        description: 'Public property listing pages and search results leverage CDN edge caching with stale-while-revalidate strategy.',
        technology: 'CDN Cache Rules + Supabase PostgREST Cache Headers',
        status: 'active', priority: 'high',
        specs: [
          'Public listings API: Cache-Control with 60s max-age + stale-while-revalidate=300',
          'Featured properties: cached at edge with 5-minute TTL',
          'Search results: short-lived cache (30s) to balance freshness and speed',
          'Authenticated endpoints bypass cache entirely (private, no-store)',
        ],
      },
      {
        name: 'Responsive Image Optimization',
        description: 'Property images served with responsive sizing, WebP conversion, and lazy loading for optimal Core Web Vitals.',
        technology: 'Supabase Storage + browser-image-compression + srcset',
        status: 'deployed', priority: 'high',
        specs: [
          'browser-image-compression: client-side resize before upload (max 1920px, 80% quality)',
          'Multiple size variants: thumbnail (300px), medium (800px), full (1920px)',
          'Native lazy loading: loading="lazy" on all below-fold images',
          'WebP format preferred with JPEG fallback for legacy browsers',
          'Supabase Storage CDN serves images from nearest edge location',
        ],
      },
      {
        name: 'PWA & Offline Capability',
        description: 'Progressive Web App with service worker for offline access to saved properties and cached dashboards.',
        technology: 'vite-plugin-pwa + Service Worker + Cache API',
        status: 'deployed', priority: 'medium',
        specs: [
          'vite-plugin-pwa configured for workbox runtime caching',
          'App shell cached for instant load on repeat visits',
          'API responses cached with network-first strategy',
          'Offline fallback page for no-connectivity scenarios',
        ],
      },
    ],
  },
  {
    id: 'backend', title: 'Backend & Compute Scaling', subtitle: 'Serverless Edge Functions with isolated worker tiers',
    icon: Server, accentClass: 'text-violet-400', borderClass: 'border-violet-400/30', bgClass: 'bg-violet-400',
    components: [
      {
        name: 'Serverless Edge Function Fleet',
        description: '30+ Edge Functions handling AI intelligence, payments, notifications, and marketplace operations. Auto-scaling with zero cold-start management.',
        technology: 'Supabase Edge Functions (Deno Runtime)',
        status: 'deployed', priority: 'critical',
        specs: [
          'Functions: core-engine, deal-engine, payment-engine, notification-engine, learning-engine, etc.',
          'Auto-scaling: Supabase handles concurrent execution scaling transparently',
          'Isolation: each function runs in its own Deno isolate (memory-safe)',
          'Deployment: automatic on code push — zero-downtime rolling updates',
          'Region: deployed closest to Supabase project region (Singapore for ID market)',
        ],
      },
      {
        name: 'Background Intelligence Workers',
        description: 'Heavy AI computation isolated into scheduled background workers via pg_cron + pg_net, preventing impact on real-time user requests.',
        technology: 'pg_cron → pg_net HTTP POST → Edge Functions',
        status: 'deployed', priority: 'critical',
        specs: [
          '7 frequency tiers: 5m → daily (16 total workers)',
          'ai_batch_locks table prevents concurrent duplicate execution',
          'MAX_CONCURRENT_TRIGGERS = 3 to cap resource contention',
          'Watchdog RPC resets stalled jobs (>15 min) for automatic retry',
          'intelligence_worker_runs table logs duration_ms, rows_affected, status per run',
        ],
      },
      {
        name: 'API Rate Control',
        description: 'Rate limiting on high-traffic and sensitive endpoints to prevent abuse and ensure fair resource distribution.',
        technology: 'Edge Function middleware + request counters',
        status: 'active', priority: 'high',
        specs: [
          'Property search: 60 requests/min per authenticated user',
          'Negotiation messages: 10 messages/min per thread per user',
          'AI intelligence endpoints: 20 requests/min per user',
          'Public listing views: 120 requests/min per IP',
          '429 Too Many Requests with Retry-After header on limit breach',
        ],
      },
      {
        name: 'Webhook & Event Processing Pipeline',
        description: 'Inbound webhooks (Midtrans payments, external integrations) processed with signature validation and idempotency keys.',
        technology: 'Edge Functions + ai_event_signals table',
        status: 'active', priority: 'high',
        specs: [
          'Payment webhooks: HMAC signature verification before processing',
          'Idempotency: event_id deduplication prevents double-processing',
          'ai_event_signals: centralized event bus for async worker dispatch',
          'Dead letter queue: failed events logged for manual retry',
        ],
      },
    ],
  },
  {
    id: 'database', title: 'Database & Data Layer Scaling', subtitle: 'Read/write separation with horizontal scaling readiness',
    icon: Database, accentClass: 'text-emerald-400', borderClass: 'border-emerald-400/30', bgClass: 'bg-emerald-400',
    components: [
      {
        name: 'Read Replica Strategy for Analytics',
        description: 'Analytics dashboards and reporting queries routed to read replicas to isolate from transactional write load.',
        technology: 'Supabase Read Replicas (when traffic demands)',
        status: 'planned', priority: 'high',
        specs: [
          'Trigger: activate when DB CPU sustains >70% during analytics peaks',
          'Analytics queries (recharts dashboards, admin reports) route to replica',
          'Transactional queries (offers, payments, bookings) stay on primary',
          'Supabase connection string routing: primary vs replica via SDK config',
          'Replication lag tolerance: <5s acceptable for analytics dashboards',
        ],
      },
      {
        name: 'Query Separation: OLTP vs OLAP',
        description: 'Transactional (OLTP) and analytical (OLAP) workloads separated by query pattern and connection pooling.',
        technology: 'Supabase Connection Pooler (PgBouncer) + query design',
        status: 'deployed', priority: 'critical',
        specs: [
          'OLTP: property_offers, payment_logs, bookings — indexed for point lookups',
          'OLAP: ai_intelligence_cache, market_clusters, portfolio_snapshots — batch aggregation',
          'Materialized views for pre-computed ranking dashboards (refreshed by cron)',
          'Cursor-based pagination on all listing queries (no OFFSET)',
          '80+ indexes verified across search, AI, engagement, and transaction tables',
        ],
      },
      {
        name: 'Connection Pool Management',
        description: 'PgBouncer transaction-mode pooling to maximize concurrent connections without exhausting PostgreSQL limits.',
        technology: 'Supabase PgBouncer + connection limits',
        status: 'deployed', priority: 'critical',
        specs: [
          'Transaction mode: connections returned to pool after each transaction',
          'Edge Functions use pooled connection string (port 6543)',
          'Direct connections reserved for migrations and admin operations only',
          'Pool size scales with Supabase plan tier (Pro: 60 direct, 200 pooled)',
        ],
      },
      {
        name: 'Horizontal Scaling Preparation',
        description: 'Data architecture designed for future sharding by city/region. Indonesian location hierarchy enables natural partition boundaries.',
        technology: 'PostgreSQL table partitioning + location hierarchy',
        status: 'planned', priority: 'medium',
        specs: [
          'Natural partition key: province_id → city_id (4-tier hierarchy)',
          'properties table partitionable by city for geographic distribution',
          'ai_intelligence_cache: partition by cache_type for isolated refresh',
          'price_history: partition by recorded_at (monthly range partitions)',
          'Activation trigger: when single-table exceeds 50M rows',
        ],
      },
    ],
  },
  {
    id: 'monitoring', title: 'Monitoring & Observability', subtitle: 'Uptime alerts, latency tracking, and worker health dashboards',
    icon: Monitor, accentClass: 'text-amber-400', borderClass: 'border-amber-400/30', bgClass: 'bg-amber-400',
    components: [
      {
        name: 'Uptime Monitoring & Alerting',
        description: 'Continuous health checks on critical endpoints with instant alert escalation on downtime detection.',
        technology: 'health-monitor Edge Function + admin_alerts',
        status: 'deployed', priority: 'critical',
        specs: [
          'Daily health diagnostic checks all worker status and pipeline backlog',
          'Admin alerts generated with priority scoring (1-5 urgency levels)',
          'admin_alert_rules: configurable conditions per event type',
          'Alert channels: in-app admin dashboard + email notification',
          'Threshold: alert if any worker fails for >1 hour consecutively',
        ],
      },
      {
        name: 'Performance Latency Tracking',
        description: 'Edge Function execution times, database query durations, and API response times tracked for performance regression detection.',
        technology: 'intelligence_worker_runs + Supabase Analytics',
        status: 'deployed', priority: 'high',
        specs: [
          'intelligence_worker_runs: duration_ms logged per worker per run',
          'Supabase Dashboard: built-in API latency and DB query metrics',
          'P95 latency targets: search <500ms, AI scoring <2s, listing load <300ms',
          'Slow query detection: queries >1s flagged in postgres_logs',
          'Client-side: Web Vitals tracking (LCP, FID, CLS) via analytics',
        ],
      },
      {
        name: 'AI Worker Execution Dashboard',
        description: 'Dedicated admin dashboard showing worker run history, success rates, batch sizes, and error patterns.',
        technology: 'intelligence_worker_runs table + Admin UI',
        status: 'deployed', priority: 'high',
        specs: [
          'Worker health panel: last run time, avg duration, success rate per worker',
          'Signal pipeline monitor: unprocessed ai_event_signals backlog count',
          'Score coverage: % of active properties with fresh scores (<1h old)',
          'Error log viewer: last 50 failed runs with error_message and stack trace',
          'Admin page: /admin/ai-monitoring with real-time refresh',
        ],
      },
      {
        name: 'Revenue & Business Metrics Monitoring',
        description: 'Automated monitoring of revenue thresholds, commission payouts, and marketplace health metrics.',
        technology: 'check_revenue_alerts RPC + revenue_alert_config',
        status: 'deployed', priority: 'high',
        specs: [
          'Hourly revenue threshold checks via check_revenue_alerts SQL RPC',
          'Configurable alert thresholds per metric type in revenue_alert_config',
          'Marketplace health: listing volume, inquiry velocity, conversion rates',
          'Daily automated reports: GMV, active listings, new registrations',
          'Anomaly detection: alerts on >20% deviation from 7-day rolling average',
        ],
      },
    ],
  },
];

const SCALING_MILESTONES = [
  { phase: 'Startup', users: '0 – 1K', listings: '< 5K', infra: 'Supabase Free/Pro, single region, CDN', color: 'text-emerald-400' },
  { phase: 'Growth', users: '1K – 10K', listings: '5K – 50K', infra: '+ Read replica, connection pooling, background workers', color: 'text-sky-400' },
  { phase: 'Scale', users: '10K – 100K', listings: '50K – 500K', infra: '+ Table partitioning, multi-region CDN, dedicated compute', color: 'text-violet-400' },
  { phase: 'Regional', users: '100K+', listings: '500K+', infra: '+ Multi-region DB, edge compute, dedicated infrastructure', color: 'text-amber-400' },
];

function ComponentRow({ component }: { component: Component }) {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_MAP[component.status];
  const pr = PRIORITY_MAP[component.priority];
  const StIcon = st.icon;

  return (
    <div className="rounded-lg border border-border/15 bg-card/20 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-muted/5 transition-colors">
        <Cpu className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-foreground">{component.name}</span>
            <Badge variant="outline" className={`text-[8px] h-4 border ${pr.cls}`}>{pr.label}</Badge>
            <Badge variant="outline" className={`text-[8px] h-4 gap-0.5 border ${st.cls}`}><StIcon className="h-2 w-2" /> {st.label}</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{component.description}</p>
        </div>
        <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-3 pb-2.5 space-y-1.5">
              <Separator className="opacity-10" />
              <div className="text-[9px]">
                <span className="text-muted-foreground/60 uppercase tracking-wider">Technology Stack</span>
                <code className="block text-violet-400 font-mono mt-0.5">{component.technology}</code>
              </div>
              <div>
                <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">Specifications</span>
                <div className="space-y-0.5 mt-0.5">
                  {component.specs.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400/60 mt-0.5 shrink-0" />
                      <span className="text-[9px] text-muted-foreground">{s}</span>
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

function LayerCard({ layer }: { layer: InfraLayer }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = layer.icon;
  const deployed = layer.components.filter(c => c.status === 'deployed').length;

  return (
    <div className="rounded-xl border border-border/20 bg-card/30 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-muted/5 transition-colors">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${layer.borderClass} ${layer.bgClass}/10 shrink-0`}>
          <Icon className={`h-4.5 w-4.5 ${layer.accentClass}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{layer.title}</h3>
            <Badge variant="outline" className="text-[9px] h-5">{layer.components.length} components</Badge>
            <Badge variant="outline" className="text-[9px] h-5 text-emerald-400 border-emerald-400/30">{deployed} deployed</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">{layer.subtitle}</p>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 space-y-1.5">
              <Separator className="opacity-15" />
              {layer.components.map(c => <ComponentRow key={c.name} component={c} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CloudInfrastructurePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useMemo(() => {
    const all = INFRA_LAYERS.flatMap(l => l.components);
    return {
      layers: INFRA_LAYERS.length,
      components: all.length,
      deployed: all.filter(c => c.status === 'deployed').length,
      critical: all.filter(c => c.priority === 'critical').length,
    };
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return INFRA_LAYERS;
    const q = searchQuery.toLowerCase();
    return INFRA_LAYERS.map(l => ({
      ...l,
      components: l.components.filter(c =>
        c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) ||
        c.technology.toLowerCase().includes(q)
      ),
    })).filter(l => l.components.length > 0);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border/30 bg-gradient-to-r from-background via-card/20 to-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Cloud className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground font-serif">Cloud Infrastructure Blueprint</h1>
              <p className="text-xs text-muted-foreground">Scalable deployment architecture — CDN, serverless compute, database scaling, and observability</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Infra Layers', value: stats.layers, icon: Layers },
              { label: 'Components', value: stats.components, icon: Cpu },
              { label: 'Deployed', value: stats.deployed, icon: CheckCircle2 },
              { label: 'Critical Path', value: stats.critical, icon: AlertTriangle },
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

          {/* Request flow */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">Request Flow Architecture</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap text-[9px]">
              {[
                { label: 'User Browser', sub: 'PWA + Service Worker' },
                { label: 'CDN Edge', sub: 'Static + Cache' },
                { label: 'Supabase Gateway', sub: 'Auth + Rate Limit' },
                { label: 'Edge Functions', sub: 'Serverless Compute' },
                { label: 'PostgreSQL', sub: 'RLS + Pooled Conn' },
              ].map((step, i) => (
                <div key={step.label} className="flex items-center gap-1">
                  <div className="px-2.5 py-1.5 rounded-lg border border-border/20 bg-muted/5 text-center min-w-[100px]">
                    <span className="text-foreground font-medium block">{step.label}</span>
                    <span className="text-muted-foreground/50 text-[8px]">{step.sub}</span>
                  </div>
                  {i < 4 && <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />}
                </div>
              ))}
            </div>
          </div>

          {/* Scaling milestones */}
          <div className="rounded-xl border border-border/20 bg-card/20 p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-foreground">Scaling Milestones</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {SCALING_MILESTONES.map(m => (
                <div key={m.phase} className="rounded-lg border border-border/10 bg-muted/5 p-2.5">
                  <span className={`text-[11px] font-bold ${m.color}`}>{m.phase}</span>
                  <div className="text-[9px] text-muted-foreground mt-1 space-y-0.5">
                    <div>Users: <span className="text-foreground">{m.users}</span></div>
                    <div>Listings: <span className="text-foreground">{m.listings}</span></div>
                    <div className="text-[8px] text-muted-foreground/70 mt-1">{m.infra}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search components, technologies..." className="pl-9 h-9 text-xs bg-card/30 border-border/20" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-3">
        {filtered.map(layer => <LayerCard key={layer.id} layer={layer} />)}
      </div>
    </div>
  );
}
