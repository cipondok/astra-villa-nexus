
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Shield, Eye, MapPin, Smartphone, AlertTriangle } from "lucide-react";

const SecurityMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // User Activity Logs
  const { data: activityLogs, isLoading: activityLoading } = useQuery({
    queryKey: ['activity-logs', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('user_activity_logs')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (searchTerm) {
        query = query.ilike('description', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // User Sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          user:profiles(full_name, email)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // System Error Logs
  const { data: errorLogs, isLoading: errorsLoading } = useQuery({
    queryKey: ['error-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_error_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return <Shield className="h-4 w-4 text-green-500" />;
      case 'logout': return <Shield className="h-4 w-4 text-red-500" />;
      case 'view': return <Eye className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatIpAddress = (ip: any) => {
    if (!ip) return 'Unknown';
    return typeof ip === 'string' ? ip : ip.toString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitoring & Analytics
          </CardTitle>
          <CardDescription>
            Monitor user activities, sessions, and system security events
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="activities" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activities">User Activities</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="errors">System Errors</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Logs</CardTitle>
              <CardDescription>Real-time tracking of user actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Activity</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          Loading activities...
                        </TableCell>
                      </TableRow>
                    ) : activityLogs?.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getActivityIcon(log.activity_type)}
                            <div>
                              <p className="font-medium">{log.activity_type}</p>
                              <p className="text-sm text-gray-500">{log.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{log.user?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{log.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {formatIpAddress(log.ip_address)}
                          </code>
                        </TableCell>
                        <TableCell>
                          {log.location_data ? (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {log.location_data.city || 'Unknown'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(log.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
              <CardDescription>Monitor currently logged-in users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Started</TableHead>
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
                    ) : sessions?.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{session.user?.full_name || 'Unknown'}</p>
                            <p className="text-sm text-gray-500">{session.user?.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {formatIpAddress(session.ip_address)}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Smartphone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {session.user_agent ? session.user_agent.substring(0, 30) + '...' : 'Unknown'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {session.location_data ? (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {session.location_data.city || 'Unknown'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Unknown</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(session.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {session.expires_at ? new Date(session.expires_at).toLocaleString() : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Error Logs</CardTitle>
              <CardDescription>Monitor and track system errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Error Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {errorsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading error logs...
                        </TableCell>
                      </TableRow>
                    ) : errorLogs?.map((error) => (
                      <TableRow key={error.id}>
                        <TableCell>
                          <Badge variant="outline">{error.error_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm max-w-xs truncate" title={error.error_message}>
                            {error.error_message}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(error.severity)}>
                            {error.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">
                            {error.request_url || 'N/A'}
                          </code>
                        </TableCell>
                        <TableCell>
                          {new Date(error.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={error.is_resolved ? "default" : "secondary"}>
                            {error.is_resolved ? 'Resolved' : 'Open'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessions?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {errorLogs?.filter(e => !e.is_resolved).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Unresolved errors</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Activities</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activityLogs?.filter(log => 
                    new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                  ).length || 0}
                </div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {new Set(sessions?.map(s => formatIpAddress(s.ip_address))).size || 0}
                </div>
                <p className="text-xs text-muted-foreground">Different locations</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityMonitoring;
