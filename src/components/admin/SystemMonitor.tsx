
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Activity, Server, AlertTriangle, TrendingUp, BarChart3, Stethoscope } from "lucide-react";
import { useEnhancedDatabaseConnection } from "@/hooks/useEnhancedDatabaseConnection";
import { useRealTimeMetrics } from "@/hooks/useRealTimeMetrics";
import RealTimeSystemHealth from "./RealTimeSystemHealth";
import EnhancedAlertManagement from "./EnhancedAlertManagement";
import ConnectionStatusIndicator from "./ConnectionStatusIndicator";
import SupabaseDiagnosticsPanel from "./SupabaseDiagnosticsPanel";

const SystemMonitor = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { connectionStatus, isLoading: connectionLoading, retryConnection, isConnected } = useEnhancedDatabaseConnection();
  const { metrics, refreshMetrics } = useRealTimeMetrics();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log('🔄 Manual refresh triggered');
    
    await Promise.all([
      retryConnection(),
      refreshMetrics()
    ]);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Advanced System Monitor</h2>
          <p className="text-muted-foreground">
            Real-time monitoring, alerts, and system health dashboard
          </p>
        </div>
        <Button onClick={handleRefresh} disabled={isRefreshing || connectionLoading} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${(isRefreshing || connectionLoading) ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ConnectionStatusIndicator />
        
        {/* Quick Stats */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Active Users</p>
                <p className="font-semibold">{metrics.activeUsers}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Total Users</p>
                <p className="font-semibold">{metrics.totalUsers}</p>
              </div>
              <BarChart3 className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Properties</p>
                <p className="font-semibold">{metrics.totalProperties}</p>
              </div>
              <Server className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Monitoring Tabs */}
      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4" />
            Diagnostics
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alert Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <RealTimeSystemHealth />
        </TabsContent>

        <TabsContent value="diagnostics">
          <SupabaseDiagnosticsPanel />
        </TabsContent>

        <TabsContent value="alerts">
          <EnhancedAlertManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Advanced analytics dashboard coming soon...</p>
            <p className="text-sm mt-2">Will include performance trends, usage patterns, and predictive insights</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemMonitor;
