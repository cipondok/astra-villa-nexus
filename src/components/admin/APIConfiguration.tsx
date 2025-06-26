import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Globe, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';

interface APIConfig {
  baseUrl: string;
  apiKey: string;
  isEnabled: boolean;
  timeout: number;
  retryAttempts: number;
  description: string;
}

const APIConfiguration = () => {
  const { showSuccess, showError } = useAlert();
  const [config, setConfig] = useState<APIConfig>({
    baseUrl: 'https://cerdnikfqijyqugguryx.supabase.co/functions/v1/astra-api',
    apiKey: '',
    isEnabled: true,
    timeout: 30000,
    retryAttempts: 3,
    description: 'ASTRA Token API for property transactions and user management'
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing' | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  useEffect(() => {
    loadAPIConfig();
  }, []);

  const loadAPIConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'astra_api');
      
      if (error) {
        console.error('Error loading API config:', error);
        return;
      }

      if (data && data.length > 0) {
        const settings = data.reduce((acc, setting) => {
          // Remove the 'astra_api_' prefix from the key to match our config object
          const key = setting.key.replace('astra_api_', '');
          // Parse the value based on the key type
          let value = setting.value;
          
          // Handle different data types properly
          if (typeof value === 'string') {
            if (key === 'isEnabled') {
              value = value === 'true';
            } else if (key === 'timeout' || key === 'retryAttempts') {
              value = parseInt(value);
            }
          } else if (typeof value === 'object' && value !== null) {
            // If value is stored as JSON, extract the actual value
            value = value;
          }
          
          acc[key] = value;
          return acc;
        }, {} as any);
        
        setConfig(prev => ({ ...prev, ...settings }));
      }
    } catch (error) {
      console.error('Error loading API config:', error);
      showError('Error', 'Failed to load API configuration');
    }
  };

  const saveAPIConfig = async () => {
    setLoading(true);
    try {
      console.log('Saving API config:', config);
      
      // Save each config item as a separate row in system_settings
      for (const [key, value] of Object.entries(config)) {
        console.log(`Saving ${key}:`, value, 'type:', typeof value);
        
        // Convert value to appropriate format for storage
        let storedValue = value;
        if (typeof value === 'boolean') {
          storedValue = value.toString();
        } else if (typeof value === 'number') {
          storedValue = value.toString();
        }
        
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key: `astra_api_${key}`,
            value: storedValue,
            category: 'astra_api',
            description: `ASTRA API ${key} setting`
          }, {
            onConflict: 'key,category'
          });
        
        if (error) {
          console.error(`Error saving ${key}:`, error);
          throw error;
        }
      }

      showSuccess('Settings Saved', 'ASTRA API configuration updated successfully');
      console.log('API configuration saved successfully');
    } catch (error: any) {
      console.error('Error saving API config:', error);
      showError('Error', `Failed to save API configuration: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const isValidAPIKey = (key: string): boolean => {
    return key.startsWith('astra_') && key.length > 10;
  };

  const testAPIConnection = async () => {
    setTesting(true);
    setConnectionStatus('testing');
    
    try {
      if (!isValidAPIKey(config.apiKey)) {
        throw new Error('Invalid API key format. API keys should start with "astra_" (e.g., astra_your_actual_api_key_here)');
      }

      console.log('Testing API connection with key:', config.apiKey.substring(0, 10) + '...');

      // Try authentication methods as specified in integration instructions
      const authMethods = [
        // Method 1: x-api-key header (recommended)
        {
          name: 'x-api-key (recommended)',
          headers: {
            'x-api-key': config.apiKey,
            'Content-Type': 'application/json'
          }
        },
        // Method 2: Authorization header with Bearer token format
        {
          name: 'Authorization with Bearer token',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      ];

      let lastError = null;
      
      for (const method of authMethods) {
        try {
          console.log(`Trying authentication method: ${method.name}`);
          
          const response = await fetch(`${config.baseUrl}/health`, {
            method: 'GET',
            headers: method.headers,
            signal: AbortSignal.timeout(config.timeout)
          });

          console.log(`${method.name} - Status:`, response.status);
          console.log(`${method.name} - Headers:`, Object.fromEntries(response.headers.entries()));

          if (response.ok) {
            const data = await response.json();
            setConnectionStatus('connected');
            setTestResults({
              status: 'success',
              message: `API connection successful using ${method.name}`,
              method: method.name,
              data: data
            });
            showSuccess('Connection Test', `ASTRA API connection successful using ${method.name}`);
            return; // Exit on first successful method
          } else {
            const errorText = await response.text();
            console.log(`${method.name} - Error Response:`, errorText);
            lastError = new Error(`${method.name}: HTTP ${response.status}: ${errorText || response.statusText}`);
          }
        } catch (error: any) {
          console.error(`${method.name} failed:`, error);
          lastError = error;
        }
      }

      // If we get here, all methods failed
      throw lastError || new Error('All authentication methods failed');

    } catch (error: any) {
      console.error('API Connection Error:', error);
      setConnectionStatus('disconnected');
      setTestResults({
        status: 'error',
        message: error.message || 'Connection failed',
        error: error,
        suggestion: 'Please check your API key format and ensure it\'s valid. Contact ASTRA support if the issue persists.'
      });
      showError('Connection Test Failed', error.message || 'Failed to connect to ASTRA API');
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showSuccess('Copied', 'Copied to clipboard');
  };

  const handleInputChange = (key: keyof APIConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">ASTRA Token API Configuration</h2>
          <p className="text-gray-400">Configure your ASTRA Token API settings for property transactions</p>
        </div>
        <div className="flex items-center space-x-2">
          {connectionStatus && (
            <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
              {connectionStatus === 'connected' ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : connectionStatus === 'testing' ? (
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <XCircle className="h-3 w-3 mr-1" />
              )}
              {connectionStatus === 'connected' ? 'Connected' : 
               connectionStatus === 'testing' ? 'Testing' : 'Disconnected'}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="configuration" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Settings className="h-5 w-5 mr-2" />
                API Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">Base URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={config.baseUrl}
                      onChange={(e) => handleInputChange('baseUrl', e.target.value)}
                      placeholder="https://your-api.com/v1"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(config.baseUrl)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={config.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      placeholder="astra_your_actual_api_key_here"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">API key should start with "astra_"</p>
                    <p className="text-xs text-gray-500">Primary: x-api-key header | Alternative: Authorization: Bearer &#123;token&#125;</p>
                    {config.apiKey && !isValidAPIKey(config.apiKey) && (
                      <p className="text-xs text-red-400 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Invalid API key format
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Timeout (ms)</Label>
                  <Input
                    type="number"
                    value={config.timeout}
                    onChange={(e) => handleInputChange('timeout', parseInt(e.target.value))}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Retry Attempts</Label>
                  <Input
                    type="number"
                    value={config.retryAttempts}
                    onChange={(e) => handleInputChange('retryAttempts', parseInt(e.target.value))}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Description</Label>
                <Textarea
                  value={config.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe this API configuration"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.isEnabled}
                  onCheckedChange={(checked) => handleInputChange('isEnabled', checked)}
                />
                <Label className="text-white">Enable API</Label>
              </div>

              <div className="flex space-x-2">
                <Button onClick={saveAPIConfig} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Configuration'}
                </Button>
                <Button variant="outline" onClick={testAPIConnection} disabled={testing}>
                  {testing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Globe className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Available Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-green-400">GET /health</span>
                    <Badge variant="outline">Health Check</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Check API connectivity and status</p>
                </div>

                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-green-400">GET /users</span>
                    <Badge variant="outline">User Profile</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Get user profile and balance</p>
                  <code className="text-xs text-gray-500">?userId=user_uuid</code>
                </div>

                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-blue-400">POST /users</span>
                    <Badge variant="outline">Create User</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Create new user account</p>
                </div>

                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-blue-400">POST /transactions</span>
                    <Badge variant="outline">Process Payment</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Process property purchase</p>
                </div>

                <div className="p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-green-400">GET /properties</span>
                    <Badge variant="outline">Properties</Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">Get available properties</p>
                  <code className="text-xs text-gray-500">?limit=20 or ?propertyId=uuid</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">API Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testAPIConnection} 
                disabled={testing || !config.apiKey}
                className="w-full"
              >
                {testing ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Globe className="h-4 w-4 mr-2" />
                )}
                Test API Connection
              </Button>

              {!config.apiKey && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please enter your API key in the Configuration tab before testing.
                  </AlertDescription>
                </Alert>
              )}

              {testResults && (
                <div className="space-y-2">
                  <Label className="text-white">Test Results</Label>
                  <div className={`p-3 rounded-lg ${
                    testResults.status === 'success' 
                      ? 'bg-green-900/20 border border-green-500/30' 
                      : 'bg-red-900/20 border border-red-500/30'
                  }`}>
                    <pre className="text-xs text-white overflow-auto">
                      {JSON.stringify(testResults, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default APIConfiguration;
