import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import OpportunityScoreRing from './OpportunityScoreRing';
import { Sparkles, TrendingUp } from 'lucide-react';

interface HeroOpportunityOverlayProps {
  opportunityScore?: number | null;
  aiEstimatedPrice?: number | null;
  currentPrice?: number;
  className?: string;
}

/**
 * Floating glassmorphic overlay that sits on the bottom-right of the image gallery hero.
 * Shows the AI opportunity score ring + a brief insight.
 */
const HeroOpportunityOverlay = memo(({
  opportunityScore,
  aiEstimatedPrice,
  currentPrice,
  className,
}: HeroOpportunityOverlayProps) => {
  if (!opportunityScore || opportunityScore <= 0) return null;

  const tier = opportunityScore >= 85
    ? { label: 'Elite Opportunity', color: 'text-chart-2', bg: 'border-chart-2/30 bg-chart-2/5' }
    : opportunityScore >= 70
    ? { label: 'Strong Potential', color: 'text-primary', bg: 'border-primary/30 bg-primary/5' }
    : opportunityScore >= 50
    ? { label: 'Worth Watching', color: 'text-chart-4', bg: 'border-chart-4/30 bg-chart-4/5' }
    : { label: 'Emerging', color: 'text-muted-foreground', bg: 'border-border/40 bg-muted/40' };

  const undervalued = aiEstimatedPrice && currentPrice && aiEstimatedPrice > currentPrice
    ? Math.round(((aiEstimatedPrice - currentPrice) / currentPrice) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        'absolute bottom-4 right-4 z-20',
        'flex items-center gap-3 px-4 py-3 rounded-2xl',
        'bg-card/80 backdrop-blur-xl border shadow-lg',
        tier.bg,
        className,
      )}
    >
      <OpportunityScoreRing score={opportunityScore} size={52} />

      <div className="flex flex-col gap-0.5">
        <div className={cn('flex items-center gap-1 text-xs font-bold', tier.color)}>
          <Sparkles className="h-3 w-3" />
          {tier.label}
        </div>
        <span className="text-[10px] text-muted-foreground font-medium">
          AI Score: {opportunityScore}/100
        </span>
        {undervalued != null && undervalued > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-chart-2">
            <TrendingUp className="h-2.5 w-2.5" />
            {undervalued}% below fair value
          </span>
        )}
      </div>
    </motion.div>
  );
});

HeroOpportunityOverlay.displayName = 'HeroOpportunityOverlay';
export default HeroOpportunityOverlay;
