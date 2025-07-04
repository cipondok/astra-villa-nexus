import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Shield, UserCheck, AlertTriangle, CreditCard, FileCheck, Settings } from "lucide-react";

const VendorKYCManagement = () => {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [kycAction, setKycAction] = useState("");
  const [verificationNotes, setVerificationNotes] = useState("");
  const [accessLevel, setAccessLevel] = useState("");
  const [complianceScore, setComplianceScore] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch all vendor KYC status
  const { data: kycStatuses, isLoading } = useQuery({
    queryKey: ['vendor-kyc-statuses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_kyc_status')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Update KYC status mutation
  const updateKYCMutation = useMutation({
    mutationFn: async ({ 
      vendorId, 
      status, 
      level, 
      score, 
      notes, 
      access 
    }: { 
      vendorId: string; 
      status: string; 
      level: string;
      score: number;
      notes: string;
      access: string;
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('vendor_kyc_status')
        .upsert({
          vendor_id: vendorId,
          kyc_status: status as any,
          verification_level: level,
          compliance_score: score,
          verification_notes: notes,
          access_level: access,
          verified_by: user.user?.id,
          verified_at: new Date().toISOString(),
          next_review_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 year from now
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Vendor KYC status updated successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-kyc-statuses'] });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      showError("Error", "Failed to update KYC status");
    }
  });

  const resetForm = () => {
    setKycAction("");
    setVerificationNotes("");
    setAccessLevel("");
    setComplianceScore(0);
  };

  const handleUpdateKYC = () => {
    if (!selectedVendor || !kycAction || !accessLevel) return;
    
    updateKYCMutation.mutate({
      vendorId: selectedVendor.vendor_id,
      status: kycAction,
      level: selectedVendor.verification_level || 'basic',
      score: complianceScore,
      notes: verificationNotes,
      access: accessLevel
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending_review':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'under_verification':
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case 'documents_submitted':
        return <Badge className="bg-yellow-100 text-yellow-800">Documents Submitted</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">Unverified</Badge>;
    }
  };

  const getAccessBadge = (access: string) => {
    switch (access) {
      case 'full':
        return <Badge className="bg-emerald-100 text-emerald-800">Full Access</Badge>;
      case 'limited':
        return <Badge className="bg-orange-100 text-orange-800">Limited Access</Badge>;
      case 'restricted':
        return <Badge variant="destructive">Restricted</Badge>;
      default:
        return <Badge variant="outline">No Access</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading KYC management...</div>;
  }

  const stats = {
    total: kycStatuses?.length || 0,
    verified: kycStatuses?.filter(k => k.kyc_status === 'verified').length || 0,
    pending: kycStatuses?.filter(k => k.kyc_status === 'pending_review').length || 0,
    rejected: kycStatuses?.filter(k => k.kyc_status === 'rejected').length || 0,
    fullAccess: kycStatuses?.filter(k => k.access_level === 'full').length || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vendor KYC Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage vendor verification status and access levels
          </p>
        </div>
      </div>

      {/* KYC Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
              </div>
              <Shield className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Full Access</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.fullAccess}</p>
              </div>
              <FileCheck className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Status Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor KYC Status</CardTitle>
          <CardDescription>Review and manage vendor verification and access levels</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Compliance Score</TableHead>
                <TableHead>Profile Complete</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {kycStatuses?.map((status) => (
                <TableRow key={status.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">Vendor Profile</p>
                      <p className="text-sm text-muted-foreground">ID: {status.vendor_id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(status.kyc_status)}
                  </TableCell>
                  <TableCell>
                    {getAccessBadge(status.access_level)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={status.compliance_score || 0} className="w-16" />
                      <span className="text-sm">{status.compliance_score || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={0} className="w-16" />
                      <span className="text-sm">0%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={status.payment_verified ? "default" : "secondary"}>
                      {status.payment_verified ? "Verified" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedVendor(status);
                            setKycAction(status.kyc_status);
                            setAccessLevel(status.access_level);
                            setComplianceScore(status.compliance_score || 0);
                            setVerificationNotes(status.verification_notes || "");
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            Update KYC Status: {selectedVendor?.vendor_business_profiles?.business_name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>KYC Status</Label>
                              <Select value={kycAction} onValueChange={setKycAction}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select KYC status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="verified">Verified</SelectItem>
                                  <SelectItem value="pending_review">Pending Review</SelectItem>
                                  <SelectItem value="under_verification">Under Verification</SelectItem>
                                  <SelectItem value="documents_submitted">Documents Submitted</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                  <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label>Access Level</Label>
                              <Select value={accessLevel} onValueChange={setAccessLevel}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select access level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="full">Full Access</SelectItem>
                                  <SelectItem value="limited">Limited Access</SelectItem>
                                  <SelectItem value="restricted">Restricted</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div>
                            <Label>Compliance Score (0-100)</Label>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              value={complianceScore}
                              onChange={(e) => setComplianceScore(parseInt(e.target.value) || 0)}
                              placeholder="Enter compliance score"
                            />
                          </div>

                          <div>
                            <Label>Verification Notes</Label>
                            <Textarea
                              value={verificationNotes}
                              onChange={(e) => setVerificationNotes(e.target.value)}
                              placeholder="Add notes about the verification status..."
                              rows={4}
                            />
                          </div>

                          <Button onClick={handleUpdateKYC} className="w-full">
                            Update KYC Status
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {!kycStatuses?.length && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No vendor KYC records found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorKYCManagement;