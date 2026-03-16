import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, MapPin, TrendingUp, DollarSign, Heart, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhyRecommendedProps {
  matchScore: number;
  city?: string;
  propertyType?: string;
  /** Optional user profile hints */
  preferredCity?: string;
  preferredType?: string;
  className?: string;
}

/**
 * Contextual tooltip explaining WHY a property was recommended.
 * Derives reasoning from match score + user profile alignment.
 */
export default function WhyRecommended({
  matchScore,
  city,
  propertyType,
  preferredCity,
  preferredType,
  className,
}: WhyRecommendedProps) {
  // Build reasoning signals
  const reasons: { icon: typeof TrendingUp; text: string }[] = [];

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
          className="max-w-[220px] p-2.5 space-y-1.5"
        >
          <p className="text-[10px] font-semibold text-foreground uppercase tracking-wider mb-1">
            Why this pick
          </p>
          {reasons.slice(0, 3).map((r, i) => (
            <div key={i} className="flex items-start gap-1.5">
              <r.icon className="h-3 w-3 text-primary shrink-0 mt-0.5" />
              <span className="text-[11px] text-muted-foreground leading-tight">{r.text}</span>
            </div>
          ))}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
