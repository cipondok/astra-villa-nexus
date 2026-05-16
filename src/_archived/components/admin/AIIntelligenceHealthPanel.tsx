import React from 'react';
import { useAIHealthMetrics, useAIReadinessScore, useReadinessHistory } from '@/hooks/useAIHealthMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain, Activity, AlertTriangle, CheckCircle2, Clock, Gauge,
  TrendingUp, Database, Cpu, Shield, Zap, BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip,
  RadialBarChart, RadialBar, PieChart, Pie, Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

const CHART_TOOLTIP = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
};

const scoreColor = (v: number) =>
  v >= 80 ? 'text-chart-1' : v >= 50 ? 'text-chart-2' : 'text-destructive';

const scoreBadge = (v: number) =>
  v >= 80 ? 'Healthy' : v >= 50 ? 'Fair' : 'Critical';

const CoverageBar = ({ label, pct, icon: Icon }: { label: string; pct: number; icon: React.ElementType }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5" /> {label}
      </span>
      <span className={`text-xs font-bold ${scoreColor(pct)}`}>{pct.toFixed(1)}%</span>
    </div>
    <Progress value={pct} className="h-2" />
  </div>
);

const AIIntelligenceHealthPanel = () => {
  const { data: health, isLoading: healthLoading } = useAIHealthMetrics();
  const { data: readiness, isLoading: readinessLoading } = useAIReadinessScore();
  const { data: history = [] } = useReadinessHistory();

  if (healthLoading || readinessLoading || !health || !readiness) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  const gaugeData = [{ name: 'Score', value: readiness.readiness_score, fill: readiness.readiness_score >= 80 ? 'hsl(var(--chart-1))' : readiness.readiness_score >= 50 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))' }];
  const coverageData = [
    { name: 'Scored', value: readiness.coverage_scored, fill: 'hsl(var(--chart-1))' },
    { name: 'ROI', value: readiness.coverage_roi, fill: 'hsl(var(--chart-2))' },
    { name: 'Deal', value: readiness.coverage_deal, fill: 'hsl(var(--chart-3))' },
    { name: 'Insight', value: readiness.coverage_insight, fill: 'hsl(var(--chart-4))' },
  ];

  return (
    <div className="space-y-4">
      {/* Readiness Score Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Gauge */}
              <div className="w-44 h-44 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} data={gaugeData}>
                    <RadialBar dataKey="value" cornerRadius={12} background={{ fill: 'hsl(var(--muted))' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${scoreColor(readiness.readiness_score)}`}>
                    {readiness.readiness_score.toFixed(0)}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">AI READINESS</span>
                  <Badge variant="outline" className={`mt-1 text-[9px] ${scoreColor(readiness.readiness_score)}`}>
                    {scoreBadge(readiness.readiness_score)}
                  </Badge>
                </div>
              </div>

              {/* Component scores */}
              <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                <CoverageBar label="Investment Scores" pct={readiness.coverage_scored} icon={TrendingUp} />
                <CoverageBar label="ROI Forecasts" pct={readiness.coverage_roi} icon={BarChart3} />
                <CoverageBar label="Deal Analysis" pct={readiness.coverage_deal} icon={Zap} />
                <CoverageBar label="AI Insights" pct={readiness.coverage_insight} icon={Brain} />
                <CoverageBar label="Cache Freshness" pct={readiness.freshness_avg} icon={Clock} />
                <CoverageBar label="Job Success Rate" pct={readiness.job_success_rate} icon={CheckCircle2} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard icon={Cpu} label="Pending Jobs" value={health.pending_jobs.toString()} color={health.pending_jobs > 5 ? 'text-chart-2' : 'text-chart-1'} />
        <MetricCard icon={Activity} label="Running Jobs" value={health.running_jobs.toString()} color="text-chart-1" />
        <MetricCard icon={Clock} label="Avg Latency" value={`${health.avg_latency_sec.toFixed(0)}s`} color={health.avg_latency_sec > 60 ? 'text-destructive' : 'text-chart-1'} />
        <MetricCard icon={AlertTriangle} label="Alerts (24h)" value={health.alert_freq_24h.toString()} color="text-chart-2" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Readiness Trend */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gauge className="h-4 w-4 text-primary" /> Readiness Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history.map((h: any) => ({ date: new Date(h.computed_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }), score: Number(h.readiness_score) }))}>
                  <defs>
                    <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#readinessGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Coverage Distribution */}
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" /> Intelligence Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={coverageData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value.toFixed(0)}%`}>
                    {coverageData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stale Intelligence Warnings */}
      {health.stale_items.length > 0 && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" /> Stale Intelligence Warnings ({health.stale_items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {health.stale_items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg bg-background/60 text-xs">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px]">{item.type}</Badge>
                      <span className="text-muted-foreground font-mono text-[10px]">{item.property_id?.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{formatDistanceToNow(new Date(item.last_computed), { addSuffix: true })}</span>
                      <Badge variant="destructive" className="text-[9px]">Freshness: {item.freshness.toFixed(0)}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
    <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-muted/50">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default AIIntelligenceHealthPanel;
