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
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'security':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'performance':
        return <Activity className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bug className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-500/10 text-red-500 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      low: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    return colors[severity as keyof typeof colors];
  };

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
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
          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="text-2xl font-bold text-red-500">{criticalBugs.length}</div>
            <div className="text-xs text-muted-foreground">Critical Bugs</div>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <div className="text-2xl font-bold text-orange-500">{highBugs.length}</div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="text-2xl font-bold text-green-500">{fixedBugs.length}</div>
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
                    
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      <strong>Impact:</strong> {bug.impact}
                    </div>
                    
                    {bug.stackTrace && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-blue-600 dark:text-blue-400">
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
          <Alert className="border-green-500/20 bg-green-500/5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              No active bugs detected! System is running smoothly.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
