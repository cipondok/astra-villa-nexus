import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  User,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminKYCReview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVerification, setSelectedVerification] = useState<any>(null);
  const [previewDoc, setPreviewDoc] = useState<{ url: string; type: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch document verifications with vendor details
  const { data: documentVerifications, isLoading: documentsLoading } = useQuery({
    queryKey: ['admin-document-verifications', statusFilter, searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('vendor_document_verifications')
        .select(`
          *,
          profiles!vendor_document_verifications_vendor_id_fkey(full_name, email, phone)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('verification_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by search term if provided
      if (searchTerm) {
        return data.filter(item => 
          item.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return data;
    },
  });

  // Fetch BPJS verifications using secure function (disabled for security)
  const { data: bpjsVerifications, isLoading: bpjsLoading } = useQuery({
    queryKey: ['admin-bpjs-verifications', statusFilter, searchTerm],
    queryFn: async () => {
      // BPJS verification access has been disabled for security
      // Direct table access is no longer allowed
      toast({
        title: "Security Notice",
        description: "BPJS verification data access requires enhanced security clearance",
        variant: "destructive"
      });
      return [];
    },
  });

  // Update document verification status
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('vendor_document_verifications')
        .update({
          verification_status: status,
          verification_details: notes ? { admin_notes: notes } : undefined,
          verified_at: status === 'verified' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-document-verifications'] });
      toast({
        title: 'Document Updated',
        description: 'Document verification status has been updated.',
      });
      setSelectedVerification(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update document status',
        variant: 'destructive',
      });
    }
  });

  // Update BPJS verification status - disabled for security
  const updateBPJSMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      // Direct BPJS table modifications are blocked for security
      throw new Error("BPJS verification updates require enhanced security protocols. Contact system administrator.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bpjs-verifications'] });
      toast({
        title: 'BPJS Updated',
        description: 'BPJS verification status has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update BPJS status',
        variant: 'destructive',
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      verified: 'default',
      pending: 'secondary',
      rejected: 'destructive'
    };

    const colors: Record<string, string> = {
      verified: 'text-green-600',
      pending: 'text-yellow-600',
      rejected: 'text-red-600'
    };

    return (
      <Badge variant={variants[status] || 'secondary'} className={colors[status]}>
        {status.toUpperCase()}
      </Badge>
    );
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
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
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

  const handleDocumentReview = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string;

    if (!selectedVerification) return;

    updateDocumentMutation.mutate({
      id: selectedVerification.id,
      status,
      notes: notes || undefined
    });
  };

  const quickStatusUpdate = (verification: any, status: string, type: 'document' | 'bpjs') => {
    if (type === 'document') {
      updateDocumentMutation.mutate({ id: verification.id, status });
    } else {
      updateBPJSMutation.mutate({ id: verification.id, status });
    }
  };

  if (documentsLoading || bpjsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KYC Review Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                KYC Review Panel
              </CardTitle>
              <CardDescription>
                Review and approve vendor document and BPJS verifications
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">
                  {(documentVerifications?.filter(doc => doc.verification_status === 'pending').length || 0) +
                   (bpjsVerifications?.filter(bpjs => bpjs.verification_status === 'pending').length || 0)}
                </div>
                <div className="text-xs text-muted-foreground">Pending Review</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="documents">Document Verifications</TabsTrigger>
          <TabsTrigger value="bpjs">BPJS Verifications</TabsTrigger>
        </TabsList>

        {/* Document Verifications Tab */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Verifications</CardTitle>
              <CardDescription>
                Review uploaded business documents from vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!documentVerifications || documentVerifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No document verifications found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Document Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentVerifications.map((verification) => (
                      <TableRow key={verification.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {verification.profiles?.full_name || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {verification.profiles?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            {verification.document_type.toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(verification.verification_status)}
                            {getStatusBadge(verification.verification_status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(verification.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => previewDocument(verification)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedVerification(verification)}
                            >
                              Review
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem
                                  onClick={() => quickStatusUpdate(verification, 'verified', 'document')}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Quick Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => quickStatusUpdate(verification, 'rejected', 'document')}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Quick Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BPJS Verifications Tab */}
        <TabsContent value="bpjs">
          <Card>
            <CardHeader>
              <CardTitle>BPJS Verifications</CardTitle>
              <CardDescription>
                Review BPJS Kesehatan and Ketenagakerjaan verifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!bpjsVerifications || bpjsVerifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No BPJS verifications found
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>BPJS Type</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Verified</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bpjsVerifications.map((verification) => (
                      <TableRow key={verification.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {verification.vendor_id}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              BPJS: {verification.bpjs_type}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {verification.bpjs_type === 'kesehatan' ? 'Kesehatan' : 'Ketenagakerjaan'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-sm">{verification.verification_number}</code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(verification.verification_status)}
                            {getStatusBadge(verification.verification_status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {verification.verified_at 
                            ? new Date(verification.verified_at).toLocaleDateString()
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem
                                onClick={() => quickStatusUpdate(verification, 'verified', 'bpjs')}
                                className="text-green-600"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => quickStatusUpdate(verification, 'rejected', 'bpjs')}
                                className="text-red-600"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document Review Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Document Verification</DialogTitle>
            <DialogDescription>
              Review and update the status of this document verification
            </DialogDescription>
          </DialogHeader>
          {selectedVerification && (
            <form onSubmit={handleDocumentReview} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Vendor</Label>
                  <div className="text-sm">
                    {selectedVerification.profiles?.full_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedVerification.profiles?.email}
                  </div>
                </div>
                <div>
                  <Label>Document Type</Label>
                  <div className="text-sm">{selectedVerification.document_type.toUpperCase()}</div>
                </div>
              </div>

              <div>
                <Label>Current Status</Label>
                <div className="mt-1">
                  {getStatusBadge(selectedVerification.verification_status)}
                </div>
              </div>

              <div>
                <Label htmlFor="status">New Status</Label>
                <Select name="status" defaultValue={selectedVerification.verification_status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Admin Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add notes for the vendor..."
                  defaultValue={(selectedVerification.verification_details as any)?.admin_notes || ''}
                />
              </div>

              <div className="flex items-center gap-2 pt-4">
                <Button type="submit" disabled={updateDocumentMutation.isPending}>
                  {updateDocumentMutation.isPending ? 'Updating...' : 'Update Status'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => previewDocument(selectedVerification)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Document
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminKYCReview;