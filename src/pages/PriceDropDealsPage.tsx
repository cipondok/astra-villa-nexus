import { useState, useMemo, lazy, Suspense } from 'react';
import { usePriceDropDeals, usePriceDropStats, ALERT_TIER_CONFIG, type AlertTier } from '@/hooks/usePriceDropAlerts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingDown, Flame, Target, AlertTriangle, Search, ArrowUpDown, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';


function formatPrice(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

const tierTabs = [
  { key: 'all', label: 'All Drops', icon: TrendingDown },
  { key: 'elite_deal', label: 'Elite Deals (10%+)', icon: Flame },
  { key: 'opportunity', label: 'Opportunity (5%+)', icon: Target },
  { key: 'minor', label: 'Minor (3%+)', icon: AlertTriangle },
] as const;

type SortKey = 'date' | 'drop' | 'score' | 'price';

export default function PriceDropDealsPage() {
  const { data: deals, isLoading } = usePriceDropDeals({ limit: 200 });
  const { stats } = usePriceDropStats();
  const navigate = useNavigate();

  const [tierFilter, setTierFilter] = useState<string>('all');
  const [citySearch, setCitySearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('date');
  const [minScore, setMinScore] = useState(0);

  const filtered = useMemo(() => {
    if (!deals) return [];
    let result = [...deals];

    if (tierFilter !== 'all') {
      result = result.filter(d => d.alert_tier === tierFilter);
    }
    if (citySearch) {
      result = result.filter(d => d.city?.toLowerCase().includes(citySearch.toLowerCase()));
    }
    if (minScore > 0) {
      result = result.filter(d => d.opportunity_score >= minScore);
    }

    switch (sortBy) {
      case 'drop': result.sort((a, b) => b.drop_percentage - a.drop_percentage); break;
      case 'score': result.sort((a, b) => b.opportunity_score - a.opportunity_score); break;
      case 'price': result.sort((a, b) => a.new_price - b.new_price); break;
      default: result.sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime());
    }

    return result;
  }, [deals, tierFilter, citySearch, sortBy, minScore]);

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-emerald-500" />
            Price Drop Deals
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-monitored price reductions with investment opportunity scoring
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Drops', value: stats.total, icon: TrendingDown, color: 'text-primary' },
            { label: 'Elite Deals', value: stats.elite, icon: Flame, color: 'text-amber-400' },
            { label: 'Opportunities', value: stats.opportunity, icon: Target, color: 'text-emerald-500' },
            { label: 'Minor Drops', value: stats.minor, icon: AlertTriangle, color: 'text-muted-foreground' },
            { label: 'Avg Drop', value: `${stats.avgDrop}%`, icon: TrendingDown, color: 'text-chart-4' },
          ].map(s => (
            <Card key={s.label} className="bg-card/80 backdrop-blur border-border/50">
              <CardContent className="p-3 flex items-center gap-2">
                <s.icon className={cn('h-4 w-4 shrink-0', s.color)} />
                <div>
                  <p className="text-lg font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tier tabs */}
        <div className="flex gap-2 flex-wrap">
          {tierTabs.map(t => (
            <Button
              key={t.key}
              variant={tierFilter === t.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTierFilter(t.key)}
              className="text-xs gap-1.5"
            >
              <t.icon className="h-3 w-3" />
              {t.label}
            </Button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by city..."
              value={citySearch}
              onChange={e => setCitySearch(e.target.value)}
              className="pl-8 h-9 text-sm"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <ArrowUpDown className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Latest</SelectItem>
              <SelectItem value="drop">Biggest Drop</SelectItem>
              <SelectItem value="score">Highest Score</SelectItem>
              <SelectItem value="price">Lowest Price</SelectItem>
            </SelectContent>
          </Select>
          <Select value={String(minScore)} onValueChange={v => setMinScore(Number(v))}>
            <SelectTrigger className="w-[160px] h-9 text-sm">
              <SelectValue placeholder="Min Score" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Score</SelectItem>
              <SelectItem value="40">Score 40+</SelectItem>
              <SelectItem value="65">Score 65+</SelectItem>
              <SelectItem value="85">Elite 85+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deals grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-card/80 border-border/50">
            <CardContent className="py-12 text-center">
              <TrendingDown className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No price drops match your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(deal => {
              const tier = ALERT_TIER_CONFIG[deal.alert_tier as AlertTier] || ALERT_TIER_CONFIG.minor;
              const daysSince = Math.floor((Date.now() - new Date(deal.changed_at).getTime()) / 86400000);

              return (
                <Card
                  key={`${deal.property_id}-${deal.changed_at}`}
                  onClick={() => navigate(`/properties/${deal.property_id}`)}
                  className={cn(
                    'bg-card/80 backdrop-blur border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg',
                    tier.bg,
                    deal.alert_tier === 'elite_deal' && 'shadow-[0_0_16px_hsl(var(--gold-primary)/0.2)]'
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm leading-tight line-clamp-2">
                        {tier.emoji} {deal.property_title || 'Property'}
                      </CardTitle>
                      <Badge variant="outline" className={cn('text-xs shrink-0 font-bold', tier.color)}>
                        -{deal.drop_percentage.toFixed(1)}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Price comparison */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-emerald-500">{formatPrice(deal.new_price)}</span>
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(deal.old_price)}</span>
                    </div>

                    {/* AI insight message */}
                    <p className="text-[11px] text-muted-foreground italic leading-relaxed">
                      "Price reduced {deal.drop_percentage.toFixed(1)}% — {
                        deal.opportunity_score >= 85
                          ? 'potential elite ROI opportunity detected.'
                          : deal.opportunity_score >= 65
                          ? 'strong investment zone with upside potential.'
                          : 'monitor for further price movement.'
                      }"
                    </p>

                    {/* Metrics row */}
                    <div className="flex flex-wrap gap-1.5">
                      {deal.city && <Badge variant="outline" className="text-[9px] h-4">{deal.city}</Badge>}
                      <Badge variant="secondary" className="text-[9px] h-4">
                        Score: {deal.opportunity_score}
                      </Badge>
                      {deal.demand_heat_score >= 70 && (
                        <Badge variant="secondary" className="text-[9px] h-4 text-orange-500">
                          🔥 Hot Demand
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[9px] h-4">
                        {deal.ai_undervaluation}
                      </Badge>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-border/30">
                      <span className="text-[10px] text-muted-foreground">
                        {daysSince === 0 ? 'Today' : daysSince === 1 ? 'Yesterday' : `${daysSince}d ago`}
                      </span>
                      <Badge variant="outline" className={cn('text-[9px]', tier.color)}>
                        {tier.label}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Top cities sidebar */}
        {stats.topCities.length > 0 && (
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Top Cities with Price Drops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.topCities.map(c => (
                  <Badge
                    key={c.city}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary/10 transition-colors"
                    onClick={() => setCitySearch(c.city)}
                  >
                    {c.city} ({c.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
