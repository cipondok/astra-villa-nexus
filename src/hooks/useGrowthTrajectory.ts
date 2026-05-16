import { useMemo } from 'react';
import { usePlatformHealth } from '@/hooks/usePlatformHealth';
import { usePlatformIntelligence } from '@/hooks/usePlatformIntelligence';
import {
  computeGrowthTrajectory,
  computeExpansionStrategy,
  type GrowthTrajectory,
  type ExpansionStrategy,
} from '@/services/growthTrajectoryEngine';

export function useGrowthTrajectory(): {
  trajectory: GrowthTrajectory | null;
  isLoading: boolean;
} {
  const { data: health, isLoading } = usePlatformHealth();

  const trajectory = useMemo(() => {
    if (!health) return null;
    return computeGrowthTrajectory({
      monthlyActiveListings: health.totalProperties,
      qualifiedInquiries: Math.floor(health.totalProperties * 0.6),
      dealConversionVelocityDays: health.totalValuations > 0 ? Math.max(Math.round(30 / Math.max(health.totalValuations * 0.1, 1)), 3) : 30,
      avgEngagementMinutes: health.avgSeoScore > 0 ? Math.round(health.avgSeoScore / 20) : 1,
      revenuePerListing: health.totalValuations > 0 ? Math.round(5000 * (health.totalValuations / Math.max(health.totalProperties, 1))) : 0,
      geographicExpansionIndex: Math.min(health.totalProperties * 2, 100),
    });
  }, [health]);

  return { trajectory, isLoading };
}

export function useExpansionStrategy(): {
  strategy: ExpansionStrategy | null;
  isLoading: boolean;
} {
  const { data: health, isLoading: hLoading } = usePlatformHealth();
  const { intelligence, isLoading: iLoading } = usePlatformIntelligence();

  const strategy = useMemo(() => {
    if (!health || !intelligence) return null;
    return computeExpansionStrategy(
      health.totalProperties,
      health.totalValuations,
      intelligence.scalingReadiness
    );
  }, [health, intelligence]);

  return { strategy, isLoading: hLoading || iLoading };
}
