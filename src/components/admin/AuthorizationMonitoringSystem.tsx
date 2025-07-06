import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/contexts/AlertContext";
import { 
  Shield, 
  Eye, 
  AlertTriangle, 
  Activity, 
  Users, 
  Globe,
  Settings,
  Lock,
  Unlock,
  Monitor,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  MapPin
} from "lucide-react";

interface UserSession {
  id: string;
  user_id: string;
  is_active: boolean;
  ip_address: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
}

const AuthorizationMonitoringSystem = () => {
  const [activeTab, setActiveTab] = useState("sessions");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedSession, setSelectedSession] = useState<UserSession | null>(null);
  const [authSettings, setAuthSettings] = useState({
    enableMFA: false,
    sessionTimeout: 24,
    maxSessions: 5,
    requireEmailVerification: true,
    blockSuspiciousIPs: true
  });
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch active sessions
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['active-sessions', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('user_device_sessions')
        .select(`
          id,
          user_id,
          is_active,
          ip_address,
          user_agent,
          device_fingerprint,
          created_at,
          expires_at,
          last_activity_at,
          profiles!user_device_sessions_user_id_fkey(
            full_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter === 'active') {
        query = query.eq('is_active', true);
      } else if (statusFilter === 'expired') {
        query = query.eq('is_active', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch security logs
  const { data: securityLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['security-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_security_logs')
        .select(`
          id,
          user_id,
          event_type,
          ip_address,
          user_agent,
          risk_score,
          is_flagged,
          created_at,
          profiles!user_security_logs_user_id_fkey(
            full_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch login alerts
  const { data: loginAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['login-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_login_alerts')
        .select(`
          id,
          user_id,
          alert_type,
          message,
          ip_address,
          device_info,
          location_data,
          is_read,
          created_at,
          profiles!user_login_alerts_user_id_fkey(
            full_name,
            email,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    },
  });

  // Terminate session mutation
  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('user_device_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
      showSuccess("Session Terminated", "User session has been terminated successfully.");
    },
    onError: () => {
      showError("Termination Failed", "Failed to terminate user session.");
    },
  });

  // Mark alert as read mutation
  const markAlertReadMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('user_login_alerts')
        .update({ is_read: true })
        .eq('id', alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['login-alerts'] });
    },
  });

  const getSessionStatusBadge = (session: any) => {
    const isActive = session.is_active && new Date(session.expires_at) > new Date();
    return isActive ? (
      <Badge className="bg-green-500 text-white">Active</Badge>
    ) : (
      <Badge className="bg-gray-500 text-white">Expired</Badge>
    );
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 80) return <Badge className="bg-red-500 text-white">High Risk</Badge>;
    if (riskScore >= 50) return <Badge className="bg-orange-500 text-white">Medium Risk</Badge>;
    return <Badge className="bg-green-500 text-white">Low Risk</Badge>;
  };

  const getAlertTypeBadge = (type: string) => {
    switch (type) {
      case 'suspicious_login':
        return <Badge className="bg-red-500 text-white">Suspicious Login</Badge>;
      case 'new_device':
        return <Badge className="bg-blue-500 text-white">New Device</Badge>;
      case 'location_change':
        return <Badge className="bg-orange-500 text-white">Location Change</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authorization & Monitoring System
          </CardTitle>
          <CardDescription>
            Real-time user session monitoring, security tracking, and authorization controls
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="sessions" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Sessions ({sessions?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security Logs
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Login Alerts ({loginAlerts?.filter(a => !a.is_read).length || 0})
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Auth Settings
              </TabsTrigger>
            </TabsList>

            {/* Active Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search sessions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sessions</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="expired">Expired Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant="outline"
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['active-sessions'] })}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading sessions...
                        </TableCell>
                      </TableRow>
                    ) : sessions?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No sessions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      sessions?.map((session: any) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{session.profiles?.full_name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{session.profiles?.email}</div>
                              <Badge variant="outline" className="text-xs">
                                {session.profiles?.role}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getSessionStatusBadge(session)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-mono">{session.ip_address}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm max-w-48 truncate">
                              {session.user_agent}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(session.created_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(session.expires_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedSession(session)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              {session.is_active && (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => terminateSessionMutation.mutate(session.id)}
                                  disabled={terminateSessionMutation.isPending}
                                >
                                  <XCircle className="h-3 w-3" />
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
            </TabsContent>

            {/* Security Logs Tab */}
            <TabsContent value="security" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Risk Score</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading security logs...
                        </TableCell>
                      </TableRow>
                    ) : securityLogs?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No security logs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      securityLogs?.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{log.profiles?.full_name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{log.profiles?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.event_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{log.risk_score}</span>
                              {getRiskBadge(log.risk_score)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-mono">{log.ip_address}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(log.created_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.is_flagged ? (
                              <Badge className="bg-red-500 text-white">Flagged</Badge>
                            ) : (
                              <Badge className="bg-green-500 text-white">Normal</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Login Alerts Tab */}
            <TabsContent value="alerts" className="space-y-4">
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Alert Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alertsLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading alerts...
                        </TableCell>
                      </TableRow>
                    ) : loginAlerts?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          No login alerts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      loginAlerts?.map((alert: any) => (
                        <TableRow key={alert.id} className={!alert.is_read ? 'bg-blue-50' : ''}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{alert.profiles?.full_name || 'Unknown'}</div>
                              <div className="text-sm text-muted-foreground">{alert.profiles?.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getAlertTypeBadge(alert.alert_type)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm max-w-64 truncate">{alert.message}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {alert.location_data?.city || 'Unknown'}, {alert.location_data?.country || 'Unknown'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(alert.created_at).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {alert.is_read ? (
                              <Badge className="bg-green-500 text-white">Read</Badge>
                            ) : (
                              <Badge className="bg-blue-500 text-white">Unread</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {!alert.is_read && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => markAlertReadMutation.mutate(alert.id)}
                              >
                                <CheckCircle className="h-3 w-3" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Auth Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Security Settings</CardTitle>
                    <CardDescription>Configure authentication and security options</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="mfa">Multi-Factor Authentication</Label>
                        <div className="text-sm text-muted-foreground">
                          Require MFA for all admin users
                        </div>
                      </div>
                      <Switch
                        id="mfa"
                        checked={authSettings.enableMFA}
                        onCheckedChange={(checked) => 
                          setAuthSettings(prev => ({ ...prev, enableMFA: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-verify">Email Verification</Label>
                        <div className="text-sm text-muted-foreground">
                          Require email verification for new accounts
                        </div>
                      </div>
                      <Switch
                        id="email-verify"
                        checked={authSettings.requireEmailVerification}
                        onCheckedChange={(checked) => 
                          setAuthSettings(prev => ({ ...prev, requireEmailVerification: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="block-ips">Block Suspicious IPs</Label>
                        <div className="text-sm text-muted-foreground">
                          Automatically block suspicious IP addresses
                        </div>
                      </div>
                      <Switch
                        id="block-ips"
                        checked={authSettings.blockSuspiciousIPs}
                        onCheckedChange={(checked) => 
                          setAuthSettings(prev => ({ ...prev, blockSuspiciousIPs: checked }))
                        }
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Session Management</CardTitle>
                    <CardDescription>Configure session timeout and limits</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">Session Timeout (hours)</Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        value={authSettings.sessionTimeout}
                        onChange={(e) => 
                          setAuthSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))
                        }
                        min="1"
                        max="168"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max-sessions">Max Sessions per User</Label>
                      <Input
                        id="max-sessions"
                        type="number"
                        value={authSettings.maxSessions}
                        onChange={(e) => 
                          setAuthSettings(prev => ({ ...prev, maxSessions: parseInt(e.target.value) }))
                        }
                        min="1"
                        max="20"
                      />
                    </div>
                    <Button className="w-full">
                      Save Settings
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Session Details Modal */}
      {selectedSession && (
        <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Session Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Session ID</label>
                  <div className="text-sm text-muted-foreground font-mono">{selectedSession.id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div>{getSessionStatusBadge(selectedSession)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">IP Address</label>
                  <div className="text-sm text-muted-foreground font-mono">{selectedSession.ip_address}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">User Agent</label>
                  <div className="text-sm text-muted-foreground break-all">{selectedSession.user_agent}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Created</label>
                  <div className="text-sm text-muted-foreground">{new Date(selectedSession.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Expires</label>
                  <div className="text-sm text-muted-foreground">{new Date(selectedSession.expires_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AuthorizationMonitoringSystem;