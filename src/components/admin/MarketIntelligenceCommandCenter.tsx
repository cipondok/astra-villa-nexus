import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Brain, TrendingUp, AlertTriangle, Target, Zap, BarChart3,
  RefreshCw, Map, Flame, Activity, ArrowUpRight, DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  useMarketDashboardStats,
  useBatchScoreProperties,
  useRefreshZoneMetrics,
  useDetectAnomalies,
  useGenerateRecommendations,
} from '@/hooks/useMarketIntelligenceEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
const anim = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } };

export default function MarketIntelligenceCommandCenter() {
  const { data: stats, isLoading } = useMarketDashboardStats();
  const batchScore = useBatchScoreProperties();
  const refreshZones = useRefreshZoneMetrics();
  const detectAnomalies = useDetectAnomalies();
  const genRecs = useGenerateRecommendations();

  const isBusy = batchScore.isPending || refreshZones.isPending || detectAnomalies.isPending || genRecs.isPending;

  const kpis = [
    { label: 'Properties Scored', value: stats?.total_scored || 0, icon: Brain, color: 'text-primary' },
    { label: 'Market Signals', value: stats?.total_signals || 0, icon: Activity, color: 'text-chart-2' },
    { label: 'ROI Forecasts', value: stats?.total_forecasts || 0, icon: TrendingUp, color: 'text-chart-3' },
    { label: 'Recommendations', value: stats?.total_recommendations || 0, icon: Target, color: 'text-chart-4' },
    { label: 'Price Anomalies', value: stats?.total_anomalies || 0, icon: AlertTriangle, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...anim} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Brain className="h-5 w-5 text-primary" />
            <Badge variant="outline" className="text-xs">AI Market Intelligence</Badge>
          </div>
          <h2 className="text-2xl font-bold text-foreground">Market Intelligence Command Center</h2>
          <p className="text-sm text-muted-foreground">AI-driven property scoring, anomaly detection, ROI forecasting & investor recommendations</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => batchScore.mutate(50)} disabled={isBusy}>
            <Zap className="h-4 w-4 mr-1" /> Batch Score
          </Button>
          <Button size="sm" variant="outline" onClick={() => refreshZones.mutate()} disabled={isBusy}>
            <Map className="h-4 w-4 mr-1" /> Refresh Zones
          </Button>
          <Button size="sm" variant="outline" onClick={() => detectAnomalies.mutate()} disabled={isBusy}>
            <AlertTriangle className="h-4 w-4 mr-1" /> Detect Anomalies
          </Button>
          <Button size="sm" variant="outline" onClick={() => genRecs.mutate()} disabled={isBusy}>
            <Target className="h-4 w-4 mr-1" /> Gen Recommendations
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} {...anim} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{isLoading ? '—' : kpi.value.toLocaleString()}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="top-properties" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="top-properties" className="text-xs gap-1"><Flame className="h-3.5 w-3.5" /> Top Properties</TabsTrigger>
          <TabsTrigger value="hot-zones" className="text-xs gap-1"><Map className="h-3.5 w-3.5" /> Hot Zones</TabsTrigger>
          <TabsTrigger value="distribution" className="text-xs gap-1"><BarChart3 className="h-3.5 w-3.5" /> Score Distribution</TabsTrigger>
        </TabsList>

        <TabsContent value="top-properties">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><ArrowUpRight className="h-4 w-4 text-primary" /> Top Investment Properties</CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.top_properties?.length ? (
                <p className="text-sm text-muted-foreground text-center py-8">No scored properties yet. Click "Batch Score" to start.</p>
              ) : (
                <div className="space-y-3">
                  {stats.top_properties.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground w-6">#{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.title || 'Untitled'}</p>
                          <p className="text-xs text-muted-foreground">{p.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="text-sm font-medium text-foreground">${(p.price / 1e6).toFixed(1)}M</p>
                        </div>
                        <Badge variant={p.investment_score >= 75 ? 'default' : 'secondary'} className="font-mono">
                          {p.investment_score}/100
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hot-zones">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><Flame className="h-4 w-4 text-orange-500" /> Market Zone Heatmap</CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.hot_zones?.length ? (
                <p className="text-sm text-muted-foreground text-center py-8">No zone data. Click "Refresh Zones" to compute.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.hot_zones.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="city" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                    <Bar dataKey="buyer_demand_index" name="Demand" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="price_momentum_score" name="Momentum" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="h-4 w-4 text-chart-2" /> Investment Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {!stats?.top_properties?.length ? (
                <p className="text-sm text-muted-foreground text-center py-8">Score properties first to see distribution.</p>
              ) : (
                <div className="space-y-4">
                  {[
                    { label: 'Elite (85+)', min: 85, color: 'bg-amber-500' },
                    { label: 'Strong (65-84)', min: 65, max: 84, color: 'bg-emerald-500' },
                    { label: 'Moderate (40-64)', min: 40, max: 64, color: 'bg-primary' },
                    { label: 'Weak (<40)', max: 39, color: 'bg-muted-foreground' },
                  ].map(tier => {
                    const count = stats.top_properties.filter(p => {
                      if (tier.min && tier.max) return p.investment_score >= tier.min && p.investment_score <= tier.max;
                      if (tier.min) return p.investment_score >= tier.min;
                      return p.investment_score <= (tier.max || 0);
                    }).length;
                    const pct = stats.top_properties.length > 0 ? (count / stats.top_properties.length) * 100 : 0;
                    return (
                      <div key={tier.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{tier.label}</span>
                          <span className="font-mono text-foreground">{count}</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Pipeline Readiness */}
      <motion.div {...anim} transition={{ delay: 0.3 }}>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">AI Market Intelligence Status</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Market intelligence engine is active with {stats?.total_signals || 0} signals collected,{' '}
              {stats?.total_scored || 0} properties scored, and {stats?.total_anomalies || 0} anomalies flagged.
              System is ready for batch recomputation and ML model training pipeline integration.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
