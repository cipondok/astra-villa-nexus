import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Code, 
  FileCode,
  Bug,
  Zap
} from 'lucide-react';

interface CodeIssue {
  id: string;
  type: 'error' | 'warning' | 'info';
  severity: 'critical' | 'high' | 'medium' | 'low';
  file: string;
  line?: number;
  message: string;
  category: string;
  suggestion?: string;
}

interface CodeHealthCheckerProps {
  issues: CodeIssue[];
  healthScore: number;
}

export const CodeHealthChecker = ({ issues, healthScore }: CodeHealthCheckerProps) => {
  const criticalIssues = issues.filter(i => i.severity === 'critical');
  const highIssues = issues.filter(i => i.severity === 'high');
  const mediumIssues = issues.filter(i => i.severity === 'medium');
  const lowIssues = issues.filter(i => i.severity === 'low');

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-chart-3" />;
      default:
        return <CheckCircle className="h-4 w-4 text-chart-2" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-destructive/10 text-destructive border-destructive/20',
      high: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      medium: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      low: 'bg-chart-2/10 text-chart-2 border-chart-2/20'
    };
    return <Badge className={colors[severity as keyof typeof colors]}>{severity.toUpperCase()}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Code Health Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Code Health</span>
            <span className={`text-2xl font-bold ${
              healthScore >= 80 ? 'text-chart-1' : 
              healthScore >= 60 ? 'text-chart-3' : 
              'text-destructive'
            }`}>
              {healthScore}%
            </span>
          </div>
          <Progress value={healthScore} className="h-2" />
        </div>

        {/* Issue Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
            <div className="text-2xl font-bold text-destructive">{criticalIssues.length}</div>
            <div className="text-xs text-muted-foreground">Critical Issues</div>
          </div>
          <div className="p-3 rounded-lg bg-chart-4/5 border border-chart-4/20">
            <div className="text-2xl font-bold text-chart-4">{highIssues.length}</div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div className="p-3 rounded-lg bg-chart-3/5 border border-chart-3/20">
            <div className="text-2xl font-bold text-chart-3">{mediumIssues.length}</div>
            <div className="text-xs text-muted-foreground">Medium Issues</div>
          </div>
          <div className="p-3 rounded-lg bg-chart-2/5 border border-chart-2/20">
            <div className="text-2xl font-bold text-chart-2">{lowIssues.length}</div>
            <div className="text-xs text-muted-foreground">Low Priority</div>
          </div>
        </div>

        {/* Issue List */}
        {issues.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {issues.slice(0, 10).map((issue) => (
              <Alert key={issue.id} className="p-3">
                <div className="flex items-start gap-3">
                  {getIssueIcon(issue.type)}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(issue.severity)}
                      <Badge variant="outline" className="text-xs">
                        {issue.category}
                      </Badge>
                    </div>
                    <AlertDescription className="text-sm">
                      <div className="font-medium">{issue.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {issue.file}{issue.line ? `:${issue.line}` : ''}
                      </div>
                      {issue.suggestion && (
                        <div className="text-xs text-chart-2 mt-2 flex items-start gap-1">
                          <Zap className="h-3 w-3 mt-0.5" />
                          <span>{issue.suggestion}</span>
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        ) : (
          <Alert className="border-chart-1/20 bg-chart-1/5">
            <CheckCircle className="h-4 w-4 text-chart-1" />
            <AlertDescription className="text-chart-1">
              No code issues detected! Your code is healthy.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
