import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, Eye, Calendar, User, Globe,
  AlertTriangle, Info, XCircle
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';

interface ErrorLog {
  id: string;
  error_type: string;
  error_page: string;
  user_ip: string | null;
  user_agent: string | null;
  referrer_url: string | null;
  user_id: string | null;
  error_message: string;
  stack_trace: string | null;
  created_at: string;
  metadata: any;
}

const ErrorLogsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [errorTypeFilter, setErrorTypeFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const { showSuccess } = useAlert();

  const mockErrorLogs: ErrorLog[] = [
    {
      id: '1',
      error_type: '404',
      error_page: '/admin/non-existent-page',
      user_ip: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      referrer_url: '/admin-dashboard',
      user_id: 'user123',
      error_message: 'Page not found: /admin/non-existent-page',
      stack_trace: null,
      created_at: new Date().toISOString(),
      metadata: { timestamp: new Date().toISOString(), browser: 'Chrome', os: 'Windows' }
    },
    {
      id: '2',
      error_type: 'JavaScript',
      error_page: '/admin-dashboard',
      user_ip: '10.0.0.15',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      referrer_url: '/login',
      user_id: 'admin456',
      error_message: 'TypeError: Cannot read properties of undefined (reading "map")',
      stack_trace: 'TypeError: Cannot read properties of undefined',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      metadata: { component: 'PropertyManagement', browser: 'Safari', os: 'macOS' }
    },
    {
      id: '3',
      error_type: 'API',
      error_page: '/vendor-management',
      user_ip: '172.16.0.5',
      user_agent: 'Mozilla/5.0 (X11; Linux x86_64)',
      referrer_url: '/admin-dashboard',
      user_id: 'vendor789',
      error_message: 'Failed to fetch vendor data: Network error',
      stack_trace: 'Error: Network Error',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      metadata: { endpoint: '/api/vendors', method: 'GET', status: 500 }
    }
  ];

  const filteredLogs = mockErrorLogs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      log.error_page.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user_ip && log.user_ip.includes(searchTerm));
    const matchesType = errorTypeFilter === "all" || log.error_type === errorTypeFilter;
    return matchesSearch && matchesType;
  });

  const getErrorIcon = (type: string) => {
    switch (type) {
      case '404': return <XCircle className="h-3.5 w-3.5 text-secondary-foreground" />;
      case 'JavaScript': return <AlertTriangle className="h-3.5 w-3.5 text-destructive" />;
      case 'API': return <Globe className="h-3.5 w-3.5 text-primary" />;
      default: return <Info className="h-3.5 w-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-3">
      {/* Compact Header */}
      <div className="rounded-lg border border-border/40 bg-muted/20 p-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-destructive text-destructive-foreground shadow-sm">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Error Logs</h1>
            <p className="text-[10px] text-muted-foreground">Monitor 404 errors and system errors with IP tracking</p>
          </div>
        </div>
      </div>

      <Card className="border-l-4 border-l-destructive">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="flex items-center gap-2 text-xs">
            <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
            Application Error Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0 space-y-3">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search by page, message, or IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-7 text-[10px]"
              />
            </div>
            <Select value={errorTypeFilter} onValueChange={setErrorTypeFilter}>
              <SelectTrigger className="w-full sm:w-32 h-7 text-[10px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[10px]">All Types</SelectItem>
                <SelectItem value="404" className="text-[10px]">404 Errors</SelectItem>
                <SelectItem value="JavaScript" className="text-[10px]">JavaScript</SelectItem>
                <SelectItem value="API" className="text-[10px]">API Errors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-[9px] text-muted-foreground">
            Showing {filteredLogs.length} of {mockErrorLogs.length} logs
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden admin-compact-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[9px]">Type</TableHead>
                  <TableHead className="text-[9px]">Page</TableHead>
                  <TableHead className="text-[9px]">Message</TableHead>
                  <TableHead className="text-[9px]">IP</TableHead>
                  <TableHead className="text-[9px]">Time</TableHead>
                  <TableHead className="text-[9px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-[10px] text-muted-foreground">
                      No error logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getErrorIcon(log.error_type)}
                          <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4">
                            {log.error_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[9px] max-w-[100px] truncate">
                        {log.error_page}
                      </TableCell>
                      <TableCell className="text-[9px] max-w-[150px] truncate" title={log.error_message}>
                        {log.error_message}
                      </TableCell>
                      <TableCell className="font-mono text-[9px]">
                        {log.user_ip || '--'}
                      </TableCell>
                      <TableCell className="text-[9px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {new Date(log.created_at).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)} className="h-6 w-6 p-0">
                          <Eye className="h-3 w-3" />
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

      {/* Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              {selectedLog && getErrorIcon(selectedLog.error_type)}
              Error Details - {selectedLog?.error_type}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-80">
              <div className="space-y-3 text-[10px]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-medium">Error Page</label>
                    <p className="font-mono bg-muted p-2 rounded text-[9px]">{selectedLog.error_page}</p>
                  </div>
                  <div>
                    <label className="font-medium">Time</label>
                    <p className="bg-muted p-2 rounded flex items-center gap-1 text-[9px]">
                      <Calendar className="h-2.5 w-2.5" />
                      {new Date(selectedLog.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="font-medium">User IP</label>
                    <p className="font-mono bg-muted p-2 rounded text-[9px]">{selectedLog.user_ip || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="font-medium">User ID</label>
                    <p className="font-mono bg-muted p-2 rounded flex items-center gap-1 text-[9px]">
                      <User className="h-2.5 w-2.5" />
                      {selectedLog.user_id || 'Anonymous'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="font-medium">Error Message</label>
                  <p className="bg-destructive/10 border border-destructive/20 p-2 rounded text-[9px]">
                    {selectedLog.error_message}
                  </p>
                </div>

                {selectedLog.stack_trace && (
                  <div>
                    <label className="font-medium">Stack Trace</label>
                    <pre className="bg-foreground text-background p-2 rounded overflow-x-auto text-[8px]">
                      {selectedLog.stack_trace}
                    </pre>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div>
                    <label className="font-medium">Metadata</label>
                    <pre className="bg-accent/20 border border-accent/30 p-2 rounded overflow-x-auto text-[8px]">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
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

export default ErrorLogsTable;
