
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  configuration?: Record<string, any>;
}

export const useToolsManagement = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'tools');
      
      if (error) throw error;
      
      return data.map(setting => ({
        id: setting.id,
        name: setting.key,
        description: setting.description || '',
        category: setting.category,
        enabled: setting.value === true,
        configuration: typeof setting.value === 'object' ? setting.value : {}
      }));
    },
  });

  const toggleToolMutation = useMutation({
    mutationFn: async ({ toolId, enabled }: { toolId: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('system_settings')
        .update({ value: enabled })
        .eq('id', toolId);
      
      if (error) throw error;
      return { toolId, enabled };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      showSuccess(
        'Tool Updated',
        `Tool has been ${data.enabled ? 'enabled' : 'disabled'} successfully`
      );
    },
    onError: (error) => {
      console.error('Error updating tool:', error);
      showError('Error', 'Failed to update tool status');
    },
  });

  const updateToolConfigMutation = useMutation({
    mutationFn: async ({ toolId, configuration }: { toolId: string; configuration: Record<string, any> }) => {
      const { error } = await supabase
        .from('system_settings')
        .update({ value: configuration })
        .eq('id', toolId);
      
      if (error) throw error;
      return { toolId, configuration };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      showSuccess('Configuration Updated', 'Tool configuration has been updated successfully');
    },
    onError: (error) => {
      console.error('Error updating tool configuration:', error);
      showError('Error', 'Failed to update tool configuration');
    },
  });

  return {
    tools,
    isLoading,
    toggleTool: toggleToolMutation.mutate,
    updateToolConfig: updateToolConfigMutation.mutate,
    isToggling: toggleToolMutation.isPending,
    isUpdatingConfig: updateToolConfigMutation.isPending,
  };
};
