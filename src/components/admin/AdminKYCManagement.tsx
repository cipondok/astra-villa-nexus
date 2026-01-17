
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { CreditCard, CheckCircle, XCircle, Clock, Eye, MessageSquare, Shield, Users, FileText } from "lucide-react";

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
      const { data: kycData, error: kycError } = await supabase
        .from('vendor_kyc_verification')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (kycError) throw kycError;

      const vendorIds = kycData?.map(kyc => kyc.vendor_id).filter(Boolean) || [];
      
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', vendorIds);
      
      if (profileError) throw profileError;

      const { data: businessProfiles, error: businessError } = await supabase
        .from('vendor_business_profiles')
        .select('vendor_id, business_name')
        .in('vendor_id', vendorIds);
      
      if (businessError) throw businessError;

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
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <Clock className="h-3 w-3 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      approved: "bg-green-100 text-green-700 border-green-200",
      rejected: "bg-red-100 text-red-700 border-red-200"
    };
    return (
      <Badge variant="outline" className={`text-[10px] ${styles[status] || styles.pending}`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const pendingCount = kycSubmissions?.filter(k => k.overall_status === 'pending').length || 0;
  const approvedCount = kycSubmissions?.filter(k => k.overall_status === 'approved').length || 0;
  const rejectedCount = kycSubmissions?.filter(k => k.overall_status === 'rejected').length || 0;

  return (
    <div className="space-y-4">
      {/* Professional Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-transparent rounded-xl border border-emerald-200/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Shield className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              KYC Verification Management
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                {pendingCount} Pending
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">Review and manage vendor KYC verification submissions</p>
          </div>
        </div>
      </div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Total</p>
                <p className="text-xl font-bold text-blue-700">{kycSubmissions?.length || 0}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Pending</p>
                <p className="text-xl font-bold text-yellow-700">{pendingCount}</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Approved</p>
                <p className="text-xl font-bold text-green-700">{approvedCount}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-red-50 to-white">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Rejected</p>
                <p className="text-xl font-bold text-red-700">{rejectedCount}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-transparent">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            KYC Submissions
          </CardTitle>
          <CardDescription className="text-xs">Click review to verify vendor identity documents</CardDescription>
        </CardHeader>
        <CardContent className="pt-3">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-xs font-medium">Vendor</TableHead>
                  <TableHead className="text-xs font-medium">Business</TableHead>
                  <TableHead className="text-xs font-medium">KTP Number</TableHead>
                  <TableHead className="text-xs font-medium">Status</TableHead>
                  <TableHead className="text-xs font-medium">Submitted</TableHead>
                  <TableHead className="text-xs font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                      Loading KYC submissions...
                    </TableCell>
                  </TableRow>
                ) : kycSubmissions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                      No KYC submissions found
                    </TableCell>
                  </TableRow>
                ) : (
                  kycSubmissions?.map((kyc) => (
                    <TableRow key={kyc.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {kyc.vendor_profile?.full_name || 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {kyc.vendor_profile?.email || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {kyc.business_profile?.business_name || 'N/A'}
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {kyc.ktp_number || 'Not provided'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(kyc.overall_status)}
                          {getStatusBadge(kyc.overall_status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(kyc.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleReview(kyc)}
                          className="h-7 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
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
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              KYC Verification Review
            </DialogTitle>
            <DialogDescription>
              Review vendor identity verification documents and information
            </DialogDescription>
          </DialogHeader>
          
          {selectedKYC && (
            <div className="space-y-6">
              {/* Vendor Information */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Vendor Name</Label>
                  <div className="text-sm font-medium">
                    {selectedKYC.vendor_profile?.full_name || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Business Name</Label>
                  <div className="text-sm font-medium">
                    {selectedKYC.business_profile?.business_name || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="text-sm font-medium">
                    {selectedKYC.vendor_profile?.email || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Mobile Number</Label>
                  <div className="text-sm font-medium">
                    {selectedKYC.mobile_number || 'Not provided'}
                  </div>
                </div>
              </div>

              {/* KTP Information */}
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <Label className="text-xs text-muted-foreground">KTP Number</Label>
                  <div className="text-sm font-medium font-mono">
                    {selectedKYC.ktp_number || 'Not provided'}
                  </div>
                </div>
                
                {/* Document Images */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedKYC.ktp_image_url && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">KTP Image</Label>
                      <img 
                        src={selectedKYC.ktp_image_url} 
                        alt="KTP Document" 
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                  
                  {selectedKYC.face_verification_url && (
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Face Verification</Label>
                      <img 
                        src={selectedKYC.face_verification_url} 
                        alt="Face verification" 
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Review Controls */}
              <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label htmlFor="review-status" className="text-xs text-muted-foreground">Verification Status</Label>
                  <Select value={reviewStatus} onValueChange={setReviewStatus}>
                    <SelectTrigger className="mt-1">
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
                  <Label htmlFor="review-notes" className="text-xs text-muted-foreground">Admin Notes</Label>
                  <Textarea
                    id="review-notes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about the verification..."
                    rows={3}
                    className="mt-1"
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
              className="bg-emerald-600 hover:bg-emerald-700"
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
