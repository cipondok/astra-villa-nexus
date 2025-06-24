
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
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'connecting':
      case 'retry':
        return <RefreshCw className={`h-5 w-5 text-blue-500 ${(isLoading || isRetrying) ? 'animate-spin' : ''}`} />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'offline':
        return <WifiOff className="h-5 w-5 text-red-500" />;
      default:
        return <Wifi className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-50 border-green-200';
      case 'connecting': 
      case 'retry': return 'bg-blue-50 border-blue-200';
      case 'error': return 'bg-yellow-50 border-yellow-200';
      case 'offline': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
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
    <Card className={`${getStatusColor()} transition-colors duration-200`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Database Connection
          </div>
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              Health Score
            </span>
            <span className="font-medium">{healthScore}%</span>
          </div>
          <Progress value={healthScore} className="h-1" />
        </div>

        {/* Connection Metrics */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="text-muted-foreground">Response Time</div>
            <div className="font-medium">
              {metrics.averageResponseTime > 0 ? `${Math.round(metrics.averageResponseTime)}ms` : 'N/A'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground">Failures</div>
            <div className="font-medium">{metrics.consecutiveFailures}</div>
          </div>
        </div>

        {/* Last Checked */}
        {lastChecked && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            Last checked: {lastChecked.toLocaleTimeString()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={retryConnection}
            disabled={isLoading || isRetrying}
            className="flex-1"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${(isLoading || isRetrying) ? 'animate-spin' : ''}`} />
            Retry
          </Button>
          {connectionStatus === 'offline' && (
            <Button 
              size="sm" 
              variant="default" 
              onClick={resetConnection}
              className="flex-1"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Error Message */}
        {(connectionStatus === 'error' || connectionStatus === 'offline') && (
          <div className="text-xs text-muted-foreground p-2 bg-white/50 rounded border">
            {connectionStatus === 'offline' 
              ? 'Unable to reach database after multiple attempts. Check your internet connection.'
              : 'Experiencing connection issues. Retrying automatically...'
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionStatusIndicator;
