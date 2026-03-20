import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Building2, Target, Send, TrendingUp, Users, CheckCircle, Clock, ArrowUp, MapPin, Star, Zap } from 'lucide-react';

const developers = [
  { name: 'Ciputra Group', city: 'Jakarta', projects: 12, txSuccess: 94, absorption: 88, reputation: 96, priceComp: 82, demandAlign: 91, score: 93, status: 'engaged' },
  { name: 'Agung Podomoro', city: 'Jakarta', projects: 9, txSuccess: 87, absorption: 82, reputation: 90, priceComp: 85, demandAlign: 88, score: 88, status: 'outreach' },
  { name: 'Summarecon', city: 'Tangerang', projects: 7, txSuccess: 91, absorption: 90, reputation: 88, priceComp: 78, demandAlign: 85, score: 86, status: 'new' },
  { name: 'Pakuwon Jati', city: 'Surabaya', projects: 8, txSuccess: 89, absorption: 85, reputation: 84, priceComp: 80, demandAlign: 79, score: 83, status: 'engaged' },
  { name: 'Intiland Dev', city: 'Jakarta', projects: 5, txSuccess: 82, absorption: 78, reputation: 80, priceComp: 88, demandAlign: 82, score: 81, status: 'outreach' },
  { name: 'Vasanta Group', city: 'Bandung', projects: 4, txSuccess: 78, absorption: 75, reputation: 76, priceComp: 90, demandAlign: 86, score: 79, status: 'new' },
];

const campaignStages = [
  { stage: 'Identified', count: 42, color: 'bg-muted' },
  { stage: 'Outreach Sent', count: 28, color: 'bg-blue-100' },
  { stage: 'In Discussion', count: 14, color: 'bg-amber-100' },
  { stage: 'Terms Proposed', count: 8, color: 'bg-orange-100' },
  { stage: 'Onboarding', count: 5, color: 'bg-emerald-100' },
  { stage: 'Active Partner', count: 18, color: 'bg-emerald-200' },
];

const outreachStrategies = [
  { trigger: 'Score ≥ 90', action: 'VIP personal outreach by BD lead', channel: 'Direct call + meeting', incentive: 'Free premium listings (6 months)', timeline: 'Within 48h' },
  { trigger: 'Score 80-89', action: 'Personalized email sequence (5-touch)', channel: 'Email + WhatsApp', incentive: 'Featured placement (3 months)', timeline: 'Within 1 week' },
  { trigger: 'Score 70-79', action: 'Automated nurture campaign', channel: 'Email drip + retargeting', incentive: 'Commission discount (first 10 units)', timeline: 'Within 2 weeks' },
  { trigger: 'New project launch detected', action: 'Instant outreach trigger', channel: 'WhatsApp + call', incentive: 'Launch event co-promotion', timeline: 'Same day' },
];

const cityScaling = [
  { city: 'Jakarta', developers: 18, listings: 2_400, coverage: 72, revenue: 'Rp 4.2B', phase: 'Scale' },
  { city: 'Bali', developers: 12, listings: 1_100, coverage: 58, revenue: 'Rp 2.1B', phase: 'Growth' },
  { city: 'Bandung', developers: 8, listings: 650, coverage: 41, revenue: 'Rp 890M', phase: 'Launch' },
  { city: 'Surabaya', developers: 6, listings: 480, coverage: 35, revenue: 'Rp 620M', phase: 'Launch' },
  { city: 'Tangerang', developers: 10, listings: 850, coverage: 52, revenue: 'Rp 1.4B', phase: 'Growth' },
];

const phases = [
  { phase: 1, name: 'Intelligence Layer', duration: 'Month 1-2', progress: 100, items: ['Developer profiling', 'Scoring algorithm', 'Market demand mapping'] },
  { phase: 2, name: 'Outreach Automation', duration: 'Month 3-4', progress: 55, items: ['Campaign sequences', 'CRM integration', 'Incentive engine'] },
  { phase: 3, name: 'Partnership Pipeline', duration: 'Month 5-7', progress: 20, items: ['Contract templates', 'Onboarding workflow', 'Listing sync API'] },
  { phase: 4, name: 'Multi-City Scaling', duration: 'Month 8-12', progress: 0, items: ['City replication playbook', 'Regional BD teams', 'Performance benchmarks'] },
];

const statusBadge = (s: string) => {
  if (s === 'engaged') return <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Engaged</Badge>;
  if (s === 'outreach') return <Badge className="bg-blue-100 text-blue-700 text-[10px]">Outreach</Badge>;
  return <Badge className="bg-muted text-muted-foreground text-[10px]">New Lead</Badge>;
};

const scoreColor = (v: number) => v >= 85 ? 'text-emerald-600' : v >= 70 ? 'text-amber-600' : 'text-red-500';

const phaseBadge = (p: string) => {
  if (p === 'Scale') return <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Scale</Badge>;
  if (p === 'Growth') return <Badge className="bg-blue-100 text-blue-700 text-[10px]">Growth</Badge>;
  return <Badge className="bg-amber-100 text-amber-700 text-[10px]">Launch</Badge>;
};

const DeveloperSupplyAcquisitionPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Developer Partners', value: '18', icon: Building2, accent: 'text-primary' },
          { label: 'Pipeline Leads', value: '42', icon: Target, accent: 'text-orange-600' },
          { label: 'Projected Listings', value: '3,200', icon: TrendingUp, accent: 'text-emerald-600' },
          { label: 'Revenue Impact', value: 'Rp 9.1B', icon: Zap, accent: 'text-purple-600' },
        ].map(s => (
          <Card key={s.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <s.icon className={`h-5 w-5 ${s.accent}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-semibold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="scoring" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="scoring" className="text-xs">Developer Scoring</TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs">Campaign Automation</TabsTrigger>
          <TabsTrigger value="pipeline" className="text-xs">Partnership Pipeline</TabsTrigger>
          <TabsTrigger value="scaling" className="text-xs">Multi-City Scaling</TabsTrigger>
        </TabsList>

        {/* Tab 1: Developer Scoring */}
        <TabsContent value="scoring" className="space-y-3">
          {developers.sort((a, b) => b.score - a.score).map(d => (
            <Card key={d.name} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{d.name}</span>
                    <Badge variant="outline" className="text-[10px]">{d.city}</Badge>
                    {statusBadge(d.status)}
                  </div>
                  <div className={`text-xl font-bold ${scoreColor(d.score)}`}>{d.score}</div>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                  {[
                    { label: 'Projects', val: d.projects },
                    { label: 'Tx Success', val: `${d.txSuccess}%` },
                    { label: 'Absorption', val: `${d.absorption}%` },
                    { label: 'Reputation', val: d.reputation },
                    { label: 'Price Comp.', val: d.priceComp },
                    { label: 'Demand Fit', val: d.demandAlign },
                  ].map(m => (
                    <div key={m.label} className="text-center">
                      <p className="text-muted-foreground">{m.label}</p>
                      <p className="font-semibold">{m.val}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab 2: Campaign Automation */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Outreach Decision Logic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {outreachStrategies.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Send className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-xs">{s.trigger}</p>
                      <Badge variant="outline" className="text-[10px]">{s.timeline}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{s.action}</p>
                    <div className="flex gap-2 text-[10px]">
                      <span className="text-muted-foreground">Channel: {s.channel}</span>
                      <span className="text-emerald-600">Incentive: {s.incentive}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pipeline funnel */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Pipeline Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {campaignStages.map(s => (
                  <div key={s.stage} className="flex items-center gap-3">
                    <span className="text-xs w-28 text-muted-foreground">{s.stage}</span>
                    <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden">
                      <div
                        className={`h-full ${s.color} rounded flex items-center px-2`}
                        style={{ width: `${(s.count / 42) * 100}%` }}
                      >
                        <span className="text-[10px] font-semibold">{s.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Partnership Pipeline */}
        <TabsContent value="pipeline" className="space-y-3">
          {phases.map(p => (
            <Card key={p.phase} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      p.progress === 100 ? 'bg-emerald-100 text-emerald-700' :
                      p.progress > 0 ? 'bg-amber-100 text-amber-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {p.phase}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.duration}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{p.progress}%</span>
                </div>
                <Progress value={p.progress} className="h-1.5 mb-2" />
                <div className="flex flex-wrap gap-1.5">
                  {p.items.map(t => (
                    <Badge key={t} variant="outline" className="text-[10px] font-normal">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab 4: Multi-City Scaling */}
        <TabsContent value="scaling" className="space-y-3">
          {cityScaling.map(c => (
            <Card key={c.city} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{c.city}</span>
                    {phaseBadge(c.phase)}
                  </div>
                  <span className="text-sm font-semibold">{c.revenue}</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Developers</p>
                    <p className="font-semibold">{c.developers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Listings</p>
                    <p className="font-semibold">{c.listings.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Coverage</p>
                    <div className="flex items-center gap-2">
                      <Progress value={c.coverage} className="h-1.5 flex-1" />
                      <span className="font-semibold">{c.coverage}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperSupplyAcquisitionPanel;
