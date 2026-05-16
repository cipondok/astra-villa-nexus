import { motion } from 'framer-motion';
import {
  Gauge, Clock, MessageCircle, Zap, DollarSign, Bell,
  TrendingUp, TrendingDown, Minus, ChevronRight, AlertTriangle,
  ArrowRight, Activity, Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar,
} from 'recharts';
import { useDealVelocity, VELOCITY_HEALTH_META, type VelocityIntervention, type StageMetrics } from '@/hooks/useDealVelocity';
import { cn } from '@/lib/utils';

const ACTION_ICONS: Record<string, React.ElementType> = {
  clock: Clock,
  'message-circle': MessageCircle,
  zap: Zap,
  bell: Bell,
  'dollar-sign': DollarSign,
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

export default function DealVelocityPanel({ period = 30 }: Props) {
  const { data, isLoading } = useDealVelocity(period);

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

  const { metrics: m, stages, interventions, daily_trend } = data;
  const meta = VELOCITY_HEALTH_META[m.health];

  const TrendIcon = m.velocity_trend === 'accelerating' ? TrendingUp
    : m.velocity_trend === 'decelerating' ? TrendingDown : Minus;

  return (
    <div className="space-y-4">
      {/* Velocity Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-border/40">
          <div className={cn('absolute inset-0 opacity-[0.03]', meta.bgColor)} />
          <CardContent className="p-4 relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Gauge className={cn('h-5 w-5', meta.color)} />
                  <span className={cn('text-lg font-bold', meta.color)}>{meta.label}</span>
                  <Badge variant="outline" className="text-[10px] h-5">
                    Score: {m.velocity_score}/100
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{meta.description}</p>
                <Progress value={m.velocity_score} className="h-2 mb-4" />

                {/* Cycle Time KPIs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <CycleKPI
                    label="Avg Response Time"
                    value={m.avg_inquiry_to_response_hours < 24
                      ? `${m.avg_inquiry_to_response_hours.toFixed(0)}h`
                      : `${(m.avg_inquiry_to_response_hours / 24).toFixed(1)}d`}
                    status={m.avg_inquiry_to_response_hours <= 4 ? 'good' : m.avg_inquiry_to_response_hours <= 24 ? 'warn' : 'bad'}
                  />
                  <CycleKPI
                    label="Inquiry → Offer"
                    value={`${m.avg_inquiry_to_offer_days}d`}
                    status={m.avg_inquiry_to_offer_days <= 5 ? 'good' : m.avg_inquiry_to_offer_days <= 14 ? 'warn' : 'bad'}
                  />
                  <CycleKPI
                    label="Offer → Close"
                    value={`${m.avg_offer_to_close_days}d`}
                    status={m.avg_offer_to_close_days <= 14 ? 'good' : m.avg_offer_to_close_days <= 30 ? 'warn' : 'bad'}
                  />
                  <CycleKPI
                    label="Total Cycle"
                    value={`${m.avg_total_cycle_days}d`}
                    status={m.avg_total_cycle_days <= 21 ? 'good' : m.avg_total_cycle_days <= 45 ? 'warn' : 'bad'}
                  />
                </div>
              </div>

              {/* Volume + Trend */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  <TrendIcon className={cn('h-4 w-4',
                    m.velocity_trend === 'accelerating' ? 'text-chart-2' :
                    m.velocity_trend === 'decelerating' ? 'text-destructive' : 'text-muted-foreground'
                  )} />
                  <span className="text-[10px] text-muted-foreground capitalize">{m.velocity_trend}</span>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">{m.total_closed_period}</p>
                  <p className="text-[9px] text-muted-foreground">Deals Closed</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">{m.overall_conversion_rate}%</p>
                  <p className="text-[9px] text-muted-foreground">Overall Conv.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stage Funnel */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Deal Progression Funnel
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="flex items-center gap-1">
              {stages.map((stage, i) => (
                <div key={stage.stage} className="flex items-center gap-1 flex-1">
                  <div className={cn(
                    'flex-1 rounded-lg p-2.5 border transition-colors',
                    stage.count > 0 ? 'border-primary/20 bg-primary/[0.03]' : 'border-border/30 bg-muted/30',
                  )}>
                    <p className="text-[10px] font-medium text-muted-foreground mb-0.5">{stage.label}</p>
                    <p className="text-lg font-bold text-foreground">{stage.count}</p>
                    {stage.stage !== 'closed' && (
                      <p className="text-[9px] text-muted-foreground mt-0.5">
                        {stage.conversion_rate.toFixed(0)}% conv.
                      </p>
                    )}
                    {stage.avg_duration_hours > 0 && (
                      <p className="text-[9px] text-chart-4 mt-0.5">
                        ~{stage.avg_duration_hours < 24
                          ? `${stage.avg_duration_hours.toFixed(0)}h`
                          : `${(stage.avg_duration_hours / 24).toFixed(0)}d`}
                      </p>
                    )}
                  </div>
                  {i < stages.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Deal Flow Trend */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-2" />
              Deal Flow Velocity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={daily_trend}>
                  <defs>
                    <linearGradient id="inqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="offerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="closeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="inquiries" name="Inquiries" stroke="hsl(var(--chart-4))" fill="url(#inqGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="offers" name="Offers" stroke="hsl(var(--primary))" fill="url(#offerGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="closed" name="Closed" stroke="hsl(var(--chart-2))" fill="url(#closeGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Conversion Rates */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-chart-4" />
              Conversion & Efficiency Rates
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 space-y-2.5">
            <SignalBar label="Inquiry → Offer" value={Math.min(m.inquiry_to_offer_rate * 2, 100)} detail={`${m.inquiry_to_offer_rate}%`} />
            <SignalBar label="Offer → Close" value={Math.min(m.offer_close_rate * 2, 100)} detail={`${m.offer_close_rate}%`} />
            <SignalBar label="Overall Conversion" value={Math.min(m.overall_conversion_rate * 5, 100)} detail={`${m.overall_conversion_rate}%`} />
            <SignalBar label="Counter Offer Rate" value={m.counter_offer_frequency} detail={`${m.counter_offer_frequency}% of offers`} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Optimization Interventions */}
      {interventions.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="border-border/40">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Zap className="h-4 w-4 text-chart-2" />
                Velocity Optimization Actions
                <Badge variant="secondary" className="text-[9px] h-4 ml-auto">
                  {interventions.length} actions
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-2">
              {interventions.map((action, i) => (
                <InterventionCard key={action.id} action={action} index={i} />
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function CycleKPI({ label, value, status }: { label: string; value: string; status: 'good' | 'warn' | 'bad' }) {
  const colors = { good: 'text-chart-2', warn: 'text-chart-4', bad: 'text-destructive' };
  return (
    <div className="text-center">
      <p className={cn('text-lg font-bold', colors[status])}>{value}</p>
      <p className="text-[9px] text-muted-foreground">{label}</p>
    </div>
  );
}

function InterventionCard({ action, index }: { action: VelocityIntervention; index: number }) {
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
