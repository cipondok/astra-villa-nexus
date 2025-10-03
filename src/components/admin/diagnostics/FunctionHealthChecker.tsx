import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Wrench,
  AlertTriangle,
  Code2
} from 'lucide-react';

interface FunctionStatus {
  id: string;
  name: string;
  module: string;
  status: 'complete' | 'incomplete' | 'broken' | 'missing';
  completionPercentage: number;
  issues: string[];
  dependencies: string[];
  lastChecked: string;
  estimatedFixTime?: string;
}

interface FunctionHealthCheckerProps {
  functions: FunctionStatus[];
}

export const FunctionHealthChecker = ({ functions }: FunctionHealthCheckerProps) => {
  const completeFunctions = functions.filter(f => f.status === 'complete');
  const incompleteFunctions = functions.filter(f => f.status === 'incomplete');
  const brokenFunctions = functions.filter(f => f.status === 'broken');
  const missingFunctions = functions.filter(f => f.status === 'missing');

  const overallCompletion = Math.round(
    functions.reduce((sum, f) => sum + f.completionPercentage, 0) / functions.length
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'broken':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'incomplete':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'missing':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      complete: 'bg-green-500/10 text-green-500',
      incomplete: 'bg-yellow-500/10 text-yellow-500',
      broken: 'bg-red-500/10 text-red-500',
      missing: 'bg-orange-500/10 text-orange-500'
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5" />
          Function Health Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Function Completion</span>
            <span className={`text-2xl font-bold ${
              overallCompletion >= 80 ? 'text-green-500' : 
              overallCompletion >= 60 ? 'text-yellow-500' : 
              'text-red-500'
            }`}>
              {overallCompletion}%
            </span>
          </div>
          <Progress value={overallCompletion} className="h-2" />
        </div>

        {/* Function Status Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="text-2xl font-bold text-green-500">{completeFunctions.length}</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-500">{incompleteFunctions.length}</div>
            <div className="text-xs text-muted-foreground">Incomplete</div>
          </div>
          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="text-2xl font-bold text-red-500">{brokenFunctions.length}</div>
            <div className="text-xs text-muted-foreground">Broken</div>
          </div>
          <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <div className="text-2xl font-bold text-orange-500">{missingFunctions.length}</div>
            <div className="text-xs text-muted-foreground">Missing</div>
          </div>
        </div>

        {/* Function List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {functions.map((func) => (
            <div key={func.id} className="p-3 rounded-lg border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(func.status)}
                  <span className="font-medium text-sm">{func.name}</span>
                </div>
                {getStatusBadge(func.status)}
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{func.module}</span>
                <span>{func.completionPercentage}% complete</span>
              </div>
              
              {func.status !== 'complete' && (
                <>
                  <Progress value={func.completionPercentage} className="h-1" />
                  
                  {func.issues.length > 0 && (
                    <div className="space-y-1">
                      {func.issues.map((issue, idx) => (
                        <div key={idx} className="text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
                          <AlertTriangle className="h-3 w-3 mt-0.5" />
                          <span>{issue}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {func.estimatedFixTime && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                      <Clock className="h-3 w-3" />
                      <span>Est. fix time: {func.estimatedFixTime}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
