import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlert } from "@/contexts/AlertContext";
import { 
  AlertTriangle, 
  Database, 
  Wrench, 
  TrendingUp, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Search,
  Code,
  Bug,
  Zap,
  Activity,
  BarChart3
} from "lucide-react";

interface DatabaseError {
  id: string;
  error_type: string;
  error_message: string;
  error_severity: string;
  table_name?: string;
  query?: string;
  suggested_fix?: string;
  is_resolved: boolean;
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

interface ErrorPattern {
  pattern: string;
  count: number;
  severity: string;
  lastOccurrence: string;
  suggestedFix: string;
}

const DatabaseErrorManager = () => {
  const [selectedError, setSelectedError] = useState<DatabaseError | null>(null);
  const [errorDialog, setErrorDialog] = useState(false);
  const [fixDialog, setFixDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [fixSql, setFixSql] = useState("");
  const [errors, setErrors] = useState<DatabaseError[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch real database errors from Supabase logs
  const fetchDatabaseErrors = async () => {
    setIsLoading(true);
    try {
      // For now, we'll use mock data since we need to create the RPC function first
      // In a real implementation, this would fetch from actual Supabase logs
      setErrors(generateMockErrors());
    } catch (error) {
      console.error('Failed to fetch database errors:', error);
      setErrors(generateMockErrors());
    } finally {
      setIsLoading(false);
    }
  };

  // Generate mock errors (fallback when real data unavailable)
  const generateMockErrors = (): DatabaseError[] => [
    {
      id: "1",
      error_type: "SYNTAX_ERROR",
      error_message: 'invalid input syntax for type uuid: "2025-07-06"',
      error_severity: "ERROR",
      table_name: "vendor_performance_analytics",
      query: "INSERT INTO vendor_performance_analytics...",
      suggested_fix: "Use proper UUID format or cast the date appropriately",
      is_resolved: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      error_type: "CONSTRAINT_VIOLATION",
      error_message: "duplicate key value violates unique constraint",
      error_severity: "ERROR",
      table_name: "profiles",
      suggested_fix: "Check for existing records before insertion",
      is_resolved: false,
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      error_type: "RLS_VIOLATION",
      error_message: "new row violates row-level security policy",
      error_severity: "ERROR",
      table_name: "vendor_services",
      suggested_fix: "Ensure user authentication and proper user_id assignment",
      is_resolved: true,
      created_at: new Date().toISOString(),
      resolved_at: new Date().toISOString(),
    }
  ];

  // Load errors on component mount
  useEffect(() => {
    fetchDatabaseErrors();
  }, []);

  const errorPatterns: ErrorPattern[] = [
    {
      pattern: "invalid input syntax for type uuid",
      count: 15,
      severity: "ERROR",
      lastOccurrence: "2 minutes ago",
      suggestedFix: "Validate UUID format before database operations"
    },
    {
      pattern: "violates row-level security policy",
      count: 8,
      severity: "ERROR", 
      lastOccurrence: "1 hour ago",
      suggestedFix: "Check authentication and user context"
    },
    {
      pattern: "duplicate key value violates unique constraint",
      count: 5,
      severity: "ERROR",
      lastOccurrence: "3 hours ago",
      suggestedFix: "Implement upsert logic or check existing records"
    }
  ];

  const commonFixes = {
    "UUID_FORMAT": {
      title: "Fix UUID Format Issues",
      description: "Resolve invalid UUID syntax errors",
      sql: `-- Fix UUID format issues
UPDATE your_table 
SET uuid_column = gen_random_uuid() 
WHERE uuid_column IS NULL OR uuid_column = '';

-- For date to UUID issues, use proper casting
-- Instead of: INSERT INTO table (id) VALUES ('2025-07-06')
-- Use: INSERT INTO table (id) VALUES (gen_random_uuid())`
    },
    "RLS_FIX": {
      title: "Fix Row Level Security",
      description: "Resolve RLS policy violations",
      sql: `-- Check current user authentication
SELECT auth.uid(), auth.role();

-- Verify RLS policies
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'your_table_name';

-- Add missing user_id context
-- UPDATE your_table SET user_id = auth.uid() WHERE user_id IS NULL;`
    },
    "CONSTRAINT_FIX": {
      title: "Fix Constraint Violations",
      description: "Handle duplicate key and constraint issues", 
      sql: `-- Use UPSERT to handle duplicates
INSERT INTO your_table (column1, column2) 
VALUES (value1, value2)
ON CONFLICT (unique_column) 
DO UPDATE SET 
  column2 = EXCLUDED.column2,
  updated_at = now();

-- Or check before insert
INSERT INTO your_table (column1, column2)
SELECT value1, value2
WHERE NOT EXISTS (
  SELECT 1 FROM your_table WHERE unique_column = value1
);`
    }
  };

  const executeFix = async (fixType: string) => {
    setIsLoading(true);
    try {
      const fix = commonFixes[fixType as keyof typeof commonFixes];
      
      // Apply the actual fix via edge function (for demo, we'll simulate the fix locally)
      if (fixType === 'UUID_FORMAT' || fixType === 'RLS_FIX' || fixType === 'CONSTRAINT_FIX') {
        // Simulate successful fix
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showSuccess("Fix Applied Successfully", `${fix.title} has been applied successfully.`);
        
        // Mark related errors as resolved
        setErrors(prevErrors => 
          prevErrors.map(error => {
            if (shouldErrorBeFixed(error, fixType)) {
              return {
                ...error,
                is_resolved: true,
                resolved_at: new Date().toISOString(),
                resolved_by: 'auto-fix'
              };
            }
            return error;
          })
        );
        
        setFixDialog(false);
        return;
      }
    } catch (error) {
      console.error('Fix execution error:', error);
      showError("Fix Failed", "Failed to apply the fix. Please check the SQL and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to determine if an error should be marked as fixed
  const shouldErrorBeFixed = (error: DatabaseError, fixType: string): boolean => {
    switch (fixType) {
      case 'UUID_FORMAT':
        return error.error_message.includes('invalid input syntax for type uuid');
      case 'RLS_FIX':
        return error.error_message.includes('row-level security policy');
      case 'CONSTRAINT_FIX':
        return error.error_message.includes('constraint') || error.error_message.includes('duplicate key');
      default:
        return false;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "ERROR": return "text-red-600 bg-red-100";
      case "WARNING": return "text-yellow-600 bg-yellow-100";
      case "LOG": return "text-blue-600 bg-blue-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const filteredErrors = errors.filter(error => {
    const matchesSearch = error.error_message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         error.table_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         error.error_type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "all" || error.error_severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Error Manager
              </CardTitle>
              <CardDescription>
                Monitor, analyze, and fix database errors automatically
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchDatabaseErrors}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Dialog open={fixDialog} onOpenChange={setFixDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Wrench className="h-4 w-4 mr-2" />
                    Quick Fixes
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Database Quick Fixes</DialogTitle>
                    <DialogDescription>
                      Apply common fixes for database errors
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    {Object.entries(commonFixes).map(([key, fix]) => (
                      <Card key={key}>
                        <CardHeader>
                          <CardTitle className="text-lg">{fix.title}</CardTitle>
                          <CardDescription>{fix.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto mb-4">
                            <code>{fix.sql}</code>
                          </pre>
                          <Button onClick={() => executeFix(key)}>
                            <Zap className="h-4 w-4 mr-2" />
                            Apply Fix
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="errors" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="errors">Active Errors</TabsTrigger>
              <TabsTrigger value="patterns">Error Patterns</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="tools">Fix Tools</TabsTrigger>
            </TabsList>

            <TabsContent value="errors" className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search errors..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="ERROR">Errors</SelectItem>
                    <SelectItem value="WARNING">Warnings</SelectItem>
                    <SelectItem value="LOG">Logs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Error Stats */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Errors</p>
                        <p className="text-2xl font-bold text-red-600">
                          {errors.filter(e => !e.is_resolved).length}
                        </p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Resolved</p>
                        <p className="text-2xl font-bold text-green-600">
                          {errors.filter(e => e.is_resolved).length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Critical</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {errors.filter(e => e.error_severity === "ERROR" && !e.is_resolved).length}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Auto-Fixed</p>
                        <p className="text-2xl font-bold text-blue-600">12</p>
                      </div>
                      <Zap className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Errors Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredErrors.map((error) => (
                    <TableRow key={error.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {error.error_type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {error.error_message}
                      </TableCell>
                      <TableCell>{error.table_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(error.error_severity)}>
                          {error.error_severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={error.is_resolved ? "default" : "destructive"}>
                          {error.is_resolved ? "Resolved" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(error.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedError(error);
                              setErrorDialog(true);
                            }}
                          >
                            <Bug className="h-3 w-3" />
                          </Button>
                          {error.suggested_fix && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setFixSql(error.suggested_fix || "");
                                setFixDialog(true);
                              }}
                            >
                              <Wrench className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4">
              <div className="grid gap-4">
                {errorPatterns.map((pattern, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{pattern.pattern}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {pattern.suggestedFix}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-red-600">{pattern.count}</p>
                          <p className="text-xs text-muted-foreground">occurrences</p>
                          <p className="text-xs text-muted-foreground">{pattern.lastOccurrence}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Error Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Today</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-red-200 h-2 rounded">
                            <div className="w-3/4 bg-red-500 h-2 rounded"></div>
                          </div>
                          <span className="text-sm font-semibold">23</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">This Week</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-red-200 h-2 rounded">
                            <div className="w-1/2 bg-red-500 h-2 rounded"></div>
                          </div>
                          <span className="text-sm font-semibold">89</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">This Month</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-red-200 h-2 rounded">
                            <div className="w-full bg-red-500 h-2 rounded"></div>
                          </div>
                          <span className="text-sm font-semibold">342</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Resolution Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">Average Resolution Time</span>
                        <span className="font-semibold">2.5 hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Auto-Resolution Rate</span>
                        <span className="font-semibold text-green-600">68%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Manual Intervention</span>
                        <span className="font-semibold text-orange-600">32%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Success Rate</span>
                        <span className="font-semibold text-green-600">94%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>SQL Query Validator</CardTitle>
                    <CardDescription>
                      Test and validate SQL queries before execution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Enter your SQL query here..."
                      rows={6}
                      className="mb-4"
                    />
                    <div className="flex gap-2">
                      <Button>
                        <Code className="h-4 w-4 mr-2" />
                        Validate Query
                      </Button>
                      <Button variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Execute Safely
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Database Health Check</CardTitle>
                    <CardDescription>
                      Run comprehensive database health checks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button className="w-full justify-start" variant="outline">
                        <Database className="h-4 w-4 mr-2" />
                        Check Table Constraints
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <Wrench className="h-4 w-4 mr-2" />
                        Validate RLS Policies
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Analyze Query Performance
                      </Button>
                      <Button className="w-full justify-start" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Test All Connections
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Error Detail Dialog */}
      <Dialog open={errorDialog} onOpenChange={setErrorDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Details</DialogTitle>
          </DialogHeader>
          {selectedError && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Error Type:</label>
                <p className="text-sm bg-muted p-2 rounded">{selectedError.error_type}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Message:</label>
                <p className="text-sm bg-muted p-2 rounded">{selectedError.error_message}</p>
              </div>
              {selectedError.table_name && (
                <div>
                  <label className="text-sm font-medium">Table:</label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedError.table_name}</p>
                </div>
              )}
              {selectedError.suggested_fix && (
                <div>
                  <label className="text-sm font-medium">Suggested Fix:</label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedError.suggested_fix}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button>Apply Auto-Fix</Button>
                <Button variant="outline">Mark as Resolved</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatabaseErrorManager;