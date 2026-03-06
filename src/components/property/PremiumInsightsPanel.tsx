import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Price from '@/components/ui/Price';
import { usePremiumInsights } from '@/hooks/usePremiumInsights';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, ShieldCheck, BarChart3, Flame, Lock,
  ArrowUpRight, DollarSign, Users, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface PremiumInsightsPanelProps {
  propertyId: string;
  className?: string;
}

function ScoreCard({ icon, label, value, suffix, color, locked }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  suffix?: string;
  color: string;
  locked?: boolean;
}) {
  return (
    <div className={cn(
      "relative flex items-center gap-3 p-3 rounded-xl border transition-all",
      locked
        ? "border-dashed border-muted-foreground/20 bg-muted/30"
        : "border-border/40 bg-card hover:border-border/60 hover:shadow-sm"
    )}>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: locked ? 'hsl(var(--muted))' : `${color}15` }}
      >
        {locked ? <Lock className="h-4 w-4 text-muted-foreground" /> : icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
        {locked ? (
          <p className="text-xs text-muted-foreground italic">Pro only</p>
        ) : (
          <p className="text-sm font-bold" style={{ color }}>
            {value}{suffix && <span className="text-xs font-normal text-muted-foreground ml-0.5">{suffix}</span>}
          </p>
        )}
      </div>
    </div>
  );
}

function DealBadge({ rating }: { rating: string }) {
  const colorMap: Record<string, string> = {
    'Strong Buy': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    'Good Deal': 'bg-green-500/10 text-green-600 border-green-500/20',
    'Slightly Undervalued': 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    'Fair Value': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    'Slightly Overpriced': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'Overpriced': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  };
  return (
    <Badge className={cn("text-[10px] font-semibold", colorMap[rating] || 'bg-muted text-muted-foreground')}>
      {rating}
    </Badge>
  );
}

const PremiumInsightsPanel: React.FC<PremiumInsightsPanelProps> = ({ propertyId, className }) => {
  const { data, isLoading, isError } = usePremiumInsights(propertyId);
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card className={cn("border-border/40", className)}>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) return null;

  const { access_level, insights, upgrade_hint } = data;
  const isFree = access_level === 'free';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Card className={cn("border-border/40 overflow-hidden", className)}>
        {/* Header */}
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
              </div>
              <CardTitle className="text-sm font-bold">AI Property Insights</CardTitle>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] uppercase tracking-wider",
                isFree ? "border-muted-foreground/30 text-muted-foreground" : "border-primary/30 text-primary"
              )}
            >
              {access_level}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-2.5 pt-0">
          {/* Investment Score — always visible */}
          <ScoreCard
            icon={<TrendingUp className="h-4 w-4 text-emerald-500" />}
            label="Investment Score"
            value={insights.investment_score}
            suffix="/100"
            color="#22c55e"
          />

          {/* Deal Rating */}
          {!isFree && insights.deal_rating ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#3b82f615' }}>
                <ShieldCheck className="h-4 w-4 text-sky-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Deal Rating</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <DealBadge rating={insights.deal_rating} />
                  {insights.deal_score_percent !== undefined && (
                    <span className="text-[10px] text-muted-foreground">
                      {insights.deal_score_percent > 0 ? '+' : ''}{insights.deal_score_percent}% vs FMV
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <ScoreCard icon={null} label="Deal Rating" value="" color="#3b82f6" locked />
          )}

          {/* Rental Yield */}
          <ScoreCard
            icon={<DollarSign className="h-4 w-4 text-amber-500" />}
            label="Rental Yield Estimate"
            value={!isFree && insights.rental_yield_estimate ? `${insights.rental_yield_estimate}%` : ''}
            suffix="/ year"
            color="#f59e0b"
            locked={isFree}
          />

          {/* 5-Year Forecast */}
          {!isFree && insights.price_forecast_5y ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-card">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: '#8b5cf615' }}>
                <BarChart3 className="h-4 w-4 text-violet-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">5-Year Price Forecast</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-violet-500">
                    <Price amount={insights.price_forecast_5y.forecast_price} short />
                  </span>
                  <Badge className="bg-violet-500/10 text-violet-500 border-violet-500/20 text-[9px]">
                    <ArrowUpRight className="h-2.5 w-2.5 mr-0.5" />
                    +{insights.price_forecast_5y.annual_growth_rate}%/yr
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <ScoreCard icon={null} label="5-Year Price Forecast" value="" color="#8b5cf6" locked />
          )}

          {/* Buyer Demand */}
          <ScoreCard
            icon={<Users className="h-4 w-4 text-rose-500" />}
            label="Buyer Demand Score"
            value={!isFree && insights.buyer_demand_score !== undefined ? insights.buyer_demand_score : ''}
            suffix="/100"
            color="#ef4444"
            locked={isFree}
          />

          {/* Upgrade CTA for free users */}
          {isFree && upgrade_hint && (
            <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/15">
              <p className="text-xs text-muted-foreground mb-2">{upgrade_hint}</p>
              <Button
                size="sm"
                className="w-full gap-1.5"
                onClick={() => navigate('/subscription')}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Unlock Pro Insights
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PremiumInsightsPanel;
