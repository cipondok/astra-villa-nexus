import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, GitBranch, Bug, Clock, CheckCircle, TrendingUp, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const velocityData = [
  { sprint: 'S1', velocity: 24, planned: 28, bugs: 5 },
  { sprint: 'S2', velocity: 31, planned: 30, bugs: 4 },
  { sprint: 'S3', velocity: 28, planned: 32, bugs: 6 },
  { sprint: 'S4', velocity: 35, planned: 34, bugs: 3 },
  { sprint: 'S5', velocity: 38, planned: 36, bugs: 2 },
  { sprint: 'S6', velocity: 42, planned: 40, bugs: 3 },
];

const releaseFrequency = [
  { week: 'W1', deploys: 4, features: 2, fixes: 2 },
  { week: 'W2', deploys: 6, features: 3, fixes: 3 },
  { week: 'W3', deploys: 5, features: 2, fixes: 3 },
  { week: 'W4', deploys: 8, features: 4, fixes: 4 },
  { week: 'W5', deploys: 7, features: 3, fixes: 4 },
  { week: 'W6', deploys: 9, features: 5, fixes: 4 },
];

const recentReleases = [
  { version: 'v2.14.0', date: '2 days ago', features: 3, fixes: 2, status: 'Stable' },
  { version: 'v2.13.2', date: '5 days ago', features: 0, fixes: 4, status: 'Stable' },
  { version: 'v2.13.1', date: '1 week ago', features: 1, fixes: 1, status: 'Stable' },
  { version: 'v2.13.0', date: '1.5 weeks ago', features: 4, fixes: 3, status: 'Stable' },
  { version: 'v2.12.0', date: '2 weeks ago', features: 5, fixes: 2, status: 'Deprecated' },
];

const DevVelocityTracker = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Rocket className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Developer Productivity & Release Velocity</h2>
          <Badge variant="outline">🚀 DevOps</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Engineering throughput, deployment frequency, and release quality tracking</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Deploys / Week', value: '9', sub: '↑ 28% vs last' },
          { label: 'Feature Velocity', value: '5/wk', sub: 'New features shipped' },
          { label: 'Bug Resolution', value: '4.2h', sub: 'Avg time to fix' },
          { label: 'PR Cycle Time', value: '6.8h', sub: 'Open → merged' },
          { label: 'Sprint Velocity', value: '42 pts', sub: '↑ 10% trend' },
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Sprint Velocity Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="sprint" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
                <Area type="monotone" dataKey="velocity" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" name="Completed" />
                <Area type="monotone" dataKey="planned" stroke="hsl(var(--muted-foreground))" fill="transparent" strokeDasharray="5 5" name="Planned" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Weekly Release Frequency</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={releaseFrequency}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--popover-foreground))' }} />
                <Bar dataKey="features" fill="hsl(var(--primary))" name="Features" radius={[2, 2, 0, 0]} />
                <Bar dataKey="fixes" fill="hsl(var(--primary) / 0.4)" name="Bug Fixes" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Recent Releases</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {recentReleases.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <GitBranch className="h-4 w-4 text-primary shrink-0" />
              <Badge variant="outline" className="font-mono text-xs">{r.version}</Badge>
              <span className="text-xs text-muted-foreground">{r.date}</span>
              <div className="flex-1" />
              <div className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-muted-foreground"><CheckCircle className="h-3 w-3" />{r.features} features</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Bug className="h-3 w-3" />{r.fixes} fixes</span>
              </div>
              <Badge variant={r.status === 'Stable' ? 'default' : 'secondary'} className="text-xs">{r.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Engineering Insight</p>
            <p className="text-sm text-muted-foreground">Sprint velocity increased 75% over 6 sprints while bug count decreased — faster iteration with improving quality indicates healthy engineering culture.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevVelocityTracker;
