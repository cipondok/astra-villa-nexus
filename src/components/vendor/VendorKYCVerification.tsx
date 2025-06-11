
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Upload, Phone, Mail, User, CreditCard, CheckCircle, AlertCircle, Clock } from "lucide-react";

const VendorKYCVerification = () => {
  const [ktpNumber, setKtpNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [ktpImageFile, setKtpImageFile] = useState<File | null>(null);
  const [faceImageFile, setFaceImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch current KYC status
  const { data: kycData, isLoading } = useQuery({
    queryKey: ['vendor-kyc', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('vendor_kyc_verification')
        .select('*')
        .eq('vendor_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Upload image to Supabase storage
  const uploadImage = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Submit KYC mutation
  const submitKYCMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      setUploading(true);
      
      let ktpImageUrl = kycData?.ktp_image_url;
      let faceImageUrl = kycData?.face_verification_url;

      // Upload new images if provided
      if (ktpImageFile) {
        ktpImageUrl = await uploadImage(ktpImageFile, 'ktp-images');
      }
      
      if (faceImageFile) {
        faceImageUrl = await uploadImage(faceImageFile, 'face-verification');
      }

      const kycSubmission = {
        vendor_id: user.id,
        ktp_number: ktpNumber || kycData?.ktp_number,
        mobile_number: mobileNumber || kycData?.mobile_number,
        whatsapp_number: whatsappNumber || kycData?.whatsapp_number,
        ktp_image_url: ktpImageUrl,
        face_verification_url: faceImageUrl,
        overall_status: 'pending',
        email_verified_at: user.email_confirmed_at ? new Date().toISOString() : null
      };

      if (kycData) {
        // Update existing KYC
        const { error } = await supabase
          .from('vendor_kyc_verification')
          .update(kycSubmission)
          .eq('id', kycData.id);
        
        if (error) throw error;
      } else {
        // Create new KYC
        const { error } = await supabase
          .from('vendor_kyc_verification')
          .insert(kycSubmission);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      showSuccess("Success", "KYC documents submitted for verification");
      queryClient.invalidateQueries({ queryKey: ['vendor-kyc'] });
      setKtpImageFile(null);
      setFaceImageFile(null);
    },
    onError: (error) => {
      console.error('KYC submission error:', error);
      showError("Error", "Failed to submit KYC documents");
    },
    onSettled: () => {
      setUploading(false);
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
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

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading KYC information...</div>;
  }

  const isVerified = kycData?.overall_status === 'approved';
  const isPending = kycData?.overall_status === 'pending';
  const isRejected = kycData?.overall_status === 'rejected';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">KYC Verification</h2>
          <p className="text-muted-foreground">Complete your identity verification to unlock all features</p>
        </div>
        {kycData && getStatusBadge(kycData.overall_status)}
      </div>

      {isVerified && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Your identity has been verified successfully! You now have access to all vendor features.
          </AlertDescription>
        </Alert>
      )}

      {isPending && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Your KYC documents are under review. We'll notify you once the verification is complete.
          </AlertDescription>
        </Alert>
      )}

      {isRejected && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            Your KYC verification was rejected. Please review the requirements and submit again.
            {kycData?.notes && <div className="mt-2">Admin notes: {kycData.notes}</div>}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verification Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email Verification</span>
              </div>
              {getStatusIcon(user?.email_confirmed_at ? 'approved' : 'pending')}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>Mobile Number</span>
              </div>
              {getStatusIcon(kycData?.mobile_verified_at ? 'approved' : 'pending')}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>KTP Verification</span>
              </div>
              {getStatusIcon(kycData?.ktp_verified_at ? 'approved' : 'pending')}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Face Verification</span>
              </div>
              {getStatusIcon(kycData?.face_verified_at ? 'approved' : 'pending')}
            </div>
          </CardContent>
        </Card>

        {/* KYC Form */}
        <Card>
          <CardHeader>
            <CardTitle>Identity Documents</CardTitle>
            <CardDescription>
              Upload your KTP and complete face verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="ktp-number">KTP Number</Label>
              <Input
                id="ktp-number"
                value={ktpNumber || kycData?.ktp_number || ''}
                onChange={(e) => setKtpNumber(e.target.value)}
                placeholder="Enter your KTP number"
                disabled={isVerified}
              />
            </div>

            <div>
              <Label htmlFor="mobile-number">Mobile Number</Label>
              <Input
                id="mobile-number"
                value={mobileNumber || kycData?.mobile_number || ''}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+62 xxx xxx xxxx"
                disabled={isVerified}
              />
            </div>

            <div>
              <Label htmlFor="whatsapp-number">WhatsApp Number</Label>
              <Input
                id="whatsapp-number"
                value={whatsappNumber || kycData?.whatsapp_number || ''}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+62 xxx xxx xxxx"
                disabled={isVerified}
              />
            </div>

            <div>
              <Label htmlFor="ktp-image">KTP Image</Label>
              <Input
                id="ktp-image"
                type="file"
                accept="image/*"
                onChange={(e) => setKtpImageFile(e.target.files?.[0] || null)}
                disabled={isVerified || uploading}
              />
              {kycData?.ktp_image_url && (
                <div className="mt-2">
                  <img 
                    src={kycData.ktp_image_url} 
                    alt="KTP" 
                    className="w-full max-w-sm h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="face-image">Face Photo</Label>
              <Input
                id="face-image"
                type="file"
                accept="image/*"
                onChange={(e) => setFaceImageFile(e.target.files?.[0] || null)}
                disabled={isVerified || uploading}
              />
              {kycData?.face_verification_url && (
                <div className="mt-2">
                  <img 
                    src={kycData.face_verification_url} 
                    alt="Face verification" 
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            {!isVerified && (
              <Button 
                onClick={() => submitKYCMutation.mutate()}
                disabled={uploading || submitKYCMutation.isPending}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-pulse" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    {kycData ? 'Update KYC Documents' : 'Submit for Verification'}
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorKYCVerification;
