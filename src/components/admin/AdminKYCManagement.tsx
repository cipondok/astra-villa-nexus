
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { CreditCard, CheckCircle, XCircle, Clock, Eye, MessageSquare } from "lucide-react";

const AdminKYCManagement = () => {
  const [selectedKYC, setSelectedKYC] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  const { data: kycSubmissions, isLoading } = useQuery({
    queryKey: ['admin-kyc-submissions'],
    queryFn: async () => {
      // First get KYC submissions
      const { data: kycData, error: kycError } = await supabase
        .from('vendor_kyc_verification')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (kycError) throw kycError;

      // Then get profile data separately
      const vendorIds = kycData?.map(kyc => kyc.vendor_id).filter(Boolean) || [];
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', vendorIds);
      
      if (profileError) throw profileError;

      // Get business profiles separately
      const { data: businessProfiles, error: businessError } = await supabase
        .from('vendor_business_profiles')
        .select('vendor_id, business_name')
        .in('vendor_id', vendorIds);
      
      if (businessError) throw businessError;

      // Combine the data
      const combinedData = kycData?.map(kyc => {
        const profile = profiles?.find(p => p.id === kyc.vendor_id);
        const businessProfile = businessProfiles?.find(bp => bp.vendor_id === kyc.vendor_id);
        
        return {
          ...kyc,
          vendor_profile: profile,
          business_profile: businessProfile
        };
      });

      return combinedData;
    },
  });

  const updateKYCMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const updateData: any = {
        overall_status: status,
        notes: notes,
        verified_by: (await supabase.auth.getUser()).data.user?.id,
        updated_at: new Date().toISOString()
      };

      // Set verification timestamps based on status
      if (status === 'approved') {
        updateData.ktp_verified_at = new Date().toISOString();
        updateData.face_verified_at = new Date().toISOString();
        updateData.mobile_verified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('vendor_kyc_verification')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "KYC verification status updated successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-submissions'] });
      setShowDetails(false);
      setSelectedKYC(null);
      setReviewNotes("");
      setReviewStatus("");
    },
    onError: (error) => {
      console.error('KYC update error:', error);
      showError("Error", "Failed to update KYC verification status");
    },
  });

  const handleReview = (kyc: any) => {
    setSelectedKYC(kyc);
    setReviewNotes(kyc.notes || "");
    setReviewStatus(kyc.overall_status);
    setShowDetails(true);
  };

  const handleUpdateKYC = () => {
    if (!selectedKYC || !reviewStatus) return;
    
    updateKYCMutation.mutate({
      id: selectedKYC.id,
      status: reviewStatus,
      notes: reviewNotes
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive"
    };
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card className="card-ios">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            KYC Verification Management
          </CardTitle>
          <CardDescription>
            Review and manage vendor KYC verification submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>KTP Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Loading KYC submissions...
                    </TableCell>
                  </TableRow>
                ) : kycSubmissions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No KYC submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  kycSubmissions?.map((kyc) => (
                    <TableRow key={kyc.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {kyc.vendor_profile?.full_name || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {kyc.vendor_profile?.email || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {kyc.business_profile?.business_name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {kyc.ktp_number || 'Not provided'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(kyc.overall_status)}
                          {getStatusBadge(kyc.overall_status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(kyc.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleReview(kyc)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* KYC Review Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Verification Review</DialogTitle>
            <DialogDescription>
              Review vendor identity verification documents and information
            </DialogDescription>
          </DialogHeader>
          
          {selectedKYC && (
            <div className="space-y-6">
              {/* Vendor Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor Name</Label>
                  <div className="text-sm font-medium">
                    {selectedKYC.vendor_profile?.full_name || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label>Business Name</Label>
                  <div className="text-sm font-medium">
                    {selectedKYC.business_profile?.business_name || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="text-sm font-medium">
                    {selectedKYC.vendor_profile?.email || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label>Mobile Number</Label>
                  <div className="text-sm font-medium">
                    {selectedKYC.mobile_number || 'Not provided'}
                  </div>
                </div>
              </div>

              {/* KTP Information */}
              <div className="space-y-4">
                <div>
                  <Label>KTP Number</Label>
                  <div className="text-sm font-medium">
                    {selectedKYC.ktp_number || 'Not provided'}
                  </div>
                </div>
                
                {/* Document Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedKYC.ktp_image_url && (
                    <div>
                      <Label>KTP Image</Label>
                      <img 
                        src={selectedKYC.ktp_image_url} 
                        alt="KTP Document" 
                        className="w-full max-w-sm h-64 object-cover rounded border"
                      />
                    </div>
                  )}
                  
                  {selectedKYC.face_verification_url && (
                    <div>
                      <Label>Face Verification</Label>
                      <img 
                        src={selectedKYC.face_verification_url} 
                        alt="Face verification" 
                        className="w-full max-w-sm h-64 object-cover rounded border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Review Controls */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="review-status">Verification Status</Label>
                  <Select value={reviewStatus} onValueChange={setReviewStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="review-notes">Admin Notes</Label>
                  <Textarea
                    id="review-notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about the verification..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateKYC}
              disabled={updateKYCMutation.isPending || !reviewStatus}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Update Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYCManagement;
