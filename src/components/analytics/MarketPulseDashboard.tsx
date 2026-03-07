import { useMarketPulse, CityPulse } from '@/hooks/useMarketPulse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, TrendingUp, Building2, Eye, MessageSquare, Zap, BarChart3, Globe } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const SIGNAL_CONFIG: Record<string, { color: string; label: string; badge: string }> = {
  hot: { color: 'text-red-500', label: '🔥 Hot', badge: 'bg-red-500/10 text-red-500 border-red-500/20' },
  warming: { color: 'text-orange-500', label: '📈 Warming', badge: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  stable: { color: 'text-blue-500', label: '➡️ Stable', badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  cooling: { color: 'text-slate-400', label: '❄️ Cooling', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
};

const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

const formatPrice = (n: number) => {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}M`;
  return `Rp ${n.toLocaleString()}`;
};

const HealthGauge = ({ score, label }: { score: number; label: string }) => {
  const gaugeColor = score >= 80 ? 'text-emerald-500' : score >= 60 ? 'text-blue-500' : score >= 40 ? 'text-amber-500' : 'text-red-500';
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-muted" />
          <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeDasharray={`${score * 2.64} 264`} strokeLinecap="round" className={`${gaugeColor.replace('text-', 'stroke-')} transition-all duration-1000`} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${gaugeColor}`}>{score}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

const CityPulseCard = ({ city }: { city: CityPulse }) => {
  const cfg = SIGNAL_CONFIG[city.signal] || SIGNAL_CONFIG.stable;
  const maxMomentum = 100;
  return (
    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-foreground">{city.city}</h4>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.badge}`}>{cfg.label}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><span className="text-muted-foreground">Listings</span><p className="font-medium text-foreground">{city.total_listings}</p></div>
          <div><span className="text-muted-foreground">Avg Price</span><p className="font-medium text-foreground">{formatPrice(city.avg_price)}</p></div>
          <div><span className="text-muted-foreground">Views (7d)</span><p className="font-medium text-foreground">{city.views_7d}</p></div>
          <div><span className="text-muted-foreground">Inquiries</span><p className="font-medium text-foreground">{city.inquiries_30d}</p></div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Momentum</span>
            <span className="text-foreground font-medium">{city.momentum_score}</span>
          </div>
          <Progress value={Math.min(100, (city.momentum_score / maxMomentum) * 100)} className="h-1.5" />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="w-3 h-3" />
          <span className="capitalize">{city.dominant_type}</span>
          <span className="ml-auto">Score: {city.avg_investment_score}</span>
        </div>
      </CardContent>
    </Card>
  );
};

const MarketPulseDashboard = () => {
  const { data, isLoading, error } = useMarketPulse();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="m-6"><CardContent className="p-8 text-center text-muted-foreground">
        <Activity className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Failed to load market pulse data</p>
      </CardContent></Card>
    );
  }

  const { market_overview: overview, city_pulse, price_by_type, activity_trend } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Activity className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Market Pulse</h2>
          <p className="text-sm text-muted-foreground">Real-time market trends & demand signals</p>
        </div>
      </div>

      {/* KPI Strip + Health Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-1 bg-card/50">
          <CardContent className="p-6 flex items-center justify-center">
            <HealthGauge score={overview.health_score} label={overview.health_label} />
          </CardContent>
        </Card>
        {[
          { icon: Building2, label: 'Total Listings', value: overview.total_listings.toLocaleString(), sub: `${overview.new_listings_7d} new this week` },
          { icon: Eye, label: 'Views (30d)', value: overview.views_30d.toLocaleString(), sub: 'Across all properties' },
          { icon: MessageSquare, label: 'Inquiries (30d)', value: overview.inquiries_30d.toLocaleString(), sub: 'Buyer interest signals' },
          { icon: TrendingUp, label: 'Avg Price', value: formatPrice(overview.avg_price), sub: 'Market-wide average' },
        ].map((kpi, i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <kpi.icon className="w-4 h-4" />
                <span className="text-xs">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Trend Chart */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            7-Day Activity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={activity_trend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} className="fill-muted-foreground" tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Area type="monotone" dataKey="views" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} name="Views" />
              <Area type="monotone" dataKey="inquiries" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} name="Inquiries" />
              <Area type="monotone" dataKey="new_listings" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.15} name="New Listings" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* City Pulse */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">City Pulse</h3>
            <Badge variant="secondary" className="ml-auto">{city_pulse.length} cities</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {city_pulse.slice(0, 8).map((cp) => (
              <CityPulseCard key={cp.city} city={cp} />
            ))}
          </div>
        </div>

        {/* Property Type Distribution */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">By Property Type</h3>
          </div>
          <Card className="bg-card/50">
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={price_by_type.slice(0, 6)} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={75} innerRadius={40} paddingAngle={2}>
                    {price_by_type.slice(0, 6).map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-2">
                {price_by_type.slice(0, 5).map((pt, i) => (
                  <div key={pt.type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="capitalize text-foreground">{pt.type}</span>
                    </div>
                    <span className="text-muted-foreground">{pt.market_share}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Momentum */}
          <Card className="bg-card/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Top Momentum Cities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.top_momentum_cities.map((city, i) => (
                <div key={city} className="flex items-center gap-3 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span className="text-foreground font-medium">{city}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MarketPulseDashboard;
