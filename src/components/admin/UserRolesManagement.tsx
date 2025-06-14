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
import { Shield, Users, Edit, Trash2, AlertCircle, CheckCircle, XCircle, Crown, UserPlus, Plus, RefreshCw } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import UserCreationModal from "./UserCreationModal";

type UserRole = 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin' | 'customer_service';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  verification_status?: string;
  created_at?: string;
  phone?: string;
  company_name?: string;
  license_number?: string;
}

const UserRolesManagement = () => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>("general_user");
  const [newVerificationStatus, setNewVerificationStatus] = useState("pending");
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { showSuccess, showError } = useAlert();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is super admin using email
  const isSuperAdmin = user?.email === 'mycode103@gmail.com';

  // Fetch users with improved error handling and retry logic
  const { data: users, isLoading: usersLoading, error, refetch } = useQuery({
    queryKey: ['admin-users-management'],
    queryFn: async () => {
      try {
        console.log('Fetching users for admin panel');
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching users:', error);
          throw error;
        }
        
        console.log('Fetched users:', data?.length);
        return data as UserProfile[];
      } catch (err) {
        console.error('Query error:', err);
        throw err;
      }
    },
    retry: 2,
    retryDelay: 1000,
    enabled: !!isSuperAdmin,
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role, verificationStatus }: { 
      userId: string; 
      role: UserRole; 
      verificationStatus?: string; 
    }) => {
      console.log('Updating user role and status:', userId, role, verificationStatus);
      const updateData: any = { 
        role, 
        updated_at: new Date().toISOString() 
      };
      
      if (verificationStatus) {
        updateData.verification_status = verificationStatus;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("User Updated", "User role and status have been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
      setShowRoleDialog(false);
      setSelectedUser(null);
      refetch();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const updateVerificationMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      console.log('Updating verification status:', userId, status);
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_status: status,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Status Updated", "User verification status has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
      queryClient.invalidateQueries({ queryKey: ['database-users'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  // Only show this component if user is super admin
  if (!isSuperAdmin) {
    return (
      <Card className="border-red-500/20">
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900">Access Denied</h3>
          <p className="text-red-700">Super administrator privileges required for user roles management.</p>
        </CardContent>
      </Card>
    );
  }

  const handleRoleUpdate = (user: UserProfile) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewVerificationStatus(user.verification_status || 'pending');
    setShowRoleDialog(true);
  };

  const handleRoleSave = () => {
    if (selectedUser && newRole) {
      updateUserRoleMutation.mutate({ 
        userId: selectedUser.id, 
        role: newRole,
        verificationStatus: newVerificationStatus
      });
    }
  };

  const handleVerificationToggle = (user: UserProfile) => {
    const newStatus = user.verification_status === 'approved' ? 'pending' : 'approved';
    updateVerificationMutation.mutate({ userId: user.id, status: newStatus });
  };

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    refetch();
  };

  const getRoleBadge = (role: UserRole) => {
    const roleConfig = {
      admin: { color: "bg-red-500 text-white", label: "Admin" },
      agent: { color: "bg-blue-500 text-white", label: "Agent" },
      property_owner: { color: "bg-green-500 text-white", label: "Property Owner" },
      vendor: { color: "bg-purple-500 text-white", label: "Vendor" },
      customer_service: { color: "bg-orange-500 text-white", label: "Customer Service" },
      general_user: { color: "bg-gray-500 text-white", label: "General User" }
    };
    
    const config = roleConfig[role] || roleConfig.general_user;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status?: string) => {
    if (!status || status === 'pending') {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          PENDING
        </Badge>
      );
    }
    
    if (status === 'approved') {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-600">
          <CheckCircle className="h-3 w-3" />
          APPROVED
        </Badge>
      );
    }
    
    return (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        {status.toUpperCase()}
      </Badge>
    );
  };

  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const pendingUsers = filteredUsers.filter(user => !user.verification_status || user.verification_status === 'pending');
  const approvedUsers = filteredUsers.filter(user => user.verification_status === 'approved');

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
                  Unable to load user data: {error.message}
                </p>
                <Button onClick={handleRefresh} className="mt-2" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Shield className="h-5 w-5" />
                User Roles & Access Control
                {isSuperAdmin && <Crown className="h-4 w-4 text-red-600" />}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage user roles and permissions across the platform
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRefresh}
                variant="outline"
                className="border-border text-foreground"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>
          </div>
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

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{filteredUsers.length}</div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingUsers.length}</div>
                <div className="text-sm text-yellow-700">Pending Approval</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{approvedUsers.length}</div>
                <div className="text-sm text-green-700">Approved Users</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {users?.filter(user => user.role === 'admin').length || 0}
                </div>
                <div className="text-sm text-red-700">Admin Users</div>
              </div>
            </div>

            {/* All Users Table */}
            <div className="border border-border rounded-lg bg-card">
              <div className="p-4 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">All Users</h3>
              </div>
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
                        {users?.length === 0 ? "No users found. Try creating a new user." : "No users match your search criteria."}
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
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.verification_status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRoleUpdate(user)}
                              className="border-border text-foreground hover:bg-muted"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit Role
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerificationToggle(user)}
                              className={user.verification_status === 'approved' ? 
                                "border-yellow-500 text-yellow-700 hover:bg-yellow-50" : 
                                "border-green-500 text-green-700 hover:bg-green-50"
                              }
                            >
                              {user.verification_status === 'approved' ? 'Set Pending' : 'Approve'}
                            </Button>
                          </div>
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

      {/* Enhanced Role Edit Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-card-foreground">Update User Role & Status</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Change the role and verification status for {selectedUser?.full_name || selectedUser?.email}
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
                  <SelectItem value="customer_service" className="text-popover-foreground">Customer Service</SelectItem>
                  <SelectItem value="vendor" className="text-popover-foreground">Vendor</SelectItem>
                  <SelectItem value="admin" className="text-popover-foreground">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-foreground">Verification Status</Label>
              <Select value={newVerificationStatus} onValueChange={setNewVerificationStatus}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue placeholder="Select verification status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="approved" className="text-popover-foreground">Approved</SelectItem>
                  <SelectItem value="pending" className="text-popover-foreground">Pending</SelectItem>
                  <SelectItem value="rejected" className="text-popover-foreground">Rejected</SelectItem>
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
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Creation Modal */}
      <UserCreationModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
};

export default UserRolesManagement;
