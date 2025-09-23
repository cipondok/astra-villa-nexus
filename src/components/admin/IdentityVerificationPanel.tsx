import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSecureIdentityVerification } from '@/hooks/useSecureIdentityVerification';
import { Shield, Eye, AlertTriangle, CheckCircle, Clock, X } from 'lucide-react';
import { toast } from 'sonner';

const IdentityVerificationPanel = () => {
  const [vendorId, setVendorId] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'rejected' | 'pending'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isAdminUser, setIsAdminUser] = useState(false);

  const {
    loading,
    verificationSummary,
    getVerificationSummary,
    updateVerificationStatus,
    checkAdminAccess
  } = useSecureIdentityVerification();

  useEffect(() => {
    const verifyAdminAccess = async () => {
      const hasAccess = await checkAdminAccess();
      setIsAdminUser(hasAccess);
      if (!hasAccess) {
        toast.error('Access denied: Admin privileges required for identity verification');
      }
    };
    verifyAdminAccess();
  }, [checkAdminAccess]);

  const handleGetSummary = async () => {
    if (!vendorId.trim()) {
      toast.error('Please enter a vendor ID');
      return;
    }
    await getVerificationSummary(vendorId.trim());
  };

  const handleUpdateStatus = async () => {
    if (!selectedDocumentId.trim()) {
      toast.error('Please enter a document ID');
      return;
    }

    const success = await updateVerificationStatus(
      selectedDocumentId.trim(),
      verificationStatus,
      rejectionReason.trim() || undefined
    );

    if (success) {
      setSelectedDocumentId('');
      setRejectionReason('');
      setVerificationStatus('pending');
      
      // Refresh summary if we have a vendor ID
      if (vendorId.trim()) {
        await getVerificationSummary(vendorId.trim());
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isAdminUser) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Shield className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription className="text-red-600">
            This panel requires administrator privileges. Identity verification data is highly restricted for security.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <Shield className="h-5 w-5" />
            Identity Verification Management
          </CardTitle>
          <CardDescription className="text-amber-600">
            Ultra-secure panel for managing identity verification documents. All access is logged and monitored.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Verification Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Verification Summary
            </CardTitle>
            <CardDescription>
              View aggregated verification status for a vendor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-id">Vendor ID</Label>
              <Input
                id="vendor-id"
                placeholder="Enter vendor UUID"
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleGetSummary} 
              disabled={loading || !vendorId.trim()}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Get Summary'}
            </Button>

            {verificationSummary && (
              <div className="mt-4 space-y-3 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Total Documents</p>
                    <p className="text-2xl font-bold">{verificationSummary.document_count}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Verified</p>
                    <p className="text-2xl font-bold text-green-600">{verificationSummary.verified_documents}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{verificationSummary.pending_documents}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{verificationSummary.rejected_documents}</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">KYC Status</span>
                    <Badge className={getStatusColor(verificationSummary.kyc_status)}>
                      {getStatusIcon(verificationSummary.kyc_status)}
                      <span className="ml-1">{verificationSummary.kyc_status}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">KYC Level</span>
                    <Badge variant="outline">{verificationSummary.kyc_level}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className="font-mono text-sm">{verificationSummary.overall_score.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Update Verification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Update Verification Status
            </CardTitle>
            <CardDescription>
              Approve, reject, or modify document verification status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="document-id">Document ID</Label>
              <Input
                id="document-id"
                placeholder="Enter document UUID"
                value={selectedDocumentId}
                onChange={(e) => setSelectedDocumentId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Verification Status</Label>
              <Select value={verificationStatus} onValueChange={(value: 'verified' | 'rejected' | 'pending') => setVerificationStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Verified
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center gap-2">
                      <X className="h-4 w-4 text-red-500" />
                      Rejected
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      Pending
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {verificationStatus === 'rejected' && (
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Explain why the document was rejected..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <Button 
              onClick={handleUpdateStatus} 
              disabled={loading || !selectedDocumentId.trim()}
              className="w-full"
            >
              {loading ? 'Updating...' : 'Update Status'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">Security Notice</p>
              <p className="text-sm text-blue-700">
                All access to identity verification data is logged with high security ratings. 
                Direct database access is blocked - only use these secure functions. 
                Sensitive data like document numbers are automatically masked.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IdentityVerificationPanel;