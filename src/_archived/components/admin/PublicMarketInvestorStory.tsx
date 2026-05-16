import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Globe, Shield, Users, Lightbulb, Award, Target, BarChart3, Gauge } from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts';
import { motion } from 'framer-motion';

const revenueNarrative = [
  { period: 'Q1 24', revenue: 0.1, arr: 0.4 },
  { period: 'Q2 24', revenue: 0.3, arr: 1.2 },
  { period: 'Q3 24', revenue: 0.8, arr: 3.2 },
  { period: 'Q4 24', revenue: 1.5, arr: 6 },
  { period: 'Q1 25', revenue: 2.5, arr: 10 },
  { period: 'Q2 25', revenue: 4, arr: 16 },
  { period: 'Q3 25P', revenue: 6.5, arr: 26 },
  { period: 'Q4 25P', revenue: 10, arr: 40 },
];

const networkStrength = [
  { quarter: 'Q1', users: 2, agents: 0.5, listings: 1 },
  { quarter: 'Q2', users: 8, agents: 2, listings: 4 },
  { quarter: 'Q3', users: 25, agents: 5, listings: 12 },
  { quarter: 'Q4', users: 60, agents: 12, listings: 28 },
  { quarter: 'Q5P', users: 120, agents: 25, listings: 55 },
  { quarter: 'Q6P', users: 250, agents: 50, listings: 100 },
];

const moatRadar = [
  { axis: 'Data Moat', score: 82 },
  { axis: 'Network Effect', score: 75 },
  { axis: 'Liquidity Depth', score: 70 },
  { axis: 'AI Intelligence', score: 85 },
  { axis: 'Brand Trust', score: 65 },
  { axis: 'Switching Cost', score: 72 },
];

const ipoTimeline = [
  { milestone: 'Seed / Angel Round', date: '2024', status: 'completed', pct: 100 },
  { milestone: 'Product-Market Fit', date: 'Q2 2025', status: 'in-progress', pct: 70 },
  { milestone: 'Series A Readiness', date: 'Q4 2025', status: 'planned', pct: 25 },
  { milestone: 'Regional Expansion', date: '2026', status: 'planned', pct: 10 },
  { milestone: 'Series B / Growth', date: '2027', status: 'planned', pct: 0 },
  { milestone: 'Pre-IPO Round', date: '2028', status: 'planned', pct: 0 },
  { milestone: 'IPO / Public Listing', date: '2029+', status: 'vision', pct: 0 },
];

const expansionMilestones = [
  { market: 'Jakarta', status: 'Dominant', share: 45 },
  { market: 'Greater Jakarta', status: 'Scaling', share: 28 },
  { market: 'Bali', status: 'Growing', share: 18 },
  { market: 'Surabaya', status: 'Entry', share: 8 },
  { market: 'Regional ASEAN', status: 'Planned', share: 2 },
];

const PublicMarketInvestorStory = () => {
  const valuationScore = 68;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3 mb-1">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Public Market Investor Story</h2>
          <Badge variant="outline">📈 Narrative Intelligence</Badge>
        </div>
        <p className="text-muted-foreground text-sm">Investor perception storytelling and valuation trajectory analytics</p>
      </motion.div>

      {/* Headline Narrative */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-5 text-center">
          <h3 className="text-lg font-bold text-foreground mb-1">ASTRA Public Market Growth Narrative Status</h3>
          <p className="text-sm text-muted-foreground">Property Liquidity Intelligence Infrastructure — Building the Bloomberg of Real Estate</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Valuation Momentum: Rising</Badge>
            <Badge variant="outline">Target Multiple: 15–35x Revenue</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Investor Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'ARR', value: '$16M', color: 'text-primary' },
          { label: 'Revenue Growth', value: '+180%', color: 'text-emerald-500' },
          { label: 'GTV', value: '$420M', color: 'text-primary' },
          { label: 'CAC:LTV', value: '5.2:1', color: 'text-emerald-500' },
          { label: 'IPO Score', value: `${valuationScore}/100`, color: 'text-amber-500' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card><CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
            </CardContent></Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2"><CardTitle className="text-base">Revenue Scaling Narrative ($M)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueNarrative}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="period" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
                <Area type="monotone" dataKey="arr" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.15)" strokeWidth={2} name="ARR" />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2, 200 80% 55%))" fill="hsl(var(--chart-2, 200 80% 55%)/0.1)" name="Quarterly Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Strategic Moat Strength</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={moatRadar}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                <Radar dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary)/0.2)" strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Network Effect */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Network Effect Strength (K units)</CardTitle></CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={networkStrength}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="quarter" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))' }} />
              <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} name="Users (K)" />
              <Line type="monotone" dataKey="agents" stroke="hsl(var(--chart-2, 200 80% 55%))" name="Agents (K)" />
              <Line type="monotone" dataKey="listings" stroke="hsl(var(--chart-3, 150 60% 50%))" name="Listings (K)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* IPO Timeline */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">IPO Readiness Storyline</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {ipoTimeline.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full shrink-0 ${m.status === 'completed' ? 'bg-emerald-500' : m.status === 'in-progress' ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${m.status === 'completed' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{m.milestone}</p>
                    <span className="text-xs text-muted-foreground">{m.date}</span>
                  </div>
                  {m.pct > 0 && m.pct < 100 && <Progress value={m.pct} className="h-1 mt-1" />}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Expansion Milestones */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Global Expansion Milestones</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {expansionMilestones.map((m, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{m.market}</span>
                    <Badge variant={m.status === 'Dominant' ? 'default' : 'secondary'} className="text-xs">{m.status}</Badge>
                  </div>
                  <span className="text-foreground font-medium">{m.share}%</span>
                </div>
                <Progress value={m.share} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Confidence Gauge */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Institutional Confidence Indicator</p>
              <p className="text-sm text-muted-foreground">Based on revenue trajectory, moat depth, and market positioning</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">{valuationScore}/100</p>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Strengthening</Badge>
            </div>
          </div>
          <Progress value={valuationScore} className="h-3 mt-3" />
        </CardContent>
      </Card>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex items-start gap-3">
          <Award className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-foreground text-sm">Investor Narrative Insight</p>
            <p className="text-sm text-muted-foreground">ASTRA's public market story centers on 'Property Liquidity Intelligence Infrastructure' — a category-defining narrative combining network effects, AI intelligence moat, and cross-border expansion potential to justify premium revenue multiples.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicMarketInvestorStory;
