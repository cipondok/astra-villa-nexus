import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, MapPin, Bed, Bath, Maximize, Star, Sparkles,
  Target, Home, BarChart3, Clock, Shield, Flame, ArrowRight,
  Building2, DollarSign, Loader2, ChevronDown, ChevronUp, Search,
} from 'lucide-react';
import { useInvestmentAdvisor, InvestmentGoal, InvestmentRecommendation } from '@/hooks/useInvestmentAdvisor';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';

const GOALS: { value: InvestmentGoal; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'rental', label: 'Rental Income', icon: Home, desc: 'Maximize monthly cash flow' },
  { value: 'flip', label: 'Flip & Sell', icon: TrendingUp, desc: 'Buy low, renovate, sell high' },
  { value: 'long_term', label: 'Long-Term Growth', icon: BarChart3, desc: 'Capital appreciation over years' },
];

const LOCATIONS = ['', 'Jakarta', 'Bali', 'Bandung', 'Surabaya', 'Yogyakarta', 'Tangerang', 'Bekasi', 'Depok', 'Bogor', 'Semarang', 'Makassar', 'Medan', 'Lombok'];

const formatIDR = (v: number) => {
  if (v >= 1_000_000_000) return `Rp ${(v / 1_000_000_000).toFixed(1)}M`;
  if (v >= 1_000_000) return `Rp ${(v / 1_000_000).toFixed(0)}Jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
};

const BUDGET_STEPS = [
  500_000_000, 1_000_000_000, 1_500_000_000, 2_000_000_000, 3_000_000_000,
  5_000_000_000, 7_500_000_000, 10_000_000_000, 15_000_000_000, 20_000_000_000,
  30_000_000_000, 50_000_000_000,
];

export default function InvestmentAdvisorPage() {
  const navigate = useNavigate();
  const { getAdvice, recommendations, result, isLoading, reset } = useInvestmentAdvisor();

  const [budgetIdx, setBudgetIdx] = useState(3); // 2B default
  const [location, setLocation] = useState('');
  const [goal, setGoal] = useState<InvestmentGoal>('long_term');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const budget = BUDGET_STEPS[budgetIdx] || 2_000_000_000;

  const handleAnalyze = () => {
    reset();
    getAdvice({ budget, preferred_location: location, investment_goal: goal, limit: 10 });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-border/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold-primary/5" />
        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12 relative">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-gold-primary/10 border border-gold-primary/20">
                <Sparkles className="h-5 w-5 text-gold-primary" />
              </div>
              <Badge variant="outline" className="border-gold-primary/30 text-gold-primary text-xs">AI-Powered</Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Investment Advisor
            </h1>
            <p className="text-sm text-muted-foreground max-w-lg">
              AI analyzes ROI, demand, price fairness, and liquidity to find the best property investments for your goals.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-6">
        <div className="grid lg:grid-cols-[380px_1fr] gap-6">
          {/* ── Left Panel: Controls ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-5"
          >
            {/* Budget Slider */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" /> Budget
                </label>
                <span className="text-lg font-bold text-primary">{formatIDR(budget)}</span>
              </div>
              <Slider
                value={[budgetIdx]}
                onValueChange={([v]) => setBudgetIdx(v)}
                min={0}
                max={BUDGET_STEPS.length - 1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Rp 500Jt</span>
                <span>Rp 50M</span>
              </div>
            </div>

            {/* Location */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Location
              </label>
              <div className="relative">
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 pr-8"
                >
                  <option value="">All Indonesia</option>
                  {LOCATIONS.filter(Boolean).map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Goal Selector */}
            <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-3">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" /> Investment Goal
              </label>
              <div className="space-y-2">
                {GOALS.map(g => (
                  <button
                    key={g.value}
                    onClick={() => setGoal(g.value)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                      goal === g.value
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border/40 bg-muted/20 hover:border-border'
                    )}
                  >
                    <div className={cn(
                      'p-2 rounded-lg',
                      goal === g.value ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    )}>
                      <g.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{g.label}</p>
                      <p className="text-[11px] text-muted-foreground">{g.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Analyze Button */}
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/20 text-sm gap-2"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Search className="h-4 w-4" /> Find Investments</>
              )}
            </Button>

            {result && (
              <p className="text-xs text-muted-foreground text-center">
                Scanned {result.candidates_scanned} properties • {recommendations.length} matches
              </p>
            )}
          </motion.div>

          {/* ── Right Panel: Results ── */}
          <div className="space-y-4">
            {!result && !isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-2xl border border-dashed border-border/50 bg-muted/10"
              >
                <div className="p-4 rounded-2xl bg-muted/30 mb-4">
                  <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Set your criteria and click Analyze</p>
                <p className="text-xs text-muted-foreground/60 mt-1">AI will rank the best investments for you</p>
              </motion.div>
            )}

            {isLoading && (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-32 rounded-2xl bg-muted/30 animate-pulse" />
                ))}
              </div>
            )}

            {result && recommendations.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-2xl border border-border/50 bg-card">
                <Building2 className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">No properties match your criteria</p>
                <p className="text-xs text-muted-foreground/60 mt-1">Try adjusting your budget or location</p>
              </div>
            )}

            {/* Summary Chart */}
            {recommendations.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/50 bg-card p-5"
              >
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Investment Rating Overview
                </h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recommendations.slice(0, 8).map(r => ({
                      name: r.title.length > 18 ? r.title.slice(0, 18) + '…' : r.title,
                      rating: r.investment_rating,
                      roi: r.roi,
                    }))}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                      <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                        formatter={(val: number, name: string) => [
                          name === 'roi' ? `${val.toFixed(1)}%` : val,
                          name === 'roi' ? 'ROI' : 'Rating',
                        ]}
                      />
                      <Bar dataKey="rating" radius={[6, 6, 0, 0]} maxBarSize={32}>
                        {recommendations.slice(0, 8).map((r, i) => (
                          <Cell
                            key={i}
                            fill={r.investment_rating >= 75 ? 'hsl(var(--primary))' : r.investment_rating >= 50 ? 'hsl(var(--gold-primary))' : 'hsl(var(--muted-foreground))'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {/* Property Cards */}
            <AnimatePresence>
              {recommendations.map((rec, idx) => (
                <PropertyCard
                  key={rec.property_id}
                  rec={rec}
                  rank={idx + 1}
                  isExpanded={expandedId === rec.property_id}
                  onToggle={() => setExpandedId(expandedId === rec.property_id ? null : rec.property_id)}
                  onView={() => navigate(`/properties/${rec.property_id}`)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertyCard({
  rec, rank, isExpanded, onToggle, onView,
}: {
  rec: InvestmentRecommendation;
  rank: number;
  isExpanded: boolean;
  onToggle: () => void;
  onView: () => void;
}) {
  const radarData = [
    { metric: 'ROI', value: Math.min(rec.roi * 5, 100) },
    { metric: 'Demand', value: rec.demand_heat_score },
    { metric: 'Invest.', value: rec.investment_score },
    { metric: 'Fairness', value: rec.price_fairness },
    { metric: 'Liquidity', value: rec.liquidity_score },
  ];

  const ratingColor = rec.investment_rating >= 75 ? 'text-green-500' : rec.investment_rating >= 50 ? 'text-gold-primary' : 'text-muted-foreground';
  const ratingBg = rec.investment_rating >= 75 ? 'bg-green-500/10 border-green-500/20' : rec.investment_rating >= 50 ? 'bg-gold-primary/10 border-gold-primary/20' : 'bg-muted/30 border-border/40';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.04 }}
      className="rounded-2xl border border-border/50 bg-card overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0">
          <img
            src={rec.thumbnail_url || '/placeholder.svg'}
            alt={rec.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-background/90 backdrop-blur-sm border border-border/30">
            <span className="text-xs font-bold text-foreground">#{rank}</span>
          </div>
          <div className={cn('absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-lg border backdrop-blur-sm', ratingBg)}>
            <Star className={cn('h-3 w-3', ratingColor)} />
            <span className={cn('text-xs font-bold', ratingColor)}>{rec.investment_rating}</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 p-4 space-y-2.5 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground line-clamp-1">{rec.title}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{[rec.district, rec.city].filter(Boolean).join(', ')}</span>
              </div>
            </div>
            <p className="text-sm font-bold text-primary whitespace-nowrap">{formatIDR(rec.price)}</p>
          </div>

          {/* Metrics Row */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            {rec.bedrooms && <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {rec.bedrooms} Bed</span>}
            {rec.bathrooms && <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {rec.bathrooms} Bath</span>}
            {rec.area_sqm > 0 && <span className="flex items-center gap-1"><Maximize className="h-3 w-3" /> {rec.area_sqm}m²</span>}
            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-green-500" /> ROI {rec.roi.toFixed(1)}%</span>
            <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-orange-500" /> Demand {rec.demand_heat_score}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> ~{rec.predicted_days_to_sell}d</span>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-[10px] h-5 border-primary/20 text-primary">
              Yield {rec.rental_yield.toFixed(1)}%
            </Badge>
            <Badge variant="outline" className="text-[10px] h-5 border-border/40">
              <Shield className="h-2.5 w-2.5 mr-0.5" /> Fairness {rec.price_fairness}
            </Badge>
            {rec.property_type && (
              <Badge variant="secondary" className="text-[10px] h-5 capitalize">
                {rec.property_type}
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button size="sm" variant="ghost" onClick={onToggle} className="text-xs h-7 gap-1 text-muted-foreground">
              {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {isExpanded ? 'Less' : 'AI Insight'}
            </Button>
            <Button size="sm" onClick={onView} className="text-xs h-7 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              View <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded: Radar + Explanation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/30 p-4 grid sm:grid-cols-[200px_1fr] gap-4 bg-muted/10">
              {/* Radar Chart */}
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              {/* AI Explanation */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-gold-primary" /> AI Analysis
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.explanation}</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <MetricMini label="Investment Score" value={rec.investment_score} />
                  <MetricMini label="Liquidity" value={rec.liquidity_score} />
                  <MetricMini label="Price Fairness" value={rec.price_fairness} />
                  <MetricMini label="Rental Yield" value={`${rec.rental_yield.toFixed(1)}%`} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MetricMini({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-background/60 border border-border/30 px-2.5 py-1.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
