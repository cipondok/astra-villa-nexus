import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileWarning, 
  RefreshCw, 
  CheckCircle,
  Clock,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ErrorLogEntry {
  id: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  severity: string;
  component_name?: string;
  page_url?: string;
  created_at: string;
  status: string;
}

interface ErrorLogViewerProps {
  logs: ErrorLogEntry[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const ErrorLogViewer = ({ 
  logs, 
  onRefresh,
  isLoading = false 
}: ErrorLogViewerProps) => {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500/10 text-red-500 border-red-500/20',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      low: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
    };
    return <Badge className={colors[severity] || colors.medium}>{severity.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-500/10 text-blue-500',
      investigating: 'bg-yellow-500/10 text-yellow-500',
      resolved: 'bg-green-500/10 text-green-500'
    };
    return <Badge variant="outline" className={colors[status] || colors.new}>{status}</Badge>;
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedLogs(newExpanded);
  };

  const markAsResolved = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('error_logs')
        .update({ status: 'resolved' })
        .eq('id', logId);

      if (error) throw error;
      toast.success('Error marked as resolved');
      onRefresh?.();
    } catch (err) {
      toast.error('Failed to update error status');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncate = (str: string, length: number) => {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  };

  // Group logs by date
  const groupedLogs = logs.reduce((groups, log) => {
    const date = new Date(log.created_at).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
    return groups;
  }, {} as Record<string, ErrorLogEntry[]>);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileWarning className="h-4 w-4" />
            Error Logs
            {logs.length > 0 && (
              <Badge variant="outline" className="ml-2 text-xs">
                {logs.length}
              </Badge>
            )}
          </CardTitle>
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
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Summary by severity */}
        <div className="grid grid-cols-4 gap-2">
          {['critical', 'high', 'medium', 'low'].map(severity => {
            const count = logs.filter(l => l.severity === severity && l.status !== 'resolved').length;
            const colors: Record<string, string> = {
              critical: 'text-red-500 bg-red-500/5 border-red-500/20',
              high: 'text-orange-500 bg-orange-500/5 border-orange-500/20',
              medium: 'text-yellow-500 bg-yellow-500/5 border-yellow-500/20',
              low: 'text-blue-500 bg-blue-500/5 border-blue-500/20'
            };
            return (
              <div key={severity} className={`p-2 rounded-lg border ${colors[severity]}`}>
                <div className="text-lg font-bold">{count}</div>
                <div className="text-[10px] text-muted-foreground capitalize">{severity}</div>
              </div>
            );
          })}
        </div>

        {/* Log list */}
        {logs.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {Object.entries(groupedLogs).map(([date, dateLogs]) => (
              <div key={date}>
                <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {date}
                </div>
                <div className="space-y-2">
                  {dateLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-2 rounded-lg border bg-card ${
                        log.status === 'resolved' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getSeverityBadge(log.severity)}
                            {getStatusBadge(log.status)}
                            <span className="text-[10px] text-muted-foreground">
                              {formatDate(log.created_at)}
                            </span>
                          </div>
                          <div className="text-xs font-medium">
                            {truncate(log.error_message, 80)}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                            <Badge variant="outline" className="text-[10px] h-4">
                              {log.error_type}
                            </Badge>
                            {log.component_name && (
                              <span>{log.component_name}</span>
                            )}
                          </div>
                        </div>
                        
                        {log.status !== 'resolved' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsResolved(log.id)}
                            className="h-6 px-2 text-[10px]"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>

                      {/* Expandable details */}
                      {(log.error_stack || log.page_url) && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleExpand(log.id)}
                            className="text-[10px] text-primary hover:underline"
                          >
                            {expandedLogs.has(log.id) ? 'Hide details' : 'Show details'}
                          </button>
                          
                          {expandedLogs.has(log.id) && (
                            <div className="mt-2 space-y-2">
                              {log.page_url && (
                                <div className="text-[10px]">
                                  <span className="text-muted-foreground">URL: </span>
                                  <a 
                                    href={log.page_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline inline-flex items-center gap-1"
                                  >
                                    {truncate(log.page_url, 50)}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              )}
                              {log.error_stack && (
                                <pre className="p-2 rounded bg-muted text-[10px] overflow-x-auto whitespace-pre-wrap max-h-32">
                                  {log.error_stack}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Alert className="border-green-500/20 bg-green-500/5">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-600 dark:text-green-400 text-xs">
              No errors logged! System is running smoothly.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
