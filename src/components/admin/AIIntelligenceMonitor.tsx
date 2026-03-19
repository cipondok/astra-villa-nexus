import React, { useState } from 'react';
import { useIntelligenceMonitor } from '@/hooks/useIntelligenceMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  Brain, Target, Flame, Users, TrendingUp, TrendingDown,
  AlertTriangle, Activity, RefreshCw, Eye, BarChart3,
  Zap, ArrowUpRight, ArrowDownRight, Minus, Star, Search,
  MousePointerClick, ChevronRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';

const CHART_TOOLTIP = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
};

const AIIntelligenceMonitor = () => {
  const { data, isLoading, refetch, dataUpdatedAt } = useIntelligenceMonitor();
  const [activeTab, setActiveTab] = useState('scoring');

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted/30 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-52 rounded-xl bg-muted/30 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  const { scoring, heat, behavior } = data;

  const topStats = [
    { label: 'Score Coverage', value: `${scoring.coveragePercent}%`, icon: Target, color: 'text-chart-2', sub: `${scoring.scoredProperties}/${scoring.totalProperties}` },
    { label: 'Elite Listings', value: scoring.eliteCount.toString(), icon: Star, color: 'text-chart-3', sub: '≥85 score' },
    { label: 'Heat Index', value: heat.overallHeatIndex.toString(), icon: Flame, color: 'text-chart-1', sub: `${heat.hotCities.length} cities` },
    { label: 'Daily Active', value: behavior.dailyActive.toString(), icon: Users, color: 'text-chart-4', sub: `${behavior.weeklyActive} weekly` },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">AI Intelligence Monitor</h2>
            <p className="text-[10px] text-muted-foreground">Real-time predictive system health & market signal tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[9px] gap-1 border-chart-1/30 text-chart-1 bg-chart-1/5">
            <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-1 opacity-75" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-chart-1" /></span>
            Live
          </Badge>
          {dataUpdatedAt && dataUpdatedAt > 0 && (
            <Badge variant="outline" className="text-[9px] text-muted-foreground">
              {formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true })}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1 text-xs h-7">
            <RefreshCw className="h-3 w-3" /> Refresh
          </Button>
        </div>
      </motion.div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {topStats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/40 hover:border-primary/20 transition-colors">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <stat.icon className={cn('h-4 w-4', stat.color)} />
                  <span className="text-[9px] text-muted-foreground">{stat.sub}</span>
                </div>
                <p className="text-xl font-black text-foreground">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="scoring" className="text-xs gap-1.5">
            <Target className="h-3.5 w-3.5" /> Opportunity Score
          </TabsTrigger>
          <TabsTrigger value="heat" className="text-xs gap-1.5">
            <Flame className="h-3.5 w-3.5" /> Market Heat
          </TabsTrigger>
          <TabsTrigger value="behavior" className="text-xs gap-1.5">
            <Users className="h-3.5 w-3.5" /> User Behavior
          </TabsTrigger>
        </TabsList>

        {/* ═══ OPPORTUNITY SCORE ENGINE ═══ */}
        <TabsContent value="scoring" className="mt-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Coverage Gauge */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Eye className="h-3.5 w-3.5 text-primary" /> Scoring Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-3">
                <div className="text-center">
                  <p className="text-4xl font-black text-foreground">{scoring.coveragePercent}%</p>
                  <p className="text-[10px] text-muted-foreground">{scoring.scoredProperties} of {scoring.totalProperties} properties scored</p>
                </div>
                <Progress value={scoring.coveragePercent} className="h-2" />
                <div className="flex justify-between text-[9px] text-muted-foreground">
                  <span>Avg Score: {scoring.avgScore}/100</span>
                  <span>Elite (≥85): {scoring.eliteCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-chart-2" /> Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={scoring.scoreBuckets}>
                    <XAxis dataKey="range" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={30} />
                    <Tooltip contentStyle={CHART_TOOLTIP} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {scoring.scoreBuckets.map((b, i) => (
                        <Cell key={i} fill={b.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Elite Trend */}
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-chart-3" /> Elite Listing Trend (7d)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={scoring.eliteTrend.map((v, i) => ({ day: `D${i + 1}`, count: v }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={25} />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.15} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Elite */}
          {scoring.recentElite.length > 0 && (
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs">Top Elite Properties</CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-1.5">
                {scoring.recentElite.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{p.title}</p>
                      <p className="text-[10px] text-muted-foreground">{p.city}</p>
                    </div>
                    <Badge className="bg-chart-3/15 text-chart-3 border-chart-3/30 text-[10px]">{p.score}/100</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ MARKET HEAT INTELLIGENCE ═══ */}
        <TabsContent value="heat" className="mt-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Heat Index */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Flame className="h-3.5 w-3.5 text-chart-1" /> Overall Heat Index
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-center space-y-2">
                <p className={cn(
                  'text-5xl font-black',
                  heat.overallHeatIndex >= 70 ? 'text-chart-1' : heat.overallHeatIndex >= 40 ? 'text-chart-3' : 'text-muted-foreground'
                )}>{heat.overallHeatIndex}</p>
                <Badge variant="outline" className={cn('text-[10px]',
                  heat.overallHeatIndex >= 70 ? 'text-chart-1 border-chart-1/30' : 'text-chart-3 border-chart-3/30'
                )}>
                  {heat.overallHeatIndex >= 70 ? 'Hot Market' : heat.overallHeatIndex >= 40 ? 'Warm Market' : 'Cool Market'}
                </Badge>
              </CardContent>
            </Card>

            {/* City Demand */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-chart-4" /> City Demand Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={heat.hotCities.slice(0, 6)} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis type="category" dataKey="city" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={65} />
                    <Tooltip contentStyle={CHART_TOOLTIP} />
                    <Bar dataKey="heat" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Demand Shifts */}
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-chart-2" /> Demand Shift Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-1.5">
              {heat.demandShifts.map(s => (
                <div key={s.city} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30">
                  <span className="text-xs font-medium">{s.city}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground">{s.previous} → {s.current}</span>
                    <Badge variant="outline" className={cn('text-[10px] gap-0.5',
                      s.delta > 0 ? 'text-chart-2 border-chart-2/30' : s.delta < 0 ? 'text-destructive border-destructive/30' : 'text-muted-foreground'
                    )}>
                      {s.delta > 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : s.delta < 0 ? <ArrowDownRight className="h-2.5 w-2.5" /> : <Minus className="h-2.5 w-2.5" />}
                      {Math.abs(s.delta)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Anomaly Alerts */}
          <Card>
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Anomaly Detection
                </CardTitle>
                {heat.anomalies.length > 0 && (
                  <Badge variant="destructive" className="text-[9px]">{heat.anomalies.length}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {heat.anomalies.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No anomalies detected ✓</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {heat.anomalies.map(a => (
                    <div key={a.id} className={cn(
                      'flex items-start gap-2 p-2 rounded-lg border',
                      a.severity === 'critical' ? 'bg-destructive/5 border-destructive/20' :
                      a.severity === 'high' ? 'bg-chart-1/5 border-chart-1/20' : 'bg-muted/30 border-border/30'
                    )}>
                      <AlertTriangle className={cn('h-3.5 w-3.5 mt-0.5 flex-shrink-0',
                        a.severity === 'critical' ? 'text-destructive' : a.severity === 'high' ? 'text-chart-1' : 'text-muted-foreground'
                      )} />
                      <div className="min-w-0">
                        <p className="text-xs font-medium">{a.message}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[8px] capitalize">{a.severity}</Badge>
                          <span className="text-[9px] text-muted-foreground">
                            {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ USER BEHAVIOR ANALYTICS ═══ */}
        <TabsContent value="behavior" className="mt-3 space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              { label: 'Daily Active', value: behavior.dailyActive, icon: Users, color: 'text-chart-4' },
              { label: 'Weekly Active', value: behavior.weeklyActive, icon: Activity, color: 'text-chart-2' },
              { label: 'Search Volume', value: behavior.searchVolume, icon: Search, color: 'text-chart-1' },
              { label: 'Avg Session', value: `${behavior.avgSessionMinutes}m`, icon: MousePointerClick, color: 'text-chart-3' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-3 text-center">
                    <s.icon className={cn('h-4 w-4 mx-auto mb-1', s.color)} />
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-[9px] text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Engagement Spikes */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-chart-3" /> Engagement Activity (7d)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={behavior.engagementSpikes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.3} />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={30} />
                    <Tooltip contentStyle={CHART_TOOLTIP} />
                    <Area type="monotone" dataKey="sessions" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.12} strokeWidth={2} name="Sessions" />
                    <Area type="monotone" dataKey="searches" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.08} strokeWidth={1.5} name="Searches" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <ChevronRight className="h-3.5 w-3.5 text-chart-2" /> Conversion Funnel Drop-off
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                {behavior.funnelStages.map((stage, i) => {
                  const maxCount = behavior.funnelStages[0]?.count || 1;
                  const pct = Math.round((stage.count / maxCount) * 100);
                  return (
                    <div key={stage.stage} className="space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-medium text-foreground">{stage.stage}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{stage.count}</span>
                          {i > 0 && (
                            <Badge variant="outline" className="text-[8px] text-destructive border-destructive/20">
                              -{stage.dropoff}%
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Top Actions */}
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs flex items-center gap-2">
                <MousePointerClick className="h-3.5 w-3.5 text-chart-4" /> Top User Actions (7d)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={behavior.topActions} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="category" dataKey="action" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                  <Tooltip contentStyle={CHART_TOOLTIP} />
                  <Bar dataKey="count" fill="hsl(var(--chart-4))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIIntelligenceMonitor;
