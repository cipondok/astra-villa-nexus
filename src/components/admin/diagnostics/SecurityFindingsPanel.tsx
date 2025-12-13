import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { useState } from 'react';

interface SecurityFinding {
  id: string;
  internal_id: string;
  name: string;
  description: string;
  level: 'error' | 'warn' | 'info';
  category?: string;
  details?: string;
  link?: string;
  ignore?: boolean;
  ignore_reason?: string;
}

interface SecurityFindingsPanelProps {
  findings: SecurityFinding[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const SecurityFindingsPanel = ({ 
  findings, 
  onRefresh,
  isLoading = false 
}: SecurityFindingsPanelProps) => {
  const [showIgnored, setShowIgnored] = useState(false);
  const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set());

  const errorFindings = findings.filter(f => f.level === 'error' && !f.ignore);
  const warnFindings = findings.filter(f => f.level === 'warn' && !f.ignore);
  const ignoredFindings = findings.filter(f => f.ignore);
  const activeFindings = findings.filter(f => !f.ignore);

  const displayFindings = showIgnored ? findings : activeFindings;

  const getLevelIcon = (level: string, ignore?: boolean) => {
    if (ignore) {
      return <EyeOff className="h-4 w-4 text-muted-foreground" />;
    }
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warn':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLevelBadge = (level: string, ignore?: boolean) => {
    if (ignore) {
      return <Badge variant="outline" className="text-muted-foreground">IGNORED</Badge>;
    }
    const colors = {
      error: 'bg-red-500/10 text-red-500 border-red-500/20',
      warn: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      info: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    return <Badge className={colors[level as keyof typeof colors]}>{level.toUpperCase()}</Badge>;
  };

  const toggleDetails = (id: string) => {
    const newExpanded = new Set(expandedDetails);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDetails(newExpanded);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Security Findings
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIgnored(!showIgnored)}
              className="h-7 text-xs"
            >
              {showIgnored ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
              {showIgnored ? 'Hide Ignored' : `Show Ignored (${ignoredFindings.length})`}
            </Button>
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="h-7 text-xs"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="text-lg font-bold text-red-500">{errorFindings.length}</div>
            <div className="text-[10px] text-muted-foreground">Errors</div>
          </div>
          <div className="p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
            <div className="text-lg font-bold text-yellow-500">{warnFindings.length}</div>
            <div className="text-[10px] text-muted-foreground">Warnings</div>
          </div>
          <div className="p-2 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="text-lg font-bold text-green-500">{ignoredFindings.length}</div>
            <div className="text-[10px] text-muted-foreground">Resolved</div>
          </div>
        </div>

        {/* Findings List */}
        {displayFindings.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {displayFindings.map((finding) => (
              <Alert 
                key={finding.internal_id || finding.id} 
                className={`p-2 ${finding.ignore ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start gap-2">
                  {getLevelIcon(finding.level, finding.ignore)}
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-xs truncate">{finding.name}</div>
                        <div className="text-[10px] text-muted-foreground line-clamp-2">
                          {finding.description}
                        </div>
                      </div>
                      {getLevelBadge(finding.level, finding.ignore)}
                    </div>
                    
                    {finding.category && (
                      <Badge variant="outline" className="text-[10px] h-4">
                        {finding.category}
                      </Badge>
                    )}

                    {finding.ignore && finding.ignore_reason && (
                      <div className="text-[10px] text-muted-foreground italic mt-1">
                        Ignored: {finding.ignore_reason}
                      </div>
                    )}

                    {finding.details && (
                      <div className="mt-1">
                        <button
                          onClick={() => toggleDetails(finding.internal_id || finding.id)}
                          className="text-[10px] text-primary hover:underline"
                        >
                          {expandedDetails.has(finding.internal_id || finding.id) 
                            ? 'Hide details' 
                            : 'Show details'}
                        </button>
                        {expandedDetails.has(finding.internal_id || finding.id) && (
                          <pre className="mt-1 p-2 rounded bg-muted text-[10px] overflow-x-auto whitespace-pre-wrap">
                            {finding.details}
                          </pre>
                        )}
                      </div>
                    )}

                    {finding.link && (
                      <a
                        href={finding.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                      >
                        Learn more <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        ) : (
          <Alert className="border-green-500/20 bg-green-500/5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-600 dark:text-green-400 text-xs">
              No active security findings! System is secure.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
