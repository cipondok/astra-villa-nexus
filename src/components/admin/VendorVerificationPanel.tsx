import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { FileText, CheckCircle, XCircle, AlertTriangle, Eye, Upload } from "lucide-react";

interface VendorVerificationPanelProps {
  vendor?: any;
}

const VendorVerificationPanel = ({ vendor }: VendorVerificationPanelProps) => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [verificationAction, setVerificationAction] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch vendor verification documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['vendor-verification-documents', vendor?.vendor_id],
    queryFn: async () => {
      if (!vendor?.vendor_id) return [];
      
      const { data, error } = await supabase
        .from('vendor_verification_documents')
        .select('*')
        .eq('vendor_id', vendor.vendor_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!vendor?.vendor_id
  });

  // Document verification mutation
  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ documentId, status, reason }: { 
      documentId: string; 
      status: string; 
      reason?: string 
    }) => {
      const { data: user } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('vendor_verification_documents')
        .update({
          verification_status: status,
          verified_by: user.user?.id,
          verified_at: new Date().toISOString(),
          rejection_reason: reason || null
        })
        .eq('id', documentId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Success", "Document verification status updated");
      queryClient.invalidateQueries({ queryKey: ['vendor-verification-documents'] });
      setIsDialogOpen(false);
      setVerificationAction("");
      setRejectionReason("");
    },
    onError: () => {
      showError("Error", "Failed to update document verification");
    }
  });

  const handleVerifyDocument = () => {
    if (!selectedDocument || !verificationAction) return;
    
    verifyDocumentMutation.mutate({
      documentId: selectedDocument.id,
      status: verificationAction,
      reason: rejectionReason
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const documentTypes = {
    ktp: 'KTP (ID Card)',
    npwp: 'NPWP (Tax ID)',
    siup: 'SIUP (Business License)',
    skdp: 'SKDP',
    skt: 'SKT',
    iujk: 'IUJK',
    bpjs_ketenagakerjaan: 'BPJS Ketenagakerjaan',
    bpjs_kesehatan: 'BPJS Kesehatan',
    akta_notaris: 'Akta Notaris',
    tdp: 'TDP',
    domisili_usaha: 'Domisili Usaha',
    izin_gangguan: 'Izin Gangguan'
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading verification documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Document Verification</h3>
          <p className="text-sm text-muted-foreground">
            Indonesian compliance documents for {vendor?.business_name}
          </p>
        </div>
      </div>

      {/* Document Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Documents</p>
                <p className="text-2xl font-bold">{documents?.length || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Verified</p>
                <p className="text-2xl font-bold text-green-600">
                  {documents?.filter(d => d.verification_status === 'verified').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-orange-600">
                  {documents?.filter(d => d.verification_status === 'pending').length || 0}
                </p>
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
                <p className="text-2xl font-bold text-red-600">
                  {documents?.filter(d => d.verification_status === 'rejected').length || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Documents</CardTitle>
          <CardDescription>Review and verify Indonesian compliance documents</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document Type</TableHead>
                <TableHead>Document Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents?.map((document) => (
                <TableRow key={document.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {documentTypes[document.document_type as keyof typeof documentTypes] || document.document_type}
                      </p>
                      {document.expiry_date && (
                        <p className="text-sm text-muted-foreground">
                          Expires: {new Date(document.expiry_date).toLocaleDateString('id-ID')}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="font-mono text-sm">{document.document_number || 'N/A'}</p>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(document.verification_status)}
                    {document.rejection_reason && (
                      <p className="text-xs text-red-600 mt-1">{document.rejection_reason}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">
                      {new Date(document.uploaded_at).toLocaleDateString('id-ID')}
                    </p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {document.document_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(document.document_url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedDocument(document)}
                          >
                            Verify
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Verify Document: {documentTypes[selectedDocument?.document_type as keyof typeof documentTypes]}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Verification Action</label>
                              <Select value={verificationAction} onValueChange={setVerificationAction}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select verification action" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="verified">Approve Document</SelectItem>
                                  <SelectItem value="rejected">Reject Document</SelectItem>
                                  <SelectItem value="pending">Mark as Pending</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {verificationAction === 'rejected' && (
                              <div>
                                <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                                <Textarea
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                  placeholder="Explain why this document is being rejected..."
                                />
                              </div>
                            )}
                            
                            <Button onClick={handleVerifyDocument} className="w-full">
                              Apply Verification
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {!documents?.length && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No verification documents found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorVerificationPanel;