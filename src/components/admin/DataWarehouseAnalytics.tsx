import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Database, ArrowRight, Layers, Filter, BarChart3, Brain, Clock, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const queryPerformance = [
  { query: 'Property Search', p50: 12, p95: 45, p99: 120 },
  { query: 'Deal Pipeline', p50: 8, p95: 32, p99: 85 },
  { query: 'Agent Rankings', p50: 15, p95: 55, p99: 140 },
  { query: 'Revenue KPIs', p50: 22, p95: 68, p99: 180 },
  { query: 'Demand Signals', p50: 18, p95: 52, p99: 130 },
  { query: 'Liquidity Index', p50: 25, p95: 72, p99: 200 },
];

const pipelineLayers = [
  { layer: 'Source Systems', icon: Database, desc: 'Raw event streams from properties, inquiries, viewings, deals, payments, user behavior logs', status: 'Active', freshness: '< 2 min' },
  { layer: 'Ingestion Layer', icon: Zap, desc: 'Real-time CDC from PostgreSQL WAL + batch daily snapshots via pg_cron scheduled jobs', status: 'Active', freshness: '< 5 min' },
  { layer: 'ETL Pipeline', icon: Filter, desc: 'Data validation, deduplication, schema enforcement, type casting, null handling, outlier detection', status: 'Active', freshness: '< 10 min' },
  { layer: 'Data Marts', icon: Layers, desc: 'Structured analytical tables: deals_mart, demand_mart, pricing_mart, agent_performance_mart', status: 'Active', freshness: '15 min' },
  { layer: 'BI Consumption', icon: BarChart3, desc: 'Materialized views consumed by executive dashboards, KPI widgets, and strategic panels', status: 'Active', freshness: '15 min' },
  { layer: 'Predictive Layer', icon: Brain, desc: 'AI model integration point — features from data marts feed pricing, demand, and matching models', status: 'Active', freshness: '1 hour' },
];

const dataMarts = [
  { name: 'deals_mart', rows: '~45K', tables: 4, refresh: '15 min', queries: '~2.1K/day', desc: 'Deal pipeline velocity, stage conversion rates, closing probability' },
  { name: 'demand_mart', rows: '~180K', tables: 3, refresh: '15 min', queries: '~3.4K/day', desc: 'Buyer intent signals, search patterns, district demand intensity' },
  { name: 'pricing_mart', rows: '~95K', tables: 5, refresh: '30 min', queries: '~1.8K/day', desc: 'Market pricing intelligence, comparables, elasticity curves' },
  { name: 'agent_mart', rows: '~12K', tables: 3, refresh: '1 hour', queries: '~800/day', desc: 'Agent productivity, response times, conversion rates, territory coverage' },
  { name: 'revenue_mart', rows: '~28K', tables: 4, refresh: '1 hour', queries: '~600/day', desc: 'Revenue streams, commission tracking, subscription metrics, LTV/CAC' },
];

const DataWarehouseAnalytics = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Database className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Data Warehouse & Analytics Layer</h2>
          <Badge variant="outline">📊 Intelligence</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Centralized analytics architecture transforming operational data into strategic intelligence</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Pipeline Layers', value: '6' },
          { label: 'Data Marts', value: '5' },
          { label: 'Avg Freshness', value: '< 15 min' },
          { label: 'Daily Queries', value: '~8.7K' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold text-primary">{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      {/* Pipeline Flow */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Analytics Pipeline Architecture</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {pipelineLayers.map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <l.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{l.layer}</p>
                  <Badge variant="default" className="text-xs">{l.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{l.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{l.freshness}</div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Data Marts */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Structured Data Marts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {dataMarts.map((dm, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="p-3 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-sm font-medium text-foreground">{dm.name}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{dm.rows} rows</Badge>
                  <Badge variant="outline" className="text-xs">⟳ {dm.refresh}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{dm.desc}</p>
              <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                <span>{dm.tables} source tables</span>
                <span>{dm.queries} queries/day</span>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Query Performance */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Query Performance (ms)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={queryPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis dataKey="query" type="category" width={110} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
              <Bar dataKey="p50" fill="hsl(var(--primary))" name="p50" radius={[0, 2, 2, 0]} />
              <Bar dataKey="p95" fill="hsl(var(--primary) / 0.5)" name="p95" radius={[0, 2, 2, 0]} />
              <Bar dataKey="p99" fill="hsl(var(--primary) / 0.25)" name="p99" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataWarehouseAnalytics;
