import { useMemo } from 'react';
import { usePlatformHealth } from '@/hooks/usePlatformHealth';
import { generateAcquisitionSignals, type InvestorAcquisitionSignals } from '@/services/investorAcquisitionService';

export function useInvestorAcquisitionSignals(): {
  signals: InvestorAcquisitionSignals | null;
  isLoading: boolean;
} {
  const { data: health, isLoading } = usePlatformHealth();

  const signals = useMemo(() => {
    if (!health) return null;
    // Derive estimates from available platform metrics
    const estimatedUsers = Math.max(Math.round(health.totalProperties * 3), 5);
    const estimatedInquiries = Math.round(health.totalValuations * 0.8);
    const estimatedViewings = Math.round(health.totalValuations * 0.3);
    const estimatedEscrows = Math.round(health.totalValuations * 0.1);
    return generateAcquisitionSignals(
      estimatedUsers,
      estimatedInquiries,
      estimatedViewings,
      estimatedEscrows,
      health.totalProperties
    );
  }, [health]);

  return { signals, isLoading };
}
