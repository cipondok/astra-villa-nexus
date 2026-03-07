import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Minus, MapPin, BarChart3, Clock, Sparkles,
  Flame, Building2, ChevronDown, ArrowUpRight, ArrowDownRight, Activity,
  Layers, Target, Zap, PieChartIcon,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMarketTrendsAnalyzer, TimeRange, HotZone } from '@/hooks/useMarketTrendsAnalyzer';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

const CITIES = ['', 'Jakarta', 'Bali', 'Bandung', 'Surabaya', 'Yogyakarta', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Semarang', 'Makassar', 'Medan', 'Lombok', 'Denpasar'];
const PROPERTY_TYPES = ['', 'villa', 'apartment', 'house', 'land', 'commercial', 'warehouse', 'kost'];
const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '1m', label: '1M' },
  { value: '3m', label: '3M' },
  { value: '6m', label: '6M' },
  { value: '12m', label: '1Y' },
];

const formatIDR = (v: number) => {
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}M`;
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(0)}Jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
};

const HEAT_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  hot: { color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', icon: Flame },
  warm: { color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/20', icon: Zap },
  moderate: { color: 'text-primary', bg: 'bg-primary/10 border-primary/20', icon: Activity },
  cool: { color: 'text-muted-foreground', bg: 'bg-muted/30 border-border/40', icon: Minus },
};

const TREND_ICON = { rising: TrendingUp, declining: TrendingDown, stable: Minus, insufficient_data: Minus };
const TREND_COLOR = { rising: 'text-green-600', declining: 'text-red-500', stable: 'text-gold-primary', insufficient_data: 'text-muted-foreground' };

const TYPE_COLORS: Record<string, string> = {
  villa: 'hsl(var(--chart-3))',
  apartment: 'hsl(var(--chart-1))',
  house: 'hsl(var(--primary))',
  land: 'hsl(var(--chart-5))',
  commercial: 'hsl(var(--chart-2))',
  warehouse: 'hsl(var(--gold-primary))',
  kost: 'hsl(var(--chart-4))',
  townhouse: 'hsl(var(--accent-foreground))',
};

export default function MarketTrendsPage() {
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('6m');

  const { data, isLoading } = useMarketTrendsAnalyzer({ city, property_type: propertyType, time_range: timeRange });

  // Property type breakdown query
  const { data: typeBreakdown } = useQuery({
    queryKey: ['market-trends-type-breakdown', city],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('property_type')
        .eq('status', 'active')
        .eq('approval_status', 'approved');
      if (city) query = query.eq('city', city);
      const { data: rows, error } = await query;
      if (error) throw error;
      const counts: Record<string, number> = {};
      (rows || []).forEach((r: any) => {
        const t = r.property_type || 'other';
        counts[t] = (counts[t] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
    },
  });

  const TrendIcon = data ? TREND_ICON[data.trend_direction] : Minus;
  const trendColor = data ? TREND_COLOR[data.trend_direction] : '';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold-primary/5" />
        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-10 relative">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gold-primary/10 border border-gold-primary/20">
                <TrendingUp className="h-5 w-5 text-gold-primary" />
              </div>
              <Badge variant="outline" className="border-gold-primary/30 text-gold-primary text-xs">AI Analytics</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Market Trends</h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Real-time property market analysis with price trends, hot zones, and demand forecasting.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border/50 bg-card p-4 flex flex-wrap items-center gap-3"
        >
          {/* City */}
          <div className="relative min-w-[140px]">
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8"
            >
              <option value="">All Cities</option>
              {CITIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Property Type */}
          <div className="relative min-w-[130px]">
            <select
              value={propertyType}
              onChange={e => setPropertyType(e.target.value)}
              className="w-full appearance-none rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8 capitalize"
            >
              <option value="">All Types</option>
              {PROPERTY_TYPES.filter(Boolean).map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Time Range Toggle */}
          <div className="flex rounded-xl border border-border/50 bg-muted/20 p-0.5 ml-auto">
            {TIME_RANGES.map(tr => (
              <button
                key={tr.value}
                onClick={() => setTimeRange(tr.value)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  timeRange === tr.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tr.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-48 rounded-2xl" />
          </div>
        )}

        {data && !isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KPICard
                icon={BarChart3}
                label="Average Price"
                value={formatIDR(data.avg_price)}
                sub={`Median: ${formatIDR(data.median_price)}`}
              />
              <KPICard
                icon={TrendIcon}
                label="Price Change"
                value={`${data.price_change_pct > 0 ? '+' : ''}${data.price_change_pct}%`}
                sub={data.trend_direction.replace('_', ' ')}
                valueClass={trendColor}
              />
              <KPICard
                icon={Clock}
                label="Avg Days on Market"
                value={`${data.avg_days_on_market}`}
                sub="days average"
              />
              <KPICard
                icon={Building2}
                label="Total Listings"
                value={data.total_listings.toLocaleString()}
                sub={`${data.new_listings_in_period} new in period`}
              />
            </div>

            {/* Forecast Banner */}
            {data.forecast_next_quarter && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3"
              >
                <div className="p-2 rounded-xl bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">Next Quarter Forecast</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Predicted avg price: <span className="font-semibold text-foreground">{formatIDR(data.forecast_next_quarter.predicted_avg_price)}</span>
                    {' '}({data.forecast_next_quarter.predicted_change_pct > 0 ? '+' : ''}{data.forecast_next_quarter.predicted_change_pct}%)
                    {' '}• Demand: <span className="capitalize">{data.forecast_next_quarter.predicted_demand}</span>
                  </p>
                </div>
                <Badge variant="outline" className={cn(
                  'text-[10px] shrink-0',
                  data.forecast_next_quarter.confidence === 'high' ? 'border-green-500/30 text-green-600'
                    : data.forecast_next_quarter.confidence === 'medium' ? 'border-gold-primary/30 text-gold-primary'
                    : 'border-border text-muted-foreground'
                )}>
                  {data.forecast_next_quarter.confidence} confidence
                </Badge>
              </motion.div>
            )}

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Price Distribution */}
              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Price Distribution
                </h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.price_distribution}>
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {data.price_distribution.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? 'hsl(var(--muted-foreground))' : i < 3 ? 'hsl(var(--primary))' : 'hsl(var(--gold-primary))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Listing Supply Pie */}
              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Supply Overview
                </h3>
                <div className="flex items-center gap-6">
                  <div className="h-44 w-44 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'New', value: data.new_listings_in_period },
                            { name: 'Existing', value: Math.max(0, data.total_listings - data.new_listings_in_period) },
                          ]}
                          cx="50%" cy="50%"
                          innerRadius={45} outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          <Cell fill="hsl(var(--primary))" />
                          <Cell fill="hsl(var(--muted-foreground) / 0.3)" />
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{data.new_listings_in_period}</p>
                      <p className="text-xs text-muted-foreground">New listings this period</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{data.total_listings}</p>
                      <p className="text-xs text-muted-foreground">Total active listings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hot Zones */}
            {data.hot_zones.length > 0 && (
              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Flame className="h-4 w-4 text-red-500" /> Hot Zones
                  <Badge variant="secondary" className="text-[10px] h-5">{data.hot_zones.length}</Badge>
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {data.hot_zones.map((zone, i) => (
                    <HotZoneCard key={zone.zone} zone={zone} rank={i + 1} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function KPICard({ icon: Icon, label, value, sub, valueClass }: {
  icon: React.ElementType; label: string; value: string; sub: string; valueClass?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/40 bg-card p-4 space-y-1.5"
    >
      <div className="flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
      <p className={cn('text-lg font-bold', valueClass || 'text-foreground')}>{value}</p>
      <p className="text-[10px] text-muted-foreground capitalize">{sub}</p>
    </motion.div>
  );
}

function HotZoneCard({ zone, rank }: { zone: HotZone; rank: number }) {
  const config = HEAT_CONFIG[zone.heat_level] || HEAT_CONFIG.cool;
  const HeatIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { delay: rank * 0.04 } }}
      className="rounded-xl border border-border/40 bg-muted/10 p-3.5 space-y-2.5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded-lg border', config.bg)}>
            <HeatIcon className={cn('h-3.5 w-3.5', config.color)} />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{zone.zone}</p>
            <p className="text-[10px] text-muted-foreground">{zone.listing_count} listings</p>
          </div>
        </div>
        <Badge variant="outline" className={cn('text-[10px] capitalize border', config.bg, config.color)}>
          {zone.heat_level}
        </Badge>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[10px] text-muted-foreground">Demand</p>
          <p className="text-xs font-bold text-foreground">{zone.avg_demand_heat}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Invest.</p>
          <p className="text-xs font-bold text-foreground">{zone.avg_investment_score}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground">Avg Price</p>
          <p className="text-xs font-bold text-foreground">{formatIDR(zone.avg_price)}</p>
        </div>
      </div>
    </motion.div>
  );
}
