
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Shield, Users, Edit, Trash2, AlertCircle } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

type UserRole = 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  verification_status?: string;
  created_at?: string;
}

const UserRolesManagement = () => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("general_user");
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch users with better error handling to avoid infinite recursion
  const { data: users, isLoading: usersLoading, error } = useQuery({
    queryKey: ['admin-users-management'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching users:', error);
          throw error;
        }
        
        return data as UserProfile[];
      } catch (err) {
        console.error('Query error:', err);
        // Return empty array instead of throwing to prevent infinite recursion
        return [];
      }
    },
    retry: 1,
    retryDelay: 2000,
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Role Updated", "User role has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
      setShowRoleDialog(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleRoleUpdate = (user: UserProfile) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleDialog(true);
  };

  const handleRoleSave = () => {
    if (selectedUser && newRole) {
      updateUserRoleMutation.mutate({ userId: selectedUser.id, role: newRole });
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      admin: { color: "bg-red-500 text-white", label: "Admin" },
      agent: { color: "bg-blue-500 text-white", label: "Agent" },
      property_owner: { color: "bg-green-500 text-white", label: "Property Owner" },
      vendor: { color: "bg-purple-500 text-white", label: "Vendor" },
      general_user: { color: "bg-gray-500 text-white", label: "General User" }
    };
    
    const config = roleConfig[role];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Error Loading Users</h3>
                <p className="text-sm text-muted-foreground">
                  Unable to load user data. This might be due to database configuration issues.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Shield className="h-5 w-5" />
            User Roles & Access Control
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Manage user roles and permissions across the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Role Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['admin', 'agent', 'property_owner', 'vendor', 'general_user'].map((role) => {
                const count = users?.filter(user => user.role === role).length || 0;
                return (
                  <div key={role} className="bg-muted rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-foreground">{count}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {role.replace('_', ' ')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Users Table */}
            <div className="border border-border rounded-lg bg-card">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-muted-foreground">Role</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-border">
                        <TableCell className="text-foreground">
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
                        <TableCell className="text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.verification_status === 'verified' ? 'default' : 'outline'}>
                            {user.verification_status || 'pending'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRoleUpdate(user)}
                            className="border-border text-foreground hover:bg-muted"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit Role
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Edit Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Update User Role</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Change the role for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Select New Role</Label>
              <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="general_user" className="text-popover-foreground">General User</SelectItem>
                  <SelectItem value="property_owner" className="text-popover-foreground">Property Owner</SelectItem>
                  <SelectItem value="agent" className="text-popover-foreground">Agent</SelectItem>
                  <SelectItem value="vendor" className="text-popover-foreground">Vendor</SelectItem>
                  <SelectItem value="admin" className="text-popover-foreground">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRoleDialog(false)}
              className="border-border text-foreground"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRoleSave}
              disabled={updateUserRoleMutation.isPending}
              className="bg-primary hover:bg-primary/90"
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserRolesManagement;
