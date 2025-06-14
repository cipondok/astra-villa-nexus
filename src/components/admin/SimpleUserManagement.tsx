
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import { Users, UserPlus, Search, Filter, Shield, Ban, Play, Pause, RefreshCw } from "lucide-react";
import SimpleRegistrationModal from "@/components/auth/SimpleRegistrationModal";

type UserRole = 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin' | 'customer_service';
type UserStatus = 'active' | 'banned' | 'suspended';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  verification_status: string;
  created_at: string;
}

const SimpleUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  
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
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // Data is fresh for 5 seconds
  });

  // Auto-refresh when modal closes
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
        .update(updates)
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
      refetch();
    },
    onError: (error: any) => {
      console.error('Update failed:', error);
      showError("Update Failed", error.message || "Failed to update user");
    },
  });

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

        <SimpleRegistrationModal
          isOpen={isRegistrationModalOpen}
          onClose={() => setIsRegistrationModalOpen(false)}
        />
      </CardContent>
    </Card>
  );
};

export default SimpleUserManagement;
