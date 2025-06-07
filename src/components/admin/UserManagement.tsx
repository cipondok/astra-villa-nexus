
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, UserCheck, UserX, Mail, Phone } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

type UserRole = "general_user" | "property_owner" | "agent" | "vendor" | "admin";

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm, roleFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter as UserRole);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("User Updated", "User has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleRoleChange = (userId: string, newRole: string) => {
    updateUserMutation.mutate({ userId, updates: { role: newRole as UserRole } });
  };

  const handleStatusChange = (userId: string, newStatus: string) => {
    updateUserMutation.mutate({ userId, updates: { verification_status: newStatus } });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'agent': return 'default';
      case 'vendor': return 'secondary';
      case 'property_owner': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user accounts, roles, and verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="general_user">General User</SelectItem>
                <SelectItem value="property_owner">Property Owner</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading users...
                    </TableCell>
                  </TableRow>
                ) : users?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.full_name || 'No name'}</div>
                            <div className="text-sm text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.role}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-36">
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {user.role.replace('_', ' ')}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general_user">General User</SelectItem>
                            <SelectItem value="property_owner">Property Owner</SelectItem>
                            <SelectItem value="agent">Agent</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={user.verification_status || 'pending'}
                          onValueChange={(value) => handleStatusChange(user.id, value)}
                        >
                          <SelectTrigger className="w-28">
                            <Badge variant={getStatusBadgeVariant(user.verification_status || 'pending')}>
                              {user.verification_status || 'pending'}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(user.id, 'verified')}
                            disabled={user.verification_status === 'verified'}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(user.id, 'rejected')}
                            disabled={user.verification_status === 'rejected'}
                          >
                            <UserX className="h-4 w-4" />
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
    </div>
  );
};

export default UserManagement;
