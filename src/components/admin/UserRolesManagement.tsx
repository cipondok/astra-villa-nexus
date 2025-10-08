import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/contexts/AlertContext";
import { Shield, UserPlus, Crown, Settings, Trash2, Edit, Search, RefreshCw } from "lucide-react";

type UserRole = "general_user" | "property_owner" | "agent" | "vendor" | "admin" | "customer_service";

interface User {
  id: string;
  email: string;
  full_name: string;
  role?: UserRole;
  verification_status: string;
  created_at: string;
  phone?: string;
  company_name?: string;
  last_seen_at?: string;
}

interface AdminUser {
  id: string;
  user_id: string;
  role_id: string | null;
  is_super_admin: boolean;
  created_at: string;
}

const UserRolesManagement = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole>("general_user");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch all users with roles
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['all-user-roles'],
    queryFn: async (): Promise<User[]> => {
      console.log('Fetching all users...');
      
      // First try to get users from profiles table
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles fetched:', profilesData?.length);
      
      // If we don't get many users from profiles, try auth.users (admin only)
      if (!profilesData || profilesData.length === 0) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email === 'mycode103@gmail.com') {
            // For super admin, we can access more user data
            const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
            
            if (authError) {
              console.error('Error fetching auth users:', authError);
            } else {
              console.log('Auth users fetched:', authUsers?.users?.length);
              // Transform auth users to our format
              return authUsers.users.map(user => ({
                id: user.id,
                email: user.email || '',
                full_name: user.user_metadata?.full_name || user.email || 'Unknown User',
                role: 'general_user' as UserRole,
                verification_status: 'pending',
                created_at: user.created_at,
                phone: user.phone || undefined,
                last_seen_at: user.last_sign_in_at || undefined
              }));
            }
          }
        } catch (authError) {
          console.error('Auth access error:', authError);
        }
      }
      
      return (profilesData || []).map(p => ({ ...p, role: 'general_user' as UserRole }));
    },
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Fetch admin users
  const { data: adminUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*');
      
      if (error) {
        console.error('Error fetching admin users:', error);
        return [];
      }
      return data || [];
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      console.log('Updating role for user:', userId, 'to role:', role);
      
      // First get the user's current data
      const { data: currentUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching current user:', fetchError);
        throw fetchError;
      }

      // Update with all required fields
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      return { userId, role };
    },
    onSuccess: (data) => {
      showSuccess("Role Updated", `User role updated to ${data.role.replace('_', ' ')}.`);
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      setIsRoleModalOpen(false);
      refetch();
    },
    onError: (error: any) => {
      console.error('Role update error:', error);
      showError("Update Failed", error.message);
    },
  });

  // Grant admin access mutation
  const grantAdminMutation = useMutation({
    mutationFn: async ({ userId, isSuperAdmin = false }: { userId: string; isSuperAdmin?: boolean }) => {
      console.log('Granting admin access to user:', userId);
      
      // First update the profile role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin' as UserRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      // Then add to admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .upsert({
          user_id: userId,
          is_super_admin: isSuperAdmin
        });
      
      if (adminError) throw adminError;
      return { userId, isSuperAdmin };
    },
    onSuccess: (data) => {
      showSuccess(
        "Admin Access Granted", 
        `${data.isSuperAdmin ? 'Super admin' : 'Admin'} access granted successfully.`
      );
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      refetch();
    },
    onError: (error: any) => {
      console.error('Grant admin error:', error);
      showError("Grant Failed", error.message);
    },
  });

  // Revoke admin access mutation
  const revokeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      console.log('Revoking admin access for user:', userId);
      
      // Remove from admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);
      
      if (adminError) throw adminError;
      
      // Update profile role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: 'general_user' as UserRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      return userId;
    },
    onSuccess: () => {
      showSuccess("Admin Access Revoked", "Admin access has been revoked successfully.");
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      refetch();
    },
    onError: (error: any) => {
      console.error('Revoke admin error:', error);
      showError("Revoke Failed", error.message);
    },
  });

  // Filter users based on search and role filter
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];

  const isUserAdmin = (userId: string): AdminUser | undefined => {
    return adminUsers?.find(admin => admin.user_id === userId);
  };

  const getRoleBadge = (role: string, userId: string) => {
    const adminUser = isUserAdmin(userId);
    
    if (adminUser?.is_super_admin) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Crown className="h-3 w-3" />
          SUPER ADMIN
        </Badge>
      );
    }
    
    if (role === 'admin' || adminUser) {
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
      general_user: "outline",
      customer_service: "outline"
    };
    
    return (
      <Badge variant={roleColors[role] || "outline"}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const handleRoleChange = () => {
    if (selectedUser) {
      updateRoleMutation.mutate({
        userId: selectedUser.id,
        role: newRole
      });
    }
  };

  const openRoleModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Role Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users?.length || 0}</p>
              </div>
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admin Users</p>
                <p className="text-2xl font-bold text-red-600">
                  {users?.filter(u => u.role === 'admin').length || 0}
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
                <p className="text-sm font-medium text-muted-foreground">Agents</p>
                <p className="text-2xl font-bold text-blue-600">
                  {users?.filter(u => u.role === 'agent').length || 0}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendors</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users?.filter(u => u.role === 'vendor').length || 0}
                </p>
              </div>
              <Settings className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users by name or email..."
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
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Role Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Roles & Permissions ({filteredUsers.length} users)</CardTitle>
          <CardDescription>
            Manage user roles, admin access, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || roleFilter !== "all" ? "No users found matching your filters." : "No users found in the database."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Admin Access</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const adminUser = isUserAdmin(user.id);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{user.full_name || 'No Name'}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                          {user.phone && (
                            <div className="text-sm text-muted-foreground">
                              📞 {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="break-all">{user.email}</div>
                      </TableCell>
                      <TableCell>{getRoleBadge(user.role, user.id)}</TableCell>
                      <TableCell>
                        {adminUser ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive">GRANTED</Badge>
                            {adminUser.is_super_admin && (
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
                        {user.last_seen_at ? new Date(user.last_seen_at).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRoleModal(user)}
                            disabled={updateRoleMutation.isPending}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Role
                          </Button>
                          {adminUser ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => revokeAdminMutation.mutate(user.id)}
                              disabled={revokeAdminMutation.isPending}
                            >
                              Revoke Admin
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => grantAdminMutation.mutate({ userId: user.id })}
                              disabled={grantAdminMutation.isPending}
                            >
                              Grant Admin
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Change Modal */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>User</Label>
                <p className="font-medium">{selectedUser.full_name} ({selectedUser.email})</p>
              </div>
              <div>
                <Label>Current Role</Label>
                <p>{selectedUser.role.replace('_', ' ').toUpperCase()}</p>
              </div>
              <div>
                <Label>New Role</Label>
                <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_user">General User</SelectItem>
                    <SelectItem value="property_owner">Property Owner</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="customer_service">Customer Service</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleRoleChange}
                  disabled={updateRoleMutation.isPending}
                  className="flex-1"
                >
                  {updateRoleMutation.isPending ? 'Updating...' : 'Update Role'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserRolesManagement;
