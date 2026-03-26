import { useFeatureControl } from '@/hooks/useFeatureControl';
import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { updateFeatureStatus } from '@/services/featureControlService';

/**
 * Investor Demo Mode — when 'demo_mode' feature is active:
 * - Suppress console noise
 * - Signal experimental modules to hide
 * - Show demo banner
 */
export function useInvestorDemoMode() {
  const { enabled: isDemoMode, isLoading } = useFeatureControl('demo_mode');

  useEffect(() => {
    if (!isDemoMode) return;

    // Suppress non-critical console logs during demo
    const originalWarn = console.warn;
    const originalDebug = console.debug;
    console.warn = () => {};
    console.debug = () => {};

    return () => {
      console.warn = originalWarn;
      console.debug = originalDebug;
    };
  }, [isDemoMode]);

  return { isDemoMode, isLoading };
}

export function useDemoModeToggle() {
  const qc = useQueryClient();

  const enable = useCallback(async () => {
    await updateFeatureStatus('demo_mode', 'active');
    // Disable experimental modules
    await Promise.allSettled([
      updateFeatureStatus('tokenization', 'disabled'),
      updateFeatureStatus('hedge_fund', 'disabled'),
    ]);
    qc.invalidateQueries({ queryKey: ['astra-feature-controls'] });
  }, [qc]);

  const disable = useCallback(async () => {
    await updateFeatureStatus('demo_mode', 'disabled');
    // Re-enable experimental modules to beta
    await Promise.allSettled([
      updateFeatureStatus('tokenization', 'beta'),
      updateFeatureStatus('hedge_fund', 'beta'),
    ]);
    qc.invalidateQueries({ queryKey: ['astra-feature-controls'] });
  }, [qc]);

  return { enable, disable };
}
