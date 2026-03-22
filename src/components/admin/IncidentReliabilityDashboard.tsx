import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, CheckCircle, Clock, ArrowRight, Activity, Server, Users, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const activeIncidents = [
  { id: 'INC-047', title: 'Payment Service Latency Spike', severity: 'High', status: 'Investigating', service: 'Payment & Escrow', started: '14 min ago', team: 'Backend', impact: 'Checkout delays for ~3% users' },
  { id: 'INC-046', title: 'Image CDN Cache Invalidation Delay', severity: 'Low', status: 'Monitoring', service: 'Storage CDN', started: '2h ago', team: 'Infrastructure', impact: 'Stale thumbnails for new listings' },
];

const recentResolved = [
  { id: 'INC-045', title: 'WebSocket Connection Drops', severity: 'Medium', mttr: '22 min', rootCause: 'Connection pool exhaustion during peak', date: '2 days ago' },
  { id: 'INC-044', title: 'Search Index Sync Lag', severity: 'High', mttr: '45 min', rootCause: 'pg_cron job timeout on materialized view refresh', date: '5 days ago' },
  { id: 'INC-043', title: 'Auth Rate Limiter False Positives', severity: 'Medium', mttr: '18 min', rootCause: 'Sliding window misconfiguration for shared IPs', date: '1 week ago' },
  { id: 'INC-042', title: 'Notification Queue Backlog', severity: 'Low', mttr: '12 min', rootCause: 'Email provider API throttling', date: '1 week ago' },
];

const serviceHealth = [
  { name: 'Auth & Identity', uptime: 99.99, status: 'Operational', incidents30d: 1 },
  { name: 'Property Listings', uptime: 99.97, status: 'Operational', incidents30d: 2 },
  { name: 'Search & Recommendation', uptime: 99.95, status: 'Operational', incidents30d: 1 },
  { name: 'Deal & Negotiation', uptime: 99.98, status: 'Operational', incidents30d: 0 },
  { name: 'Payment & Escrow', uptime: 99.82, status: 'Degraded', incidents30d: 3 },
  { name: 'Notifications', uptime: 99.94, status: 'Operational', incidents30d: 2 },
  { name: 'Analytics & AI', uptime: 99.96, status: 'Operational', incidents30d: 1 },
  { name: 'Agent Network', uptime: 99.99, status: 'Operational', incidents30d: 0 },
];

const escalationSteps = [
  { step: 'Alert Triggered', desc: 'Automated monitoring detects anomaly', time: '0 min', icon: AlertTriangle },
  { step: 'On-Call Notified', desc: 'PagerDuty / Slack alert to on-call engineer', time: '< 2 min', icon: Users },
  { step: 'Investigation', desc: 'Root cause analysis with observability tools', time: '< 10 min', icon: Activity },
  { step: 'Mitigation', desc: 'Apply fix, rollback, or circuit breaker', time: '< 30 min', icon: Zap },
  { step: 'Recovery', desc: 'Service restored, user impact resolved', time: '< 45 min', icon: CheckCircle },
  { step: 'Post-Mortem', desc: 'Blameless review, action items documented', time: '< 48h', icon: TrendingUp },
];

const IncidentReliabilityDashboard = () => {
  const overallUptime = (serviceHealth.reduce((s, h) => s + h.uptime, 0) / serviceHealth.length).toFixed(2);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Incident Response & Reliability</h2>
          <Badge variant="outline">🛡️ SRE</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Platform uptime monitoring, incident management workflows, and service reliability tracking</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Platform Uptime', value: `${overallUptime}%`, sub: 'Last 30 days' },
          { label: 'Active Incidents', value: `${activeIncidents.length}`, sub: activeIncidents.some(i => i.severity === 'High') ? '1 High severity' : 'All low/medium' },
          { label: 'Avg MTTR', value: '24 min', sub: 'Last 30 days' },
          { label: 'Total Incidents (30d)', value: `${serviceHealth.reduce((s, h) => s + h.incidents30d, 0)}`, sub: `${recentResolved.length} resolved` },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold text-primary">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.sub}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="status">
        <TabsList><TabsTrigger value="status">Service Status</TabsTrigger><TabsTrigger value="incidents">Active Incidents</TabsTrigger><TabsTrigger value="escalation">Escalation Flow</TabsTrigger><TabsTrigger value="history">History</TabsTrigger></TabsList>

        <TabsContent value="status" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-2">
              {serviceHealth.map((svc, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border">
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${svc.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="text-sm font-medium text-foreground flex-1">{svc.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">{svc.uptime}%</span>
                  <Progress value={svc.uptime} max={100} className="w-24 h-1.5" />
                  <Badge variant={svc.status === 'Operational' ? 'default' : 'destructive'} className="text-xs min-w-[80px] justify-center">{svc.status}</Badge>
                  <span className="text-xs text-muted-foreground">{svc.incidents30d} inc.</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="mt-4 space-y-3">
          {activeIncidents.map((inc, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={inc.severity === 'High' ? 'border-destructive/50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{inc.id}</Badge>
                      <span className="text-sm font-bold text-foreground">{inc.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={inc.severity === 'High' ? 'destructive' : 'secondary'} className="text-xs">{inc.severity}</Badge>
                      <Badge variant="outline" className="text-xs">{inc.status}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Server className="h-3 w-3" />{inc.service}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{inc.started}</span>
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" />{inc.team}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Impact: {inc.impact}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="escalation" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                {escalationSteps.map((s, i) => (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border min-w-[170px]">
                      <s.icon className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-foreground">{s.step}</p>
                        <p className="text-xs text-muted-foreground">{s.desc}</p>
                        <Badge variant="outline" className="text-xs mt-1">{s.time}</Badge>
                      </div>
                    </div>
                    {i < escalationSteps.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4 space-y-2">
          {recentResolved.map((inc, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">{inc.id}</Badge>
                      <span className="text-sm font-medium text-foreground">{inc.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{inc.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Root cause: {inc.rootCause}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Badge variant={inc.severity === 'High' ? 'destructive' : 'secondary'} className="text-xs">{inc.severity}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />MTTR: {inc.mttr}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IncidentReliabilityDashboard;
