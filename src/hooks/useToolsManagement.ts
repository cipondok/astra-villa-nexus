
import { useState, useEffect } from 'react';
import { Tool, ToolStatus } from '@/types/tools';
import { TOOLS_REGISTRY, getDependentTools } from '@/services/toolsRegistry';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useToolsManagement = () => {
  const [tools, setTools] = useState<Tool[]>(TOOLS_REGISTRY);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());

  // Load tool configurations from database
  const loadToolConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .like('key', 'tool_%');

      if (error) {
        console.error('Error loading tool configurations:', error);
        return;
      }

      if (data) {
        const updatedTools = tools.map(tool => {
          const config = data.find(setting => setting.key === `tool_${tool.id}`);
          if (config && config.value) {
            const toolConfig = JSON.parse(config.value);
            return {
              ...tool,
              enabled: toolConfig.enabled,
              status: toolConfig.enabled ? tool.status : 'disabled'
            };
          }
          return tool;
        });
        setTools(updatedTools);
      }
    } catch (error) {
      console.error('Error in loadToolConfigurations:', error);
    }
  };

  // Save tool configuration to database
  const saveToolConfiguration = async (toolId: string, enabled: boolean) => {
    try {
      const config = {
        enabled,
        updatedAt: new Date().toISOString(),
        updatedBy: 'admin'
      };

      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: `tool_${toolId}`,
          value: JSON.stringify(config),
          category: 'tools',
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error saving tool configuration:', error);
      return false;
    }
  };

  // Toggle tool enabled/disabled state
  const toggleTool = async (toolId: string) => {
    setLoading(true);
    try {
      const tool = tools.find(t => t.id === toolId);
      if (!tool) return false;

      const newEnabledState = !tool.enabled;

      // Check dependencies before disabling
      if (!newEnabledState) {
        const dependentTools = getDependentTools(toolId);
        const enabledDependents = dependentTools.filter(t => 
          tools.find(tool => tool.id === t.id)?.enabled
        );

        if (enabledDependents.length > 0) {
          toast.error(
            `Cannot disable ${tool.name}. The following tools depend on it: ${
              enabledDependents.map(t => t.name).join(', ')
            }`
          );
          return false;
        }
      }

      // Save to database
      const success = await saveToolConfiguration(toolId, newEnabledState);
      if (!success) {
        toast.error('Failed to update tool configuration');
        return false;
      }

      // Update local state
      setTools(prevTools => 
        prevTools.map(t => 
          t.id === toolId 
            ? { 
                ...t, 
                enabled: newEnabledState,
                status: newEnabledState ? 'healthy' : 'disabled',
                lastChecked: new Date().toISOString()
              }
            : t
        )
      );

      setLastUpdate(new Date().toISOString());
      toast.success(`${tool.name} ${newEnabledState ? 'enabled' : 'disabled'} successfully`);
      return true;

    } catch (error) {
      console.error('Error toggling tool:', error);
      toast.error('Failed to toggle tool');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check tool health status
  const checkToolHealth = async (toolId: string): Promise<ToolStatus> => {
    const tool = tools.find(t => t.id === toolId);
    if (!tool) {
      return {
        id: toolId,
        status: 'error',
        lastChecked: new Date().toISOString(),
        errorMessage: 'Tool not found'
      };
    }

    if (!tool.enabled) {
      return {
        id: toolId,
        status: 'disabled',
        lastChecked: new Date().toISOString()
      };
    }

    try {
      // Simulate health check - in real implementation, this would call actual endpoints
      const startTime = Date.now();
      
      // Mock health check logic
      const isHealthy = Math.random() > 0.1; // 90% success rate for demo
      const responseTime = Date.now() - startTime;

      const status: ToolStatus = {
        id: toolId,
        status: isHealthy ? 'healthy' : 'warning',
        lastChecked: new Date().toISOString(),
        responseTime,
        errorMessage: isHealthy ? undefined : 'Service experiencing high latency'
      };

      // Update tool status in local state
      setTools(prevTools =>
        prevTools.map(t =>
          t.id === toolId
            ? { ...t, status: status.status, lastChecked: status.lastChecked, errorMessage: status.errorMessage }
            : t
        )
      );

      return status;
    } catch (error) {
      const errorStatus: ToolStatus = {
        id: toolId,
        status: 'error',
        lastChecked: new Date().toISOString(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };

      setTools(prevTools =>
        prevTools.map(t =>
          t.id === toolId
            ? { ...t, status: 'error', lastChecked: errorStatus.lastChecked, errorMessage: errorStatus.errorMessage }
            : t
        )
      );

      return errorStatus;
    }
  };

  // Run health checks for all enabled tools
  const runAllHealthChecks = async () => {
    setLoading(true);
    try {
      const enabledTools = tools.filter(t => t.enabled);
      const healthPromises = enabledTools.map(t => checkToolHealth(t.id));
      await Promise.all(healthPromises);
      setLastUpdate(new Date().toISOString());
      toast.success('Health checks completed');
    } catch (error) {
      console.error('Error running health checks:', error);
      toast.error('Some health checks failed');
    } finally {
      setLoading(false);
    }
  };

  // Get tools statistics
  const getToolsStats = () => {
    const total = tools.length;
    const enabled = tools.filter(t => t.enabled).length;
    const healthy = tools.filter(t => t.status === 'healthy').length;
    const warning = tools.filter(t => t.status === 'warning').length;
    const error = tools.filter(t => t.status === 'error').length;
    const disabled = tools.filter(t => t.status === 'disabled').length;

    return { total, enabled, healthy, warning, error, disabled };
  };

  useEffect(() => {
    loadToolConfigurations();
  }, []);

  return {
    tools,
    loading,
    lastUpdate,
    toggleTool,
    checkToolHealth,
    runAllHealthChecks,
    getToolsStats,
    loadToolConfigurations
  };
};
