import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, Users, ShieldAlert, Zap, BarChart3, ArrowUpDown, Settings, CheckCircle } from 'lucide-react';

const segmentRules = [
  { segment: 'Primary Residential', current: 2.5, optimal: '2.2–2.8%', elasticity: 0.72, retention: 94, revenue: '+Rp 340M', risk: 'low' },
  { segment: 'Secondary Market', current: 2.0, optimal: '1.8–2.4%', elasticity: 0.58, retention: 88, revenue: '+Rp 210M', risk: 'medium' },
  { segment: 'Commercial / Office', current: 1.5, optimal: '1.2–1.8%', elasticity: 0.85, retention: 91, revenue: '+Rp 180M', risk: 'low' },
  { segment: 'Developer New Launch', current: 3.0, optimal: '2.5–3.5%', elasticity: 0.64, retention: 96, revenue: '+Rp 520M', risk: 'low' },
  { segment: 'Rental Management', current: 8.0, optimal: '7–10%', elasticity: 0.41, retention: 82, revenue: '+Rp 95M', risk: 'high' },
];

const incentiveCampaigns = [
  { name: 'Top Closer Bonus', trigger: 'Agent closes 5+ deals/month', reward: '+0.3% commission bump', impact: 'Deal velocity +18%', status: 'active' },
  { name: 'Speed-to-Close Sprint', trigger: 'Deal closed within 14 days', reward: 'Rp 2M flat bonus', impact: 'Cycle time -22%', status: 'testing' },
  { name: 'Vendor Attach Reward', trigger: 'Vendor service attached to deal', reward: 'Revenue share 5%', impact: 'Attach rate +31%', status: 'active' },
  { name: 'New Market Pioneer', trigger: 'First 10 deals in new city', reward: '+0.5% commission', impact: 'Expansion coverage +2 cities', status: 'planned' },
];

const elasticityModel = [
  { factor: 'Transaction Value Sensitivity', weight: 25, description: 'Higher-value deals tolerate lower commission rates' },
  { factor: 'Agent Supply Density', weight: 20, description: 'Markets with more agents can sustain tighter margins' },
  { factor: 'Deal Velocity Impact', weight: 20, description: 'Commission cuts slow deal flow below threshold' },
  { factor: 'Competitive Benchmark Gap', weight: 15, description: 'Distance from market-standard rates affects retention' },
  { factor: 'Vendor Contribution Value', weight: 10, description: 'Vendor-enhanced deals justify adjusted splits' },
  { factor: 'Customer Satisfaction Score', weight: 10, description: 'High CSAT segments tolerate premium pricing' },
];

const rolloutPhases = [
  { phase: 1, name: 'Baseline Measurement', duration: 'Month 1-2', progress: 100, items: ['Capture current commission data', 'Segment performance benchmarks', 'Partner satisfaction survey'] },
  { phase: 2, name: 'Safe-Zone Experiments', duration: 'Month 3-4', progress: 55, items: ['±0.2% adjustments within safe bands', 'A/B test 2 segments', 'Monitor retention signals'] },
  { phase: 3, name: 'Dynamic Optimization', duration: 'Month 5-7', progress: 10, items: ['Auto-adjust within approved thresholds', 'Segment-specific rules engine', 'Revenue elasticity feedback loop'] },
  { phase: 4, name: 'Autonomous Engine', duration: 'Month 8-12', progress: 0, items: ['Full AI-driven commission tuning', 'Real-time rollback triggers', 'Executive override dashboard'] },
];

const CommissionOptimizationPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Avg Commission Rate', value: '2.4%', icon: DollarSign, accent: 'text-emerald-600' },
          { label: 'Revenue Uplift (MTD)', value: '+Rp 1.34B', icon: TrendingUp, accent: 'text-primary' },
          { label: 'Partner Retention', value: '91.2%', icon: Users, accent: 'text-blue-600' },
          { label: 'Active Experiments', value: '3', icon: Zap, accent: 'text-orange-600' },
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

      <Tabs defaultValue="segments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-9">
          <TabsTrigger value="segments" className="text-xs">Segment Rules</TabsTrigger>
          <TabsTrigger value="elasticity" className="text-xs">Elasticity Model</TabsTrigger>
          <TabsTrigger value="incentives" className="text-xs">Incentive Campaigns</TabsTrigger>
          <TabsTrigger value="rollout" className="text-xs">Rollout Strategy</TabsTrigger>
        </TabsList>

        {/* Tab 1: Segment Commission Rules */}
        <TabsContent value="segments" className="space-y-3">
          {segmentRules.map(s => (
            <Card key={s.segment} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{s.segment}</p>
                    <Badge variant={s.risk === 'low' ? 'default' : s.risk === 'medium' ? 'secondary' : 'destructive'} className="text-[10px]">
                      {s.risk} risk
                    </Badge>
                  </div>
                  <span className="text-sm font-bold text-primary">{s.optimal}</span>
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Current</p>
                    <p className="font-semibold">{s.current}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Elasticity</p>
                    <p className="font-semibold">{s.elasticity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Retention</p>
                    <p className="font-semibold">{s.retention}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenue Impact</p>
                    <p className="font-semibold text-emerald-600">{s.revenue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-sm font-medium mb-2">Optimization Formula</p>
              <div className="bg-muted/30 rounded-lg p-3 font-mono text-[11px] text-muted-foreground leading-relaxed">
                <p>OptimalRate = BaseRate × (1 + ElasticityAdj)</p>
                <p className="ml-14">× RetentionSafety × CompetitiveGap</p>
                <p className="mt-2 text-foreground">Constraints: ±0.5% max per cycle, min 1.0%, max 5.0%</p>
                <p className="text-foreground">Auto-rollback: if retention drops {'>'} 3% in 14d window</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Revenue Elasticity Model */}
        <TabsContent value="elasticity" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Revenue Elasticity Weights</CardTitle>
                <Badge variant="outline" className="text-[10px] ml-auto">Tunable</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {elasticityModel.map(f => (
                <div key={f.factor} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">{f.factor}</p>
                      <p className="text-[10px] text-muted-foreground">{f.description}</p>
                    </div>
                    <span className="text-sm font-bold text-primary">{f.weight}%</span>
                  </div>
                  <Progress value={f.weight} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldAlert className="h-4 w-4 text-orange-500" />
                <p className="text-sm font-medium">Safety Thresholds</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-muted-foreground mb-1">Max Adjustment Per Cycle</p>
                  <p className="font-bold text-lg">±0.5%</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-muted-foreground mb-1">Retention Floor</p>
                  <p className="font-bold text-lg">85%</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-muted-foreground mb-1">Observation Window</p>
                  <p className="font-bold text-lg">14 days</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-muted-foreground mb-1">Admin Approval Above</p>
                  <p className="font-bold text-lg">±0.3%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Incentive Campaigns */}
        <TabsContent value="incentives" className="space-y-3">
          {incentiveCampaigns.map(c => (
            <Card key={c.name} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{c.name}</p>
                  <Badge variant={c.status === 'active' ? 'default' : c.status === 'testing' ? 'secondary' : 'outline'} className="text-[10px]">
                    {c.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-0.5">Trigger</p>
                    <p className="font-medium">{c.trigger}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Reward</p>
                    <p className="font-medium">{c.reward}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-0.5">Impact</p>
                    <p className="font-medium text-emerald-600">{c.impact}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Tab 4: Rollout Strategy */}
        <TabsContent value="rollout" className="space-y-3">
          {rolloutPhases.map(p => (
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
                  {p.progress === 100 && <CheckCircle className="h-4 w-4 text-emerald-600" />}
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

export default CommissionOptimizationPanel;
