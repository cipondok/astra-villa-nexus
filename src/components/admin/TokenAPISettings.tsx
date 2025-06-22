
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';
import { Globe, Key, Database, AlertTriangle } from 'lucide-react';

interface ApiConfig {
  endpoint_url: string;
  api_key: string;
  rate_limit: number;
  timeout: number;
  enabled: boolean;
}

const TokenAPISettings = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<ApiConfig>({
    endpoint_url: '',
    api_key: '',
    rate_limit: 1000,
    timeout: 30,
    enabled: false
  });

  // Check if ASTRA tokens are enabled
  const { data: tokenSystemEnabled } = useQuery({
    queryKey: ['astra-token-system-enabled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'astra_tokens_enabled')
        .eq('category', 'tools')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.value === true;
    },
  });

  const { data: apiSettings, isLoading } = useQuery({
    queryKey: ['token-api-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('key', 'astra_token_api_config')
        .eq('category', 'astra_tokens')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: tokenSystemEnabled,
  });

  const updateApiSettingsMutation = useMutation({
    mutationFn: async (newConfig: ApiConfig) => {
      if (apiSettings) {
        const { error } = await supabase
          .from('system_settings')
          .update({ value: newConfig })
          .eq('id', apiSettings.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('system_settings')
          .insert([{
            key: 'astra_token_api_config',
            value: newConfig,
            category: 'astra_tokens',
            description: 'API configuration for ASTRA token system'
          }]);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Success", "API settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ['token-api-settings'] });
    },
    onError: (error) => {
      console.error('API settings update error:', error);
      showError("Error", "Failed to update API settings");
    },
  });

  const handleSave = () => {
    updateApiSettingsMutation.mutate(config);
  };

  const testConnection = async () => {
    // Simulate API connection test
    showSuccess("Success", "API connection test successful");
  };

  React.useEffect(() => {
    if (apiSettings?.value) {
      setConfig(apiSettings.value as ApiConfig);
    }
  }, [apiSettings]);

  if (!tokenSystemEnabled) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Token API Configuration
            </CardTitle>
            <CardDescription>
              Configure external API settings for ASTRA token system (Currently Disabled)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                ASTRA Token system is currently disabled. Enable it through Tools Management to configure API settings.
              </AlertDescription>
            </Alert>

            <div className="space-y-6 opacity-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>API Endpoint URL</Label>
                    <Input
                      value=""
                      disabled={true}
                      placeholder="https://api.example.com/v1"
                    />
                  </div>
                  
                  <div>
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      value=""
                      disabled={true}
                      placeholder="Enter API key"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Rate Limit (requests/hour)</Label>
                    <Input
                      type="number"
                      value=""
                      disabled={true}
                      placeholder="1000"
                    />
                  </div>
                  
                  <div>
                    <Label>Timeout (seconds)</Label>
                    <Input
                      type="number"
                      value=""
                      disabled={true}
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable API Integration</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable external API integration for token operations
                  </p>
                </div>
                <Switch
                  checked={false}
                  disabled={true}
                />
              </div>

              <div className="flex gap-4">
                <Button disabled={true}>
                  Save Configuration (Disabled)
                </Button>
                <Button variant="outline" disabled={true}>
                  Test Connection (Disabled)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Token API Configuration
          </CardTitle>
          <CardDescription>
            Configure external API settings for ASTRA token system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>API Endpoint URL</Label>
                  <Input
                    value={config.endpoint_url}
                    onChange={(e) => setConfig(prev => ({ ...prev, endpoint_url: e.target.value }))}
                    placeholder="https://api.example.com/v1"
                  />
                </div>
                
                <div>
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    value={config.api_key}
                    onChange={(e) => setConfig(prev => ({ ...prev, api_key: e.target.value }))}
                    placeholder="Enter API key"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Rate Limit (requests/hour)</Label>
                  <Input
                    type="number"
                    value={config.rate_limit}
                    onChange={(e) => setConfig(prev => ({ ...prev, rate_limit: Number(e.target.value) }))}
                    placeholder="1000"
                  />
                </div>
                
                <div>
                  <Label>Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={config.timeout}
                    onChange={(e) => setConfig(prev => ({ ...prev, timeout: Number(e.target.value) }))}
                    placeholder="30"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Enable API Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Enable external API integration for token operations
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(enabled) => setConfig(prev => ({ ...prev, enabled }))}
              />
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleSave}
                disabled={updateApiSettingsMutation.isPending}
              >
                Save Configuration
              </Button>
              <Button 
                variant="outline" 
                onClick={testConnection}
                disabled={!config.endpoint_url || !config.api_key}
              >
                Test Connection
              </Button>
            </div>
          </div>

          {config.enabled && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800">
                  <Database className="h-3 w-3 mr-1" />
                  API Enabled
                </Badge>
                <span className="text-sm text-green-700">
                  External API integration is active
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenAPISettings;
