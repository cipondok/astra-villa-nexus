
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
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CategoryIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{tool.name}</CardTitle>
                <CardDescription className="text-sm">{tool.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                v{tool.version}
              </Badge>
              <div className={`w-3 h-3 rounded-full ${statusColors[tool.status]}`} />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status:</span>
              <div className="flex items-center gap-2">
                <StatusIcon className={`h-4 w-4 ${
                  tool.status === 'healthy' ? 'text-green-500' :
                  tool.status === 'warning' ? 'text-yellow-500' :
                  tool.status === 'error' ? 'text-red-500' :
                  'text-gray-500'
                }`} />
                <span className="capitalize">{tool.status}</span>
              </div>
            </div>
            
            {tool.errorMessage && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                {tool.errorMessage}
              </div>
            )}
            
            <div className="text-xs text-muted-foreground">
              Last checked: {new Date(tool.lastChecked).toLocaleString()}
            </div>
            
            {tool.dependencies && tool.dependencies.length > 0 && (
              <div className="text-xs">
                <span className="text-muted-foreground">Dependencies: </span>
                {tool.dependencies.map(dep => (
                  <Badge key={dep} variant="secondary" className="text-xs mr-1">
                    {dep}
                  </Badge>
                ))}
              </div>
            )}
            
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant={tool.enabled ? "destructive" : "default"}
                onClick={() => handleToolToggle(tool.id, tool.enabled)}
                disabled={isLoading}
                className="flex-1"
              >
                {tool.enabled ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Disable
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Enable
                  </>
                )}
              </Button>
              
              {tool.enabled && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleHealthCheck(tool.id)}
                  disabled={isLoading}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tools Management</h1>
          <p className="text-muted-foreground">Monitor and control all system tools and integrations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runAllHealthChecks} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Run Tool Health Checks
          </Button>
          <Button 
            onClick={runSystemHealthCheck} 
            disabled={isRunningHealthCheck}
            variant="outline"
          >
            <Server className={`h-4 w-4 mr-2 ${isRunningHealthCheck ? 'animate-spin' : ''}`} />
            Run System Health Check
          </Button>
        </div>
      </div>

      {/* System Health Results */}
      {healthCheckResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Health Report
              <Badge 
                variant={
                  healthCheckResults.overall === 'healthy' ? 'default' : 
                  healthCheckResults.overall === 'degraded' ? 'secondary' : 
                  'destructive'
                }
              >
                {healthCheckResults.overall}
              </Badge>
            </CardTitle>
            <CardDescription>
              Generated at {new Date(healthCheckResults.generatedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthCheckResults.checks.map((check: any, index: number) => (
                <Card key={index} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{check.service.replace('-', ' ')}</h4>
                      <div className={`w-3 h-3 rounded-full ${
                        check.status === 'healthy' ? 'bg-green-500' :
                        check.status === 'degraded' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                    </div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Response time: {check.responseTime}ms
                    </div>
                    {check.details && (
                      <div className="text-xs text-muted-foreground">
                        {check.details}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-sm font-medium mb-1">Summary</div>
              <div className="text-xs text-muted-foreground">
                Total: {healthCheckResults.summary.total} | 
                Healthy: {healthCheckResults.summary.healthy} | 
                Degraded: {healthCheckResults.summary.degraded} | 
                Unhealthy: {healthCheckResults.summary.unhealthy}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total Tools</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.enabled}</div>
            <div className="text-sm text-muted-foreground">Enabled</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
            <div className="text-sm text-muted-foreground">Healthy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
            <div className="text-sm text-muted-foreground">Warning</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            <div className="text-sm text-muted-foreground">Error</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.disabled}</div>
            <div className="text-sm text-muted-foreground">Disabled</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
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
                className="px-3 py-2 border rounded-md text-sm"
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
      <Tabs defaultValue="grid" className="space-y-4">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="p-4 font-medium">Tool</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Version</th>
                      <th className="p-4 font-medium">Last Checked</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTools.map((tool) => {
                      const StatusIcon = statusIcons[tool.status];
                      return (
                        <tr key={tool.id} className="border-b hover:bg-muted/50">
                          <td className="p-4">
                            <div>
                              <div className="font-medium">{tool.name}</div>
                              <div className="text-sm text-muted-foreground">{tool.description}</div>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className="capitalize">
                              {tool.category}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`h-4 w-4 ${
                                tool.status === 'healthy' ? 'text-green-500' :
                                tool.status === 'warning' ? 'text-yellow-500' :
                                tool.status === 'error' ? 'text-red-500' :
                                'text-gray-500'
                              }`} />
                              <span className="capitalize">{tool.status}</span>
                            </div>
                          </td>
                          <td className="p-4">v{tool.version}</td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(tool.lastChecked).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={tool.enabled ? "destructive" : "default"}
                                onClick={() => handleToolToggle(tool.id, tool.enabled)}
                                disabled={isLoading}
                              >
                                {tool.enabled ? 'Disable' : 'Enable'}
                              </Button>
                              {tool.enabled && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleHealthCheck(tool.id)}
                                  disabled={isLoading}
                                >
                                  <RefreshCw className="h-4 w-4" />
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

      {/* Last Update Info */}
      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default ToolsManagementDashboard;
