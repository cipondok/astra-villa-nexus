
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Pause,
  Play,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  Shield,
  Zap,
  CreditCard,
  MessageSquare,
  FileText,
  Globe,
  Server,
  Database
} from 'lucide-react';
import { useToolsManagement, Tool } from '@/hooks/useToolsManagement';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ToolsManagementDashboard = () => {
  const { 
    tools, 
    isLoading, 
    toggleTool, 
    checkToolHealth, 
    runAllHealthChecks, 
    getToolsStats 
  } = useToolsManagement();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isRunningHealthCheck, setIsRunningHealthCheck] = useState(false);
  const [healthCheckResults, setHealthCheckResults] = useState<any>(null);

  const stats = getToolsStats();

  // System Health Check Function
  const runSystemHealthCheck = async () => {
    setIsRunningHealthCheck(true);
    toast.info('🔍 Running system health check...');
    
    try {
      console.log('🚀 Starting system health check...');
      
      const { data, error } = await supabase.functions.invoke('system-health-check', {
        body: { timestamp: new Date().toISOString() }
      });

      if (error) {
        console.error('❌ Health check failed:', error);
        toast.error(`Health check failed: ${error.message}`);
        return;
      }

      console.log('✅ Health check completed:', data);
      setHealthCheckResults(data);
      
      const overallStatus = data.overall;
      const healthySystems = data.summary.healthy;
      const totalSystems = data.summary.total;
      
      if (overallStatus === 'healthy') {
        toast.success(`✅ All systems healthy! (${healthySystems}/${totalSystems})`);
      } else if (overallStatus === 'degraded') {
        toast.warning(`⚠️ Some systems degraded (${healthySystems}/${totalSystems} healthy)`);
      } else {
        toast.error(`🚨 System issues detected (${healthySystems}/${totalSystems} healthy)`);
      }
      
    } catch (error) {
      console.error('❌ Health check error:', error);
      toast.error('Failed to run health check');
    } finally {
      setIsRunningHealthCheck(false);
    }
  };

  const categoryIcons: Record<string, React.ElementType> = {
    payment: CreditCard,
    token: Zap,
    analytics: BarChart3,
    communication: MessageSquare,
    content: FileText,
    security: Shield,
    integration: Globe,
    tools: Settings,
    other: Settings
  };

  const statusColors = {
    healthy: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    disabled: 'bg-gray-500'
  };

  const statusIcons = {
    healthy: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
    disabled: Pause
  };

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || tool.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = [...new Set(tools.map(tool => tool.category))];

  const handleToolToggle = async (toolId: string, currentEnabled: boolean) => {
    toggleTool({ toolId, enabled: !currentEnabled });
  };

  const handleHealthCheck = async (toolId: string) => {
    await checkToolHealth(toolId);
  };

  const ToolCard = ({ tool }: { tool: Tool }) => {
    const CategoryIcon = categoryIcons[tool.category] || Settings;
    const StatusIcon = statusIcons[tool.status];

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="p-2 md:p-3 pb-1.5">
          <div className="flex items-start justify-between gap-1.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="p-1 md:p-1.5 rounded-md bg-primary/10 shrink-0">
                <CategoryIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-xs md:text-sm font-medium truncate">{tool.name}</CardTitle>
                <CardDescription className="text-[10px] md:text-xs line-clamp-1">{tool.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant="outline" className="text-[9px] md:text-[10px] px-1 py-0 h-4">
                v{tool.version}
              </Badge>
              <div className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full shrink-0 ${statusColors[tool.status]}`} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-2 md:p-3 pt-0">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] md:text-xs">
              <span className="text-muted-foreground">Status:</span>
              <div className="flex items-center gap-1">
                <StatusIcon className={`h-3 w-3 ${
                  tool.status === 'healthy' ? 'text-green-500' :
                  tool.status === 'warning' ? 'text-yellow-500' :
                  tool.status === 'error' ? 'text-red-500' :
                  'text-gray-500'
                }`} />
                <span className="capitalize">{tool.status}</span>
              </div>
            </div>
            
            {tool.errorMessage && (
              <div className="text-[9px] md:text-[10px] text-red-600 bg-red-50 dark:bg-red-900/20 p-1 md:p-1.5 rounded">
                {tool.errorMessage}
              </div>
            )}
            
            <div className="text-[9px] md:text-[10px] text-muted-foreground">
              Last: {new Date(tool.lastChecked).toLocaleDateString()}
            </div>
            
            {tool.dependencies && tool.dependencies.length > 0 && (
              <div className="text-[9px] md:text-[10px] flex flex-wrap gap-0.5">
                <span className="text-muted-foreground">Deps: </span>
                {tool.dependencies.slice(0, 2).map(dep => (
                  <Badge key={dep} variant="secondary" className="text-[8px] px-1 py-0 h-3.5">
                    {dep}
                  </Badge>
                ))}
                {tool.dependencies.length > 2 && (
                  <Badge variant="secondary" className="text-[8px] px-1 py-0 h-3.5">
                    +{tool.dependencies.length - 2}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex gap-1 pt-1">
              <Button
                size="sm"
                variant={tool.enabled ? "destructive" : "default"}
                onClick={() => handleToolToggle(tool.id, tool.enabled)}
                disabled={isLoading}
                className="flex-1 h-6 md:h-7 text-[10px] md:text-xs px-1.5"
              >
                {tool.enabled ? (
                  <>
                    <Pause className="h-3 w-3 mr-0.5" />
                    <span className="hidden xs:inline">Disable</span>
                    <span className="xs:hidden">Off</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-0.5" />
                    <span className="hidden xs:inline">Enable</span>
                    <span className="xs:hidden">On</span>
                  </>
                )}
              </Button>
              
              {tool.enabled && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleHealthCheck(tool.id)}
                  disabled={isLoading}
                  className="h-6 md:h-7 w-6 md:w-7 p-0"
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-3 p-1 md:p-0">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-yellow-500/10 dark:from-orange-500/20 dark:via-amber-500/20 dark:to-yellow-500/20 rounded-lg border border-orange-200/50 dark:border-orange-800/50 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-foreground">Tools Management</h1>
                <Badge className="bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-700 text-[9px] px-1.5 py-0 h-4">
                  <Activity className="h-2.5 w-2.5 mr-0.5" />
                  Active
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">Monitor and control system tools</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button 
              onClick={runAllHealthChecks} 
              disabled={isLoading} 
              size="sm"
              className="h-7 text-[10px] px-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Run Tool </span>Check
            </Button>
            <Button 
              onClick={runSystemHealthCheck} 
              disabled={isRunningHealthCheck}
              variant="outline"
              size="sm"
              className="h-7 text-[10px] px-2 border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <Server className={`h-3 w-3 mr-1 ${isRunningHealthCheck ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">System </span>Health
            </Button>
          </div>
        </div>
      </div>

      {/* System Health Results */}
      {healthCheckResults && (
        <Card>
          <CardHeader className="p-2 md:p-3 pb-1.5">
            <CardTitle className="flex items-center gap-1.5 text-xs md:text-sm">
              <Database className="h-3.5 w-3.5 md:h-4 md:w-4" />
              Health Report
              <Badge 
                variant={
                  healthCheckResults.overall === 'healthy' ? 'default' : 
                  healthCheckResults.overall === 'degraded' ? 'secondary' : 
                  'destructive'
                }
                className="text-[9px] md:text-[10px] px-1 py-0 h-4"
              >
                {healthCheckResults.overall}
              </Badge>
            </CardTitle>
            <CardDescription className="text-[9px] md:text-xs">
              {new Date(healthCheckResults.generatedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 md:p-3 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5 md:gap-2">
              {healthCheckResults.checks.map((check: any, index: number) => (
                <Card key={index} className="border">
                  <CardContent className="p-1.5 md:p-2">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-[10px] md:text-xs font-medium capitalize truncate">{check.service.replace('-', ' ')}</h4>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${
                        check.status === 'healthy' ? 'bg-green-500' :
                        check.status === 'degraded' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                    </div>
                    <div className="text-[9px] md:text-[10px] text-muted-foreground">
                      {check.responseTime}ms
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-2 p-1.5 md:p-2 bg-muted rounded">
              <div className="text-[10px] md:text-xs font-medium">Summary</div>
              <div className="text-[9px] md:text-[10px] text-muted-foreground">
                {healthCheckResults.summary.healthy}/{healthCheckResults.summary.total} healthy
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5">
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/20">
          <CardContent className="p-2">
            <div className="flex items-center gap-1 mb-1">
              <Settings className="h-3 w-3 text-blue-600" />
              <span className="text-[9px] text-muted-foreground">Total</span>
            </div>
            <div className="text-lg font-bold text-blue-600">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/20">
          <CardContent className="p-2">
            <div className="flex items-center gap-1 mb-1">
              <Play className="h-3 w-3 text-indigo-600" />
              <span className="text-[9px] text-muted-foreground">Enabled</span>
            </div>
            <div className="text-lg font-bold text-indigo-600">{stats.enabled}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20">
          <CardContent className="p-2">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-[9px] text-muted-foreground">Healthy</span>
            </div>
            <div className="text-lg font-bold text-green-600">{stats.healthy}</div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/20">
          <CardContent className="p-2">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3 text-yellow-600" />
              <span className="text-[9px] text-muted-foreground">Warning</span>
            </div>
            <div className="text-lg font-bold text-yellow-600">{stats.warning}</div>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
          <CardContent className="p-2">
            <div className="flex items-center gap-1 mb-1">
              <XCircle className="h-3 w-3 text-red-600" />
              <span className="text-[9px] text-muted-foreground">Error</span>
            </div>
            <div className="text-lg font-bold text-red-600">{stats.error}</div>
          </CardContent>
        </Card>
        <Card className="border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20">
          <CardContent className="p-2">
            <div className="flex items-center gap-1 mb-1">
              <Pause className="h-3 w-3 text-gray-600" />
              <span className="text-[9px] text-muted-foreground">Disabled</span>
            </div>
            <div className="text-lg font-bold text-gray-600">{stats.disabled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-2 md:p-3">
          <div className="flex flex-col sm:flex-row gap-1.5 md:gap-2">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-7 md:h-8 text-xs"
                />
              </div>
            </div>
            <div className="flex gap-1.5">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2 py-1 border rounded-md text-[10px] md:text-xs h-7 md:h-8 bg-background"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2 py-1 border rounded-md text-[10px] md:text-xs h-7 md:h-8 bg-background"
              >
                <option value="all">All Status</option>
                <option value="healthy">Healthy</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tools Grid */}
      <Tabs defaultValue="grid" className="space-y-2">
        <TabsList className="h-7 p-0.5 bg-orange-100/50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
          <TabsTrigger value="grid" className="text-[10px] h-6 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
            <BarChart3 className="h-3 w-3 mr-1" />
            Grid
          </TabsTrigger>
          <TabsTrigger value="list" className="text-[10px] h-6 px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-600 data-[state=active]:text-white">
            <Filter className="h-3 w-3 mr-1" />
            List
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] md:text-xs">
                  <thead className="border-b bg-muted/50">
                    <tr className="text-left">
                      <th className="p-1.5 md:p-2 font-medium">Tool</th>
                      <th className="p-1.5 md:p-2 font-medium hidden sm:table-cell">Category</th>
                      <th className="p-1.5 md:p-2 font-medium">Status</th>
                      <th className="p-1.5 md:p-2 font-medium hidden md:table-cell">Version</th>
                      <th className="p-1.5 md:p-2 font-medium hidden lg:table-cell">Last Checked</th>
                      <th className="p-1.5 md:p-2 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTools.map((tool) => {
                      const StatusIcon = statusIcons[tool.status];
                      return (
                        <tr key={tool.id} className="border-b hover:bg-muted/50">
                          <td className="p-1.5 md:p-2">
                            <div>
                              <div className="font-medium truncate max-w-[100px] md:max-w-none">{tool.name}</div>
                              <div className="text-[9px] md:text-[10px] text-muted-foreground truncate max-w-[100px] md:max-w-none">{tool.description}</div>
                            </div>
                          </td>
                          <td className="p-1.5 md:p-2 hidden sm:table-cell">
                            <Badge variant="outline" className="capitalize text-[9px] md:text-[10px] px-1 py-0">
                              {tool.category}
                            </Badge>
                          </td>
                          <td className="p-1.5 md:p-2">
                            <div className="flex items-center gap-1">
                              <StatusIcon className={`h-3 w-3 ${
                                tool.status === 'healthy' ? 'text-green-500' :
                                tool.status === 'warning' ? 'text-yellow-500' :
                                tool.status === 'error' ? 'text-red-500' :
                                'text-gray-500'
                              }`} />
                              <span className="capitalize hidden xs:inline">{tool.status}</span>
                            </div>
                          </td>
                          <td className="p-1.5 md:p-2 hidden md:table-cell">v{tool.version}</td>
                          <td className="p-1.5 md:p-2 text-muted-foreground hidden lg:table-cell">
                            {new Date(tool.lastChecked).toLocaleDateString()}
                          </td>
                          <td className="p-1.5 md:p-2">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant={tool.enabled ? "destructive" : "default"}
                                onClick={() => handleToolToggle(tool.id, tool.enabled)}
                                disabled={isLoading}
                                className="h-5 md:h-6 text-[9px] md:text-[10px] px-1 md:px-1.5"
                              >
                                {tool.enabled ? (
                                  <Pause className="h-2.5 w-2.5" />
                                ) : (
                                  <Play className="h-2.5 w-2.5" />
                                )}
                              </Button>
                              
                              {tool.enabled && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleHealthCheck(tool.id)}
                                  disabled={isLoading}
                                  className="h-5 md:h-6 w-5 md:w-6 p-0"
                                >
                                  <RefreshCw className="h-2.5 w-2.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredTools.length === 0 && (
        <Card>
          <CardContent className="p-4 md:p-6 text-center">
            <Settings className="h-8 w-8 md:h-10 md:w-10 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-sm md:text-base font-medium">No tools found</h3>
            <p className="text-[10px] md:text-xs text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ToolsManagementDashboard;
