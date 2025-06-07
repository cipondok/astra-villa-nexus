
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useAlert } from "@/contexts/AlertContext";
import { Search, Store, CheckCircle, XCircle, Eye, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const VendorManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: vendorRequests, isLoading } = useQuery({
    queryKey: ['vendor-requests', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase.from('vendor_requests').select(`
        *,
        user:profiles!vendor_requests_user_id_fkey(full_name, email),
        reviewer:profiles!vendor_requests_reviewed_by_fkey(full_name, email)
      `);
      
      if (searchTerm) {
        query = query.or(`business_name.ilike.%${searchTerm}%,business_type.ilike.%${searchTerm}%`);
      }
      
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const reviewRequestMutation = useMutation({
    mutationFn: async ({ requestId, status, notes, userId }: { 
      requestId: string, 
      status: string, 
      notes: string,
      userId: string 
    }) => {
      // Get current user for reviewer
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('vendor_requests')
        .update({
          status,
          review_notes: notes,
          reviewed_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (error) throw error;

      // If approved, update user role to vendor
      if (status === 'approved') {
        const { error: roleError } = await supabase
          .from('profiles')
          .update({ role: 'vendor' })
          .eq('id', userId);
        
        if (roleError) throw roleError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      showSuccess("Success", "Vendor request reviewed successfully");
      setSelectedRequest(null);
      setReviewNotes("");
    },
    onError: (error) => {
      showError("Error", `Failed to review request: ${error.message}`);
    }
  });

  const handleApprove = (request: any) => {
    reviewRequestMutation.mutate({
      requestId: request.id,
      status: 'approved',
      notes: reviewNotes,
      userId: request.user_id
    });
  };

  const handleReject = (request: any) => {
    if (!reviewNotes.trim()) {
      showError("Error", "Please provide review notes for rejection");
      return;
    }
    
    reviewRequestMutation.mutate({
      requestId: request.id,
      status: 'rejected',
      notes: reviewNotes,
      userId: request.user_id
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'under_review': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Vendor Authorization Management
        </CardTitle>
        <CardDescription>Review and approve vendor registration requests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by business name or type..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vendor Requests Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Info</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Reviewer</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading vendor requests...
                  </TableCell>
                </TableRow>
              ) : vendorRequests?.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.business_name}</p>
                      <p className="text-sm text-gray-500">{request.business_type}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{request.user?.full_name || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{request.user?.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {request.reviewer ? (
                      <div>
                        <p className="text-sm">{request.reviewer.full_name}</p>
                        <p className="text-xs text-gray-500">{request.reviewer.email}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">Not reviewed</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setReviewNotes(request.review_notes || "");
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Review Vendor Request</DialogTitle>
                          <DialogDescription>
                            {request.business_name} - {request.business_type}
                          </DialogDescription>
                        </DialogHeader>
                        {selectedRequest && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Business Information</h4>
                                <p><strong>Name:</strong> {selectedRequest.business_name}</p>
                                <p><strong>Type:</strong> {selectedRequest.business_type}</p>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Applicant Information</h4>
                                <p><strong>Name:</strong> {selectedRequest.user?.full_name}</p>
                                <p><strong>Email:</strong> {selectedRequest.user?.email}</p>
                              </div>
                            </div>

                            {selectedRequest.license_documents && (
                              <div>
                                <h4 className="font-medium mb-2">License Documents</h4>
                                <div className="bg-gray-50 p-3 rounded">
                                  <pre className="text-sm">
                                    {JSON.stringify(selectedRequest.license_documents, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            {selectedRequest.verification_documents && (
                              <div>
                                <h4 className="font-medium mb-2">Verification Documents</h4>
                                <div className="bg-gray-50 p-3 rounded">
                                  <pre className="text-sm">
                                    {JSON.stringify(selectedRequest.verification_documents, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}

                            <div>
                              <h4 className="font-medium mb-2">Review Notes</h4>
                              <Textarea
                                placeholder="Add your review notes here..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={4}
                              />
                            </div>

                            {selectedRequest.status === 'pending' || selectedRequest.status === 'under_review' ? (
                              <div className="flex space-x-4">
                                <Button
                                  onClick={() => handleApprove(selectedRequest)}
                                  disabled={reviewRequestMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  onClick={() => handleReject(selectedRequest)}
                                  disabled={reviewRequestMutation.isPending}
                                  variant="destructive"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <div className="bg-gray-50 p-3 rounded">
                                <p className="font-medium">Current Status: {selectedRequest.status}</p>
                                {selectedRequest.review_notes && (
                                  <p className="text-sm mt-2">Notes: {selectedRequest.review_notes}</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {vendorRequests?.filter(r => r.status === 'pending').length || 0}
                </p>
                <p className="text-sm text-gray-600">Pending Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {vendorRequests?.filter(r => r.status === 'under_review').length || 0}
                </p>
                <p className="text-sm text-gray-600">Under Review</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {vendorRequests?.filter(r => r.status === 'approved').length || 0}
                </p>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {vendorRequests?.filter(r => r.status === 'rejected').length || 0}
                </p>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default VendorManagement;
