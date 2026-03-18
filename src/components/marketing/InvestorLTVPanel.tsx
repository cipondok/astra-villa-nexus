import { motion } from 'framer-motion';
import {
  DollarSign, Users, TrendingUp, Clock, Shield, Bell,
  ArrowUp, ChevronRight, BarChart3, Target, Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import {
  useInvestorLTV, SEGMENT_META,
  type SegmentStats, type RetentionInsight, type InvestorProfile,
} from '@/hooks/useInvestorLTV';
import { cn } from '@/lib/utils';

const INSIGHT_ICONS: Record<string, React.ElementType> = {
  shield: Shield, bell: Bell, 'arrow-up': ArrowUp, clock: Clock,
};

const SEGMENT_CHART_COLORS = [
  'hsl(var(--chart-4))',   // whale
  'hsl(var(--primary))',   // high_value
  'hsl(var(--chart-2))',   // moderate
  'hsl(var(--chart-5))',   // casual
  'hsl(var(--muted-foreground))', // dormant
];

const CHART_TOOLTIP_STYLE = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
  boxShadow: '0 8px 32px hsl(var(--foreground) / 0.08)',
};

function formatIDR(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toLocaleString();
}

export default function InvestorLTVPanel() {
  const { data, isLoading } = useInvestorLTV();

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

  return (
    <div className="space-y-4">
      {/* LTV Overview Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-border/40">
          <div className="absolute inset-0 opacity-[0.03] bg-primary/10" />
          <CardContent className="p-5 relative">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-5 w-5 text-chart-4" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Investor Lifetime Value Model
              </span>
              <Badge variant="outline" className="text-[9px] h-4 ml-2">
                {data.projected_lifecycle_years}-Year Projection
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
              <KPICell label="Platform Avg LTV" value={`IDR ${formatIDR(data.platform_avg_ltv)}`} icon={DollarSign} />
              <KPICell label="Median LTV" value={`IDR ${formatIDR(data.median_ltv)}`} icon={BarChart3} />
              <KPICell label="Total Investors" value={data.total_investor_count.toLocaleString()} icon={Users} />
              <KPICell label="Avg Rev / Deal" value={`IDR ${formatIDR(data.avg_revenue_per_deal)}`} icon={Target} />
              <KPICell label="Avg Deals / Investor" value={`${data.avg_deals_per_investor}`} icon={TrendingUp} />
              <KPICell label="Avg Tenure" value={`${data.avg_tenure_months} mo`} icon={Clock} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Segment Breakdown + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <Card className="border-border/40 h-full">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Segment Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.segments.filter(s => s.count > 0)}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={45}
                      paddingAngle={2}
                      label={({ label, pct }) => `${label} ${pct}%`}
                    >
                      {data.segments.filter(s => s.count > 0).map((s, i) => {
                        const idx = ['whale', 'high_value', 'moderate', 'casual', 'dormant'].indexOf(s.segment);
                        return <Cell key={s.segment} fill={SEGMENT_CHART_COLORS[idx >= 0 ? idx : i]} />;
                      })}
                    </Pie>
                    <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Card className="border-border/40 h-full">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-chart-4" />
                Segment Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-2">
              {data.segments.map((seg, i) => {
                const meta = SEGMENT_META[seg.segment];
                return (
                  <motion.div
                    key={seg.segment}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className={cn('rounded-lg border border-border/30 p-2.5 flex items-center gap-3', meta.bgColor)}
                  >
                    <span className="text-lg">{meta.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('text-xs font-semibold', meta.color)}>{meta.label}</span>
                        <Badge variant="outline" className="text-[8px] h-3.5">{seg.count} users</Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground">
                        Avg LTV: IDR {formatIDR(seg.avg_ltv)} · {seg.avg_deals} deals · {seg.avg_tenure_months}mo tenure
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-foreground">IDR {formatIDR(seg.total_revenue)}</p>
                      <p className="text-[9px] text-muted-foreground">total rev</p>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* LTV Distribution Histogram */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-chart-2" />
              LTV Distribution (IDR)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.distribution} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Bar dataKey="count" name="Investors" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Retention Priority Actions */}
      {data.retention_insights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Shield className="h-4 w-4 text-chart-4" />
                Retention & Growth Actions
                <Badge variant="secondary" className="text-[9px] h-4 ml-auto">
                  {data.retention_insights.length} actions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-2">
              {data.retention_insights.map((insight, i) => (
                <InsightCard key={insight.id} insight={insight} index={i} />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function KPICell({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="text-center">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-1.5">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <p className="text-sm font-bold text-foreground">{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}

const IMPACT_STYLES: Record<string, string> = {
  high: 'border-destructive/30 bg-destructive/5',
  medium: 'border-chart-4/30 bg-chart-4/5',
  low: 'border-chart-2/30 bg-chart-2/5',
};

function InsightCard({ insight, index }: { insight: RetentionInsight; index: number }) {
  const Icon = INSIGHT_ICONS[insight.icon_key] || Shield;
  const segMeta = SEGMENT_META[insight.segment_target];
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
          <Badge variant="outline" className={cn('text-[8px] h-3.5 px-1', segMeta.color)}>
            {segMeta.emoji} {segMeta.label}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{insight.description}</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
    </motion.div>
  );
}
