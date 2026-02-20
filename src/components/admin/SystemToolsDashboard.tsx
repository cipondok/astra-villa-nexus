import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Database, AlertTriangle, Activity, Server, 
  Bug, FileX2, Monitor, Settings, 
  Zap, ShieldCheck, BarChart3, Terminal,
  RefreshCw, Play, Pause, Trash2, Eye
} from "lucide-react";
import ErrorLogsTable from "./ErrorLogsTable";
import DatabaseErrorMonitor from "./DatabaseErrorMonitor";
import SystemHealthMonitor from "./SystemHealthMonitor";
import SystemSettings from "./SystemSettings";
import EnhancedErrorReporting from "./EnhancedErrorReporting";

const SystemToolsDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const systemStats = {
    totalErrors: 24,
    databaseErrors: 8,
    systemErrors: 12,
    uptime: "99.8%",
    activeConnections: 156,
    memoryUsage: "67%",
    cpuUsage: "23%",
    diskUsage: "45%"
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const quickActions = [
    { 
      id: "refresh-cache", 
      label: "Clear Cache", 
      icon: RefreshCw, 
      color: "bg-chart-2",
      description: "Clear system cache and refresh data"
    },
    { 
      id: "restart-services", 
      label: "Restart Services", 
      icon: Play, 
      color: "bg-chart-1",
      description: "Restart background services"
    },
    { 
      id: "backup-db", 
      label: "Backup Database", 
      icon: Database, 
      color: "bg-chart-5",
      description: "Create database backup"
    },
    { 
      id: "system-check", 
      label: "Health Check", 
      icon: ShieldCheck, 
      color: "bg-chart-4",
      description: "Run comprehensive system check"
    }
  ];

  return (
    <div className="h-full flex flex-col space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-muted">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">System Tools</h1>
            <p className="text-sm text-muted-foreground">
              Database monitoring, error tracking, and system management
            </p>
          </div>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isRefreshing}
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-destructive/5 border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Total Errors</p>
                <p className="text-2xl font-bold">{systemStats.totalErrors}</p>
                <p className="text-xs text-muted-foreground">Last 24h</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-chart-2/5 border-chart-2/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-chart-2">DB Errors</p>
                <p className="text-2xl font-bold">{systemStats.databaseErrors}</p>
                <p className="text-xs text-muted-foreground">Active issues</p>
              </div>
              <Database className="h-8 w-8 text-chart-2/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-chart-1/5 border-chart-1/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-chart-1">System Uptime</p>
                <p className="text-2xl font-bold">{systemStats.uptime}</p>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
              <Activity className="h-8 w-8 text-chart-1/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-chart-4/5 border-chart-4/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-chart-4">Memory Usage</p>
                <p className="text-2xl font-bold">{systemStats.memoryUsage}</p>
                <p className="text-xs text-muted-foreground">Current</p>
              </div>
              <Monitor className="h-8 w-8 text-chart-4/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-16 flex flex-col items-center justify-center gap-1 hover:shadow-md transition-all"
              >
                <action.icon className="h-5 w-5" />
                <span className="text-xs font-medium">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-6 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="enhanced-errors" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Error Analysis
            </TabsTrigger>
            <TabsTrigger value="error-logs" className="flex items-center gap-2">
              <FileX2 className="h-4 w-4" />
              Error Logs
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="system-health" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              System Health
            </TabsTrigger>
            <TabsTrigger value="system-config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              System Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <Badge variant="secondary">{systemStats.cpuUsage}</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-chart-2 h-2 rounded-full" style={{ width: systemStats.cpuUsage }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <Badge variant="secondary">{systemStats.memoryUsage}</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-chart-4 h-2 rounded-full" style={{ width: systemStats.memoryUsage }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <Badge variant="secondary">{systemStats.diskUsage}</Badge>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-chart-1 h-2 rounded-full" style={{ width: systemStats.diskUsage }}></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Connections</span>
                      <Badge variant="outline">{systemStats.activeConnections}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bug className="h-5 w-5 text-red-500" />
                    Recent Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { type: "Database", message: "Connection timeout detected", severity: "high", time: "2m ago" },
                      { type: "System", message: "Memory usage spike", severity: "medium", time: "5m ago" },
                      { type: "API", message: "Rate limit exceeded", severity: "low", time: "8m ago" },
                      { type: "Auth", message: "Failed login attempts", severity: "medium", time: "12m ago" }
                    ].map((issue, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            issue.severity === 'high' ? 'bg-destructive' :
                            issue.severity === 'medium' ? 'bg-chart-3' : 'bg-chart-2'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium">{issue.type}</p>
                            <p className="text-xs text-muted-foreground">{issue.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{issue.time}</p>
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="enhanced-errors" className="flex-1">
            <EnhancedErrorReporting />
          </TabsContent>

          <TabsContent value="error-logs" className="flex-1">
            <ErrorLogsTable />
          </TabsContent>

          <TabsContent value="database" className="flex-1">
            <DatabaseErrorMonitor />
          </TabsContent>

          <TabsContent value="system-health" className="flex-1">
            <SystemHealthMonitor />
          </TabsContent>

          <TabsContent value="system-config" className="flex-1">
            <SystemSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemToolsDashboard;