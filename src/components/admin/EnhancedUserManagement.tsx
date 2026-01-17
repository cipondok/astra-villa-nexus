
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAlert } from "@/contexts/AlertContext";
import { UserPlus, Search, Ban, UserCheck, UserX, Shield, AlertTriangle, Monitor, MapPin } from "lucide-react";

type UserRole = "general_user" | "property_owner" | "agent" | "vendor" | "admin" | "customer_service";

interface EnhancedUser {
  id: string;
  email: string;
  full_name: string;
  role?: UserRole;
  verification_status: string;
  is_suspended: boolean;
  suspension_reason?: string;
  suspended_at?: string;
  suspended_by?: string;
  user_level_id?: string;
  created_at: string;
  phone?: string;
  company_name?: string;
  user_levels?: {
    name: string;
    max_properties: number;
    max_listings: number;
  };
}

interface SecurityLog {
  id: string;
  user_id: string;
  event_type: string;
  ip_address: string | null;
  user_agent: string;
  device_fingerprint?: string;
  location_data?: any;
  risk_score: number;
  is_flagged: boolean;
  created_at: string;
}

interface SessionTracking {
  id: string;
  user_id: string;
  session_id: string;
  ip_address: string | null;
  user_agent: string;
  device_info?: any;
  login_time: string;
  logout_time?: string;
  is_active: boolean;
  last_activity: string;
}

const EnhancedUserManagement = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [suspensionFilter, setSuspensionFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [securityModalUser, setSecurityModalUser] = useState<string | null>(null);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch users via admin-only RPC (profiles table is protected by RLS)
  const {
    data: users,
    isLoading,
    error: usersError,
  } = useQuery({
    queryKey: ['enhanced-users', user?.id],
    enabled: !!user,
    queryFn: async (): Promise<EnhancedUser[]> => {
      const { data, error } = await supabase.rpc('get_admin_profiles', {
        p_role: null,
        p_limit: 1000,
        p_offset: 0,
      });
      if (error) throw error;

      // get_admin_profiles already returns a derived primary role
      return (data as EnhancedUser[]) || [];
    },
  });

  // Fetch user levels for assignment
  const { data: userLevels } = useQuery({
    queryKey: ['user-levels-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_levels')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch security logs for selected user
  const { data: securityLogs } = useQuery({
    queryKey: ['security-logs', securityModalUser],
    queryFn: async (): Promise<SecurityLog[]> => {
      if (!securityModalUser) return [];
      
      const { data, error } = await supabase
        .from('user_security_logs')
        .select('*')
        .eq('user_id', securityModalUser)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return (data || []).map(log => ({
        ...log,
        ip_address: log.ip_address as string | null
      }));
    },
    enabled: !!securityModalUser,
  });

  // Fetch session tracking for selected user
  const { data: sessionData } = useQuery({
    queryKey: ['session-tracking', securityModalUser],
    queryFn: async (): Promise<SessionTracking[]> => {
      if (!securityModalUser) return [];
      
      const { data, error } = await supabase
        .from('user_session_tracking')
        .select('*')
        .eq('user_id', securityModalUser)
        .order('login_time', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return (data || []).map(session => ({
        ...session,
        ip_address: session.ip_address as string | null
      }));
    },
    enabled: !!securityModalUser,
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          suspended_at: new Date().toISOString(),
          suspended_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("User Suspended", "User has been suspended successfully.");
      setSelectedUser(null);
      setSuspensionReason("");
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] });
    },
    onError: (error: any) => {
      showError("Suspension Failed", error.message);
    },
  });

  // Unsuspend user mutation
  const unsuspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspension_reason: null,
          suspended_at: null,
          suspended_by: null
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("User Unsuspended", "User has been unsuspended successfully.");
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] });
    },
    onError: (error: any) => {
      showError("Unsuspend Failed", error.message);
    },
  });

  // Update user level mutation
  const updateUserLevelMutation = useMutation({
    mutationFn: async ({ userId, levelId }: { userId: string; levelId: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ user_level_id: levelId })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Level Updated", "User level updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role, is_active: true }, { onConflict: 'user_id,role' });
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Role Updated", "User role updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] });
    },
    onError: (error: any) => {
      showError("Role Update Failed", error.message);
    },
  });

  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || (user.role || 'general_user') === roleFilter;
    const matchesSuspension = suspensionFilter === "all" || 
      (suspensionFilter === "suspended" && user.is_suspended) ||
      (suspensionFilter === "active" && !user.is_suspended);
    
    return matchesSearch && matchesRole && matchesSuspension;
  }) || [];

  const getStatusBadge = (user: EnhancedUser) => {
    if (user.is_suspended) {
      return <Badge variant="destructive">SUSPENDED</Badge>;
    }
    
    const colors = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={colors[user.verification_status as keyof typeof colors] || colors.pending}>
        {user.verification_status.toUpperCase()}
      </Badge>
    );
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 80) return <Badge variant="destructive">High Risk</Badge>;
    if (riskScore >= 40) return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
  };

  return (
    <div className="space-y-3 p-1 md:p-0">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-lg border border-indigo-200/50 dark:border-indigo-800/50 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">User Management</h2>
                <Badge className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 text-[9px] px-1.5 py-0 h-4">
                  {filteredUsers.length} Users
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">Manage users, roles, levels & permissions</p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-[10px] px-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                <UserPlus className="h-3 w-3 mr-1" />
                Add User
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-indigo-200/50 dark:border-indigo-800/50">
        <CardContent className="p-2">
          <div className="flex flex-wrap gap-1.5">
            <div className="flex-1 min-w-[180px]">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-7 text-[10px]"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[120px] h-7 text-[10px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="property_owner">Property Owner</SelectItem>
                <SelectItem value="customer_service">Customer Service</SelectItem>
                <SelectItem value="general_user">General User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={suspensionFilter} onValueChange={setSuspensionFilter}>
              <SelectTrigger className="w-[100px] h-7 text-[10px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-indigo-200/50 dark:border-indigo-800/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-indigo-600" />
            Users ({filteredUsers.length})
          </CardTitle>
          {usersError && (
            <CardDescription className="text-[9px]">
              Signed in as: {user?.email || user?.id}
              <br />
              {String((usersError as any)?.message || usersError)}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-6 text-[10px] text-muted-foreground">Loading users...</div>
          ) : (
            <Table className="text-[10px]">
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[9px] font-semibold py-1.5 px-2">User</TableHead>
                  <TableHead className="text-[9px] font-semibold py-1.5 px-2">Role</TableHead>
                  <TableHead className="text-[9px] font-semibold py-1.5 px-2">Level</TableHead>
                  <TableHead className="text-[9px] font-semibold py-1.5 px-2">Status</TableHead>
                  <TableHead className="text-[9px] font-semibold py-1.5 px-2">Created</TableHead>
                  <TableHead className="text-[9px] font-semibold py-1.5 px-2">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/20">
                    <TableCell className="py-1.5 px-2">
                      <div>
                        <div className="text-[10px] font-medium truncate max-w-[120px]">{user.full_name || 'No Name'}</div>
                        <div className="text-[9px] text-muted-foreground truncate max-w-[120px]">{user.email}</div>
                        {user.is_suspended && (
                          <div className="text-[8px] text-red-600 truncate">Suspended</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5 px-2">
                      <Select 
                        value={user.role || 'general_user'} 
                        onValueChange={(role: UserRole) => updateUserRoleMutation.mutate({ userId: user.id, role })}
                      >
                        <SelectTrigger className="w-[80px] h-5 text-[9px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general_user" className="text-[10px]">User</SelectItem>
                          <SelectItem value="property_owner" className="text-[10px]">Owner</SelectItem>
                          <SelectItem value="agent" className="text-[10px]">Agent</SelectItem>
                          <SelectItem value="vendor" className="text-[10px]">Vendor</SelectItem>
                          <SelectItem value="customer_service" className="text-[10px]">CS</SelectItem>
                          <SelectItem value="admin" className="text-[10px]">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-1.5 px-2">
                      {user.user_levels ? (
                        <Badge variant="outline" className="text-[8px] px-1 py-0 h-4">
                          {user.user_levels.name}
                        </Badge>
                      ) : (
                        <Select 
                          value={user.user_level_id || ""} 
                          onValueChange={(value) => updateUserLevelMutation.mutate({ userId: user.id, levelId: value })}
                        >
                          <SelectTrigger className="w-[70px] h-5 text-[9px]">
                            <SelectValue placeholder="--" />
                          </SelectTrigger>
                          <SelectContent>
                            {userLevels?.map((level) => (
                              <SelectItem key={level.id} value={level.id} className="text-[10px]">{level.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell className="py-1.5 px-2">{getStatusBadge(user)}</TableCell>
                    <TableCell className="py-1.5 px-2 text-[9px] text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="py-1.5 px-2">
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={() => setSecurityModalUser(user.id)}
                        >
                          <Monitor className="h-3 w-3" />
                        </Button>
                        {user.is_suspended ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 text-green-600"
                            onClick={() => unsuspendUserMutation.mutate(user.id)}
                            disabled={unsuspendUserMutation.isPending}
                          >
                            <UserCheck className="h-3 w-3" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 text-red-600"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Suspension Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <p>{selectedUser.full_name} ({selectedUser.email})</p>
              </div>
              <div>
                <Label>Suspension Reason</Label>
                <Textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => suspendUserMutation.mutate({
                    userId: selectedUser.id,
                    reason: suspensionReason
                  })}
                  disabled={suspendUserMutation.isPending || !suspensionReason}
                  variant="destructive"
                  className="flex-1"
                >
                  {suspendUserMutation.isPending ? 'Suspending...' : 'Suspend User'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Security & Session Modal */}
      {securityModalUser && (
        <Dialog open={!!securityModalUser} onOpenChange={() => setSecurityModalUser(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Security & Session Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 max-h-[70vh] overflow-auto">
              {/* Security Logs */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Logs
                </h4>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {securityLogs?.map((log) => (
                    <div key={log.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <span className="font-medium">{log.event_type}</span>
                          {getRiskBadge(log.risk_score)}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          IP: {log.ip_address || 'Unknown'}
                        </div>
                        {log.user_agent && (
                          <div className="truncate">Device: {log.user_agent}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Session Tracking */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Session History
                </h4>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {sessionData?.map((session) => (
                    <div key={session.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${session.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="font-medium">Session {session.session_id.slice(0, 8)}...</span>
                          {session.is_active && <Badge variant="outline">Active</Badge>}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(session.login_time).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        <div>IP: {session.ip_address || 'Unknown'}</div>
                        {session.logout_time && (
                          <div>Logout: {new Date(session.logout_time).toLocaleString()}</div>
                        )}
                        <div>Last Activity: {new Date(session.last_activity).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedUserManagement;
