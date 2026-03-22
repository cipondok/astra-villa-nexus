import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Globe, TrendingUp, Users, Award, Lightbulb, Target, BarChart3, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

const growthCurve = [
  { year: '2024', users: 2, transactions: 0.5, revenue: 0.1 },
  { year: '2025', users: 15, transactions: 5, revenue: 1.2 },
  { year: '2026', users: 85, transactions: 25, revenue: 8 },
  { year: '2027P', users: 250, transactions: 80, revenue: 28 },
  { year: '2028P', users: 500, transactions: 200, revenue: 65 },
  { year: '2029P', users: 1200, transactions: 500, revenue: 120 },
];

const regionalDominance = [
  { region: 'Jakarta', share: 45, status: 'Leader' },
  { region: 'Bali', share: 32, status: 'Challenger' },
  { region: 'Surabaya', share: 18, status: 'Emerging' },
  { region: 'Bandung', share: 12, status: 'Entry' },
  { region: 'Medan', share: 5, status: 'Planned' },
];

const milestones = [
  { title: 'First 1,000 Active Users', date: 'Q2 2025', status: 'completed', pct: 100 },
  { title: 'Liquidity Threshold in Jakarta', date: 'Q4 2025', status: 'completed', pct: 100 },
  { title: '$1M Monthly Revenue', date: 'Q2 2026', status: 'in-progress', pct: 65 },
  { title: 'Regional Market Leader', date: 'Q4 2026', status: 'planned', pct: 20 },
  { title: 'Institutional Capital Gateway', date: 'Q2 2027', status: 'planned', pct: 5 },
  { title: 'Global Expansion Launch', date: 'Q4 2027', status: 'planned', pct: 0 },
  { title: 'IPO Readiness Signal', date: '2029', status: 'planned', pct: 0 },
];

const infraStrength = [
  { metric: 'Liquidity Infrastructure', score: 78 },
  { metric: 'Data Intelligence Depth', score: 82 },
  { metric: 'Network Effect Velocity', score: 65 },
  { metric: 'Platform Stickiness', score: 72 },
  { metric: 'Revenue Diversification', score: 55 },
];

const GlobalLeadershipNarrative = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Globe className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Global Market Leadership Narrative</h2>
          <Badge variant="outline">🏆 Strategic Vision</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Track long-term progress toward market leadership and global dominance</p>
      </motion.div>

      {/* Headline Narrative */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 text-center">
          <h3 className="text-xl font-bold text-foreground mb-1">ASTRA Global Market Leadership Development Status</h3>
          <p className="text-sm text-muted-foreground">Building the world's most intelligent property marketplace infrastructure</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Phase: Regional Scaling</Badge>
            <Badge variant="outline">Target: 2029 IPO Readiness</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Top Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Platform Users', value: '85K+', color: 'text-primary' },
          { label: 'Transactions', value: '25K+', color: 'text-emerald-500' },
          { label: 'Revenue ARR', value: '$8M', color: 'text-primary' },
          { label: 'Markets Active', value: '5', color: 'text-amber-500' },
          { label: 'Influence Score', value: '72/100', color: 'text-primary' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card><CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Growth Curve */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Multi-Year Leadership Growth Curve</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} name="Revenue ($M)" />
                <Area type="monotone" dataKey="transactions" stroke="hsl(var(--chart-2, 200 80% 55%))" fill="hsl(var(--chart-2, 200 80% 55%)/0.1)" name="Transactions (K)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Regional Dominance */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Regional Market Share</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {regionalDominance.map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{r.region}</span>
                      <Badge variant={r.status === 'Leader' ? 'default' : 'secondary'} className="text-xs">{r.status}</Badge>
                    </div>
                    <span className="text-foreground font-medium">{r.share}%</span>
                  </div>
                  <Progress value={r.share} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Milestone Timeline */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Strategic Milestone Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shrink-0 ${m.status === 'completed' ? 'bg-emerald-500' : m.status === 'in-progress' ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm ${m.status === 'completed' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{m.title}</p>
                      <span className="text-xs text-muted-foreground">{m.date}</span>
                    </div>
                    {m.pct > 0 && m.pct < 100 && <Progress value={m.pct} className="h-1 mt-1" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure Strength */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Platform Infrastructure Strength</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {infraStrength.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{s.metric}</span>
                    <span className="font-medium text-foreground">{s.score}/100</span>
                  </div>
                  <Progress value={s.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Award className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Leadership Trajectory</p>
            <p className="text-sm text-muted-foreground">ASTRA is positioned to achieve regional market leadership by Q4 2026 and IPO readiness by 2029, driven by liquidity infrastructure depth and network effect acceleration.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GlobalLeadershipNarrative;
