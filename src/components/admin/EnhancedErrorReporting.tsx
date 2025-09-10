import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, Database, Shield, Activity, 
  RefreshCw, TrendingUp, Clock, Users, 
  CheckCircle, XCircle, Zap, Bell 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ErrorLogsTable from './ErrorLogsTable';
import DatabaseErrorMonitor from './DatabaseErrorMonitor';
import { useAlert } from '@/contexts/AlertContext';

// Real-time error monitoring interface
interface SystemErrorSummary {
  totalErrors: number;
  criticalErrors: number;
  recentErrors: number;
  affectedTables: number;
  errorTrends: any[];
  healthScore: number;
}

interface RuntimeError {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  component?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

const EnhancedErrorReporting = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [runtimeErrors, setRuntimeErrors] = useState<RuntimeError[]>([]);
  const { showError, showSuccess } = useAlert();

  // Real-time error monitoring
  useEffect(() => {
    // Listen for runtime errors
    const errorHandler = (event: ErrorEvent) => {
      const newError: RuntimeError = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        message: event.error?.message || event.message,
        stack: event.error?.stack,
        component: 'Unknown',
        severity: event.error?.name === 'TypeError' ? 'high' : 'medium',
        resolved: false
      };
      
      setRuntimeErrors(prev => [newError, ...prev.slice(0, 49)]); // Keep last 50 errors
      console.error('🚨 Runtime Error Captured:', newError);
    };

    // Listen for unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const newError: RuntimeError = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        component: 'Promise',
        severity: 'high',
        resolved: false
      };
      
      setRuntimeErrors(prev => [newError, ...prev.slice(0, 49)]);
      console.error('🚨 Promise Rejection Captured:', newError);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  // Fetch system error summary
  const { data: errorSummary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['error-summary'],
    queryFn: async (): Promise<SystemErrorSummary> => {
      try {
        // Get database errors
        const { data: dbErrors } = await supabase
          .from('database_error_tracking')
          .select('error_severity, created_at, table_name, is_resolved')
          .order('created_at', { ascending: false })
          .limit(100);

        // Get application errors  
        const { data: appErrors } = await supabase
          .from('error_logs')
          .select('error_type, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(100);

        const totalErrors = (dbErrors?.length || 0) + (appErrors?.length || 0) + runtimeErrors.length;
        const criticalErrors = (dbErrors?.filter(e => e.error_severity === 'CRITICAL').length || 0) + 
                              runtimeErrors.filter(e => e.severity === 'critical').length;
        
        const recentErrors = (dbErrors?.filter(e => 
          new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length || 0) + runtimeErrors.filter(e => 
          new Date(e.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length;

        const affectedTables = new Set(dbErrors?.map(e => e.table_name).filter(Boolean)).size;
        
        // Calculate health score (0-100)
        const healthScore = Math.max(0, 100 - (criticalErrors * 20) - (totalErrors * 2));

        return {
          totalErrors,
          criticalErrors,
          recentErrors,
          affectedTables,
          errorTrends: [],
          healthScore
        };
      } catch (error) {
        console.error('Error fetching summary:', error);
        showError('Error', 'Failed to fetch error summary');
        return {
          totalErrors: 0,
          criticalErrors: 0,
          recentErrors: 0,
          affectedTables: 0,
          errorTrends: [],
          healthScore: 100
        };
      }
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  const markRuntimeErrorAsResolved = (errorId: string) => {
    setRuntimeErrors(prev => 
      prev.map(error => 
        error.id === errorId ? { ...error, resolved: true } : error
      )
    );
    showSuccess('Error Resolved', 'Runtime error marked as resolved');
  };

  const clearAllRuntimeErrors = () => {
    setRuntimeErrors([]);
    showSuccess('Cleared', 'All runtime errors cleared');
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    if (score >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
            <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Advanced Error Reporting System
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time monitoring and detailed error analysis
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => refetchSummary()} 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={clearAllRuntimeErrors} 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            Clear Runtime Errors
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">System Health</p>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-2xl font-bold text-blue-900">
                    {errorSummary?.healthScore || 0}%
                  </p>
                  <Progress 
                    value={errorSummary?.healthScore || 0} 
                    className="w-16 h-2"
                  />
                </div>
              </div>
              <Activity className="h-8 w-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-900">
                  {errorSummary?.criticalErrors || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Recent (24h)</p>
                <p className="text-2xl font-bold text-orange-900">
                  {errorSummary?.recentErrors || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Runtime Errors</p>
                <p className="text-2xl font-bold text-purple-900">
                  {runtimeErrors.filter(e => !e.resolved).length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Runtime Errors Alert */}
      {runtimeErrors.filter(e => !e.resolved).length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{runtimeErrors.filter(e => !e.resolved).length} active runtime errors</strong> detected. 
            Check the Runtime Errors tab for detailed information.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Error Monitoring Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="runtime">Runtime Errors</TabsTrigger>
          <TabsTrigger value="database">Database Errors</TabsTrigger>
          <TabsTrigger value="application">Application Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Error Trends (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Error trend analysis will be displayed here
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Affected Components
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Database Tables</span>
                    <Badge>{errorSummary?.affectedTables || 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>UI Components</span>
                    <Badge>{new Set(runtimeErrors.map(e => e.component)).size}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="runtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Live Runtime Errors
                </div>
                <Button onClick={clearAllRuntimeErrors} variant="outline" size="sm">
                  Clear All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {runtimeErrors.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-gray-500">No runtime errors detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {runtimeErrors.map((error) => (
                    <div 
                      key={error.id} 
                      className={`p-4 border rounded-lg ${error.resolved ? 'bg-gray-50' : 'bg-red-50 border-red-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${getSeverityColor(error.severity)}`} />
                            <Badge variant="outline">{error.severity}</Badge>
                            <span className="text-sm text-gray-500">
                              {new Date(error.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="font-mono text-sm text-gray-800 mb-2">
                            {error.message}
                          </p>
                          {error.stack && (
                            <details className="text-xs text-gray-600">
                              <summary className="cursor-pointer">Stack trace</summary>
                              <pre className="mt-2 bg-gray-100 p-2 rounded overflow-x-auto">
                                {error.stack}
                              </pre>
                            </details>
                          )}
                        </div>
                        {!error.resolved && (
                          <Button 
                            onClick={() => markRuntimeErrorAsResolved(error.id)}
                            variant="outline" 
                            size="sm"
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database">
          <DatabaseErrorMonitor />
        </TabsContent>

        <TabsContent value="application">
          <ErrorLogsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedErrorReporting;