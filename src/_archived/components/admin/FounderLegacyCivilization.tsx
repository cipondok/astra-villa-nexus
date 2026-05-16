import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Clock, Globe, Shield, TrendingUp, Lightbulb, Award, Target } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const horizons = [
  {
    span: '10-Year',
    period: '2025–2035',
    milestones: [
      { title: 'Regional Market Leadership', status: 'in-progress', pct: 35 },
      { title: 'IPO or Major Liquidity Event', status: 'planned', pct: 10 },
      { title: '10 Country Expansion', status: 'planned', pct: 5 },
      { title: 'Institutional Capital Gateway', status: 'in-progress', pct: 20 },
    ],
  },
  {
    span: '25-Year',
    period: '2025–2050',
    milestones: [
      { title: 'Global Real Estate OS Standard', status: 'planned', pct: 2 },
      { title: 'Autonomous Market Coordination', status: 'planned', pct: 0 },
      { title: '$100B+ Transaction Volume', status: 'planned', pct: 0 },
      { title: 'Cross-Industry Infrastructure', status: 'planned', pct: 0 },
    ],
  },
  {
    span: '50-Year',
    period: '2025–2075',
    milestones: [
      { title: 'Civilization-Scale Housing Infrastructure', status: 'vision', pct: 0 },
      { title: 'Self-Evolving Intelligence Platform', status: 'vision', pct: 0 },
      { title: 'Intergenerational Wealth System', status: 'vision', pct: 0 },
      { title: 'Planetary Economic Coordination', status: 'vision', pct: 0 },
    ],
  },
];

const influenceData = [
  { year: '2025', influence: 5, markets: 2 },
  { year: '2028', influence: 18, markets: 5 },
  { year: '2032', influence: 42, markets: 12 },
  { year: '2038', influence: 65, markets: 25 },
  { year: '2045', influence: 82, markets: 40 },
  { year: '2050', influence: 92, markets: 50 },
];

const innovationRoadmap = [
  { phase: 'AI-First Marketplace', timeline: '2025–2027', status: 'active', readiness: 60 },
  { phase: 'Autonomous Operations', timeline: '2027–2030', status: 'preparing', readiness: 15 },
  { phase: 'Cross-Asset Intelligence', timeline: '2030–2035', status: 'concept', readiness: 5 },
  { phase: 'Economic OS Layer', timeline: '2035–2045', status: 'vision', readiness: 0 },
  { phase: 'Civilization Infrastructure', timeline: '2045+', status: 'vision', readiness: 0 },
];

const FounderLegacyCivilization = () => {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <Crown className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Founder Legacy Civilization Strategy</h2>
          <Badge variant="outline">♛ Century Vision</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Multi-decade platform evolution and lasting global infrastructure impact</p>
      </motion.div>

      {/* Narrative Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 text-center">
          <h3 className="text-lg font-bold text-foreground mb-1">ASTRA Civilization-Scale Development Path</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">From marketplace startup to planetary real estate coordination infrastructure — a multi-generational vision for economic empowerment through intelligent property systems.</p>
        </CardContent>
      </Card>

      {/* Horizon Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {horizons.map((h, hi) => (
          <motion.div key={hi} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: hi * 0.1 }}>
            <Card className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{h.span} Horizon</CardTitle>
                  <Badge variant="secondary" className="text-xs">{h.period}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {h.milestones.map((m, mi) => (
                  <div key={mi}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.status === 'in-progress' ? 'bg-primary' : m.status === 'planned' ? 'bg-amber-500' : 'bg-muted-foreground/30'}`} />
                        <p className="text-sm text-foreground">{m.title}</p>
                      </div>
                    </div>
                    {m.pct > 0 && <Progress value={m.pct} className="h-1.5 ml-4.5" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Influence Trajectory */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Platform Influence Expansion Trajectory</CardTitle></CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={influenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
              <Area type="monotone" dataKey="influence" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} name="Global Influence Score" />
              <Area type="monotone" dataKey="markets" stroke="hsl(var(--chart-2, 200 80% 55%))" fill="hsl(var(--chart-2, 200 80% 55%)/0.1)" name="Active Markets" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Innovation Roadmap */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Innovation Roadmap Timeline</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {innovationRoadmap.map((r, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
              <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${r.status === 'active' ? 'bg-primary/15 text-primary' : r.status === 'preparing' ? 'bg-amber-500/15 text-amber-500' : 'bg-muted-foreground/10 text-muted-foreground'}`}>
                  <Target className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground text-sm">{r.phase}</p>
                    <Badge variant={r.status === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">{r.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.timeline}</p>
                  {r.readiness > 0 && <Progress value={r.readiness} className="h-1 mt-1.5" />}
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Institutionalization & Continuity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Institutionalization Readiness</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { metric: 'Governance Structure', score: 45 },
              { metric: 'Succession Planning', score: 15 },
              { metric: 'Knowledge Codification', score: 55 },
              { metric: 'Operational Independence', score: 30 },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{s.metric}</span>
                  <span className="font-medium text-foreground">{s.score}%</span>
                </div>
                <Progress value={s.score} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Leadership Continuity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { role: 'CEO / Founder', status: 'Active', depth: 'Primary' },
              { role: 'CTO Succession', status: 'Planning', depth: 'Identified' },
              { role: 'COO Pipeline', status: 'Open', depth: 'Searching' },
              { role: 'Board Formation', status: 'Preparing', depth: 'Advisory' },
            ].map((l, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span className="text-sm text-foreground">{l.role}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{l.status}</Badge>
                  <span className="text-xs text-muted-foreground">{l.depth}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Award className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Civilization Strategy Insight</p>
            <p className="text-sm text-muted-foreground">Leadership thinking beyond startup cycles positions ASTRA for lasting global infrastructure impact — current AI-first marketplace phase building foundation for autonomous economic coordination layer.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FounderLegacyCivilization;
