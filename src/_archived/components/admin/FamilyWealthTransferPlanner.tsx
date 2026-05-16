import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, FileText, Shield, TrendingUp, CheckCircle, AlertTriangle, Lightbulb, Crown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';

const projectionData = [
  { year: '2026', value: 5000 }, { year: '2028', value: 5800 }, { year: '2030', value: 6800 },
  { year: '2035', value: 9200 }, { year: '2040', value: 12500 }, { year: '2045', value: 16800 },
  { year: '2050', value: 22000 },
];

const beneficiaries = [
  { name: 'Child A', allocation: 40, properties: 2, color: 'hsl(var(--primary))' },
  { name: 'Child B', allocation: 35, properties: 1, color: 'hsl(var(--chart-2, 200 80% 55%))' },
  { name: 'Spouse', allocation: 15, properties: 1, color: 'hsl(var(--chart-3, 150 60% 50%))' },
  { name: 'Foundation', allocation: 10, properties: 0, color: 'hsl(var(--chart-4, 40 80% 55%))' },
];

const legalChecklist = [
  { item: 'Property ownership certificates verified', done: true },
  { item: 'Beneficiary designations documented', done: true },
  { item: 'Tax planning consultation completed', done: false },
  { item: 'Trust structure established', done: false },
  { item: 'Power of attorney assigned', done: true },
  { item: 'Succession timeline reviewed', done: false },
];

const FamilyWealthTransferPlanner = () => {
  const readinessScore = Math.round((legalChecklist.filter(l => l.done).length / legalChecklist.length) * 100);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Crown className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Family Wealth Transfer Planner</h2>
          <Badge variant="outline">👨‍👩‍👧‍👦 Legacy</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Structure inheritance and generational wealth preservation</p>
      </motion.div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Estate Value', value: 'Rp 5.0B', icon: TrendingUp, color: 'text-primary' },
          { label: 'Properties Owned', value: '4', icon: Shield, color: 'text-emerald-500' },
          { label: 'Beneficiaries', value: '4', icon: Users, color: 'text-amber-500' },
          { label: 'Planning Readiness', value: `${readinessScore}%`, icon: CheckCircle, color: readinessScore > 60 ? 'text-emerald-500' : 'text-amber-500' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <m.icon className={`h-5 w-5 mx-auto mb-1 ${m.color}`} />
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-lg font-bold text-foreground">{m.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Allocation Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Beneficiary Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={beneficiaries} dataKey="allocation" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} strokeWidth={2} stroke="hsl(var(--background))">
                    {beneficiaries.map((b, i) => (
                      <Cell key={i} fill={b.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {beneficiaries.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                    <span className="text-foreground">{b.name}</span>
                  </div>
                  <span className="font-medium text-foreground">{b.allocation}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Projection Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Long-Term Asset Preservation Projection</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} formatter={(v: number) => [`Rp ${v}M`, 'Estate Value']} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.12)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legal Checklist */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Legal Documentation Checklist</CardTitle>
              <Badge variant="secondary">{legalChecklist.filter(l => l.done).length}/{legalChecklist.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-4">
              {legalChecklist.map((l, i) => (
                <div key={i} className="flex items-center gap-3">
                  {l.done ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> : <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 shrink-0" />}
                  <span className={`text-sm ${l.done ? 'text-foreground' : 'text-muted-foreground'}`}>{l.item}</span>
                </div>
              ))}
            </div>
            <Progress value={readinessScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">Estate planning readiness: {readinessScore}%</p>
          </CardContent>
        </Card>

        {/* Tax & Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Transfer Timeline & Tax Implications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { phase: 'Phase 1: Documentation', timeline: '2026–2027', status: 'In Progress', pct: 50 },
              { phase: 'Phase 2: Trust Establishment', timeline: '2027–2028', status: 'Planned', pct: 0 },
              { phase: 'Phase 3: Gradual Transfer', timeline: '2028–2035', status: 'Planned', pct: 0 },
            ].map((p, i) => (
              <div key={i} className="p-3 rounded-lg bg-muted/50 border border-border">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.phase}</p>
                    <p className="text-xs text-muted-foreground">{p.timeline}</p>
                  </div>
                  <Badge variant={p.pct > 0 ? 'default' : 'secondary'} className="text-xs">{p.status}</Badge>
                </div>
                <Progress value={p.pct} className="h-1.5" />
              </div>
            ))}

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">Estimated transfer tax: Rp 250M — consult tax advisor for optimization strategies.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insight */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Wealth Preservation Insight</p>
            <p className="text-sm text-muted-foreground">Starting structured transfer within 2 years could reduce total tax exposure by approximately 15–20% through phased allocation strategies.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyWealthTransferPlanner;
