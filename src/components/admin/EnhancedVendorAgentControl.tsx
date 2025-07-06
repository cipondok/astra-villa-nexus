import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAlert } from "@/contexts/AlertContext";
import { 
  Users, 
  Building, 
  Shield, 
  Eye, 
  Edit, 
  Ban, 
  CheckCircle, 
  Search, 
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Settings
} from "lucide-react";

const EnhancedVendorAgentControl = () => {
  const [activeTab, setActiveTab] = useState("vendors");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', user: null as any });
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch vendors
  const { data: vendors, isLoading: vendorsLoading } = useQuery({
    queryKey: ['vendors', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          verification_status,
          created_at,
          updated_at
        `)
        .eq('role', 'vendor')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch agents
  const { data: agents, isLoading: agentsLoading } = useQuery({
    queryKey: ['agents', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          email,
          role,
          verification_status,
          created_at,
          updated_at
        `)
        .eq('role', 'agent')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ verification_status: status })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showSuccess("Status Updated", "User status has been updated successfully.");
      setActionDialog({ open: false, type: '', user: null });
    },
    onError: () => {
      showError("Update Failed", "Failed to update user status.");
    },
  });

  // Block/Unblock user mutation
  const toggleUserBlockMutation = useMutation({
    mutationFn: async ({ userId, blocked }: { userId: string; blocked: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_status: blocked ? 'suspended' : 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
      showSuccess(
        variables.blocked ? "User Blocked" : "User Unblocked", 
        `User has been ${variables.blocked ? 'blocked' : 'unblocked'} successfully.`
      );
      setActionDialog({ open: false, type: '', user: null });
    },
    onError: () => {
      showError("Action Failed", "Failed to update user status.");
    },
  });

  const handleAction = (type: string, user: any) => {
    setActionDialog({ open: true, type, user });
  };

  const executeAction = () => {
    const { type, user } = actionDialog;
    
    switch (type) {
      case 'approve':
        updateUserStatusMutation.mutate({ userId: user.id, status: 'approved' });
        break;
      case 'reject':
        updateUserStatusMutation.mutate({ userId: user.id, status: 'rejected' });
        break;
      case 'suspend':
        updateUserStatusMutation.mutate({ userId: user.id, status: 'suspended' });
        break;
      case 'block':
        toggleUserBlockMutation.mutate({ userId: user.id, blocked: true });
        break;
      case 'unblock':
        toggleUserBlockMutation.mutate({ userId: user.id, blocked: false });
        break;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      case 'suspended':
        return <Badge className="bg-red-600 text-white">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const UserTable = ({ users, loading, type }: { users: any[], loading: boolean, type: 'vendor' | 'agent' }) => (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${type}s...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              {type === 'vendor' && <TableHead>Business</TableHead>}
              {type === 'agent' && <TableHead>Properties</TableHead>}
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading {type}s...
                </TableCell>
              </TableRow>
            ) : users?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No {type}s found
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">{user.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.verification_status)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {user.role?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  {type === 'vendor' && (
                    <TableCell>
                      <div className="text-sm">Business Profile</div>
                      <Badge className="bg-blue-500 text-white text-xs">Active</Badge>
                    </TableCell>
                  )}
                  {type === 'agent' && (
                    <TableCell>
                      <div className="text-sm">Properties Active</div>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      
                      {user.verification_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleAction('approve', user)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction('reject', user)}
                          >
                            <UserX className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      
                      {user.verification_status === 'approved' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction('suspend', user)}
                        >
                          <Ban className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {user.verification_status === 'suspended' && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleAction('unblock', user)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Enhanced Vendor & Agent Control System
          </CardTitle>
          <CardDescription>
            Advanced management and control system for vendors and property agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vendors" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Vendors ({vendors?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="agents" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Agents ({agents?.length || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vendors">
              <UserTable users={vendors || []} loading={vendorsLoading} type="vendor" />
            </TabsContent>

            <TabsContent value="agents">
              <UserTable users={agents || []} loading={agentsLoading} type="agent" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({...actionDialog, open})}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionDialog.type} this user?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, type: '', user: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeAction}
              disabled={updateUserStatusMutation.isPending || toggleUserBlockMutation.isPending}
            >
              {updateUserStatusMutation.isPending || toggleUserBlockMutation.isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Details Dialog */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <div className="text-sm text-muted-foreground">{selectedUser.full_name || 'N/A'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div>{getStatusBadge(selectedUser.verification_status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <div className="text-sm text-muted-foreground capitalize">{selectedUser.role?.replace('_', ' ')}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Joined</label>
                  <div className="text-sm text-muted-foreground">{new Date(selectedUser.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium">Last Updated</label>
                  <div className="text-sm text-muted-foreground">{new Date(selectedUser.updated_at).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default EnhancedVendorAgentControl;