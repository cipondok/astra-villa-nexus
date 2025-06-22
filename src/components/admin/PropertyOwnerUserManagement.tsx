
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
import { Home, Search, Ban, UserCheck, Eye } from "lucide-react";

interface PropertyOwnerUser {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
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

const PropertyOwnerUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOwner, setSelectedOwner] = useState<PropertyOwnerUser | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [suspensionModalOpen, setSuspensionModalOpen] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch property owner users
  const { data: owners, isLoading } = useQuery({
    queryKey: ['property-owner-users'],
    queryFn: async (): Promise<PropertyOwnerUser[]> => {
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
        .eq('role', 'property_owner')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  // Get property count for each owner
  const { data: propertyCounts } = useQuery({
    queryKey: ['property-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('owner_id')
        .not('owner_id', 'is', null);
      
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data.forEach(property => {
        counts[property.owner_id] = (counts[property.owner_id] || 0) + 1;
      });
      
      return counts;
    },
  });

  // Suspend owner mutation
  const suspendOwnerMutation = useMutation({
    mutationFn: async ({ ownerId, reason }: { ownerId: string; reason: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspension_reason: reason,
          suspended_at: new Date().toISOString(),
          suspended_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', ownerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Property Owner Suspended", "Property owner has been suspended successfully.");
      setSuspensionModalOpen(false);
      setSelectedOwner(null);
      setSuspensionReason("");
      queryClient.invalidateQueries({ queryKey: ['property-owner-users'] });
    },
    onError: (error: any) => {
      showError("Suspension Failed", error.message);
    },
  });

  // Unsuspend owner mutation
  const unsuspendOwnerMutation = useMutation({
    mutationFn: async (ownerId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspension_reason: null,
          suspended_at: null,
          suspended_by: null
        })
        .eq('id', ownerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Property Owner Unsuspended", "Property owner has been unsuspended successfully.");
      queryClient.invalidateQueries({ queryKey: ['property-owner-users'] });
    },
    onError: (error: any) => {
      showError("Unsuspend Failed", error.message);
    },
  });

  // Filter owners
  const filteredOwners = owners?.filter((owner) => {
    const matchesSearch = 
      owner.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && !owner.is_suspended) ||
      (statusFilter === "suspended" && owner.is_suspended) ||
      (statusFilter === owner.verification_status);
    
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (owner: PropertyOwnerUser) => {
    if (owner.is_suspended) {
      return <Badge variant="destructive">SUSPENDED</Badge>;
    }
    
    const colors = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge className={colors[owner.verification_status as keyof typeof colors] || colors.pending}>
        {owner.verification_status.toUpperCase()}
      </Badge>
    );
  };

  const handleSuspendOwner = (owner: PropertyOwnerUser) => {
    setSelectedOwner(owner);
    setSuspensionModalOpen(true);
  };

  const handleViewOwner = (owner: PropertyOwnerUser) => {
    setSelectedOwner(owner);
    setViewModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Home className="h-5 w-5" />
            Property Owner User Management
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage property owner accounts and property portfolios
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
                  placeholder="Search property owners..."
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

      {/* Property Owners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Property Owner Users ({filteredOwners.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading property owners...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Owner</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOwners.map((owner) => (
                  <TableRow key={owner.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{owner.full_name || 'No Name'}</div>
                        <div className="text-sm text-muted-foreground">{owner.email}</div>
                        {owner.phone && (
                          <div className="text-sm text-muted-foreground">{owner.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {propertyCounts?.[owner.id] || 0} Properties
                      </div>
                    </TableCell>
                    <TableCell>
                      {owner.user_levels ? (
                        <div>
                          <div className="font-medium">{owner.user_levels.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {owner.user_levels.max_properties} props, {owner.user_levels.max_listings} listings
                          </div>
                        </div>
                      ) : (
                        <Badge variant="outline">No Level</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(owner)}</TableCell>
                    <TableCell>{new Date(owner.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewOwner(owner)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {owner.is_suspended ? (
                          <Button
                            size="sm"
                            onClick={() => unsuspendOwnerMutation.mutate(owner.id)}
                            disabled={unsuspendOwnerMutation.isPending}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleSuspendOwner(owner)}
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

      {/* View Owner Modal */}
      {selectedOwner && viewModalOpen && (
        <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Property Owner Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="font-medium">{selectedOwner.full_name || 'N/A'}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedOwner.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedOwner.phone || 'N/A'}</p>
                </div>
                <div>
                  <Label>Properties</Label>
                  <p className="font-medium">{propertyCounts?.[selectedOwner.id] || 0} Properties</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div>{getStatusBadge(selectedOwner)}</div>
                </div>
                <div>
                  <Label>Created</Label>
                  <p className="font-medium">{new Date(selectedOwner.created_at).toLocaleString()}</p>
                </div>
              </div>
              {selectedOwner.is_suspended && (
                <div>
                  <Label>Suspension Reason</Label>
                  <p className="text-red-600">{selectedOwner.suspension_reason}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Suspension Modal */}
      {selectedOwner && suspensionModalOpen && (
        <Dialog open={suspensionModalOpen} onOpenChange={setSuspensionModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend Property Owner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Property Owner</Label>
                <p>{selectedOwner.full_name} ({selectedOwner.email})</p>
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
                  onClick={() => suspendOwnerMutation.mutate({
                    ownerId: selectedOwner.id,
                    reason: suspensionReason
                  })}
                  disabled={suspendOwnerMutation.isPending || !suspensionReason}
                  variant="destructive"
                  className="flex-1"
                >
                  {suspendOwnerMutation.isPending ? 'Suspending...' : 'Suspend Owner'}
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

export default PropertyOwnerUserManagement;
