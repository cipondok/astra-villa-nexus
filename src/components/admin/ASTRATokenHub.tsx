import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  TrendingUp, 
  Users, 
  Activity,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  Save,
  TestTube,
  Key,
  Globe,
  Shield
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';
import { supabase } from '@/integrations/supabase/client';

interface TokenAnalytics {
  totalUsers: number;
  totalTokens: number;
  totalTransactions: number;
  activeUsers: number;
  apiStatus: 'connected' | 'disconnected' | 'checking';
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    amount: number;
    timestamp: string;
  }>;
}

interface ASTRASettings {
  apiKey: string;
  baseUrl: string;
  isEnabled: boolean;
  testMode: boolean;
  webhookUrl: string;
}

const ASTRATokenHub = () => {
  const { showSuccess, showError } = useAlert();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Analytics state
  const [analytics, setAnalytics] = useState<TokenAnalytics>({
    totalUsers: 0,
    totalTokens: 0,
    totalTransactions: 0,
    activeUsers: 0,
    apiStatus: 'checking',
    recentActivity: []
  });
  
  // Settings state
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
    loadAnalytics();
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

        // Auto-check connection status if API is enabled and configured
        if (settingsMap.isEnabled === 'true' && settingsMap.apiKey && settingsMap.baseUrl) {
          setTimeout(() => testConnection(settingsMap), 1000);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showError('Settings Error', 'Failed to load ASTRA token settings');
    }
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Check API configuration first
      const { data: apiConfig } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'astra_api');

      if (!apiConfig || apiConfig.length === 0) {
        setAnalytics(prev => ({ ...prev, apiStatus: 'disconnected' }));
        setLoading(false);
        return;
      }

      // Mock analytics data - in real implementation, this would come from ASTRA API
      const mockAnalytics: TokenAnalytics = {
        totalUsers: 156,
        totalTokens: 125000.50,
        totalTransactions: 342,
        activeUsers: 23,
        apiStatus: 'connected',
        recentActivity: [
          {
            id: '1',
            user: 'john.doe@example.com',
            action: 'Purchase Property',
            amount: 500.00,
            timestamp: new Date().toISOString()
          },
          {
            id: '2',
            user: 'jane.smith@example.com',
            action: 'Stake Tokens',
            amount: 100.00,
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '3',
            user: 'mike.wilson@example.com',
            action: 'Token Transfer',
            amount: 250.00,
            timestamp: new Date(Date.now() - 7200000).toISOString()
          }
        ]
      };

      setAnalytics(mockAnalytics);
      
    } catch (error) {
      console.error('Error loading ASTRA analytics:', error);
      showError('Analytics Error', 'Failed to load ASTRA token analytics');
      setAnalytics(prev => ({ ...prev, apiStatus: 'disconnected' }));
    } finally {
      setLoading(false);
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
      
      // Auto-test connection after saving if enabled
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
        const data = await response.json().catch(() => ({}));
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

  const refreshAnalytics = async () => {
    await loadAnalytics();
    showSuccess('Refreshed', 'ASTRA token analytics have been refreshed');
  };

  const getStatusBadge = () => {
    const status = connectionStatus !== 'disconnected' ? connectionStatus : analytics.apiStatus;
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case 'testing':
      case 'checking':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            {status === 'testing' ? 'Testing...' : 'Checking...'}
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
          <h1 className="text-3xl font-bold text-foreground">ASTRA Token Hub</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive ASTRA token management, analytics, and configuration
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusBadge()}
          <Button
            onClick={refreshAnalytics}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* API Status Alert */}
      {(analytics.apiStatus === 'disconnected' || lastTestResult) && (
        <Alert className={connectionStatus === 'connected' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {lastTestResult || 'ASTRA Token API is not configured. Please configure the API in Settings tab first.'}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-6 min-w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : analytics.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                <Coins className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : `${analytics.totalTokens.toLocaleString()} ASTRA`}
                </div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                <Activity className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : analytics.totalTransactions.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  +25% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : analytics.activeUsers}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently online
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Overview */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Token transfers today</span>
                  <Badge variant="outline">+{analytics.totalTransactions} transactions</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New users registered</span>
                  <Badge variant="outline">+{Math.floor(analytics.totalUsers * 0.1)} users</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API calls processed</span>
                  <Badge variant="outline">+{analytics.totalTransactions * 3} calls</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Token Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Advanced analytics dashboard with charts and metrics will be displayed here when the ASTRA API is fully integrated.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                User-specific analytics and management will be displayed here when the ASTRA API is fully integrated.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium">{activity.user}</div>
                      <div className="text-sm text-muted-foreground">{activity.action}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{activity.amount} ASTRA</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
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
                  <Label>Enable ASTRA Token API</Label>
                </div>

                <div className="space-y-2">
                  <Label>API Key *</Label>
                  <Input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter your ASTRA API key"
                  />
                  <p className="text-xs text-muted-foreground">
                    Required for API authentication. Keep this secure.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Base URL *</Label>
                  <Input
                    value={settings.baseUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="https://api.astra-token.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    The base URL for ASTRA API endpoints.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.testMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, testMode: checked }))}
                  />
                  <Label>Test Mode (Sandbox)</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  When enabled, uses test endpoints for safe testing without affecting live data.
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => testConnection()}
                disabled={testing || !settings.apiKey || !settings.baseUrl}
                variant="outline"
              >
                <TestTube className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
              <Button
                onClick={saveSettings}
                disabled={loading}
              >
                <Save className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Webhooks & Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://yoursite.com/api/webhooks/astra"
                />
                <p className="text-xs text-muted-foreground">
                  URL to receive webhook notifications for token events (optional)
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
    </div>
  );
};

export default ASTRATokenHub;