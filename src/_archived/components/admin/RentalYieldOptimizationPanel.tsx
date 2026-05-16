import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Home, BarChart3, Wrench, AlertTriangle, CheckCircle, ArrowUp, ArrowDown } from 'lucide-react';

const districtYields = [
  { district: 'Menteng', city: 'Jakarta', avgRent: 85_000_000, optimalRent: 92_000_000, occupancy: 94, yield: 7.2, gap: '+8.2%', trend: 'up' },
  { district: 'Seminyak', city: 'Bali', avgRent: 45_000_000, optimalRent: 52_000_000, occupancy: 89, yield: 9.1, gap: '+15.6%', trend: 'up' },
  { district: 'Dago', city: 'Bandung', avgRent: 18_000_000, optimalRent: 21_000_000, occupancy: 91, yield: 6.8, gap: '+16.7%', trend: 'up' },
  { district: 'Kebayoran', city: 'Jakarta', avgRent: 65_000_000, optimalRent: 62_000_000, occupancy: 82, yield: 5.4, gap: '-4.6%', trend: 'down' },
  { district: 'BSD City', city: 'Tangerang', avgRent: 22_000_000, optimalRent: 25_000_000, occupancy: 87, yield: 6.1, gap: '+13.6%', trend: 'up' },
  { district: 'Pakuwon', city: 'Surabaya', avgRent: 15_000_000, optimalRent: 17_500_000, occupancy: 85, yield: 5.9, gap: '+16.7%', trend: 'up' },
];

const formatRp = (v: number) => `Rp ${(v / 1_000_000).toFixed(0)}M`;

const renovationSuggestions = [
  { improvement: 'Smart lock & keyless entry', cost: 'Rp 3.5M', yieldLift: '+0.8%', roi: '285%', payback: '4 months', priority: 'high' },
  { improvement: 'Kitchen modernization', cost: 'Rp 25M', yieldLift: '+1.4%', roi: '190%', payback: '11 months', priority: 'high' },
  { improvement: 'Bathroom refresh & waterproofing', cost: 'Rp 12M', yieldLift: '+0.9%', roi: '210%', payback: '7 months', priority: 'medium' },
  { improvement: 'AC upgrade to inverter system', cost: 'Rp 8M', yieldLift: '+0.5%', roi: '160%', payback: '9 months', priority: 'medium' },
  { improvement: 'Fiber internet pre-installation', cost: 'Rp 2M', yieldLift: '+0.6%', roi: '340%', payback: '3 months', priority: 'high' },
  { improvement: 'Rooftop garden / terrace', cost: 'Rp 35M', yieldLift: '+1.1%', roi: '120%', payback: '14 months', priority: 'low' },
];

const seasonalPatterns = [
  { month: 'Jan', demand: 72, rate: 95 },
  { month: 'Feb', demand: 68, rate: 92 },
  { month: 'Mar', demand: 75, rate: 96 },
  { month: 'Apr', demand: 82, rate: 100 },
  { month: 'May', demand: 88, rate: 105 },
  { month: 'Jun', demand: 95, rate: 112 },
  { month: 'Jul', demand: 98, rate: 118 },
  { month: 'Aug', demand: 92, rate: 110 },
  { month: 'Sep', demand: 85, rate: 104 },
  { month: 'Oct', demand: 78, rate: 98 },
  { month: 'Nov', demand: 74, rate: 94 },
  { month: 'Dec', demand: 90, rate: 108 },
];

const phases = [
  { phase: 1, name: 'Data Foundation', duration: 'Month 1-2', progress: 100, items: ['Rental contract ingestion', 'District benchmarking', 'Occupancy tracking'] },
  { phase: 2, name: 'Pricing Intelligence', duration: 'Month 3-4', progress: 65, items: ['Optimal rent algorithm', 'Sensitivity analysis', 'Seasonal adjustment'] },
  { phase: 3, name: 'Renovation ROI Engine', duration: 'Month 5-6', progress: 30, items: ['Improvement catalog', 'Cost-yield modeling', 'Vendor marketplace link'] },
  { phase: 4, name: 'Autonomous Optimization', duration: 'Month 7-9', progress: 0, items: ['Dynamic recalibration', 'Underperformance alerts', 'Auto-recommendations'] },
];

const priorityBadge = (p: string) => {
  if (p === 'high') return <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">High ROI</Badge>;
  if (p === 'medium') return <Badge className="bg-amber-100 text-amber-700 text-[10px]">Medium</Badge>;
  return <Badge className="bg-muted text-muted-foreground text-[10px]">Low</Badge>;
};

const RentalYieldOptimizationPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg Gross Yield', value: '6.8%', icon: TrendingUp, accent: 'text-emerald-600' },
          { label: 'Avg Occupancy', value: '88%', icon: Home, accent: 'text-primary' },
          { label: 'Revenue Uplift Opportunity', value: '+12.4%', icon: ArrowUp, accent: 'text-orange-600' },
          { label: 'Underperforming Assets', value: '23', icon: AlertTriangle, accent: 'text-red-500' },
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

      <Tabs defaultValue="yields" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="yields" className="text-xs">Yield Analytics</TabsTrigger>
          <TabsTrigger value="renovations" className="text-xs">Renovation ROI</TabsTrigger>
          <TabsTrigger value="seasonal" className="text-xs">Seasonal Patterns</TabsTrigger>
          <TabsTrigger value="roadmap" className="text-xs">Deployment Roadmap</TabsTrigger>
        </TabsList>

        {/* Tab 1: District Yield Analytics */}
        <TabsContent value="yields" className="space-y-3">
          {districtYields.map(d => (
            <Card key={d.district} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{d.district}</span>
                    <Badge variant="outline" className="text-[10px]">{d.city}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${d.yield >= 7 ? 'text-emerald-600' : d.yield >= 6 ? 'text-amber-600' : 'text-red-500'}`}>
                      {d.yield}% yield
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Current Avg</p>
                    <p className="font-semibold">{formatRp(d.avgRent)}/mo</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">AI Optimal</p>
                    <p className="font-semibold text-primary">{formatRp(d.optimalRent)}/mo</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Occupancy</p>
                    <p className="font-semibold">{d.occupancy}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price Gap</p>
                    <p className={`font-semibold flex items-center gap-1 ${d.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {d.trend === 'up' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {d.gap}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Sensitivity</p>
                    <Progress value={d.occupancy} className="h-1.5 mt-1" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab 2: Renovation ROI */}
        <TabsContent value="renovations" className="space-y-3">
          {renovationSuggestions.map(r => (
            <Card key={r.improvement} className="border-border/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{r.improvement}</p>
                    <p className="text-xs text-muted-foreground">Cost: {r.cost} · Payback: {r.payback}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-xs text-muted-foreground">Yield Lift</p>
                    <p className="font-semibold text-sm text-emerald-600">{r.yieldLift}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="font-semibold text-sm">{r.roi}</p>
                  </div>
                  {priorityBadge(r.priority)}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab 3: Seasonal Patterns */}
        <TabsContent value="seasonal" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Monthly Demand & Rate Index</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                {seasonalPatterns.map(m => (
                  <div key={m.month} className="text-center space-y-1">
                    <div
                      className="mx-auto w-6 rounded-t-sm bg-primary/80"
                      style={{ height: `${m.demand * 0.6}px` }}
                    />
                    <p className="text-[10px] font-medium">{m.month}</p>
                    <p className="text-[10px] text-muted-foreground">{m.demand}%</p>
                    <Badge
                      variant="outline"
                      className={`text-[9px] ${m.rate >= 110 ? 'border-emerald-300 text-emerald-600' : m.rate >= 100 ? 'border-amber-300 text-amber-600' : 'border-muted'}`}
                    >
                      {m.rate}
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-primary/80" /> Demand Index</span>
                <span>Rate index: 100 = baseline avg</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">AI Insight</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Peak rental demand occurs June–August with rates 10-18% above baseline.
                Properties listed in May capture the highest occupancy probability (98%).
                December shows a secondary spike driven by year-end relocation.
                Recommend dynamic pricing: increase rates 12-15% during Jun-Aug, offer 5-8% discounts in Feb to minimize vacancy.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Deployment Roadmap */}
        <TabsContent value="roadmap" className="space-y-3">
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
      </Tabs>
    </div>
  );
};

export default RentalYieldOptimizationPanel;
