import { useState } from 'react';
import { useGlobalMarketIntelligence, GlobalMarket } from '@/hooks/useGlobalMarketIntelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Globe2, TrendingUp, DollarSign, BarChart3, ShieldCheck, MapPin, Star, Plane } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';

const GRADE_CONFIG: Record<string, { badge: string }> = {
  'A+': { badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  'A': { badge: 'bg-green-500/10 text-green-500 border-green-500/20' },
  'B+': { badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  'B': { badge: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
  'C': { badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  'D': { badge: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const RISK_COLOR: Record<string, string> = {
  'Low': 'text-emerald-500',
  'Low-Medium': 'text-green-500',
  'Medium': 'text-amber-500',
  'Medium-High': 'text-orange-500',
  'High': 'text-red-400',
};

const formatUSD = (n: number) => `$${n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : (n / 1000).toFixed(0) + 'K'}`;

const SCATTER_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const MarketCard = ({ market, rank }: { market: GlobalMarket; rank: number }) => {
  const gradeCfg = GRADE_CONFIG[market.grade] || GRADE_CONFIG['C'];
  const riskColor = RISK_COLOR[market.risk_level] || 'text-muted-foreground';

  return (
    <Card className="bg-card/60 border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{market.flag}</span>
            <div>
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                {market.city}
                <span className="text-xs text-muted-foreground font-normal">#{rank}</span>
              </h4>
              <p className="text-xs text-muted-foreground">{market.country} · {market.region}</p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-1">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${gradeCfg.badge}`}>{market.grade}</span>
            <span className="text-lg font-bold text-foreground">{market.investment_score}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-muted/30 rounded-lg p-1.5">
            <p className="text-[10px] text-muted-foreground">Yield</p>
            <p className="text-sm font-bold text-foreground">{market.rental_yield}%</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-1.5">
            <p className="text-[10px] text-muted-foreground">Growth</p>
            <p className="text-sm font-bold text-foreground">{market.price_growth}%</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-1.5">
            <p className="text-[10px] text-muted-foreground">Entry</p>
            <p className="text-sm font-bold text-foreground">{formatUSD(market.entry_price_usd)}</p>
          </div>
        </div>

        <div className="space-y-1">
          {[
            { label: 'Yield', value: market.score_breakdown.yield, max: 30 },
            { label: 'Growth', value: market.score_breakdown.growth, max: 25 },
            { label: 'Access', value: market.score_breakdown.accessibility, max: 20 },
            { label: 'Demand', value: market.score_breakdown.demand, max: 15 },
            { label: 'Value', value: market.score_breakdown.value, max: 10 },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 text-xs">
              <span className="w-12 text-muted-foreground">{s.label}</span>
              <Progress value={(s.value / s.max) * 100} className="h-1 flex-1" />
              <span className="w-6 text-right text-foreground font-medium">{s.value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs border-t border-border/30 pt-2">
          <span className={`font-medium ${riskColor}`}>{market.risk_level} Risk</span>
          <span className="text-muted-foreground">{market.currency} · Avg {formatUSD(market.avg_price_usd)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const GlobalMarketIntelligenceDashboard = () => {
  const [budget, setBudget] = useState<number>(0);
  const [region, setRegion] = useState('all');
  const { data, isLoading, error } = useGlobalMarketIntelligence({ investment_budget: budget, region });

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="m-6"><CardContent className="p-8 text-center text-muted-foreground">
        <Globe2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Failed to load global market data</p>
      </CardContent></Card>
    );
  }

  const { markets, regions, summary } = data;

  const chartData = markets.slice(0, 12).map((m) => ({
    city: m.city.length > 14 ? m.flag + ' ' + m.city.slice(0, 11) + '…' : m.flag + ' ' + m.city,
    score: m.investment_score,
    yield: m.rental_yield,
    growth: m.price_growth,
  }));

  // Scatter: yield vs growth, size = score
  const scatterData = markets.map((m, i) => ({
    x: m.rental_yield,
    y: m.price_growth,
    z: m.investment_score,
    name: m.city,
    region: m.region,
  }));
  const regionColors: Record<string, string> = {};
  const uniqueRegions = [...new Set(markets.map(m => m.region))];
  uniqueRegions.forEach((r, i) => { regionColors[r] = SCATTER_COLORS[i % SCATTER_COLORS.length]; });

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Globe2 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Global Market Intelligence</h2>
            <p className="text-sm text-muted-foreground">Compare real estate markets across countries</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="Southeast Asia">Southeast Asia</SelectItem>
              <SelectItem value="Middle East">Middle East</SelectItem>
              <SelectItem value="Europe">Europe</SelectItem>
              <SelectItem value="Americas">Americas</SelectItem>
              <SelectItem value="East Asia">East Asia</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative">
            <DollarSign className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              type="number"
              placeholder="Max budget (USD)"
              className="pl-8 w-[170px]"
              value={budget || ''}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { icon: MapPin, label: 'Markets Analyzed', value: summary.total_markets, sub: `Region: ${summary.region_filter}` },
          { icon: Star, label: 'Top Market', value: summary.top_market, sub: `Score: ${summary.top_score}` },
          { icon: TrendingUp, label: 'Avg Yield', value: `${summary.avg_yield}%`, sub: 'Across all markets' },
          { icon: BarChart3, label: 'Avg Growth', value: `${summary.avg_growth}%`, sub: 'Price appreciation' },
          { icon: DollarSign, label: 'Budget Filter', value: summary.budget_filter, sub: 'Entry threshold' },
        ].map((kpi, i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <kpi.icon className="w-4 h-4" /><span className="text-xs">{kpi.label}</span>
              </div>
              <p className="text-lg font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Ranking */}
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Investment Score Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis type="category" dataKey="city" tick={{ fontSize: 10 }} width={110} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  formatter={(v: number) => [`${v}/100`, 'Score']} />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Yield vs Growth Scatter */}
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Yield vs Growth (bubble = score)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart margin={{ bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis type="number" dataKey="x" name="Yield %" tick={{ fontSize: 11 }} className="fill-muted-foreground" label={{ value: 'Rental Yield %', position: 'bottom', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis type="number" dataKey="y" name="Growth %" tick={{ fontSize: 11 }} className="fill-muted-foreground" label={{ value: 'Price Growth %', angle: -90, position: 'insideLeft', fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <ZAxis type="number" dataKey="z" range={[40, 400]} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  formatter={(v: number, name: string) => [name === 'x' ? `${v}%` : name === 'y' ? `${v}%` : v, name === 'x' ? 'Yield' : name === 'y' ? 'Growth' : 'Score']}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''} />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, i) => (
                    <Cell key={i} fill={regionColors[entry.region] || '#64748b'} fillOpacity={0.7} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {uniqueRegions.map((r) => (
                <div key={r} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: regionColors[r] }} />
                  {r}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Region Summary */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary" />
            Region Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {regions.map((r) => (
              <div key={r.region} className="bg-muted/30 rounded-lg p-3 text-center space-y-1">
                <p className="text-sm font-semibold text-foreground">{r.region}</p>
                <p className="text-xs text-muted-foreground">{r.markets} markets</p>
                <div className="flex justify-center gap-3 text-xs">
                  <span className="text-foreground">Yield: <b>{r.avg_yield}%</b></span>
                  <span className="text-foreground">Growth: <b>{r.avg_growth}%</b></span>
                </div>
                <p className="text-lg font-bold text-primary">{r.avg_score}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Globe2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">All Markets</h3>
          <Badge variant="secondary" className="ml-auto">{markets.length} cities</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {markets.map((m, i) => (
            <MarketCard key={m.city} market={m} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GlobalMarketIntelligenceDashboard;
