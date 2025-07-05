import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { 
  AlertTriangle, 
  Shield, 
  CreditCard, 
  CheckCircle, 
  Clock,
  XCircle,
  FileText,
  User,
  Building
} from "lucide-react";

interface VendorIssue {
  id: string;
  vendor_id: string;
  business_name: string;
  issue_type: 'kyc_pending' | 'payment_incomplete' | 'document_missing';
  priority: 'high' | 'medium' | 'low';
  description: string;
  created_at: string;
}

const VendorIssuesOverview = () => {
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch KYC pending applications
  const { data: kycPendingData } = useQuery({
    queryKey: ['kyc-pending-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_applications')
        .select(`
          id,
          user_id,
          business_name,
          application_status,
          created_at,
          vendor_type
        `)
        .in('application_status', ['pending_review', 'documents_submitted'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch payment integration issues
  const { data: paymentIssuesData } = useQuery({
    queryKey: ['payment-integration-issues'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_business_profiles')
        .select(`
          id,
          vendor_id,
          business_name,
          bpjs_ketenagakerjaan_verified,
          bpjs_kesehatan_verified,
          created_at
        `)
        .or('bpjs_ketenagakerjaan_verified.eq.false,bpjs_kesehatan_verified.eq.false')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Resolve KYC issue
  const resolveKYCMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      const { error } = await supabase
        .from('vendor_applications')
        .update({ 
          application_status: status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "KYC application status updated");
      queryClient.invalidateQueries({ queryKey: ['kyc-pending-issues'] });
    },
    onError: () => {
      showError("Error", "Failed to update KYC status");
    }
  });

  // Resolve payment issue
  const resolvePaymentMutation = useMutation({
    mutationFn: async ({ profileId, updateData }: { profileId: string; updateData: any }) => {
      const { error } = await supabase
        .from('vendor_business_profiles')
        .update(updateData)
        .eq('id', profileId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Payment integration updated");
      queryClient.invalidateQueries({ queryKey: ['payment-integration-issues'] });
    },
    onError: () => {
      showError("Error", "Failed to update payment integration");
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
      pending_review: { variant: "secondary", icon: <Clock className="h-3 w-3" /> },
      documents_submitted: { variant: "outline", icon: <FileText className="h-3 w-3" /> },
      approved: { variant: "default", icon: <CheckCircle className="h-3 w-3" /> },
      rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3" /> }
    };
    
    const { variant, icon } = variants[status] || variants.pending_review;
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    const variants = {
      high: "destructive" as const,
      medium: "secondary" as const,
      low: "outline" as const
    };
    
    return <Badge variant={variants[priority]}>{priority.toUpperCase()}</Badge>;
  };

  const kycIssuesCount = kycPendingData?.length || 0;
  const paymentIssuesCount = paymentIssuesData?.length || 0;
  const totalIssues = kycIssuesCount + paymentIssuesCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Vendor Management Issues
          </h3>
          <p className="text-sm text-muted-foreground">
            Active issues requiring immediate attention
          </p>
        </div>
        <Badge variant={totalIssues > 0 ? "destructive" : "default"}>
          {totalIssues} Active Issues
        </Badge>
      </div>

      {/* Issue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">KYC Pending</p>
                <p className="text-2xl font-bold text-orange-600">{kycIssuesCount}</p>
              </div>
              <Shield className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Payment Issues</p>
                <p className="text-2xl font-bold text-red-600">{paymentIssuesCount}</p>
              </div>
              <CreditCard className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-600">85%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KYC Pending Issues */}
      {kycIssuesCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              KYC Verification Pending ({kycIssuesCount})
            </CardTitle>
            <CardDescription>Vendor applications awaiting KYC review</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycPendingData?.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{application.business_name}</p>
                          <p className="text-xs text-muted-foreground">ID: {application.user_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{application.vendor_type}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(application.application_status)}
                    </TableCell>
                    <TableCell>
                      {new Date(application.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => resolveKYCMutation.mutate({
                            applicationId: application.id,
                            status: 'approved'
                          })}
                          disabled={resolveKYCMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveKYCMutation.mutate({
                            applicationId: application.id,
                            status: 'under_verification'
                          })}
                          disabled={resolveKYCMutation.isPending}
                        >
                          Review
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payment Integration Issues */}
      {paymentIssuesCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Integration Issues ({paymentIssuesCount})
            </CardTitle>
            <CardDescription>Vendors with incomplete payment setup</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>BPJS Ketenagakerjaan</TableHead>
                  <TableHead>BPJS Kesehatan</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentIssuesData?.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <div>
                          <p className="font-medium">{profile.business_name}</p>
                          <p className="text-xs text-muted-foreground">ID: {profile.vendor_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.bpjs_ketenagakerjaan_verified ? "default" : "destructive"}>
                        {profile.bpjs_ketenagakerjaan_verified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={profile.bpjs_kesehatan_verified ? "default" : "destructive"}>
                        {profile.bpjs_kesehatan_verified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getPriorityBadge(
                        (!profile.bpjs_ketenagakerjaan_verified && !profile.bpjs_kesehatan_verified) 
                          ? 'high' 
                          : 'medium'
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => resolvePaymentMutation.mutate({
                            profileId: profile.id,
                            updateData: {
                              bpjs_ketenagakerjaan_verified: true,
                              bpjs_kesehatan_verified: true,
                              bpjs_verification_date: new Date().toISOString()
                            }
                          })}
                          disabled={resolvePaymentMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Navigate to detailed payment setup
                            window.open(`/admin#vendor-payment-${profile.vendor_id}`, '_blank');
                          }}
                        >
                          Details
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* No Issues Alert */}
      {totalIssues === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Great! No active vendor management issues at this time. 
            All KYC verifications are complete and payment integrations are properly configured.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VendorIssuesOverview;