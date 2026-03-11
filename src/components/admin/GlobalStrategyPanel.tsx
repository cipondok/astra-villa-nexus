import React, { useState } from 'react';
import {
  useGlobalRegions, useGlobalOpportunities, useComputePriorities,
  useFXRates, useExpansionLog, useRefreshFX, useComputeGlobalScores,
  useComputeRouting, useChangeExpansionPhase,
  type GlobalRegion, type GlobalOpportunity, type ComputePriority,
} from '@/hooks/useGlobalIntelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Globe, TrendingUp, DollarSign, Cpu, Shield, MapPin,
  RefreshCw, PlayCircle, Zap, Clock, BarChart3,
  ChevronRight, AlertTriangle, CheckCircle2, Loader2,
  Building2, Landmark, Scale,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const CHART_TOOLTIP = {
  background: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 10,
  fontSize: 11,
  color: 'hsl(var(--popover-foreground))',
};

const phaseColors: Record<string, string> = {
  planned: 'bg-muted text-muted-foreground',
  pilot: 'bg-chart-2/10 text-chart-2 border-chart-2/30',
  beta: 'bg-chart-3/10 text-chart-3 border-chart-3/30',
  live: 'bg-chart-1/10 text-chart-1 border-chart-1/30',
  paused: 'bg-destructive/10 text-destructive border-destructive/30',
};

const maturityColors: Record<string, string> = {
  nascent: 'text-muted-foreground',
  emerging: 'text-chart-2',
  developing: 'text-chart-3',
  mature: 'text-chart-1',
  saturated: 'text-primary',
};

const tierIcon = (tier: string) => {
  if (tier === 'realtime') return <Zap className="h-3 w-3 text-chart-1" />;
  if (tier === 'hourly') return <Clock className="h-3 w-3 text-chart-2" />;
  return <Clock className="h-3 w-3 text-muted-foreground" />;
};

const formatUSD = (v: number) => {
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

const GlobalStrategyPanel = () => {
  const { data: regions = [], isLoading: regLoading } = useGlobalRegions();
  const { data: opportunities = [] } = useGlobalOpportunities();
  const { data: priorities = [] } = useComputePriorities();
  const { data: fxRates = [] } = useFXRates();
  const { data: expansionLog = [] } = useExpansionLog();
  const refreshFX = useRefreshFX();
  const computeScores = useComputeGlobalScores();
  const computeRouting = useComputeRouting();
  const changePhase = useChangeExpansionPhase();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  if (regLoading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />)}
      </div>
    );
  }

  const activeRegions = regions.filter(r => r.is_active);
  const plannedRegions = regions.filter(r => !r.is_active);
  const sel = regions.find(r => r.region_id === selectedRegion);

  // Radar data for selected region
  const radarData = sel ? [
    { metric: 'ROI Weight', value: sel.roi_weight * 100 },
    { metric: 'Demand', value: sel.demand_weight * 100 },
    { metric: 'Growth', value: sel.growth_weight * 100 },
    { metric: 'Liquidity', value: sel.liquidity_weight * 100 },
    { metric: 'Risk (inv)', value: (1 / sel.risk_multiplier) * 100 },
  ] : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-border/40 bg-card/60 backdrop-blur-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-lg">
                  <Globe className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">Global Strategy Engine</h2>
                  <p className="text-xs text-muted-foreground">
                    {activeRegions.length} active · {plannedRegions.length} planned · {regions.length} total regions
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => {
                  refreshFX.mutate(undefined, {
                    onSuccess: () => toast.success('FX rates refreshed'),
                    onError: (e) => toast.error('FX refresh failed: ' + e.message),
                  });
                }} disabled={refreshFX.isPending}>
                  {refreshFX.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <DollarSign className="h-3.5 w-3.5" />}
                  Refresh FX
                </Button>
                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => {
                  computeRouting.mutate(undefined, {
                    onSuccess: () => toast.success('Compute routing updated'),
                    onError: (e) => toast.error('Routing failed: ' + e.message),
                  });
                }} disabled={computeRouting.isPending}>
                  {computeRouting.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Cpu className="h-3.5 w-3.5" />}
                  Update Routing
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="regions" className="space-y-4">
        <TabsList className="bg-muted/30 border border-border/40">
          <TabsTrigger value="regions" className="text-xs gap-1.5"><MapPin className="h-3.5 w-3.5" /> Regions</TabsTrigger>
          <TabsTrigger value="opportunities" className="text-xs gap-1.5"><TrendingUp className="h-3.5 w-3.5" /> Opportunities</TabsTrigger>
          <TabsTrigger value="routing" className="text-xs gap-1.5"><Cpu className="h-3.5 w-3.5" /> Compute Routing</TabsTrigger>
          <TabsTrigger value="fx" className="text-xs gap-1.5"><DollarSign className="h-3.5 w-3.5" /> FX Rates</TabsTrigger>
          <TabsTrigger value="expansion" className="text-xs gap-1.5"><Globe className="h-3.5 w-3.5" /> Expansion</TabsTrigger>
        </TabsList>

        {/* ═══ REGIONS TAB ═══ */}
        <TabsContent value="regions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {regions.map((reg) => (
              <motion.div key={reg.region_id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                <Card
                  className={`border-border/40 bg-card/60 backdrop-blur-xl cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 ${selectedRegion === reg.region_id ? 'ring-2 ring-primary/30' : ''}`}
                  onClick={() => setSelectedRegion(selectedRegion === reg.region_id ? null : reg.region_id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{reg.flag_emoji}</span>
                        <div>
                          <p className="text-sm font-bold text-foreground">{reg.region_name}</p>
                          <p className="text-[10px] text-muted-foreground">{reg.country_code} · {reg.primary_currency}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-[9px] ${phaseColors[reg.expansion_phase] || ''}`}>
                        {reg.expansion_phase}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3 text-muted-foreground" />
                        <span className={maturityColors[reg.market_maturity_level] || ''}>{reg.market_maturity_level}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {tierIcon(reg.compute_tier)}
                        <span>{reg.compute_tier}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3 text-muted-foreground" />
                        <span>Risk ×{reg.risk_multiplier}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span>Inflation {reg.inflation_rate}%</span>
                      </div>
                    </div>

                    <Separator className="my-2 opacity-30" />

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        {reg.foreign_ownership_allowed ? (
                          <><CheckCircle2 className="h-3 w-3 text-chart-1" /> Foreign OK ({reg.max_foreign_ownership_pct}%)</>
                        ) : (
                          <><AlertTriangle className="h-3 w-3 text-destructive" /> Restricted</>
                        )}
                      </span>
                      <span>Regulation: {reg.rental_regulation_level}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Selected Region Detail with Radar */}
          {sel && (
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="text-lg">{sel.flag_emoji}</span> {sel.region_name} — Scoring Model
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="hsl(var(--border))" />
                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <PolarRadiusAxis domain={[0, 50]} tick={false} />
                        <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <InfoRow icon={Landmark} label="Capital Gains Tax" value={`${sel.capital_gains_tax_pct}%`} />
                      <InfoRow icon={Scale} label="Stamp Duty" value={`${sel.stamp_duty_pct}%`} />
                      <InfoRow icon={Building2} label="AI Model" value={sel.ai_model_variant} />
                      <InfoRow icon={Globe} label="Locale" value={sel.locale} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="text-[10px] h-7 gap-1" onClick={() => {
                        computeScores.mutate(sel.region_id, {
                          onSuccess: () => toast.success('Scores computed for ' + sel.region_name),
                          onError: (e) => toast.error(e.message),
                        });
                      }} disabled={computeScores.isPending}>
                        {computeScores.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <PlayCircle className="h-3 w-3" />}
                        Compute Scores
                      </Button>
                      {sel.expansion_phase !== 'live' && (
                        <Button size="sm" className="text-[10px] h-7 gap-1" onClick={() => {
                          const nextPhase = sel.expansion_phase === 'planned' ? 'pilot' : sel.expansion_phase === 'pilot' ? 'beta' : 'live';
                          changePhase.mutate({ region_id: sel.region_id, new_phase: nextPhase }, {
                            onSuccess: () => toast.success(`${sel.region_name} → ${nextPhase}`),
                            onError: (e) => toast.error(e.message),
                          });
                        }} disabled={changePhase.isPending}>
                          <ChevronRight className="h-3 w-3" /> Advance Phase
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ OPPORTUNITIES TAB ═══ */}
        <TabsContent value="opportunities" className="space-y-4">
          {opportunities.length === 0 ? (
            <Card className="border-border/40 bg-card/60 p-8 text-center">
              <Globe className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No global opportunity scores computed yet. Select a region and click "Compute Scores".</p>
            </Card>
          ) : (
            <>
              <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" /> Global Opportunity Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={opportunities.slice(0, 12)} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <YAxis dataKey="city" type="category" width={100} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                        <Tooltip contentStyle={CHART_TOOLTIP} />
                        <Bar dataKey="global_opportunity_score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {opportunities.slice(0, 9).map((opp, i) => (
                  <Card key={opp.city} className="border-border/40 bg-card/60 backdrop-blur-xl">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>
                          <span className="text-sm font-bold text-foreground">{opp.city}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {opp.global_opportunity_score.toFixed(0)}/100
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 text-[10px] text-muted-foreground">
                        <span>ROI: {opp.global_roi_score.toFixed(0)}</span>
                        <span>Growth: {opp.market_growth_weight.toFixed(0)}</span>
                        <span>Liquidity: {opp.liquidity_index.toFixed(0)}</span>
                        <span>Entry: {opp.capital_entry_barrier.toFixed(0)}</span>
                        <span>Avg Price: {formatUSD(opp.avg_price_usd)}</span>
                        <span>{opp.property_count} listings</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>

        {/* ═══ COMPUTE ROUTING TAB ═══ */}
        <TabsContent value="routing" className="space-y-4">
          {priorities.length === 0 ? (
            <Card className="border-border/40 bg-card/60 p-8 text-center">
              <Cpu className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No compute priorities computed yet. Click "Update Routing" above.</p>
            </Card>
          ) : (
            <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" /> Compute Priority Index — Distributed Intelligence Routing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <ScrollArea className="max-h-[400px]">
                  <div className="space-y-2">
                    {priorities.map((p) => (
                      <div key={`${p.region_id}-${p.city}`} className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-background/60 border border-border/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 text-center">
                            <span className="text-lg font-bold text-foreground">{p.compute_priority}</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">{p.city}</p>
                            <p className="text-[10px] text-muted-foreground">
                              Velocity: {p.listing_velocity}/d · Activity: {p.investor_activity} · Heat: {p.search_heat}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Progress value={p.compute_priority} className="w-20 h-1.5" />
                          <Badge variant="outline" className="text-[9px] gap-1">
                            {tierIcon(p.recommended_tier)} {p.recommended_tier}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ═══ FX RATES TAB ═══ */}
        <TabsContent value="fx" className="space-y-4">
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" /> FX Rate Snapshots (USD Base)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {fxRates.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No FX snapshots yet. Click "Refresh FX" to fetch latest rates.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Deduplicate by currency, show latest */}
                  {Object.values(
                    fxRates.reduce((acc: Record<string, any>, r: any) => {
                      if (!acc[r.target_currency]) acc[r.target_currency] = r;
                      return acc;
                    }, {})
                  ).map((rate: any) => (
                    <div key={rate.target_currency} className="p-3 rounded-lg border border-border/30 bg-background/40">
                      <p className="text-sm font-bold text-foreground">1 USD = {Number(rate.rate).toLocaleString()} {rate.target_currency}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(rate.snapshot_at), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ═══ EXPANSION LOG TAB ═══ */}
        <TabsContent value="expansion" className="space-y-4">
          {/* Phase Pipeline */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" /> Expansion Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-2 text-center">
                {['planned', 'pilot', 'beta', 'live', 'paused'].map((phase) => {
                  const count = regions.filter(r => r.expansion_phase === phase).length;
                  return (
                    <div key={phase} className="space-y-1">
                      <div className={`text-2xl font-bold ${count > 0 ? 'text-foreground' : 'text-muted-foreground/30'}`}>{count}</div>
                      <Badge variant="outline" className={`text-[9px] ${phaseColors[phase]}`}>{phase}</Badge>
                      <div className="text-[9px] text-muted-foreground">
                        {regions.filter(r => r.expansion_phase === phase).map(r => r.flag_emoji).join(' ') || '—'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Log */}
          <Card className="border-border/40 bg-card/60 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Expansion Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              {expansionLog.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No expansion activity yet.</p>
              ) : (
                <ScrollArea className="max-h-60">
                  <div className="space-y-2">
                    {expansionLog.map((log: any) => (
                      <div key={log.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background/40 text-xs">
                        <Badge variant="outline" className="text-[9px]">{log.event_type}</Badge>
                        <span className="text-muted-foreground">{log.region_id}</span>
                        {log.from_phase && <span className="text-muted-foreground">{log.from_phase} → {log.to_phase}</span>}
                        {log.notes && <span className="text-foreground flex-1 truncate">{log.notes}</span>}
                        <span className="text-muted-foreground/60 text-[10px]">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-center gap-1.5 p-2 rounded-md bg-background/40">
    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
    <div>
      <p className="text-[9px] text-muted-foreground">{label}</p>
      <p className="text-xs font-medium text-foreground">{value}</p>
    </div>
  </div>
);

export default GlobalStrategyPanel;
