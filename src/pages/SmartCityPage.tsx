import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Building2, TrendingUp, Users, Landmark, MapPin, Scan, Train, Plane, Factory,
  Palmtree, GraduationCap, Gem, ArrowUpRight, Shield
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as ReRadar,
  Cell, AreaChart, Area,
} from 'recharts';
import { toast } from 'sonner';
import {
  useSmartCityScan,
  useSmartCityInfrastructure,
  useSmartCityDistricts,
  useSmartCityDemographics,
  useSmartCityPolicies,
  useSmartCityOpportunities,
} from '@/hooks/useSmartCity';

const INFRA_ICONS: Record<string, any> = {
  metro: Train, highway: Train, airport: Plane, cbd: Building2,
  industrial: Factory, tourism: Palmtree,
};

const EVOLUTION_ICONS: Record<string, any> = {
  cbd_migration: Building2, lifestyle: Palmtree, tech_hub: Factory,
  education_cluster: GraduationCap, luxury_corridor: Gem,
};

const RISK_BADGE: Record<string, string> = {
  low: 'bg-primary/15 text-primary border-primary/20',
  moderate: 'bg-muted text-muted-foreground border-border',
  high: 'bg-destructive/15 text-destructive border-destructive/20',
};

const CHART_COLORS = [
  'hsl(var(--primary))', 'hsl(var(--accent-foreground))',
  'hsl(var(--muted-foreground))', 'hsl(var(--destructive))',
];

export default function SmartCityPage() {
  const [tab, setTab] = useState('overview');
  const scanMutation = useSmartCityScan();
  const { data: infra, refetch: rInfra } = useSmartCityInfrastructure();
  const { data: districts, refetch: rDist } = useSmartCityDistricts();
  const { data: demos, refetch: rDemo } = useSmartCityDemographics();
  const { data: policies, refetch: rPol } = useSmartCityPolicies();
  const { data: opportunities, refetch: rOpp } = useSmartCityOpportunities();

  const runFullAnalysis = async () => {
    try {
      await scanMutation.mutateAsync('full_analysis');
      toast.success('Smart City analysis complete!');
      rInfra(); rDist(); rDemo(); rPol(); rOpp();
    } catch { toast.error('Analysis failed'); }
  };

  // Chart data
  const infraByCity = (infra || []).reduce((acc: Record<string, { count: number; avgImpact: number }>, i: any) => {
    if (!acc[i.city]) acc[i.city] = { count: 0, avgImpact: 0 };
    acc[i.city].count++;
    acc[i.city].avgImpact += i.impact_score;
    return acc;
  }, {});
  const infraChart = Object.entries(infraByCity).map(([city, v]: any) => ({
    city, projects: v.count, avgImpact: Math.round(v.avgImpact / v.count * 10) / 10,
  }));

  const demoChart = (demos || []).map((d: any) => ({
    city: d.city,
    inflow: d.population_inflow_score,
    remote: d.remote_work_index,
    expat: d.expat_settlement_probability,
    young: d.young_professional_demand,
  }));

  const districtChart = (districts || []).slice(0, 8).map((d: any) => ({
    name: d.district.length > 12 ? d.district.slice(0, 12) + '…' : d.district,
    current: d.current_price_sqm / 1e6,
    '3Y': d.projected_price_sqm_3y / 1e6,
    '5Y': d.projected_price_sqm_5y / 1e6,
  }));

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            Smart City Growth Predictor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Predict how urban infrastructure transforms property values
          </p>
        </div>
        <Button onClick={runFullAnalysis} disabled={scanMutation.isPending} className="gap-2">
          <Scan className="h-4 w-4" />
          {scanMutation.isPending ? 'Analyzing...' : 'Full City Analysis'}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SummaryCard icon={Train} label="Infrastructure" value={infra?.length || 0} />
        <SummaryCard icon={MapPin} label="Districts" value={districts?.length || 0} />
        <SummaryCard icon={Users} label="Demographics" value={demos?.length || 0} />
        <SummaryCard icon={Landmark} label="Policies" value={policies?.length || 0} />
        <SummaryCard icon={TrendingUp} label="Opportunities" value={opportunities?.length || 0} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-muted/50 border border-border w-full flex flex-wrap gap-1 h-auto p-1">
          <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
          <TabsTrigger value="infrastructure" className="text-xs">Infrastructure</TabsTrigger>
          <TabsTrigger value="districts" className="text-xs">Districts</TabsTrigger>
          <TabsTrigger value="demographics" className="text-xs">Demographics</TabsTrigger>
          <TabsTrigger value="policies" className="text-xs">Policies</TabsTrigger>
          <TabsTrigger value="opportunities" className="text-xs">Opportunity Map</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Infrastructure by City</CardTitle></CardHeader>
              <CardContent>
                {infraChart.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={infraChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="city" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                      <Bar dataKey="avgImpact" name="Avg Impact" radius={[4, 4, 0, 0]}>
                        {infraChart.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">District Price Projections (M Rp/sqm)</CardTitle></CardHeader>
              <CardContent>
                {districtChart.length ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={districtChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                      <Bar dataKey="current" name="Current" fill="hsl(var(--muted-foreground))" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="3Y" name="3Y Projected" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="5Y" name="5Y Projected" fill="hsl(var(--accent-foreground))" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <EmptyState />}
              </CardContent>
            </Card>
          </div>

          {/* Top Opportunities */}
          <Card className="border-border/50">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Top Investment Opportunities</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {(opportunities || []).slice(0, 5).map((o: any) => (
                <div key={o.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30 border border-border/30">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-foreground">{o.district}, {o.city}</span>
                    <Badge variant="outline" className="text-[8px]">{o.opportunity_type}</Badge>
                    <Badge className={`text-[8px] ${RISK_BADGE[o.risk_level]}`}>{o.risk_level}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="text-[9px] text-muted-foreground">5Y ROI</p>
                      <p className="text-xs font-bold text-primary">+{o.expected_roi_5y}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-muted-foreground">Priority</p>
                      <p className="text-xs font-bold text-foreground">{Math.round(o.investment_priority)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {!opportunities?.length && <EmptyState />}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Infrastructure */}
        <TabsContent value="infrastructure" className="mt-4 grid gap-3">
          {(infra || []).map((i: any) => {
            const Icon = INFRA_ICONS[i.infrastructure_type] || Building2;
            return (
              <Card key={i.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{i.project_name}</p>
                        <p className="text-[10px] text-muted-foreground">{i.city} • {i.infrastructure_type}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px]">{i.completion_stage.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <MiniStat label="Impact" value={i.impact_score} suffix="/100" />
                    <MiniStat label="Access" value={i.accessibility_index} suffix="/100" />
                    <MiniStat label="Velocity" value={i.expansion_velocity} suffix="/100" />
                    <MiniStat label="Uplift" value={`+${i.value_uplift_pct}%`} />
                  </div>
                  <Progress value={i.impact_score} className="mt-2 h-1.5" />
                </CardContent>
              </Card>
            );
          })}
          {!infra?.length && <EmptyState />}
        </TabsContent>

        {/* Districts */}
        <TabsContent value="districts" className="mt-4 grid gap-3">
          {(districts || []).map((d: any) => {
            const Icon = EVOLUTION_ICONS[d.evolution_type] || MapPin;
            return (
              <Card key={d.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{d.district}</p>
                        <p className="text-[10px] text-muted-foreground">{d.city} • {d.evolution_type.replace(/_/g, ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground">Appreciation</p>
                      <p className="text-lg font-black text-primary">{d.capital_appreciation_index}<span className="text-[9px] text-muted-foreground">/100</span></p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                    <MiniStat label="Premium" value={`${d.premiumization_probability}%`} />
                    <MiniStat label="Rental" value={`${d.rental_demand_strength}%`} />
                    <MiniStat label="Lifestyle" value={`${d.lifestyle_desirability}%`} />
                    <MiniStat label="5Y Price" value={`${(d.projected_price_sqm_5y / 1e6).toFixed(1)}M`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!districts?.length && <EmptyState />}
        </TabsContent>

        {/* Demographics */}
        <TabsContent value="demographics" className="space-y-4 mt-4">
          {demoChart.length > 0 && (
            <Card className="border-border/50">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Demographic Drivers by City</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={demoChart}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="city" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                    <ReRadar name="Inflow" dataKey="inflow" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                    <ReRadar name="Remote" dataKey="remote" stroke="hsl(var(--accent-foreground))" fill="hsl(var(--accent))" fillOpacity={0.15} />
                    <ReRadar name="Expat" dataKey="expat" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.1} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--popover))', color: 'hsl(var(--popover-foreground))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3">
            {(demos || []).map((d: any) => (
              <Card key={d.id} className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="font-bold text-sm text-foreground">{d.city}</span>
                      <Badge variant="outline" className="text-[9px]">Income {d.income_migration_shift}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground">Demand Growth</p>
                      <p className="text-lg font-black text-primary">{d.housing_demand_growth}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-2 text-center">
                    <MiniStat label="Inflow" value={d.population_inflow_score} />
                    <MiniStat label="Remote" value={d.remote_work_index} />
                    <MiniStat label="Expat" value={d.expat_settlement_probability} />
                    <MiniStat label="Young" value={d.young_professional_demand} />
                    <MiniStat label="Pressure" value={`${d.price_pressure_probability}%`} />
                  </div>
                </CardContent>
              </Card>
            ))}
            {!demos?.length && <EmptyState />}
          </div>
        </TabsContent>

        {/* Policies */}
        <TabsContent value="policies" className="mt-4 grid gap-3">
          {(policies || []).map((p: any) => (
            <Card key={p.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-primary" />
                      <span className="font-bold text-sm text-foreground">{p.policy_name}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.city} • {p.policy_type.replace(/_/g, ' ')}</p>
                  </div>
                  <Badge variant="outline" className="text-[9px]">{p.policy_type.replace(/_/g, ' ')}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{p.impact_summary}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="Growth Accel." value={p.growth_acceleration_score} suffix="/100" />
                  <MiniStat label="Friendliness" value={p.investment_friendliness} suffix="/100" />
                  <MiniStat label="Transform" value={p.urban_transformation_index} suffix="/100" />
                </div>
              </CardContent>
            </Card>
          ))}
          {!policies?.length && <EmptyState />}
        </TabsContent>

        {/* Opportunity Map */}
        <TabsContent value="opportunities" className="mt-4 grid gap-3">
          {(opportunities || []).map((o: any) => (
            <Card key={o.id} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-4 w-4 text-primary" />
                      <span className="font-bold text-sm text-foreground">{o.district}, {o.city}</span>
                      <Badge variant="outline" className="text-[9px]">{o.opportunity_type.replace(/_/g, ' ')}</Badge>
                      <Badge className={`text-[8px] border ${RISK_BADGE[o.risk_level]}`}>{o.risk_level} risk</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{o.entry_timing}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground">5Y ROI</p>
                    <p className="text-lg font-black text-primary">+{o.expected_roi_5y}%</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                  <MiniStat label="Growth Corridor" value={o.growth_corridor_score} suffix="/100" />
                  <MiniStat label="Priority" value={o.investment_priority} suffix="/100" />
                </div>
                {o.infrastructure_drivers?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {o.infrastructure_drivers.map((d: string) => (
                      <Badge key={d} variant="outline" className="text-[7px]">{d}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {!opportunities?.length && <EmptyState />}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="p-2 rounded-md bg-primary/10"><Icon className="h-4 w-4 text-primary" /></div>
        <div>
          <p className="text-[10px] text-muted-foreground">{label}</p>
          <p className="text-lg font-black text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, suffix }: { label: string; value: any; suffix?: string }) {
  return (
    <div className="p-1.5 rounded bg-muted/30">
      <p className="text-[8px] text-muted-foreground">{label}</p>
      <p className="text-xs font-bold text-foreground">{value}{suffix && <span className="text-[8px] text-muted-foreground">{suffix}</span>}</p>
    </div>
  );
}

function EmptyState() {
  return <p className="text-center text-sm text-muted-foreground py-10">Run Full City Analysis to generate data</p>;
}
