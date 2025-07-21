import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Search, Filter, RefreshCw, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";

interface ErrorLog {
  id: string;
  error_type: string;
  error_page: string;
  user_ip: string | null;
  user_agent: string | null;
  referrer_url: string | null;
  user_id: string | null;
  created_at: string;
  metadata: any;
}

const ErrorLogsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorTypeFilter, setErrorTypeFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);

  const { data: errorLogs = [], isLoading, refetch } = useQuery({
    queryKey: ['error-logs', searchTerm, errorTypeFilter],
    queryFn: async () => {
      let query = supabase
        .from('error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (searchTerm) {
        query = query.or(`error_page.ilike.%${searchTerm}%,user_ip.ilike.%${searchTerm}%`);
      }

      if (errorTypeFilter !== 'all') {
        query = query.eq('error_type', errorTypeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as ErrorLog[];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const errorTypes = [...new Set(errorLogs.map(log => log.error_type))];

  const getErrorBadgeVariant = (errorType: string) => {
    switch (errorType) {
      case '404': return 'secondary';
      case '500': return 'destructive';
      case '403': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Error Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by page or IP address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={errorTypeFilter} onValueChange={setErrorTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by error type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Error Types</SelectItem>
                {errorTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type} Error
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => refetch()} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{errorLogs.length}</div>
                <p className="text-xs text-muted-foreground">Total Errors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {errorLogs.filter(log => log.error_type === '404').length}
                </div>
                <p className="text-xs text-muted-foreground">404 Errors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {errorLogs.filter(log => log.error_type === '500').length}
                </div>
                <p className="text-xs text-muted-foreground">Server Errors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">
                  {new Set(errorLogs.map(log => log.user_ip)).size}
                </div>
                <p className="text-xs text-muted-foreground">Unique IPs</p>
              </CardContent>
            </Card>
          </div>

          {/* Error Logs Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Error Type</TableHead>
                  <TableHead>Page</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading error logs...
                    </TableCell>
                  </TableRow>
                ) : errorLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No error logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  errorLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant={getErrorBadgeVariant(log.error_type)}>
                          {log.error_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.error_page}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.user_ip || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                      </TableCell>
                      <TableCell className="text-sm">
                        {log.user_id ? (
                          <Badge variant="outline">Authenticated</Badge>
                        ) : (
                          <Badge variant="secondary">Anonymous</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Error Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Error Log Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Error Type</label>
                  <div className="text-sm text-muted-foreground">
                    <Badge variant={getErrorBadgeVariant(selectedLog.error_type)}>
                      {selectedLog.error_type}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Timestamp</label>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(selectedLog.created_at), 'PPP pp')}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Error Page</label>
                  <div className="text-sm text-muted-foreground font-mono">
                    {selectedLog.error_page}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">IP Address</label>
                  <div className="text-sm text-muted-foreground font-mono">
                    {selectedLog.user_ip || 'Unknown'}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">User Agent</label>
                <div className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded">
                  {selectedLog.user_agent || 'Unknown'}
                </div>
              </div>
              
              {selectedLog.referrer_url && (
                <div>
                  <label className="text-sm font-medium">Referrer URL</label>
                  <div className="text-sm text-muted-foreground font-mono">
                    {selectedLog.referrer_url}
                  </div>
                </div>
              )}
              
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-sm font-medium">Metadata</label>
                  <pre className="text-sm text-muted-foreground bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ErrorLogsTable;