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
    return generateAcquisitionSignals(
      health.totalUsers ?? 0,
      health.totalInquiries ?? 0,
      health.totalViewings ?? 0,
      health.totalEscrows ?? 0,
      health.totalProperties ?? 0
    );
  }, [health]);

  return { signals, isLoading };
}
