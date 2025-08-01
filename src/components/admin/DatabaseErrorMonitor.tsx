import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { 
  Database, AlertTriangle, Search, Filter, RefreshCw, 
  Eye, Clock, Server, CheckCircle, XCircle, Zap
} from "lucide-react";
import { format } from "date-fns";

interface DatabaseError {
  id: string;
  error_signature: string;
  error_type: string;
  error_message: string;
  error_severity: string;
  table_name: string | null;
  occurrence_count: number;
  first_seen_at: string;
  last_seen_at: string;
  is_resolved: boolean;
  suggested_fix: string | null;
  fix_applied: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  metadata: any;
  created_at: string;
}

const DatabaseErrorMonitor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedError, setSelectedError] = useState<DatabaseError | null>(null);

  const { data: databaseErrors = [], isLoading, refetch } = useQuery({
    queryKey: ['database-errors', searchTerm, severityFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('database_error_tracking')
        .select('*')
        .order('last_seen_at', { ascending: false })
        .limit(100);

      if (searchTerm) {
        query = query.or(`error_message.ilike.%${searchTerm}%,table_name.ilike.%${searchTerm}%`);
      }

      if (severityFilter !== 'all') {
        query = query.eq('error_severity', severityFilter);
      }

      if (statusFilter === 'resolved') {
        query = query.eq('is_resolved', true);
      } else if (statusFilter === 'unresolved') {
        query = query.eq('is_resolved', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as DatabaseError[];
    },
    refetchInterval: 30000,
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'ERROR': return 'text-red-600 bg-red-50 border-red-200';
      case 'WARNING': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'INFO': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'destructive';
      case 'ERROR': return 'destructive';
      case 'WARNING': return 'outline';
      default: return 'secondary';
    }
  };

  const markAsResolved = async (errorId: string, fixApplied: string) => {
    try {
      const { error } = await supabase
        .from('database_error_tracking')
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
          fix_applied: fixApplied,
          resolved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', errorId);
      
      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Failed to mark error as resolved:', error);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
            <Database className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Database Error Monitor</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track and resolve database issues</p>
          </div>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Errors</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">{databaseErrors.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Critical</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {databaseErrors.filter(e => e.error_severity === 'CRITICAL').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Resolved</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {databaseErrors.filter(e => e.is_resolved).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Tables Affected</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {new Set(databaseErrors.map(e => e.table_name).filter(Boolean)).size}
                </p>
              </div>
              <Server className="h-8 w-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by error message or table name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Table */}
      <Card className="flex-1 border-0 shadow-sm">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Severity</TableHead>
                <TableHead>Error Type</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="w-24">Count</TableHead>
                <TableHead className="w-32">Last Seen</TableHead>
                <TableHead className="w-20">Status</TableHead>
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                      <span className="text-gray-500">Loading database errors...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : databaseErrors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-2">
                      <CheckCircle className="h-12 w-12 text-green-300" />
                      <span className="text-gray-500 font-medium">No database errors found</span>
                      <span className="text-sm text-gray-400">System is running smoothly</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                databaseErrors.map((error) => (
                  <TableRow key={error.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <TableCell>
                      <Badge 
                        variant={getSeverityBadgeVariant(error.error_severity)}
                        className={`font-mono text-xs ${getSeverityColor(error.error_severity)}`}
                      >
                        {error.error_severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{error.error_type}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-blue-600">
                        {error.table_name || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                        {error.error_message.length > 60 
                          ? error.error_message.substring(0, 60) + '...'
                          : error.error_message
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {error.occurrence_count}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(error.last_seen_at), 'MMM dd HH:mm')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {error.is_resolved ? (
                        <Badge className="bg-green-100 text-green-800">
                          Resolved
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedError(error)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Error Detail Dialog */}
      <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-red-500" />
              <span>Database Error Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedError && (
            <ScrollArea className="px-6 pb-6 max-h-[70vh]">
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-0 bg-red-50">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-red-600 mb-1">Severity</p>
                      <Badge variant={getSeverityBadgeVariant(selectedError.error_severity)}>
                        {selectedError.error_severity}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-blue-50">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-blue-600 mb-1">Occurrences</p>
                      <p className="text-sm font-mono">{selectedError.occurrence_count}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-green-50">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-green-600 mb-1">Table</p>
                      <p className="text-sm font-mono">{selectedError.table_name || 'N/A'}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-orange-50">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-orange-600 mb-1">Status</p>
                      <Badge variant={selectedError.is_resolved ? "outline" : "destructive"}>
                        {selectedError.is_resolved ? "Resolved" : "Active"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">Error Message</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedError.error_message}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {selectedError.suggested_fix && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Suggested Fix</h3>
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          {selectedError.suggested_fix}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedError.metadata && Object.keys(selectedError.metadata).length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">Metadata</h3>
                      <div className="bg-gray-900 p-4 rounded-lg overflow-auto">
                        <pre className="text-sm text-green-400 font-mono">
                          {JSON.stringify(selectedError.metadata, null, 2)}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {!selectedError.is_resolved && (
                  <div className="flex justify-end">
                    <Button 
                      onClick={() => markAsResolved(selectedError.id, "Manual resolution")}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Mark as Resolved
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatabaseErrorMonitor;