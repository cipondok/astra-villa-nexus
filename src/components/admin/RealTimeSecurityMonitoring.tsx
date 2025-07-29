import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Activity, 
  Clock, 
  MapPin, 
  Monitor, 
  AlertTriangle,
  Eye,
  Ban,
  Shield,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const RealTimeSecurityMonitoring = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch recent login attempts
  const { data: loginAttempts, isLoading: loadingAttempts, refetch: refetchAttempts } = useQuery({
    queryKey: ['admin-login-attempts'],
    queryFn: async () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('login_attempts')
        .select('*')
        .gte('attempt_time', oneDayAgo)
        .order('attempt_time', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch account lockouts
  const { data: accountLockouts, isLoading: loadingLockouts } = useQuery({
    queryKey: ['admin-account-lockouts'],
    queryFn: async () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('account_lockouts')
        .select('*')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Fetch security logs
  const { data: securityLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['admin-security-logs'],
    queryFn: async () => {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('user_security_logs')
        .select('*')
        .gte('created_at', oneDayAgo)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Fetch user session tracking for online users
  const { data: activeSessions, isLoading: loadingSessions } = useQuery({
    queryKey: ['admin-active-sessions'],
    queryFn: async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('user_session_tracking')
        .select('*')
        .gte('login_time', oneHourAgo)
        .is('logout_time', null)
        .order('login_time', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  // Calculate stats
  const failedAttempts = loginAttempts?.filter(attempt => !attempt.success) || [];
  const successfulAttempts = loginAttempts?.filter(attempt => attempt.success) || [];
  const highRiskEvents = securityLogs?.filter(log => log.risk_score && log.risk_score > 70) || [];

  const getRiskBadge = (riskScore: number | null) => {
    if (!riskScore) return <Badge variant="outline">Unknown</Badge>;
    
    if (riskScore >= 70) {
      return <Badge variant="destructive">High Risk</Badge>;
    } else if (riskScore >= 40) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">Medium Risk</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Low Risk</Badge>;
    }
  };

  const getStatusBadge = (success: boolean) => {
    return success 
      ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Success</Badge>
      : <Badge variant="destructive">Failed</Badge>;
  };

  const refreshAll = async () => {
    await Promise.all([
      refetchAttempts(),
    ]);
    toast.success('Data refreshed');
  };

  const filteredAttempts = loginAttempts?.filter(attempt => 
    attempt.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(attempt.ip_address || '').includes(searchTerm)
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Security Monitoring</h2>
          <p className="text-muted-foreground">Monitor actual login attempts, security events, and user activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshAll}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Security Scan
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{activeSessions?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Login Attempts (24h)</p>
                <p className="text-2xl font-bold">{loginAttempts?.length || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Attempts</p>
                <p className="text-2xl font-bold text-red-600">{failedAttempts.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account Lockouts</p>
                <p className="text-2xl font-bold text-orange-600">{accountLockouts?.length || 0}</p>
              </div>
              <Ban className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="login-attempts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="login-attempts">Login Attempts</TabsTrigger>
          <TabsTrigger value="security-events">Security Events</TabsTrigger>
          <TabsTrigger value="active-sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="account-lockouts">Account Lockouts</TabsTrigger>
        </TabsList>

        {/* Login Attempts */}
        <TabsContent value="login-attempts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Login Attempts</CardTitle>
                  <CardDescription>Real-time monitoring of all login attempts</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by email or IP..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAttempts ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Loading login attempts...</div>
                </div>
              ) : filteredAttempts.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">No login attempts found in the last 24 hours</div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>User Agent</TableHead>
                      <TableHead>Failure Reason</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="font-medium">{attempt.email}</TableCell>
                        <TableCell>{getStatusBadge(attempt.success)}</TableCell>
                        <TableCell>
                          <code className="text-sm bg-muted px-1 rounded">{String(attempt.ip_address || 'Unknown')}</code>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(attempt.attempt_time).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm max-w-xs truncate">
                          {attempt.user_agent || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-sm text-red-600">
                          {!attempt.success ? 'Login Failed' : '-'}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Events */}
        <TabsContent value="security-events">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>High-risk security events and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLogs ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Loading security events...</div>
                </div>
              ) : securityLogs?.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">No security events found in the last 24 hours</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {securityLogs?.map((event) => (
                    <div key={event.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <div>
                            <div className="font-medium">{event.event_type}</div>
                            <div className="text-sm text-muted-foreground">
                              User ID: {event.user_id}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              IP: {String(event.ip_address || 'Unknown')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(event.created_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getRiskBadge(event.risk_score)}
                          <Button size="sm">Investigate</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions */}
        <TabsContent value="active-sessions">
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
              <CardDescription>Currently active user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSessions ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Loading active sessions...</div>
                </div>
              ) : activeSessions?.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">No active sessions found</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeSessions?.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium">User ID: {session.user_id}</div>
                          <div className="text-sm text-muted-foreground">
                            IP: {String(session.ip_address || 'Unknown')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Login: {new Date(session.login_time).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Lockouts */}
        <TabsContent value="account-lockouts">
          <Card>
            <CardHeader>
              <CardTitle>Account Lockouts</CardTitle>
              <CardDescription>Recent account lockouts and security restrictions</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLockouts ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Loading account lockouts...</div>
                </div>
              ) : accountLockouts?.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">No account lockouts found in the last 24 hours</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {accountLockouts?.map((lockout) => (
                    <div key={lockout.id} className="p-4 border rounded-lg bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Ban className="h-5 w-5 text-red-500" />
                          <div>
                            <div className="font-medium">Account Locked</div>
                            <div className="text-sm text-muted-foreground">
                              Email: {lockout.email}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              IP: {String(lockout.locked_by_ip || 'Unknown')}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Locked: {new Date(lockout.locked_at).toLocaleString()}
                            </div>
                            {lockout.unlock_at && (
                              <div className="text-xs text-muted-foreground">
                                Unlocks: {new Date(lockout.unlock_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="destructive">Locked</Badge>
                          <Button size="sm">Unlock</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeSecurityMonitoring;