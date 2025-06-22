
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
import { Shield, UserPlus, Crown, Settings, Trash2, Edit } from "lucide-react";

type UserRole = "general_user" | "property_owner" | "agent" | "vendor" | "admin" | "customer_service";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  verification_status: string;
  created_at: string;
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

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch users with roles
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['user-roles'],
    queryFn: async (): Promise<User[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch admin users
  const { data: adminUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      
      if (error) throw error;
      return { userId, role };
    },
    onSuccess: (data) => {
      showSuccess("Role Updated", `User role updated to ${data.role.replace('_', ' ')}.`);
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      setIsRoleModalOpen(false);
      refetch();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  // Grant admin access mutation
  const grantAdminMutation = useMutation({
    mutationFn: async ({ userId, isSuperAdmin = false }: { userId: string; isSuperAdmin?: boolean }) => {
      // First update the profile role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'admin' as UserRole })
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
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Grant Failed", error.message);
    },
  });

  // Revoke admin access mutation
  const revokeAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      // Remove from admin_users table
      const { error: adminError } = await supabase
        .from('admin_users')
        .delete()
        .eq('user_id', userId);
      
      if (adminError) throw adminError;
      
      // Update profile role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'general_user' as UserRole })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      return userId;
    },
    onSuccess: () => {
      showSuccess("Admin Access Revoked", "Admin access has been revoked successfully.");
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Revoke Failed", error.message);
    },
  });

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

      {/* Users Role Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Roles & Permissions</CardTitle>
          <CardDescription>
            Manage user roles, admin access, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Admin Access</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => {
                  const adminUser = isUserAdmin(user.id);
                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{user.full_name || 'No Name'}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id.slice(0, 8)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
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
