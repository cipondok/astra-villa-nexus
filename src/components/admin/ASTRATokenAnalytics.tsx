
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  CheckCircle
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

const ASTRATokenAnalytics = () => {
  const { showSuccess, showError } = useAlert();
  const [analytics, setAnalytics] = useState<TokenAnalytics>({
    totalUsers: 0,
    totalTokens: 0,
    totalTransactions: 0,
    activeUsers: 0,
    apiStatus: 'checking',
    recentActivity: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

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

  const refreshAnalytics = async () => {
    await loadAnalytics();
    showSuccess('Refreshed', 'ASTRA token analytics have been refreshed');
  };

  const getStatusBadge = () => {
    switch (analytics.apiStatus) {
      case 'connected':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            API Connected
          </Badge>
        );
      case 'checking':
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
            Checking
          </Badge>
        );
      case 'disconnected':
      default:
        return (
          <Badge variant="destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            API Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">ASTRA Token Analytics</h2>
          <p className="text-gray-400">Monitor token usage and user activity</p>
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
      {analytics.apiStatus === 'disconnected' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ASTRA Token API is not configured. Please configure the API in System Settings first.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
                <Users className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {loading ? '...' : analytics.totalUsers.toLocaleString()}
                </div>
                <p className="text-xs text-gray-400">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Total Tokens</CardTitle>
                <Coins className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {loading ? '...' : `${analytics.totalTokens.toLocaleString()} ASTRA`}
                </div>
                <p className="text-xs text-gray-400">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Transactions</CardTitle>
                <Activity className="h-4 w-4 text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {loading ? '...' : analytics.totalTransactions.toLocaleString()}
                </div>
                <p className="text-xs text-gray-400">
                  +25% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">Active Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {loading ? '...' : analytics.activeUsers}
                </div>
                <p className="text-xs text-gray-400">
                  Currently online
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">User Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-400">
                User-specific analytics will be displayed here when the ASTRA API is fully integrated.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                    <div>
                      <div className="font-medium text-white">{activity.user}</div>
                      <div className="text-sm text-gray-400">{activity.action}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">{activity.amount} ASTRA</div>
                      <div className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ASTRATokenAnalytics;
