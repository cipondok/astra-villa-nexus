
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  role: UserRole;
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
  ip_address: string;
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
  ip_address: string;
  user_agent: string;
  device_info?: any;
  login_time: string;
  logout_time?: string;
  is_active: boolean;
  last_activity: string;
}

const EnhancedUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [suspensionFilter, setSuspensionFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [securityModalUser, setSecurityModalUser] = useState<string | null>(null);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch enhanced users with levels
  const { data: users, isLoading } = useQuery({
    queryKey: ['enhanced-users'],
    queryFn: async (): Promise<EnhancedUser[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_levels (
            name,
            max_properties,
            max_listings
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
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
      return data || [];
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
      return data || [];
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

  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Enhanced User Management</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive user management with security tracking and suspension controls
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
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
              <SelectTrigger className="w-[150px]">
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
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'No Name'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.is_suspended && (
                          <div className="text-xs text-red-600 mt-1">
                            Suspended: {user.suspension_reason}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role.replace('_', ' ').toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.user_levels ? (
                        <div>
                          <div className="font-medium">{user.user_levels.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.user_levels.max_properties} props, {user.user_levels.max_listings} listings
                          </div>
                        </div>
                      ) : (
                        <Select 
                          value={user.user_level_id || ""} 
                          onValueChange={(value) => updateUserLevelMutation.mutate({ userId: user.id, levelId: value })}
                        >
                          <SelectTrigger className="w-[120px] h-8">
                            <SelectValue placeholder="Assign Level" />
                          </SelectTrigger>
                          <SelectContent>
                            {userLevels?.map((level) => (
                              <SelectItem key={level.id} value={level.id}>{level.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSecurityModalUser(user.id)}
                        >
                          <Monitor className="h-4 w-4" />
                        </Button>
                        {user.is_suspended ? (
                          <Button
                            size="sm"
                            onClick={() => unsuspendUserMutation.mutate(user.id)}
                            disabled={unsuspendUserMutation.isPending}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Ban className="h-4 w-4" />
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
                          IP: {log.ip_address}
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
                        <div>IP: {session.ip_address}</div>
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
