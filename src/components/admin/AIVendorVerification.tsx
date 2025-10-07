
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Brain,
  Camera,
  FileText,
  TrendingUp,
  Activity
} from "lucide-react";

const AIVendorVerification = () => {
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [verificationStatus, setVerificationStatus] = useState("");
  
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch vendor AI verification data
  const { data: verifications, isLoading } = useQuery({
    queryKey: ['vendor-ai-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_ai_verification')
        .select(`
          *,
          profiles:vendor_id (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Update verification status
  const updateVerificationMutation = useMutation({
    mutationFn: async ({ vendorId, status, notes, trustScore }: any) => {
      const { error } = await supabase
        .from('vendor_ai_verification')
        .update({
          verification_status: status,
          verification_notes: notes,
          trust_score: trustScore,
          verified_at: status === 'verified' ? new Date().toISOString() : null
        })
        .eq('vendor_id', vendorId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Verification status updated successfully");
      queryClient.invalidateQueries({ queryKey: ['vendor-ai-verifications'] });
      setIsVerificationModalOpen(false);
    },
    onError: () => {
      showError("Error", "Failed to update verification status");
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      verified: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      flagged: "bg-orange-100 text-orange-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleVerify = (vendor: any) => {
    setSelectedVendor(vendor);
    setVerificationNotes(vendor.verification_notes || "");
    setVerificationStatus(vendor.verification_status);
    setIsVerificationModalOpen(true);
  };

  const handleUpdateVerification = () => {
    if (!selectedVendor) return;
    
    const trustScore = verificationStatus === 'verified' ? 85 : 
                     verificationStatus === 'flagged' ? 30 : 50;
    
    updateVerificationMutation.mutate({
      vendorId: selectedVendor.vendor_id,
      status: verificationStatus,
      notes: verificationNotes,
      trustScore
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading AI verification data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Vendor Verification
          </h2>
          <p className="text-muted-foreground">Multi-tier verification with AI automation and trust scoring</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Verifications</p>
                <p className="text-2xl font-bold">{verifications?.length || 0}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {verifications?.filter(v => v.verification_status === 'verified').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {verifications?.filter(v => v.verification_status === 'pending').length || 0}
                </p>
              </div>
              <Activity className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flagged</p>
                <p className="text-2xl font-bold text-red-600">
                  {verifications?.filter(v => v.verification_status === 'flagged').length || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification List */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Verifications</CardTitle>
          <CardDescription>
            AI-powered vendor verification with biometric and document validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verifications?.map((verification) => (
              <div key={verification.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{verification.profiles?.full_name || 'Unknown Vendor'}</h3>
                    <p className="text-sm text-muted-foreground">{verification.profiles?.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(verification.verification_status)}>
                      {verification.verification_status.toUpperCase()}
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => handleVerify(verification)}>
                      <Eye className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Trust Score</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={verification.trust_score} className="flex-1" />
                      <span className={`text-sm font-bold ${getTrustScoreColor(verification.trust_score)}`}>
                        {verification.trust_score}%
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Verification Type</Label>
                    <p className="text-sm mt-1 capitalize">{verification.verification_type}</p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">AI Confidence</Label>
                    <p className="text-sm mt-1">{verification.ai_confidence_score}%</p>
                  </div>
                </div>

                {verification.verification_notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <Label className="text-sm font-medium">Notes:</Label>
                    <p className="text-sm text-muted-foreground">{verification.verification_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verification Modal */}
      <Dialog open={isVerificationModalOpen} onOpenChange={setIsVerificationModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Vendor Verification Review</DialogTitle>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor Name</Label>
                  <p className="font-medium">{selectedVendor.profiles?.full_name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedVendor.profiles?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Trust Score</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedVendor.trust_score} className="flex-1" />
                    <span className={`font-bold ${getTrustScoreColor(selectedVendor.trust_score)}`}>
                      {selectedVendor.trust_score}%
                    </span>
                  </div>
                </div>
                <div>
                  <Label>Verification Type</Label>
                  <p className="capitalize">{selectedVendor.verification_type}</p>
                </div>
              </div>

              {/* Biometric Verification Results */}
              {selectedVendor.biometric_verification && Object.keys(selectedVendor.biometric_verification).length > 0 && (
                <div>
                  <Label className="flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Biometric Verification
                  </Label>
                  <div className="p-3 bg-gray-50 rounded mt-2">
                    <pre className="text-xs">{JSON.stringify(selectedVendor.biometric_verification, null, 2)}</pre>
                  </div>
                </div>
              )}

              {/* Document Verification Results */}
              {selectedVendor.document_verification && Object.keys(selectedVendor.document_verification).length > 0 && (
                <div>
                  <Label className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Document Verification
                  </Label>
                  <div className="p-3 bg-gray-50 rounded mt-2">
                    <pre className="text-xs">{JSON.stringify(selectedVendor.document_verification, null, 2)}</pre>
                  </div>
                </div>
              )}

              <div>
                <Label>Verification Status</Label>
                <Select value={verificationStatus} onValueChange={setVerificationStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Verification Notes</Label>
                <Textarea
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Add verification notes..."
                  rows={3}
                />
              </div>

              <Button onClick={handleUpdateVerification} className="w-full">
                Update Verification
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIVendorVerification;
