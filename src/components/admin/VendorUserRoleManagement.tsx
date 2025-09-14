import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Users, Shield, Edit, Ban, CheckCircle } from "lucide-react";

interface VendorUser {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  verification_status: string;
  is_suspended: boolean;
  suspension_reason?: string;
  created_at: string;
  phone?: string;
  company_name?: string;
  vendor_business_profiles?: {
    business_name: string;
    is_verified: boolean;
    is_active: boolean;
  };
}

const VendorUserRoleManagement = () => {
  const [selectedUser, setSelectedUser] = useState<VendorUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch vendor users
  const { data: vendorUsers, isLoading } = useQuery({
    queryKey: ['vendor-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          vendor_business_profiles (
            business_name,
            is_verified,
            is_active
          )
        `)
        .eq('role', 'vendor')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as VendorUser[];
    }
  });

  // Update user role mutation
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: "general_user" | "property_owner" | "agent" | "vendor" | "admin" | "customer_service" }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "User role updated successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-users'] });
      setIsEditModalOpen(false);
    },
    onError: () => {
      showError("Error", "Failed to update user role");
    }
  });

  // Suspend user mutation
  const suspendUserMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_suspended: true,
          suspension_reason: reason
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "User suspended successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-users'] });
    },
    onError: () => {
      showError("Error", "Failed to suspend user");
    }
  });

  // Unsuspend user mutation
  const unsuspendUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_suspended: false,
          suspension_reason: null
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "User unsuspended successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-users'] });
    },
    onError: () => {
      showError("Error", "Failed to unsuspend user");
    }
  });

  // Update verification status mutation
  const updateVerificationMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: status })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Verification status updated successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-users'] });
    },
    onError: () => {
      showError("Error", "Failed to update verification status");
    }
  });

  const filteredUsers = vendorUsers?.filter(user => {
    const matchesSearch = !searchTerm || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.vendor_business_profiles?.business_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && !user.is_suspended) ||
      (statusFilter === "suspended" && user.is_suspended) ||
      (statusFilter === "verified" && user.verification_status === "approved") ||
      (statusFilter === "pending" && user.verification_status === "pending");

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (user: VendorUser) => {
    if (user.is_suspended) {
      return <Badge variant="destructive">Suspended</Badge>;
    }
    if (user.verification_status === "approved") {
      return <Badge variant="default">Verified</Badge>;
    }
    if (user.verification_status === "pending") {
      return <Badge variant="secondary">Pending</Badge>;
    }
    return <Badge variant="outline">Unverified</Badge>;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading vendor users...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendor User Management</h2>
          <p className="text-muted-foreground">Manage vendor users, roles, and permissions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Vendor Users ({filteredUsers?.length || 0})
          </CardTitle>
          <CardDescription>
            Manage vendor accounts, roles, and verification status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers && filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name || 'No name'}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        {user.phone && (
                          <div className="text-sm text-muted-foreground">{user.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.vendor_business_profiles?.business_name ? (
                        <div>
                          <div className="font-medium">{user.vendor_business_profiles.business_name}</div>
                          <div className="flex gap-2 mt-1">
                            {user.vendor_business_profiles.is_verified && (
                              <Badge variant="default" className="text-xs">Verified</Badge>
                            )}
                            {user.vendor_business_profiles.is_active && (
                              <Badge variant="secondary" className="text-xs">Active</Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No business profile</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <Shield className="h-3 w-3" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {user.verification_status !== "approved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateVerificationMutation.mutate({ 
                              userId: user.id, 
                              status: "approved" 
                            })}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {user.is_suspended ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => unsuspendUserMutation.mutate(user.id)}
                          >
                            Unsuspend
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const reason = prompt("Enter suspension reason:");
                              if (reason) {
                                suspendUserMutation.mutate({ userId: user.id, reason });
                              }
                            }}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No vendor users found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>User Email</Label>
                <Input value={selectedUser.email} disabled />
              </div>
              <div>
                <Label>Full Name</Label>
                <Input value={selectedUser.full_name || ''} disabled />
              </div>
              <div>
                <Label>Current Role</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(newRole: "general_user" | "property_owner" | "agent" | "vendor" | "admin" | "customer_service") => {
                    if (confirm(`Are you sure you want to change role from ${selectedUser.role} to ${newRole}?`)) {
                      updateUserRoleMutation.mutate({ 
                        userId: selectedUser.id, 
                        newRole 
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="customer_service">Customer Service</SelectItem>
                    <SelectItem value="general_user">General User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Verification Status</Label>
                <Select
                  value={selectedUser.verification_status}
                  onValueChange={(status) => updateVerificationMutation.mutate({ 
                    userId: selectedUser.id, 
                    status 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedUser.is_suspended && selectedUser.suspension_reason && (
                <div>
                  <Label>Suspension Reason</Label>
                  <Input value={selectedUser.suspension_reason} disabled />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorUserRoleManagement;