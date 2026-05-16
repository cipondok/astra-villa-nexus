import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, MapPin, TrendingUp, DollarSign, Heart, Target, Dna, Eye, Star, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { RankSignal } from '@/utils/recommendationRanker';

interface WhyRecommendedProps {
  matchScore: number;
  city?: string;
  propertyType?: string;
  preferredCity?: string;
  preferredType?: string;
  className?: string;
  /** Enhanced: context tag from ranking engine */
  contextTag?: string;
  /** Enhanced: detailed rank signals from ranking engine */
  rankSignals?: RankSignal[];
  /** Enhanced: boosts applied */
  boosts?: string[];
}

const SIGNAL_ICONS: Record<string, typeof TrendingUp> = {
  dna: Dna,
  watchlist: Heart,
  location: MapPin,
  elite: Star,
  type: Target,
  budget: DollarSign,
  trend: TrendingUp,
  penalty: Eye,
};

/**
 * Contextual tooltip explaining WHY a property was recommended.
 * Enhanced with DNA-aware reasoning and ranking signal transparency.
 */
export default function WhyRecommended({
  matchScore,
  city,
  propertyType,
  preferredCity,
  preferredType,
  className,
  contextTag,
  rankSignals,
  boosts,
}: WhyRecommendedProps) {
  // Build reasoning — prefer rank signals if available, fallback to legacy
  const reasons: { icon: typeof TrendingUp; text: string }[] = [];

  if (rankSignals && rankSignals.length > 0) {
    // Use top contributing signals
    const sorted = [...rankSignals].sort((a, b) => b.contribution - a.contribution);
    sorted.slice(0, 3).forEach(signal => {
      const Icon = SIGNAL_ICONS[signal.icon] || TrendingUp;
      const pct = Math.round(signal.rawScore);
      reasons.push({
        icon: Icon,
        text: `${signal.factor}: ${pct}% match`,
      });
    });
  } else {
    // Legacy fallback
    if (matchScore >= 80) {
      reasons.push({ icon: Target, text: 'Strong match with your browsing pattern' });
    } else if (matchScore >= 60) {
      reasons.push({ icon: TrendingUp, text: 'Good alignment with your preferences' });
    }

    if (preferredCity && city && city.toLowerCase() === preferredCity.toLowerCase()) {
      reasons.push({ icon: MapPin, text: `In your preferred area: ${city}` });
    } else if (city) {
      reasons.push({ icon: MapPin, text: `Located in ${city}` });
    }

    if (preferredType && propertyType && propertyType.toLowerCase().includes(preferredType.toLowerCase())) {
      reasons.push({ icon: Heart, text: `Matches your interest in ${propertyType}` });
    }

    if (matchScore >= 70) {
      reasons.push({ icon: DollarSign, text: 'Within your typical price range' });
    }
  }

  if (reasons.length === 0) {
    reasons.push({ icon: TrendingUp, text: 'Trending in your area of interest' });
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              "inline-flex items-center justify-center",
              "h-5 w-5 rounded-full bg-background/80 backdrop-blur-sm border border-border/40",
              "hover:bg-primary/10 hover:border-primary/30 transition-colors",
              "touch-press",
              className
            )}
            onClick={(e) => e.preventDefault()}
            aria-label="Why this was recommended"
          >
            <Info className="h-3 w-3 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          className="max-w-[240px] p-2.5 space-y-1.5"
        >
          <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-1">
            Why this pick
          </p>

          {/* Context tag — primary explanation */}
          {contextTag && (
            <div className="flex items-start gap-1.5 pb-1.5 border-b border-border/30 mb-1">
              <Flame className="h-3 w-3 text-chart-4 shrink-0 mt-0.5" />
              <span className="text-[11px] text-foreground font-medium leading-tight">{contextTag}</span>
            </div>
          )}

          {/* Signal breakdown */}
          {reasons.slice(0, 3).map((r, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <r.icon className="h-3 w-3 text-primary shrink-0 mt-0.5" />
              <span className="text-[11px] text-muted-foreground leading-tight">{r.text}</span>
            </div>
          ))}

          {/* Boost badges */}
          {boosts && boosts.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1.5 border-t border-border/30">
              {boosts.slice(0, 2).map((b, i) => (
                <Badge key={i} variant="outline" className="text-[8px] px-1.5 py-0 bg-chart-2/5 text-chart-2 border-chart-2/20">
                  ↑ {b}
                </Badge>
              ))}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
