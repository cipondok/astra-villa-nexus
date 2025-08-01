import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Search, Filter, RefreshCw, Eye, Globe, Clock, User, ExternalLink, TrendingUp } from "lucide-react";
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
    refetchInterval: 30000,
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

  const getErrorColor = (errorType: string) => {
    switch (errorType) {
      case '404': return 'text-orange-600 bg-orange-50 border-orange-200';
      case '500': return 'text-red-600 bg-red-50 border-red-200';
      case '403': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="h-full flex flex-col space-y-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50/20 dark:from-slate-900 dark:to-blue-900/10">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Error Monitoring</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Real-time error tracking and analysis</p>
          </div>
        </div>
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="sm"
          className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Errors</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{errorLogs.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">404 Errors</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                  {errorLogs.filter(log => log.error_type === '404').length}
                </p>
              </div>
              <Globe className="h-8 w-8 text-orange-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">Server Errors</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  {errorLogs.filter(log => log.error_type === '500').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Unique IPs</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  {new Set(errorLogs.map(log => log.user_ip)).size}
                </p>
              </div>
              <User className="h-8 w-8 text-purple-500/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by page URL or IP address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200/50"
                />
              </div>
            </div>
            
            <Select value={errorTypeFilter} onValueChange={setErrorTypeFilter}>
              <SelectTrigger className="w-full lg:w-48 border-gray-200 focus:border-blue-300">
                <Filter className="h-4 w-4 mr-2 text-gray-500" />
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
          </div>
        </CardContent>
      </Card>

      {/* Error Logs Table */}
      <Card className="flex-1 border-0 shadow-sm">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-100 dark:border-gray-800">
                <TableHead className="w-24 font-semibold text-gray-700 dark:text-gray-300">Type</TableHead>
                <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Page URL</TableHead>
                <TableHead className="w-32 font-semibold text-gray-700 dark:text-gray-300">IP Address</TableHead>
                <TableHead className="w-40 font-semibold text-gray-700 dark:text-gray-300">Timestamp</TableHead>
                <TableHead className="w-24 font-semibold text-gray-700 dark:text-gray-300">User</TableHead>
                <TableHead className="w-16 font-semibold text-gray-700 dark:text-gray-300"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center space-x-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                      <span className="text-gray-500">Loading error logs...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : errorLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center space-y-2">
                      <AlertTriangle className="h-12 w-12 text-gray-300" />
                      <span className="text-gray-500 font-medium">No error logs found</span>
                      <span className="text-sm text-gray-400">Errors will appear here when they occur</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                errorLogs.map((log) => (
                  <TableRow 
                    key={log.id} 
                    className="border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <TableCell>
                      <Badge 
                        variant={getErrorBadgeVariant(log.error_type)}
                        className={`font-mono font-semibold px-2 py-1 ${getErrorColor(log.error_type)}`}
                      >
                        {log.error_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-mono text-sm text-gray-700 dark:text-gray-300 truncate">
                          {truncateText(log.error_page, 60)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-gray-700 dark:text-gray-300">
                        {log.user_ip || 'Unknown'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.user_id ? (
                        <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                          <User className="h-3 w-3 mr-1" />
                          Auth
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-gray-600">
                          Guest
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Eye className="h-4 w-4 text-gray-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Enhanced Error Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Error Log Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedLog && (
            <ScrollArea className="px-6 pb-6 max-h-[70vh]">
              <div className="space-y-6">
                {/* Quick Info Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="border-0 bg-gradient-to-br from-red-50 to-red-100/50">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-red-600 mb-1">Error Type</p>
                      <Badge variant={getErrorBadgeVariant(selectedLog.error_type)} className="font-mono">
                        {selectedLog.error_type}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-blue-600 mb-1">Timestamp</p>
                      <p className="text-sm font-mono text-blue-900">
                        {format(new Date(selectedLog.created_at), 'MMM dd, HH:mm:ss')}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100/50">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-purple-600 mb-1">IP Address</p>
                      <p className="text-sm font-mono text-purple-900">
                        {selectedLog.user_ip || 'Unknown'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100/50">
                    <CardContent className="p-4">
                      <p className="text-xs font-medium text-green-600 mb-1">User Status</p>
                      <Badge variant={selectedLog.user_id ? "outline" : "secondary"}>
                        {selectedLog.user_id ? "Authenticated" : "Anonymous"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Detailed Information */}
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">Error Page URL</h3>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="font-mono text-sm break-all text-gray-700 dark:text-gray-300">
                          {selectedLog.error_page}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <h3 className="font-semibold text-gray-900">User Agent</h3>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="font-mono text-sm text-gray-700 dark:text-gray-300 break-all">
                          {selectedLog.user_agent || 'Unknown'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedLog.referrer_url && (
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                          <h3 className="font-semibold text-gray-900">Referrer URL</h3>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <p className="font-mono text-sm break-all text-gray-700 dark:text-gray-300">
                            {selectedLog.referrer_url}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Additional Metadata</h3>
                        <div className="bg-gray-900 dark:bg-gray-800 p-4 rounded-lg overflow-auto">
                          <pre className="text-sm text-green-400 font-mono">
                            {JSON.stringify(selectedLog.metadata, null, 2)}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ErrorLogsTable;