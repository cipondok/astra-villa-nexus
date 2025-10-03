
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
import { UserPlus, Search, Edit, Trash2, Shield, UserCheck, UserX } from "lucide-react";
import EnhancedAdminUserControls from "./EnhancedAdminUserControls";

type UserRole = "general_user" | "property_owner" | "agent" | "vendor" | "admin" | "customer_service";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  verification_status: string;
  created_at: string;
  phone?: string;
  company_name?: string;
  is_suspended?: boolean;
  suspension_reason?: string;
  last_seen_at?: string;
}

const SimpleUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    full_name: "",
    role: "general_user" as UserRole,
    phone: "",
    company_name: ""
  });

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch users
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      const { data, error } = await supabase
        .rpc('get_admin_profiles', { p_role: null, p_limit: 500, p_offset: 0 });
      if (error) throw error;
      return (data as User[]) || [];
    },
  });

  // Create user mutation - using Supabase Auth
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role,
            phone: userData.phone,
            company_name: userData.company_name,
            verification_status: 'approved'
          }
        }
      });
      
      if (authError) throw authError;
      
      // The profile should be created automatically via the trigger
      return authData;
    },
    onSuccess: () => {
      showSuccess("User Created", "New user has been created successfully.");
      setIsCreateModalOpen(false);
      setNewUser({
        email: "",
        password: "",
        full_name: "",
        role: "general_user",
        phone: "",
        company_name: ""
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Creation Failed", error.message);
    },
  });

  // Update user verification mutation
  const updateVerificationMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: status })
        .eq('id', userId);
      
      if (error) throw error;
      return { userId, status };
    },
    onSuccess: (data) => {
      showSuccess("Status Updated", `User verification status updated to ${data.status}.`);
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      return userId;
    },
    onSuccess: () => {
      showSuccess("User Deleted", "User has been removed from the system.");
      queryClient.invalidateQueries({ queryKey: ['users'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Delete Failed", error.message);
    },
  });

  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  }) || [];

  const handleCreateUser = () => {
    if (!newUser.email || !newUser.full_name || !newUser.password) {
      showError("Validation Error", "Email, password, and full name are required.");
      return;
    }
    createUserMutation.mutate(newUser);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800"
    };
    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      agent: "bg-blue-100 text-blue-800",
      vendor: "bg-purple-100 text-purple-800",
      property_owner: "bg-orange-100 text-orange-800",
      customer_service: "bg-cyan-100 text-cyan-800",
      general_user: "bg-gray-100 text-gray-800"
    };
    return (
      <Badge className={colors[role as keyof typeof colors] || colors.general_user}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Create User */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Quick User Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage users, roles, and verification status
          </p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input
                  value={newUser.full_name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value: UserRole) => setNewUser(prev => ({ ...prev, role: value }))}
                >
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
              <div>
                <Label>Phone (Optional)</Label>
                <Input
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label>Company Name (Optional)</Label>
                <Input
                  value={newUser.company_name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, company_name: e.target.value }))}
                  placeholder="Enter company name"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateUser}
                  disabled={createUserMutation.isPending}
                  className="flex-1"
                >
                  {createUserMutation.isPending ? 'Creating...' : 'Create User'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
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
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
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
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.verification_status)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <EnhancedAdminUserControls 
                          user={user}
                          onUserUpdate={() => {
                            queryClient.invalidateQueries({ queryKey: ['users'] });
                            refetch();
                          }}
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteUserMutation.mutate(user.id)}
                          disabled={deleteUserMutation.isPending}
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleUserManagement;
