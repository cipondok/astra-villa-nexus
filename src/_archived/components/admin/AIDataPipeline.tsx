import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Database, ArrowRight, RefreshCw, Layers, Filter, Cpu, BarChart3, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const accuracyData = [
  { month: 'Jul', pricing: 72, demand: 68, matching: 65 },
  { month: 'Aug', pricing: 74, demand: 71, matching: 69 },
  { month: 'Sep', pricing: 78, demand: 74, matching: 72 },
  { month: 'Oct', pricing: 81, demand: 77, matching: 76 },
  { month: 'Nov', pricing: 84, demand: 80, matching: 79 },
  { month: 'Dec', pricing: 86, demand: 83, matching: 82 },
  { month: 'Jan', pricing: 88, demand: 85, matching: 84 },
  { month: 'Feb', pricing: 89, demand: 87, matching: 86 },
  { month: 'Mar', pricing: 91, demand: 89, matching: 88 },
];

const pipelineStages = [
  { stage: 'Raw Data Ingestion', icon: Database, desc: 'Event streams from properties, inquiries, viewings, deals, user behavior', status: 'Active', throughput: '~15K events/day' },
  { stage: 'Data Cleaning & Validation', icon: Filter, desc: 'Schema enforcement, deduplication, outlier detection, null handling', status: 'Active', throughput: '99.2% pass rate' },
  { stage: 'Feature Engineering', icon: Layers, desc: 'Behavioral scoring, temporal aggregation, spatial encoding, interaction features', status: 'Active', throughput: '48 features computed' },
  { stage: 'Model Training', icon: Cpu, desc: 'Batch retraining on 7-day cycle, incremental updates on significant drift', status: 'Scheduled', throughput: 'Weekly cycle' },
  { stage: 'Prediction Service', icon: Brain, desc: 'Real-time inference via ai_intelligence_cache with 4-tier TTL', status: 'Active', throughput: '<100ms p95' },
  { stage: 'Insight Generation', icon: BarChart3, desc: 'Actionable recommendations pushed to dashboards and notifications', status: 'Active', throughput: '~200 insights/day' },
];

const feedbackSignals = [
  { signal: 'Listing View Duration', weight: 'Medium', impact: 'Interest scoring calibration' },
  { signal: 'Inquiry After Recommendation', weight: 'High', impact: 'Recommendation quality validation' },
  { signal: 'Viewing-to-Offer Conversion', weight: 'Critical', impact: 'Matching model accuracy' },
  { signal: 'Price Adjustment Acceptance', weight: 'High', impact: 'Pricing model calibration' },
  { signal: 'Search Filter Refinements', weight: 'Medium', impact: 'Demand prediction improvement' },
  { signal: 'Agent Response Time', weight: 'Medium', impact: 'Agent performance scoring' },
];

const AIDataPipeline = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">AI Data Pipeline & Learning Loop</h2>
          <Badge variant="outline">🧠 Intelligence</Badge>
        </div>
        <p className="text-muted-foreground text-sm">How platform data feeds machine learning systems for continuous intelligence improvement</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Data Freshness', value: '< 5 min', sub: 'Event-driven ingestion' },
          { label: 'Active Models', value: '3', sub: 'Pricing, Demand, Matching' },
          { label: 'Feature Count', value: '48', sub: 'Computed features' },
          { label: 'Learning Cycle', value: '7 days', sub: 'Full retrain interval' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold text-primary">{m.value}</p>
              <p className="text-xs text-muted-foreground">{m.sub}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      {/* Pipeline Stages */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Pipeline Architecture</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {pipelineStages.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{s.stage}</p>
                  <Badge variant={s.status === 'Active' ? 'default' : 'secondary'} className="text-xs">{s.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{s.desc}</p>
              </div>
              <span className="text-xs text-muted-foreground font-mono shrink-0 hidden md:block">{s.throughput}</span>
              {i < pipelineStages.length - 1 && <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 hidden md:block" />}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Model Accuracy Trend */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Model Accuracy Trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis domain={[60, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
              <Area type="monotone" dataKey="pricing" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" name="Pricing Model" />
              <Area type="monotone" dataKey="demand" stroke="hsl(142 76% 36%)" fill="hsl(142 76% 36% / 0.1)" name="Demand Prediction" />
              <Area type="monotone" dataKey="matching" stroke="hsl(38 92% 50%)" fill="hsl(38 92% 50% / 0.1)" name="Buyer Matching" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Feedback Loop */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            <CardTitle className="text-base">Reinforcement Feedback Signals</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {feedbackSignals.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border">
              <TrendingUp className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground flex-1">{f.signal}</span>
              <Badge variant={f.weight === 'Critical' ? 'destructive' : f.weight === 'High' ? 'default' : 'secondary'} className="text-xs">{f.weight}</Badge>
              <span className="text-xs text-muted-foreground hidden md:block max-w-[200px] truncate">{f.impact}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIDataPipeline;
