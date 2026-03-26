import { useQuery } from '@tanstack/react-query';
import { fetchAllFeatureControls, isFeatureEnabled, type FeatureControl } from '@/services/featureControlService';

const QUERY_KEY = ['astra-feature-controls'];

export function useFeatureControls() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchAllFeatureControls,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useFeatureControl(featureKey: string, allowBeta = false) {
  const { data: controls = [], isLoading } = useFeatureControls();

  return {
    enabled: isFeatureEnabled(controls, featureKey, allowBeta),
    isLoading,
    control: controls.find(c => c.feature_key === featureKey) ?? null,
  };
}
