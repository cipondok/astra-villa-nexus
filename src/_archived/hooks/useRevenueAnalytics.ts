import { useMemo } from 'react';
import { usePlatformHealth } from '@/hooks/usePlatformHealth';
import { computeRevenueKPIs, generateRevenueRecommendations, type RevenueKPIs } from '@/services/SystemIntelligenceService';

export function useRevenueAnalytics() {
  const { data: health, isLoading } = usePlatformHealth();

  const result = useMemo(() => {
    if (!health) return { kpis: null, recommendations: [], isLoading: true };

    // Early-stage estimation — uses available platform counts
    const kpis = computeRevenueKPIs(
      health.totalProperties,
      health.totalValuations,
      Math.max(Math.floor(health.totalValuations * 0.3), 0), // estimated deals
      Math.max(Math.floor(health.totalProperties * 0.15), 0), // estimated premium
    );

    return {
      kpis,
      recommendations: generateRevenueRecommendations(kpis),
      isLoading: false,
    };
  }, [health]);

  return { ...result, isLoading };
}
