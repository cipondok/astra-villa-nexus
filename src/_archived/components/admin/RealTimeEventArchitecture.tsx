import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Radio, Bell, Database, ArrowRight, Activity, Clock, AlertTriangle, Wifi } from 'lucide-react';
import { motion } from 'framer-motion';

const eventSources = [
  { event: 'New Listing Created', trigger: 'INSERT on properties', channels: ['search-index', 'agent-notifications', 'analytics'], latency: '12ms', volume: '~340/day' },
  { event: 'Buyer Inquiry Submitted', trigger: 'INSERT on inquiries', channels: ['agent-alert', 'seller-notify', 'crm-sync'], latency: '8ms', volume: '~890/day' },
  { event: 'Viewing Scheduled', trigger: 'INSERT on viewings', channels: ['calendar-sync', 'reminder-queue', 'analytics'], latency: '15ms', volume: '~220/day' },
  { event: 'Offer Placed', trigger: 'INSERT on offers', channels: ['deal-pipeline', 'seller-alert', 'agent-notify'], latency: '10ms', volume: '~95/day' },
  { event: 'Deal Stage Updated', trigger: 'UPDATE on deals.stage', channels: ['timeline-broadcast', 'participant-notify', 'audit-log'], latency: '11ms', volume: '~180/day' },
  { event: 'Payment Confirmed', trigger: 'UPDATE on payments.status', channels: ['escrow-release', 'receipt-gen', 'commission-calc'], latency: '18ms', volume: '~45/day' },
  { event: 'Negotiation Message', trigger: 'INSERT on negotiations', channels: ['chat-realtime', 'push-notify', 'sentiment-ai'], latency: '6ms', volume: '~1,200/day' },
];

const pipelineStages = [
  { stage: 'Event Source', desc: 'Database triggers on INSERT/UPDATE', icon: Database, color: 'text-primary' },
  { stage: 'Signal Emission', desc: 'emit_ai_signal() with 2-min dedup', icon: Zap, color: 'text-amber-500' },
  { stage: 'Event Bus', desc: 'ai_event_signals claim & dispatch', icon: Radio, color: 'text-emerald-500' },
  { stage: 'Realtime Broadcast', desc: 'Supabase Realtime WebSocket channels', icon: Wifi, color: 'text-blue-500' },
  { stage: 'Notification Delivery', desc: 'In-app, push, email routing', icon: Bell, color: 'text-purple-500' },
  { stage: 'Persistence Log', desc: 'activity_logs + audit trail', icon: Database, color: 'text-muted-foreground' },
];

const RealTimeEventArchitecture = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Real-Time Event Architecture</h2>
          <Badge variant="outline">⚡ Event-Driven</Badge>
        </div>
        <p className="text-muted-foreground text-sm">How user and marketplace actions generate live platform updates through event streaming</p>
      </motion.div>

      {/* Performance KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Event Throughput', value: '~2,970/day', sub: '~2.1/min avg' },
          { label: 'Avg Latency', value: '11.4ms', sub: 'p99 < 50ms' },
          { label: 'Active Channels', value: '7', sub: 'WebSocket streams' },
          { label: 'Dedup Window', value: '2 min', sub: 'Signal collision prevention' },
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

      {/* Event Pipeline Flow */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Event Processing Pipeline</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {pipelineStages.map((s, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border min-w-[160px]">
                  <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{s.stage}</p>
                    <p className="text-xs text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
                {i < pipelineStages.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Sources Table */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Event Source Registry</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {eventSources.map((e, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <Zap className="h-4 w-4 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{e.event}</p>
                <p className="text-xs text-muted-foreground font-mono">{e.trigger}</p>
              </div>
              <div className="flex flex-wrap gap-1 max-w-[240px]">
                {e.channels.map((c, ci) => (
                  <Badge key={ci} variant="secondary" className="text-xs">{c}</Badge>
                ))}
              </div>
              <div className="text-right shrink-0 hidden md:block">
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{e.latency}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Activity className="h-3 w-3" />{e.volume}</p>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Event Queue Depth</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">3</p>
            <p className="text-xs text-muted-foreground">pending signals</p>
            <Progress value={3} max={100} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">WebSocket Connections</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">142</p>
            <p className="text-xs text-muted-foreground">active subscribers</p>
            <Progress value={14} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Failed Deliveries</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-500">0</p>
            <p className="text-xs text-muted-foreground">last 24h</p>
            <Progress value={0} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeEventArchitecture;
