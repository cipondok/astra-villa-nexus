
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
  Coins, 
  CheckCircle, 
  AlertTriangle, 
  Save,
  TestTube,
  Key,
  Globe,
  Shield,
  RefreshCw
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';

interface ASTRASettings {
  apiKey: string;
  baseUrl: string;
  isEnabled: boolean;
  testMode: boolean;
  webhookUrl: string;
}

const ASTRATokenSettings = () => {
  const { showSuccess, showError } = useAlert();
  const [settings, setSettings] = useState<ASTRASettings>({
    apiKey: '',
    baseUrl: 'https://api.astra-token.com',
    isEnabled: false,
    testMode: true,
    webhookUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  const [lastTestResult, setLastTestResult] = useState<string>('');

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

        if (settingsMap.isEnabled === 'true' && settingsMap.apiKey && settingsMap.baseUrl) {
          setTimeout(() => testConnection(settingsMap), 1000);
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
        { key: 'astra_api_apiKey', value: settings.apiKey, category: 'astra_api', description: 'ASTRA API Key' },
        { key: 'astra_api_baseUrl', value: settings.baseUrl, category: 'astra_api', description: 'ASTRA API Base URL' },
        { key: 'astra_api_isEnabled', value: settings.isEnabled.toString(), category: 'astra_api', description: 'ASTRA API Enabled Status' },
        { key: 'astra_api_testMode', value: settings.testMode.toString(), category: 'astra_api', description: 'ASTRA API Test Mode' },
        { key: 'astra_api_webhookUrl', value: settings.webhookUrl, category: 'astra_api', description: 'ASTRA API Webhook URL' }
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
      
      if (settings.isEnabled && settings.apiKey && settings.baseUrl) {
        setTimeout(() => testConnection(settings), 500);
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
    
    if (!settingsToTest.apiKey || !settingsToTest.baseUrl) {
      setConnectionStatus('disconnected');
      setLastTestResult('API Key and Base URL are required');
      showError('Test Failed', 'Please provide API Key and Base URL before testing');
      return;
    }

    setTesting(true);
    setConnectionStatus('testing');
    setLastTestResult('Testing connection...');

    try {
      const testUrl = settingsToTest.testMode 
        ? `${settingsToTest.baseUrl}/test/health` 
        : `${settingsToTest.baseUrl}/health`;

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'x-api-key': settingsToTest.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(15000)
      });

      if (response.ok) {
        setConnectionStatus('connected');
        setLastTestResult(`Connection successful! Response: ${response.status} ${response.statusText}`);
        showSuccess('Connection Test', 'ASTRA Token API connection successful');
      } else {
        setConnectionStatus('disconnected');
        const errorText = await response.text().catch(() => 'Unknown error');
        setLastTestResult(`Connection failed: ${response.status} ${response.statusText} - ${errorText}`);
        showError('Connection Test', `API returned status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setConnectionStatus('disconnected');
      const errorMessage = error.name === 'AbortError' 
        ? 'Connection timeout (15s)' 
        : error.message || 'Unknown error';
      setLastTestResult(`Connection failed: ${errorMessage}`);
      showError('Connection Test', `Failed to connect: ${errorMessage}`);
    } finally {
      setTesting(false);
    }
  };

  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge className="bg-primary/20 text-primary border border-primary/30 text-[8px] h-4 px-1.5">
            <CheckCircle className="h-2.5 w-2.5 mr-1" />
            Connected
          </Badge>
        );
      case 'testing':
        return (
          <Badge className="bg-accent/20 text-accent border border-accent/30 text-[8px] h-4 px-1.5">
            <RefreshCw className="h-2.5 w-2.5 mr-1 animate-spin" />
            Testing...
          </Badge>
        );
      case 'disconnected':
      default:
        return (
          <Badge variant="destructive" className="text-[8px] h-4 px-1.5">
            <AlertTriangle className="h-2.5 w-2.5 mr-1" />
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Coins className="h-3.5 w-3.5 text-primary" />
            ASTRA Token Settings
          </h2>
          <p className="text-[10px] text-muted-foreground">Configure ASTRA token API settings and connection</p>
        </div>
        <div className="flex items-center gap-2">
          {getConnectionBadge()}
          <Button
            onClick={() => testConnection()}
            disabled={testing || !settings.apiKey || !settings.baseUrl}
            variant="outline"
            size="sm"
            className="h-6 text-[10px] px-2 bg-background/50 border-border/50"
          >
            <TestTube className={`h-3 w-3 mr-1 ${testing ? 'animate-spin' : ''}`} />
            Test API
          </Button>
        </div>
      </div>

      {/* Connection Status Alert */}
      {lastTestResult && (
        <Alert className={`py-2 ${connectionStatus === 'connected' ? 'bg-primary/10 border-primary/30' : 'bg-destructive/10 border-destructive/30'}`}>
          <AlertTriangle className="h-3 w-3" />
          <AlertDescription className="text-[10px]">
            <strong>Last Test:</strong> {lastTestResult}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="api" className="space-y-3">
        <TabsList className="grid w-full grid-cols-2 h-7 bg-muted/30">
          <TabsTrigger value="api" className="text-[10px] h-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            API Configuration
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="text-[10px] h-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Webhooks & Events
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api" className="space-y-3">
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Key className="h-3.5 w-3.5 text-primary" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                <Label className="text-[10px] text-muted-foreground">Enable ASTRA Token API</Label>
                <Switch
                  checked={settings.isEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isEnabled: checked }))}
                  className="scale-75"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">API Key *</Label>
                <Input
                  type="password"
                  value={settings.apiKey}
                  onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your ASTRA API key"
                  className="h-7 text-xs bg-background/50 border-border/50"
                />
                <p className="text-[8px] text-muted-foreground">
                  Required for API authentication. Keep this secure.
                </p>
              </div>

              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Base URL *</Label>
                <Input
                  value={settings.baseUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://api.astra-token.com"
                  className="h-7 text-xs bg-background/50 border-border/50"
                />
                <p className="text-[8px] text-muted-foreground">
                  The base URL for ASTRA API endpoints.
                </p>
              </div>

              <div className="flex items-center justify-between p-1.5 bg-muted/20 rounded border border-border/30">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Test Mode (Sandbox)</Label>
                  <p className="text-[8px] text-muted-foreground">Use test endpoints for safe testing</p>
                </div>
                <Switch
                  checked={settings.testMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, testMode: checked }))}
                  className="scale-75"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-3">
          <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 text-accent" />
                Webhooks & Events
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0 space-y-3">
              <div className="space-y-1">
                <Label className="text-[8px] font-medium uppercase tracking-wider text-muted-foreground">Webhook URL</Label>
                <Input
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://yoursite.com/api/webhooks/astra"
                  className="h-7 text-xs bg-background/50 border-border/50"
                />
                <p className="text-[8px] text-muted-foreground">
                  URL to receive webhook notifications for token events (optional)
                </p>
              </div>

              <Alert className="py-2 bg-muted/20 border-border/30">
                <Shield className="h-3 w-3" />
                <AlertDescription className="text-[10px] text-muted-foreground">
                  Webhooks will be sent for token transfers, balance changes, and transaction confirmations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end gap-2 pt-2">
        <Button
          onClick={() => testConnection()}
          disabled={testing || !settings.apiKey || !settings.baseUrl}
          variant="outline"
          size="sm"
          className="h-6 text-[10px] px-2 bg-background/50 border-border/50"
        >
          <TestTube className={`h-2.5 w-2.5 mr-1 ${testing ? 'animate-spin' : ''}`} />
          Test Connection
        </Button>
        <Button
          onClick={saveSettings}
          disabled={loading}
          size="sm"
          className="h-6 text-[10px] px-2"
        >
          <Save className={`h-2.5 w-2.5 mr-1 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
};

export default ASTRATokenSettings;
