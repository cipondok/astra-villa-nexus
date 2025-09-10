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
  Database, Search, Eye, Clock, CheckCircle, 
  XCircle, AlertTriangle, Wrench, Calendar
} from 'lucide-react';
import { useAlert } from '@/contexts/AlertContext';

interface DatabaseError {
  id: string;
  error_signature: string;
  error_message: string;
  error_severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  table_name: string | null;
  column_name: string | null;
  constraint_name: string | null;
  operation_type: string | null;
  user_id: string | null;
  first_occurrence: string;
  last_seen_at: string;
  occurrence_count: number;
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
  const { showSuccess, showError } = useAlert();

  // Mock data for demonstration
  const mockDatabaseErrors: DatabaseError[] = [
    {
      id: '1',
      error_signature: 'permission_denied_vendor_profiles',
      error_message: 'permission denied for table vendor_business_profiles',
      error_severity: 'HIGH',
      table_name: 'vendor_business_profiles',
      column_name: null,
      constraint_name: null,
      operation_type: 'SELECT',
      user_id: 'admin123',
      first_occurrence: new Date(Date.now() - 86400000).toISOString(),
      last_seen_at: new Date().toISOString(),
      occurrence_count: 15,
      is_resolved: false,
      suggested_fix: 'Create proper RLS policies for admin access',
      fix_applied: null,
      resolved_by: null,
      resolved_at: null,
      metadata: {
        context: 'Admin dashboard access',
        rls_enabled: true,
        policies_count: 0
      },
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '2',
      error_signature: 'column_does_not_exist_updated_at',
      error_message: 'column "updated_at" does not exist',
      error_severity: 'MEDIUM',
      table_name: 'profiles',
      column_name: 'updated_at',
      constraint_name: null,
      operation_type: 'SELECT',
      user_id: 'user456',
      first_occurrence: new Date(Date.now() - 172800000).toISOString(),
      last_seen_at: new Date(Date.now() - 3600000).toISOString(),
      occurrence_count: 8,
      is_resolved: true,
      suggested_fix: 'Add missing updated_at column to profiles table',
      fix_applied: 'ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMP DEFAULT now()',
      resolved_by: 'admin123',
      resolved_at: new Date(Date.now() - 3600000).toISOString(),
      metadata: {
        context: 'Profile update operation',
        table_exists: true,
        column_missing: true
      },
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: '3',
      error_signature: 'foreign_key_constraint_violation',
      error_message: 'insert or update on table "properties" violates foreign key constraint',
      error_severity: 'CRITICAL',
      table_name: 'properties',
      column_name: 'owner_id',
      constraint_name: 'properties_owner_id_fkey',
      operation_type: 'INSERT',
      user_id: 'vendor789',
      first_occurrence: new Date(Date.now() - 43200000).toISOString(),
      last_seen_at: new Date(Date.now() - 1800000).toISOString(),
      occurrence_count: 3,
      is_resolved: false,
      suggested_fix: 'Ensure owner_id references valid user in profiles table',
      fix_applied: null,
      resolved_by: null,
      resolved_at: null,
      metadata: {
        context: 'Property creation',
        referenced_table: 'profiles',
        constraint_type: 'FOREIGN KEY'
      },
      created_at: new Date(Date.now() - 43200000).toISOString()
    }
  ];

  const filteredErrors = mockDatabaseErrors.filter(error => {
    const matchesSearch = searchTerm === "" || 
      error.error_message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (error.table_name && error.table_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSeverity = severityFilter === "all" || error.error_severity === severityFilter;
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "resolved" && error.is_resolved) ||
      (statusFilter === "unresolved" && !error.is_resolved);
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500';
      case 'HIGH':
        return 'bg-orange-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const markAsResolved = (errorId: string) => {
    showSuccess('Resolved', `Database error ${errorId} marked as resolved`);
  };

  const applyFix = (errorId: string) => {
    showSuccess('Fix Applied', `Suggested fix applied for error ${errorId}`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            Database Error Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by error message or table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {mockDatabaseErrors.filter(e => e.error_severity === 'CRITICAL').length}
              </div>
              <div className="text-sm text-red-600">Critical</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {mockDatabaseErrors.filter(e => e.error_severity === 'HIGH').length}
              </div>
              <div className="text-sm text-orange-600">High</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {mockDatabaseErrors.filter(e => e.is_resolved).length}
              </div>
              <div className="text-sm text-green-600">Resolved</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {mockDatabaseErrors.reduce((sum, e) => sum + e.occurrence_count, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Occurrences</div>
            </div>
          </div>

          {/* Results */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredErrors.length} of {mockDatabaseErrors.length} database errors
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severity</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Error Message</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredErrors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No database errors found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredErrors.map((error) => (
                    <TableRow key={error.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getSeverityColor(error.error_severity)}`} />
                          <Badge variant="secondary" className={getSeverityBadgeColor(error.error_severity)}>
                            {error.error_severity}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {error.table_name || 'N/A'}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={error.error_message}>
                          {error.error_message}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {error.occurrence_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(error.last_seen_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        {error.is_resolved ? (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Resolved
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-800">
                            <XCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedError(error)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {!error.is_resolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAsResolved(error.id)}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
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
      <Dialog open={!!selectedError} onOpenChange={() => setSelectedError(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Database Error Details - {selectedError?.error_severity}
            </DialogTitle>
          </DialogHeader>
          {selectedError && (
            <ScrollArea className="max-h-96">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Error Signature</label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {selectedError.error_signature}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Table Name</label>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded">
                      {selectedError.table_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Operation Type</label>
                    <p className="text-sm bg-gray-100 p-2 rounded">
                      {selectedError.operation_type || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Occurrence Count</label>
                    <p className="text-sm bg-gray-100 p-2 rounded">
                      {selectedError.occurrence_count} times
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Full Error Message</label>
                  <p className="text-sm bg-red-50 border border-red-200 p-3 rounded">
                    {selectedError.error_message}
                  </p>
                </div>

                {selectedError.suggested_fix && (
                  <div>
                    <label className="text-sm font-medium">Suggested Fix</label>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                      <p className="text-sm mb-2">{selectedError.suggested_fix}</p>
                      {!selectedError.is_resolved && (
                        <Button 
                          size="sm" 
                          onClick={() => applyFix(selectedError.id)}
                          className="gap-2"
                        >
                          <Wrench className="h-3 w-3" />
                          Apply Fix
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {selectedError.fix_applied && (
                  <div>
                    <label className="text-sm font-medium">Fix Applied</label>
                    <p className="text-sm bg-green-50 border border-green-200 p-3 rounded font-mono">
                      {selectedError.fix_applied}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">First Occurrence</label>
                    <p className="text-sm bg-gray-100 p-2 rounded flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {new Date(selectedError.first_occurrence).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Seen</label>
                    <p className="text-sm bg-gray-100 p-2 rounded flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {new Date(selectedError.last_seen_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {selectedError.metadata && (
                  <div>
                    <label className="text-sm font-medium">Additional Context</label>
                    <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded overflow-x-auto">
                      {JSON.stringify(selectedError.metadata, null, 2)}
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

export default DatabaseErrorMonitor;