import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Building2, Users, Store, Megaphone, Target, TrendingUp, Flame, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const districtData = [
  { name: 'Menteng', city: 'Jakarta', txDensity: 94, rentalDemand: 91, devPipeline: 87, capitalConc: 95, digitalAdopt: 88, vendorReady: 82, score: 92 },
  { name: 'Kebayoran Baru', city: 'Jakarta', txDensity: 89, rentalDemand: 86, devPipeline: 91, capitalConc: 88, digitalAdopt: 85, vendorReady: 79, score: 87 },
  { name: 'Dago', city: 'Bandung', txDensity: 82, rentalDemand: 88, devPipeline: 75, capitalConc: 72, digitalAdopt: 90, vendorReady: 68, score: 79 },
  { name: 'Seminyak', city: 'Bali', txDensity: 91, rentalDemand: 95, devPipeline: 83, capitalConc: 78, digitalAdopt: 76, vendorReady: 85, score: 85 },
  { name: 'Pakuwon', city: 'Surabaya', txDensity: 78, rentalDemand: 74, devPipeline: 88, capitalConc: 70, digitalAdopt: 72, vendorReady: 65, score: 74 },
  { name: 'BSD City', city: 'Tangerang', txDensity: 85, rentalDemand: 80, devPipeline: 92, capitalConc: 82, digitalAdopt: 83, vendorReady: 71, score: 82 },
];

const tacticalModules = [
  {
    id: 'inventory',
    title: 'Inventory Capture Blitz',
    icon: Building2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    checklist: [
      { task: 'Developer acquisition outreach (top 20 per district)', status: 'done' },
      { task: 'Agent onboarding sprint — 50 agents/week target', status: 'active' },
      { task: 'Verified listing upload workflow automation', status: 'active' },
      { task: 'Exclusive listing partnership agreements', status: 'pending' },
      { task: 'Off-plan inventory pipeline integration', status: 'pending' },
    ],
    kpis: { target: '2,500 verified listings/month', current: '1,847', progress: 74 },
  },
  {
    id: 'liquidity',
    title: 'Liquidity Ignition Campaign',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    checklist: [
      { task: 'Targeted buyer marketing (Google/Meta/TikTok)', status: 'done' },
      { task: 'Curated investor deal launch events', status: 'active' },
      { task: 'Premium visibility boosts for high-conversion listings', status: 'active' },
      { task: 'Flash deal weekends with urgency triggers', status: 'pending' },
      { task: 'Investor WhatsApp broadcast campaigns', status: 'pending' },
    ],
    kpis: { target: '6.4% conversion rate', current: '4.8%', progress: 75 },
  },
  {
    id: 'vendor',
    title: 'Vendor Network Saturation',
    icon: Store,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    checklist: [
      { task: 'Recruit vendors in top 5 service categories', status: 'done' },
      { task: 'Deploy local performance incentive tiers', status: 'active' },
      { task: 'Activate service routing optimization', status: 'active' },
      { task: 'Vendor exclusivity contracts in priority zones', status: 'pending' },
      { task: 'Vendor referral chain activation', status: 'pending' },
    ],
    kpis: { target: '200 active vendors/city', current: '142', progress: 71 },
  },
  {
    id: 'brand',
    title: 'Brand Visibility Strike',
    icon: Megaphone,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    checklist: [
      { task: 'Influencer property tour content (5 per district)', status: 'active' },
      { task: 'Localized data insight media releases', status: 'active' },
      { task: 'Referral incentive activations', status: 'pending' },
      { task: 'Developer co-branding partnerships', status: 'pending' },
      { task: 'Community event sponsorships', status: 'pending' },
    ],
    kpis: { target: '500K impressions/month', current: '328K', progress: 66 },
  },
];

const phases = [
  { phase: 1, name: 'Intelligence Preparation', duration: 'Week 1-2', progress: 100, tasks: ['District scoring', 'Competitor mapping', 'Supply gap analysis'] },
  { phase: 2, name: 'Supply Activation', duration: 'Week 3-6', progress: 72, tasks: ['Developer outreach', 'Agent onboarding', 'Listing pipeline'] },
  { phase: 3, name: 'Demand Activation', duration: 'Week 7-10', progress: 45, tasks: ['Buyer campaigns', 'Investor events', 'Visibility boosts'] },
  { phase: 4, name: 'Transaction Kickstart', duration: 'Week 11-14', progress: 18, tasks: ['Deal facilitation', 'Negotiation support', 'Escrow activation'] },
  { phase: 5, name: 'Social Proof Explosion', duration: 'Week 15-18', progress: 0, tasks: ['Success stories', 'Media coverage', 'Referral chains'] },
  { phase: 6, name: 'Scale Trigger', duration: 'Week 19-24', progress: 0, tasks: ['Auto-scaling campaigns', 'City replication', 'Flywheel lock-in'] },
];

const kpiBenchmarks = [
  { metric: 'Verified Listings', target: '2,500/mo', benchmark: 'Top 10% district coverage', status: 'on-track' },
  { metric: 'Listing Absorption Rate', target: '<45 days', benchmark: '2x faster than market avg', status: 'on-track' },
  { metric: 'Investor Engagement', target: '15% inquiry rate', benchmark: 'Industry leading', status: 'at-risk' },
  { metric: 'Vendor Coverage', target: '200/city', benchmark: 'All 8 service categories', status: 'on-track' },
  { metric: 'Deal Velocity', target: '120 deals/mo', benchmark: '30-day close cycle', status: 'behind' },
  { metric: 'Brand Recall', target: '35% aided recall', benchmark: 'Top 3 in category', status: 'at-risk' },
];

const statusIcon = (s: string) => {
  if (s === 'done') return <CheckCircle className="h-4 w-4 text-emerald-500" />;
  if (s === 'active') return <Clock className="h-4 w-4 text-amber-500" />;
  return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />;
};

const kpiStatusBadge = (s: string) => {
  if (s === 'on-track') return <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">On Track</Badge>;
  if (s === 'at-risk') return <Badge className="bg-amber-100 text-amber-700 text-[10px]">At Risk</Badge>;
  return <Badge className="bg-red-100 text-red-700 text-[10px]">Behind</Badge>;
};

const scoreColor = (v: number) => v >= 85 ? 'text-emerald-600' : v >= 70 ? 'text-amber-600' : 'text-red-500';

const MegaCityDominationPanel: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const cities = ['All', ...Array.from(new Set(districtData.map(d => d.city)))];
  const filtered = selectedCity === 'All' ? districtData : districtData.filter(d => d.city === selectedCity);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Target Cities', value: '4', icon: MapPin, accent: 'text-primary' },
          { label: 'Priority Districts', value: '24', icon: Target, accent: 'text-orange-600' },
          { label: 'Active Campaigns', value: '18', icon: Megaphone, accent: 'text-purple-600' },
          { label: 'Domination Score', value: '73/100', icon: TrendingUp, accent: 'text-emerald-600' },
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

      <Tabs defaultValue="districts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="districts" className="text-xs">District Targeting</TabsTrigger>
          <TabsTrigger value="tactical" className="text-xs">Tactical Modules</TabsTrigger>
          <TabsTrigger value="kpis" className="text-xs">KPI Benchmarks</TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs">Domination Timeline</TabsTrigger>
        </TabsList>

        {/* Tab 1: District Targeting */}
        <TabsContent value="districts" className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {cities.map(c => (
              <Badge
                key={c}
                variant={selectedCity === c ? 'default' : 'outline'}
                className="cursor-pointer text-xs"
                onClick={() => setSelectedCity(c)}
              >
                {c}
              </Badge>
            ))}
          </div>
          <div className="grid gap-3">
            {filtered.sort((a, b) => b.score - a.score).map(d => (
              <Card key={d.name} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{d.name}</span>
                      <Badge variant="outline" className="text-[10px]">{d.city}</Badge>
                    </div>
                    <div className={`text-xl font-bold ${scoreColor(d.score)}`}>{d.score}</div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-[11px]">
                    {[
                      { label: 'Tx Density', val: d.txDensity },
                      { label: 'Rental Demand', val: d.rentalDemand },
                      { label: 'Dev Pipeline', val: d.devPipeline },
                      { label: 'Capital Conc.', val: d.capitalConc },
                      { label: 'Digital Adopt.', val: d.digitalAdopt },
                      { label: 'Vendor Ready', val: d.vendorReady },
                    ].map(m => (
                      <div key={m.label} className="text-center">
                        <p className="text-muted-foreground">{m.label}</p>
                        <p className={`font-semibold ${scoreColor(m.val)}`}>{m.val}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 2: Tactical Modules */}
        <TabsContent value="tactical" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {tacticalModules.map(mod => (
              <Card key={mod.id} className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-md ${mod.bgColor}`}>
                      <mod.icon className={`h-4 w-4 ${mod.color}`} />
                    </div>
                    <CardTitle className="text-sm">{mod.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {mod.checklist.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        {statusIcon(item.status)}
                        <span className={item.status === 'done' ? 'line-through text-muted-foreground' : ''}>{item.task}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-muted-foreground">Target: {mod.kpis.target}</span>
                      <span className="font-medium">{mod.kpis.current}</span>
                    </div>
                    <Progress value={mod.kpis.progress} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: KPI Benchmarks */}
        <TabsContent value="kpis" className="space-y-3">
          {kpiBenchmarks.map(kpi => (
            <Card key={kpi.metric} className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-medium text-sm">{kpi.metric}</p>
                  <p className="text-xs text-muted-foreground">{kpi.benchmark}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">{kpi.target}</span>
                  {kpiStatusBadge(kpi.status)}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab 4: Domination Timeline */}
        <TabsContent value="timeline" className="space-y-3">
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
                  {p.tasks.map(t => (
                    <Badge key={t} variant="outline" className="text-[10px] font-normal">{t}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MegaCityDominationPanel;
