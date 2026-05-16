import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  TrendingUp, DollarSign, Building2, MapPin, ChevronDown,
  BarChart3, ArrowUpRight, ArrowDownRight, Minus, Percent,
  Home, Search, SlidersHorizontal, Sparkles, Award,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, CartesianGrid, ZAxis,
} from 'recharts';

const CITIES = ['', 'Jakarta', 'Bali', 'Bandung', 'Surabaya', 'Yogyakarta', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Semarang', 'Makassar', 'Medan', 'Lombok', 'Denpasar'];
const PROPERTY_TYPES = ['', 'villa', 'apartment', 'house', 'land', 'commercial', 'warehouse', 'kost'];

// Rental yield estimates by property type and city tier
const BASE_YIELDS: Record<string, number> = {
  kost: 8.5, apartment: 6.2, villa: 5.5, house: 4.8,
  commercial: 7.0, warehouse: 6.5, land: 0, townhouse: 5.0,
};
const CITY_PREMIUM: Record<string, number> = {
  Jakarta: 1.1, Bali: 1.25, Bandung: 0.95, Surabaya: 1.0,
  Yogyakarta: 0.9, Denpasar: 1.2, Lombok: 1.15, Tangerang: 0.92,
  Bekasi: 0.88, Depok: 0.85, Bogor: 0.87, Semarang: 0.9,
  Makassar: 0.88, Medan: 0.85,
};
const EXPENSE_RATIO = 0.25; // 25% of gross rent goes to expenses

const formatIDR = (v: number) => {
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(1)}M`;
  return `Rp ${v.toLocaleString('id-ID')}`;
};

interface PropertyRow {
  id: string;
  title: string;
  price: number;
  city: string | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  images: string[] | null;
}

interface RankedProperty extends PropertyRow {
  grossYieldPct: number;
  netYieldPct: number;
  estimatedMonthlyRent: number;
  netAnnualIncome: number;
  grade: 'A' | 'B' | 'C' | 'D';
}

function computeYield(p: PropertyRow): RankedProperty {
  const type = p.property_type?.toLowerCase() || 'house';
  const baseYield = BASE_YIELDS[type] ?? 4.5;
  const cityMult = CITY_PREMIUM[p.city || ''] ?? 0.9;
  const grossYieldPct = Math.round(baseYield * cityMult * 100) / 100;
  const estimatedMonthlyRent = Math.round((p.price * (grossYieldPct / 100)) / 12);
  const netYieldPct = Math.round(grossYieldPct * (1 - EXPENSE_RATIO) * 100) / 100;
  const netAnnualIncome = Math.round(estimatedMonthlyRent * 12 * (1 - EXPENSE_RATIO));
  const grade: RankedProperty['grade'] =
    netYieldPct >= 6 ? 'A' : netYieldPct >= 4.5 ? 'B' : netYieldPct >= 3 ? 'C' : 'D';
  return { ...p, grossYieldPct, netYieldPct, estimatedMonthlyRent, netAnnualIncome, grade };
}

const GRADE_CONFIG = {
  A: { color: 'text-green-600', bg: 'bg-green-500/10 border-green-500/20' },
  B: { color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  C: { color: 'text-gold-primary', bg: 'bg-gold-primary/10 border-gold-primary/20' },
  D: { color: 'text-muted-foreground', bg: 'bg-muted/30 border-border/40' },
};

export default function RentalYieldOptimizerPage() {
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [budgetRange, setBudgetRange] = useState([0, 50_000_000_000]);
  const [sortBy, setSortBy] = useState<'netYieldPct' | 'netAnnualIncome' | 'estimatedMonthlyRent'>('netYieldPct');

  const { data: properties, isLoading } = useQuery({
    queryKey: ['rental-yield-optimizer-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, price, city, property_type, bedrooms, bathrooms, area_sqm, images')
        .eq('status', 'active')
        .eq('approval_status', 'approved')
        .gt('price', 0)
        .limit(500);
      if (error) throw error;
      return (data || []) as PropertyRow[];
    },
  });

  const ranked = useMemo(() => {
    if (!properties) return [];
    return properties
      .filter(p => {
        if (city && p.city !== city) return false;
        if (propertyType && p.property_type !== propertyType) return false;
        if (p.price < budgetRange[0] || p.price > budgetRange[1]) return false;
        if ((p.property_type || '').toLowerCase() === 'land') return false;
        return true;
      })
      .map(computeYield)
      .sort((a, b) => b[sortBy] - a[sortBy]);
  }, [properties, city, propertyType, budgetRange, sortBy]);

  const topYield = ranked[0]?.netYieldPct ?? 0;
  const avgYield = ranked.length > 0 ? ranked.reduce((s, r) => s + r.netYieldPct, 0) / ranked.length : 0;
  const totalAnnualIncome = ranked.reduce((s, r) => s + r.netAnnualIncome, 0);

  // Chart: yield distribution
  const yieldDistribution = useMemo(() => {
    const buckets = [
      { label: '<3%', min: 0, max: 3 },
      { label: '3-4%', min: 3, max: 4 },
      { label: '4-5%', min: 4, max: 5 },
      { label: '5-6%', min: 5, max: 6 },
      { label: '6-8%', min: 6, max: 8 },
      { label: '8%+', min: 8, max: 100 },
    ];
    return buckets.map(b => ({
      range: b.label,
      count: ranked.filter(r => r.netYieldPct >= b.min && r.netYieldPct < b.max).length,
    }));
  }, [ranked]);

  // Scatter data: price vs yield
  const scatterData = useMemo(() =>
    ranked.slice(0, 50).map(r => ({
      x: r.price,
      y: r.netYieldPct,
      z: r.netAnnualIncome,
      name: r.title,
    })),
  [ranked]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold-primary/5" />
        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-10 relative">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gold-primary/10 border border-gold-primary/20">
                <Percent className="h-5 w-5 text-gold-primary" />
              </div>
              <Badge variant="outline" className="border-gold-primary/30 text-gold-primary text-xs">AI Investment</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Rental Yield Optimizer</h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              Discover top-yielding properties ranked by rental return. Filter by city and budget to find the best investment opportunities.
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
          className="rounded-2xl border border-border/50 bg-card p-4 space-y-4"
        >
          <div className="flex flex-wrap items-center gap-3">
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

            <div className="relative min-w-[130px]">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full appearance-none rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8"
              >
                <option value="netYieldPct">Net Yield %</option>
                <option value="netAnnualIncome">Annual Income</option>
                <option value="estimatedMonthlyRent">Monthly Rent</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Budget Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3" /> Budget Range
              </span>
              <span className="text-xs font-semibold text-foreground">
                {formatIDR(budgetRange[0])} — {formatIDR(budgetRange[1])}
              </span>
            </div>
            <Slider
              min={0}
              max={50_000_000_000}
              step={500_000_000}
              value={budgetRange}
              onValueChange={setBudgetRange}
              className="w-full"
            />
          </div>
        </motion.div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
            </div>
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        )}

        {!isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KPICard icon={Award} label="Top Net Yield" value={`${topYield.toFixed(1)}%`} sub="Best performer" valueClass="text-green-600" />
              <KPICard icon={Percent} label="Avg Net Yield" value={`${avgYield.toFixed(1)}%`} sub={`${ranked.length} properties`} />
              <KPICard icon={DollarSign} label="Best Monthly Rent" value={ranked[0] ? formatIDR(ranked[0].estimatedMonthlyRent) : '—'} sub="Highest estimate" />
              <KPICard icon={BarChart3} label="Total Annual Income" value={formatIDR(totalAnnualIncome)} sub="All ranked properties" />
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Yield Distribution */}
              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Yield Distribution
                </h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={yieldDistribution}>
                      <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
                        {yieldDistribution.map((entry, i) => (
                          <Cell key={i} fill={i >= 4 ? 'hsl(var(--chart-3))' : i >= 2 ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Price vs Yield Scatter */}
              <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold-primary" /> Price vs Net Yield
                </h3>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" dataKey="x" name="Price" tick={{ fontSize: 9 }} tickFormatter={v => `${(v / 1e9).toFixed(1)}B`} />
                      <YAxis type="number" dataKey="y" name="Net Yield %" tick={{ fontSize: 9 }} unit="%" />
                      <ZAxis type="number" dataKey="z" range={[40, 200]} />
                      <Tooltip
                        contentStyle={{ fontSize: 11, borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        formatter={(value: number, name: string) =>
                          name === 'Price' ? formatIDR(value) : name === 'Net Yield %' ? `${value.toFixed(1)}%` : formatIDR(value)
                        }
                      />
                      <Scatter data={scatterData} fill="hsl(var(--primary))" fillOpacity={0.7} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Ranked Properties */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Top Properties by Rental Yield
                  <Badge variant="secondary" className="text-[10px] h-5">{ranked.length}</Badge>
                </h3>
              </div>

              {ranked.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-10">No properties match your filters. Try adjusting the budget or city.</p>
              ) : (
                <div className="space-y-2.5">
                  {ranked.slice(0, 20).map((prop, idx) => (
                    <PropertyYieldCard key={prop.id} property={prop} rank={idx + 1} />
                  ))}
                  {ranked.length > 20 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      Showing top 20 of {ranked.length} properties
                    </p>
                  )}
                </div>
              )}
            </div>
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
      <p className="text-[10px] text-muted-foreground">{sub}</p>
    </motion.div>
  );
}

function PropertyYieldCard({ property, rank }: { property: RankedProperty; rank: number }) {
  const gc = GRADE_CONFIG[property.grade];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { delay: rank * 0.02 } }}
      className="rounded-xl border border-border/40 bg-muted/5 hover:bg-muted/10 transition-colors p-3.5 flex flex-col sm:flex-row gap-3"
    >
      {/* Rank + Image */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-xs font-bold text-primary">#{rank}</span>
        </div>
        {property.images?.[0] ? (
          <img src={property.images[0]} alt="" className="w-16 h-12 rounded-lg object-cover border border-border/30" />
        ) : (
          <div className="w-16 h-12 rounded-lg bg-muted/30 border border-border/30 flex items-center justify-center">
            <Home className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{property.title}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
              <MapPin className="h-3 w-3" />
              <span>{property.city || 'Unknown'}</span>
              <span>•</span>
              <span className="capitalize">{property.property_type || 'property'}</span>
              {property.bedrooms && <><span>•</span><span>{property.bedrooms} BR</span></>}
            </div>
          </div>
          <Badge variant="outline" className={cn('text-[10px] h-5 shrink-0 border', gc.bg, gc.color)}>
            Grade {property.grade}
          </Badge>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <MetricCell label="Property Price" value={formatIDR(property.price)} />
          <MetricCell label="Net Yield" value={`${property.netYieldPct.toFixed(1)}%`} highlight />
          <MetricCell label="Monthly Rent" value={formatIDR(property.estimatedMonthlyRent)} />
          <MetricCell label="Net Annual Income" value={formatIDR(property.netAnnualIncome)} />
        </div>
      </div>
    </motion.div>
  );
}

function MetricCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={cn('text-xs font-bold', highlight ? 'text-green-600' : 'text-foreground')}>{value}</p>
    </div>
  );
}
