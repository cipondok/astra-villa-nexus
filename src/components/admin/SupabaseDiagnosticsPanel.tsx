
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Zap
} from 'lucide-react';
import { useSupabaseConnectionDiagnostics } from '@/hooks/useSupabaseConnectionDiagnostics';
import { useOfflineSupport } from '@/hooks/useOfflineSupport';
import { supabase } from '@/integrations/supabase/client';

const SupabaseDiagnosticsPanel = () => {
  const { diagnostics, runFullDiagnostics, getRecommendations } = useSupabaseConnectionDiagnostics();
  const { isOnline, queuedOperations, cacheData, syncQueuedOperations } = useOfflineSupport();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-4 w-4 text-chart-1" />;
      case 'fail': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-chart-3" />;
      default: return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getOverallStatusColor = () => {
    switch (diagnostics.overallStatus) {
      case 'healthy': return 'bg-chart-1/5 border-chart-1/20';
      case 'degraded': return 'bg-chart-3/5 border-chart-3/20';
      case 'offline': return 'bg-destructive/5 border-destructive/20';
      default: return 'bg-muted border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status Overview */}
      <Card className={`${getOverallStatusColor()} transition-colors duration-200`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isOnline ? <Wifi className="h-5 w-5 text-chart-1" /> : <WifiOff className="h-5 w-5 text-destructive" />}
              Supabase Connection Status
            </div>
            <Badge variant={diagnostics.overallStatus === 'healthy' ? 'default' : 'destructive'}>
              {diagnostics.overallStatus.toUpperCase()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Network: {isOnline ? 'Online' : 'Offline'} | 
            Last checked: {diagnostics.lastRun?.toLocaleTimeString() || 'Never'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={runFullDiagnostics} 
              disabled={diagnostics.isRunning}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${diagnostics.isRunning ? 'animate-spin' : ''}`} />
              Run Diagnostics
            </Button>
            <Button 
              onClick={cacheData} 
              variant="outline" 
              size="sm"
              disabled={!isOnline}
            >
              <Database className="h-4 w-4 mr-2" />
              Cache Data
            </Button>
            {queuedOperations > 0 && (
              <Button 
                onClick={syncQueuedOperations} 
                variant="outline" 
                size="sm"
                disabled={!isOnline}
              >
                <Zap className="h-4 w-4 mr-2" />
                Sync ({queuedOperations})
              </Button>
            )}
          </div>

          {/* Offline Support Status */}
          {!isOnline && (
            <div className="bg-chart-4/5 border border-chart-4/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-chart-4">
                <WifiOff className="h-4 w-4" />
                <span className="font-medium">Offline Mode Active</span>
              </div>
              <p className="text-sm text-chart-4/80 mt-1">
                Using cached data. {queuedOperations > 0 && `${queuedOperations} operations queued for sync.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diagnostic Results */}
      {diagnostics.results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Diagnostic Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {diagnostics.results.map((result, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="font-medium">{result.test}</div>
                  <div className="text-sm text-muted-foreground">{result.message}</div>
                  {result.details?.responseTime && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Response time: {result.details.responseTime}ms
                    </div>
                  )}
                </div>
                <Badge variant={result.status === 'pass' ? 'default' : 'destructive'}>
                  {result.status.toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {diagnostics.results.some(r => r.status === 'fail') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-chart-3" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {getRecommendations().map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-chart-3 mt-1">•</span>
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common fixes for connection issues</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            >
              Open Supabase Dashboard
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => window.open('https://status.supabase.com', '_blank')}
            >
              Check Supabase Status
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
            >
              Clear Cache & Reload
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => console.log('Supabase Client:', supabase)}
            >
              Log Client Info
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupabaseDiagnosticsPanel;
