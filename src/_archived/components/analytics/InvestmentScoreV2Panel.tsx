import { useInvestmentScoreV2 } from '@/hooks/useInvestmentScoreV2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Target, MapPin, DollarSign, Home, TrendingUp, Droplets,
  Eye, Heart, BarChart3, ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const GRADE_STYLES: Record<string, string> = {
  'A+': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'A': 'bg-green-500/10 text-green-500 border-green-500/20',
  'B+': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'B': 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  'C': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'D': 'bg-red-500/10 text-red-400 border-red-500/20',
};

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
const formatShort = (v: number) =>
  v >= 1e9 ? `${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1e3).toFixed(0)}K`;

interface Props {
  propertyId: string;
  compact?: boolean;
}

const InvestmentScoreV2Panel = ({ propertyId, compact = false }: Props) => {
  const { data, isLoading, error } = useInvestmentScoreV2(propertyId);

  if (isLoading) {
    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32" />
          <Skeleton className="h-20" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Unable to calculate investment score</p>
        </CardContent>
      </Card>
    );
  }

  const { breakdown: b } = data;
  const gradeStyle = GRADE_STYLES[data.grade] || GRADE_STYLES['C'];

  const radarData = [
    { factor: 'Demand', value: (b.location_demand.score / b.location_demand.max) * 100, fullMark: 100 },
    { factor: 'Price', value: (b.price_fairness.score / b.price_fairness.max) * 100, fullMark: 100 },
    { factor: 'Yield', value: (b.rental_yield.score / b.rental_yield.max) * 100, fullMark: 100 },
    { factor: 'Growth', value: (b.market_growth.score / b.market_growth.max) * 100, fullMark: 100 },
    { factor: 'Liquid.', value: (b.liquidity.score / b.liquidity.max) * 100, fullMark: 100 },
  ];

  const scoreColor = data.investment_score >= 75 ? 'text-emerald-500' : data.investment_score >= 50 ? 'text-primary' : data.investment_score >= 35 ? 'text-amber-500' : 'text-destructive';

  const factors = [
    {
      key: 'location_demand',
      label: 'Location Demand',
      icon: MapPin,
      score: b.location_demand.score,
      max: b.location_demand.max,
      details: [
        { label: 'Views (30d)', value: b.location_demand.views_30d.toLocaleString() },
        { label: 'Saves (30d)', value: b.location_demand.saves_30d.toLocaleString() },
      ],
    },
    {
      key: 'price_fairness',
      label: 'Price Fairness',
      icon: DollarSign,
      score: b.price_fairness.score,
      max: b.price_fairness.max,
      details: [
        { label: 'Price/m²', value: formatIDR(b.price_fairness.price_per_sqm) },
        { label: 'City Median/m²', value: formatIDR(b.price_fairness.city_median_per_sqm) },
        { label: 'Price Ratio', value: `${b.price_fairness.price_ratio}x`, trend: b.price_fairness.price_ratio < 1 ? 'good' : b.price_fairness.price_ratio > 1.15 ? 'bad' : 'neutral' },
        { label: 'Comparables', value: b.price_fairness.comparables_count.toString() },
      ],
    },
    {
      key: 'rental_yield',
      label: 'Rental Yield',
      icon: Home,
      score: b.rental_yield.score,
      max: b.rental_yield.max,
      details: [
        { label: 'Monthly Rent', value: formatIDR(b.rental_yield.monthly_rent) },
        { label: 'Annual Rent', value: formatIDR(b.rental_yield.annual_rent) },
        { label: 'Gross Yield', value: `${b.rental_yield.gross_yield_percent}%`, trend: b.rental_yield.gross_yield_percent >= 6 ? 'good' : b.rental_yield.gross_yield_percent >= 4 ? 'neutral' : 'bad' },
      ],
    },
    {
      key: 'market_growth',
      label: 'Market Growth',
      icon: TrendingUp,
      score: b.market_growth.score,
      max: b.market_growth.max,
      details: [
        { label: 'Growth Rate', value: `${b.market_growth.growth_rate_percent > 0 ? '+' : ''}${b.market_growth.growth_rate_percent}%`, trend: b.market_growth.growth_rate_percent > 3 ? 'good' : b.market_growth.growth_rate_percent < 0 ? 'bad' : 'neutral' },
        { label: 'Recent Avg/m²', value: formatShort(b.market_growth.recent_avg_psm) },
        { label: 'Prior Avg/m²', value: formatShort(b.market_growth.older_avg_psm) },
      ],
    },
    {
      key: 'liquidity',
      label: 'Liquidity',
      icon: Droplets,
      score: b.liquidity.score,
      max: b.liquidity.max,
      details: [
        { label: 'Similar Listings', value: b.liquidity.similar_active_listings.toLocaleString() },
        { label: 'Supply/Demand', value: `${b.liquidity.supply_demand_ratio}x` },
      ],
    },
  ];

  if (compact) {
    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Investment Score v2</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${scoreColor}`}>{data.investment_score}</span>
              <Badge variant="outline" className={`text-xs ${gradeStyle}`}>{data.grade}</Badge>
            </div>
          </div>
          <div className="space-y-1.5">
            {factors.map(f => (
              <div key={f.key} className="flex items-center gap-2 text-xs">
                <f.icon className="w-3 h-3 text-muted-foreground" />
                <span className="text-muted-foreground w-24">{f.label}</span>
                <Progress value={(f.score / f.max) * 100} className="h-1.5 flex-1" />
                <span className="text-foreground font-medium w-8 text-right">{f.score}/{f.max}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">{data.recommendation}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Investment Score v2
            </CardTitle>
            <Badge variant="outline" className={`text-sm px-3 py-1 font-bold ${gradeStyle}`}>{data.grade}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Hero */}
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" strokeWidth="7" className="stroke-muted/20" />
                <circle
                  cx="50" cy="50" r="42" fill="none" strokeWidth="7"
                  strokeDasharray={`${data.investment_score * 2.64} 264`}
                  strokeLinecap="round"
                  className={data.investment_score >= 75 ? 'stroke-emerald-500' : data.investment_score >= 50 ? 'stroke-primary' : data.investment_score >= 35 ? 'stroke-amber-500' : 'stroke-destructive'}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${scoreColor}`}>{data.investment_score}</span>
                <span className="text-[10px] text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{data.title}</p>
              <p className="text-xs text-muted-foreground">{data.city} · {data.property_type}</p>
              <Separator className="my-2" />
              <p className="text-xs text-muted-foreground leading-relaxed">{data.recommendation}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                <span>{formatIDR(data.price)}</span>
                <span>·</span>
                <span>{data.area_sqm}m²</span>
                <span>·</span>
                <span>{formatIDR(data.price_per_sqm)}/m²</span>
              </div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-muted/10 rounded-xl p-2">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid className="stroke-border/30" />
                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: number) => [`${Math.round(v)}%`, 'Score']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Factor Breakdown Cards */}
          <div className="space-y-3">
            {factors.map(f => {
              const pct = (f.score / f.max) * 100;
              return (
                <div key={f.key} className="bg-muted/10 rounded-lg p-3 border border-border/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-primary/10">
                        <f.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-foreground">{f.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{f.score}</span>
                      <span className="text-[10px] text-muted-foreground">/{f.max}</span>
                    </div>
                  </div>
                  <Progress value={pct} className="h-1.5 mb-2" />
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
                    {f.details.map(d => (
                      <div key={d.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{d.label}</span>
                        <span className={`font-medium ${
                          d.trend === 'good' ? 'text-emerald-500' :
                          d.trend === 'bad' ? 'text-destructive' :
                          'text-foreground'
                        }`}>
                          {d.trend === 'good' && <ArrowUpRight className="w-3 h-3 inline mr-0.5" />}
                          {d.trend === 'bad' && <ArrowDownRight className="w-3 h-3 inline mr-0.5" />}
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[9px] text-muted-foreground text-center">
            Score based on {b.price_fairness.comparables_count} comparables · Generated {new Date(data.generated_at).toLocaleDateString('id-ID')}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InvestmentScoreV2Panel;
