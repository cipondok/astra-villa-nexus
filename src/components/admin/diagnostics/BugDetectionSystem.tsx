import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bug, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

interface DetectedBug {
  id: string;
  type: 'runtime' | 'logic' | 'memory' | 'performance' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: string;
  impact: string;
  occurrences: number;
  firstSeen: string;
  lastSeen: string;
  status: 'open' | 'investigating' | 'fixed';
  stackTrace?: string;
}

interface BugDetectionSystemProps {
  bugs: DetectedBug[];
  trendDirection: 'up' | 'down' | 'stable';
  bugCount24h: number;
  bugCount7d: number;
}

export const BugDetectionSystem = ({ 
  bugs, 
  trendDirection, 
  bugCount24h,
  bugCount7d 
}: BugDetectionSystemProps) => {
  const criticalBugs = bugs.filter(b => b.severity === 'critical' && b.status === 'open');
  const highBugs = bugs.filter(b => b.severity === 'high' && b.status === 'open');
  const fixedBugs = bugs.filter(b => b.status === 'fixed');

  const getBugTypeIcon = (type: string) => {
    switch (type) {
      case 'runtime':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'security':
        return <AlertTriangle className="h-4 w-4 text-chart-4" />;
      case 'performance':
        return <Activity className="h-4 w-4 text-chart-3" />;
      default:
        return <Bug className="h-4 w-4 text-chart-2" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-destructive/10 text-destructive border-destructive/20',
      high: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      medium: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      low: 'bg-chart-2/10 text-chart-2 border-chart-2/20'
    };
    return colors[severity as keyof typeof colors];
  };

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-chart-1" />;
      default:
        return <Activity className="h-4 w-4 text-chart-2" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Bug Detection & Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bug Statistics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="text-2xl font-bold text-destructive">{criticalBugs.length}</div>
            <div className="text-xs text-muted-foreground">Critical Bugs</div>
          </div>
          <div className="p-3 rounded-lg bg-chart-4/5 border border-chart-4/20">
            <div className="text-2xl font-bold text-chart-4">{highBugs.length}</div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div className="p-3 rounded-lg bg-chart-1/5 border border-chart-1/20">
            <div className="text-2xl font-bold text-chart-1">{fixedBugs.length}</div>
            <div className="text-xs text-muted-foreground">Fixed</div>
          </div>
        </div>

        {/* Bug Trends */}
        <div className="p-3 rounded-lg border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className="text-sm font-medium">Bug Trend</span>
            </div>
            <Badge variant="outline">
              {bugCount24h} in 24h | {bugCount7d} in 7d
            </Badge>
          </div>
        </div>

        {/* Active Bugs List */}
        {bugs.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {bugs.filter(b => b.status === 'open').slice(0, 8).map((bug) => (
              <Alert key={bug.id} className="p-3">
                <div className="flex items-start gap-3">
                  {getBugTypeIcon(bug.type)}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="font-medium text-sm">{bug.title}</div>
                        <div className="text-xs text-muted-foreground">{bug.description}</div>
                      </div>
                      <Badge className={getSeverityColor(bug.severity)}>
                        {bug.severity}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">{bug.type}</Badge>
                      <span>•</span>
                      <span>{bug.location}</span>
                      <span>•</span>
                      <span>{bug.occurrences} occurrences</span>
                    </div>
                    
                    <div className="text-xs text-chart-4">
                      <strong>Impact:</strong> {bug.impact}
                    </div>
                    
                    {bug.stackTrace && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-primary">
                          View stack trace
                        </summary>
                        <pre className="mt-2 p-2 rounded bg-muted overflow-x-auto text-xs">
                          {bug.stackTrace}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        ) : (
          <Alert className="border-chart-1/20 bg-chart-1/5">
            <CheckCircle className="h-4 w-4 text-chart-1" />
            <AlertDescription className="text-chart-1">
              No active bugs detected! System is running smoothly.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
