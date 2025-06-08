
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
import { useAuth } from "@/contexts/AuthContext";
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
  Filter,
  Trash2,
  Crown,
  AlertTriangle
} from "lucide-react";

type UserRole = "general_user" | "property_owner" | "agent" | "vendor" | "admin";

interface DatabaseUser {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<DatabaseUser>>({});
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Check if current user is super admin using the new safe function
  const { data: isSuperAdmin } = useQuery({
    queryKey: ['is-super-admin-safe', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      try {
        // Use the new safe function to check super admin status
        const { data, error } = await supabase.rpc('is_super_admin_safe');
        
        if (error) {
          console.error('Error checking super admin status:', error);
          return false;
        }
        
        console.log('Super admin check result:', data);
        return data || false;
      } catch (error) {
        console.error('Error in super admin check:', error);
        return false;
      }
    },
    enabled: !!user?.id,
  });

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
          admin_permissions: adminRecord ? 
            (adminRecord.is_super_admin ? ['super_admin'] : ['admin']) : 
            (profile.role === 'admin' ? ['admin'] : []),
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

  // Update user profile mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<DatabaseUser>) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userData.full_name,
          phone: userData.phone,
          role: userData.role as UserRole,
          verification_status: userData.verification_status,
          company_name: userData.company_name,
          license_number: userData.license_number,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id);
      
      if (error) throw error;
      return userData;
    },
    onSuccess: () => {
      showSuccess("User Updated", "User profile has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
      setIsEditModalOpen(false);
      refetch();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  // Delete user mutation (Super Admin only)
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (!isSuperAdmin) {
        throw new Error("Only super admins can delete users");
      }
      
      // First remove from admin_users if exists
      await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);
      
      // Then delete from profiles
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      return userId;
    },
    onSuccess: () => {
      showSuccess("User Deleted", "User has been permanently deleted from the system.");
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Delete Failed", error.message);
    },
  });

  // Grant admin access mutation
  const grantAdminMutation = useMutation({
    mutationFn: async ({ userId, isSuperAdmin = false }: { userId: string; isSuperAdmin?: boolean }) => {
      console.log('Granting admin access:', userId, isSuperAdmin);
      
      // First update the profile role to admin
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' as UserRole })
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
    onSuccess: (data) => {
      showSuccess(
        "Admin Access Granted", 
        `${data.isSuperAdmin ? 'Super admin' : 'Admin'} access has been granted successfully.`
      );
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
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
        .update({ role: 'general_user' as UserRole })
        .eq('id', userId);
      
      if (profileError) {
        throw new Error(`Failed to update profile role: ${profileError.message}`);
      }
      
      return userId;
    },
    onSuccess: () => {
      showSuccess("Admin Access Revoked", "Admin access has been revoked successfully.");
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
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

  const getRoleBadge = (role: string, isAdmin: boolean, adminPermissions: string[]) => {
    if (adminPermissions.includes('super_admin')) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1 bg-red-600">
          <Crown className="h-3 w-3" />
          SUPER ADMIN
        </Badge>
      );
    }
    
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

  const handleEditUser = (user: DatabaseUser) => {
    setEditingUser(user);
    setIsEditModalOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser.id) {
      updateUserMutation.mutate(editingUser);
    }
  };

  if (!isSuperAdmin) {
    return (
      <Card className="border-red-500/20">
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900">Access Denied</h3>
          <p className="text-red-700">Super administrator privileges required for database management.</p>
          <p className="text-sm text-red-600 mt-2">
            Current user: {user?.email || 'Not logged in'}
            <br />
            Super admin status: {isSuperAdmin ? 'Granted' : 'Denied'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Super Admin Header */}
      {isSuperAdmin && (
        <Card className="border-red-500/20 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Super Administrator Control Panel</h3>
                <p className="text-sm text-red-700">
                  Full database access enabled for mycode103@gmail.com - Exercise caution with user modifications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database User Management
                {isSuperAdmin && <Crown className="h-4 w-4 text-red-600" />}
              </CardTitle>
              <CardDescription>
                {isSuperAdmin 
                  ? "Super Admin: Full control over user accounts, authorization, and system access"
                  : "View user table data, authorization status, and admin access control"
                }
                <br />Total users: {filteredUsers.length}
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
                <p className="text-sm font-medium text-muted-foreground">Super Admins</p>
                <p className="text-2xl font-bold text-red-600">
                  {databaseUsers?.filter(u => u.admin_permissions.includes('super_admin')).length || 0}
                </p>
              </div>
              <Crown className="h-8 w-8 text-red-600" />
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
                    <TableCell>
                      {user.email}
                      {user.email === 'mycode103@gmail.com' && (
                        <Badge variant="destructive" className="ml-2 text-xs">OWNER</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role, user.is_admin, user.admin_permissions)}</TableCell>
                    <TableCell>{getStatusBadge(user.verification_status)}</TableCell>
                    <TableCell>
                      {user.is_admin ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            GRANTED
                          </Badge>
                          {user.admin_permissions.includes('super_admin') && (
                            <Badge variant="outline" className="text-xs bg-red-50">SUPER</Badge>
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
                        {isSuperAdmin && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        )}
                        {user.is_admin ? (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => revokeAdminMutation.mutate(user.id)}
                            disabled={revokeAdminMutation.isPending || user.email === 'mycode103@gmail.com'}
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
                        {isSuperAdmin && user.email !== 'mycode103@gmail.com' && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              if (confirm(`Are you sure you want to permanently delete user ${user.email}? This action cannot be undone.`)) {
                                deleteUserMutation.mutate(user.id);
                              }
                            }}
                            disabled={deleteUserMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
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
                    <div className="mt-1">{getRoleBadge(selectedUser.role, selectedUser.is_admin, selectedUser.admin_permissions)}</div>
                  </div>
                  <div>
                    <Label>Verification Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedUser.verification_status)}</div>
                  </div>
                </div>
              </div>

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
                          <Badge key={index} variant={permission === 'super_admin' ? 'destructive' : 'outline'} className="text-xs">
                            {permission === 'super_admin' && <Crown className="h-3 w-3 mr-1" />}
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

              <div className="flex gap-3 pt-4 border-t">
                {selectedUser.is_admin ? (
                  <Button
                    onClick={() => {
                      revokeAdminMutation.mutate(selectedUser.id);
                      setIsViewModalOpen(false);
                    }}
                    disabled={revokeAdminMutation.isPending || selectedUser.email === 'mycode103@gmail.com'}
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
                {isSuperAdmin && !selectedUser.admin_permissions.includes('super_admin') && (
                  <Button
                    onClick={() => {
                      grantAdminMutation.mutate({ userId: selectedUser.id, isSuperAdmin: true });
                      setIsViewModalOpen(false);
                    }}
                    disabled={grantAdminMutation.isPending}
                    variant="outline"
                    className="flex-1"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Grant Super Admin
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isSuperAdmin && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-red-600" />
                Super Admin: Edit User Profile
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-700">
                  Caution: You are modifying user data with super admin privileges
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input
                    value={editingUser.full_name || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, full_name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={editingUser.phone || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select 
                    value={editingUser.role || ''} 
                    onValueChange={(value: UserRole) => setEditingUser(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general_user">General User</SelectItem>
                      <SelectItem value="property_owner">Property Owner</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Verification Status</Label>
                  <Select 
                    value={editingUser.verification_status || ''} 
                    onValueChange={(value) => setEditingUser(prev => ({ ...prev, verification_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={editingUser.company_name || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label>License Number</Label>
                  <Input
                    value={editingUser.license_number || ''}
                    onChange={(e) => setEditingUser(prev => ({ ...prev, license_number: e.target.value }))}
                    placeholder="Enter license number"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveUser}
                  disabled={updateUserMutation.isPending}
                  className="flex-1"
                >
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  onClick={() => setIsEditModalOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
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

export default DatabaseUserManagement;
