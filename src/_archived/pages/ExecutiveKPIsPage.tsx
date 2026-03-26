import { motion } from 'framer-motion';
import {
  Activity, TrendingUp, Users, DollarSign, Clock, Target,
  ArrowUpRight, ArrowDownRight, RefreshCw, Zap, AlertTriangle,
  CheckCircle2, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar,
} from 'recharts';
import { useExecutiveKPIs, type ExecutiveKPI } from '@/hooks/useExecutiveKPIs';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const STATUS_MAP = {
  excellent: { color: 'text-chart-2', bg: 'bg-chart-2/10', border: 'border-chart-2/30', label: 'Excellent' },
  good: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', label: 'Good' },
  caution: { color: 'text-chart-4', bg: 'bg-chart-4/10', border: 'border-chart-4/30', label: 'Caution' },
  critical: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', label: 'Critical' },
};

const KPI_ICONS: Record<string, React.ElementType> = {
  liquidity_index: Activity,
  deal_velocity: Clock,
  retention_score: Users,
  revenue_momentum: DollarSign,
};

const CHART_TOOLTIP = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
  boxShadow: '0 8px 32px hsl(var(--foreground) / 0.08)',
};

export default function ExecutiveKPIsPage() {
  const { data, isLoading, refetch, dataUpdatedAt } = useExecutiveKPIs();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-44 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const kpis = [data.liquidity_index, data.deal_velocity, data.retention_score, data.revenue_momentum];

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 max-w-[1400px] mx-auto space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-chart-4" />
            Executive Performance KPIs
          </h1>
          <p className="text-xs text-muted-foreground">
            Strategic metrics for leadership decisions · Updated {dataUpdatedAt ? format(new Date(dataUpdatedAt), 'MMM d, HH:mm') : '—'}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </motion.div>

      {/* Scaling Readiness Gauge */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-border/40 overflow-hidden">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-28 h-28 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                  startAngle={180} endAngle={0}
                  data={[{ value: data.scaling_readiness, fill: data.scaling_readiness >= 60 ? 'hsl(var(--chart-2))' : data.scaling_readiness >= 35 ? 'hsl(var(--chart-4))' : 'hsl(var(--destructive))' }]}
                >
                  <RadialBar dataKey="value" cornerRadius={8} background={{ fill: 'hsl(var(--muted))' }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <p className="text-center -mt-10 text-lg font-bold text-foreground">{data.scaling_readiness}</p>
              <p className="text-center text-[9px] text-muted-foreground mt-0.5">READINESS</p>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-chart-4" /> Scaling Readiness Score
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Composite score from all 4 executive KPIs — measures platform readiness for next growth phase.
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {kpis.map(k => {
                  const s = STATUS_MAP[k.status];
                  return (
                    <Badge key={k.key} variant="outline" className={cn('text-[9px] gap-1', s.bg, s.border, s.color)}>
                      {k.label.split(' ')[0]}: {k.value}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={kpi.key} kpi={kpi} delay={0.1 + i * 0.06} />
        ))}
      </div>

      {/* Strategic Priority Areas */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-chart-4" /> Strategic Priority Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2">
            {data.priority_areas.map((area, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20 border border-border/30">
                <ChevronRight className="h-3.5 w-3.5 text-chart-4 mt-0.5 shrink-0" />
                <span className="text-xs text-foreground">{area}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function KPICard({ kpi, delay }: { kpi: ExecutiveKPI; delay: number }) {
  const Icon = KPI_ICONS[kpi.key] || Activity;
  const s = STATUS_MAP[kpi.status];
  const DirIcon = kpi.delta > 0 ? ArrowUpRight : kpi.delta < 0 ? ArrowDownRight : null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className={cn('border-border/40 overflow-hidden', s.border)}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', s.bg)}>
                <Icon className={cn('h-4 w-4', s.color)} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">{kpi.label}</p>
                <p className="text-[10px] text-muted-foreground">{kpi.unit}</p>
              </div>
            </div>
            <Badge variant="outline" className={cn('text-[9px]', s.bg, s.border, s.color)}>
              {s.label}
            </Badge>
          </div>

          {/* Score + Delta */}
          <div className="flex items-end gap-3 mb-2">
            <span className="text-3xl font-bold text-foreground">{kpi.value}</span>
            <span className="text-xs text-muted-foreground mb-1">/100</span>
            {kpi.delta !== 0 && (
              <div className="flex items-center gap-0.5 mb-1 ml-auto">
                {DirIcon && <DirIcon className={cn('h-3.5 w-3.5', kpi.delta > 0 ? 'text-chart-2' : 'text-destructive')} />}
                <span className={cn('text-xs font-medium', kpi.delta > 0 ? 'text-chart-2' : 'text-destructive')}>
                  {kpi.delta > 0 ? '+' : ''}{kpi.delta}%
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <Progress value={kpi.value} className="h-1.5 mb-3" />

          {/* Mini trend chart */}
          <div className="h-16 mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpi.trend}>
                <defs>
                  <linearGradient id={`grad-${kpi.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip contentStyle={CHART_TOOLTIP} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill={`url(#grad-${kpi.key})`} strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Insight */}
          <div className="flex items-start gap-1.5 p-2 rounded-md bg-muted/20">
            <CheckCircle2 className={cn('h-3 w-3 mt-0.5 shrink-0', s.color)} />
            <span className="text-[10px] text-muted-foreground leading-tight">{kpi.insight}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
