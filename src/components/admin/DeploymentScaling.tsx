import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cloud, Server, Database, Globe, Shield, Zap, Monitor, HardDrive, ArrowRight, RefreshCw, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface InfraLayer {
  name: string;
  icon: React.ElementType;
  provider: string;
  components: { name: string; detail: string; status: string }[];
}

const layers: InfraLayer[] = [
  {
    name: 'Frontend Hosting', icon: Globe, provider: 'Vercel / CDN Edge',
    components: [
      { name: 'Edge CDN Delivery', detail: '200+ PoPs globally, <50ms TTFB', status: 'Active' },
      { name: 'Static Asset Caching', detail: 'Immutable hashing, 1-year cache', status: 'Active' },
      { name: 'Preview Deployments', detail: 'Branch-based PR previews', status: 'Active' },
      { name: 'Web Vitals Monitoring', detail: 'LCP <2.5s, CLS <0.1', status: 'Monitoring' },
    ],
  },
  {
    name: 'Backend API Layer', icon: Server, provider: 'Supabase Edge Functions',
    components: [
      { name: 'Serverless Functions', detail: 'Deno-based, auto-scaling, <200ms cold start', status: 'Active' },
      { name: 'REST + Realtime API', detail: 'PostgREST auto-generated, WebSocket channels', status: 'Active' },
      { name: 'Auth Service', detail: 'JWT, OAuth, MFA, session management', status: 'Active' },
      { name: 'Rate Limiting', detail: 'Token bucket per API key', status: 'Planned' },
    ],
  },
  {
    name: 'Database Cluster', icon: Database, provider: 'Supabase PostgreSQL',
    components: [
      { name: 'Primary Write Node', detail: 'Dedicated compute, auto-scaling storage', status: 'Active' },
      { name: 'Read Replicas', detail: 'Analytics query routing at >100K users', status: 'Planned' },
      { name: 'Connection Pooling', detail: 'PgBouncer transaction mode', status: 'Active' },
      { name: 'Automated Backups', detail: 'Point-in-time recovery, 7-day retention', status: 'Active' },
    ],
  },
  {
    name: 'File Storage', icon: HardDrive, provider: 'Supabase Storage + CDN',
    components: [
      { name: 'Property Image Storage', detail: 'S3-compatible, auto-optimize', status: 'Active' },
      { name: 'Image Transformations', detail: 'On-the-fly resize, WebP conversion', status: 'Active' },
      { name: 'Document Vault', detail: 'Encrypted storage for contracts', status: 'Active' },
      { name: 'CDN Distribution', detail: 'Edge-cached media delivery', status: 'Active' },
    ],
  },
  {
    name: 'Real-time Event Streaming', icon: Zap, provider: 'Supabase Realtime + pg_cron',
    components: [
      { name: 'WebSocket Channels', detail: 'Deal updates, notifications, chat', status: 'Active' },
      { name: 'Database Triggers', detail: 'Event emission on price/status changes', status: 'Active' },
      { name: 'AI Event Bus', detail: 'ai_event_signals with 2-min dedup', status: 'Active' },
      { name: 'Scheduled Jobs', detail: 'pg_cron for materialized view refresh', status: 'Active' },
    ],
  },
  {
    name: 'Analytics & Logging', icon: Monitor, provider: 'Supabase Analytics + Custom',
    components: [
      { name: 'Activity Logging', detail: 'Structured activity_logs table', status: 'Active' },
      { name: 'Error Tracking', detail: 'Edge function error monitoring', status: 'Active' },
      { name: 'Performance Metrics', detail: 'Query latency, API response times', status: 'Partial' },
      { name: 'Business Intelligence', detail: 'Materialized KPI views', status: 'Active' },
    ],
  },
];

const scalingTriggers = [
  { trigger: 'Database >50GB', action: 'Upgrade compute tier', threshold: 65, current: 38 },
  { trigger: 'Storage >5TB', action: 'Add Cloudflare CDN layer', threshold: 80, current: 12 },
  { trigger: 'Users >100K', action: 'Enable read replicas', threshold: 50, current: 22 },
  { trigger: 'API >10K req/s', action: 'Add edge function regions', threshold: 70, current: 15 },
];

const cicdStages = [
  { stage: 'Code Push', desc: 'Git push to feature branch', icon: '📝' },
  { stage: 'Lint + Type Check', desc: 'ESLint, TypeScript strict', icon: '🔍' },
  { stage: 'Unit Tests', desc: 'Vitest + Testing Library', icon: '🧪' },
  { stage: 'Preview Deploy', desc: 'Vercel preview URL', icon: '🌐' },
  { stage: 'E2E Tests', desc: 'Playwright smoke tests', icon: '🎭' },
  { stage: 'Production Deploy', desc: 'Merge to main → auto-deploy', icon: '🚀' },
  { stage: 'Migration Run', desc: 'Supabase migration apply', icon: '🗄️' },
  { stage: 'Health Check', desc: 'Post-deploy verification', icon: '✅' },
];

const DeploymentScaling = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Cloud className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Deployment & Scaling Infrastructure</h2>
          <Badge variant="outline">☁️ Cloud Architecture</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Production-grade cloud deployment with auto-scaling and disaster recovery</p>
      </motion.div>

      {/* Infrastructure Layers */}
      <div className="space-y-4">
        {layers.map((layer, li) => (
          <motion.div key={li} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: li * 0.05 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <layer.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{layer.name}</p>
                    <p className="text-xs text-muted-foreground">{layer.provider}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {layer.components.map((c, ci) => (
                    <div key={ci} className="flex items-start gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.detail}</p>
                      </div>
                      <Badge variant={c.status === 'Active' ? 'default' : c.status === 'Monitoring' ? 'secondary' : 'outline'} className="text-xs shrink-0">{c.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Scaling Triggers */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Auto-Scaling Trigger Thresholds</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {scalingTriggers.map((s, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div>
                  <span className="font-medium text-foreground">{s.trigger}</span>
                  <span className="text-muted-foreground ml-2">→ {s.action}</span>
                </div>
                <span className="text-xs text-muted-foreground">{s.current}% of threshold</span>
              </div>
              <Progress value={s.current} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* CI/CD Pipeline */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">CI/CD Pipeline</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {cicdStages.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50 border border-border">
                  <span className="text-sm">{s.icon}</span>
                  <div>
                    <p className="text-xs font-medium text-foreground">{s.stage}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
                {i < cicdStages.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* DR & Multi-region */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Disaster Recovery</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong className="text-foreground">RPO:</strong> 5 minutes (point-in-time recovery)</p>
            <p>• <strong className="text-foreground">RTO:</strong> 30 minutes (automated failover)</p>
            <p>• <strong className="text-foreground">Backups:</strong> Daily automated + 7-day retention</p>
            <p>• <strong className="text-foreground">WAL Archival:</strong> Continuous to S3</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Multi-Region Readiness</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong className="text-foreground">Primary:</strong> Singapore (ap-southeast-1)</p>
            <p>• <strong className="text-foreground">CDN:</strong> Global edge via Vercel</p>
            <p>• <strong className="text-foreground">Expansion:</strong> Middle East region planned</p>
            <p>• <strong className="text-foreground">Data Residency:</strong> Per-region compliance ready</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Infrastructure Insight</p>
            <p className="text-sm text-muted-foreground">Current infrastructure utilizes less than 40% of scaling thresholds — platform is well-positioned for 10x growth without architectural changes. Next scaling event: read replica activation at 100K concurrent users.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentScaling;
