import { useDealHunterFeed, DEAL_CLASSIFICATIONS, DEAL_TIERS, DealHunterOpportunity } from '@/hooks/useDealHunter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Target, Clock, TrendingDown, ChevronRight, Crosshair, Zap } from 'lucide-react';

const formatIDR = (v: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

function UrgencyBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-destructive' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <div className="flex items-center gap-2">
      <Clock className="w-3 h-3 text-muted-foreground" />
      <div className="flex-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-[10px] font-medium text-muted-foreground">{score}</span>
    </div>
  );
}

export default function DealHunterPanel() {
  const navigate = useNavigate();
  const { data, isLoading } = useDealHunterFeed(8);
  const opportunities = data || [];

  if (isLoading) {
    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" /> Deal Hunter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </CardContent>
      </Card>
    );
  }

  if (opportunities.length === 0) {
    return (
      <Card className="bg-card/60 backdrop-blur-xl border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" /> Deal Hunter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Target className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground">AI is scanning for deals — check back soon</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Stats
  const hotDeals = opportunities.filter(o => o.deal_classification === 'hot_deal').length;
  const silentOpps = opportunities.filter(o => o.deal_classification === 'silent_opportunity').length;

  return (
    <Card className="bg-card/60 backdrop-blur-xl border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-primary" /> Deal Hunter
            {hotDeals > 0 && (
              <Badge className="h-5 px-1.5 text-[10px] bg-destructive/10 text-destructive border-destructive/20">
                {hotDeals} Hot
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => navigate('/deal-finder')}>
            View All <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        {/* Classification summary */}
        <div className="flex gap-2 mt-1">
          {hotDeals > 0 && <Badge variant="outline" className="text-[9px] h-5">🔥 {hotDeals} Hot</Badge>}
          {silentOpps > 0 && <Badge variant="outline" className="text-[9px] h-5">🤫 {silentOpps} Silent</Badge>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {opportunities.map((deal) => {
            const cls = DEAL_CLASSIFICATIONS[deal.deal_classification] || DEAL_CLASSIFICATIONS.speculative;
            const tier = DEAL_TIERS[deal.deal_tier] || DEAL_TIERS.public;
            const prop = deal.property as any;

            return (
              <div
                key={deal.id}
                className="p-3 rounded-lg border border-border/30 bg-muted/10 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => navigate(`/property/${deal.property_id}`)}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {cls.icon} {prop?.title || 'Property'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {prop?.city} · {prop?.property_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Badge className={`text-[8px] h-4 px-1.5 ${cls.color} border-0`}>{cls.label}</Badge>
                    {deal.deal_tier !== 'public' && (
                      <Badge variant="outline" className={`text-[8px] h-4 px-1 ${tier.color}`}>{tier.label}</Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
                  <div>
                    <span className="text-muted-foreground">Signal</span>
                    <p className="font-bold text-foreground">{deal.deal_opportunity_signal_score}/100</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Undervalued</span>
                    <p className="font-bold text-emerald-500">{deal.undervaluation_percent > 0 ? `${deal.undervaluation_percent}%` : '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sell Prob</span>
                    <p className="font-bold text-foreground">{Math.round(deal.sell_probability_30d * 100)}%</p>
                  </div>
                </div>

                <UrgencyBar score={deal.urgency_score} />

                {deal.optimal_entry_window_days <= 7 && (
                  <div className="flex items-center gap-1 mt-1.5 text-[9px] text-destructive">
                    <Zap className="w-3 h-3" />
                    <span className="font-medium">{deal.optimal_entry_window_days}d entry window remaining</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
