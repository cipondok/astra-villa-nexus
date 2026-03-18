import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useViralCoefficient } from '@/hooks/useViralCoefficient';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  Share2, Users, TrendingUp, Zap, Timer, Target,
  ArrowUpRight, ArrowDownRight, Minus, Loader2, Flame, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INTERPRETATION = {
  exponential: { label: 'Exponential Growth', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: Flame, desc: 'K > 1 — Each user brings more than one new user. Viral loop is self-sustaining.' },
  stable: { label: 'Near-Viral Equilibrium', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: TrendingUp, desc: 'K ≈ 0.7–1.0 — Growth is steady but not yet fully self-sustaining.' },
  needs_optimization: { label: 'Optimization Needed', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: AlertTriangle, desc: 'K < 0.7 — Referral loop needs stronger incentives or better trigger timing.' },
};

const CHANNEL_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

function TrendIcon({ value }: { value: number }) {
  if (value > 0) return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />;
  if (value < 0) return <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value}
        </p>
      ))}
    </div>
  );
};

interface Props {
  period?: number;
}

export default function ViralCoefficientPanel({ period = 30 }: Props) {
  const { data: vm, isLoading } = useViralCoefficient(period);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!vm) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <Share2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No referral data available for this period.</p>
        </CardContent>
      </Card>
    );
  }

  const interp = INTERPRETATION[vm.growthInterpretation];
  const InterpIcon = interp.icon;

  const kpiCards = [
    { title: 'Viral Coefficient (K)', value: vm.kFactor.toFixed(3), icon: <Zap className="h-4 w-4" />, highlight: true },
    { title: 'Avg Invites / User', value: vm.avgInvitesPerUser.toFixed(1), icon: <Share2 className="h-4 w-4" /> },
    { title: 'Referral Conversion', value: `${(vm.referralConversionRate * 100).toFixed(1)}%`, icon: <Target className="h-4 w-4" /> },
    { title: 'Active Referrers', value: vm.totalActiveReferrers.toString(), icon: <Users className="h-4 w-4" /> },
    { title: 'Total Invites Sent', value: vm.totalInvitesSent.toString(), icon: <Share2 className="h-4 w-4" /> },
    { title: 'Conversions', value: vm.totalConverted.toString(), icon: <TrendingUp className="h-4 w-4" /> },
    { title: 'Avg Cycle Time', value: vm.cycleTimeHours > 0 ? `${vm.cycleTimeHours.toFixed(1)}h` : '—', icon: <Timer className="h-4 w-4" /> },
    { title: 'Effective Growth', value: `${vm.effectiveGrowthRate.toFixed(1)}%`, icon: <Flame className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      {/* K-Factor Formula Banner */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className={cn('border', interp.border, interp.bg)}>
          <CardContent className="p-4 flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', interp.bg)}>
              <InterpIcon className={cn('h-5 w-5', interp.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground">K = {vm.kFactor.toFixed(3)}</h3>
                <Badge variant="outline" className={cn('text-xs', interp.color, interp.border)}>
                  {interp.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{interp.desc}</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                K = (invites/user × conversion rate) = ({vm.avgInvitesPerUser.toFixed(2)} × {(vm.referralConversionRate * 100).toFixed(1)}%)
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((card, i) => (
          <motion.div key={card.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={cn('border-border/50 hover:border-primary/30 transition-colors', card.highlight && 'border-primary/40 bg-primary/[0.03]')}>
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="p-1 rounded bg-primary/10 text-primary">{card.icon}</div>
                  <p className="text-[10px] text-muted-foreground truncate">{card.title}</p>
                </div>
                <p className={cn('text-lg font-bold text-foreground', card.highlight && 'text-primary')}>{card.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* K-Factor Trend Chart */}
      {vm.dailyKTrend.length > 1 && (
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Viral Coefficient Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vm.dailyKTrend}>
                  <defs>
                    <linearGradient id="kGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} domain={[0, 'auto']} />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="k" name="K-Factor" stroke="hsl(var(--primary))" fill="url(#kGrad)" strokeWidth={2} />
                  {/* Reference line at K=1 */}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Channel Effectiveness + Invites/Conversions */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Channel Table */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Channel Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            {vm.channelBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No channel data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {['Channel', 'Invites', 'Conv.', 'Rate', 'Share'].map(h => (
                        <th key={h} className="text-left py-2 px-2 text-xs font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vm.channelBreakdown.map((ch, i) => (
                      <tr key={ch.channel} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2 px-2 font-medium text-foreground flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] }} />
                          <span className="capitalize">{ch.channel}</span>
                        </td>
                        <td className="py-2 px-2 text-muted-foreground">{ch.invites}</td>
                        <td className="py-2 px-2 font-medium text-foreground">{ch.conversions}</td>
                        <td className="py-2 px-2">
                          <Badge variant={ch.conversionRate >= 20 ? 'default' : ch.conversionRate >= 10 ? 'secondary' : 'outline'} className="text-xs">
                            {ch.conversionRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="py-2 px-2 text-muted-foreground">{ch.contribution.toFixed(0)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invites vs Conversions Bar Chart */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Invites vs Conversions by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            {vm.channelBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">No data</p>
            ) : (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vm.channelBreakdown} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis type="category" dataKey="channel" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={70} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="invites" name="Invites" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="conversions" name="Conversions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Optimization Recommendations */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
            <Target className="h-4 w-4 text-chart-4" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {vm.kFactor < 0.3 && (
            <RecommendationRow
              priority="critical"
              title="Increase invite volume"
              desc="Users send too few invites. Add share prompts after elite deal discovery (score ≥85) and post-transaction milestones."
            />
          )}
          {vm.referralConversionRate < 0.1 && (
            <RecommendationRow
              priority="high"
              title="Improve conversion rate"
              desc="Under 10% of invited users convert. Test stronger incentives (priority deal alerts, bonus analytics credits)."
            />
          )}
          {vm.cycleTimeHours > 72 && (
            <RecommendationRow
              priority="medium"
              title="Reduce cycle time"
              desc={`Average ${vm.cycleTimeHours.toFixed(0)}h to convert. Add urgency (limited-time reward bonus) and simplify onboarding.`}
            />
          )}
          {vm.channelBreakdown.length > 0 && (
            <RecommendationRow
              priority="info"
              title={`Top channel: ${vm.channelBreakdown[0].channel}`}
              desc={`${vm.channelBreakdown[0].conversionRate.toFixed(1)}% conversion rate. Double down on this channel for maximum K improvement.`}
            />
          )}
          {vm.kFactor >= 0.7 && vm.kFactor < 1 && (
            <RecommendationRow
              priority="medium"
              title="Near-viral threshold"
              desc={`K=${vm.kFactor.toFixed(3)} is close to 1.0. A ${((1 - vm.kFactor) * 100).toFixed(0)}% improvement in either invites or conversion reaches self-sustaining growth.`}
            />
          )}
          {vm.kFactor >= 1 && (
            <RecommendationRow
              priority="info"
              title="Self-sustaining viral loop achieved"
              desc="Focus on maintaining quality and preventing fraud/gaming. Monitor for K decay over time."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RecommendationRow({ priority, title, desc }: { priority: string; title: string; desc: string }) {
  const styles = {
    critical: 'border-destructive/30 bg-destructive/5',
    high: 'border-amber-500/30 bg-amber-500/5',
    medium: 'border-primary/20 bg-primary/5',
    info: 'border-chart-4/20 bg-chart-4/5',
  }[priority] || 'border-border';

  const badgeVariant = priority === 'critical' ? 'destructive' : priority === 'high' ? 'secondary' : 'outline';

  return (
    <div className={cn('p-3 rounded-lg border', styles)}>
      <div className="flex items-center gap-2 mb-1">
        <Badge variant={badgeVariant as any} className="text-[10px] uppercase">{priority}</Badge>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
