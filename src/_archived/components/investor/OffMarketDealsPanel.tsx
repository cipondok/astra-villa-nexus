import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useOffMarketDeals, OffMarketDeal } from '@/hooks/useOffMarketDeals';
import {
  Search, TrendingDown, Sparkles, Building2, MapPin,
  DollarSign, Loader2, Flame, Eye, CalendarClock,
  ArrowDownRight, ShieldCheck, Zap, BarChart3,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

const QUALITY_STYLES: Record<string, { label: string; className: string }> = {
  exceptional: { label: 'Exceptional', className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  strong: { label: 'Strong', className: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  good: { label: 'Good', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  fair: { label: 'Fair', className: 'bg-muted text-muted-foreground border-border' },
};

export default function OffMarketDealsPanel() {
  const [city, setCity] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [minDiscount, setMinDiscount] = useState('5');
  const mutation = useOffMarketDeals();
  const result = mutation.data;

  const handleScan = () => {
    mutation.mutate({
      city: city.trim() || undefined,
      max_budget: maxBudget ? Number(maxBudget.replace(/\D/g, '')) : undefined,
      min_discount: Number(minDiscount) || 5,
    });
  };

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card className="border-primary/20 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Eye className="h-5 w-5 text-primary" />
            Off-Market Deal Discovery
          </CardTitle>
          <CardDescription>Temukan properti pre-launch & developer deals sebelum listing publik</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Kota (opsional)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="e.g. Jakarta" value={city} onChange={(e) => setCity(e.target.value)} className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Budget Maks (opsional)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="e.g. 5000000000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value.replace(/\D/g, ''))}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Min. Diskon (%)</label>
              <div className="relative">
                <ArrowDownRight className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={minDiscount}
                  onChange={(e) => setMinDiscount(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <Button onClick={handleScan} disabled={mutation.isPending} className="w-full" size="lg">
            {mutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Scanning off-market...</>
            ) : (
              <><Search className="h-4 w-4" /> Scan Off-Market Deals</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryCard label="Deals Ditemukan" value={`${result.deals.length}`} icon={Zap} />
              <SummaryCard label="Properti Discan" value={`${result.total_scanned}`} icon={Search} />
              <SummaryCard label="Avg Undervalue" value={`${result.avg_undervalue}%`} icon={TrendingDown} />
              <SummaryCard label="Kota" value={`${result.cities_covered.length}`} icon={MapPin} />
            </div>

            {/* Deal List */}
            {result.deals.length > 0 ? (
              <div className="space-y-3">
                {result.deals.map((deal, idx) => (
                  <DealCard key={deal.property_id} deal={deal} index={idx} />
                ))}
              </div>
            ) : (
              <Card className="bg-card/80 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <Eye className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Tidak ditemukan off-market deals yang memenuhi kriteria.</p>
                </CardContent>
              </Card>
            )}

            {/* AI Recommendation */}
            <Card className="border-primary/30 bg-primary/5 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">AI Insight</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <Card className="bg-card/80 backdrop-blur">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <p className="text-lg font-bold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function DealCard({ deal, index }: { deal: OffMarketDeal; index: number }) {
  const quality = QUALITY_STYLES[deal.deal_quality] || QUALITY_STYLES.fair;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="bg-card/80 backdrop-blur hover:border-primary/30 transition-colors">
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Thumbnail */}
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0">
              {deal.thumbnail_url ? (
                <img src={deal.thumbnail_url} alt={deal.project_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p className="text-sm font-semibold text-foreground truncate">{deal.project_name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {deal.city}{deal.state ? `, ${deal.state}` : ''} • {deal.property_type}
                  </p>
                </div>
                <Badge className={`text-xs border ${quality.className}`}>{quality.label}</Badge>
              </div>

              {/* Price comparison */}
              <div className="flex items-center gap-3 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Harga Developer</p>
                  <p className="text-sm font-bold text-foreground">{formatIDR(deal.price)}</p>
                </div>
                <ArrowDownRight className="h-4 w-4 text-emerald-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Estimasi Pasar</p>
                  <p className="text-sm font-medium text-muted-foreground line-through">{formatIDR(deal.estimated_market_price)}</p>
                </div>
                <Badge variant="secondary" className="text-emerald-400 bg-emerald-500/10 border-emerald-500/20 text-xs">
                  -{deal.undervalue_percent}%
                </Badge>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-5 gap-2 mt-3">
                <MiniMetric icon={BarChart3} label="Deal Score" value={`${deal.deal_score}`} />
                <MiniMetric icon={ShieldCheck} label="Inv. Score" value={`${deal.investment_score}`} />
                <MiniMetric icon={Flame} label="Heat" value={`${deal.demand_heat_score}`} />
                <MiniMetric icon={Building2} label="Progress" value={`${deal.completion_percentage}%`} />
                <MiniMetric icon={CalendarClock} label="Phase" value={deal.construction_phase || 'N/A'} />
              </div>

              {/* Tags */}
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {deal.is_pre_launch && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">Pre-Launch</Badge>}
                {deal.is_early_bird && <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">Early Bird</Badge>}
                {deal.discount_percentage > 0 && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">Diskon {deal.discount_percentage}%</Badge>
                )}
                {deal.total_units && deal.units_sold != null && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                    {deal.units_sold}/{deal.total_units} terjual
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function MiniMetric({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="text-center">
      <Icon className="h-3 w-3 mx-auto text-muted-foreground mb-0.5" />
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}
