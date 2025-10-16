import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle2, Clock, XCircle, RefreshCw, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ErrorLog {
  id: string;
  error_timestamp?: string;
  created_at: string;
  error_type: string;
  error_message: string;
  error_stack?: string;
  user_email?: string;
  page_url?: string;
  component_name?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'investigating' | 'resolved' | 'ignored';
  metadata?: any;
}

export default function ErrorMonitoringDashboard() {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('new');
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);

  // Fetch error logs with real-time updates
  const { data: errorLogs, isLoading, refetch } = useQuery({
    queryKey: ['error-logs', filterSeverity, filterStatus],
    queryFn: async () => {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterSeverity !== 'all') {
        query = query.eq('severity', filterSeverity);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as ErrorLog[];
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch error stats
  const { data: stats } = useQuery({
    queryKey: ['error-stats'],
    queryFn: async () => {
      const [newErrors, criticalErrors, todayErrors] = await Promise.all([
        supabase.from('error_logs').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('error_logs').select('*', { count: 'exact', head: true }).eq('severity', 'critical'),
        supabase.from('error_logs').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        new: newErrors.count || 0,
        critical: criticalErrors.count || 0,
        today: todayErrors.count || 0,
        total: errorLogs?.length || 0
      };
    },
    refetchInterval: 10000,
  });

  // Real-time subscription for new errors
  useEffect(() => {
    const channel = supabase
      .channel('error-logs-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'error_logs' 
      }, (payload) => {
        const newError = payload.new as ErrorLog;
        
        // Show toast notification for critical errors
        if (newError.severity === 'critical' || newError.severity === 'high') {
          toast.error(`New ${newError.severity} error detected!`, {
            description: newError.error_message.substring(0, 100),
            action: {
              label: 'View',
              onClick: () => setSelectedError(newError)
            }
          });
        }
        
        refetch();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const handleResolveError = async (errorId: string) => {
    const { error } = await supabase
      .from('error_logs')
      .update({ 
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', errorId);

    if (error) {
      toast.error('Failed to resolve error');
    } else {
      toast.success('Error marked as resolved');
      refetch();
    }
  };

  const handleUpdateStatus = async (errorId: string, status: string) => {
    const { error } = await supabase
      .from('error_logs')
      .update({ status })
      .eq('id', errorId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated');
      refetch();
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: Record<string, string> = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };

    const icons: Record<string, any> = {
      low: CheckCircle2,
      medium: Clock,
      high: AlertTriangle,
      critical: XCircle
    };

    const Icon = icons[severity] || AlertTriangle;

    return (
      <Badge className={variants[severity] || 'bg-gray-100 text-gray-800'}>
        <Icon className="h-3 w-3 mr-1" />
        {severity.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>New Errors</CardDescription>
            <CardTitle className="text-3xl font-bold text-red-600">
              {stats?.new || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical Errors</CardDescription>
            <CardTitle className="text-3xl font-bold text-orange-600">
              {stats?.critical || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last 24 Hours</CardDescription>
            <CardTitle className="text-3xl font-bold text-blue-600">
              {stats?.today || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Errors</CardDescription>
            <CardTitle className="text-3xl font-bold">
              {errorLogs?.length || 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Error List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Error Monitoring Dashboard
              </CardTitle>
              <CardDescription>
                Real-time error tracking and monitoring
              </CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading errors...
            </div>
          ) : errorLogs && errorLogs.length > 0 ? (
            <div className="space-y-4">
              {errorLogs.map((error) => (
                <div
                  key={error.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedError(error)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityBadge(error.severity)}
                        <Badge variant="outline">{error.error_type}</Badge>
                        {error.component_name && (
                          <Badge variant="secondary">{error.component_name}</Badge>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm mb-1">
                        {error.error_message}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {new Date(error.created_at).toLocaleString()}
                        </span>
                        {error.user_email && <span>User: {error.user_email}</span>}
                        {error.page_url && (
                          <span className="truncate max-w-xs">
                            Page: {error.page_url}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Select
                        value={error.status}
                        onValueChange={(value) => handleUpdateStatus(error.id, value)}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="investigating">Investigating</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="ignored">Ignored</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {error.status !== 'resolved' && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleResolveError(error.id);
                          }}
                          size="sm"
                          variant="outline"
                          className="h-8"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {error.error_stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                        View Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                        {error.error_stack}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No errors found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
