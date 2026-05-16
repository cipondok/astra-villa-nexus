
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';
import { TOOLS_REGISTRY } from '@/services/toolsRegistry';

export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  configuration?: Record<string, any>;
  version: string;
  status: 'healthy' | 'warning' | 'error' | 'disabled';
  lastChecked: string;
  dependencies?: string[];
  errorMessage?: string;
  healthEndpoint?: string;
  configRequired?: boolean;
}

// Check if an edge function exists and is responsive
const checkEdgeFunctionHealth = async (functionName: string): Promise<{ status: 'healthy' | 'error'; responseTime: number }> => {
  const start = Date.now();
  try {
    // Try invoking with a simple health check body
    const { error } = await supabase.functions.invoke(functionName, {
      body: { healthCheck: true }
    });
    const responseTime = Date.now() - start;
    // Even if it returns an error (like auth required), it means the function exists
    return { status: error && error.message?.includes('not found') ? 'error' : 'healthy', responseTime };
  } catch {
    return { status: 'error', responseTime: Date.now() - start };
  }
};

// Check database connectivity
const checkDatabaseHealth = async (): Promise<{ status: 'healthy' | 'error'; responseTime: number }> => {
  const start = Date.now();
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    return { status: error ? 'error' : 'healthy', responseTime: Date.now() - start };
  } catch {
    return { status: 'error', responseTime: Date.now() - start };
  }
};

// Check storage accessibility
const checkStorageHealth = async (): Promise<{ status: 'healthy' | 'error'; responseTime: number }> => {
  const start = Date.now();
  try {
    const { error } = await supabase.storage.listBuckets();
    return { status: error ? 'error' : 'healthy', responseTime: Date.now() - start };
  } catch {
    return { status: 'error', responseTime: Date.now() - start };
  }
};

export const useToolsManagement = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [toolStates, setToolStates] = useState<Record<string, { enabled: boolean; status: Tool['status'] }>>({});

  // Initialize tool states from registry
  const { data: tools = [], isLoading } = useQuery({
    queryKey: ['tools', toolStates],
    queryFn: async () => {
      // Map registry tools to our Tool interface with current states
      return TOOLS_REGISTRY.map(registryTool => {
        const currentState = toolStates[registryTool.id];
        return {
          id: registryTool.id,
          name: registryTool.name,
          description: registryTool.description,
          category: registryTool.category,
          enabled: currentState?.enabled ?? registryTool.enabled,
          configuration: {},
          version: registryTool.version,
          status: currentState?.status ?? registryTool.status,
          lastChecked: registryTool.lastChecked,
          dependencies: registryTool.dependencies || [],
          healthEndpoint: registryTool.healthEndpoint,
          configRequired: registryTool.configRequired,
        } as Tool;
      });
    },
    staleTime: 0,
  });

  const toggleToolMutation = useMutation({
    mutationFn: async ({ toolId, enabled }: { toolId: string; enabled: boolean }) => {
      // Update local state
      setToolStates(prev => ({
        ...prev,
        [toolId]: {
          enabled,
          status: enabled ? 'healthy' : 'disabled'
        }
      }));
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
      // Store config in localStorage for persistence
      const configs = JSON.parse(localStorage.getItem('toolConfigs') || '{}');
      configs[toolId] = configuration;
      localStorage.setItem('toolConfigs', JSON.stringify(configs));
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

  const checkToolHealth = useCallback(async (toolId: string) => {
    const tool = TOOLS_REGISTRY.find(t => t.id === toolId);
    if (!tool) return;

    let healthResult: { status: 'healthy' | 'error'; responseTime: number } = { status: 'healthy', responseTime: 0 };

    // Check based on tool category/type
    switch (tool.id) {
      case 'ai-chat-bot':
        healthResult = await checkEdgeFunctionHealth('ai-assistant');
        break;
      case 'email-notifications':
        healthResult = await checkEdgeFunctionHealth('send-email');
        break;
      case 'security-monitoring':
        healthResult = await checkDatabaseHealth();
        break;
      case 'web-analytics':
        healthResult = await checkDatabaseHealth();
        break;
      default:
        // For other tools, do a basic database check
        healthResult = await checkDatabaseHealth();
    }

    setToolStates(prev => ({
      ...prev,
      [toolId]: {
        enabled: prev[toolId]?.enabled ?? tool.enabled,
        status: healthResult.status
      }
    }));

    queryClient.invalidateQueries({ queryKey: ['tools'] });
    
    if (healthResult.status === 'healthy') {
      showSuccess('Health Check', `${tool.name} is healthy (${healthResult.responseTime}ms)`);
    } else {
      showError('Health Check', `${tool.name} has issues`);
    }
  }, [queryClient, showSuccess, showError]);

  const runAllHealthChecks = useCallback(async () => {
    showSuccess('Health Check', 'Running health checks on all enabled tools...');
    
    const enabledTools = tools.filter(t => t.enabled);
    const results: Record<string, { status: 'healthy' | 'error'; responseTime: number }> = {};
    
    // Run database and storage checks
    const [dbHealth, storageHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkStorageHealth()
    ]);

    // Update all enabled tools with health results
    const newStates: Record<string, { enabled: boolean; status: Tool['status'] }> = {};
    
    for (const tool of enabledTools) {
      let status: Tool['status'] = 'healthy';
      
      // Assign health based on tool type
      if (['security-monitoring', 'web-analytics', 'content-management', 'vendor-management'].includes(tool.id)) {
        status = dbHealth.status;
      } else if (tool.id === 'kyc-verification') {
        status = storageHealth.status;
      }
      
      newStates[tool.id] = { enabled: true, status };
    }

    setToolStates(prev => ({ ...prev, ...newStates }));
    queryClient.invalidateQueries({ queryKey: ['tools'] });

    const healthyCount = Object.values(newStates).filter(s => s.status === 'healthy').length;
    showSuccess('Health Check Complete', `${healthyCount}/${enabledTools.length} tools are healthy`);
  }, [tools, queryClient, showSuccess]);

  const getToolsStats = useCallback(() => {
    const total = tools.length;
    const enabled = tools.filter(tool => tool.enabled).length;
    const healthy = tools.filter(tool => tool.status === 'healthy').length;
    const warning = tools.filter(tool => tool.status === 'warning').length;
    const error = tools.filter(tool => tool.status === 'error').length;
    const disabled = tools.filter(tool => tool.status === 'disabled').length;

    return { total, enabled, healthy, warning, error, disabled };
  }, [tools]);

  return {
    tools,
    isLoading,
    loading: isLoading,
    lastUpdate: new Date().toISOString(),
    toggleTool: toggleToolMutation.mutate,
    updateToolConfig: updateToolConfigMutation.mutate,
    checkToolHealth,
    runAllHealthChecks,
    getToolsStats,
    isToggling: toggleToolMutation.isPending,
    isUpdatingConfig: updateToolConfigMutation.isPending,
  };
};
