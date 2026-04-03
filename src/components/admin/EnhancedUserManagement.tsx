
import { useState, useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
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
import { UserPlus, Users, Search, Ban, UserCheck, UserX, Shield, AlertTriangle, Monitor, MapPin, Clock, KeyRound, Bell, Mail, Send, Loader2 } from "lucide-react";
import { formatMemberDuration } from "@/utils/dateUtils";
import VIPLevelBadge from "@/components/ui/VIPLevelBadge";
import UserStatusBadge from "@/components/ui/UserStatusBadge";

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

// Row height for the virtual table (px)
const ROW_HEIGHT = 56;

interface VirtualUserTableProps {
  users: EnhancedUser[];
  userLevels?: { id: string; name: string }[];
  onSuspend: (user: EnhancedUser) => void;
  onUnsuspend: (id: string) => void;
  onSecurityView: (id: string) => void;
  onRoleChange: (userId: string, role: UserRole) => void;
  onLevelChange: (userId: string, levelId: string) => void;
  onVerificationChange: (userId: string, status: string) => void;
  onResetPassword: (email: string) => void;
  onSendNotice: (email: string) => void;
  unsuspendPending: boolean;
  resetPending: boolean;
}

const VirtualUserTable = ({
  users, userLevels, onSuspend, onUnsuspend, onSecurityView,
  onRoleChange, onLevelChange, onVerificationChange, onResetPassword, onSendNotice,
  unsuspendPending, resetPending
}: VirtualUserTableProps) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  });

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        <Users className="h-8 w-8 mx-auto mb-3 text-muted-foreground/40" />
        No users match the current filters.
      </div>
    );
  }

  return (
    <div className="text-xs">
      {/* Fixed header */}
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-[26%]" />
          <col className="w-[13%]" />
          <col className="w-[11%]" />
          <col className="w-[16%]" />
          <col className="w-[14%]" />
          <col className="w-[20%]" />
        </colgroup>
        <thead>
          <tr className="bg-card border-b-2 border-border/60">
            <th className="text-[11px] font-semibold py-3 px-3 text-left uppercase tracking-wider text-muted-foreground">User</th>
            <th className="text-[11px] font-semibold py-3 px-3 text-left uppercase tracking-wider text-muted-foreground">Role</th>
            <th className="text-[11px] font-semibold py-3 px-3 text-left uppercase tracking-wider text-muted-foreground">Level</th>
            <th className="text-[11px] font-semibold py-3 px-3 text-left uppercase tracking-wider text-muted-foreground">Status</th>
            <th className="text-[11px] font-semibold py-3 px-3 text-left uppercase tracking-wider text-muted-foreground">Member Since</th>
            <th className="text-[11px] font-semibold py-3 px-3 text-left uppercase tracking-wider text-muted-foreground">Actions</th>
          </tr>
        </thead>
      </table>

      {/* Virtualized scrollable body */}
      <div ref={parentRef} className="overflow-auto" style={{ height: Math.min(users.length * ROW_HEIGHT, 560) }}>
        <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-[26%]" />
              <col className="w-[13%]" />
              <col className="w-[11%]" />
              <col className="w-[16%]" />
              <col className="w-[14%]" />
              <col className="w-[20%]" />
            </colgroup>
            <tbody>
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const u = users[virtualRow.index];
                const isEven = virtualRow.index % 2 === 0;
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-border/30 transition-colors duration-150 ${isEven ? 'bg-background' : 'bg-muted/10'} hover:bg-accent/10`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${ROW_HEIGHT}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {/* User info */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                          <span className="text-[11px] font-bold text-primary">
                            {(u.full_name || u.email || '?')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] font-semibold truncate text-foreground leading-tight">{u.full_name || 'Unnamed User'}</div>
                          <div className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">{u.email}</div>
                          {u.is_suspended && (
                            <Badge variant="destructive" className="text-[8px] h-3.5 px-1 mt-0.5">SUSPENDED</Badge>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-2 px-3">
                      <Select value={u.role || 'general_user'} onValueChange={(role: UserRole) => onRoleChange(u.id, role)}>
                        <SelectTrigger className="w-[90px] h-7 text-[11px] bg-background border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general_user" className="text-xs">User</SelectItem>
                          <SelectItem value="property_owner" className="text-xs">Owner</SelectItem>
                          <SelectItem value="agent" className="text-xs">Agent</SelectItem>
                          <SelectItem value="vendor" className="text-xs">Vendor</SelectItem>
                          <SelectItem value="customer_service" className="text-xs">CS</SelectItem>
                          <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>

                    {/* Level */}
                    <td className="py-2 px-3">
                      {u.user_levels ? (
                        <VIPLevelBadge level={u.user_levels.name} size="xs" showLabel showTooltip={false} />
                      ) : (
                        <Select value={u.user_level_id || ""} onValueChange={(v) => onLevelChange(u.id, v)}>
                          <SelectTrigger className="w-[80px] h-7 text-[11px] bg-background border-border/50">
                            <SelectValue placeholder="—" />
                          </SelectTrigger>
                          <SelectContent>
                            {userLevels?.map((level) => (
                              <SelectItem key={level.id} value={level.id} className="text-xs">{level.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <UserStatusBadge status={u.verification_status} size="xs" />
                        <Select value={u.verification_status || 'pending'} onValueChange={(s) => onVerificationChange(u.id, s)}>
                          <SelectTrigger className="w-[85px] h-7 text-[11px] bg-background border-border/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                            <SelectItem value="verified" className="text-xs">Verified</SelectItem>
                            <SelectItem value="approved" className="text-xs">Approved</SelectItem>
                            <SelectItem value="rejected" className="text-xs">Rejected</SelectItem>
                            <SelectItem value="suspended" className="text-xs">Suspended</SelectItem>
                            <SelectItem value="unverified" className="text-xs">Unverified</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>

                    {/* Member since */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 text-muted-foreground/60" />
                        <span className="text-[11px] text-muted-foreground font-medium">{formatMemberDuration(u.created_at)}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-7 w-7 border-border/40 hover:bg-accent/20" title="Security & Sessions" onClick={() => onSecurityView(u.id)}>
                          <Monitor className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-7 w-7 border-primary/30 text-primary hover:bg-primary/10" title="Reset Password" onClick={() => onResetPassword(u.email)} disabled={resetPending}>
                          <KeyRound className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-7 w-7 border-chart-2/30 text-chart-2 hover:bg-chart-2/10" title="Send Notice" onClick={() => onSendNotice(u.email)}>
                          <Bell className="h-3.5 w-3.5" />
                        </Button>
                        {u.is_suspended ? (
                          <Button size="icon" variant="outline" className="h-7 w-7 border-chart-1/30 text-chart-1 hover:bg-chart-1/10" title="Unsuspend" onClick={() => onUnsuspend(u.id)} disabled={unsuspendPending}>
                            <UserCheck className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button size="icon" variant="outline" className="h-7 w-7 border-destructive/30 text-destructive hover:bg-destructive/10" title="Suspend" onClick={() => onSuspend(u)}>
                            <Ban className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const EnhancedUserManagement = () => {

  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [suspensionFilter, setSuspensionFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<EnhancedUser | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [securityModalUser, setSecurityModalUser] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeUserEmail, setNoticeUserEmail] = useState<string | null>(null);
  const [resetPasswordEmail, setResetPasswordEmail] = useState<string | null>(null);

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

  // Update verification status mutation
  const updateVerificationStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: status })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Status Updated", "Verification status updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['enhanced-users'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  // Admin trigger password reset for a user
  const resetPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.functions.invoke('auth-engine', {
        body: { action: 'admin_password_reset', email },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Password Reset Sent", "A password reset email has been sent to the user.");
      setResetPasswordEmail(null);
    },
    onError: (error: any) => {
      showError("Reset Failed", error.message || "Could not send password reset email.");
      setResetPasswordEmail(null);
    },
  });

  // Admin send notice/notification to a user
  const sendNoticeMutation = useMutation({
    mutationFn: async ({ email, message }: { email: string; message: string }) => {
      const { error } = await supabase.functions.invoke('auth-engine', {
        body: { action: 'admin_send_notice', email, message },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Notice Sent", "Notification has been sent to the user.");
      setNoticeUserEmail(null);
      setNoticeMessage("");
    },
    onError: (error: any) => {
      showError("Notice Failed", error.message || "Could not send notification.");
      setNoticeUserEmail(null);
      setNoticeMessage("");
    },
  });
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
  const filteredUsers = users?.filter((u) => {
    const matchesSearch = 
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || (u.role || 'general_user') === roleFilter;
    const matchesSuspension = suspensionFilter === "all" || 
      (suspensionFilter === "suspended" && u.is_suspended) ||
      (suspensionFilter === "active" && !u.is_suspended);
    const matchesVerification = verificationFilter === "all" || 
      (u.verification_status || 'pending') === verificationFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const created = new Date(u.created_at);
      const now = new Date();
      if (dateFilter === "today") matchesDate = created.toDateString() === now.toDateString();
      else if (dateFilter === "7d") matchesDate = created >= new Date(now.getTime() - 7 * 86400000);
      else if (dateFilter === "30d") matchesDate = created >= new Date(now.getTime() - 30 * 86400000);
      else if (dateFilter === "90d") matchesDate = created >= new Date(now.getTime() - 90 * 86400000);
    }
    
    return matchesSearch && matchesRole && matchesSuspension && matchesVerification && matchesDate;
  }) || [];

  const getStatusBadge = (user: EnhancedUser) => {
    if (user.is_suspended) {
      return <Badge variant="destructive">SUSPENDED</Badge>;
    }
    
    const colors: Record<string, string> = {
      approved: "bg-chart-1/10 text-chart-1 border-chart-1/30",
      pending: "bg-chart-3/10 text-chart-3 border-chart-3/30",
      rejected: "bg-destructive/10 text-destructive border-destructive/30"
    };
    
    return (
      <Badge className={colors[user.verification_status] || colors.pending}>
        {user.verification_status.toUpperCase()}
      </Badge>
    );
  };

  const getRiskBadge = (riskScore: number) => {
    if (riskScore >= 80) return <Badge variant="destructive">High Risk</Badge>;
    if (riskScore >= 40) return <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/30">Medium Risk</Badge>;
    return <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/30">Low Risk</Badge>;
  };

  return (
    <div className="space-y-3 p-1 md:p-0">
      {/* Professional Header */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-lg">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">User Management</h2>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-[9px] px-1.5 py-0 h-4">
                  {filteredUsers.length} Users
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">Manage users, roles, levels & permissions</p>
            </div>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 text-[10px] px-2">
                <UserPlus className="h-3 w-3 mr-1" />
                Add User
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-border/50">
        <CardContent className="p-2">
          <div className="flex flex-wrap gap-1.5">
            <div className="flex-1 min-w-[180px]">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-3 w-3" />
                <Input
                  placeholder="Search name, email, phone, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-7 text-[10px]"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[120px] h-7 text-[10px]">
                <SelectValue placeholder="Role" />
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
                <SelectValue placeholder="Account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger className="w-[110px] h-7 text-[10px]">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[100px] h-7 text-[10px]">
                <SelectValue placeholder="Joined" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            {(roleFilter !== "all" || suspensionFilter !== "all" || verificationFilter !== "all" || dateFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] px-2 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setRoleFilter("all");
                  setSuspensionFilter("all");
                  setVerificationFilter("all");
                  setDateFilter("all");
                  setSearchTerm("");
                }}
              >
                Clear All
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-accent/50">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-xs font-medium flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-accent" />
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
            <VirtualUserTable
              users={filteredUsers}
              userLevels={userLevels}
              onSuspend={setSelectedUser}
              onUnsuspend={(id) => unsuspendUserMutation.mutate(id)}
              onSecurityView={setSecurityModalUser}
              onRoleChange={(userId, role) => updateUserRoleMutation.mutate({ userId, role })}
              onLevelChange={(userId, levelId) => updateUserLevelMutation.mutate({ userId, levelId })}
              onVerificationChange={(userId, status) => updateVerificationStatusMutation.mutate({ userId, status })}
              onResetPassword={(email) => setResetPasswordEmail(email)}
              onSendNotice={(email) => setNoticeUserEmail(email)}
              unsuspendPending={unsuspendUserMutation.isPending}
              resetPending={resetPasswordMutation.isPending}
            />
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
                  {!securityLogs || securityLogs.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground border rounded-lg bg-muted/20">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                      No security logs found for this user
                    </div>
                  ) : (
                    securityLogs.map((log) => (
                      <div key={log.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-chart-3" />
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
                    ))
                  )}
                </div>
              </div>

              {/* Session Tracking */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Session History
                </h4>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {!sessionData || sessionData.length === 0 ? (
                    <div className="text-center py-6 text-sm text-muted-foreground border rounded-lg bg-muted/20">
                      <Monitor className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                      No session history found for this user
                    </div>
                  ) : (
                    sessionData.map((session) => (
                      <div key={session.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${session.is_active ? 'bg-chart-1' : 'bg-muted-foreground'}`} />
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
                    ))
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Password Reset Confirmation Modal */}
      {resetPasswordEmail && (
        <Dialog open={!!resetPasswordEmail} onOpenChange={() => setResetPasswordEmail(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Reset User Password
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Send a password reset email to <strong>{resetPasswordEmail}</strong>? 
                The user will receive a link to set a new password.
              </p>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => resetPasswordMutation.mutate(resetPasswordEmail)}
                  disabled={resetPasswordMutation.isPending}
                  className="flex-1"
                >
                  {resetPasswordMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" /> Send Reset Email</>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setResetPasswordEmail(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Send Notice Modal */}
      {noticeUserEmail && (
        <Dialog open={!!noticeUserEmail} onOpenChange={() => { setNoticeUserEmail(null); setNoticeMessage(""); }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-chart-2" />
                Send Notice to User
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Recipient</Label>
                <p className="text-sm text-muted-foreground">{noticeUserEmail}</p>
              </div>
              <div>
                <Label>Message</Label>
                <Textarea
                  value={noticeMessage}
                  onChange={(e) => setNoticeMessage(e.target.value)}
                  placeholder="Enter notification message for the user..."
                  rows={4}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => sendNoticeMutation.mutate({ email: noticeUserEmail, message: noticeMessage })}
                  disabled={sendNoticeMutation.isPending || !noticeMessage.trim()}
                  className="flex-1"
                >
                  {sendNoticeMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" /> Send Notice</>
                  )}
                </Button>
                <Button variant="outline" onClick={() => { setNoticeUserEmail(null); setNoticeMessage(""); }} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedUserManagement;
