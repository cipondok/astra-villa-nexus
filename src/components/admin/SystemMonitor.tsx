
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Server, TrendingUp, BarChart3, Stethoscope } from "lucide-react";
import { useEnhancedDatabaseConnection } from "@/hooks/useEnhancedDatabaseConnection";
import { useRealTimeMetrics } from "@/hooks/useRealTimeMetrics";
import ConnectionStatusIndicator from "./ConnectionStatusIndicator";
import UnifiedDiagnosticsPanel from "./UnifiedDiagnosticsPanel";

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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Advanced System Monitor</h2>
          <p className="text-[10px] text-muted-foreground">
            Real-time monitoring, alerts, and system health dashboard
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing || connectionLoading} 
          variant="outline"
          size="sm"
          className="h-7 text-[10px] px-2"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${(isRefreshing || connectionLoading) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Connection Status & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <ConnectionStatusIndicator />
        
        {/* Quick Stats */}
        <Card className="bg-card/50 border-border/50 border-l-4 border-l-primary">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Active Users</p>
                <p className="text-lg font-bold text-foreground">{metrics.activeUsers}</p>
              </div>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 border-l-4 border-l-secondary">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Total Users</p>
                <p className="text-lg font-bold text-foreground">{metrics.totalUsers}</p>
              </div>
              <BarChart3 className="h-4 w-4 text-secondary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50 border-l-4 border-l-accent">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] uppercase tracking-wide text-muted-foreground">Properties</p>
                <p className="text-lg font-bold text-foreground">{metrics.totalProperties}</p>
              </div>
              <Server className="h-4 w-4 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Unified System Diagnostics */}
      <Tabs defaultValue="diagnostics" className="space-y-3">
        <TabsList className="inline-flex h-7 w-auto gap-0.5 bg-muted/40 p-0.5 rounded-md border border-border/30">
          <TabsTrigger value="diagnostics" className="text-[10px] h-6 px-2 flex items-center gap-1">
            <Stethoscope className="h-3 w-3" />
            Complete System Diagnostics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="space-y-3">
          <UnifiedDiagnosticsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemMonitor;
