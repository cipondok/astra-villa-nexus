import { motion } from 'framer-motion';
import {
  Star, TrendingUp, TrendingDown, Minus, Target, Users, Search,
  MessageSquare, FileText, Bookmark, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { useNorthStarMetric, NORTH_STAR_HEALTH_META, type QualifiedAction, type SupportingMetric } from '@/hooks/useNorthStarMetric';
import { cn } from '@/lib/utils';

const ACTION_ICONS: Record<string, React.ElementType> = {
  'message-square': MessageSquare,
  'file-text': FileText,
  bookmark: Bookmark,
  users: Users,
  search: Search,
  'trending-up': TrendingUp,
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

export default function NorthStarPanel({ period = 30 }: Props) {
  const { data, isLoading } = useNorthStarMetric(500);

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

  const meta = NORTH_STAR_HEALTH_META[data.health];
  const TrendIcon = data.direction === 'up' ? TrendingUp : data.direction === 'down' ? TrendingDown : Minus;

  return (
    <div className="space-y-4">
      {/* North Star Hero */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-border/40">
          <div className={cn('absolute inset-0 opacity-[0.04]', meta.bgColor)} />
          <CardContent className="p-5 relative">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-5 w-5 text-chart-4 fill-chart-4/30" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    North Star Metric
                  </span>
                </div>
                <h2 className="text-sm font-medium text-foreground mb-3">
                  Qualified Investment Actions / Month
                </h2>

                {/* Big Number */}
                <div className="flex items-end gap-3 mb-3">
                  <span className="text-5xl font-extrabold tracking-tight text-foreground">
                    {data.qualified_actions_current.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1 mb-1.5">
                    <TrendIcon className={cn('h-4 w-4', meta.color)} />
                    <span className={cn('text-sm font-bold', meta.color)}>
                      {data.delta_percent > 0 ? '+' : ''}{data.delta_percent}%
                    </span>
                  </div>
                  <Badge variant="outline" className={cn('mb-1.5 text-[10px] h-5', meta.color)}>
                    {meta.emoji} {meta.label}
                  </Badge>
                </div>

                {/* Target Progress */}
                <div className="max-w-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Target className="h-3 w-3" /> Monthly Target
                    </span>
                    <span className="text-[10px] font-semibold text-foreground">
                      {data.qualified_actions_current} / {data.monthly_target}
                    </span>
                  </div>
                  <Progress value={data.target_progress} className="h-2" />
                </div>
              </div>

              {/* Previous Period */}
              <div className="text-right shrink-0">
                <p className="text-[10px] text-muted-foreground mb-0.5">Previous 30d</p>
                <p className="text-2xl font-bold text-muted-foreground/60">
                  {data.qualified_actions_previous.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Action Breakdown */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Qualified Action Breakdown
              <Badge variant="secondary" className="text-[9px] h-4 ml-auto">
                weighted scoring
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.actions.map((action, i) => (
                <ActionCard key={action.type} action={action} index={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weekly Trend */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-chart-2" />
              Weekly North Star Trend (8 Weeks)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weekly_trend} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <ReferenceLine
                    y={Math.round(data.monthly_target / 4.3)}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="4 4"
                    label={{ value: 'Weekly Target', fontSize: 9, fill: 'hsl(var(--destructive))' }}
                  />
                  <Bar dataKey="inquiries" name="Inquiries (1×)" stackId="a" fill="hsl(var(--chart-4))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="offers" name="Offers (3×)" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="watchlist" name="Watchlist (0.5×)" stackId="a" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Weighted Total Trend Line */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-chart-4" />
              Weighted QIA Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weekly_trend}>
                  <defs>
                    <linearGradient id="qiaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="weekLabel" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE} />
                  <ReferenceLine
                    y={Math.round(data.monthly_target / 4.3)}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="4 4"
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Weighted QIA"
                    stroke="hsl(var(--primary))"
                    fill="url(#qiaGrad)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: 'hsl(var(--primary))' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Supporting Input Metrics */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="border-border/40">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-chart-4" />
              Supporting Input Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {data.supporting.map((m, i) => {
                const Icon = ACTION_ICONS[m.icon_key] || TrendingUp;
                const DirIcon = m.direction === 'up' ? TrendingUp : m.direction === 'down' ? TrendingDown : Minus;
                return (
                  <motion.div
                    key={m.key}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className="rounded-lg border border-border/30 p-3 bg-card/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                        <Icon className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{m.label}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-lg font-bold text-foreground">
                        {typeof m.value === 'number' ? m.value.toLocaleString() : m.value}
                      </span>
                      {m.change !== 0 && (
                        <div className="flex items-center gap-0.5">
                          <DirIcon className={cn('h-3 w-3',
                            m.direction === 'up' ? 'text-chart-2' : 'text-destructive'
                          )} />
                          <span className={cn('text-[10px] font-medium',
                            m.direction === 'up' ? 'text-chart-2' : 'text-destructive'
                          )}>
                            {m.change > 0 ? '+' : ''}{m.change}%
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function ActionCard({ action, index }: { action: QualifiedAction; index: number }) {
  const Icon = ACTION_ICONS[action.icon_key] || Star;
  const weighted = Math.round(action.count * action.weight);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 * index }}
      className="rounded-lg border border-border/30 p-3 bg-card/50"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium text-muted-foreground truncate">{action.label}</p>
          <p className="text-[9px] text-muted-foreground/60">Weight: {action.weight}×</p>
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-bold text-foreground">{action.count.toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground">raw count</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-primary">{weighted.toLocaleString()}</p>
          <p className="text-[9px] text-muted-foreground">weighted</p>
        </div>
      </div>
    </motion.div>
  );
}
