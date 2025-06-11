
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { Shield, CheckCircle, XCircle, Eye, Phone, Mail, User, CreditCard } from "lucide-react";

const AdminKYCManagement = () => {
  const [selectedKYC, setSelectedKYC] = useState<any>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch all KYC submissions
  const { data: kycSubmissions, isLoading } = useQuery({
    queryKey: ['admin-kyc-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_kyc_verification')
        .select(`
          *,
          profiles(full_name, email),
          vendor_business_profiles(business_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Update KYC status mutation
  const updateKYCMutation = useMutation({
    mutationFn: async ({ kycId, status, notes }: { kycId: string; status: string; notes: string }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const updates: any = {
        overall_status: status,
        notes: notes,
        verified_by: user.user?.id,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved') {
        updates.ktp_verified_at = new Date().toISOString();
        updates.face_verified_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('vendor_kyc_verification')
        .update(updates)
        .eq('id', kycId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "KYC status updated successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-submissions'] });
      setIsDialogOpen(false);
      setVerificationNotes("");
    },
    onError: () => {
      showError("Error", "Failed to update KYC status");
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive"
    };
    return <Badge variant={variants[status] || "secondary"}>{status.toUpperCase()}</Badge>;
  };

  const getVerificationIcon = (verified: boolean) => {
    return verified ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading KYC submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">KYC Verification Management</h2>
          <p className="text-muted-foreground">Review and approve vendor KYC documents</p>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {kycSubmissions?.filter(kyc => kyc.overall_status === 'pending').map((kyc) => (
              <Card key={kyc.id} className="border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{kyc.profiles?.full_name}</CardTitle>
                      <CardDescription>
                        {kyc.vendor_business_profiles?.business_name} • {kyc.profiles?.email}
                      </CardDescription>
                    </div>
                    {getStatusBadge(kyc.overall_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="text-sm">KTP: {kyc.ktp_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span className="text-sm">Mobile: {kyc.mobile_number}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {getVerificationIcon(!!kyc.email_verified_at)}
                      <span className="text-sm">Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {getVerificationIcon(!!kyc.face_verified_at)}
                      <span className="text-sm">Face</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedKYC(kyc);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => updateKYCMutation.mutate({ 
                        kycId: kyc.id, 
                        status: 'approved', 
                        notes: 'Quick approval' 
                      })}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Quick Approve
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => updateKYCMutation.mutate({ 
                        kycId: kyc.id, 
                        status: 'rejected', 
                        notes: 'Documents incomplete' 
                      })}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approved">
          <div className="grid gap-4">
            {kycSubmissions?.filter(kyc => kyc.overall_status === 'approved').map((kyc) => (
              <Card key={kyc.id} className="border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-green-800">{kyc.profiles?.full_name}</CardTitle>
                      <CardDescription>{kyc.vendor_business_profiles?.business_name}</CardDescription>
                    </div>
                    {getStatusBadge(kyc.overall_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Verified on: {new Date(kyc.ktp_verified_at || kyc.updated_at).toLocaleDateString('id-ID')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rejected">
          <div className="grid gap-4">
            {kycSubmissions?.filter(kyc => kyc.overall_status === 'rejected').map((kyc) => (
              <Card key={kyc.id} className="border-red-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-red-800">{kyc.profiles?.full_name}</CardTitle>
                      <CardDescription>{kyc.vendor_business_profiles?.business_name}</CardDescription>
                    </div>
                    {getStatusBadge(kyc.overall_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  {kyc.notes && (
                    <p className="text-sm text-muted-foreground">Notes: {kyc.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all">
          <div className="grid gap-4">
            {kycSubmissions?.map((kyc) => (
              <Card key={kyc.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{kyc.profiles?.full_name}</CardTitle>
                      <CardDescription>
                        {kyc.vendor_business_profiles?.business_name} • 
                        Submitted: {new Date(kyc.created_at).toLocaleDateString('id-ID')}
                      </CardDescription>
                    </div>
                    {getStatusBadge(kyc.overall_status)}
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>KYC Review: {selectedKYC?.profiles?.full_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>KTP Number</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded">{selectedKYC?.ktp_number}</p>
              </div>
              <div>
                <Label>Mobile Number</Label>
                <p className="text-sm font-mono bg-muted p-2 rounded">{selectedKYC?.mobile_number}</p>
              </div>
            </div>

            {selectedKYC?.ktp_image_url && (
              <div>
                <Label>KTP Image</Label>
                <img 
                  src={selectedKYC.ktp_image_url} 
                  alt="KTP" 
                  className="w-full max-w-md h-48 object-cover rounded border"
                />
              </div>
            )}

            {selectedKYC?.face_verification_url && (
              <div>
                <Label>Face Verification</Label>
                <img 
                  src={selectedKYC.face_verification_url} 
                  alt="Face verification" 
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}

            <div>
              <Label>Verification Notes</Label>
              <Textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Add verification notes..."
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => updateKYCMutation.mutate({ 
                  kycId: selectedKYC?.id, 
                  status: 'approved', 
                  notes: verificationNotes 
                })}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve KYC
              </Button>
              <Button 
                variant="destructive"
                onClick={() => updateKYCMutation.mutate({ 
                  kycId: selectedKYC?.id, 
                  status: 'rejected', 
                  notes: verificationNotes 
                })}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject KYC
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYCManagement;
