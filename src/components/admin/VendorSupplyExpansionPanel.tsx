import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { AdminPageHeader } from './shared/AdminPageHeader';
import {
  Store, Loader2, RefreshCw, AlertTriangle, TrendingUp,
  Target, Zap, Users, BarChart3, MapPin, DollarSign,
  ArrowUpRight, Megaphone, Layers,
} from 'lucide-react';
import { useVendorSupplyInsights, type DistrictSupplyInsight } from '@/hooks/useVendorSupplyInsights';
import { useTriggerGrowthOrchestrator } from '@/hooks/useVendorGrowthOrchestrator';
import { cn } from '@/lib/utils';

const fadeIn = (d = 0) => ({
  initial: { opacity: 0, y: 10 } as const,
  animate: { opacity: 1, y: 0 } as const,
  transition: { duration: 0.4, delay: d, ease: [0.16, 1, 0.3, 1] as const },
});

const URGENCY_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  critical: { color: 'text-destructive', bg: 'bg-destructive/10', icon: '🚨' },
  high: { color: 'text-chart-4', bg: 'bg-chart-4/10', icon: '⚠️' },
  moderate: { color: 'text-primary', bg: 'bg-primary/10', icon: '📊' },
  low: { color: 'text-chart-1', bg: 'bg-chart-1/10', icon: '✅' },
};

const formatIDR = (v: number) =>
  v >= 1_000_000_000 ? `Rp ${(v / 1_000_000_000).toFixed(1)}B`
  : v >= 1_000_000 ? `Rp ${(v / 1_000_000).toFixed(0)}M`
  : `Rp ${v.toLocaleString()}`;

const VendorSupplyExpansionPanel = () => {
  const [cityFilter, setCityFilter] = useState('');
  const { data, isLoading, refetch } = useVendorSupplyInsights(cityFilter || undefined);
  const orchestrator = useTriggerGrowthOrchestrator();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Vendor Supply Expansion"
        description="Autonomous supply gap detection, recruitment campaigns, and marketplace balance optimization"
        icon={Store}
        badge={data ? { text: `${data.summary.critical_shortages} Critical`, variant: data.summary.critical_shortages > 0 ? 'destructive' : 'default' } : undefined}
      />

      {/* Actions */}
      <Card className="border-border/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => orchestrator.mutate('full')}
              disabled={orchestrator.isPending}
              size="sm"
              className="gap-2"
            >
              {orchestrator.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              Run Supply Orchestrator
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
              <RefreshCw className="h-3 w-3" /> Refresh Insights
            </Button>
            <Input
              placeholder="Filter by city..."
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-40 h-8 text-xs ml-auto"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data ? (
        <>
          {/* Summary Stats */}
          <motion.div {...fadeIn(0)}>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              <StatBox label="Districts" value={data.summary.total_districts_analyzed} icon={MapPin} color="text-primary" />
              <StatBox label="Critical" value={data.summary.critical_shortages} icon={AlertTriangle} color="text-destructive" />
              <StatBox label="High Pressure" value={data.summary.high_pressure_districts} icon={TrendingUp} color="text-chart-4" />
              <StatBox label="Avg Pressure" value={`${data.summary.avg_supply_pressure}%`} icon={BarChart3} color="text-foreground" />
              <StatBox label="Revenue at Risk" value={formatIDR(data.summary.total_revenue_at_risk)} icon={DollarSign} color="text-destructive" />
              <StatBox label="Campaigns" value={data.summary.active_campaigns} icon={Megaphone} color="text-chart-1" />
              <StatBox label="Queued" value={data.summary.queued_expansions} icon={Layers} color="text-primary" />
            </div>
          </motion.div>

          {/* Top Categories Needing Supply */}
          {data.top_categories_needing_supply.length > 0 && (
            <motion.div {...fadeIn(0.05)}>
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    Priority Service Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {data.top_categories_needing_supply.map(cat => (
                      <div key={cat.category} className="text-center p-3 rounded-lg bg-muted/10 border border-border/20">
                        <p className="text-sm font-semibold text-foreground capitalize">
                          {cat.category.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Gap: <span className="font-mono text-chart-4">{cat.total_gap_pressure}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* District Supply Insights */}
          <motion.div {...fadeIn(0.1)}>
            <Card className="border-border/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  District Supply Intelligence
                  <Badge variant="outline" className="ml-auto text-[10px]">
                    {data.district_insights.length} districts
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {data.district_insights.map((insight) => {
                    const cfg = URGENCY_CONFIG[insight.recruitment_urgency] || URGENCY_CONFIG.low;
                    return (
                      <div
                        key={insight.district}
                        className={cn('px-3 py-3 rounded-lg border border-border/20', cfg.bg)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{cfg.icon}</span>
                            <span className="font-medium text-sm text-foreground">{insight.district}</span>
                            <Badge variant="outline" className={cn('text-[10px] h-5 capitalize', cfg.color)}>
                              {insight.recruitment_urgency}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground">Pressure</span>
                              <Progress value={insight.supply_pressure_score} className="w-16 h-1.5" />
                              <span className="text-xs font-mono text-foreground">{insight.supply_pressure_score}</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Priority: </span>
                            <span className="text-foreground capitalize">
                              {insight.priority_categories.map(c => c.replace(/_/g, ' ')).join(', ') || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Revenue Impact: </span>
                            <span className="font-mono text-foreground">{formatIDR(insight.estimated_revenue_impact)}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Incentive: </span>
                            <span className="text-foreground">{insight.recommended_incentive}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-muted-foreground mt-1.5 italic">
                          {insight.campaign_recommendation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Campaigns */}
          {data.active_campaigns.length > 0 && (
            <motion.div {...fadeIn(0.15)}>
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-primary" />
                    Active Recruitment Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.active_campaigns.map(c => (
                      <div key={c.id} className="flex items-center justify-between text-sm px-3 py-2 rounded-lg bg-muted/10 border border-border/20">
                        <div>
                          <span className="font-medium text-foreground">{c.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">· {c.district}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="capitalize text-muted-foreground">{c.category.replace(/_/g, ' ')}</span>
                          <span className="font-mono text-foreground">
                            {c.acquired}/{c.target}
                          </span>
                          <Progress value={(c.acquired / Math.max(c.target, 1)) * 100} className="w-16 h-1.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Expansion Queue */}
          {data.expansion_queue.length > 0 && (
            <motion.div {...fadeIn(0.2)}>
              <Card className="border-border/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    Expansion Queue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {data.expansion_queue.map((e, i) => (
                      <div key={`${e.district}-${e.category}-${i}`} className="flex items-center justify-between text-xs px-3 py-2 rounded bg-muted/10">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-muted-foreground w-6">#{e.rank}</span>
                          <span className="text-foreground">{e.district}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="capitalize text-muted-foreground">{e.category.replace(/_/g, ' ')}</span>
                          <span className="font-mono text-foreground">{e.composite_score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      ) : null}
    </div>
  );
};

function StatBox({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <Card className="border-border/40">
      <CardContent className="p-3 text-center">
        <Icon className={cn('h-4 w-4 mx-auto mb-1', color)} />
        <p className={cn('text-lg font-bold font-mono', color)}>{value}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export default VendorSupplyExpansionPanel;
