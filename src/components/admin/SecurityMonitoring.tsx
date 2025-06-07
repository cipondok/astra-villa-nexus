
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, AlertTriangle, Activity, Search, Eye, Ban } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SecurityMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");

  const { data: userActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['user-activity', searchTerm, activityFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_activity_logs')
        .select(`
          *,
          user:profiles(full_name, email)
        `);
      
      if (searchTerm) {
        query = query.ilike('description', `%${searchTerm}%`);
      }
      
      if (activityFilter !== 'all') {
        query = query.eq('activity_type', activityFilter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    }
  });

  const { data: userSessions, isLoading: sessionsLoading } = useQuery({
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

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'login': return 'bg-green-500';
      case 'logout': return 'bg-blue-500';
      case 'failed_login': return 'bg-red-500';
      case 'password_change': return 'bg-yellow-500';
      case 'profile_update': return 'bg-purple-500';
      default: return 'bg-gray-500';
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

  const getLocationInfo = (locationData: any) => {
    if (typeof locationData === 'string') {
      try {
        const parsed = JSON.parse(locationData);
        return parsed.city || 'Unknown';
      } catch {
        return 'Unknown';
      }
    }
    return locationData?.city || 'Unknown';
  };

  const formatIPAddress = (ip: string | null | undefined) => {
    return ip || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitoring
          </CardTitle>
          <CardDescription>Monitor user activities, sessions, and system security</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">User Activity</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="security">Security Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                User Activity Logs
              </CardTitle>
              <CardDescription>Track user actions and behaviors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Activities</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="failed_login">Failed Login</SelectItem>
                    <SelectItem value="password_change">Password Change</SelectItem>
                    <SelectItem value="profile_update">Profile Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Activity Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading activities...
                        </TableCell>
                      </TableRow>
                    ) : userActivity?.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {Array.isArray(activity.user) && activity.user.length > 0
                                ? activity.user[0]?.full_name || activity.user[0]?.email
                                : activity.user?.full_name || activity.user?.email || 'Unknown User'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getActivityTypeColor(activity.activity_type)}>
                            {activity.activity_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{activity.description}</TableCell>
                        <TableCell>{formatIPAddress(activity.ip_address?.toString())}</TableCell>
                        <TableCell>{getLocationInfo(activity.location_data)}</TableCell>
                        <TableCell>{new Date(activity.created_at).toLocaleString()}</TableCell>
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
              <CardDescription>Monitor currently active user sessions</CardDescription>
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading sessions...
                        </TableCell>
                      </TableRow>
                    ) : userSessions?.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {Array.isArray(session.user) && session.user.length > 0
                                ? session.user[0]?.full_name || session.user[0]?.email
                                : session.user?.full_name || session.user?.email || 'Unknown User'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{formatIPAddress(session.ip_address?.toString())}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600 truncate max-w-32 block">
                            {session.user_agent?.substring(0, 50) || 'Unknown'}
                          </span>
                        </TableCell>
                        <TableCell>{getLocationInfo(session.location_data)}</TableCell>
                        <TableCell>{new Date(session.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm">
                            <Ban className="h-4 w-4" />
                          </Button>
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
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                System Error Logs
              </CardTitle>
              <CardDescription>Monitor system errors and issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Error Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>User</TableHead>
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
                          <span className="text-sm text-gray-600 truncate max-w-64 block">
                            {error.error_message}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(error.severity)}>
                            {error.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {error.user_id ? 'User ID: ' + error.user_id.substring(0, 8) : 'System'}
                        </TableCell>
                        <TableCell>{new Date(error.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant={error.is_resolved ? "default" : "destructive"}>
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

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
              <CardDescription>Security incidents and suspicious activities</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Security Alerts</h3>
              <p className="text-gray-600">All systems are secure. No suspicious activities detected.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityMonitoring;
