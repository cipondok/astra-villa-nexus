import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Monitor, Zap, AlertTriangle, TrendingUp, Search, Eye, ArrowRight, Clock, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const webVitals = [
  { metric: 'LCP (Largest Contentful Paint)', value: '1.8s', target: '< 2.5s', score: 92, status: 'Good' },
  { metric: 'FID (First Input Delay)', value: '45ms', target: '< 100ms', score: 95, status: 'Good' },
  { metric: 'CLS (Cumulative Layout Shift)', value: '0.04', target: '< 0.1', score: 96, status: 'Good' },
  { metric: 'TTFB (Time to First Byte)', value: '180ms', target: '< 500ms', score: 88, status: 'Good' },
  { metric: 'INP (Interaction to Next Paint)', value: '120ms', target: '< 200ms', score: 85, status: 'Good' },
];

const funnel = [
  { stage: 'Homepage Visit', users: 10000, rate: 100 },
  { stage: 'Property Search', users: 6200, rate: 62 },
  { stage: 'Listing View', users: 3800, rate: 38 },
  { stage: 'Inquiry Sent', users: 890, rate: 8.9 },
  { stage: 'Viewing Booked', users: 420, rate: 4.2 },
  { stage: 'Offer Submitted', users: 180, rate: 1.8 },
  { stage: 'Deal Closed', users: 85, rate: 0.85 },
];

const dropoffs = [
  { point: 'Search → Listing View', dropoff: '38.7%', reason: 'Poor filter relevance or slow results', severity: 'Medium' },
  { point: 'Listing View → Inquiry', dropoff: '76.6%', reason: 'Missing trust signals, insufficient photos, or pricing mismatch', severity: 'High' },
  { point: 'Inquiry → Viewing', dropoff: '52.8%', reason: 'Agent response delay or scheduling friction', severity: 'High' },
  { point: 'Viewing → Offer', dropoff: '57.1%', reason: 'Property condition vs expectation gap', severity: 'Medium' },
];

const errorRates = [
  { page: 'Search', errors: 0.12 },
  { page: 'Listing Detail', errors: 0.08 },
  { page: 'Deal Room', errors: 0.15 },
  { page: 'Payment', errors: 0.22 },
  { page: 'Dashboard', errors: 0.05 },
  { page: 'Profile', errors: 0.03 },
];

const UXQualityMonitoring = () => {
  const overallScore = Math.round(webVitals.reduce((s, v) => s + v.score, 0) / webVitals.length);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Monitor className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">End-User Experience Quality</h2>
          <Badge variant="outline">🎯 UX Quality</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Core Web Vitals, conversion funnel analysis, error tracking, and user experience optimization</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'UX Score', value: `${overallScore}/100` },
          { label: 'Page Load', value: '1.8s' },
          { label: 'Error Rate', value: '0.11%' },
          { label: 'Search → Deal', value: '0.85%' },
          { label: 'Avg Session', value: '4.2 min' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold text-primary">{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      {/* Core Web Vitals */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Core Web Vitals</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {webVitals.map((v, i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-foreground font-medium">{v.metric}</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{v.value}</span>
                  <span className="text-xs text-muted-foreground">target: {v.target}</span>
                  <Badge variant="default" className="text-xs">{v.status}</Badge>
                </div>
              </div>
              <Progress value={v.score} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Conversion Funnel</CardTitle></CardHeader>
          <CardContent className="space-y-1.5">
            {funnel.map((f, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-sm mb-0.5">
                  <span className="text-foreground text-xs">{f.stage}</span>
                  <span className="text-xs text-muted-foreground">{f.users.toLocaleString()} ({f.rate}%)</span>
                </div>
                <Progress value={f.rate} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Error Rates */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Error Rate by Page (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={errorRates} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis dataKey="page" type="category" width={90} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
                <Bar dataKey="errors" fill="hsl(0 84% 60%)" name="Error %" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Drop-off Analysis */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Drop-off Point Analysis</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {dropoffs.map((d, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${d.severity === 'High' ? 'text-destructive' : 'text-amber-500'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{d.point}</p>
                  <Badge variant={d.severity === 'High' ? 'destructive' : 'secondary'} className="text-xs">{d.dropoff} drop</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{d.reason}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">UX Optimization Priority</p>
            <p className="text-sm text-muted-foreground">Listing View → Inquiry conversion (76.6% drop-off) is the highest-impact optimization target — improving trust signals, adding more photos, and showing pricing benchmarks could increase inquiry rate by 15-25%.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UXQualityMonitoring;
