
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Store, Eye, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const VendorManagement = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: vendorRequests, isLoading } = useQuery({
    queryKey: ['vendor-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: vendorServices } = useQuery({
    queryKey: ['vendor-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_services')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const reviewRequestMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const { error } = await supabase
        .from('vendor_requests')
        .update({ 
          status, 
          review_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Request Reviewed", "Vendor request has been reviewed successfully.");
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setReviewNotes("");
    },
    onError: (error: any) => {
      showError("Review Failed", error.message);
    },
  });

  const handleReview = (request: any) => {
    setSelectedRequest(request);
    setReviewNotes("");
    setShowReviewDialog(true);
  };

  const handleApprove = () => {
    if (selectedRequest) {
      reviewRequestMutation.mutate({ 
        id: selectedRequest.id, 
        status: 'approved', 
        notes: reviewNotes 
      });
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      reviewRequestMutation.mutate({ 
        id: selectedRequest.id, 
        status: 'rejected', 
        notes: reviewNotes 
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Store className="h-5 w-5" />
            Vendor Management
          </CardTitle>
          <CardDescription className="text-gray-300">
            Review and manage vendor registration requests and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Vendor Requests */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Vendor Registration Requests</h3>
              <div className="border border-white/20 rounded-lg bg-white/5">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/20">
                      <TableHead className="text-gray-300">Business Name</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Contact</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Date</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                          Loading vendor requests...
                        </TableCell>
                      </TableRow>
                    ) : vendorRequests?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-300">
                          No vendor requests found
                        </TableCell>
                      </TableRow>
                    ) : (
                      vendorRequests?.map((request) => (
                        <TableRow key={request.id} className="border-white/20">
                          <TableCell className="text-white font-medium">
                            {request.business_name}
                          </TableCell>
                          <TableCell className="text-gray-300 capitalize">
                            {request.business_type}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            <div className="text-sm">
                              <div>{request.full_name}</div>
                              <div className="text-gray-400">{request.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(request.status)}
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {new Date(request.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleReview(request)}
                              className="border-gray-600 text-gray-300"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Vendor Services */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Vendor Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vendorServices?.map((service) => (
                  <Card key={service.id} className="bg-white/5 border-white/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-sm">{service.service_name}</CardTitle>
                      <CardDescription className="text-gray-300 text-xs">
                        {service.service_category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-gray-300 text-xs mb-2 line-clamp-2">
                        {service.service_description}
                      </p>
                      <Badge variant={service.is_active ? 'default' : 'outline'} className="text-xs">
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="max-w-2xl bg-gray-900/95 backdrop-blur-md border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Review Vendor Request</DialogTitle>
            <DialogDescription className="text-gray-300">
              Review the vendor registration request and provide feedback.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-300 font-medium">Business Name:</label>
                  <p className="text-white">{selectedRequest.business_name}</p>
                </div>
                <div>
                  <label className="text-gray-300 font-medium">Business Type:</label>
                  <p className="text-white capitalize">{selectedRequest.business_type}</p>
                </div>
                <div>
                  <label className="text-gray-300 font-medium">Contact Person:</label>
                  <p className="text-white">{selectedRequest.full_name}</p>
                </div>
                <div>
                  <label className="text-gray-300 font-medium">Email:</label>
                  <p className="text-white">{selectedRequest.email}</p>
                </div>
              </div>
              <div>
                <label className="text-gray-300 font-medium">Review Notes:</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add your review notes here..."
                  className="mt-2 bg-gray-800 border-gray-700 text-white"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowReviewDialog(false)}
              className="border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={reviewRequestMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={reviewRequestMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;
