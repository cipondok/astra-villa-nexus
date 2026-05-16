import { useMemo } from 'react';
import { usePlatformHealth } from '@/hooks/usePlatformHealth';
import { computeMarketDominance, type MarketDominanceStrategy } from '@/services/marketDominanceService';

export function useMarketDominanceStrategy(): {
  strategy: MarketDominanceStrategy | null;
  isLoading: boolean;
} {
  const { data: health, isLoading } = usePlatformHealth();

  const strategy = useMemo(() => {
    if (!health) return null;
    const estimatedInquiries = Math.round(health.totalValuations * 0.8);
    const estimatedDealVelocity = health.totalValuations > 0 ? Math.max(Math.round(45 / Math.max(health.totalValuations * 0.2, 1)), 5) : 30;
    return computeMarketDominance(
      health.totalProperties,
      estimatedInquiries,
      estimatedDealVelocity
    );
  }, [health]);

  return { strategy, isLoading };
}
