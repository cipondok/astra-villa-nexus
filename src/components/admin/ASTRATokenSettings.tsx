
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Coins, 
  CheckCircle, 
  AlertTriangle, 
  Save,
  TestTube,
  Key,
  Globe,
  Shield
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';

interface ASTRASettings {
  apiKey: string;
  baseUrl: string;
  isEnabled: boolean;
  testMode: boolean;
  webhookUrl: string;
  tokenSymbol: string;
  defaultGasLimit: string;
  networkId: string;
}

const ASTRATokenSettings = () => {
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState<ASTRASettings>({
    apiKey: '',
    baseUrl: 'https://api.astra-token.com',
    isEnabled: false,
    testMode: true,
    webhookUrl: '',
    tokenSymbol: 'ASTRA',
    defaultGasLimit: '21000',
    networkId: '1'
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'astra_api');

      if (error) {
        console.error('Error loading ASTRA settings:', error);
        return;
      }

      if (data && data.length > 0) {
        const settingsMap = data.reduce((acc, setting) => {
          const key = setting.key.replace('astra_api_', '');
          acc[key] = setting.value;
          return acc;
        }, {} as any);

        setSettings(prev => ({
          ...prev,
          ...settingsMap,
          isEnabled: settingsMap.isEnabled === 'true',
          testMode: settingsMap.testMode === 'true'
        }));

        // Check connection status if enabled
        if (settingsMap.isEnabled === 'true' && settingsMap.apiKey && settingsMap.baseUrl) {
          testConnection(settingsMap);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('Settings Error', 'Failed to load ASTRA token settings');
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const settingsToSave = [
        { key: 'astra_api_apiKey', value: settings.apiKey, category: 'astra_api' },
        { key: 'astra_api_baseUrl', value: settings.baseUrl, category: 'astra_api' },
        { key: 'astra_api_isEnabled', value: settings.isEnabled.toString(), category: 'astra_api' },
        { key: 'astra_api_testMode', value: settings.testMode.toString(), category: 'astra_api' },
        { key: 'astra_api_webhookUrl', value: settings.webhookUrl, category: 'astra_api' },
        { key: 'astra_api_tokenSymbol', value: settings.tokenSymbol, category: 'astra_api' },
        { key: 'astra_api_defaultGasLimit', value: settings.defaultGasLimit, category: 'astra_api' },
        { key: 'astra_api_networkId', value: settings.networkId, category: 'astra_api' }
      ];

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('system_settings')
          .upsert(setting, { onConflict: 'key' });

        if (error) {
          throw error;
        }
      }

      showSuccess('Settings Saved', 'ASTRA token settings have been saved successfully');
      
      // Test connection if enabled
      if (settings.isEnabled && settings.apiKey && settings.baseUrl) {
        await testConnection(settings);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showError('Save Error', 'Failed to save ASTRA token settings');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (testSettings?: ASTRASettings) => {
    const settingsToTest = testSettings || settings;
    setTesting(true);
    setConnectionStatus('testing');

    try {
      const response = await fetch(`${settingsToTest.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'x-api-key': settingsToTest.apiKey,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (response.ok) {
        setConnectionStatus('connected');
        showSuccess('Connection Test', 'ASTRA Token API connection successful');
      } else {
        setConnectionStatus('disconnected');
        showError('Connection Test', `API returned status: ${response.status}`);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('disconnected');
      showError('Connection Test', 'Failed to connect to ASTRA Token API');
    } finally {
      setTesting(false);
    }
  };

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'testing':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <TestTube className="h-3 w-3 mr-1" />
            Testing...
          </Badge>
        );
      case 'disconnected':
      default:
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">ASTRA Token Settings</h2>
          <p className="text-gray-400">Configure ASTRA token API and blockchain settings</p>
        </div>
        <div className="flex items-center space-x-2">
          {getConnectionBadge()}
          <Button
            onClick={() => testConnection()}
            disabled={testing || !settings.apiKey || !settings.baseUrl}
            variant="outline"
            size="sm"
          >
            <TestTube className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
            Test Connection
          </Button>
        </div>
      </div>

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain Settings</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks & Events</TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Key className="h-5 w-5 mr-2" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.isEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isEnabled: checked }))}
                />
                <Label className="text-white">Enable ASTRA Token API</Label>
              </div>

              <div className="space-y-2">
                <Label className="text-white">API Key</Label>
                <Input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your ASTRA API key"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Base URL</Label>
                <Input
                  value={settings.baseUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://api.astra-token.com"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.testMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, testMode: checked }))}
                />
                <Label className="text-white">Test Mode (Sandbox)</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Coins className="h-5 w-5 mr-2" />
                Blockchain Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Token Symbol</Label>
                <Input
                  value={settings.tokenSymbol}
                  onChange={(e) => setSettings(prev => ({ ...prev, tokenSymbol: e.target.value }))}
                  placeholder="ASTRA"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Network ID</Label>
                <Input
                  value={settings.networkId}
                  onChange={(e) => setSettings(prev => ({ ...prev, networkId: e.target.value }))}
                  placeholder="1 (Ethereum Mainnet)"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-white">Default Gas Limit</Label>
                <Input
                  value={settings.defaultGasLimit}
                  onChange={(e) => setSettings(prev => ({ ...prev, defaultGasLimit: e.target.value }))}
                  placeholder="21000"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Webhooks & Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Webhook URL</Label>
                <Input
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://yoursite.com/api/webhooks/astra"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <p className="text-xs text-gray-400">
                  URL to receive webhook notifications for token events
                </p>
              </div>

              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Webhooks will be sent for token transfers, balance changes, and transaction confirmations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={saveSettings}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default ASTRATokenSettings;
