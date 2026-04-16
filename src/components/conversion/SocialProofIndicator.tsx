import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Eye, TrendingUp, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/useTranslation';

interface SocialProofIndicatorProps {
  propertyId?: string;
  className?: string;
}

/**
 * Shows social proof signals to increase conversion urgency.
 * Rotates between different proof types with smooth animation.
 * Uses realistic-range random data (to be replaced with real analytics later).
 */
const SocialProofIndicator = memo(({ propertyId, className }: SocialProofIndicatorProps) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Generate consistent but varied numbers from propertyId
  const seed = propertyId ? propertyId.charCodeAt(0) + propertyId.charCodeAt(propertyId.length - 1) : 42;
  const viewersNow = 3 + (seed % 15);
  const viewsToday = 20 + (seed % 80);
  const inquiries7d = 4 + (seed % 12);

  const proofs = [
    {
      icon: Eye,
      text: t('socialProof.viewingNow', `${viewersNow} investors viewing now`).replace('{count}', String(viewersNow)),
      color: 'text-chart-1',
    },
    {
      icon: Users,
      text: t('socialProof.viewsToday', `${viewsToday} views today`).replace('{count}', String(viewsToday)),
      color: 'text-chart-4',
    },
    {
      icon: TrendingUp,
      text: t('socialProof.inquiriesWeek', `${inquiries7d} inquiries this week`).replace('{count}', String(inquiries7d)),
      color: 'text-chart-5',
    },
    {
      icon: Clock,
      text: t('socialProof.highDemand', 'High demand — properties like this sell fast'),
      color: 'text-destructive',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % proofs.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [proofs.length]);

  const current = proofs[currentIndex];

  return (
    <div className={cn('h-6 relative overflow-hidden', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-1.5 absolute inset-0"
        >
          <current.icon className={cn('h-3 w-3', current.color)} />
          <span className="text-[10px] text-muted-foreground">{current.text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
});

SocialProofIndicator.displayName = 'SocialProofIndicator';
export default SocialProofIndicator;
