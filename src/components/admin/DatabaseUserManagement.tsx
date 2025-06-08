
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
import { useAlert } from "@/contexts/AlertContext";
import { 
  Database, 
  Users, 
  Shield, 
  Key, 
  Eye, 
  Edit, 
  RefreshCw,
  UserCheck,
  UserX,
  Settings,
  Search,
  Filter
} from "lucide-react";

interface DatabaseUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
  phone: string | null;
  avatar_url: string | null;
  company_name: string | null;
  license_number: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  is_admin: boolean;
  admin_permissions: string[];
}

interface AdminUser {
  id: string;
  user_id: string;
  role_id: string | null;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
}

const DatabaseUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [authFilter, setAuthFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch all users with admin status
  const { data: databaseUsers, isLoading, refetch } = useQuery({
    queryKey: ['database-users'],
    queryFn: async (): Promise<DatabaseUser[]> => {
      console.log('Fetching database users with admin status');
      
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
      }

      // Get admin users
      const { data: adminUsers, error: adminError } = await supabase
        .from('admin_users')
        .select('*');
      
      if (adminError) {
        console.error('Error fetching admin users:', adminError);
      }

      // Merge data to create comprehensive user list
      const usersWithAdminStatus: DatabaseUser[] = (profiles || []).map(profile => {
        const adminRecord = adminUsers?.find(admin => admin.user_id === profile.id);
        
        return {
          ...profile,
          is_admin: profile.role === 'admin' || !!adminRecord,
          admin_permissions: adminRecord ? ['super_admin'] : profile.role === 'admin' ? ['admin'] : [],
          last_sign_in_at: null,
          email_confirmed_at: null
        };
      });

      console.log('Fetched database users:', usersWithAdminStatus.length);
      return usersWithAdminStatus;
    },
    retry: 2,
    refetchInterval: 30000,
  });

  // Fetch admin users separately for detailed view
  const { data: adminUsers } = useQuery({
    queryKey: ['admin-users-detailed'],
    queryFn: async (): Promise<AdminUser[]> => {
      console.log('Fetching admin users detailed');
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching admin users:', error);
        return [];
      }
      
      return data || [];
    },
    retry: 2,
  });

  // Grant admin access mutation
  const grantAdminMutation = useMutation({
    mutationFn: async ({ userId, isSuperAdmin = false }: { userId: string; isSuperAdmin?: boolean }) => {
      console.log('Granting admin access:', userId, isSuperAdmin);
      
      // First update the profile role to admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', userId);
      
      if (profileError) {
        throw new Error(`Failed to update profile role: ${profileError.message}`);
      }
      
      // Then add to admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .upsert({
          user_id: userId,
          is_super_admin: isSuperAdmin,
          updated_at: new Date().toISOString()
        });
      
      if (adminError) {
        throw new Error(`Failed to grant admin access: ${adminError.message}`);
      }
      
      return { userId, isSuperAdmin };
    },
    onSuccess: () => {
      showSuccess("Admin Access Granted", "User has been granted admin access successfully.");
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-detailed'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Grant Failed", error.message);
    },
  });

  // Revoke admin access mutation
  const revokeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Revoking admin access:', userId);
      
      // Remove from admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);
      
      if (adminError) {
        throw new Error(`Failed to revoke admin access: ${adminError.message}`);
      }
      
      // Update profile role back to general_user
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'general_user' })
        .eq('id', userId);
      
      if (profileError) {
        throw new Error(`Failed to update profile role: ${profileError.message}`);
      }
      
      return userId;
    },
    onSuccess: () => {
      showSuccess("Admin Access Revoked", "Admin access has been revoked successfully.");
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-detailed'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Revoke Failed", error.message);
    },
  });

  // Filter users based on search and filters
  const filteredUsers = databaseUsers?.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    const matchesAuth = 
      authFilter === "all" ||
      (authFilter === "admin" && user.is_admin) ||
      (authFilter === "verified" && user.verification_status === 'approved') ||
      (authFilter === "pending" && user.verification_status === 'pending');
    
    return matchesSearch && matchesRole && matchesAuth;
  }) || [];

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      approved: "default",
      pending: "secondary",
      rejected: "destructive"
    };
    
    return (
      <Badge variant={statusColors[status] || "outline"}>
        {status?.toUpperCase()}
      </Badge>
    );
  };

  const getRoleBadge = (role: string, isAdmin: boolean) => {
    if (isAdmin) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Shield className="h-3 w-3" />
          ADMIN
        </Badge>
      );
    }
    
    const roleColors: { [key: string]: "default" | "secondary" | "outline" } = {
      agent: "default",
      vendor: "secondary", 
      property_owner: "outline",
      general_user: "outline"
    };
    
    return (
      <Badge variant={roleColors[role] || "outline"}>
        {role?.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const handleViewUser = (user: DatabaseUser) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database User Management
              </CardTitle>
              <CardDescription>
                View user table data, authorization status, and admin access control. Total users: {filteredUsers.length}
              </CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
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
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="property_owner">Property Owner</SelectItem>
                <SelectItem value="general_user">General User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={authFilter} onValueChange={setAuthFilter}>
              <SelectTrigger className="w-[180px]">
                <Key className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access</SelectItem>
                <SelectItem value="admin">Admin Access</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{databaseUsers?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin Users</p>
                <p className="text-2xl font-bold text-red-600">
                  {databaseUsers?.filter(u => u.is_admin).length || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {databaseUsers?.filter(u => u.verification_status === 'approved').length || 0}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Users</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {databaseUsers?.filter(u => u.verification_status === 'pending').length || 0}
                </p>
              </div>
              <UserX className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Database Users & Access Control</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading database users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Auth Status</TableHead>
                  <TableHead>Admin Access</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
                          {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium">{user.full_name || 'No Name'}</div>
                          <div className="text-muted-foreground text-sm">ID: {user.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role, user.is_admin)}</TableCell>
                    <TableCell>{getStatusBadge(user.verification_status)}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            GRANTED
                          </Badge>
                          {user.admin_permissions.includes('super_admin') && (
                            <Badge variant="outline" className="text-xs">SUPER</Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline">NO ACCESS</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {user.is_admin ? (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => revokeAdminMutation.mutate(user.id)}
                            disabled={revokeAdminMutation.isPending}
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => grantAdminMutation.mutate({ userId: user.id })}
                            disabled={grantAdminMutation.isPending}
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            Grant
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

      {/* User Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Database User Details</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>User ID</Label>
                    <p className="font-mono text-sm">{selectedUser.id}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label>Full Name</Label>
                    <p className="font-medium">{selectedUser.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <div className="mt-1">{getRoleBadge(selectedUser.role, selectedUser.is_admin)}</div>
                  </div>
                  <div>
                    <Label>Verification Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedUser.verification_status)}</div>
                  </div>
                </div>
              </div>

              {/* Admin Access Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Admin Access & Permissions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Admin Access</Label>
                    <div className="mt-1">
                      {selectedUser.is_admin ? (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <Shield className="h-3 w-3" />
                          GRANTED
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="w-fit">NO ACCESS</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Permissions</Label>
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {selectedUser.admin_permissions.length > 0 ? (
                        selectedUser.admin_permissions.map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission.toUpperCase()}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No special permissions</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Account Timeline</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Created At</Label>
                    <p className="font-medium">{new Date(selectedUser.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label>Updated At</Label>
                    <p className="font-medium">{new Date(selectedUser.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Company Information (if applicable) */}
              {(selectedUser.company_name || selectedUser.license_number) && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Professional Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedUser.company_name && (
                      <div>
                        <Label>Company Name</Label>
                        <p className="font-medium">{selectedUser.company_name}</p>
                      </div>
                    )}
                    {selectedUser.license_number && (
                      <div>
                        <Label>License Number</Label>
                        <p className="font-medium">{selectedUser.license_number}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {selectedUser.is_admin ? (
                  <Button
                    onClick={() => {
                      revokeAdminMutation.mutate(selectedUser.id);
                      setIsViewModalOpen(false);
                    }}
                    disabled={revokeAdminMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    {revokeAdminMutation.isPending ? 'Revoking...' : 'Revoke Admin Access'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      grantAdminMutation.mutate({ userId: selectedUser.id });
                      setIsViewModalOpen(false);
                    }}
                    disabled={grantAdminMutation.isPending}
                    className="flex-1"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    {grantAdminMutation.isPending ? 'Granting...' : 'Grant Admin Access'}
                  </Button>
                )}
                <Button
                  onClick={() => {
                    grantAdminMutation.mutate({ userId: selectedUser.id, isSuperAdmin: true });
                    setIsViewModalOpen(false);
                  }}
                  disabled={grantAdminMutation.isPending || selectedUser.admin_permissions.includes('super_admin')}
                  variant="outline"
                  className="flex-1"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Grant Super Admin
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DatabaseUserManagement;
