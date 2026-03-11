import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Globe, TrendingUp, Building2, Shield, Zap, Brain, MapPin,
  AlertTriangle, ChevronRight, ArrowUpRight, ArrowDownRight, Minus,
  Landmark, Plane, Train, Cpu, Palmtree, BarChart3, DollarSign,
  Target, Layers, Sparkles, FileText, Clock,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, ZAxis, Cell, PieChart, Pie,
} from 'recharts';
import {
  useCountryMacroProfiles,
  useRegionalHeatmap,
  useCrossBorderStrategies,
  useInfrastructureProjects,
  useMacroAdvisoryBrief,
  type CountryMacroProfile,
  type CrossBorderStrategy,
} from '@/hooks/useGlobalMacroIntelligence';

const CHART_TOOLTIP = {
  contentStyle: {
    background: 'hsl(var(--popover))',
    border: '1px solid hsl(var(--border))',
    borderRadius: 10,
    fontSize: 11,
    color: 'hsl(var(--popover-foreground))',
  },
};

const tierColors: Record<string, string> = {
  frontier: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
  emerging: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  developed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
};

const typeIcons: Record<string, React.ReactNode> = {
  airport: <Plane className="h-4 w-4" />,
  rail: <Train className="h-4 w-4" />,
  smart_city: <Cpu className="h-4 w-4" />,
  sez: <Landmark className="h-4 w-4" />,
  coastal_tourism: <Palmtree className="h-4 w-4" />,
};

const heatmapTypeColors: Record<string, string> = {
  investment_corridor: 'bg-blue-500',
  luxury_migration: 'bg-purple-500',
  retirement_hotspot: 'bg-emerald-500',
  nomad_cluster: 'bg-orange-500',
};

const heatmapTypeLabels: Record<string, string> = {
  investment_corridor: 'Investment Corridor',
  luxury_migration: 'Luxury Migration',
  retirement_hotspot: 'Retirement Hotspot',
  nomad_cluster: 'Nomad Cluster',
};

const cyclePhaseLabels: Record<string, string> = {
  early_expansion: 'Early Expansion',
  mid_expansion: 'Mid Expansion',
  peak: 'Peak',
  contraction: 'Contraction',
  recovery: 'Recovery',
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === 'rising' || trend === 'strengthening') return <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />;
  if (trend === 'falling' || trend === 'weakening') return <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
};

const ScoreRing = ({ value, label, size = 64, color }: { value: number; label: string; size?: number; color?: string }) => {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const strokeColor = color || (value >= 75 ? 'hsl(var(--chart-1))' : value >= 50 ? 'hsl(var(--chart-3))' : 'hsl(var(--chart-5))');
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={strokeColor} strokeWidth={4}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x="50%" y="50%" textAnchor="middle" dy="0.35em" className="fill-foreground text-xs font-bold">
          {Math.round(value)}
        </text>
      </svg>
      <span className="text-[10px] text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const CapitalFlowEngine = ({ profiles }: { profiles: CountryMacroProfile[] }) => {
  const top = profiles.slice(0, 8);
  const radarData = top.slice(0, 6).map(p => ({
    country: p.flag_emoji + ' ' + p.country_code,
    Attractiveness: p.attractiveness_score,
    Growth: p.city_growth_momentum,
    FDI_Pressure: p.foreign_investor_pressure,
    Infrastructure: p.infrastructure_score,
    Policy: p.policy_incentive_score,
  }));

  return (
    <div className="space-y-4">
      {/* Score cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {top.slice(0, 4).map((p, i) => (
          <Card key={p.country_code} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{p.flag_emoji}</span>
                <Badge variant="outline" className={`text-[10px] ${tierColors[p.tier]}`}>{p.tier}</Badge>
              </div>
              <p className="font-semibold text-sm text-foreground">{p.country_name}</p>
              <div className="flex items-center gap-2 mt-2">
                <ScoreRing value={p.attractiveness_score} label="Score" size={48} />
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={p.interest_rate_trend} />
                    <span className="text-muted-foreground">Rate {p.interest_rate}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendIcon trend={p.currency_trend} />
                    <span className="text-muted-foreground">FX {p.currency_strength}</span>
                  </div>
                  <p className="text-foreground font-medium">+{p.forecast_price_acceleration_12m}% 12m</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Radar + Bar side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              Multi-Factor Country Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="country" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
                <Radar name="Attractiveness" dataKey="Attractiveness" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.15} />
                <Radar name="Growth" dataKey="Growth" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} />
                <Radar name="FDI Pressure" dataKey="FDI_Pressure" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.1} />
                <Tooltip {...CHART_TOOLTIP} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Capital Inflow Probability & 36m Price Forecast
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer>
              <BarChart data={top} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="category" dataKey="country_code" width={35} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip {...CHART_TOOLTIP} />
                <Bar dataKey="attractiveness_score" name="Attractiveness" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
                <Bar dataKey="forecast_price_acceleration_36m" name="36m Price %" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Full country table */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">All Tracked Countries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left p-3 text-muted-foreground font-medium">Country</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Score</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">GDP %</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Rate</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">FDI $B</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Tourism ↑</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">12m %</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">36m %</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Inflow P</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Bubble</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map(p => (
                  <tr key={p.country_code} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">{p.flag_emoji} {p.country_name}</td>
                    <td className="p-3 text-center">
                      <span className={`font-bold ${p.attractiveness_score >= 70 ? 'text-emerald-500' : p.attractiveness_score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {p.attractiveness_score}
                      </span>
                    </td>
                    <td className="p-3 text-center text-foreground">{p.gdp_growth_pct}%</td>
                    <td className="p-3 text-center">
                      <span className="flex items-center justify-center gap-0.5">
                        {p.interest_rate}% <TrendIcon trend={p.interest_rate_trend} />
                      </span>
                    </td>
                    <td className="p-3 text-center text-foreground">${p.fdi_inflow_bn_usd}B</td>
                    <td className="p-3 text-center text-emerald-500">+{p.tourism_growth_pct}%</td>
                    <td className="p-3 text-center font-medium text-foreground">+{p.forecast_price_acceleration_12m}%</td>
                    <td className="p-3 text-center font-medium text-foreground">+{p.forecast_price_acceleration_36m}%</td>
                    <td className="p-3 text-center text-foreground">{(p.capital_inflow_probability * 100).toFixed(0)}%</td>
                    <td className="p-3 text-center">
                      <Badge variant={p.bubble_risk >= 40 ? 'destructive' : 'outline'} className="text-[10px]">
                        {p.bubble_risk >= 40 ? '⚠ ' : ''}{p.bubble_risk}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const RegionalHeatmap = () => {
  const { data: heatmap = [] } = useRegionalHeatmap();
  const byType = heatmap.reduce((acc, h) => {
    acc[h.type] = (acc[h.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.entries(byType).map(([type, count]) => ({ name: heatmapTypeLabels[type] || type, value: count }));
  const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Global Opportunity Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {heatmap.map(h => (
                <div key={h.region_id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                  <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${heatmapTypeColors[h.type]}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{h.label}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{heatmapTypeLabels[h.type]}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="text-xs"><span className="text-muted-foreground">Intensity</span> <span className="font-medium text-foreground">{h.intensity}</span></div>
                      <div className="text-xs"><span className="text-muted-foreground">Velocity</span> <span className="font-medium text-foreground">{h.transaction_velocity}</span></div>
                      <div className="text-xs"><span className="text-muted-foreground">Search</span> <span className="font-medium text-foreground">{h.search_demand_index}</span></div>
                    </div>
                    <Progress value={h.intensity} className="h-1 mt-1.5" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Zone Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} dataKey="value" paddingAngle={4}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip {...CHART_TOOLTIP} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const CrossBorderEngine = ({ strategies }: { strategies: CrossBorderStrategy[] }) => {
  const [selected, setSelected] = useState(0);
  const active = strategies[selected];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {strategies.map((s, i) => (
          <Button key={s.strategy_id} variant={i === selected ? 'default' : 'outline'} size="sm"
            onClick={() => setSelected(i)} className="text-xs">
            {s.label}
          </Button>
        ))}
      </div>

      {active && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex flex-wrap gap-4 justify-center items-center">
              <ScoreRing value={active.diversification_score} label="Diversification" size={72} color="hsl(var(--chart-1))" />
              <ScoreRing value={100 - active.macro_risk_exposure} label="Safety" size={72} color="hsl(var(--chart-2))" />
              <ScoreRing value={Math.max(0, 100 - (active.international_roi_rank - 1) * 25)} label="ROI Rank" size={72} color="hsl(var(--chart-3))" />
            </CardContent>
          </Card>

          <Card className="border-border/50 lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Portfolio Allocation</CardTitle></CardHeader>
            <CardContent className="h-[220px]">
              <ResponsiveContainer>
                <BarChart data={active.allocations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="country_name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip {...CHART_TOOLTIP} />
                  <Bar dataKey="allocation_pct" name="Allocation %" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expected_roi" name="Expected ROI %" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 lg:col-span-3">
            <CardContent className="p-0">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-border/50">
                  <th className="text-left p-3 text-muted-foreground font-medium">Country</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Allocation</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Expected ROI</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Currency Risk</th>
                  <th className="text-center p-3 text-muted-foreground font-medium">Cycle Phase</th>
                </tr></thead>
                <tbody>
                  {active.allocations.map(a => (
                    <tr key={a.country_code} className="border-b border-border/30">
                      <td className="p-3 font-medium text-foreground">{a.country_name}</td>
                      <td className="p-3 text-center text-foreground">{a.allocation_pct}%</td>
                      <td className="p-3 text-center text-emerald-500 font-medium">+{a.expected_roi}%</td>
                      <td className="p-3 text-center">
                        <Badge variant={a.currency_risk === 'high' ? 'destructive' : 'outline'} className="text-[10px]">{a.currency_risk}</Badge>
                      </td>
                      <td className="p-3 text-center text-muted-foreground">{cyclePhaseLabels[a.cycle_phase]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const InfraImpactPanel = () => {
  const { data: projects = [] } = useInfrastructureProjects();
  const barData = projects.slice(0, 8).map(p => ({
    name: p.name.length > 20 ? p.name.slice(0, 18) + '…' : p.name,
    uplift: p.land_price_uplift_pct,
    demand: p.commercial_demand_surge,
    invest: p.investment_bn_usd,
  }));

  return (
    <div className="space-y-4">
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Land Price Uplift vs Commercial Demand Surge
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer>
            <BarChart data={barData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip {...CHART_TOOLTIP} />
              <Bar dataKey="uplift" name="Price Uplift %" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
              <Bar dataKey="demand" name="Demand Surge" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {projects.map(p => (
          <Card key={p.id} className="border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  {typeIcons[p.type] || <Building2 className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-foreground">{p.name}</p>
                    <Badge variant="outline" className="text-[10px]">{p.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.country_name} · {p.city} · {p.completion_year}</p>
                  <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                    <div>
                      <p className="text-muted-foreground">Investment</p>
                      <p className="font-medium text-foreground">${p.investment_bn_usd}B</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price Uplift</p>
                      <p className="font-medium text-emerald-500">+{p.land_price_uplift_pct}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Impact</p>
                      <p className="font-medium text-foreground">{p.impact_radius_km}km</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">↗ {p.urban_expansion_direction}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const MacroAdvisory = () => {
  const { data: brief } = useMacroAdvisoryBrief();
  if (!brief) return null;

  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <Badge variant="outline" className="text-xs">{brief.month}</Badge>
          </div>
          <CardTitle className="text-lg text-foreground">{brief.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{brief.summary}</p>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Next Frontier Alert</span>
            </div>
            <p className="text-sm text-foreground">{brief.next_frontier_alert}</p>
          </div>

          {brief.bubble_warnings.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-xs font-semibold text-destructive">Bubble Warnings</span>
              </div>
              <ul className="space-y-1">
                {brief.bubble_warnings.map((w, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-1.5">
                    <span className="text-destructive mt-0.5">•</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="p-3 rounded-lg bg-muted/50 border border-border/40">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Wealth Geography Strategy</p>
            <p className="text-sm text-foreground">{brief.wealth_geography_strategy}</p>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-semibold text-foreground mb-3">Top Opportunities</p>
            <div className="space-y-2">
              {brief.top_opportunities.map((opp, i) => (
                <div key={opp.country} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <span className="text-lg font-bold text-muted-foreground w-6 text-center">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{opp.country}</p>
                    <p className="text-xs text-muted-foreground">{opp.reason}</p>
                  </div>
                  <ScoreRing value={opp.score} label="" size={40} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const GlobalMacroIntelligencePage: React.FC = () => {
  const { data: profiles = [], isLoading } = useCountryMacroProfiles();
  const { data: strategies = [] } = useCrossBorderStrategies();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Global Macro Intelligence</h1>
              <p className="text-sm text-muted-foreground">Predict where real estate capital will move before markets react</p>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="capital-flow" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 h-auto">
            <TabsTrigger value="capital-flow" className="text-xs py-2 gap-1"><TrendingUp className="h-3.5 w-3.5" /> Capital Flow</TabsTrigger>
            <TabsTrigger value="heatmap" className="text-xs py-2 gap-1"><MapPin className="h-3.5 w-3.5" /> Heatmap</TabsTrigger>
            <TabsTrigger value="cross-border" className="text-xs py-2 gap-1"><Layers className="h-3.5 w-3.5" /> Cross-Border</TabsTrigger>
            <TabsTrigger value="infrastructure" className="text-xs py-2 gap-1"><Building2 className="h-3.5 w-3.5" /> Infrastructure</TabsTrigger>
            <TabsTrigger value="advisory" className="text-xs py-2 gap-1"><FileText className="h-3.5 w-3.5" /> Advisory</TabsTrigger>
          </TabsList>

          <TabsContent value="capital-flow">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading macro intelligence...</div>
            ) : (
              <CapitalFlowEngine profiles={profiles} />
            )}
          </TabsContent>

          <TabsContent value="heatmap">
            <RegionalHeatmap />
          </TabsContent>

          <TabsContent value="cross-border">
            <CrossBorderEngine strategies={strategies} />
          </TabsContent>

          <TabsContent value="infrastructure">
            <InfraImpactPanel />
          </TabsContent>

          <TabsContent value="advisory">
            <MacroAdvisory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GlobalMacroIntelligencePage;
