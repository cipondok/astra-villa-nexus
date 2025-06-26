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
      console.log('Loading API configuration...');
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'astra_api');
      
      if (error) {
        console.error('Error loading API config:', error);
        showError('Database Error', `Failed to load configuration: ${error.message}`);
        return;
      }

      console.log('Loaded settings data:', data);

      if (data && data.length > 0) {
        const settings = data.reduce((acc, setting) => {
          const key = setting.key.replace('astra_api_', '');
          let value = setting.value;
          
          // Handle different data types properly
          if (typeof value === 'string') {
            if (key === 'isEnabled') {
              value = value === 'true';
            } else if (key === 'timeout' || key === 'retryAttempts') {
              value = parseInt(value);
            }
          }
          
          acc[key] = value;
          return acc;
        }, {} as any);
        
        console.log('Processed settings:', settings);
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
      
      // Validate required fields
      if (!config.apiKey || !config.baseUrl) {
        showError('Validation Error', 'API key and base URL are required');
        return;
      }
      
      // Save each config item as a separate row in system_settings
      const savePromises = Object.entries(config).map(async ([key, value]) => {
        console.log(`Saving ${key}:`, value, 'type:', typeof value);
        
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
            onConflict: 'key'
          });
        
        if (error) {
          console.error(`Error saving ${key}:`, error);
          throw new Error(`Failed to save ${key}: ${error.message}`);
        }
      });

      await Promise.all(savePromises);
      showSuccess('Settings Saved', 'ASTRA API configuration updated successfully');
      console.log('API configuration saved successfully');
    } catch (error: any) {
      console.error('Error saving API config:', error);
      showError('Save Error', `Failed to save API configuration: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const isValidAPIKey = (key: string): boolean => {
    return key.startsWith('astra_') && key.length > 10;
  };

  const testAPIConnection = async () => {
    if (!config.apiKey) {
      showError('Missing API Key', 'Please enter your API key before testing');
      return;
    }

    if (!isValidAPIKey(config.apiKey)) {
      showError('Invalid API Key', 'API key must start with "astra_" and be valid format');
      return;
    }

    setTesting(true);
    setConnectionStatus('testing');
    setTestResults(null);
    
    try {
      console.log('Testing ASTRA API connection...');
      console.log('Base URL:', config.baseUrl);
      console.log('API Key prefix:', config.apiKey.substring(0, 10) + '...');

      // Method 1: x-api-key header (Primary method)
      console.log('Trying x-api-key header method...');
      const response1 = await fetch(`${config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'x-api-key': config.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(config.timeout)
      });

      console.log('x-api-key Response status:', response1.status);
      console.log('x-api-key Response headers:', Object.fromEntries(response1.headers.entries()));

      if (response1.ok) {
        const data = await response1.json();
        console.log('x-api-key Success response:', data);
        setConnectionStatus('connected');
        setTestResults({
          status: 'success',
          method: 'x-api-key header',
          statusCode: response1.status,
          data: data,
          message: 'API connection successful using x-api-key header'
        });
        showSuccess('Connection Test', 'ASTRA API connection successful using x-api-key header');
        return;
      }

      const errorText1 = await response1.text();
      console.log('x-api-key Error response:', errorText1);

      // Method 2: Authorization header with API key
      console.log('Trying Authorization header method...');
      const response2 = await fetch(`${config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': config.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(config.timeout)
      });

      console.log('Authorization Response status:', response2.status);
      console.log('Authorization Response headers:', Object.fromEntries(response2.headers.entries()));

      if (response2.ok) {
        const data = await response2.json();
        console.log('Authorization Success response:', data);
        setConnectionStatus('connected');
        setTestResults({
          status: 'success',
          method: 'Authorization header',
          statusCode: response2.status,
          data: data,
          message: 'API connection successful using Authorization header'
        });
        showSuccess('Connection Test', 'ASTRA API connection successful using Authorization header');
        return;
      }

      const errorText2 = await response2.text();
      console.log('Authorization Error response:', errorText2);

      // Method 3: Try with Bearer format (some APIs require this)
      console.log('Trying Bearer token method...');
      const response3 = await fetch(`${config.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(config.timeout)
      });

      console.log('Bearer Response status:', response3.status);

      if (response3.ok) {
        const data = await response3.json();
        console.log('Bearer Success response:', data);
        setConnectionStatus('connected');
        setTestResults({
          status: 'success',
          method: 'Bearer token',
          statusCode: response3.status,
          data: data,
          message: 'API connection successful using Bearer token'
        });
        showSuccess('Connection Test', 'ASTRA API connection successful using Bearer token');
        return;
      }

      const errorText3 = await response3.text();
      console.log('Bearer Error response:', errorText3);

      // All methods failed
      setConnectionStatus('disconnected');
      setTestResults({
        status: 'error',
        attempts: [
          { method: 'x-api-key', status: response1.status, error: errorText1 },
          { method: 'Authorization', status: response2.status, error: errorText2 },
          { method: 'Bearer', status: response3.status, error: errorText3 }
        ],
        message: 'All authentication methods failed',
        suggestion: 'Please verify your API key is correct and contact ASTRA support if the issue persists.'
      });

      showError('Connection Test Failed', 'All authentication methods failed. Please check your API key.');

    } catch (error: any) {
      console.error('API Connection Error:', error);
      setConnectionStatus('disconnected');
      setTestResults({
        status: 'error',
        message: error.message || 'Connection failed',
        error: error,
        suggestion: 'Check your network connection and API endpoint URL.'
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
                    <p className="text-xs text-gray-500">Supports multiple auth methods: x-api-key, Authorization, Bearer token</p>
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
                    <pre className="text-xs text-white overflow-auto whitespace-pre-wrap">
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
