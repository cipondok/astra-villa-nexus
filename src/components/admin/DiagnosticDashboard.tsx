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
  RefreshCw
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
  
  // Use dynamic diagnostics instead of static data
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
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        return <Activity className="h-4 w-4" />;
      case 'Intelligence':
        return <Building className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const overallProgress = projectFunctions.length > 0 ? Math.round(
    projectFunctions.reduce((sum, func) => sum + func.progress, 0) / projectFunctions.length
  ) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Project Diagnostic Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Real-time monitoring of project progress and system controls
          </p>
        </div>
        <Button
          onClick={runFullDiagnostics}
          disabled={isRunning}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running Tests...' : 'Refresh Diagnostics'}
        </Button>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall Project Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{overallProgress}%</span>
              <Badge variant="outline">
                {projectFunctions.filter(f => f.status === 'completed').length} / {projectFunctions.length} Complete
              </Badge>
            </div>
            <Progress value={overallProgress} className="h-3" />
            {lastRun && (
              <div className="text-sm text-gray-500">
                Last updated: {new Date(lastRun).toLocaleString()}
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="text-green-600 font-semibold">
                  {projectFunctions.filter(f => f.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-600 font-semibold">
                  {projectFunctions.filter(f => f.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-500">In Progress</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600 font-semibold">
                  {projectFunctions.filter(f => f.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-red-600 font-semibold">
                  {projectFunctions.filter(f => f.status === 'error').length}
                </div>
                <div className="text-sm text-gray-500">Issues</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="functions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="functions">Project Functions</TabsTrigger>
          <TabsTrigger value="controls">System Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="functions" className="space-y-4">
          {projectFunctions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-500">Running initial diagnostics...</p>
                <Button onClick={runFullDiagnostics} className="mt-4">
                  Start Diagnostics
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {projectFunctions.map((func) => (
                <Card key={func.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(func.category)}
                          {getStatusIcon(func.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{func.name}</h3>
                            <Badge className={getStatusColor(func.status)}>
                              {func.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {func.description}
                          </p>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Progress</span>
                              <span className="text-sm text-gray-500">{func.progress}%</span>
                            </div>
                            <Progress value={func.progress} className="h-2" />
                          </div>
                          {func.nextStep && (
                            <div className="mt-3">
                              <span className="text-sm font-medium text-blue-600">Next Step: </span>
                              <span className="text-sm text-gray-600">{func.nextStep}</span>
                            </div>
                          )}
                          {func.testResults && func.status === 'error' && (
                            <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
                              <strong>Error: </strong>
                              {func.testResults.error || 'Unknown error occurred'}
                            </div>
                          )}
                          {func.dependencies && func.dependencies.length > 0 && (
                            <div className="mt-2">
                              <span className="text-sm font-medium">Dependencies: </span>
                              <div className="flex flex-wrap gap-1 mt-1">
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
                      <div className="text-right">
                        <Badge variant="outline">{func.category}</Badge>
                        <div className="text-xs text-gray-500 mt-1">
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
            {/* Default system controls */}
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
                <Card key={control.id}>
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
