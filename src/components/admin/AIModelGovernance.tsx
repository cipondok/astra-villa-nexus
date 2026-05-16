import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, AlertTriangle, CheckCircle, RefreshCw, Eye, Clock, TrendingUp, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const accuracyTrend = [
  { month: 'Oct', pricing: 82, demand: 76, matching: 74 },
  { month: 'Nov', pricing: 84, demand: 79, matching: 77 },
  { month: 'Dec', pricing: 86, demand: 81, matching: 80 },
  { month: 'Jan', pricing: 88, demand: 84, matching: 83 },
  { month: 'Feb', pricing: 89, demand: 86, matching: 85 },
  { month: 'Mar', pricing: 91, demand: 88, matching: 87 },
];

const confidenceDistribution = [
  { range: '90-100%', count: 340 },
  { range: '80-89%', count: 520 },
  { range: '70-79%', count: 280 },
  { range: '60-69%', count: 120 },
  { range: '<60%', count: 45 },
];

const models = [
  { name: 'Property Pricing Model', version: 'v3.2.1', accuracy: 91, drift: 'Low', lastRetrain: '3 days ago', nextRetrain: '4 days', bias: 'None', status: 'Active' },
  { name: 'Demand Prediction Model', version: 'v2.8.0', accuracy: 88, drift: 'Low', lastRetrain: '5 days ago', nextRetrain: '2 days', bias: 'None', status: 'Active' },
  { name: 'Buyer-Property Matching', version: 'v2.4.3', accuracy: 87, drift: 'Medium', lastRetrain: '6 days ago', nextRetrain: '1 day', bias: 'Monitor', status: 'Active' },
  { name: 'Agent Performance Scorer', version: 'v1.6.0', accuracy: 84, drift: 'Low', lastRetrain: '2 days ago', nextRetrain: '5 days', bias: 'None', status: 'Active' },
];

const recentDecisions = [
  { time: '2 min ago', model: 'Pricing', decision: 'Recommended -3.2% price adjustment for listing L-4521', confidence: 94, outcome: 'Pending' },
  { time: '8 min ago', model: 'Matching', decision: 'Matched buyer B-892 with 4 properties in Menteng', confidence: 89, outcome: 'Click-through' },
  { time: '15 min ago', model: 'Demand', decision: 'Demand surge flagged for BSD City apartments', confidence: 91, outcome: 'Confirmed' },
  { time: '22 min ago', model: 'Pricing', decision: 'Underpriced alert for villa listing L-3847', confidence: 86, outcome: 'Seller notified' },
  { time: '35 min ago', model: 'Matching', decision: 'High-intent buyer B-1104 → 3 investment properties', confidence: 92, outcome: 'Viewing booked' },
];

const AIModelGovernance = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">AI Model Governance & Monitoring</h2>
          <Badge variant="outline">🧠 MLOps</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Model accuracy, drift detection, retraining cycles, and AI decision audit trail</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Models', value: '4' },
          { label: 'Avg Accuracy', value: '87.5%' },
          { label: 'Retrain Cycle', value: '7 days' },
          { label: 'Drift Alerts', value: '1' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card><CardContent className="p-4 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-xl font-bold text-primary">{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="models">
        <TabsList><TabsTrigger value="models">Model Registry</TabsTrigger><TabsTrigger value="accuracy">Accuracy Trends</TabsTrigger><TabsTrigger value="decisions">Decision Log</TabsTrigger></TabsList>

        <TabsContent value="models" className="mt-4 space-y-2">
          {models.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Brain className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        <Badge variant="outline" className="font-mono text-xs">{m.version}</Badge>
                        <Badge variant="default" className="text-xs">{m.status}</Badge>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-primary">{m.accuracy}%</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="p-2 rounded bg-muted/50 border border-border text-center">
                      <p className="text-xs text-muted-foreground">Data Drift</p>
                      <Badge variant={m.drift === 'Low' ? 'default' : 'destructive'} className="text-xs mt-1">{m.drift}</Badge>
                    </div>
                    <div className="p-2 rounded bg-muted/50 border border-border text-center">
                      <p className="text-xs text-muted-foreground">Last Retrain</p>
                      <p className="text-xs font-medium text-foreground mt-1">{m.lastRetrain}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50 border border-border text-center">
                      <p className="text-xs text-muted-foreground">Next Retrain</p>
                      <p className="text-xs font-medium text-foreground mt-1">{m.nextRetrain}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50 border border-border text-center">
                      <p className="text-xs text-muted-foreground">Bias Risk</p>
                      <Badge variant={m.bias === 'None' ? 'default' : 'secondary'} className="text-xs mt-1">{m.bias}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </TabsContent>

        <TabsContent value="accuracy" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Model Accuracy Over Time (%)</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={accuracyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis domain={[70, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
                  <Line type="monotone" dataKey="pricing" stroke="hsl(var(--primary))" name="Pricing" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="demand" stroke="hsl(142 76% 36%)" name="Demand" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="matching" stroke="hsl(38 92% 50%)" name="Matching" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Prediction Confidence Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={confidenceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Predictions" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="decisions" className="mt-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-base">Recent AI Decisions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {recentDecisions.map((d, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  <Eye className="h-4 w-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{d.decision}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{d.time}
                      <Badge variant="secondary" className="text-xs">{d.model}</Badge>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">{d.confidence}%</p>
                    <Badge variant={d.outcome === 'Pending' ? 'secondary' : 'default'} className="text-xs">{d.outcome}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIModelGovernance;
