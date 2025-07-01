
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SystemControl {
  id: string;
  isEnabled: boolean;
  errorMessage?: string;
}

export const useSystemControls = () => {
  const { data: controls, isLoading, error } = useQuery({
    queryKey: ['system-controls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'system_controls');
      
      if (error) throw error;
      
      const controlsMap: Record<string, SystemControl> = {};
      
      data?.forEach(setting => {
        controlsMap[setting.key] = {
          id: setting.key,
          isEnabled: setting.value?.enabled || false,
          errorMessage: setting.value?.errorMessage
        };
      });
      
      return controlsMap;
    }
  });

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
