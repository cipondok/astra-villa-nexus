
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
    if (loading) return; // Prevent double submissions
    
    setLoading(true);
    try {
      console.log('🔄 Starting save process...');
      console.log('Current config:', config);
      
      // Validate required fields
      if (!config.apiKey || !config.baseUrl) {
        showError('Validation Error', 'API key and base URL are required');
        return;
      }
      
      // First, delete existing settings to avoid conflicts
      console.log('🗑️ Clearing existing settings...');
      await supabase
        .from('system_settings')
        .delete()
        .eq('category', 'astra_api');

      // Prepare the settings for insert
      const settingsToSave = [
        {
          key: 'astra_api_baseUrl',
          value: config.baseUrl,
          category: 'astra_api',
          description: 'ASTRA API baseUrl setting',
          is_public: false
        },
        {
          key: 'astra_api_apiKey',
          value: config.apiKey,
          category: 'astra_api',
          description: 'ASTRA API apiKey setting',
          is_public: false
        },
        {
          key: 'astra_api_isEnabled',
          value: config.isEnabled.toString(),
          category: 'astra_api',
          description: 'ASTRA API isEnabled setting',
          is_public: false
        },
        {
          key: 'astra_api_timeout',
          value: config.timeout.toString(),
          category: 'astra_api',
          description: 'ASTRA API timeout setting',
          is_public: false
        },
        {
          key: 'astra_api_retryAttempts',
          value: config.retryAttempts.toString(),
          category: 'astra_api',
          description: 'ASTRA API retryAttempts setting',
          is_public: false
        },
        {
          key: 'astra_api_description',
          value: config.description,
          category: 'astra_api',
          description: 'ASTRA API description setting',
          is_public: false
        }
      ];

      console.log('💾 Inserting new settings:', settingsToSave);

      // Insert all settings
      const { error: insertError } = await supabase
        .from('system_settings')
        .insert(settingsToSave);

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        throw new Error(`Failed to save settings: ${insertError.message}`);
      }

      console.log('✅ Settings saved successfully');
      showSuccess('Configuration Saved', 'ASTRA API configuration has been saved successfully');
      
      // Reload to confirm save
      await loadAPIConfig();
      
    } catch (error: any) {
      console.error('❌ Save error:', error);
      showError('Save Failed', `Could not save configuration: ${error.message || 'Unknown error'}`);
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

    setTesting(true);
    setConnectionStatus('testing');
    setTestResults(null);
    
    try {
      console.log('🧪 Testing ASTRA API connection...');
      console.log('📍 Base URL:', config.baseUrl);
      console.log('🔑 API Key (masked):', config.apiKey.substring(0, 15) + '...');

      const testUrl = `${config.baseUrl}/health`;
      
      // Try different authentication methods
      const authMethods = [
        {
          name: 'Supabase Auth Token',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
            'x-api-key': config.apiKey
          }
        },
        {
          name: 'API Key Only',
          headers: {
            'x-api-key': config.apiKey,
            'Content-Type': 'application/json'
          }
        },
        {
          name: 'Bearer API Key',
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      ];

      for (const method of authMethods) {
        try {
          console.log(`🔄 Trying ${method.name}...`);
          
          const response = await fetch(testUrl, {
            method: 'GET',
            headers: method.headers,
            signal: AbortSignal.timeout(config.timeout)
          });

          console.log(`📊 ${method.name} Response:`, {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries())
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${method.name} Success:`, data);
            
            setConnectionStatus('connected');
            setTestResults({
              status: 'success',
              method: method.name,
              statusCode: response.status,
              data: data,
              message: `API connection successful using ${method.name}`
            });
            
            showSuccess('Connection Test Passed', `ASTRA API is working with ${method.name}`);
            return;
          } else {
            const errorText = await response.text();
            console.log(`❌ ${method.name} Failed:`, errorText);
          }
        } catch (methodError) {
          console.log(`❌ ${method.name} Error:`, methodError);
        }
      }

      // All methods failed
      setConnectionStatus('disconnected');
      setTestResults({
        status: 'error',
        message: 'All authentication methods failed',
        suggestion: 'Please verify your API key is correct and the endpoint is accessible. The API key format should be "astra_xxxxxxxxxx".'
      });

      showError('Connection Test Failed', 'All authentication methods failed. Please verify your API key and endpoint.');

    } catch (error: any) {
      console.error('🚨 Connection test error:', error);
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
                    <p className="text-xs text-gray-500">Current key: {config.apiKey ? config.apiKey.substring(0, 15) + '...' : 'Not set'}</p>
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
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Configuration'
                  )}
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
