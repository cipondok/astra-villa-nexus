import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { SEOHead } from '@/components/SEOHead';
import {
  useUnifiedSignals, useEngineHealth, useLearningMetrics, useRunFullPipelineScan,
  type UnifiedSignal, type SignalSource,
} from '@/hooks/useOpportunityDiscoveryEngine';
import { useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Radar, Zap, TrendingUp, TrendingDown, Target, Flame, Activity, Bot, Play,
  Loader2, Eye, Bell, RefreshCw, Brain, Gauge, BarChart3, ArrowUpRight,
  Filter, Crosshair, Radio, Wifi, Shield, ChevronRight, Sparkles,
  Clock, CheckCircle2, AlertTriangle, MapPin, DollarSign, Users,
  GitCompare, Settings2, Layers, Signal, Cpu, ScanSearch,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, RadarChart, Radar as ReRadar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { toast } from 'sonner';

const CHART_TOOLTIP = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 10,
    fontSize: 11,
    color: 'hsl(var(--popover-foreground))',
  },
};

const SOURCE_CONFIG: Record<SignalSource, { icon: React.ElementType; label: string; color: string; bg: string }> = {
  new_listing: { icon: Sparkles, label: 'New Listing', color: 'text-primary', bg: 'bg-primary/10' },
  price_drop: { icon: TrendingDown, label: 'Price Drop', color: 'text-chart-4', bg: 'bg-chart-4/10' },
  demand_heat: { icon: Flame, label: 'Demand Heat', color: 'text-destructive', bg: 'bg-destructive/10' },
  behavior_cluster: { icon: Users, label: 'Behavior', color: 'text-chart-2', bg: 'bg-chart-2/10' },
  deal_hunter: { icon: Crosshair, label: 'Deal Hunter', color: 'text-chart-1', bg: 'bg-chart-1/10' },
  investor_alert: { icon: Bell, label: 'Alert', color: 'text-chart-3', bg: 'bg-chart-3/10' },
};

const PIE_COLORS = [
  'hsl(var(--primary))', 'hsl(var(--chart-4))', 'hsl(var(--destructive))',
  'hsl(var(--chart-2))', 'hsl(var(--chart-1))', 'hsl(var(--chart-3))',
];

const urgencyGrade = (u: number) =>
  u >= 80 ? { label: 'CRITICAL', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/30' } :
  u >= 50 ? { label: 'HIGH', color: 'text-chart-3', bg: 'bg-chart-3/10 border-chart-3/30' } :
  u >= 25 ? { label: 'MEDIUM', color: 'text-primary', bg: 'bg-primary/10 border-primary/30' } :
  { label: 'LOW', color: 'text-muted-foreground', bg: 'bg-muted/30 border-border/50' };

/* ═══════════════════════════════════════
   ENGINE STATUS STRIP
   ═══════════════════════════════════════ */
const EngineStatusStrip: React.FC = () => {
  const { health, isLoading } = useEngineHealth();
  const pipelineScan = useRunFullPipelineScan();

  if (isLoading) return <Skeleton className="h-16 rounded-xl" />;

  const scannerPct = Math.round((health.activeScanners / health.totalScanners) * 100);

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-card/60 border border-border/40 backdrop-blur-sm">
      {/* Engine Pulse */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Cpu className="h-5 w-5 text-primary" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-chart-1 animate-pulse" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground">Discovery Engine</p>
          <p className="text-[10px] text-muted-foreground">
            {health.lastFullCycleAt ? `Last: ${formatDistanceToNow(new Date(health.lastFullCycleAt), { addSuffix: true })}` : 'Idle'}
          </p>
        </div>
      </div>

      <Separator orientation="vertical" className="h-8 hidden sm:block" />

      {/* KPI chips */}
      {[
        { icon: Signal, label: 'Signals', value: health.totalSignalsProcessed, color: 'text-primary' },
        { icon: Activity, label: 'Scanners', value: `${health.activeScanners}/${health.totalScanners}`, color: scannerPct >= 80 ? 'text-chart-1' : 'text-chart-3' },
        { icon: Gauge, label: 'Avg Response', value: `${health.avgResponseTimeMs}ms`, color: health.avgResponseTimeMs < 2000 ? 'text-chart-1' : 'text-chart-3' },
        { icon: Target, label: 'DNA Match', value: `${health.dnaMatchRate}%`, color: 'text-chart-2' },
        { icon: Bell, label: 'Delivery', value: `${health.alertDeliveryRate}%`, color: 'text-chart-1' },
      ].map(kpi => (
        <div key={kpi.label} className="flex items-center gap-1.5 min-w-0">
          <kpi.icon className={`h-3.5 w-3.5 ${kpi.color} shrink-0`} />
          <div>
            <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
            <p className="text-xs font-bold text-foreground">{kpi.value}</p>
          </div>
        </div>
      ))}

      <div className="ml-auto">
        <Button
          onClick={() => pipelineScan.mutate()}
          disabled={pipelineScan.isPending}
          size="sm"
          className="shadow-lg shadow-primary/20"
        >
          {pipelineScan.isPending
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Scanning...</>
            : <><ScanSearch className="h-3.5 w-3.5 mr-1.5" /> Full Pipeline Scan</>
          }
        </Button>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   SIGNAL FEED
   ═══════════════════════════════════════ */
const SignalFeed: React.FC<{ signals: UnifiedSignal[]; filterSource: SignalSource | 'all'; onFilterChange: (s: SignalSource | 'all') => void }> = ({
  signals, filterSource, onFilterChange,
}) => {
  const navigate = useNavigate();
  const filtered = filterSource === 'all' ? signals : signals.filter(s => s.source === filterSource);

  return (
    <div className="space-y-4">
      {/* Source filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={filterSource === 'all' ? 'default' : 'outline'}
          className="cursor-pointer text-xs"
          onClick={() => onFilterChange('all')}
        >
          All ({signals.length})
        </Badge>
        {(Object.keys(SOURCE_CONFIG) as SignalSource[]).map(src => {
          const conf = SOURCE_CONFIG[src];
          const count = signals.filter(s => s.source === src).length;
          if (count === 0) return null;
          return (
            <Badge
              key={src}
              variant={filterSource === src ? 'default' : 'outline'}
              className="cursor-pointer text-xs gap-1"
              onClick={() => onFilterChange(src)}
            >
              <conf.icon className="h-3 w-3" />
              {conf.label} ({count})
            </Badge>
          );
        })}
      </div>

      {/* Signal cards */}
      <ScrollArea className="h-[520px]">
        <div className="space-y-2 pr-2">
          <AnimatePresence mode="popLayout">
            {filtered.slice(0, 50).map((signal, i) => {
              const conf = SOURCE_CONFIG[signal.source];
              const urg = urgencyGrade(signal.urgency);
              const Icon = conf.icon;

              return (
                <motion.div
                  key={signal.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card
                    className="border-border/40 hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => signal.propertyId && navigate(`/properties/${signal.propertyId}`)}
                  >
                    <CardContent className="p-3 flex items-center gap-3">
                      {/* Source icon */}
                      <div className={`p-2 rounded-lg ${conf.bg} shrink-0`}>
                        <Icon className={`h-4 w-4 ${conf.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {signal.title}
                          </p>
                          <Badge variant="outline" className={`text-[9px] shrink-0 ${urg.bg} ${urg.color}`}>
                            {urg.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{signal.subtitle}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {signal.city && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                              <MapPin className="h-2.5 w-2.5" /> {signal.city}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" /> {formatDistanceToNow(new Date(signal.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      </div>

                      {/* Score ring */}
                      <div className="text-center shrink-0">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-black ${
                          signal.score >= 80 ? 'border-chart-1 text-chart-1' :
                          signal.score >= 50 ? 'border-primary text-primary' :
                          'border-muted-foreground text-muted-foreground'
                        }`}>
                          {signal.score}
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">Score</p>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <ScanSearch className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No signals detected for this filter</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

/* ═══════════════════════════════════════
   SIGNAL ANALYTICS
   ═══════════════════════════════════════ */
const SignalAnalytics: React.FC<{ signals: UnifiedSignal[] }> = ({ signals }) => {
  const { health } = useEngineHealth();

  const pieData = useMemo(() =>
    (Object.keys(SOURCE_CONFIG) as SignalSource[])
      .map(src => ({ name: SOURCE_CONFIG[src].label, value: health.signalSourceBreakdown[src] || 0 }))
      .filter(d => d.value > 0),
  [health]);

  const urgencyDistribution = useMemo(() => {
    const bands = { 'Critical (80+)': 0, 'High (50-79)': 0, 'Medium (25-49)': 0, 'Low (<25)': 0 };
    signals.forEach(s => {
      if (s.urgency >= 80) bands['Critical (80+)']++;
      else if (s.urgency >= 50) bands['High (50-79)']++;
      else if (s.urgency >= 25) bands['Medium (25-49)']++;
      else bands['Low (<25)']++;
    });
    return Object.entries(bands).map(([name, value]) => ({ name, value }));
  }, [signals]);

  const cityHeat = useMemo(() => {
    const map: Record<string, { count: number; avgScore: number; totalScore: number }> = {};
    signals.forEach(s => {
      const city = s.city || 'Unknown';
      if (!map[city]) map[city] = { count: 0, avgScore: 0, totalScore: 0 };
      map[city].count++;
      map[city].totalScore += s.score;
    });
    return Object.entries(map)
      .map(([city, d]) => ({ city, signals: d.count, avgScore: Math.round(d.totalScore / d.count) }))
      .sort((a, b) => b.signals - a.signals)
      .slice(0, 8);
  }, [signals]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Signal Source Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Signal Sources</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip {...CHART_TOOLTIP} />
              <Legend wrapperStyle={{ fontSize: 10 }} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Urgency Distribution */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Gauge className="h-4 w-4 text-chart-3" /> Urgency Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={urgencyDistribution} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* City Signal Concentration */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4 text-chart-1" /> City Signal Heat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cityHeat.map((c, i) => (
              <div key={c.city} className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground w-20 truncate">{c.city}</span>
                <Progress value={(c.signals / (cityHeat[0]?.signals || 1)) * 100} className="flex-1 h-2" />
                <span className="text-xs text-muted-foreground w-8 text-right">{c.signals}</span>
                <Badge variant="outline" className="text-[9px] w-10 justify-center">{c.avgScore}</Badge>
              </div>
            ))}
            {cityHeat.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No city data</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════
   DELIVERY CHANNELS PANEL
   ═══════════════════════════════════════ */
const DeliveryChannelsPanel: React.FC = () => {
  const { health } = useEngineHealth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [feedEnabled, setFeedEnabled] = useState(true);
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [digestFreq, setDigestFreq] = useState('weekly');

  const channels = [
    {
      title: 'Real-Time Push Notifications',
      desc: 'Instant alerts for critical & high-urgency opportunities',
      icon: Bell, enabled: pushEnabled, toggle: setPushEnabled,
      metric: `${health.alertDeliveryRate}% delivery rate`,
      detail: 'Triggered when urgency ≥ 50 and score ≥ 60',
    },
    {
      title: 'Personalized Feed Insertion',
      desc: 'AI-ranked deals injected into your discovery feed',
      icon: Sparkles, enabled: feedEnabled, toggle: setFeedEnabled,
      metric: `${health.feedInsertionRate}% insertion rate`,
      detail: 'DNA match ≥ 0.50 required for feed placement',
    },
    {
      title: 'Elite Opportunity Digest',
      desc: 'Curated summary of top deals delivered periodically',
      icon: Target, enabled: digestEnabled, toggle: setDigestEnabled,
      metric: digestFreq === 'weekly' ? 'Every Monday 8AM' : 'Every day 8AM',
      detail: 'Top 5-10 deals ranked by upside potential',
      extra: (
        <Select value={digestFreq} onValueChange={setDigestFreq}>
          <SelectTrigger className="w-28 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Radio className="h-5 w-5 text-primary" /> Alert Delivery Channels
      </h2>
      {channels.map(ch => (
        <Card key={ch.title} className="border-border/40">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-2.5 rounded-lg ${ch.enabled ? 'bg-primary/10' : 'bg-muted/30'}`}>
              <ch.icon className={`h-5 w-5 ${ch.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">{ch.title}</p>
                {ch.enabled && <Badge variant="outline" className="text-[9px] text-chart-1 border-chart-1/30">Active</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{ch.desc}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-muted-foreground">{ch.metric}</span>
                <span className="text-[10px] text-muted-foreground/60">· {ch.detail}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {ch.extra}
              <Switch checked={ch.enabled} onCheckedChange={ch.toggle} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════
   SELF-LEARNING LOOP PANEL
   ═══════════════════════════════════════ */
const SelfLearningPanel: React.FC = () => {
  const { data: metrics, isLoading } = useLearningMetrics();

  if (isLoading || !metrics) return <Skeleton className="h-64 rounded-xl" />;

  const radarData = Object.entries(metrics.currentWeights).map(([key, val]) => ({
    axis: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    weight: Math.round(val * 100),
  }));

  const engagementData = [
    { name: 'Engagement', value: metrics.engagementRate },
    { name: 'CTR', value: metrics.clickThroughRate },
    { name: 'Conversion', value: metrics.conversionRate },
    { name: 'False Positive', value: metrics.falsePositiveRate },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" /> Self-Learning Loop
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <Cpu className="h-3 w-3" /> Model v{metrics.modelVersion}
          </Badge>
          {metrics.lastCalibration && (
            <Badge variant="outline" className="text-xs text-muted-foreground">
              Calibrated {formatDistanceToNow(new Date(metrics.lastCalibration), { addSuffix: true })}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Scoring Weight Radar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Current Scoring Weights</CardTitle>
            <CardDescription className="text-xs">Auto-calibrated every 6 hours from engagement outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis domain={[0, 35]} tick={false} axisLine={false} />
                <ReRadar name="Weight %" dataKey="weight" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                <Tooltip {...CHART_TOOLTIP} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Engagement Outcomes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Engagement Outcomes</CardTitle>
            <CardDescription className="text-xs">Investor response to surfaced opportunities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {engagementData.map(d => (
              <div key={d.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className={`font-bold ${
                    d.name === 'False Positive' ? (d.value > 30 ? 'text-destructive' : 'text-chart-1') :
                    d.value >= 50 ? 'text-chart-1' : d.value >= 25 ? 'text-chart-3' : 'text-destructive'
                  }`}>{d.value}%</span>
                </div>
                <Progress value={d.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Threshold Adjustments Log */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" /> Recent Threshold Adjustments
            </CardTitle>
            <CardDescription className="text-xs">
              Autonomous recalibrations based on outcome monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Metric</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium text-xs">Before</th>
                    <th className="text-center py-2 px-3 text-muted-foreground font-medium text-xs">After</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium text-xs">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.thresholdAdjustments.map((adj, i) => (
                    <tr key={i} className="border-b border-border/30">
                      <td className="py-2 px-3 text-xs font-medium">{adj.metric}</td>
                      <td className="py-2 px-3 text-xs text-center text-muted-foreground">{adj.before}</td>
                      <td className="py-2 px-3 text-xs text-center font-bold text-primary">{adj.after}</td>
                      <td className="py-2 px-3 text-xs text-muted-foreground">{adj.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   PROCESS FLOW VISUALIZATION
   ═══════════════════════════════════════ */
const ProcessFlowPanel: React.FC = () => {
  const steps = [
    { icon: Wifi, title: 'Signal Ingestion', desc: 'New listings, price changes, demand spikes, behavior clusters', status: 'active' },
    { icon: Cpu, title: 'Score Computation', desc: 'Weighted composite: ROI 30% · Demand 20% · Undervalue 20% · Velocity 15% · Yield 10% · Luxury 5%', status: 'active' },
    { icon: Users, title: 'DNA Matching', desc: 'Profile alignment via location, type, budget, risk, style vectors — threshold ≥ 0.50', status: 'active' },
    { icon: BarChart3, title: 'Urgency Ranking', desc: 'Sort by urgency score × upside potential with time-decay weighting', status: 'active' },
    { icon: Radio, title: 'Alert Dispatch', desc: 'Push notifications (urgency ≥ 50), feed insertion (DNA ≥ 0.50), weekly digest (top 10)', status: 'active' },
    { icon: Brain, title: 'Learning Loop', desc: 'Monitor click/save/dismiss → recalibrate weights every 6h → adjust thresholds', status: 'active' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <GitCompare className="h-5 w-5 text-primary" /> Autonomous Process Flow
      </h2>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="border-border/40 h-full">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-chart-1 flex items-center justify-center">
                    <span className="text-[8px] font-black text-chart-1-foreground">{i + 1}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{step.desc}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════ */
const OpportunityDiscoveryEnginePage: React.FC = () => {
  const { signals, isLoading } = useUnifiedSignals();
  const [activeTab, setActiveTab] = useState('signals');
  const [filterSource, setFilterSource] = useState<SignalSource | 'all'>('all');

  // Top-level KPIs
  const eliteCount = signals.filter(s => s.score >= 80).length;
  const criticalCount = signals.filter(s => s.urgency >= 80).length;
  const avgScore = signals.length > 0 ? Math.round(signals.reduce((s, x) => s + x.score, 0) / signals.length) : 0;

  return (
    <>
      <SEOHead
        title="Autonomous Opportunity Discovery Engine | ASTRA Villa"
        description="AI-powered deal discovery engine that continuously scans property signals, matches investor DNA profiles, and delivers elite investment opportunities in real-time."
      />

      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-1/5" />
          <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-14">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3 max-w-3xl mx-auto">
              <Badge variant="outline" className="gap-1.5 px-3 py-1 text-xs border-primary/30">
                <Bot className="h-3.5 w-3.5 text-primary" /> Autonomous Intelligence
              </Badge>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                Opportunity <span className="text-primary">Discovery Engine</span>
              </h1>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                Continuously scans market signals, computes opportunity scores, matches investor DNA, and delivers elite deals — fully autonomous.
              </p>

              {/* Hero KPIs */}
              {!isLoading && (
                <div className="flex items-center justify-center gap-6 pt-3">
                  {[
                    { label: 'Live Signals', value: signals.length, icon: Signal, color: 'text-primary' },
                    { label: 'Elite Deals', value: eliteCount, icon: Flame, color: 'text-chart-1' },
                    { label: 'Critical Urgency', value: criticalCount, icon: AlertTriangle, color: 'text-destructive' },
                    { label: 'Avg Score', value: avgScore, icon: Target, color: 'text-chart-2' },
                  ].map(kpi => (
                    <div key={kpi.label} className="text-center">
                      <kpi.icon className={`h-4 w-4 ${kpi.color} mx-auto mb-0.5`} />
                      <p className="text-lg font-black text-foreground">{kpi.value}</p>
                      <p className="text-[10px] text-muted-foreground">{kpi.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Engine Status */}
          <EngineStatusStrip />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-5 h-10">
              <TabsTrigger value="signals" className="text-xs gap-1"><Signal className="h-3.5 w-3.5" /> Signals</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs gap-1"><BarChart3 className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
              <TabsTrigger value="flow" className="text-xs gap-1"><GitCompare className="h-3.5 w-3.5" /> Flow</TabsTrigger>
              <TabsTrigger value="delivery" className="text-xs gap-1"><Radio className="h-3.5 w-3.5" /> Delivery</TabsTrigger>
              <TabsTrigger value="learning" className="text-xs gap-1"><Brain className="h-3.5 w-3.5" /> Learning</TabsTrigger>
            </TabsList>

            <TabsContent value="signals">
              <SignalFeed signals={signals} filterSource={filterSource} onFilterChange={setFilterSource} />
            </TabsContent>

            <TabsContent value="analytics">
              <SignalAnalytics signals={signals} />
            </TabsContent>

            <TabsContent value="flow">
              <ProcessFlowPanel />
            </TabsContent>

            <TabsContent value="delivery">
              <DeliveryChannelsPanel />
            </TabsContent>

            <TabsContent value="learning">
              <SelfLearningPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default OpportunityDiscoveryEnginePage;
