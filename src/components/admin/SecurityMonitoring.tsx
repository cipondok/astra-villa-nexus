
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Search, AlertTriangle, Activity, Globe, Clock } from "lucide-react";

const SecurityMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");

  const { data: errorLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['error-logs', searchTerm, severityFilter],
    queryFn: async () => {
      let query = supabase
        .from('system_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (searchTerm) {
        query = query.or(`error_message.ilike.%${searchTerm}%,error_type.ilike.%${searchTerm}%`);
      }

      if (severityFilter !== 'all') {
        query = query.eq('severity', severityFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: activityLogs, isLoading: activityLoading } = useQuery({
    queryKey: ['activity-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activity_logs')
        .select(`
          *,
          user:profiles!user_activity_logs_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          user:profiles!user_sessions_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Shield className="h-4 w-4" />;
      case 'low': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitoring
          </CardTitle>
          <CardDescription>
            Monitor system security, errors, and user activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="errors" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="errors">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Error Logs
              </TabsTrigger>
              <TabsTrigger value="activity">
                <Activity className="h-4 w-4 mr-2" />
                User Activity
              </TabsTrigger>
              <TabsTrigger value="sessions">
                <Globe className="h-4 w-4 mr-2" />
                Active Sessions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="errors" className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search error logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Error</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading error logs...
                        </TableCell>
                      </TableRow>
                    ) : errorLogs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No error logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      errorLogs?.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium truncate max-w-xs">{log.error_message}</div>
                              {log.stack_trace && (
                                <div className="text-xs text-muted-foreground truncate max-w-xs">
                                  {log.stack_trace}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.error_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getSeverityIcon(log.severity)}
                              <Badge variant={getSeverityBadgeVariant(log.severity)}>
                                {log.severity}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {log.request_url || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(log.created_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={log.is_resolved ? 'default' : 'destructive'}>
                              {log.is_resolved ? 'Resolved' : 'Open'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading activity logs...
                        </TableCell>
                      </TableRow>
                    ) : activityLogs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No activity logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      activityLogs?.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{String(log.user?.full_name || 'Unknown')}</div>
                              <div className="text-sm text-muted-foreground">{String(log.user?.email || '')}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.activity_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm max-w-xs truncate">
                              {log.description || 'No description'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {String(log.ip_address || 'N/A')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(log.created_at).toLocaleString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>User Agent</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading sessions...
                        </TableCell>
                      </TableRow>
                    ) : sessions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No active sessions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sessions?.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{String(session.user?.full_name || 'Unknown')}</div>
                              <div className="text-sm text-muted-foreground">{String(session.user?.email || '')}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={session.is_active ? 'default' : 'secondary'}>
                              {session.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {String(session.ip_address || 'N/A')}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground truncate max-w-xs">
                              {session.user_agent || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(session.created_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {session.expires_at ? new Date(session.expires_at).toLocaleString() : 'N/A'}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityMonitoring;
