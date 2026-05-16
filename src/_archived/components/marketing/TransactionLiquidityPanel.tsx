import { motion } from 'framer-motion';
import {
  Droplets, Users, Building2, Sparkles, DollarSign, Clock,
  MapPin, BarChart3, TrendingUp, TrendingDown, Minus,
  ChevronRight, AlertTriangle, Zap, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { useTransactionLiquidity, LIQUIDITY_HEALTH_META, type LiquidityAction } from '@/hooks/useTransactionLiquidity';
import { cn } from '@/lib/utils';

const ACTION_ICONS: Record<string, React.ElementType> = {
  users: Users,
  sparkles: Sparkles,
  'dollar-sign': DollarSign,
  clock: Clock,
  'map-pin': MapPin,
  'bar-chart': BarChart3,
};

const IMPACT_STYLES: Record<string, string> = {
  high: 'border-destructive/30 bg-destructive/5',
  medium: 'border-chart-4/30 bg-chart-4/5',
  low: 'border-chart-2/30 bg-chart-2/5',
};

const CHART_TOOLTIP_STYLE = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
  boxShadow: '0 8px 32px hsl(var(--foreground) / 0.08)',
};

interface Props {
  period?: number;
}

export default function TransactionLiquidityPanel({ period = 30 }: Props) {
  const { data, isLoading } = useTransactionLiquidity(period);

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

  const { metrics: m, actions, supply_demand_daily } = data;
  const meta = LIQUIDITY_HEALTH_META[m.health];

  const VelocityIcon = m.velocity_trend === 'accelerating' ? TrendingUp
    : m.velocity_trend === 'decelerating' ? TrendingDown : Minus;

  return (
    <div className="space-y-4">
      {/* Health Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-border/40">
          <div className={cn('absolute inset-0 opacity-[0.03]', meta.bgColor)} />
          <CardContent className="p-4 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className={cn('h-5 w-5', meta.color)} />
                  <span className={cn('text-lg font-bold', meta.color)}>{meta.label}</span>
                  <Badge variant="outline" className="text-[10px] h-5">
                    Score: {m.liquidity_score}/100
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{meta.description}</p>
                <Progress value={m.liquidity_score} className="h-2 mb-4" />

                {/* KPI Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <KPI label="Total Listings" value={m.total_listings.toLocaleString()} icon={Building2} />
                  <KPI label="Active Investors" value={m.active_investors.toLocaleString()} icon={Users} />
                  <KPI label="S/D Ratio" value={`${m.supply_demand_ratio}x`} icon={Activity}
                    highlight={m.supply_demand_ratio > 3 ? 'destructive' : m.supply_demand_ratio < 0.5 ? 'chart-5' : undefined} />
                  <KPI label="Conversion Rate" value={`${m.inquiry_conversion_rate}%`} icon={Zap}
                    highlight={m.inquiry_conversion_rate < 5 ? 'destructive' : undefined} />
                </div>
              </div>

              {/* Velocity */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  <VelocityIcon className={cn('h-4 w-4',
                    m.velocity_trend === 'accelerating' ? 'text-chart-2' :
                    m.velocity_trend === 'decelerating' ? 'text-destructive' : 'text-muted-foreground'
                  )} />
                  <span className="text-[10px] text-muted-foreground capitalize">{m.velocity_trend}</span>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{m.new_inquiries_7d}</p>
                  <p className="text-[9px] text-muted-foreground">Inquiries (7d)</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{m.new_listings_7d}</p>
                  <p className="text-[9px] text-muted-foreground">New Listings (7d)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Supply vs Demand Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Supply vs Demand Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={supply_demand_daily}>
                  <defs>
                    <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="listings" name="New Listings" stroke="hsl(var(--chart-4))" fill="url(#supplyGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="inquiries" name="Inquiries" stroke="hsl(var(--chart-2))" fill="url(#demandGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quality Metrics */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-chart-4" />
              Marketplace Quality Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2.5">
            <SignalBar label="Elite Opportunity Share" value={Math.min(m.high_opportunity_share * 2, 100)} detail={`${m.high_opportunity_listings} listings (${m.high_opportunity_share}%)`} />
            <SignalBar label="Pricing Quality" value={m.pricing_quality_score} detail={`Score: ${m.pricing_quality_score}/100`} />
            <SignalBar label="Time to First Inquiry" value={Math.max(0, 100 - m.avg_days_to_first_inquiry * 10)} detail={`${m.avg_days_to_first_inquiry} days avg`} />
            <SignalBar label="Trending Zone Coverage" value={Math.min(m.trending_zone_count * 10, 100)} detail={`${m.trending_zone_count} zones`} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Optimization Actions */}
      {actions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-chart-2" />
                Liquidity Optimization Actions
                <Badge variant="secondary" className="text-[9px] h-4 ml-auto">
                  {actions.length} actions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-2">
              {actions.map((action, i) => (
                <ActionCard key={action.id} action={action} index={i} />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function KPI({ label, value, icon: Icon, highlight }: { label: string; value: string; icon: React.ElementType; highlight?: string }) {
  return (
    <div className="text-center">
      <Icon className="h-3.5 w-3.5 mx-auto mb-1 text-muted-foreground" />
      <p className={cn('text-lg font-bold', highlight ? `text-${highlight}` : 'text-foreground')}>{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ActionCard({ action, index }: { action: LiquidityAction; index: number }) {
  const Icon = ACTION_ICONS[action.icon_key] || AlertTriangle;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className={cn('rounded-lg border p-2.5 flex items-start gap-2.5', IMPACT_STYLES[action.impact])}
    >
      <div className="h-7 w-7 rounded-md bg-background/80 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-semibold text-foreground">{action.title}</span>
          <Badge variant="outline" className={cn(
            'text-[8px] h-3.5 px-1',
            action.impact === 'high' ? 'border-destructive/40 text-destructive' :
            action.impact === 'medium' ? 'border-chart-4/40 text-chart-4' : 'border-chart-2/40 text-chart-2'
          )}>
            {action.impact}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">{action.description}</p>
      </div>
      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-1" />
    </motion.div>
  );
}

function SignalBar({ label, value, detail }: { label: string; value: number; detail: string }) {
  const clamped = Math.round(Math.max(0, Math.min(100, value)));
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium text-foreground">{label}</span>
        <span className="text-[9px] text-muted-foreground">{detail}</span>
      </div>
      <Progress value={clamped} className="h-1.5" />
    </div>
  );
}
