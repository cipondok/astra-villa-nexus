import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useInvestorFeed, FeedCategory, RiskFilter } from '@/hooks/useInvestorFeed';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { SEOHead } from '@/components/SEOHead';
import FeedStrategySelector from '@/components/investor/FeedStrategySelector';
import {
  TrendingUp, Flame, Shield, DollarSign, Building2, MapPin,
  Loader2, ChevronRight, Sparkles, BarChart3, Home, Zap,
  ArrowUpDown, ChevronLeft, ChevronRight as ChevronRightIcon,
} from 'lucide-react';

const CATEGORIES: { value: FeedCategory | 'all'; label: string; icon: any; desc: string }[] = [
  { value: 'all', label: 'All Deals', icon: Sparkles, desc: 'AI-ranked opportunities' },
  { value: 'best_rental_yield', label: 'Best Rental Yield', icon: DollarSign, desc: 'Highest passive income' },
  { value: 'fast_appreciation', label: 'Fast Appreciation', icon: TrendingUp, desc: 'Growth zone properties' },
  { value: 'luxury_flip', label: 'Luxury Flip', icon: Zap, desc: 'Undervalued premium assets' },
  { value: 'passive_income', label: 'Low Risk Income', icon: Shield, desc: 'Stable long-term returns' },
];

const RISK_OPTIONS: { value: RiskFilter; label: string }[] = [
  { value: 'all', label: 'All Risk' },
  { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High Risk' },
];

const DEAL_TAG_CONFIG: Record<string, { label: string; className: string }> = {
  hot_deal: { label: '🔥 Hot Deal', className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  good_deal: { label: '✅ Good Deal', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  fair: { label: '📊 Fair', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  overpriced: { label: '⚠️ Overpriced', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
};

const formatPrice = (price: number) => {
  if (price >= 1e12) return `Rp ${(price / 1e12).toFixed(1)}T`;
  if (price >= 1e9) return `Rp ${(price / 1e9).toFixed(1)}M`;
  if (price >= 1e6) return `Rp ${(price / 1e6).toFixed(0)}jt`;
  return `Rp ${price.toLocaleString('id-ID')}`;
};

export default function InvestorFeedPage() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<FeedCategory | 'all'>('all');
  const [risk, setRisk] = useState<RiskFilter>('all');
  const [city, setCity] = useState('');
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 50_000_000_000]);
  const [page, setPage] = useState(1);

  const filters = useMemo(() => ({
    category: category === 'all' ? undefined : category,
    risk,
    city: city || undefined,
    minBudget: budgetRange[0] > 0 ? budgetRange[0] : undefined,
    maxBudget: budgetRange[1] < 50_000_000_000 ? budgetRange[1] : undefined,
    page,
    pageSize: 12,
  }), [category, risk, city, budgetRange, page]);

  const { data, isLoading, isFetching } = useInvestorFeed(filters);

  return (
    <>
      <SEOHead
        title="AI Investor Feed — ASTRA Villa"
        description="AI-powered investment opportunities: rental yield, appreciation zones, luxury flips, and passive income properties."
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AI Investor Feed</h1>
                <p className="text-sm text-muted-foreground">Personalized investment opportunities ranked by AI</p>
              </div>
            </div>
          </div>

          {/* Strategy Selector */}
          <FeedStrategySelector />

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setCategory(cat.value); setPage(1); }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all ${
                  category === cat.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                }`}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <Select value={risk} onValueChange={(v) => { setRisk(v as RiskFilter); setPage(1); }}>
              <SelectTrigger className="h-10">
                <Shield className="h-4 w-4 text-muted-foreground mr-2" />
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                {RISK_OPTIONS.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Filter by city..."
              value={city}
              onChange={(e) => { setCity(e.target.value); setPage(1); }}
              className="h-10"
            />

            <div className="md:col-span-2 space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                <span>Budget: {formatPrice(budgetRange[0])}</span>
                <span>{budgetRange[1] >= 50_000_000_000 ? 'Max' : formatPrice(budgetRange[1])}</span>
              </div>
              <Slider
                value={budgetRange}
                min={0}
                max={50_000_000_000}
                step={500_000_000}
                onValueChange={(v) => { setBudgetRange(v as [number, number]); setPage(1); }}
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {data ? `${data.total} opportunities found` : 'Loading...'}
              {isFetching && !isLoading && <Loader2 className="inline h-3 w-3 ml-2 animate-spin" />}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm text-muted-foreground">Analyzing investment opportunities...</p>
            </div>
          )}

          {/* Feed Grid */}
          {!isLoading && data && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                  {data.items.map((item, idx) => (
                    <FeedCard key={item.id} item={item} index={idx} onClick={() => navigate(`/property/${item.property_id}`)} />
                  ))}
                </AnimatePresence>
              </div>

              {data.items.length === 0 && (
                <div className="text-center py-16">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium">No deals found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or run the deal analysis engine</p>
                </div>
              )}

              {/* Pagination */}
              {data.total > data.pageSize && (
                <div className="flex items-center justify-center gap-3 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {Math.ceil(data.total / data.pageSize)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!data.hasMore}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next <ChevronRightIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function FeedCard({ item, index, onClick }: { item: any; index: number; onClick: () => void }) {
  const tagConfig = DEAL_TAG_CONFIG[item.deal_tag] || DEAL_TAG_CONFIG.fair;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      layout
    >
      <Card
        className="overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 cursor-pointer group"
        onClick={onClick}
      >
        {/* Image */}
        <div className="relative h-44 overflow-hidden">
          {item.thumbnail_url ? (
            <img
              src={item.thumbnail_url}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
          )}

          {/* Deal Tag */}
          <div className="absolute top-3 left-3">
            <Badge className={`${tagConfig.className} border text-xs font-semibold`}>
              {tagConfig.label}
            </Badge>
          </div>

          {/* Deal Score */}
          <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm rounded-full px-2.5 py-1 text-xs font-bold text-primary border border-primary/30">
            {item.deal_score}/100
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
            <p className="text-white font-bold text-lg">{formatPrice(item.price)}</p>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground text-sm line-clamp-1">{item.title}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3" /> {item.city || item.state}
              {item.property_type && <span className="capitalize">• {item.property_type}</span>}
            </p>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <MetricPill icon={TrendingUp} label="Underval" value={`${item.undervaluation_percent > 0 ? '+' : ''}${Number(item.undervaluation_percent).toFixed(1)}%`} positive={item.undervaluation_percent > 0} />
            <MetricPill icon={DollarSign} label="Yield" value={`${Number(item.rental_yield_estimate).toFixed(1)}%`} positive={item.rental_yield_estimate >= 5} />
            <MetricPill icon={BarChart3} label="Growth" value={`${item.location_growth_score}`} positive={item.location_growth_score >= 60} />
          </div>

          {/* AI Reason */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
            <Sparkles className="h-3 w-3 text-primary shrink-0" />
            <span>{item.rank_reason}</span>
          </div>

          <Button size="sm" variant="ghost" className="w-full text-xs text-primary hover:text-primary">
            View Investment Details <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MetricPill({ icon: Icon, label, value, positive }: { icon: any; label: string; value: string; positive: boolean }) {
  return (
    <div className="bg-muted/50 rounded-lg p-2 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className={`text-xs font-bold ${positive ? 'text-emerald-400' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
