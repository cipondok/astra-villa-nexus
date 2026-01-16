import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  FileText,
  ShieldAlert,
  TrendingUp,
  Users,
  ClipboardList
} from "lucide-react";

interface VendorApplication {
  id: string;
  vendor_type: 'product' | 'service';
  application_status: string;
  business_name: string;
  business_type: string;
  business_registration_number?: string;
  tax_id?: string;
  business_address: any;
  contact_info: any;
  category_selections: string[];
  compliance_region: 'UAE' | 'US' | 'EU';
  fraud_score: number;
  rejection_reason?: string;
  rejection_details: any;
  submitted_at?: string;
  created_at: string;
  updated_at: string;
}

interface RejectionCode {
  code: string;
  category: string;
  description: string;
  resolution_steps: string[];
  auto_resubmit_allowed: boolean;
  estimated_fix_time_hours: number;
}

const VendorApplicationManagement = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [reviewingApplication, setReviewingApplication] = useState<VendorApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch all vendor applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ['vendor-applications', selectedStatus, selectedRegion],
    queryFn: async () => {
      let query = supabase
        .from('vendor_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedStatus !== 'all') {
        query = query.eq('application_status', selectedStatus);
      }
      
      if (selectedRegion !== 'all') {
        query = query.eq('compliance_region', selectedRegion);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as VendorApplication[];
    }
  });

  // Fetch rejection codes
  const { data: rejectionCodes } = useQuery({
    queryKey: ['rejection-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rejection_codes')
        .select('*')
        .eq('is_active', true)
        .order('category');
      
      if (error) throw error;
      return data as RejectionCode[];
    }
  });

  // Fetch application stats
  const { data: stats } = useQuery({
    queryKey: ['application-stats'],
    queryFn: async () => {
      const [total, pending, approved, rejected] = await Promise.all([
        supabase.from('vendor_applications').select('*', { count: 'exact' }),
        supabase.from('vendor_applications').select('*', { count: 'exact' }).in('application_status', ['submitted', 'under_review']),
        supabase.from('vendor_applications').select('*', { count: 'exact' }).eq('application_status', 'approved'),
        supabase.from('vendor_applications').select('*', { count: 'exact' }).eq('application_status', 'rejected')
      ]);

      return {
        total: total.count || 0,
        pending: pending.count || 0,
        approved: approved.count || 0,
        rejected: rejected.count || 0
      };
    }
  });

  // Approve application mutation
  const approveApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from('vendor_applications')
        .update({
          application_status: 'approved',
          reviewed_at: new Date().toISOString(),
          approval_notes: adminNotes
        })
        .eq('id', applicationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Application approved successfully");
      setReviewingApplication(null);
      setAdminNotes('');
      queryClient.invalidateQueries({ queryKey: ['vendor-applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-stats'] });
    },
    onError: () => {
      showError("Error", "Failed to approve application");
    }
  });

  // Reject application mutation
  const rejectApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, rejectionCode }: { applicationId: string; rejectionCode: string }) => {
      const selectedCode = rejectionCodes?.find(code => code.code === rejectionCode);
      
      const { error } = await supabase
        .from('vendor_applications')
        .update({
          application_status: 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionCode,
          rejection_details: {
            reason_description: selectedCode?.description,
            resolution_steps: selectedCode?.resolution_steps,
            admin_notes: adminNotes
          }
        })
        .eq('id', applicationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Application rejected with feedback");
      setReviewingApplication(null);
      setRejectionReason('');
      setAdminNotes('');
      queryClient.invalidateQueries({ queryKey: ['vendor-applications'] });
      queryClient.invalidateQueries({ queryKey: ['application-stats'] });
    },
    onError: () => {
      showError("Error", "Failed to reject application");
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'under_review':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800"><FileText className="h-3 w-3 mr-1" />Submitted</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  const getFraudScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-red-100 text-red-800">High Risk</Badge>;
    if (score >= 50) return <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>;
    return <Badge className="bg-green-100 text-green-800">Low Risk</Badge>;
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
              <p className="text-2xl font-bold">{stats?.pending || 0}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold">{stats?.approved || 0}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold">{stats?.rejected || 0}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFilters = () => (
    <div className="flex gap-4 mb-6">
      <div>
        <Label htmlFor="status-filter">Status</Label>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="region-filter">Region</Label>
        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Regions</SelectItem>
            <SelectItem value="UAE">UAE</SelectItem>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="EU">European Union</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderApplicationReviewModal = () => {
    if (!reviewingApplication) return null;

    return (
      <Dialog open={!!reviewingApplication} onOpenChange={() => setReviewingApplication(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Application: {reviewingApplication.business_name}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList>
              <TabsTrigger value="details">Application Details</TabsTrigger>
              <TabsTrigger value="validation">Validation Results</TabsTrigger>
              <TabsTrigger value="fraud">Fraud Analysis</TabsTrigger>
              <TabsTrigger value="decision">Decision</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Business Name</Label>
                  <p className="font-medium">{reviewingApplication.business_name}</p>
                </div>
                <div>
                  <Label>Vendor Type</Label>
                  <p className="font-medium capitalize">{reviewingApplication.vendor_type}</p>
                </div>
                <div>
                  <Label>Business Type</Label>
                  <p className="font-medium">{reviewingApplication.business_type}</p>
                </div>
                <div>
                  <Label>Region</Label>
                  <p className="font-medium">{reviewingApplication.compliance_region}</p>
                </div>
                <div>
                  <Label>Registration Number</Label>
                  <p className="font-medium">{reviewingApplication.business_registration_number || 'Not provided'}</p>
                </div>
                <div>
                  <Label>Tax ID</Label>
                  <p className="font-medium">{reviewingApplication.tax_id || 'Not provided'}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Validation results would be displayed here based on the validation rules
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="fraud" className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <Label>Fraud Score</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{reviewingApplication.fraud_score}/100</span>
                    {getFraudScoreBadge(reviewingApplication.fraud_score)}
                  </div>
                </div>
              </div>
              {reviewingApplication.fraud_score > 70 && (
                <Alert>
                  <ShieldAlert className="h-4 w-4" />
                  <AlertDescription>
                    High fraud score detected. Additional verification recommended.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="decision" className="space-y-4">
              <div>
                <Label htmlFor="admin-notes">Admin Notes</Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for this decision..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Button 
                    onClick={() => approveApplicationMutation.mutate(reviewingApplication.id)}
                    disabled={approveApplicationMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Application
                  </Button>
                </div>

                <div className="space-y-2">
                  <Select value={rejectionReason} onValueChange={setRejectionReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rejection reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {rejectionCodes?.map(code => (
                        <SelectItem key={code.code} value={code.code}>
                          {code.code} - {code.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={() => rejectApplicationMutation.mutate({ 
                      applicationId: reviewingApplication.id, 
                      rejectionCode: rejectionReason 
                    })}
                    disabled={!rejectionReason || rejectApplicationMutation.isPending}
                    variant="destructive"
                    className="w-full"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading applications...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 rounded-lg border border-yellow-200/50 dark:border-yellow-800/50">
        <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
          <ClipboardList className="h-4 w-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">Vendor Applications</h2>
            <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-[9px] px-1.5 py-0 h-4">Applications</Badge>
          </div>
          <p className="text-[10px] text-muted-foreground">Review and manage vendor registration applications</p>
        </div>
      </div>

      {renderStatsCards()}
      {renderFilters()}

      <Card className="border-yellow-200/50 dark:border-yellow-800/30">
        <CardHeader className="p-3 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500/20 rounded flex items-center justify-center">
              <FileText className="h-3 w-3 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-xs">Applications</CardTitle>
              <CardDescription className="text-[9px]">Review and process vendor applications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {applications && applications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Fraud Score</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">{application.business_name}</TableCell>
                    <TableCell className="capitalize">{application.vendor_type}</TableCell>
                    <TableCell>{application.compliance_region}</TableCell>
                    <TableCell>{getStatusBadge(application.application_status)}</TableCell>
                    <TableCell>{getFraudScoreBadge(application.fraud_score)}</TableCell>
                    <TableCell>
                      {application.submitted_at 
                        ? new Date(application.submitted_at).toLocaleDateString()
                        : 'Not submitted'
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReviewingApplication(application)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No applications found for the selected filters.
            </div>
          )}
        </CardContent>
      </Card>

      {renderApplicationReviewModal()}
    </div>
  );
};

export default VendorApplicationManagement;