import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Settings, 
  Database, 
  Users, 
  Building,
  ShoppingCart,
  Wrench,
  Activity,
  RefreshCw,
  MessageSquare,
  BarChart3,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAlert } from '@/contexts/AlertContext';
import { useDynamicDiagnostics } from '@/hooks/useDynamicDiagnostics';

interface SystemControl {
  id: string;
  name: string;
  type: 'property' | 'vendor' | 'system';
  isEnabled: boolean;
  description: string;
  errorMessage?: string;
}

interface SystemControlValue {
  enabled?: boolean;
  errorMessage?: string;
}

const DiagnosticDashboard = () => {
  const [systemControls, setSystemControls] = useState<SystemControl[]>([]);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  
  // Use dynamic diagnostics for real-time updates
  const { diagnostics: projectFunctions, isRunning, runFullDiagnostics, lastRun } = useDynamicDiagnostics();

  // Fetch system controls from database
  const { data: controls, isLoading } = useQuery({
    queryKey: ['system-controls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('category', 'system_controls');
      
      if (error) throw error;
      
      return data?.map(setting => {
        const value = setting.value as SystemControlValue;
        return {
          id: setting.key,
          name: setting.key.replace('_', ' ').toUpperCase(),
          type: setting.key.includes('property') ? 'property' as const : 
                setting.key.includes('vendor') ? 'vendor' as const : 'system' as const,
          isEnabled: value?.enabled || false,
          description: setting.description || '',
          errorMessage: value?.errorMessage
        };
      }) || [];
    }
  });

  // Update system control mutation
  const updateControlMutation = useMutation({
    mutationFn: async ({ controlId, enabled, errorMessage }: { 
      controlId: string; 
      enabled: boolean; 
      errorMessage?: string 
    }) => {
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          key: controlId,
          category: 'system_controls',
          value: { enabled, errorMessage },
          description: `System control for ${controlId.replace('_', ' ')}`
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-controls'] });
      showSuccess('Control Updated', 'System control has been updated successfully');
    },
    onError: (error: any) => {
      showError('Update Failed', error.message);
    }
  });

  const handleControlToggle = (controlId: string, enabled: boolean) => {
    const errorMessage = enabled ? undefined : 'This feature is currently under maintenance. Please try again later.';
    updateControlMutation.mutate({ controlId, enabled, errorMessage });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security':
        return <Settings className="h-4 w-4" />;
      case 'Core':
        return <Database className="h-4 w-4" />;
      case 'Business':
        return <Users className="h-4 w-4" />;
      case 'Commerce':
        return <ShoppingCart className="h-4 w-4" />;
      case 'Management':
        return <Wrench className="h-4 w-4" />;
      case 'Communication':
        return <MessageSquare className="h-4 w-4" />;
      case 'Intelligence':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    if (progress >= 30) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const overallProgress = projectFunctions.length > 0 ? Math.round(
    projectFunctions.reduce((sum, func) => sum + func.progress, 0) / projectFunctions.length
  ) : 0;

  const completedCount = projectFunctions.filter(f => f.status === 'completed').length;
  const inProgressCount = projectFunctions.filter(f => f.status === 'in_progress').length;
  const pendingCount = projectFunctions.filter(f => f.status === 'pending').length;
  const errorCount = projectFunctions.filter(f => f.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Project Diagnostic Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Real-time monitoring of project progress and system health
          </p>
        </div>
        <Button
          onClick={runFullDiagnostics}
          disabled={isRunning}
          variant="outline"
          className="min-w-[160px]"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running Tests...' : 'Refresh Diagnostics'}
        </Button>
      </div>

      {/* Overall Progress Card */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Overall Project Progress
            <Badge variant="outline" className="ml-auto">
              {completedCount}/{projectFunctions.length} Systems Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-blue-600">{overallProgress}%</span>
              <div className="text-right">
                <div className="text-sm text-gray-500">Last updated</div>
                <div className="text-sm font-medium">
                  {lastRun ? new Date(lastRun).toLocaleString() : 'Never'}
                </div>
              </div>
            </div>
            <Progress value={overallProgress} className="h-4" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-green-600 font-bold text-xl">{completedCount}</div>
                <div className="text-sm text-green-700">Completed</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-yellow-600 font-bold text-xl">{inProgressCount}</div>
                <div className="text-sm text-yellow-700">In Progress</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-gray-600 font-bold text-xl">{pendingCount}</div>
                <div className="text-sm text-gray-700">Pending</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-red-600 font-bold text-xl">{errorCount}</div>
                <div className="text-sm text-red-700">Issues</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="functions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="functions">System Functions</TabsTrigger>
          <TabsTrigger value="controls">System Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="functions" className="space-y-4">
          {projectFunctions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="animate-pulse">
                  <Activity className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Running initial diagnostics...</p>
                  <p className="text-gray-400 text-sm mt-2">This may take a few moments</p>
                </div>
                <Button onClick={runFullDiagnostics} className="mt-6">
                  <Zap className="h-4 w-4 mr-2" />
                  Start Diagnostics
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {projectFunctions.map((func) => (
                <Card key={func.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(func.category)}
                          {getStatusIcon(func.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-lg">{func.name}</h3>
                            <Badge className={`${getStatusColor(func.status)} font-medium`}>
                              {func.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                            {func.description}
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm font-bold text-gray-700">{func.progress}%</span>
                            </div>
                            <div className="relative">
                              <Progress value={func.progress} className="h-3" />
                              <div 
                                className={`absolute top-0 left-0 h-3 rounded-full transition-all duration-300 ${getProgressColor(func.progress)}`}
                                style={{ width: `${func.progress}%` }}
                              />
                            </div>
                          </div>
                          
                          {func.nextStep && (
                            <Alert className="mt-4 bg-blue-50 border-blue-200">
                              <Target className="h-4 w-4 text-blue-600" />
                              <AlertDescription>
                                <span className="font-medium text-blue-800">Next Step: </span>
                                <span className="text-blue-700">{func.nextStep}</span>
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {func.testResults && func.status === 'error' && (
                            <Alert className="mt-4 bg-red-50 border-red-200">
                              <AlertCircle className="h-4 w-4 text-red-600" />
                              <AlertDescription>
                                <span className="font-medium text-red-800">Error: </span>
                                <span className="text-red-700">
                                  {func.testResults.error || 'Unknown error occurred'}
                                </span>
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {func.dependencies && func.dependencies.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm font-medium text-gray-700">Dependencies: </span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {func.dependencies.map((dep) => (
                                  <Badge key={dep} variant="outline" className="text-xs">
                                    {dep.replace('_', ' ')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <Badge variant="outline" className="mb-2">
                          {func.category}
                        </Badge>
                        <div className="text-xs text-gray-500">
                          Updated: {new Date(func.lastUpdated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Use these controls to enable/disable system features. When disabled, users will see maintenance messages.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {/* System controls remain the same as before */}
            {[
              {
                id: 'property_listings',
                name: 'Property Listings',
                type: 'property' as const,
                description: 'Enable/disable property viewing and listing functionality',
                isEnabled: true
              },
              {
                id: 'property_rent',
                name: 'Property Rentals',
                type: 'property' as const,
                description: 'Enable/disable rental property features',
                isEnabled: true
              },
              {
                id: 'new_projects',
                name: 'New Projects',
                type: 'property' as const,
                description: 'Enable/disable new project listings',
                isEnabled: true
              },
              {
                id: 'pre_launching',
                name: 'Pre-launching Properties',
                type: 'property' as const,
                description: 'Enable/disable pre-launch property features',
                isEnabled: true
              },
              {
                id: 'vendor_services',
                name: 'Vendor Services',
                type: 'vendor' as const,
                description: 'Enable/disable vendor service bookings',
                isEnabled: true
              },
              {
                id: 'vendor_registration',
                name: 'Vendor Registration',
                type: 'vendor' as const,
                description: 'Enable/disable new vendor registrations',
                isEnabled: true
              }
            ].map((control) => {
              const dbControl = controls?.find(c => c.id === control.id);
              const isEnabled = dbControl?.isEnabled ?? control.isEnabled;
              const errorMessage = dbControl?.errorMessage;

              return (
                <Card key={control.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {control.type === 'property' && <Building className="h-4 w-4" />}
                            {control.type === 'vendor' && <Users className="h-4 w-4" />}
                            {control.type !== 'property' && control.type !== 'vendor' && <Settings className="h-4 w-4" />}
                          </div>
                          <h3 className="font-semibold">{control.name}</h3>
                          <Badge variant={isEnabled ? 'default' : 'destructive'}>
                            {isEnabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {control.description}
                        </p>
                        {!isEnabled && errorMessage && (
                          <Alert className="mt-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription className="text-sm">
                              <strong>User Message:</strong> {errorMessage}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => handleControlToggle(control.id, checked)}
                          disabled={updateControlMutation.isPending}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DiagnosticDashboard;
