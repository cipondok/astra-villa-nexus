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
    <div className="space-y-3 animate-in fade-in duration-300">
      {/* Header - Same style as Dashboard Overview */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 via-background to-yellow-500/5 rounded-xl border border-border/30 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <Coins className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-base font-bold">ASTRA Token Hub</h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Comprehensive token management, analytics & configuration</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Button
            onClick={refreshAnalytics}
            disabled={loading}
            variant="outline"
            size="sm"
            className="h-8 text-xs"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* API Status Alert */}
      {(analytics.apiStatus === 'disconnected' || lastTestResult) && (
        <Alert className={`${connectionStatus === 'connected' ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-orange-500 bg-orange-50 dark:bg-orange-950'}`}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            {lastTestResult || 'ASTRA Token API is not configured. Please configure the API in Settings tab first.'}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3">
        <TabsList className="h-10 p-1 bg-muted/50 rounded-lg inline-flex gap-1">
          <TabsTrigger value="overview" className="h-8 text-xs px-3 gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="h-8 text-xs px-3 gap-1.5">
            <TrendingUp className="h-3.5 w-3.5" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="users" className="h-8 text-xs px-3 gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Users
          </TabsTrigger>
          <TabsTrigger value="transactions" className="h-8 text-xs px-3 gap-1.5">
            <Activity className="h-3.5 w-3.5" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="settings" className="h-8 text-xs px-3 gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="h-8 text-xs px-3 gap-1.5">
            <Globe className="h-3.5 w-3.5" />
            Webhooks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-blue-700 dark:text-blue-300">Total Users</span>
                </div>
                <p className="text-lg font-bold text-blue-900 dark:text-blue-100 mt-1">
                  {loading ? '...' : analytics.totalUsers.toLocaleString()}
                </p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400">+12% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5">
                  <Coins className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-700 dark:text-green-300">Total Tokens</span>
                </div>
                <p className="text-lg font-bold text-green-900 dark:text-green-100 mt-1">
                  {loading ? '...' : `${analytics.totalTokens.toLocaleString()}`}
                </p>
                <p className="text-[10px] text-green-600 dark:text-green-400">+8% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-orange-600" />
                  <span className="text-xs text-orange-700 dark:text-orange-300">Transactions</span>
                </div>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100 mt-1">
                  {loading ? '...' : analytics.totalTransactions.toLocaleString()}
                </p>
                <p className="text-[10px] text-orange-600 dark:text-orange-400">+25% from last month</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardContent className="p-3">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-xs text-purple-700 dark:text-purple-300">Active Users</span>
                </div>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100 mt-1">
                  {loading ? '...' : analytics.activeUsers}
                </p>
                <p className="text-[10px] text-purple-600 dark:text-purple-400">Currently online</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Overview */}
          <Card className="mt-3 border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                <Activity className="h-3.5 w-3.5" />
                Recent Activity Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/20">
                  <span className="text-xs">Token transfers today</span>
                  <Badge variant="outline" className="text-[10px] h-5">+{analytics.totalTransactions} transactions</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/20">
                  <span className="text-xs">New users registered</span>
                  <Badge variant="outline" className="text-[10px] h-5">+{Math.floor(analytics.totalUsers * 0.1)} users</Badge>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/20">
                  <span className="text-xs">API calls processed</span>
                  <Badge variant="outline" className="text-[10px] h-5">+{analytics.totalTransactions * 3} calls</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                <BarChart3 className="h-3.5 w-3.5" />
                Token Analytics Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-xs text-muted-foreground py-6 text-center">
                Advanced analytics dashboard with charts and metrics will be displayed here when the ASTRA API is fully integrated.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                <Users className="h-3.5 w-3.5" />
                User Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="text-xs text-muted-foreground py-6 text-center">
                User-specific analytics and management will be displayed here when the ASTRA API is fully integrated.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                <Activity className="h-3.5 w-3.5" />
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-1.5">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg border border-border/20">
                    <div>
                      <div className="text-xs font-medium">{activity.user}</div>
                      <div className="text-[10px] text-muted-foreground">{activity.action}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium">{activity.amount} ASTRA</div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
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
          <div className="space-y-3">
            <Card className="border-border/30">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                  <Key className="h-3.5 w-3.5" />
                  API Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.isEnabled}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, isEnabled: checked }))}
                  />
                  <Label className="text-xs">Enable ASTRA Token API</Label>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">API Key *</Label>
                  <Input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="Enter your ASTRA API key"
                    className="h-8 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Required for API authentication. Keep this secure.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Base URL *</Label>
                  <Input
                    value={settings.baseUrl}
                    onChange={(e) => setSettings(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="https://api.astra-token.com"
                    className="h-8 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    The base URL for ASTRA API endpoints.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={settings.testMode}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, testMode: checked }))}
                  />
                  <Label className="text-xs">Test Mode (Sandbox)</Label>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  When enabled, uses test endpoints for safe testing without affecting live data.
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => testConnection()}
                disabled={testing || !settings.apiKey || !settings.baseUrl}
                variant="outline"
                size="sm"
                className="h-8 text-xs"
              >
                <TestTube className={`h-3.5 w-3.5 mr-1.5 ${testing ? 'animate-spin' : ''}`} />
                Test Connection
              </Button>
              <Button
                onClick={saveSettings}
                disabled={loading}
                size="sm"
                className="h-8 text-xs"
              >
                <Save className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card className="border-border/30">
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-xs flex items-center gap-1.5 text-muted-foreground uppercase tracking-wide">
                <Globe className="h-3.5 w-3.5" />
                Webhooks & Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Webhook URL</Label>
                <Input
                  value={settings.webhookUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                  placeholder="https://yoursite.com/api/webhooks/astra"
                  className="h-8 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                  URL to receive webhook notifications for token events (optional)
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
                <Shield className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">
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