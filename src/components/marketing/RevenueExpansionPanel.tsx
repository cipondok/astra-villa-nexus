import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, Minus, Percent, Building2,
  Crown, Store, ChevronRight, Layers, Grid3X3, Database,
  PieChart as PieChartIcon, BarChart3, Shield, Zap,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import {
  useRevenueExpansion, STREAM_META,
  type RevenueStream, type ScalingInsight,
} from '@/hooks/useRevenueExpansion';
import { cn } from '@/lib/utils';

const STREAM_ICONS: Record<string, React.ElementType> = {
  percent: Percent, building: Building2, crown: Crown, store: Store,
  'trending-up': TrendingUp, layers: Layers, grid: Grid3X3, database: Database,
};

const CHART_TOOLTIP_STYLE = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
  boxShadow: '0 8px 32px hsl(var(--foreground) / 0.08)',
};

const PIE_COLORS = [
  'hsl(var(--chart-4))',
  'hsl(var(--chart-2))',
  'hsl(var(--primary))',
  'hsl(var(--chart-5))',
];

function formatIDR(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString();
}

export default function RevenueExpansionPanel() {
  const { data, isLoading } = useRevenueExpansion();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 rounded-xl bg-muted/30 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const totalDelta = data.total_delta;
  const TrendIcon = totalDelta > 0 ? TrendingUp : totalDelta < 0 ? TrendingDown : Minus;

  return (
    <div className="space-y-4">
      {/* Revenue Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-border/40">
          <div className="absolute inset-0 opacity-[0.03] bg-chart-4/10" />
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="h-5 w-5 text-chart-4" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Revenue Expansion Engine
                  </span>
                </div>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    IDR {formatIDR(data.total_current)}
                  </span>
                  <div className="flex items-center gap-1 mb-1">
                    <TrendIcon className={cn('h-4 w-4',
                      totalDelta > 0 ? 'text-chart-2' : totalDelta < 0 ? 'text-destructive' : 'text-muted-foreground'
                    )} />
                    <span className={cn('text-sm font-bold',
                      totalDelta > 0 ? 'text-chart-2' : totalDelta < 0 ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      {totalDelta > 0 ? '+' : ''}{totalDelta}%
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mb-1.5">vs prev 30d</span>
                </div>

                {/* Diversification */}
                <div className="max-w-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Shield className="h-3 w-3" /> Diversification Score
                    </span>
                    <span className="text-[10px] font-semibold text-foreground">
                      {data.diversification_score}/100
                    </span>
                  </div>
                  <Progress value={data.diversification_score} className="h-1.5" />
                  <p className="text-[9px] text-muted-foreground mt-0.5">
                    HHI: {data.revenue_concentration} — {data.diversification_score >= 60 ? 'Well diversified' : data.diversification_score >= 35 ? 'Moderately concentrated' : 'Highly concentrated'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground mb-0.5">Previous 30d</p>
                <p className="text-2xl font-bold text-muted-foreground/50">
                  IDR {formatIDR(data.total_previous)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">{data.streams.length} Active Streams</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Stream Cards */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Revenue Stream Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.streams.map((stream, i) => (
                <StreamCard key={stream.key} stream={stream} index={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Composition Pie + Projected Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-border/40 h-full">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-chart-4" />
                Revenue Composition
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.streams.filter(s => s.current_revenue > 0)}
                      dataKey="current_revenue"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      paddingAngle={2}
                      label={({ label, current_revenue }) => `${label.split(' ')[0]} ${formatIDR(current_revenue)}`}
                    >
                      {data.streams.filter(s => s.current_revenue > 0).map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => `IDR ${formatIDR(v)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 12-Month Projection */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          <Card className="border-border/40 h-full">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-chart-2" />
                12-Month Revenue Projection
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.monthly_projections}>
                    <defs>
                      <linearGradient id="revTotalGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => formatIDR(v)} />
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} formatter={(v: number) => `IDR ${formatIDR(v)}`} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Area type="monotone" dataKey="commissions" name="Commissions" stackId="a" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="developer_packages" name="Developer" stackId="a" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="subscriptions" name="Subscriptions" stackId="a" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="service_marketplace" name="Services" stackId="a" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Scaling Insights */}
      {data.scaling_insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-chart-2" />
                Revenue Scaling Actions
                <Badge variant="secondary" className="text-[9px] h-4 ml-auto">
                  {data.scaling_insights.length} opportunities
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-2">
              {data.scaling_insights.map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} index={i} />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function StreamCard({ stream, index }: { stream: RevenueStream; index: number }) {
  const Icon = STREAM_ICONS[stream.icon_key] || DollarSign;
  const meta = STREAM_META[stream.key];
  const DirIcon = stream.direction === 'up' ? TrendingUp : stream.direction === 'down' ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index }}
      className="rounded-lg border border-border/30 p-3 bg-card/50"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className={cn('h-4 w-4', meta.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-foreground truncate">{stream.label}</p>
          <Badge variant="outline" className="text-[8px] h-3.5 capitalize">{stream.category}</Badge>
        </div>
        <div className="flex items-center gap-0.5">
          <DirIcon className={cn('h-3 w-3',
            stream.direction === 'up' ? 'text-chart-2' : stream.direction === 'down' ? 'text-destructive' : 'text-muted-foreground'
          )} />
          <span className={cn('text-[10px] font-medium',
            stream.direction === 'up' ? 'text-chart-2' : stream.direction === 'down' ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {stream.delta_percent > 0 ? '+' : ''}{stream.delta_percent}%
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-bold text-foreground">IDR {formatIDR(stream.current_revenue)}</p>
          <p className="text-[9px] text-muted-foreground">30d revenue</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{stream.volume_metric}</p>
          <p className="text-[9px] text-muted-foreground">{stream.volume_label}</p>
        </div>
      </div>

      {stream.avg_value > 0 && (
        <p className="text-[9px] text-muted-foreground mt-1.5">
          Avg value: IDR {formatIDR(stream.avg_value)} per {stream.volume_label.toLowerCase().replace(/s$/, '')}
        </p>
      )}
    </motion.div>
  );
}

const IMPACT_STYLES: Record<string, string> = {
  high: 'border-destructive/30 bg-destructive/5',
  medium: 'border-chart-4/30 bg-chart-4/5',
  low: 'border-chart-2/30 bg-chart-2/5',
};

function InsightCard({ insight, index }: { insight: ScalingInsight; index: number }) {
  const Icon = STREAM_ICONS[insight.icon_key] || Zap;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.04 * index }}
      className={cn('rounded-lg border p-2.5 flex items-start gap-2.5', IMPACT_STYLES[insight.impact])}
    >
      <div className="h-7 w-7 rounded-md bg-background/80 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-semibold text-foreground">{insight.title}</span>
          <Badge variant="outline" className={cn('text-[8px] h-3.5 px-1',
            insight.impact === 'high' ? 'border-destructive/40 text-destructive' : 'border-chart-4/40 text-chart-4'
          )}>
            {insight.impact}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{insight.description}</p>
        {insight.potential_revenue > 0 && (
          <p className="text-[9px] font-medium text-chart-2 mt-0.5">
            +IDR {formatIDR(insight.potential_revenue)} potential
          </p>
        )}
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
    </motion.div>
  );
}
