import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Download
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const VendorKYCDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; type: string } | null>(null);

  // Document types for Indonesian businesses
  const documentTypes = [
    { key: 'ktp', name: 'KTP (ID Card)', required: true },
    { key: 'npwp', name: 'NPWP (Tax ID)', required: true },
    { key: 'siup', name: 'SIUP (Business License)', required: true },
    { key: 'niu', name: 'NIU (Business Number)', required: false },
    { key: 'skk', name: 'SKK (Competency Certificate)', required: false },
    { key: 'siuk', name: 'SIUK (Construction License)', required: false }
  ];

  // BPJS verification types
  const bpjsTypes = [
    { key: 'kesehatan', name: 'BPJS Kesehatan', required: true },
    { key: 'ketenagakerjaan', name: 'BPJS Ketenagakerjaan', required: true }
  ];

  // Fetch vendor business profile
  const { data: vendorProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['vendor-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('vendor_business_profiles')
        .select('*')
        .eq('vendor_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch document verifications
  const { data: documentVerifications, isLoading: documentsLoading } = useQuery({
    queryKey: ['document-verifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('vendor_document_verifications')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch BPJS verifications
  const { data: bpjsVerifications, isLoading: bpjsLoading } = useQuery({
    queryKey: ['bpjs-verifications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      // BPJS verification data access has been disabled for security
      // Use secure function instead for vendor's own data
      try {
        const { data, error } = await supabase.rpc('get_bpjs_verification_summary', {
          p_vendor_id: user.id
        });
        
        if (error) {
          console.warn('BPJS verification summary requires proper authorization:', error.message);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.warn('Secure BPJS verification access not available:', error);
        return [];
      }
    },
    enabled: !!user?.id
  });

  // Document upload mutation
  const uploadDocumentMutation = useMutation({
    mutationFn: async ({ file, documentType }: { file: File; documentType: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('vendor-docs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Create document verification record
      const { data, error } = await supabase
        .from('vendor_document_verifications')
        .insert({
          vendor_id: user.id,
          document_type: documentType,
          document_number: fileName, // Use document_number instead of document_url
          verification_details: { original_filename: file.name, file_path: fileName },
          verification_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-verifications'] });
      toast({
        title: 'Document Uploaded',
        description: 'Your document has been uploaded and is pending verification.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload document',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setUploadingDoc(null);
    }
  });

  // BPJS verification mutation
  const verifyBPJSMutation = useMutation({
    mutationFn: async ({ bpjsType, bpjsNumber }: { bpjsType: string; bpjsNumber: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('verify-bpjs', {
        body: {
          vendorId: user.id,
          bpjsType,
          bpjsNumber
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bpjs-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profile'] });
      toast({
        title: 'BPJS Verification Submitted',
        description: 'Your BPJS verification has been processed.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify BPJS number',
        variant: 'destructive',
      });
    }
  });

  const handleFileUpload = (file: File, documentType: string) => {
    if (!file) return;
    
    setUploadingDoc(documentType);
    uploadDocumentMutation.mutate({ file, documentType });
  };

  const handleBPJSSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const bpjsType = formData.get('bpjsType') as string;
    const bpjsNumber = formData.get('bpjsNumber') as string;

    if (!bpjsType || !bpjsNumber) {
      toast({
        title: 'Invalid Input',
        description: 'Please select BPJS type and enter number',
        variant: 'destructive',
      });
      return;
    }

    verifyBPJSMutation.mutate({ bpjsType, bpjsNumber });
  };

  const getDocumentStatus = (docType: string) => {
    const verification = documentVerifications?.find(doc => doc.document_type === docType);
    return verification?.verification_status || 'not_uploaded';
  };

  const getBPJSStatus = (bpjsType: string) => {
    // With the new secure function, data structure is different
    if (!bpjsVerifications || bpjsVerifications.length === 0) return 'not_verified';
    
    const summary = bpjsVerifications[0]; // Get first (and only) summary record
    
    if (bpjsType === 'kesehatan') {
      return summary.bpjs_kesehatan_status || 'not_verified';
    } else if (bpjsType === 'ketenagakerjaan') {
      return summary.bpjs_ketenagakerjaan_status || 'not_verified';
    }
    
    return 'not_verified';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      verified: 'default',
      pending: 'secondary',
      rejected: 'destructive',
      not_uploaded: 'secondary',
      not_verified: 'secondary'
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const calculateCompletionPercentage = () => {
    const totalRequiredItems = documentTypes.filter(doc => doc.required).length + bpjsTypes.length;
    let completedItems = 0;

    // Count verified documents
    documentTypes.forEach(doc => {
      if (doc.required && getDocumentStatus(doc.key) === 'verified') {
        completedItems++;
      }
    });

    // Count verified BPJS
    bpjsTypes.forEach(bpjs => {
      if (getBPJSStatus(bpjs.key) === 'verified') {
        completedItems++;
      }
    });

    return Math.round((completedItems / totalRequiredItems) * 100);
  };

  const previewDocument = async (verification: any) => {
    try {
      const { data } = await supabase.storage
        .from('vendor-docs')
        .createSignedUrl(verification.verification_details?.file_path || verification.document_number, 3600);

      if (data?.signedUrl) {
        setPreviewDoc({
          url: data.signedUrl,
          type: verification.document_type
        });
      }
    } catch (error) {
      toast({
        title: 'Preview Failed',
        description: 'Could not load document preview',
        variant: 'destructive',
      });
    }
  };

  if (profileLoading || documentsLoading || bpjsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            KYC Verification Center
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete your verification to access all vendor features
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
          <div className="text-sm text-muted-foreground">Complete</div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Progress</CardTitle>
          <CardDescription>
            Complete all required verifications to unlock full vendor capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={completionPercentage} className="mb-4" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">
                {documentVerifications?.filter(doc => doc.verification_status === 'verified').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Verified Docs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-yellow-600">
                {documentVerifications?.filter(doc => doc.verification_status === 'pending').length || 0}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">
                {bpjsVerifications && bpjsVerifications.length > 0 && bpjsVerifications[0].is_fully_verified ? 2 : 0}
              </div>
              <div className="text-sm text-muted-foreground">BPJS Verified</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {completionPercentage === 100 ? '✓' : '⏳'}
              </div>
              <div className="text-sm text-muted-foreground">Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents">Document Verification</TabsTrigger>
          <TabsTrigger value="bpjs">BPJS Verification</TabsTrigger>
        </TabsList>

        {/* Document Verification Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="grid gap-6">
            {documentTypes.map((docType) => {
              const status = getDocumentStatus(docType.key);
              const verification = documentVerifications?.find(doc => doc.document_type === docType.key);
              
              return (
                <Card key={docType.key}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {docType.name}
                          {docType.required && <Badge variant="outline">Required</Badge>}
                        </CardTitle>
                        <CardDescription>
                          {status === 'not_uploaded' && 'Upload your document for verification'}
                          {status === 'pending' && 'Document uploaded, awaiting admin review'}
                          {status === 'verified' && 'Document verified and approved'}
                          {status === 'rejected' && 'Document rejected, please reupload'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        {getStatusBadge(status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      {status === 'not_uploaded' || status === 'rejected' ? (
                        <div className="flex-1">
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, docType.key);
                            }}
                            disabled={uploadingDoc === docType.key}
                          />
                          {uploadingDoc === docType.key && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Uploading...
                            </div>
                          )}
                        </div>
                      ) : verification && (
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-sm">{(verification.verification_details as any)?.original_filename || verification.document_number}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => previewDocument(verification)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {(verification?.verification_details as any)?.admin_notes && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Admin Notes:</strong> {(verification.verification_details as any).admin_notes}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* BPJS Verification Tab */}
        <TabsContent value="bpjs" className="space-y-6">
          <div className="grid gap-6">
            {bpjsTypes.map((bpjsType) => {
              const status = getBPJSStatus(bpjsType.key);
              const summary = bpjsVerifications && bpjsVerifications.length > 0 ? bpjsVerifications[0] : null;
              
              return (
                <Card key={bpjsType.key}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5" />
                          {bpjsType.name}
                          <Badge variant="outline">Required</Badge>
                        </CardTitle>
                        <CardDescription>
                          {status === 'not_verified' && 'Enter your BPJS number for verification'}
                          {status === 'pending' && 'BPJS verification in progress'}
                          {status === 'verified' && 'BPJS number verified successfully'}
                          {status === 'rejected' && 'BPJS verification failed'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        {getStatusBadge(status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {status === 'not_verified' || status === 'rejected' ? (
                      <form onSubmit={handleBPJSSubmit} className="space-y-4">
                        <input type="hidden" name="bpjsType" value={bpjsType.key} />
                        <div>
                          <Label htmlFor={`bpjs-${bpjsType.key}`}>
                            {bpjsType.name} Number
                          </Label>
                          <Input
                            id={`bpjs-${bpjsType.key}`}
                            name="bpjsNumber"
                            placeholder="Enter your BPJS number"
                            required
                          />
                        </div>
                        <Button 
                          type="submit" 
                          disabled={verifyBPJSMutation.isPending}
                          className="w-full"
                        >
                          {verifyBPJSMutation.isPending ? 'Verifying...' : 'Verify BPJS'}
                        </Button>
                      </form>
                    ) : summary && (
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Status: {bpjsType.key === 'kesehatan' ? summary.bpjs_kesehatan_status : summary.bpjs_ketenagakerjaan_status}
                        </div>
                        {summary.verification_date && (
                          <div className="text-sm text-muted-foreground">
                            Last Updated: {new Date(summary.verification_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Document Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>
              {previewDoc?.type.toUpperCase()} Document
            </DialogDescription>
          </DialogHeader>
          {previewDoc && (
            <div className="space-y-4">
              {previewDoc.url.includes('.pdf') ? (
                <iframe
                  src={previewDoc.url}
                  className="w-full h-96 border rounded"
                  title="Document Preview"
                />
              ) : (
                <img
                  src={previewDoc.url}
                  alt="Document Preview"
                  className="w-full max-h-96 object-contain border rounded"
                />
              )}
              <div className="flex justify-end">
                <Button asChild>
                  <a href={previewDoc.url} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorKYCDashboard;