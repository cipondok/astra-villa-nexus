
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/contexts/AlertContext";
import { Users, UserPlus, Search, Filter, Shield, Ban, Play, Pause, RefreshCw, Edit, Eye } from "lucide-react";
import SimpleRegistrationModal from "@/components/auth/SimpleRegistrationModal";

type UserRole = 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin' | 'customer_service';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  verification_status: string;
  created_at: string;
  phone: string | null;
  company_name: string | null;
  license_number: string | null;
}

const SimpleUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<UserProfile>>({});
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-users-management', searchTerm, roleFilter],
    queryFn: async () => {
      console.log('Fetching users for simple management...');
      
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      console.log('Users fetched successfully:', data?.length);
      return data || [];
    },
    refetchInterval: 10000,
    staleTime: 5000,
  });

  useEffect(() => {
    if (!isRegistrationModalOpen) {
      const timer = setTimeout(() => {
        refetch();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isRegistrationModalOpen, refetch]);

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) => {
      console.log('Updating user:', userId, updates);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone: updates.phone,
          role: updates.role,
          verification_status: updates.verification_status,
          company_name: updates.company_name,
          license_number: updates.license_number,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user:', error);
        throw new Error(`Failed to update user: ${error.message}`);
      }

      return userId;
    },
    onSuccess: (userId) => {
      showSuccess("User Updated", "User information has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
      setIsEditModalOpen(false);
      setSelectedUser(null);
      setEditingUser({});
      refetch();
    },
    onError: (error: any) => {
      console.error('Update failed:', error);
      showError("Update Failed", error.message || "Failed to update user");
    },
  });

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setEditingUser({
      id: user.id,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      verification_status: user.verification_status,
      company_name: user.company_name,
      license_number: user.license_number
    });
    setIsEditModalOpen(true);
  };

  const handleViewUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser.id) {
      updateUserMutation.mutate({
        userId: editingUser.id,
        updates: editingUser
      });
    }
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    updateUserMutation.mutate({
      userId,
      updates: { role: newRole }
    });
  };

  const handleStatusChange = (userId: string, action: 'ban' | 'unban' | 'suspend') => {
    let newStatus: string;
    switch (action) {
      case 'ban':
        newStatus = 'banned';
        break;
      case 'unban':
        newStatus = 'approved';
        break;
      case 'suspend':
        newStatus = 'suspended';
        break;
      default:
        newStatus = 'approved';
    }

    updateUserMutation.mutate({
      userId,
      updates: { verification_status: newStatus }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>;
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      case 'suspended':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const colors = {
      admin: "bg-red-100 text-red-800",
      agent: "bg-blue-100 text-blue-800",
      vendor: "bg-purple-100 text-purple-800",
      property_owner: "bg-green-100 text-green-800",
      customer_service: "bg-orange-100 text-orange-800",
      general_user: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge variant="outline" className={colors[role]}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Simple User Management
            </CardTitle>
            <CardDescription>
              Quick actions for user management - roles, status, and registration
              <br />
              Total users: {users.length} | Showing: {filteredUsers.length}
            </CardDescription>
          </div>
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={(value: UserRole | "all") => setRoleFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="general_user">General User</SelectItem>
              <SelectItem value="property_owner">Property Owner</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="customer_service">Customer Service</SelectItem>
              <SelectItem value="vendor">Vendor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsRegistrationModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Users List */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {users.length === 0 ? 'No users found in database' : 'No users match your filters'}
            </p>
            {users.length === 0 && (
              <p className="text-sm text-gray-400 mt-2">
                Users will appear here after they verify their email and sign in
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium truncate">{user.full_name || 'No Name'}</h3>
                      {getRoleBadge(user.role)}
                      {getStatusBadge(user.verification_status)}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-gray-400">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewUser(user)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    <Select
                      value={user.role}
                      onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <Shield className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general_user">General User</SelectItem>
                        <SelectItem value="property_owner">Property Owner</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="customer_service">Customer Service</SelectItem>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-1">
                      {user.verification_status === 'banned' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(user.id, 'unban')}
                          disabled={updateUserMutation.isPending}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(user.id, 'suspend')}
                            disabled={updateUserMutation.isPending}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(user.id, 'ban')}
                            disabled={updateUserMutation.isPending}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Registration Modal */}
        <SimpleRegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
        />

        {/* View User Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name</Label>
                    <p className="font-medium">{selectedUser.full_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedUser.verification_status)}</div>
                  </div>
                  <div>
                    <Label>Joined</Label>
                    <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {(selectedUser.company_name || selectedUser.license_number) && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Professional Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedUser.company_name && (
                        <div>
                          <Label>Company</Label>
                          <p className="font-medium">{selectedUser.company_name}</p>
                        </div>
                      )}
                      {selectedUser.license_number && (
                        <div>
                          <Label>License</Label>
                          <p className="font-medium">{selectedUser.license_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                      <SelectItem value="customer_service">Customer Service</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select 
                    value={editingUser.verification_status || ''} 
                    onValueChange={(value) => setEditingUser(prev => ({ ...prev, verification_status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="banned">Banned</SelectItem>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveUser}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default SimpleUserManagement;
