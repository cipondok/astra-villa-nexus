/**
 * AI Recommendation Section
 * Displays curated property recommendations with explanations
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Eye, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import LuxuryPropertyCard from './LuxuryPropertyCard';
import { useSmartRecommendationEngine } from '@/hooks/useSmartRecommendationEngine';

interface RecommendationSectionProps {
  segment?: string;
  budgetMin?: number;
  budgetMax?: number;
  location?: string;
  className?: string;
}

const SECTION_CONFIG = [
  { key: 'recommended', title: 'Recommended for You', subtitle: 'AI-curated based on your investment profile', icon: Sparkles },
  { key: 'highGrowth', title: 'High Growth Opportunities', subtitle: 'Markets with strong appreciation trajectory', icon: TrendingUp },
  { key: 'trending', title: 'Trending Among Investors', subtitle: 'Most viewed by qualified investors this week', icon: Eye },
  { key: 'similar', title: 'Similar to Your Interests', subtitle: 'Based on your browsing and watchlist', icon: Target },
] as const;

const RecommendationSection = memo(({
  segment,
  budgetMin,
  budgetMax,
  location,
  className,
}: RecommendationSectionProps) => {
  const { recommendations, isLoading, recordInteraction } = useSmartRecommendationEngine({
    segment,
    budgetMin,
    budgetMax,
    location,
  });

  if (isLoading) {
    return (
      <div className={cn('space-y-8', className)}>
        {[0, 1].map(i => (
          <div key={i} className="space-y-4">
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2].map(j => (
                <div key={j} className="aspect-[4/3] bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-12', className)}>
      {SECTION_CONFIG.map(({ key, title, subtitle, icon: Icon }) => {
        const items = recommendations[key];
        if (!items?.length) return null;

        return (
          <motion.section
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((property, idx) => (
                <LuxuryPropertyCard
                  key={property.propertyId}
                  property={property}
                  rank={key === 'recommended' ? idx + 1 : undefined}
                  onInteraction={recordInteraction}
                />
              ))}
            </div>
          </motion.section>
        );
      })}
    </div>
  );
});

RecommendationSection.displayName = 'RecommendationSection';

export default RecommendationSection;
