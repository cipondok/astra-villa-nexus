
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Users, 
  Shield, 
  UserX, 
  UserCheck, 
  Ban, 
  Clock,
  RefreshCw,
  UserPlus
} from "lucide-react";
import SimpleRegistrationModal from "./SimpleRegistrationModal";

type UserRole = 'general_user' | 'property_owner' | 'agent' | 'vendor' | 'admin';
type UserStatus = 'approved' | 'pending' | 'banned' | 'suspended' | 'blocked';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: UserRole;
  verification_status?: string;
  created_at?: string;
}

const SimpleUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { showSuccess, showError } = useAlert();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is admin
  const isAdmin = user?.email === 'mycode103@gmail.com';

  // Fetch all users
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['simple-user-management'],
    queryFn: async () => {
      console.log('Fetching users for simple management');
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
    },
    retry: 1,
    enabled: !!isAdmin,
  });

  // Quick action mutations
  const quickActionMutation = useMutation({
    mutationFn: async ({ userId, action, value }: { 
      userId: string; 
      action: 'role' | 'status' | 'ban' | 'suspend' | 'unban'; 
      value?: string; 
    }) => {
      console.log('Quick action:', action, 'for user:', userId, 'value:', value);
      
      let updateData: any = { updated_at: new Date().toISOString() };
      
      switch (action) {
        case 'role':
          updateData.role = value;
          break;
        case 'status':
          updateData.verification_status = value;
          break;
        case 'ban':
          updateData.verification_status = 'banned';
          break;
        case 'suspend':
          updateData.verification_status = 'suspended';
          break;
        case 'unban':
          updateData.verification_status = 'approved';
          break;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);
      
      if (error) throw error;
      return { action, userId };
    },
    onSuccess: (data) => {
      const actionMessages = {
        role: "User role updated successfully",
        status: "User status updated successfully", 
        ban: "User has been banned",
        suspend: "User has been suspended",
        unban: "User has been unbanned"
      };
      
      showSuccess("Action Completed", actionMessages[data.action]);
      queryClient.invalidateQueries({ queryKey: ['simple-user-management'] });
      refetch();
    },
    onError: (error: any) => {
      console.error('Quick action failed:', error);
      showError("Action Failed", error.message);
    },
  });

  // Filter users
  const filteredUsers = users?.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusBadge = (status?: string) => {
    const statusConfig = {
      approved: { variant: "default" as const, color: "bg-green-600", label: "ACTIVE" },
      pending: { variant: "secondary" as const, color: "bg-yellow-600", label: "PENDING" },
      banned: { variant: "destructive" as const, color: "bg-red-600", label: "BANNED" },
      suspended: { variant: "destructive" as const, color: "bg-orange-600", label: "SUSPENDED" },
      blocked: { variant: "destructive" as const, color: "bg-gray-600", label: "BLOCKED" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: UserRole) => {
    const roleColors = {
      admin: "bg-red-500",
      agent: "bg-blue-500", 
      vendor: "bg-purple-500",
      property_owner: "bg-green-500",
      general_user: "bg-gray-500"
    };
    
    return (
      <Badge className={`${roleColors[role]} text-white`}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (!isAdmin) {
    return (
      <Card className="border-red-500/20">
        <CardContent className="p-6 text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900">Access Denied</h3>
          <p className="text-red-700">Administrator privileges required</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Simple User Management
              </CardTitle>
              <CardDescription>
                Easy user management with quick actions for role changes, bans, and suspensions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <Input
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{filteredUsers.length}</div>
                <div className="text-sm text-blue-700">Total Users</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {users?.filter(u => u.verification_status === 'approved').length || 0}
                </div>
                <div className="text-sm text-green-700">Active Users</div>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {users?.filter(u => u.verification_status === 'banned').length || 0}
                </div>
                <div className="text-sm text-red-700">Banned Users</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {users?.filter(u => u.verification_status === 'suspended').length || 0}
                </div>
                <div className="text-sm text-orange-700">Suspended</div>
              </div>
            </div>

            {/* Users Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Quick Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.full_name || 'No Name'}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getRoleBadge(user.role)}
                          <Select 
                            value={user.role} 
                            onValueChange={(value: UserRole) => 
                              quickActionMutation.mutate({ 
                                userId: user.id, 
                                action: 'role', 
                                value 
                              })
                            }
                          >
                            <SelectTrigger className="w-32 h-8">
                              <span className="text-xs">Change</span>
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
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.verification_status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {user.verification_status === 'banned' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => 
                                quickActionMutation.mutate({ 
                                  userId: user.id, 
                                  action: 'unban' 
                                })
                              }
                              disabled={quickActionMutation.isPending}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Unban
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => 
                                quickActionMutation.mutate({ 
                                  userId: user.id, 
                                  action: 'ban' 
                                })
                              }
                              disabled={quickActionMutation.isPending}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Ban
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => 
                              quickActionMutation.mutate({ 
                                userId: user.id, 
                                action: 'suspend' 
                              })
                            }
                            disabled={quickActionMutation.isPending}
                          >
                            <Clock className="h-4 w-4 mr-1" />
                            Suspend
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <SimpleRegistrationModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
      />
    </div>
  );
};

export default SimpleUserManagement;
