import { useExpansionIntelligence, ExpansionTarget } from '@/hooks/useExpansionIntelligence';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, TrendingUp, Users, Plane, ShieldCheck, MapPin, BarChart3, Star } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const READINESS_CONFIG: Record<string, { badge: string; dot: string }> = {
  Ready: { badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', dot: 'bg-emerald-500' },
  'High Potential': { badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20', dot: 'bg-blue-500' },
  Emerging: { badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20', dot: 'bg-amber-500' },
  Watch: { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
};

const ScoreBar = ({ label, value, max = 25, icon: Icon }: { label: string; value: number; max?: number; icon: typeof TrendingUp }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 text-muted-foreground"><Icon className="w-3 h-3" />{label}</span>
      <span className="text-foreground font-medium">{value}/{max}</span>
    </div>
    <Progress value={(value / max) * 100} className="h-1.5" />
  </div>
);

const TargetCard = ({ target, rank }: { target: ExpansionTarget; rank: number }) => {
  const cfg = READINESS_CONFIG[target.readiness] || READINESS_CONFIG.Watch;
  return (
    <Card className="bg-card/60 border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{target.flag}</div>
            <div>
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                {target.country}
                <span className="text-xs text-muted-foreground font-normal">#{rank}</span>
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">{target.region}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${cfg.badge}`}>{target.readiness}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-foreground">{target.total_score}</p>
            <p className="text-[10px] text-muted-foreground">/ 100</p>
          </div>
        </div>

        <div className="space-y-2">
          <ScoreBar label="Market Growth" value={target.market_growth} icon={TrendingUp} />
          <ScoreBar label="Investor Interest" value={target.investor_interest} icon={Users} />
          <ScoreBar label="Tourism Demand" value={target.tourism_demand} icon={Plane} />
          <ScoreBar label="Economic Stability" value={target.economic_stability} icon={ShieldCheck} />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'GDP', value: `${target.metrics.gdp_growth}%` },
            { label: 'Yield', value: `${target.metrics.rental_yield_avg}%` },
            { label: 'Tourism', value: `${target.metrics.tourism_arrivals_m}M` },
          ].map((m) => (
            <div key={m.label} className="bg-muted/30 rounded-lg p-1.5">
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className="text-xs font-semibold text-foreground">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Key Factors:</p>
          <ul className="space-y-0.5">
            {target.reasons.slice(0, 3).map((r, i) => (
              <li key={i} className="flex items-start gap-1">
                <Star className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-[10px] text-muted-foreground border-t border-border/30 pt-2">
          <span className="font-medium">Ownership:</span> {target.metrics.foreign_ownership}
        </div>
      </CardContent>
    </Card>
  );
};

const ExpansionIntelligenceDashboard = () => {
  const { data, isLoading, error } = useExpansionIntelligence();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-72" />)}</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="m-6"><CardContent className="p-8 text-center text-muted-foreground">
        <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Failed to load expansion intelligence data</p>
      </CardContent></Card>
    );
  }

  const { expansion_targets: targets, summary } = data;

  const chartData = targets.slice(0, 8).map((t) => ({
    country: t.country.length > 10 ? t.flag + ' ' + t.country.slice(0, 8) + '…' : t.flag + ' ' + t.country,
    score: t.total_score,
  }));

  const topTarget = targets[0];
  const radarData = topTarget ? [
    { metric: 'Market Growth', value: topTarget.market_growth },
    { metric: 'Investor Interest', value: topTarget.investor_interest },
    { metric: 'Tourism', value: topTarget.tourism_demand },
    { metric: 'Stability', value: topTarget.economic_stability },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Globe className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Global Expansion Intelligence</h2>
          <p className="text-sm text-muted-foreground">AI-powered market analysis for international platform expansion</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Globe, label: 'Markets Analyzed', value: summary.total_markets_analyzed, sub: 'Countries evaluated' },
          { icon: MapPin, label: 'Top Target', value: summary.top_target, sub: `Score: ${targets[0]?.total_score || 0}` },
          { icon: ShieldCheck, label: 'Ready Markets', value: summary.ready_markets, sub: `${summary.high_potential_markets} high potential` },
          { icon: BarChart3, label: 'Avg Score', value: summary.avg_score, sub: 'Across all markets' },
        ].map((kpi, i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <kpi.icon className="w-4 h-4" /><span className="text-xs">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Rankings */}
        <Card className="lg:col-span-2 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Expansion Readiness Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 11 }} width={100} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  formatter={(v: number) => [`${v}/100`, 'Score']} />
                <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Target Radar */}
        <Card className="bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {topTarget?.flag} {topTarget?.country} Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-border/30" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                <PolarRadiusAxis domain={[0, 25]} tick={false} />
                <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Target Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Expansion Targets</h3>
          <Badge variant="secondary" className="ml-auto">{targets.length} markets</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {targets.map((t, i) => (
            <TargetCard key={t.country} target={t} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpansionIntelligenceDashboard;
