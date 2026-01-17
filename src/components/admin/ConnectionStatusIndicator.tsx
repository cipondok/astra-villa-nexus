
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';
import { useEnhancedDatabaseConnection } from '@/hooks/useEnhancedDatabaseConnection';

const ConnectionStatusIndicator = () => {
  const { 
    connectionStatus, 
    isLoading, 
    retryConnection, 
    resetConnection,
    isConnected, 
    lastChecked, 
    metrics,
    isRetrying
  } = useEnhancedDatabaseConnection();

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle2 className="h-3.5 w-3.5 text-primary" />;
      case 'connecting':
      case 'retry':
        return <RefreshCw className={`h-3.5 w-3.5 text-accent ${(isLoading || isRetrying) ? 'animate-spin' : ''}`} />;
      case 'error':
        return <AlertCircle className="h-3.5 w-3.5 text-warning" />;
      case 'offline':
        return <WifiOff className="h-3.5 w-3.5 text-destructive" />;
      default:
        return <Wifi className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  const getStatusBorderColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'border-l-primary';
      case 'connecting': 
      case 'retry': return 'border-l-accent';
      case 'error': return 'border-l-warning';
      case 'offline': return 'border-l-destructive';
      default: return 'border-l-muted';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'retry': return 'Retrying...';
      case 'error': return 'Connection Issues';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const healthScore = metrics.connectionHistory.length > 0 
    ? Math.round((metrics.connectionHistory.filter(h => h.success).length / metrics.connectionHistory.length) * 100)
    : 100;

  return (
    <Card className={`bg-card/50 border-border/50 border-l-4 ${getStatusBorderColor()} transition-colors duration-200`}>
      <CardHeader className="py-2 px-3">
        <CardTitle className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            {getStatusIcon()}
            <span className="text-foreground">Database</span>
          </div>
          <Badge 
            variant={isConnected ? 'default' : 'destructive'}
            className="text-[8px] h-4 px-1.5"
          >
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-0 space-y-2">
        {/* Connection Health Score */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px]">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Activity className="h-2.5 w-2.5" />
              Health
            </span>
            <span className="font-medium text-foreground">{healthScore}%</span>
          </div>
          <Progress value={healthScore} className="h-1" />
        </div>

        {/* Connection Metrics */}
        <div className="grid grid-cols-2 gap-2 text-[9px]">
          <div>
            <div className="text-muted-foreground">Response</div>
            <div className="font-medium text-foreground">
              {metrics.averageResponseTime > 0 ? `${Math.round(metrics.averageResponseTime)}ms` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Failures</div>
            <div className="font-medium text-foreground">{metrics.consecutiveFailures}</div>
          </div>
        </div>

        {/* Last Checked */}
        {lastChecked && (
          <div className="flex items-center gap-1 text-[8px] text-muted-foreground">
            <Clock className="h-2.5 w-2.5" />
            {lastChecked.toLocaleTimeString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={retryConnection}
            disabled={isLoading || isRetrying}
            className="flex-1 h-6 text-[9px]"
          >
            <RefreshCw className={`h-2.5 w-2.5 mr-1 ${(isLoading || isRetrying) ? 'animate-spin' : ''}`} />
            Retry
          </Button>
          {connectionStatus === 'offline' && (
            <Button 
              size="sm" 
              variant="default" 
              onClick={resetConnection}
              className="flex-1 h-6 text-[9px]"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Error Message */}
        {(connectionStatus === 'error' || connectionStatus === 'offline') && (
          <div className="text-[8px] text-muted-foreground p-1.5 bg-muted/30 rounded border border-border/50">
            {connectionStatus === 'offline' 
              ? 'Unable to reach database. Check connection.'
              : 'Connection issues. Retrying...'
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionStatusIndicator;
