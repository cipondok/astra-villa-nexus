
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/contexts/AlertContext";
import { Store, Search, Ban, UserCheck, Eye, Edit } from "lucide-react";

interface VendorUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  role: string;
  verification_status: string;
  is_suspended: boolean;
  suspension_reason?: string;
  created_at: string;
  user_level_id?: string;
  user_levels?: {
    name: string;
    max_properties: number;
    max_listings: number;
  };
}

const VendorUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVendor, setSelectedVendor] = useState<VendorUser | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch vendor users
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendor-users'],
    queryFn: async (): Promise<VendorUser[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_levels (
            name,
            max_properties,
            max_listings
          )
        `)
        .eq('role', 'vendor')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Suspend vendor mutation
  const suspendVendorMutation = useMutation({
    mutationFn: async ({ vendorId, reason }: { vendorId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          suspended_at: new Date().toISOString(),
          suspended_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', vendorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Vendor Suspended", "Vendor has been suspended successfully.");
      setSuspensionModalOpen(false);
      setSelectedVendor(null);
      setSuspensionReason("");
      queryClient.invalidateQueries({ queryKey: ['vendor-users'] });
    },
    onError: (error: any) => {
      showError("Suspension Failed", error.message);
    },
  });

  // Unsuspend vendor mutation
  const unsuspendVendorMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspension_reason: null,
          suspended_at: null,
          suspended_by: null
        })
        .eq('id', vendorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Vendor Unsuspended", "Vendor has been unsuspended successfully.");
      queryClient.invalidateQueries({ queryKey: ['vendor-users'] });
    },
    onError: (error: any) => {
      showError("Unsuspend Failed", error.message);
    },
  });

  // Filter vendors
  const filteredVendors = vendors?.filter((vendor) => {
    const matchesSearch = 
      vendor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && !vendor.is_suspended) ||
      (statusFilter === "suspended" && vendor.is_suspended) ||
      (statusFilter === vendor.verification_status);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (vendor: VendorUser) => {
    if (vendor.is_suspended) {
      return <Badge variant="destructive">SUSPENDED</Badge>;
    }
    
    const colors = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={colors[vendor.verification_status as keyof typeof colors] || colors.pending}>
        {vendor.verification_status.toUpperCase()}
      </Badge>
    );
  };

  const handleSuspendVendor = (vendor: VendorUser) => {
    setSelectedVendor(vendor);
    setSuspensionModalOpen(true);
  };

  const handleViewVendor = (vendor: VendorUser) => {
    setSelectedVendor(vendor);
    setViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Store className="h-5 w-5" />
            Vendor User Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage vendor accounts, verification status, and business profiles
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Users ({filteredVendors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading vendors...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{vendor.full_name || 'No Name'}</div>
                        <div className="text-sm text-muted-foreground">{vendor.email}</div>
                        {vendor.phone && (
                          <div className="text-sm text-muted-foreground">{vendor.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{vendor.company_name || 'No Company'}</div>
                    </TableCell>
                    <TableCell>
                      {vendor.user_levels ? (
                        <div>
                          <div className="font-medium">{vendor.user_levels.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {vendor.user_levels.max_properties} props, {vendor.user_levels.max_listings} listings
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline">No Level</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(vendor)}</TableCell>
                    <TableCell>{new Date(vendor.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewVendor(vendor)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {vendor.is_suspended ? (
                          <Button
                            size="sm"
                            onClick={() => unsuspendVendorMutation.mutate(vendor.id)}
                            disabled={unsuspendVendorMutation.isPending}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSuspendVendor(vendor)}
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
          )}
        </CardContent>
      </Card>

      {/* View Vendor Modal */}
      {selectedVendor && viewModalOpen && (
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Vendor Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="font-medium">{selectedVendor.full_name || 'N/A'}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedVendor.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedVendor.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label>Company</Label>
                  <p className="font-medium">{selectedVendor.company_name || 'N/A'}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedVendor)}</div>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="font-medium">{new Date(selectedVendor.created_at).toLocaleString()}</p>
                </div>
              </div>
              {selectedVendor.is_suspended && (
                <div>
                  <Label>Suspension Reason</Label>
                  <p className="text-red-600">{selectedVendor.suspension_reason}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Suspension Modal */}
      {selectedVendor && suspensionModalOpen && (
        <Dialog open={suspensionModalOpen} onOpenChange={setSuspensionModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Vendor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Vendor</Label>
                <p>{selectedVendor.full_name} ({selectedVendor.email})</p>
              </div>
              <div>
                <Label>Suspension Reason</Label>
                <Textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => suspendVendorMutation.mutate({
                    vendorId: selectedVendor.id,
                    reason: suspensionReason
                  })}
                  disabled={suspendVendorMutation.isPending || !suspensionReason}
                  variant="destructive"
                  className="flex-1"
                >
                  {suspendVendorMutation.isPending ? 'Suspending...' : 'Suspend Vendor'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSuspensionModalOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default VendorUserManagement;
