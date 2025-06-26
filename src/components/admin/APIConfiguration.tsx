
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
      
      if (error) throw error;

      if (data && data.length > 0) {
        const settings = data.reduce((acc, setting) => {
          // Remove the 'astra_api_' prefix from the key to match our config object
          const key = setting.key.replace('astra_api_', '');
          // Parse the value based on the key type
          let value = setting.value;
          if (key === 'isEnabled') {
            value = value === 'true' || value === true;
          } else if (key === 'timeout' || key === 'retryAttempts') {
            // Convert to string first, then parse to integer
            value = parseInt(String(value));
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
      // Save each config item as a separate row in system_settings
      for (const [key, value] of Object.entries(config)) {
        const { error } = await supabase
          .from('system_settings')
          .upsert({
            key: `astra_api_${key}`,
            value: String(value),
            category: 'astra_api',
            description: `ASTRA API ${key} setting`
          });
        
        if (error) throw error;
      }

      showSuccess('Settings Saved', 'ASTRA API configuration updated successfully');
    } catch (error) {
      console.error('Error saving API config:', error);
      showError('Error', 'Failed to save API configuration');
    } finally {
      setLoading(false);
    }
  };

  const isValidJWT = (token: string): boolean => {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    return parts.length === 3 && parts.every(part => part.length > 0);
  };

  const testAPIConnection = async () => {
    setTesting(true);
    setConnectionStatus('testing');
    
    try {
      // Validate JWT format first
      if (!isValidJWT(config.apiKey)) {
        throw new Error('Invalid JWT token format. JWT tokens should have 3 parts separated by dots (e.g., eyJ0eXAiOiJKV1QiLCJhb...)');
      }

      // Test the API connection with proper Authorization header (Bearer token format)
      const response = await fetch(`${config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(config.timeout)
      });

      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const data = await response.json();
        setConnectionStatus('connected');
        setTestResults({
          status: 'success',
          message: 'API connection successful',
          data: data
        });
        showSuccess('Connection Test', 'ASTRA API connection successful');
      } else {
        const errorText = await response.text();
        console.log('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }
    } catch (error: any) {
      console.error('API Connection Error:', error);
      setConnectionStatus('disconnected');
      setTestResults({
        status: 'error',
        message: error.message || 'Connection failed',
        error: error
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
                  <Label className="text-white">JWT Token</Label>
                  <div className="flex space-x-2">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={config.apiKey}
                      onChange={(e) => handleInputChange('apiKey', e.target.value)}
                      placeholder="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
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
                    <p className="text-xs text-gray-400">Valid JWT token required (3 parts separated by dots)</p>
                    {config.apiKey && !isValidJWT(config.apiKey) && (
                      <p className="text-xs text-red-400 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Invalid JWT format
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
