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
        return <CheckCircle className="h-4 w-4 text-chart-1" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-chart-3" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  const getConnectionBadge = () => {
    const colors = {
      connected: 'bg-chart-1/10 text-chart-1',
      slow: 'bg-chart-3/10 text-chart-3',
      disconnected: 'bg-destructive/10 text-destructive'
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
              overallHealth >= 80 ? 'text-chart-1' : 
              overallHealth >= 60 ? 'text-chart-3' : 
              'text-destructive'
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
          <div className="p-3 rounded-lg bg-chart-2/5 border border-chart-2/20">
            <div className="text-2xl font-bold text-chart-2">{queryPerformance}ms</div>
            <div className="text-xs text-muted-foreground">Avg Query Time</div>
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="text-2xl font-bold text-primary">{activeConnections}</div>
            <div className="text-xs text-muted-foreground">Active Connections</div>
          </div>
          <div className="p-3 rounded-lg bg-chart-4/5 border border-chart-4/20">
            <div className="text-2xl font-bold text-chart-4">{totalTables}</div>
            <div className="text-xs text-muted-foreground">Total Tables</div>
          </div>
          <div className="p-3 rounded-lg bg-chart-1/5 border border-chart-1/20">
            <div className="text-2xl font-bold text-chart-1">{rlsEnabled}/{totalTables}</div>
            <div className="text-xs text-muted-foreground">RLS Enabled</div>
          </div>
        </div>

        {/* Health Checks */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Health Checks</span>
            <div className="flex items-center gap-2">
              <Badge className="bg-chart-1/10 text-chart-1">{healthyChecks.length}</Badge>
              <Badge className="bg-chart-3/10 text-chart-3">{warningChecks.length}</Badge>
              <Badge className="bg-destructive/10 text-destructive">{errorChecks.length}</Badge>
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
