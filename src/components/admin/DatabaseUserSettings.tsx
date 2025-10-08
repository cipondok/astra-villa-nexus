import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/contexts/AlertContext";
import EnhancedAdminUserControls from "./EnhancedAdminUserControls";
import { 
  Search, 
  Database, 
  Users, 
  Settings,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Shield
} from "lucide-react";

type UserRole = "general_user" | "property_owner" | "agent" | "vendor" | "admin" | "customer_service";

interface DatabaseUser {
  id: string;
  email: string;
  full_name: string;
  role?: UserRole;
  verification_status: string;
  created_at: string;
  updated_at: string;
  last_seen_at?: string;
  phone?: string;
  company_name?: string;
  avatar_url?: string;
  is_suspended?: boolean;
  suspension_reason?: string;
  suspended_at?: string;
  suspended_by?: string;
  profile_completion_percentage?: number;
  availability_status?: string;
  business_address?: string;
  years_experience?: string;
  specializations?: string;
  bio?: string;
  npwp_number?: string;
}

const DatabaseUserSettings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch all users with complete profile data
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['database-users'],
    queryFn: async (): Promise<DatabaseUser[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Get user statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('verification_status, is_suspended');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        active: data.filter(u => !u.is_suspended).length,
        suspended: data.filter(u => u.is_suspended).length,
        pending_verification: data.filter(u => u.verification_status === 'pending').length,
        by_role: {} as Record<string, number>
      };
      
      data.forEach((user: any) => {
        const r = (user as any).role;
        if (r) {
          stats.by_role[r] = (stats.by_role[r] || 0) + 1;
        }
      });
      
      return stats;
    },
  });

  // Bulk operations mutation
  const bulkOperationMutation = useMutation({
    mutationFn: async ({ operation, userIds, data }: { 
      operation: string; 
      userIds: string[]; 
      data?: any 
    }) => {
      let query = supabase.from('profiles');
      
      switch (operation) {
        case 'approve':
          const { error: approveError } = await query
            .update({ verification_status: 'approved' })
            .in('id', userIds);
          if (approveError) throw approveError;
          break;
          
        case 'suspend':
          const { data: currentUser, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          
          const { error: suspendError } = await query
            .update({
              is_suspended: true,
              suspension_reason: data.reason,
              suspended_at: new Date().toISOString(),
              suspended_by: currentUser?.user?.id
            })
            .in('id', userIds);
          if (suspendError) throw suspendError;
          break;
          
        case 'unsuspend':
          const { error: unsuspendError } = await query
            .update({
              is_suspended: false,
              suspension_reason: null,
              suspended_at: null,
              suspended_by: null
            })
            .in('id', userIds);
          if (unsuspendError) throw unsuspendError;
          break;
          
        case 'delete':
          const { error: deleteError } = await query
            .delete()
            .in('id', userIds);
          if (deleteError) throw deleteError;
          break;
      }
      
      return { operation, userIds };
    },
    onSuccess: (data) => {
      showSuccess("Bulk Operation", `${data.operation} completed for ${data.userIds.length} users.`);
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Operation Failed", error.message);
    },
  });

  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || (user.role || 'general_user') === roleFilter;
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && !user.is_suspended) ||
      (statusFilter === "suspended" && user.is_suspended) ||
      (statusFilter === "pending" && user.verification_status === 'pending') ||
      (statusFilter === "approved" && user.verification_status === 'approved');
    
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  const getStatusBadge = (user: DatabaseUser) => {
    if (user.is_suspended) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Suspended</Badge>;
    }
    if (user.verification_status === 'approved') {
      return <Badge variant="default" className="gap-1"><CheckCircle className="h-3 w-3" />Active</Badge>;
    }
    return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      agent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      vendor: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      property_owner: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      customer_service: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
      general_user: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return (
      <Badge className={colors[role as keyof typeof colors] || colors.general_user}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const handleViewUserDetails = (user: DatabaseUser) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Database Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{userStats?.total || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{userStats?.active || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold">{userStats?.suspended || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Verification</p>
                <p className="text-2xl font-bold">{userStats?.pending_verification || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database User Settings & Management
          </CardTitle>
          <CardDescription>
            Advanced user management with complete database access and bulk operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name, email, or ID..."
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Database Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading database users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching current filters
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Details</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Role & Status</TableHead>
                    <TableHead>Database Info</TableHead>
                    <TableHead>Profile Completion</TableHead>
                    <TableHead>Admin Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{user.full_name || 'No Name'}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Created: {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-muted-foreground">{user.phone}</div>
                          )}
                          {user.company_name && (
                            <div className="text-xs text-muted-foreground">{user.company_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-xs">
                          <div>Updated: {new Date(user.updated_at).toLocaleString()}</div>
                          {user.last_seen_at && (
                            <div>Last seen: {new Date(user.last_seen_at).toLocaleString()}</div>
                          )}
                          {user.availability_status && (
                            <Badge variant="outline">{user.availability_status}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {user.profile_completion_percentage || 0}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${user.profile_completion_percentage || 0}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          <EnhancedAdminUserControls 
                            user={user}
                            onUserUpdate={() => {
                              queryClient.invalidateQueries({ queryKey: ['database-users'] });
                              queryClient.invalidateQueries({ queryKey: ['user-stats'] });
                              refetch();
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewUserDetails(user)}
                            title="View full details"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete User Database Record</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h4 className="font-semibold mb-3">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedUser.id}</div>
                  <div><span className="font-medium">Email:</span> {selectedUser.email}</div>
                  <div><span className="font-medium">Full Name:</span> {selectedUser.full_name || 'N/A'}</div>
                  <div><span className="font-medium">Phone:</span> {selectedUser.phone || 'N/A'}</div>
                  <div><span className="font-medium">Company:</span> {selectedUser.company_name || 'N/A'}</div>
                  <div><span className="font-medium">Role:</span> {selectedUser.role}</div>
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h4 className="font-semibold mb-3">Status & Verification</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Verification Status:</span> {selectedUser.verification_status}</div>
                  <div><span className="font-medium">Availability:</span> {selectedUser.availability_status || 'N/A'}</div>
                  <div><span className="font-medium">Suspended:</span> {selectedUser.is_suspended ? 'Yes' : 'No'}</div>
                  <div><span className="font-medium">Profile Completion:</span> {selectedUser.profile_completion_percentage || 0}%</div>
                </div>
                {selectedUser.is_suspended && selectedUser.suspension_reason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <span className="font-medium">Suspension Reason:</span>
                    <p className="mt-1 text-sm">{selectedUser.suspension_reason}</p>
                  </div>
                )}
              </div>

              {/* Timestamps */}
              <div>
                <h4 className="font-semibold mb-3">Timestamps</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">Created:</span> {new Date(selectedUser.created_at).toLocaleString()}</div>
                  <div><span className="font-medium">Updated:</span> {new Date(selectedUser.updated_at).toLocaleString()}</div>
                  <div><span className="font-medium">Last Seen:</span> {selectedUser.last_seen_at ? new Date(selectedUser.last_seen_at).toLocaleString() : 'Never'}</div>
                  {selectedUser.suspended_at && (
                    <div><span className="font-medium">Suspended At:</span> {new Date(selectedUser.suspended_at).toLocaleString()}</div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {(selectedUser.business_address || selectedUser.bio || selectedUser.specializations || selectedUser.years_experience || selectedUser.npwp_number) && (
                <div>
                  <h4 className="font-semibold mb-3">Additional Information</h4>
                  <div className="space-y-2 text-sm">
                    {selectedUser.business_address && (
                      <div><span className="font-medium">Business Address:</span> {selectedUser.business_address}</div>
                    )}
                    {selectedUser.years_experience && (
                      <div><span className="font-medium">Years Experience:</span> {selectedUser.years_experience}</div>
                    )}
                    {selectedUser.specializations && (
                      <div><span className="font-medium">Specializations:</span> {selectedUser.specializations}</div>
                    )}
                    {selectedUser.npwp_number && (
                      <div><span className="font-medium">NPWP Number:</span> {selectedUser.npwp_number}</div>
                    )}
                    {selectedUser.bio && (
                      <div>
                        <span className="font-medium">Bio:</span>
                        <p className="mt-1">{selectedUser.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatabaseUserSettings;