import { useMemo } from 'react';
import { usePlatformHealth } from '@/hooks/usePlatformHealth';
import { generateDealMomentum, generateDealSignals, type DealMomentum, type DealSignal } from '@/services/dealAccelerationService';

export function useDealMomentumAnalytics(): {
  momentum: DealMomentum | null;
  signals: DealSignal[];
  isLoading: boolean;
} {
  const { data: health, isLoading } = usePlatformHealth();

  const result = useMemo(() => {
    if (!health) return { momentum: null, signals: [] };
    const momentum = generateDealMomentum(health.totalProperties, health.totalValuations, health.avgSeoScore);
    return { momentum, signals: generateDealSignals(momentum) };
  }, [health]);

  return { ...result, isLoading };
}
