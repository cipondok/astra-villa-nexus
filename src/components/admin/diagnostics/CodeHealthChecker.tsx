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
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-500/10 text-red-500 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      low: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
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
              healthScore >= 80 ? 'text-green-500' : 
              healthScore >= 60 ? 'text-yellow-500' : 
              'text-red-500'
            }`}>
              {healthScore}%
            </span>
          </div>
          <Progress value={healthScore} className="h-2" />
        </div>

        {/* Issue Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="text-2xl font-bold text-red-500">{criticalIssues.length}</div>
            <div className="text-xs text-muted-foreground">Critical Issues</div>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <div className="text-2xl font-bold text-orange-500">{highIssues.length}</div>
            <div className="text-xs text-muted-foreground">High Priority</div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-500">{mediumIssues.length}</div>
            <div className="text-xs text-muted-foreground">Medium Issues</div>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
            <div className="text-2xl font-bold text-blue-500">{lowIssues.length}</div>
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
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-start gap-1">
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
          <Alert className="border-green-500/20 bg-green-500/5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              No code issues detected! Your code is healthy.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
