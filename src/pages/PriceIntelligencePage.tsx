import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp, TrendingDown, MapPin, Zap, Shield, AlertTriangle, BarChart3,
  Globe, Building2, Loader2, Sparkles, Activity, Eye, Target, Radio, ChevronRight
} from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Area, AreaChart, Legend, Cell, PieChart as RePieChart, Pie
} from 'recharts';
import {
  useMacroPriceTrends, useMicroValuations, useGrowthZones,
  useMarketCycles, usePriceShocks,
  type MacroTrendsResult, type MicroValuationsResult,
  type GrowthZonesResult, type MarketCyclesResult, type PriceShocksResult,
} from '@/hooks/usePriceIntelligence';

const CITIES = ['Jakarta', 'Bali', 'Surabaya', 'Bandung', 'Yogyakarta', 'Dubai', 'Singapore', 'Bangkok'];
const PHASE_COLORS: Record<string, string> = {
  expansion: 'bg-emerald-500/20 text-emerald-400',
  peak: 'bg-orange-500/20 text-orange-400',
  correction: 'bg-destructive/20 text-destructive',
  recovery: 'bg-primary/20 text-primary',
};
const SEVERITY_COLORS: Record<string, string> = {
  critical: 'bg-destructive text-destructive-foreground',
  high: 'bg-orange-500/20 text-orange-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  low: 'bg-muted text-muted-foreground',
};

function fmtPrice(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toLocaleString();
}

// ── 1. Macro Price Trends Tab ──
function MacroTrendsTab() {
  const mutation = useMacroPriceTrends();
  const [city, setCity] = useState('all');
  const result = mutation.data as MacroTrendsResult | undefined;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-primary" /> Macro Price Trend Engine</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={city} onValueChange={setCity}><SelectTrigger><SelectValue placeholder="All cities" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Markets</SelectItem>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={() => mutation.mutate({ city })} disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing...</> : <><BarChart3 className="h-4 w-4 mr-2" /> Analyze Price Trends</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {result.trends.slice(0, 4).map(t => (
              <Card key={t.city} className="bg-card/60 border-border/40">
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground">{t.city}</p>
                  <p className="text-lg font-bold">Rp {fmtPrice(t.current_ppsqm)}/m²</p>
                  <div className="flex items-center gap-1 mt-1">
                    {t.ytd_growth > 0 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                    <span className={`text-xs font-medium ${t.ytd_growth > 0 ? 'text-emerald-500' : 'text-destructive'}`}>{t.ytd_growth}% YTD</span>
                  </div>
                  <Badge className={`mt-1 text-xs ${PHASE_COLORS[t.cycle_phase] || ''}`}>{t.cycle_phase}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {result.trends.length > 0 && (
            <Card className="bg-card/60 border-border/40">
              <CardHeader><CardTitle className="text-sm">Price Per SQM Evolution (Quarterly)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="period" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} allowDuplicatedCategory={false} />
                    <YAxis tickFormatter={v => fmtPrice(v)} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <Tooltip formatter={(v: number) => `Rp ${fmtPrice(v)}`} />
                    <Legend />
                    {result.trends.slice(0, 4).map((t, i) => (
                      <Line key={t.city} data={t.quarterly_data} type="monotone" dataKey="avg_price_per_sqm" name={t.city}
                        stroke={`hsl(var(--chart-${(i % 5) + 1}))`} strokeWidth={2} dot={false} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm">Bubble Risk Assessment</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={result.trends} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis type="category" dataKey="city" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} width={80} />
                  <Tooltip />
                  <Bar dataKey="bubble_risk" name="Bubble Risk %" radius={[0, 4, 4, 0]}>
                    {result.trends.map((t, i) => (
                      <Cell key={i} fill={t.bubble_risk > 40 ? 'hsl(var(--destructive))' : t.bubble_risk > 25 ? 'hsl(var(--chart-4))' : 'hsl(var(--primary))'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ── 2. Micro Location Tab ──
function MicroLocationTab() {
  const mutation = useMicroValuations();
  const [city, setCity] = useState('Bali');
  const result = mutation.data as MicroValuationsResult | undefined;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><MapPin className="h-5 w-5 text-primary" /> Micro Location Value Predictor</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={city} onValueChange={setCity}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={() => mutation.mutate({ city })} disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Predicting...</> : <><Eye className="h-4 w-4 mr-2" /> Predict District Values</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {result.top_district && (
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-primary" /><span className="font-semibold">Top: {result.top_district.district}</span><Badge className="ml-auto">{result.top_district.investment_desirability}/100</Badge></div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div><span className="text-muted-foreground">1Y:</span> <strong className="text-emerald-500">+{result.top_district.appreciation_pct_1y}%</strong></div>
                  <div><span className="text-muted-foreground">3Y:</span> <strong className="text-emerald-500">+{result.top_district.appreciation_pct_3y}%</strong></div>
                  <div><span className="text-muted-foreground">5Y:</span> <strong className="text-emerald-500">+{result.top_district.appreciation_pct_5y}%</strong></div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm">District Appreciation Forecast</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={result.valuations}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="district" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip />
                  <Bar dataKey="appreciation_pct_1y" name="1Y %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="appreciation_pct_3y" name="3Y %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="appreciation_pct_5y" name="5Y %" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm">Infrastructure & Demand Radar</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={result.valuations.slice(0, 6).map(v => ({
                  district: v.district,
                  Transport: v.transport_proximity_score,
                  Lifestyle: v.lifestyle_infra_score,
                  Commercial: v.commercial_emergence_score,
                  Tourism: v.tourism_value_spike,
                  Liquidity: v.liquidity_forecast,
                  Desirability: v.investment_desirability,
                }))}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="district" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Transport" dataKey="Transport" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
                  <Radar name="Tourism" dataKey="Tourism" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ── 3. Growth Zones Tab ──
function GrowthZonesTab() {
  const mutation = useGrowthZones();
  const [city, setCity] = useState('all');
  const result = mutation.data as GrowthZonesResult | undefined;

  const timingColors: Record<string, string> = {
    strong_buy: 'bg-emerald-500 text-white',
    buy: 'bg-emerald-500/20 text-emerald-400',
    neutral: 'bg-muted text-muted-foreground',
    wait: 'bg-yellow-500/20 text-yellow-400',
    avoid: 'bg-destructive/20 text-destructive',
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Target className="h-5 w-5 text-primary" /> Early Growth Zone Detection</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={city} onValueChange={setCity}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Markets</SelectItem>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={() => mutation.mutate({ city })} disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Detecting...</> : <><Zap className="h-4 w-4 mr-2" /> Detect Growth Zones</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          {result.top_zone && (
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2"><Sparkles className="h-5 w-5 text-primary" /><span className="font-semibold">#1 Zone: {result.top_zone.city} — {result.top_zone.district}</span></div>
                <p className="text-sm text-muted-foreground">Confidence: {result.top_zone.growth_confidence}% • Projected appreciation: +{result.top_zone.projected_appreciation_pct}% in {result.top_zone.capital_appreciation_horizon}</p>
              </CardContent>
            </Card>
          )}

          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {result.growth_zones.slice(0, 15).map((z, i) => (
                <Card key={i} className="bg-card/60 border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono">#{i+1}</span>
                        <span className="font-medium text-sm">{z.city} — {z.district}</span>
                      </div>
                      <Badge className={timingColors[z.entry_timing] || 'bg-muted'}>{z.entry_timing.replace(/_/g, ' ')}</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                      <div><span className="text-muted-foreground">Confidence:</span> <strong>{z.growth_confidence}%</strong></div>
                      <div><span className="text-muted-foreground">Appreciation:</span> <strong className="text-emerald-500">+{z.projected_appreciation_pct}%</strong></div>
                      <div><span className="text-muted-foreground">Undervalued:</span> <strong>{z.undervaluation_pct}%</strong></div>
                      <div><span className="text-muted-foreground">Horizon:</span> <strong>{z.capital_appreciation_horizon}</strong></div>
                    </div>
                    <div className="flex items-center gap-1"><Progress value={z.growth_confidence} className="h-1.5 flex-1" /><span className="text-xs text-muted-foreground ml-1">{z.zone_type.replace(/_/g, ' ')}</span></div>
                    {z.gentrification_signals.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">{z.gentrification_signals.map((s, j) => <Badge key={j} variant="outline" className="text-xs">{s}</Badge>)}</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}

// ── 4. Market Cycles Tab ──
function MarketCyclesTab() {
  const mutation = useMarketCycles();
  const [city, setCity] = useState('all');
  const result = mutation.data as MarketCyclesResult | undefined;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5 text-primary" /> Market Cycle Intelligence</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select value={city} onValueChange={setCity}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Markets</SelectItem>{CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={() => mutation.mutate({ city })} disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Classifying...</> : <><Globe className="h-4 w-4 mr-2" /> Classify Market Cycles</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {result.classifications.slice(0, 8).map((c: any) => (
              <Card key={c.city} className="bg-card/60 border-border/40">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{c.city}</p>
                  <Badge className={PHASE_COLORS[c.current_phase] || 'bg-muted'}>{c.current_phase}</Badge>
                  <p className="text-lg font-bold mt-2">{c.cycle_position_pct}%</p>
                  <p className="text-xs text-muted-foreground">cycle position</p>
                  <p className="text-xs mt-1">ROI: <strong className="text-emerald-500">{c.risk_adjusted_roi}%</strong></p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm">Cycle Position & Momentum</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={result.classifications}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="city" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip />
                  <Bar dataKey="cycle_position_pct" name="Cycle Position %" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sentiment_score" name="Sentiment" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm">Strategy Recommendations</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.classifications.slice(0, 6).map((c: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                    <Badge className={PHASE_COLORS[c.current_phase] || 'bg-muted'}>{c.city}</Badge>
                    <div className="flex-1"><p className="text-sm">{c.recommended_strategy}</p>
                      <p className="text-xs text-muted-foreground mt-1">Confidence: {c.phase_confidence}% • Duration: {c.phase_duration_months}mo</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// ── 5. Price Shocks Tab ──
function PriceShocksTab() {
  const mutation = usePriceShocks();
  const result = mutation.data as PriceShocksResult | undefined;

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Radio className="h-5 w-5 text-destructive animate-pulse" /> Real-Time Price Shock Monitor</CardTitle></CardHeader>
        <CardContent>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Scanning...</> : <><Shield className="h-4 w-4 mr-2" /> Scan for Price Shocks</>}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-card/60"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Active Alerts</p><p className="text-2xl font-bold">{result.active_alerts.length}</p></CardContent></Card>
            <Card className="bg-card/60"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Critical</p><p className="text-2xl font-bold text-destructive">{result.critical_count}</p></CardContent></Card>
            <Card className="bg-card/60"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Market Direction</p><Badge className={result.net_market_direction.includes('positive') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted'}>{result.net_market_direction.replace(/_/g, ' ')}</Badge></CardContent></Card>
          </div>

          <ScrollArea className="h-[450px]">
            <div className="space-y-3">
              {result.active_alerts.map((a, i) => (
                <Card key={i} className="bg-card/60 border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={SEVERITY_COLORS[a.severity] || 'bg-muted'}>{a.severity}</Badge>
                        <Badge variant="outline" className="text-xs">{a.alert_type.replace(/_/g, ' ')}</Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        {a.direction === 'surge' ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : a.direction === 'drop' ? <TrendingDown className="h-4 w-4 text-destructive" /> : <Activity className="h-4 w-4 text-muted-foreground" />}
                        <span className={`text-sm font-bold ${a.price_impact_pct > 0 ? 'text-emerald-500' : a.price_impact_pct < 0 ? 'text-destructive' : ''}`}>{a.price_impact_pct > 0 ? '+' : ''}{a.price_impact_pct}%</span>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{a.shock_description}</p>
                    <div className="flex flex-wrap gap-1 mb-2">{a.affected_cities.map((c, j) => <Badge key={j} variant="secondary" className="text-xs">{c}</Badge>)}</div>
                    {a.recommendations && a.recommendations.length > 0 && (
                      <div className="space-y-1 mt-2 p-2 rounded bg-background/50">
                        {a.recommendations.map((r: any, j: number) => (
                          <div key={j} className="flex items-start gap-2 text-xs">
                            <ChevronRight className="h-3 w-3 mt-0.5 text-primary" />
                            <span><strong className="capitalize">{r.action}:</strong> {r.detail}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">Confidence: {a.confidence}%</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </>
      )}
    </div>
  );
}

// ── Main Page ──
export default function PriceIntelligencePage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-lg bg-primary/10"><Globe className="h-6 w-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-bold">Price Intelligence Engine</h1>
            <p className="text-sm text-muted-foreground">Global property price prediction — forecast where prices will rise before the market reacts</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="macro" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full h-auto gap-1">
          <TabsTrigger value="macro" className="text-xs gap-1"><TrendingUp className="h-3.5 w-3.5" /><span className="hidden sm:inline">Macro Trends</span></TabsTrigger>
          <TabsTrigger value="micro" className="text-xs gap-1"><MapPin className="h-3.5 w-3.5" /><span className="hidden sm:inline">Micro Location</span></TabsTrigger>
          <TabsTrigger value="growth" className="text-xs gap-1"><Target className="h-3.5 w-3.5" /><span className="hidden sm:inline">Growth Zones</span></TabsTrigger>
          <TabsTrigger value="cycles" className="text-xs gap-1"><Activity className="h-3.5 w-3.5" /><span className="hidden sm:inline">Market Cycles</span></TabsTrigger>
          <TabsTrigger value="shocks" className="text-xs gap-1"><Radio className="h-3.5 w-3.5" /><span className="hidden sm:inline">Price Shocks</span></TabsTrigger>
        </TabsList>

        <TabsContent value="macro"><MacroTrendsTab /></TabsContent>
        <TabsContent value="micro"><MicroLocationTab /></TabsContent>
        <TabsContent value="growth"><GrowthZonesTab /></TabsContent>
        <TabsContent value="cycles"><MarketCyclesTab /></TabsContent>
        <TabsContent value="shocks"><PriceShocksTab /></TabsContent>
      </Tabs>
    </div>
  );
}
