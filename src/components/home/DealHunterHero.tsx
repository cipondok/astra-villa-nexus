import { useDealHunterHero, DEAL_CLASSIFICATIONS, DealHunterOpportunity } from '@/hooks/useDealHunter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Crosshair, Clock, Zap, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const formatShort = (v: number) =>
  v >= 1e12 ? `Rp ${(v / 1e12).toFixed(1)}T` : v >= 1e9 ? `Rp ${(v / 1e9).toFixed(1)}B` : v >= 1e6 ? `Rp ${(v / 1e6).toFixed(0)}M` : `Rp ${(v / 1e3).toFixed(0)}K`;

export default function DealHunterHero() {
  const navigate = useNavigate();
  const { data, isLoading } = useDealHunterHero();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">AI Deal Hunter</h2>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 w-64 flex-shrink-0 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">AI Deal Hunter</h2>
          <Badge variant="outline" className="text-[10px] h-5 border-primary/30 text-primary">
            {data.length} Active
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/deal-finder')}>
          View All <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {data.map((deal, i) => {
          const cls = DEAL_CLASSIFICATIONS[deal.deal_classification] || DEAL_CLASSIFICATIONS.speculative;
          const prop = deal.property as any;

          return (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex-shrink-0 w-64 p-4 rounded-xl border border-border/40 bg-card/60 backdrop-blur-xl hover:border-primary/40 transition-all cursor-pointer group"
              onClick={() => navigate(`/property/${deal.property_id}`)}
            >
              <div className="flex items-center justify-between mb-2">
                <Badge className={`text-[9px] h-4 px-1.5 ${cls.color} border-0`}>
                  {cls.icon} {cls.label}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{deal.optimal_entry_window_days}d left</span>
                </div>
              </div>

              <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {prop?.title || 'Property'}
              </p>
              <p className="text-[10px] text-muted-foreground mb-3">{prop?.city}</p>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-muted/20 rounded-md p-1.5 text-center">
                  <p className="text-muted-foreground">Signal</p>
                  <p className="font-bold text-foreground">{deal.deal_opportunity_signal_score}</p>
                </div>
                <div className="bg-muted/20 rounded-md p-1.5 text-center">
                  <p className="text-muted-foreground">Urgency</p>
                  <p className={`font-bold ${deal.urgency_score >= 70 ? 'text-destructive' : deal.urgency_score >= 40 ? 'text-amber-500' : 'text-foreground'}`}>
                    {deal.urgency_score}
                  </p>
                </div>
              </div>

              {deal.undervaluation_percent > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-500 font-medium">
                  <Zap className="w-3 h-3" />
                  {deal.undervaluation_percent}% below FMV · {prop?.price ? formatShort(prop.price) : ''}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
