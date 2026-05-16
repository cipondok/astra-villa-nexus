import { usePredictiveDevelopment, DevOpportunity } from '@/hooks/usePredictiveDevelopment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Building2, Home, MapPin, TrendingUp, Target, BarChart3, Lightbulb, ArrowUpRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const TYPE_CONFIG: Record<string, { icon: typeof Building; label: string; color: string; badge: string }> = {
  villa_project: { icon: Home, label: 'Villa Project', color: 'text-emerald-500', badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  apartment_project: { icon: Building2, label: 'Apartment Project', color: 'text-blue-500', badge: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  commercial_project: { icon: Building, label: 'Commercial Project', color: 'text-amber-500', badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
};

const formatPrice = (n: number) => {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)}M`;
  return `Rp ${n.toLocaleString()}`;
};

const ScoreRing = ({ score, size = 56 }: { score: number; size?: number }) => {
  const color = score >= 70 ? 'stroke-emerald-500' : score >= 45 ? 'stroke-amber-500' : 'stroke-red-400';
  const textColor = score >= 70 ? 'text-emerald-500' : score >= 45 ? 'text-amber-500' : 'text-red-400';
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="4" className="stroke-muted" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="4"
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round" className={`${color} transition-all duration-700`} />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${textColor}`}>{score}</span>
    </div>
  );
};

const OpportunityCard = ({ opp, rank }: { opp: DevOpportunity; rank: number }) => {
  const cfg = TYPE_CONFIG[opp.development_type] || TYPE_CONFIG.villa_project;
  const Icon = cfg.icon;
  const radarData = [
    { metric: 'Buyer', value: opp.score_breakdown.buyer_activity },
    { metric: 'Demand', value: opp.score_breakdown.demand_heat },
    { metric: 'Supply Gap', value: opp.score_breakdown.supply_gap },
    { metric: 'Price Trend', value: opp.score_breakdown.price_trend },
  ];

  return (
    <Card className="bg-card/60 border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ScoreRing score={opp.growth_score} />
              <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                {rank}
              </span>
            </div>
            <div>
              <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {opp.city}
              </h4>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.badge} inline-flex items-center gap-1 mt-1`}>
                <Icon className="w-3 h-3" />
                {cfg.label}
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Reason */}
        <p className="text-xs text-muted-foreground leading-relaxed">{opp.reason}</p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { label: 'Avg Price', value: formatPrice(opp.metrics.avg_price) },
            { label: 'Yield', value: `${opp.metrics.avg_rental_yield}%` },
            { label: 'Demand', value: opp.metrics.avg_demand_score.toFixed(0) },
          ].map((m) => (
            <div key={m.label} className="bg-muted/30 rounded-lg p-2">
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
              <p className="text-sm font-semibold text-foreground">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Score Breakdown Bars */}
        <div className="space-y-1.5">
          {radarData.map((r) => (
            <div key={r.metric} className="flex items-center gap-2 text-xs">
              <span className="w-16 text-muted-foreground truncate">{r.metric}</span>
              <Progress value={(r.value / 25) * 100} className="h-1.5 flex-1" />
              <span className="w-6 text-right text-foreground font-medium">{r.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const PredictiveDevelopmentDashboard = () => {
  const { data, isLoading, error } = usePredictiveDevelopment();

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-72" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="m-6"><CardContent className="p-8 text-center text-muted-foreground">
        <Target className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p>Failed to load predictive development data</p>
      </CardContent></Card>
    );
  }

  const { development_opportunities: opps, summary } = data;
  const chartData = opps.slice(0, 10).map((o) => ({
    city: o.city.length > 12 ? o.city.slice(0, 10) + '…' : o.city,
    score: o.growth_score,
    type: o.development_type,
  }));
  const typeDist = summary.type_distribution;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Lightbulb className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Predictive Development Engine</h2>
          <p className="text-sm text-muted-foreground">AI-detected areas suitable for new real estate developments</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: MapPin, label: 'Cities Analyzed', value: summary.total_cities_analyzed, sub: 'Across all regions' },
          { icon: TrendingUp, label: 'Top Opportunity', value: summary.top_opportunity, sub: `Score: ${opps[0]?.growth_score || 0}` },
          { icon: BarChart3, label: 'Avg Growth Score', value: summary.avg_growth_score, sub: 'Market-wide average' },
          { icon: Target, label: 'Dev Types Found', value: Object.values(typeDist).filter(v => v > 0).length, sub: `${typeDist.villa_project}V · ${typeDist.apartment_project}A · ${typeDist.commercial_project}C` },
        ].map((kpi, i) => (
          <Card key={i} className="bg-card/50">
            <CardContent className="p-4 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <kpi.icon className="w-4 h-4" />
                <span className="text-xs">{kpi.label}</span>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Score Chart */}
      <Card className="bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Development Growth Scores by City
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} className="fill-muted-foreground" />
              <YAxis type="category" dataKey="city" tick={{ fontSize: 11 }} width={90} className="fill-muted-foreground" />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                formatter={(value: number) => [`${value}/100`, 'Growth Score']} />
              <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Opportunity Cards */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Development Opportunities</h3>
          <Badge variant="secondary" className="ml-auto">{opps.length} cities</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {opps.slice(0, 9).map((opp, i) => (
            <OpportunityCard key={opp.city} opp={opp} rank={i + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictiveDevelopmentDashboard;
