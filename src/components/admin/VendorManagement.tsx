
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
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/contexts/AlertContext";
import { 
  Store, 
  UserPlus, 
  Eye, 
  Check, 
  X, 
  Search, 
  Filter, 
  RefreshCw,
  FileText,
  Phone,
  Mail,
  Building
} from "lucide-react";

// Define the type for vendor request with profile
type VendorRequestWithProfile = {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  review_notes: string | null;
  reviewed_by: string | null;
  verification_documents: any;
  license_documents: any;
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
    phone: string | null;
  } | null;
};

const VendorManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<VendorRequestWithProfile | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch vendor requests with proper join
  const { data: vendorRequests, isLoading, refetch } = useQuery({
    queryKey: ['vendor-requests'],
    queryFn: async (): Promise<VendorRequestWithProfile[]> => {
      console.log('Fetching vendor requests');
      
      // First get vendor requests
      const { data: requests, error: requestsError } = await supabase
        .from('vendor_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (requestsError) {
        console.error('Error fetching vendor requests:', requestsError);
        throw new Error(`Failed to fetch vendor requests: ${requestsError.message}`);
      }

      if (!requests || requests.length === 0) {
        console.log('No vendor requests found');
        return [];
      }

      // Then get profiles for each request
      const userIds = requests.map(req => req.user_id).filter(Boolean);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Merge the data
      const requestsWithProfiles: VendorRequestWithProfile[] = requests.map(request => ({
        ...request,
        profiles: profiles?.find(profile => profile.id === request.user_id) || null
      }));

      console.log('Fetched vendor requests with profiles:', requestsWithProfiles.length);
      return requestsWithProfiles;
    },
    retry: 2,
    refetchInterval: 30000,
  });

  // Fetch vendor business profiles
  const { data: vendorProfiles } = useQuery({
    queryKey: ['vendor-profiles'],
    queryFn: async () => {
      console.log('Fetching vendor business profiles');
      const { data, error } = await supabase
        .from('vendor_business_profiles')
        .select(`
          *,
          profiles:vendor_id (
            full_name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching vendor profiles:', error);
        return [];
      }
      
      return data || [];
    },
    retry: 2,
  });

  // Approve vendor request mutation
  const approveVendorMutation = useMutation({
    mutationFn: async ({ requestId, userId }: { requestId: string; userId: string }) => {
      console.log('Approving vendor request:', requestId);
      
      // Update the request status
      const { error: requestError } = await supabase
        .from('vendor_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', requestId);
      
      if (requestError) {
        throw new Error(`Failed to approve request: ${requestError.message}`);
      }
      
      // Update user role to vendor
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: 'vendor' })
        .eq('id', userId);
      
      if (profileError) {
        throw new Error(`Failed to update user role: ${profileError.message}`);
      }
      
      return { requestId, userId };
    },
    onSuccess: () => {
      showSuccess("Vendor Approved", "Vendor request has been approved successfully.");
      setIsViewModalOpen(false);
      setSelectedRequest(null);
      setReviewNotes("");
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Approval Failed", error.message);
    },
  });

  // Reject vendor request mutation
  const rejectVendorMutation = useMutation({
    mutationFn: async (requestId: string) => {
      console.log('Rejecting vendor request:', requestId);
      
      const { error } = await supabase
        .from('vendor_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', requestId);
      
      if (error) {
        throw new Error(`Failed to reject request: ${error.message}`);
      }
      
      return requestId;
    },
    onSuccess: () => {
      showSuccess("Vendor Rejected", "Vendor request has been rejected.");
      setIsViewModalOpen(false);
      setSelectedRequest(null);
      setReviewNotes("");
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      refetch();
    },
    onError: (error: any) => {
      showError("Rejection Failed", error.message);
    },
  });

  // Filter requests
  const filteredRequests = vendorRequests?.filter((request) => {
    const matchesSearch = 
      request.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive"
    };
    
    return (
      <Badge variant={statusColors[status] || "outline"}>
        {status?.toUpperCase()}
      </Badge>
    );
  };

  const handleViewRequest = (request: VendorRequestWithProfile) => {
    setSelectedRequest(request);
    setReviewNotes(request.review_notes || "");
    setIsViewModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedRequest) {
      approveVendorMutation.mutate({
        requestId: selectedRequest.id,
        userId: selectedRequest.user_id
      });
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      rejectVendorMutation.mutate(selectedRequest.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Vendor Management
              </CardTitle>
              <CardDescription>
                Manage vendor requests and business profiles. Total requests: {filteredRequests.length}
              </CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
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
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{vendorRequests?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {vendorRequests?.filter(r => r.status === 'pending').length || 0}
                </p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {vendorRequests?.filter(r => r.status === 'approved').length || 0}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Vendors</p>
                <p className="text-2xl font-bold text-blue-600">
                  {vendorProfiles?.filter(p => p.is_active).length || 0}
                </p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vendor Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading vendor requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No vendor requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">
                      {request.business_name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.profiles?.full_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.profiles?.email || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{request.business_type}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleViewRequest(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Request Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Request Details</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Business Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Business Name</Label>
                    <p className="font-medium">{selectedRequest.business_name}</p>
                  </div>
                  <div>
                    <Label>Business Type</Label>
                    <p className="font-medium">{selectedRequest.business_type}</p>
                  </div>
                </div>
              </div>

              {/* Owner Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Owner Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Full Name
                    </Label>
                    <p className="font-medium">{selectedRequest.profiles?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="font-medium">{selectedRequest.profiles?.email || 'N/A'}</p>
                  </div>
                  {selectedRequest.profiles?.phone && (
                    <div>
                      <Label className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone
                      </Label>
                      <p className="font-medium">{selectedRequest.profiles.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {selectedRequest.verification_documents && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Verification Documents</h3>
                  <div className="p-4 bg-muted rounded-lg">
                    <pre className="text-sm">
                      {JSON.stringify(selectedRequest.verification_documents, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Review Notes */}
              <div className="space-y-4">
                <Label htmlFor="review_notes">Review Notes</Label>
                <Textarea
                  id="review_notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review notes..."
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3">
                  <Button
                    onClick={handleApprove}
                    disabled={approveVendorMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {approveVendorMutation.isPending ? 'Approving...' : 'Approve'}
                  </Button>
                  <Button
                    onClick={handleReject}
                    disabled={rejectVendorMutation.isPending}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    {rejectVendorMutation.isPending ? 'Rejecting...' : 'Reject'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;
