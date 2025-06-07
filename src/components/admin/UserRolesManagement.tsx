
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Shield, Users, Plus, Edit, Trash2 } from "lucide-react";
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

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserProfile[];
    },
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Role Updated", "User role has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
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
    const roleColors = {
      admin: "bg-red-500",
      agent: "bg-blue-500",
      property_owner: "bg-green-500",
      vendor: "bg-purple-500",
      general_user: "bg-gray-500"
    };
    
    return (
      <Badge className={`${roleColors[role]} text-white`}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="h-5 w-5" />
            User Roles & Access Control
          </CardTitle>
          <CardDescription className="text-gray-300">
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
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>

            {/* Users Table */}
            <div className="border border-white/20 rounded-lg bg-white/5">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-gray-300">User</TableHead>
                    <TableHead className="text-gray-300">Email</TableHead>
                    <TableHead className="text-gray-300">Role</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-300">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-300">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id} className="border-white/20">
                        <TableCell className="text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-medium">{user.full_name || 'No Name'}</div>
                              <div className="text-gray-400 text-sm">ID: {user.id.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{user.email}</TableCell>
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
                            className="border-gray-600 text-gray-300 hover:bg-white/10"
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
        <DialogContent className="max-w-md bg-gray-900/95 backdrop-blur-md border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Update User Role</DialogTitle>
            <DialogDescription className="text-gray-300">
              Change the role for {selectedUser?.full_name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300">Select New Role</Label>
              <Select value={newRole} onValueChange={(value: UserRole) => setNewRole(value)}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="general_user" className="text-white">General User</SelectItem>
                  <SelectItem value="property_owner" className="text-white">Property Owner</SelectItem>
                  <SelectItem value="agent" className="text-white">Agent</SelectItem>
                  <SelectItem value="vendor" className="text-white">Vendor</SelectItem>
                  <SelectItem value="admin" className="text-white">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRoleDialog(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRoleSave}
              disabled={updateUserRoleMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
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
