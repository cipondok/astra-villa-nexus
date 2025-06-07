
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Store, Check, X, Eye, MessageSquare } from "lucide-react";
import { useAlert } from "@/contexts/AlertContext";

const VendorManagement = () => {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: vendorRequests, isLoading } = useQuery({
    queryKey: ['vendor-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_requests')
        .select(`
          *,
          user:profiles!vendor_requests_user_id_fkey(full_name, email),
          reviewer:profiles!vendor_requests_reviewed_by_fkey(full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status, notes }: { requestId: string; status: string; notes?: string }) => {
      const updates: any = {
        status,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (notes) {
        updates.review_notes = notes;
      }

      const { error } = await supabase
        .from('vendor_requests')
        .update(updates)
        .eq('id', requestId);
      
      if (error) throw error;

      // If approved, update user role to vendor
      if (status === 'approved') {
        const request = vendorRequests?.find(r => r.id === requestId);
        if (request?.user_id) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'vendor' })
            .eq('id', request.user_id);
          
          if (profileError) throw profileError;
        }
      }
    },
    onSuccess: () => {
      showSuccess("Request Updated", "Vendor request has been updated successfully.");
      queryClient.invalidateQueries({ queryKey: ['vendor-requests'] });
      setShowReviewDialog(false);
      setSelectedRequest(null);
      setReviewNotes('');
    },
    onError: (error: any) => {
      showError("Update Failed", error.message);
    },
  });

  const handleReview = (request: any, status: string) => {
    setSelectedRequest(request);
    setShowReviewDialog(true);
  };

  const handleSubmitReview = (status: string) => {
    if (selectedRequest) {
      updateRequestMutation.mutate({
        requestId: selectedRequest.id,
        status,
        notes: reviewNotes
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
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
            <Store className="h-5 w-5" />
            Vendor Management
          </CardTitle>
          <CardDescription>
            Review and manage vendor registration requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Details</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
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
                ) : vendorRequests?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No vendor requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  vendorRequests?.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{request.business_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {request.user?.full_name || 'Unknown User'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {request.user?.email || 'No email'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{request.business_type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(request.status)}>
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Vendor Request Details</DialogTitle>
                                <DialogDescription>
                                  Review the vendor registration request
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Business Name</Label>
                                    <p className="text-sm font-medium">{request.business_name}</p>
                                  </div>
                                  <div>
                                    <Label>Business Type</Label>
                                    <p className="text-sm font-medium">{request.business_type}</p>
                                  </div>
                                  <div>
                                    <Label>Contact Person</Label>
                                    <p className="text-sm font-medium">{request.user?.full_name}</p>
                                  </div>
                                  <div>
                                    <Label>Email</Label>
                                    <p className="text-sm font-medium">{request.user?.email}</p>
                                  </div>
                                </div>
                                {request.license_documents && (
                                  <div>
                                    <Label>License Documents</Label>
                                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                                      {JSON.stringify(request.license_documents, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {request.verification_documents && (
                                  <div>
                                    <Label>Verification Documents</Label>
                                    <pre className="text-xs bg-gray-100 p-2 rounded mt-1">
                                      {JSON.stringify(request.verification_documents, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {request.review_notes && (
                                  <div>
                                    <Label>Review Notes</Label>
                                    <p className="text-sm mt-1">{request.review_notes}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(request, 'approved')}
                            disabled={request.status !== 'pending'}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReview(request, 'rejected')}
                            disabled={request.status !== 'pending'}
                          >
                            <X className="h-4 w-4" />
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

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Vendor Request</DialogTitle>
            <DialogDescription>
              Add notes for your review decision
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="review_notes">Review Notes</Label>
              <Textarea
                id="review_notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add any notes about your decision..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleSubmitReview('rejected')}
              disabled={updateRequestMutation.isPending}
            >
              Reject
            </Button>
            <Button 
              onClick={() => handleSubmitReview('approved')}
              disabled={updateRequestMutation.isPending}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorManagement;
