
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Key, 
  Server, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface APISettings {
  base_url: string;
  api_key: string;
  timeout_seconds: number;
  rate_limit_per_hour: number;
  enabled: boolean;
  webhook_url?: string;
  webhook_secret?: string;
}

const TokenAPISettings = () => {
  const [settings, setSettings] = useState<APISettings>({
    base_url: 'https://cerdnikfqijyqugguryx.supabase.co/functions/v1/astra-api',
    api_key: '',
    timeout_seconds: 30,
    rate_limit_per_hour: 1000,
    enabled: true,
    webhook_url: '',
    webhook_secret: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');

  useEffect(() => {
    loadAPISettings();
  }, []);

  const loadAPISettings = async () => {
    try {
      const { data, error } = await supabase
        .from('astra_token_settings')
        .select('*')
        .eq('setting_key', 'api_configuration')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.setting_value) {
        const apiConfig = data.setting_value as any;
        setSettings({
          base_url: apiConfig.base_url || settings.base_url,
          api_key: apiConfig.api_key || '',
          timeout_seconds: apiConfig.timeout_seconds || 30,
          rate_limit_per_hour: apiConfig.rate_limit_per_hour || 1000,
          enabled: apiConfig.enabled !== false,
          webhook_url: apiConfig.webhook_url || '',
          webhook_secret: apiConfig.webhook_secret || ''
        });
      }
    } catch (error) {
      console.error('Error loading API settings:', error);
      toast.error('Failed to load API settings');
    } finally {
      setLoading(false);
    }
  };

  const saveAPISettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('astra_token_settings')
        .upsert({
          setting_key: 'api_configuration',
          setting_value: settings,
          description: 'ASTRA Token API configuration and settings'
        });

      if (error) throw error;

      toast.success('API settings saved successfully!');
      await testConnection();
    } catch (error) {
      console.error('Error saving API settings:', error);
      toast.error('Failed to save API settings');
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    try {
      setConnectionStatus('unknown');
      
      // Simple connection test to the API endpoint
      const response = await fetch(`${settings.base_url}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': settings.api_key || 'test-key'
        },
        signal: AbortSignal.timeout(settings.timeout_seconds * 1000)
      });

      if (response.ok) {
        setConnectionStatus('connected');
        toast.success('API connection successful!');
      } else {
        setConnectionStatus('error');
        toast.error(`API connection failed: ${response.status}`);
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.error('API connection test failed');
    }
  };

  const generateApiKey = () => {
    const key = 'astra_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSettings(prev => ({ ...prev, api_key: key }));
    toast.success('New API key generated');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* API Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            ASTRA Token API Configuration
          </CardTitle>
          <CardDescription>
            Configure the ASTRA Token API endpoints, authentication, and integration settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>API Status:</span>
              {connectionStatus === 'connected' && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              )}
              {connectionStatus === 'error' && (
                <Badge className="bg-red-100 text-red-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Connection Error
                </Badge>
              )}
              {connectionStatus === 'unknown' && (
                <Badge variant="outline">Unknown</Badge>
              )}
            </div>
            <Button onClick={testConnection} variant="outline" size="sm">
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic API Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Basic Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base_url">API Base URL</Label>
              <div className="flex gap-2">
                <Input
                  id="base_url"
                  value={settings.base_url}
                  onChange={(e) => setSettings(prev => ({ ...prev, base_url: e.target.value }))}
                  placeholder="https://api.example.com"
                />
                <Button
                  onClick={() => copyToClipboard(settings.base_url, 'Base URL')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                value={settings.timeout_seconds}
                onChange={(e) => setSettings(prev => ({ ...prev, timeout_seconds: Number(e.target.value) }))}
                min="5"
                max="300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rate_limit">Rate Limit (requests per hour)</Label>
            <Input
              id="rate_limit"
              type="number"
              value={settings.rate_limit_per_hour}
              onChange={(e) => setSettings(prev => ({ ...prev, rate_limit_per_hour: Number(e.target.value) }))}
              min="1"
              max="10000"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enable API</Label>
            <Switch
              id="enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => setSettings(prev => ({ ...prev, enabled }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api_key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="api_key"
                  type={showApiKey ? "text" : "password"}
                  value={settings.api_key}
                  onChange={(e) => setSettings(prev => ({ ...prev, api_key: e.target.value }))}
                  placeholder="Enter API key or generate new one"
                />
                <Button
                  onClick={() => setShowApiKey(!showApiKey)}
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={generateApiKey} variant="outline">
                <Key className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Webhook Configuration</h4>
            
            <div className="space-y-2">
              <Label htmlFor="webhook_url">Webhook URL</Label>
              <Input
                id="webhook_url"
                value={settings.webhook_url}
                onChange={(e) => setSettings(prev => ({ ...prev, webhook_url: e.target.value }))}
                placeholder="https://your-domain.com/webhook/astra-tokens"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook_secret">Webhook Secret</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="webhook_secret"
                    type={showWebhookSecret ? "text" : "password"}
                    value={settings.webhook_secret}
                    onChange={(e) => setSettings(prev => ({ ...prev, webhook_secret: e.target.value }))}
                    placeholder="Enter webhook secret for signature verification"
                  />
                  <Button
                    onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            API Endpoints Reference
          </CardTitle>
          <CardDescription>
            Available endpoints for ASTRA Token operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm">GET /balance?userId={"{userId}"}</code>
                <Button
                  onClick={() => copyToClipboard(`${settings.base_url}/balance?userId={userId}`, 'Balance endpoint')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-1">Get user ASTRA token balance</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm">POST /transactions</code>
                <Button
                  onClick={() => copyToClipboard(`${settings.base_url}/transactions`, 'Transaction endpoint')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-1">Create new token transaction</p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <code className="text-sm">GET /properties</code>
                <Button
                  onClick={() => copyToClipboard(`${settings.base_url}/properties`, 'Properties endpoint')}
                  variant="outline"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-600 mt-1">Get available properties for purchase</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Changes to API settings will affect all token operations. Test the connection before saving.
              </AlertDescription>
            </Alert>
            <Button 
              onClick={saveAPISettings} 
              disabled={saving}
              className="ml-4"
            >
              {saving ? 'Saving...' : 'Save API Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenAPISettings;
