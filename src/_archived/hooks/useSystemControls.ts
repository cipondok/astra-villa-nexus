
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAllSystemSettings, selectSettingsByCategory } from './useAllSystemSettings';

interface SystemControl {
  id: string;
  isEnabled: boolean;
  errorMessage?: string;
}

interface SystemControlValue {
  enabled?: boolean;
  errorMessage?: string;
}

export const useSystemControls = () => {
  const { data: allSettings, isLoading, error } = useAllSystemSettings();

  const controls = (() => {
    const categorySettings = selectSettingsByCategory(allSettings, 'system_controls');
    if (!categorySettings.length) return undefined;

    const controlsMap: Record<string, SystemControl> = {};
    categorySettings.forEach(setting => {
      const value = setting.value as SystemControlValue;
      controlsMap[setting.key] = {
        id: setting.key,
        isEnabled: value?.enabled || false,
        errorMessage: value?.errorMessage
      };
    });
    return controlsMap;
  })();

  const isFeatureEnabled = (featureKey: string): boolean => {
    return controls?.[featureKey]?.isEnabled ?? true;
  };

  const getFeatureErrorMessage = (featureKey: string): string | undefined => {
    return controls?.[featureKey]?.errorMessage;
  };

  return {
    controls,
    isLoading,
    error,
    isFeatureEnabled,
    getFeatureErrorMessage
  };
};
