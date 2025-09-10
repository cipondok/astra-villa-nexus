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

  // Mock data for demonstration
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
      metadata: {
        timestamp: new Date().toISOString(),
        browser: 'Chrome',
        os: 'Windows'
      }
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
      stack_trace: 'TypeError: Cannot read properties of undefined (reading "map")\n    at PropertyManagement.tsx:45:23\n    at renderWithHooks (react-dom.development.js:16305:18)',
      created_at: new Date(Date.now() - 1800000).toISOString(),
      metadata: {
        component: 'PropertyManagement',
        props: { activeTab: 'properties' },
        browser: 'Safari',
        os: 'macOS'
      }
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
      stack_trace: 'Error: Network Error\n    at XMLHttpRequest.handleError (axios.js:2087:14)',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      metadata: {
        endpoint: '/api/vendors',
        method: 'GET',
        status: 500,
        browser: 'Firefox',
        os: 'Linux'
      }
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
      case '404':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      case 'JavaScript':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'API':
        return <Globe className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case '404':
        return 'bg-orange-100 text-orange-800';
      case 'JavaScript':
        return 'bg-red-100 text-red-800';
      case 'API':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Application Error Logs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by page, message, or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={errorTypeFilter} onValueChange={setErrorTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="404">404 Errors</SelectItem>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
                <SelectItem value="API">API Errors</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredLogs.length} of {mockErrorLogs.length} error logs
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Error Page</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>User IP</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No error logs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getErrorIcon(log.error_type)}
                          <Badge variant="secondary" className={getErrorTypeColor(log.error_type)}>
                            {log.error_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.error_page}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={log.error_message}>
                          {log.error_message}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.user_ip || 'Unknown'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
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
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getErrorIcon(selectedLog.error_type)}
              Error Log Details - {selectedLog?.error_type}
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Error Page</label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {selectedLog.error_page}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <p className="text-sm bg-gray-100 p-2 rounded flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(selectedLog.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">User IP</label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {selectedLog.user_ip || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">User ID</label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded flex items-center gap-2">
                      <User className="h-3 w-3" />
                      {selectedLog.user_id || 'Anonymous'}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Error Message</label>
                  <p className="text-sm bg-red-50 border border-red-200 p-3 rounded">
                    {selectedLog.error_message}
                  </p>
                </div>

                {selectedLog.stack_trace && (
                  <div>
                    <label className="text-sm font-medium">Stack Trace</label>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                      {selectedLog.stack_trace}
                    </pre>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium">User Agent</label>
                  <p className="text-xs bg-gray-100 p-2 rounded font-mono">
                    {selectedLog.user_agent || 'Unknown'}
                  </p>
                </div>

                {selectedLog.referrer_url && (
                  <div>
                    <label className="text-sm font-medium">Referrer URL</label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {selectedLog.referrer_url}
                    </p>
                  </div>
                )}

                {selectedLog.metadata && (
                  <div>
                    <label className="text-sm font-medium">Additional Metadata</label>
                    <pre className="text-xs bg-blue-50 border border-blue-200 p-3 rounded overflow-x-auto">
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