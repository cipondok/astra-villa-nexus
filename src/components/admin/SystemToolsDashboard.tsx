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
      color: "bg-blue-500",
      description: "Clear system cache and refresh data"
    },
    { 
      id: "restart-services", 
      label: "Restart Services", 
      icon: Play, 
      color: "bg-green-500",
      description: "Restart background services"
    },
    { 
      id: "backup-db", 
      label: "Backup Database", 
      icon: Database, 
      color: "bg-purple-500",
      description: "Create database backup"
    },
    { 
      id: "system-check", 
      label: "Health Check", 
      icon: ShieldCheck, 
      color: "bg-orange-500",
      description: "Run comprehensive system check"
    }
  ];

  return (
    <div className="h-full flex flex-col space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50/20 dark:from-slate-900 dark:to-blue-900/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <Settings className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Tools</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Errors</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{systemStats.totalErrors}</p>
                <p className="text-xs text-red-500">Last 24h</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">DB Errors</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{systemStats.databaseErrors}</p>
                <p className="text-xs text-blue-500">Active issues</p>
              </div>
              <Database className="h-8 w-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">System Uptime</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{systemStats.uptime}</p>
                <p className="text-xs text-green-500">Last 7 days</p>
              </div>
              <Activity className="h-8 w-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Memory Usage</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{systemStats.memoryUsage}</p>
                <p className="text-xs text-orange-500">Current</p>
              </div>
              <Monitor className="h-8 w-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
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
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
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
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: systemStats.cpuUsage }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <Badge variant="secondary">{systemStats.memoryUsage}</Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{ width: systemStats.memoryUsage }}></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <Badge variant="secondary">{systemStats.diskUsage}</Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: systemStats.diskUsage }}></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Connections</span>
                      <Badge className="bg-blue-100 text-blue-800">{systemStats.activeConnections}</Badge>
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
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            issue.severity === 'high' ? 'bg-red-500' :
                            issue.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium">{issue.type}</p>
                            <p className="text-xs text-gray-500">{issue.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{issue.time}</p>
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

          <TabsContent value="error-logs" className="flex-1">
            <ErrorLogsTable />
          </TabsContent>

          <TabsContent value="database" className="flex-1">
            <DatabaseErrorMonitor />
          </TabsContent>

          <TabsContent value="system-health" className="flex-1">
            <SystemHealthMonitor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemToolsDashboard;