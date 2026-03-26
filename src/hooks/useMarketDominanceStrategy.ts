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
    return computeMarketDominance(
      health.totalProperties ?? 0,
      health.totalInquiries ?? 0,
      health.avgDealVelocityDays ?? 30
    );
  }, [health]);

  return { strategy, isLoading };
}
