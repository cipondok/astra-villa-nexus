import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Activity, TrendingUp, AlertTriangle, BarChart3, Flame, MapPin,
  Zap, ArrowUpRight, ArrowDownRight, Sparkles, Eye, DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ----------------------------------------------------------------
   Static data — city positions on a simplified Indonesia SVG grid
   ---------------------------------------------------------------- */
const CITY_POSITIONS: Record<string, { x: number; y: number }> = {
  'Jakarta': { x: 28, y: 52 },
  'Bandung': { x: 31, y: 55 },
  'Surabaya': { x: 38, y: 54 },
  'Bali': { x: 42, y: 60 },
  'Yogyakarta': { x: 34, y: 56 },
  'Semarang': { x: 34, y: 52 },
  'Medan': { x: 16, y: 28 },
  'Makassar': { x: 50, y: 58 },
  'Bogor': { x: 29, y: 54 },
  'Tangerang': { x: 27, y: 51 },
  'Bekasi': { x: 29, y: 51 },
  'Depok': { x: 28, y: 53 },
  'Lombok': { x: 44, y: 60 },
  'Balikpapan': { x: 46, y: 46 },
  'Palembang': { x: 22, y: 44 },
  'Malang': { x: 39, y: 56 },
  'Batam': { x: 20, y: 34 },
  'Cirebon': { x: 32, y: 53 },
  'Solo': { x: 35, y: 55 },
  'Manado': { x: 54, y: 36 },
};

const PROPERTY_TYPES = ['All', 'Villa', 'Apartment', 'House', 'Land', 'Commercial'];

const AI_NARRATIVES = [
  'Bandung north corridor showing rising weekend rental demand from Jakarta investors.',
  'Bali Canggu zone signals 12% yield compression — early movers capturing premium.',
  'Jakarta BSD City cluster emerging as top relocation target with 23% price growth QoQ.',
  'Surabaya east industrial zone attracting institutional capital inflow signals.',
  'Yogyakarta student housing demand spiking — 8.2% rental yield above national average.',
];

interface CityData {
  city: string;
  count: number;
  avgScore: number;
  avgPrice: number;
  avgDemand: number;
}

export default function MarketIntelligenceHeatmap() {
  const [selectedType, setSelectedType] = useState('All');
  const [yieldFocus, setYieldFocus] = useState(false);
  const [appreciationFocus, setAppreciationFocus] = useState(false);
  const [budgetRange, setBudgetRange] = useState([0, 20]);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [narrativeIdx] = useState(() => Math.floor(Math.random() * AI_NARRATIVES.length));

  const { data: cityData = [], isLoading } = useQuery({
    queryKey: ['heatmap-city-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('city, price, opportunity_score, demand_score')
        .eq('status', 'active')
        .not('city', 'is', null)
        .not('price', 'is', null)
        .gt('price', 0);

      if (error) throw error;

      const map: Record<string, { prices: number[]; scores: number[]; demands: number[] }> = {};
      for (const p of data || []) {
        const c = p.city!;
        if (!map[c]) map[c] = { prices: [], scores: [], demands: [] };
        map[c].prices.push(p.price!);
        map[c].scores.push(p.opportunity_score ?? 50);
        map[c].demands.push(p.demand_score ?? 50);
      }

      return Object.entries(map)
        .map(([city, d]) => ({
          city,
          count: d.prices.length,
          avgScore: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
          avgPrice: Math.round(d.prices.reduce((a, b) => a + b, 0) / d.prices.length),
          avgDemand: Math.round(d.demands.reduce((a, b) => a + b, 0) / d.demands.length),
        }))
        .filter(c => c.count >= 1)
        .sort((a, b) => b.avgScore - a.avgScore);
    },
    staleTime: 5 * 60 * 1000,
  });

  const maxScore = useMemo(() => Math.max(...cityData.map(c => c.avgScore), 1), [cityData]);

  const getHeatColor = (score: number): string => {
    const ratio = score / maxScore;
    if (ratio >= 0.7) return 'text-chart-1'; // green — high opportunity
    if (ratio >= 0.4) return 'text-chart-4'; // orange — emerging
    return 'text-destructive'; // red — saturated
  };

  const getGlowClass = (score: number): string => {
    const ratio = score / maxScore;
    if (ratio >= 0.7) return 'shadow-[0_0_20px_hsl(var(--chart-1)/0.5)]';
    if (ratio >= 0.4) return 'shadow-[0_0_16px_hsl(var(--chart-4)/0.4)]';
    return 'shadow-[0_0_12px_hsl(var(--destructive)/0.3)]';
  };

  const getBgGlow = (score: number): string => {
    const ratio = score / maxScore;
    if (ratio >= 0.7) return 'bg-chart-1/20';
    if (ratio >= 0.4) return 'bg-chart-4/15';
    return 'bg-destructive/10';
  };

  const topGrowth = cityData.slice(0, 6);
  const risingDemand = [...cityData].sort((a, b) => b.avgDemand - a.avgDemand).slice(0, 4);
  const priceInefficiency = [...cityData]
    .filter(c => c.avgScore >= 60 && c.avgPrice < (cityData[0]?.avgPrice ?? 1e12) * 0.6)
    .slice(0, 4);

  const hoveredData = cityData.find(c => c.city === hoveredCity);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.04] via-transparent to-chart-1/[0.03] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="outline" className="mb-4 px-3 py-1 text-[10px] border-primary/20 text-primary bg-primary/5">
              <Activity className="w-3 h-3 mr-1" />Real-Time Intelligence
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              AI Market Opportunity
              <span className="block text-primary">Heatmap</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl text-base">
              Real-time intelligence showing investor demand and growth potential by location.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center gap-4">
          {/* Property type chips */}
          <div className="flex flex-wrap gap-1.5">
            {PROPERTY_TYPES.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  selectedType === t
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-border hidden sm:block" />

          {/* Toggles */}
          <button
            onClick={() => setYieldFocus(!yieldFocus)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              yieldFocus ? 'bg-chart-1/15 text-chart-1' : 'bg-secondary text-muted-foreground'
            )}
          >
            <DollarSign className="w-3 h-3" />Yield Focus
          </button>
          <button
            onClick={() => setAppreciationFocus(!appreciationFocus)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              appreciationFocus ? 'bg-chart-4/15 text-chart-4' : 'bg-secondary text-muted-foreground'
            )}
          >
            <TrendingUp className="w-3 h-3" />Appreciation
          </button>

          <div className="h-5 w-px bg-border hidden sm:block" />

          {/* Budget slider */}
          <div className="flex items-center gap-3 min-w-[180px]">
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">Budget</span>
            <Slider
              value={budgetRange}
              onValueChange={setBudgetRange}
              min={0}
              max={20}
              step={1}
              className="flex-1"
            />
            <span className="text-[10px] text-muted-foreground whitespace-nowrap font-mono">
              {budgetRange[0]}B-{budgetRange[1]}B
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* Map area */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 relative min-h-[480px] overflow-hidden"
          >
            <div className="absolute top-4 left-4 z-10">
              <h3 className="text-sm font-semibold text-foreground mb-1">Indonesia Heat Zones</h3>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-chart-1" />High Opportunity</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-chart-4" />Emerging</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" />Saturated</span>
              </div>
            </div>

            {/* Simplified Indonesia silhouette background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
              <svg viewBox="0 0 100 80" className="w-full h-full max-w-[700px]">
                <path d="M10,30 Q15,25 20,28 L25,35 Q28,40 25,45 L20,48 Q18,50 22,52 L30,55 Q35,58 40,56 L45,58 Q48,62 44,64 L38,62 Q30,60 25,58 L18,55 Q12,50 10,45 Z" fill="hsl(var(--foreground))" />
                <path d="M30,50 Q33,48 36,50 L40,52 Q42,54 40,56 L36,58 Q32,56 30,54 Z" fill="hsl(var(--foreground))" />
                <path d="M38,52 Q42,50 46,52 L50,55 Q52,58 48,60 L44,58 Q40,56 38,54 Z" fill="hsl(var(--foreground))" />
                <path d="M42,44 Q48,40 54,42 L56,46 Q54,50 50,52 L46,50 Q42,48 42,46 Z" fill="hsl(var(--foreground))" />
                <path d="M52,34 Q56,32 58,36 L56,40 Q54,42 52,40 Z" fill="hsl(var(--foreground))" />
              </svg>
            </div>

            {/* City heat nodes */}
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground text-sm">Loading intelligence data…</div>
              </div>
            ) : (
              <TooltipProvider delayDuration={0}>
                <div className="relative w-full h-full min-h-[420px]">
                  {cityData.map((cd) => {
                    const pos = CITY_POSITIONS[cd.city];
                    if (!pos) return null;
                    const size = Math.max(20, Math.min(48, (cd.count / Math.max(...cityData.map(c => c.count))) * 48 + 16));

                    return (
                      <Tooltip key={cd.city}>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: Math.random() * 0.4 + 0.15 }}
                            className={cn(
                              'absolute rounded-full flex items-center justify-center cursor-pointer transition-all',
                              getBgGlow(cd.avgScore),
                              getGlowClass(cd.avgScore),
                              hoveredCity === cd.city && 'ring-2 ring-primary/40 scale-110'
                            )}
                            style={{
                              left: `${pos.x}%`,
                              top: `${pos.y}%`,
                              width: size,
                              height: size,
                              transform: 'translate(-50%, -50%)',
                            }}
                            onMouseEnter={() => setHoveredCity(cd.city)}
                            onMouseLeave={() => setHoveredCity(null)}
                          >
                            <span className={cn('text-[8px] font-bold', getHeatColor(cd.avgScore))}>
                              {cd.avgScore}
                            </span>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-popover text-popover-foreground border-border p-3 max-w-[200px]">
                          <div className="font-semibold text-sm mb-2 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-primary" />{cd.city}
                          </div>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Opportunity Score</span>
                              <span className="font-semibold">{cd.avgScore}/100</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Yield Trend</span>
                              <span className={cn('font-semibold', cd.avgScore >= 60 ? 'text-chart-1' : 'text-destructive')}>
                                {cd.avgScore >= 60 ? '↑' : '↓'} {(cd.avgScore / 15).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Investor Interest</span>
                              <span className="font-semibold">{cd.avgDemand >= 70 ? 'High' : cd.avgDemand >= 45 ? 'Medium' : 'Low'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Listings</span>
                              <span className="font-mono">{cd.count}</span>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}

                  {/* City labels for visible cities */}
                  {cityData.slice(0, 10).map((cd) => {
                    const pos = CITY_POSITIONS[cd.city];
                    if (!pos) return null;
                    return (
                      <div
                        key={`label-${cd.city}`}
                        className="absolute text-[9px] font-medium text-muted-foreground pointer-events-none"
                        style={{ left: `${pos.x}%`, top: `${pos.y + 4}%`, transform: 'translateX(-50%)' }}
                      >
                        {cd.city}
                      </div>
                    );
                  })}
                </div>
              </TooltipProvider>
            )}
          </motion.div>

          {/* Right analytics panel */}
          <div className="space-y-5">
            {/* Top Growth Cities */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <Flame className="w-4 h-4 text-primary" />Top Growth Cities
              </h3>
              <div className="space-y-2.5">
                {topGrowth.map((c, i) => (
                  <div key={c.city} className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{c.city}</div>
                      <div className="h-1.5 bg-secondary rounded-full mt-1 overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(c.avgScore / maxScore) * 100}%` }}
                          transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                        />
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 shrink-0">
                      {c.avgScore}
                    </Badge>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Rising Demand Alerts */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <Zap className="w-4 h-4 text-chart-4" />Rising Demand Alerts
              </h3>
              <div className="space-y-2">
                {risingDemand.map(c => (
                  <div key={c.city} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="w-3.5 h-3.5 text-chart-1" />
                      <span className="text-xs text-foreground">{c.city}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-chart-1">+{c.avgDemand}%</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Price Inefficiency Signals */}
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded-xl p-5"
            >
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-chart-4" />Price Inefficiency Signals
              </h3>
              {priceInefficiency.length === 0 ? (
                <p className="text-xs text-muted-foreground">No significant price gaps detected.</p>
              ) : (
                <div className="space-y-2">
                  {priceInefficiency.map(c => (
                    <div key={c.city} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs text-foreground">{c.city}</span>
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Rp {(c.avgPrice / 1e9).toFixed(1)}B avg
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* AI Insight Strip */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8 bg-primary/5 border border-primary/10 rounded-xl p-5 flex items-start gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-1">AI Market Insight</div>
            <p className="text-sm text-foreground/90 leading-relaxed">{AI_NARRATIVES[narrativeIdx]}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
