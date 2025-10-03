import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Activity,
  Clock
} from 'lucide-react';

interface DatabaseCheck {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  responseTime?: number;
  message: string;
  lastChecked: string;
}

interface DatabaseHealthCheckerProps {
  checks: DatabaseCheck[];
  connectionStatus: 'connected' | 'disconnected' | 'slow';
  queryPerformance: number;
  activeConnections: number;
  totalTables: number;
  rlsEnabled: number;
}

export const DatabaseHealthChecker = ({ 
  checks, 
  connectionStatus,
  queryPerformance,
  activeConnections,
  totalTables,
  rlsEnabled
}: DatabaseHealthCheckerProps) => {
  const healthyChecks = checks.filter(c => c.status === 'healthy');
  const warningChecks = checks.filter(c => c.status === 'warning');
  const errorChecks = checks.filter(c => c.status === 'error');

  const overallHealth = Math.round((healthyChecks.length / checks.length) * 100);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getConnectionBadge = () => {
    const colors = {
      connected: 'bg-green-500/10 text-green-500',
      slow: 'bg-yellow-500/10 text-yellow-500',
      disconnected: 'bg-red-500/10 text-red-500'
    };
    return (
      <Badge className={colors[connectionStatus]}>
        {connectionStatus.toUpperCase()}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Health Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Health */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Database Health</span>
            <span className={`text-2xl font-bold ${
              overallHealth >= 80 ? 'text-green-500' : 
              overallHealth >= 60 ? 'text-yellow-500' : 
              'text-red-500'
            }`}>
              {overallHealth}%
            </span>
          </div>
          <Progress value={overallHealth} className="h-2" />
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="text-sm font-medium">Connection Status</span>
          </div>
          {getConnectionBadge()}
        </div>

        {/* Database Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-500">{queryPerformance}ms</div>
            <div className="text-xs text-muted-foreground">Avg Query Time</div>
          </div>
          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
            <div className="text-2xl font-bold text-purple-500">{activeConnections}</div>
            <div className="text-xs text-muted-foreground">Active Connections</div>
          </div>
          <div className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
            <div className="text-2xl font-bold text-cyan-500">{totalTables}</div>
            <div className="text-xs text-muted-foreground">Total Tables</div>
          </div>
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="text-2xl font-bold text-green-500">{rlsEnabled}/{totalTables}</div>
            <div className="text-xs text-muted-foreground">RLS Enabled</div>
          </div>
        </div>

        {/* Health Checks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Health Checks</span>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/10 text-green-500">{healthyChecks.length}</Badge>
              <Badge className="bg-yellow-500/10 text-yellow-500">{warningChecks.length}</Badge>
              <Badge className="bg-red-500/10 text-red-500">{errorChecks.length}</Badge>
            </div>
          </div>
          
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {checks.map((check, idx) => (
              <div key={idx} className="p-3 rounded-lg border bg-card">
                <div className="flex items-start gap-3">
                  {getStatusIcon(check.status)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{check.name}</span>
                      {check.responseTime && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {check.responseTime}ms
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{check.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last checked: {new Date(check.lastChecked).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
