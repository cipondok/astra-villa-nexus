
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
          <Badge className="bg-primary/20 text-primary border border-primary/30 text-[8px] h-4 px-1.5">
            <CheckCircle className="h-2.5 w-2.5 mr-1" />
            API Connected
          </Badge>
        );
      case 'checking':
        return (
          <Badge className="bg-accent/20 text-accent border border-accent/30 text-[8px] h-4 px-1.5">
            <RefreshCw className="h-2.5 w-2.5 mr-1 animate-spin" />
            Checking
          </Badge>
        );
      case 'disconnected':
      default:
        return (
          <Badge variant="destructive" className="text-[8px] h-4 px-1.5">
            <AlertTriangle className="h-2.5 w-2.5 mr-1" />
            API Disconnected
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">ASTRA Token Analytics</h2>
          <p className="text-[10px] text-muted-foreground">Monitor token usage and user activity</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <Button
            onClick={refreshAnalytics}
            disabled={loading}
            variant="outline"
            size="sm"
            className="h-6 text-[10px] px-2 bg-background/50 border-border/50"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* API Status Alert */}
      {analytics.apiStatus === 'disconnected' && (
        <Alert className="py-2 bg-destructive/10 border-destructive/30">
          <AlertTriangle className="h-3 w-3" />
          <AlertDescription className="text-[10px] text-destructive">
            ASTRA Token API is not configured. Please configure the API in System Settings first.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-3">
        <TabsList className="grid w-full grid-cols-3 h-7 bg-muted/30">
          <TabsTrigger value="overview" className="text-[10px] h-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
          <TabsTrigger value="users" className="text-[10px] h-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Users</TabsTrigger>
          <TabsTrigger value="transactions" className="text-[10px] h-5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-3">
                <CardTitle className="text-[10px] font-medium text-muted-foreground">Total Users</CardTitle>
                <Users className="h-3.5 w-3.5 text-primary" />
              </CardHeader>
              <CardContent className="px-3 pb-2 pt-0">
                <div className="text-lg font-bold text-foreground">
                  {loading ? '...' : analytics.totalUsers.toLocaleString()}
                </div>
                <p className="text-[8px] text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-3">
                <CardTitle className="text-[10px] font-medium text-muted-foreground">Total Tokens</CardTitle>
                <Coins className="h-3.5 w-3.5 text-accent" />
              </CardHeader>
              <CardContent className="px-3 pb-2 pt-0">
                <div className="text-lg font-bold text-foreground">
                  {loading ? '...' : `${analytics.totalTokens.toLocaleString()}`}
                </div>
                <p className="text-[8px] text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 border-l-4 border-l-secondary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-3">
                <CardTitle className="text-[10px] font-medium text-muted-foreground">Transactions</CardTitle>
                <Activity className="h-3.5 w-3.5 text-secondary" />
              </CardHeader>
              <CardContent className="px-3 pb-2 pt-0">
                <div className="text-lg font-bold text-foreground">
                  {loading ? '...' : analytics.totalTransactions.toLocaleString()}
                </div>
                <p className="text-[8px] text-muted-foreground">
                  +25% from last month
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50 border-l-4 border-l-destructive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-2 px-3">
                <CardTitle className="text-[10px] font-medium text-muted-foreground">Active Users</CardTitle>
                <TrendingUp className="h-3.5 w-3.5 text-destructive" />
              </CardHeader>
              <CardContent className="px-3 pb-2 pt-0">
                <div className="text-lg font-bold text-foreground">
                  {loading ? '...' : analytics.activeUsers}
                </div>
                <p className="text-[8px] text-muted-foreground">
                  Currently online
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground">User Activity</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <div className="text-[10px] text-muted-foreground">
                User-specific analytics will be displayed here when the ASTRA API is fully integrated.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-3">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-xs font-semibold text-foreground">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 pt-0">
              <div className="space-y-2">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 bg-muted/20 rounded border border-border/30">
                    <div>
                      <div className="text-[10px] font-medium text-foreground">{activity.user}</div>
                      <div className="text-[8px] text-muted-foreground">{activity.action}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-medium text-foreground">{activity.amount} ASTRA</div>
                      <div className="text-[8px] text-muted-foreground">
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
