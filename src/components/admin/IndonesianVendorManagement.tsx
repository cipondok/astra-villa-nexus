import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAlert } from "@/contexts/AlertContext";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  FileText, 
  MapPin, 
  Banknote,
  Building,
  Users,
  TrendingUp,
  Filter,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

interface IndonesianVendorApplication {
  id: string;
  user_id: string;
  vendor_type: 'product' | 'service';
  application_status: string;
  business_name: string;
  business_type: string;
  nomor_npwp?: string;
  nomor_skt?: string;
  nomor_iujk?: string;
  siup_number?: string;
  bpjs_ketenagakerjaan: boolean;
  bpjs_kesehatan: boolean;
  umkm_status: boolean;
  fraud_score: number;
  rejection_reason?: string;
  compliance_region: string;
  created_at: string;
  updated_at: string;
  business_address?: any;
  contact_info?: any;
}

interface RejectionCode {
  code: string;
  category: string;
  reason_id: string;
  description_id: string;
  resolution_steps_id: string[];
}

const IndonesianVendorManagement = () => {
  const [selectedApplication, setSelectedApplication] = useState<IndonesianVendorApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVendorType, setFilterVendorType] = useState<string>('all');
  const [filterBPJS, setFilterBPJS] = useState<string>('all');
  const [language, setLanguage] = useState<'en' | 'id'>('id');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | ''>('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedRejectionCodes, setSelectedRejectionCodes] = useState<string[]>([]);

  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch Indonesian vendor applications
  const { data: applications, isLoading } = useQuery({
    queryKey: ['indonesian-vendor-applications', filterStatus, filterVendorType, filterBPJS],
    queryFn: async () => {
      let query = supabase
        .from('vendor_applications')
        .select('*')
        .eq('compliance_region', 'ID')
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('application_status', filterStatus);
      }

      if (filterVendorType !== 'all') {
        query = query.eq('vendor_type', filterVendorType);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Additional BPJS filtering
      let filteredData = data || [];
      if (filterBPJS === 'with_bpjs') {
        filteredData = filteredData.filter(app => app.bpjs_ketenagakerjaan === true);
      } else if (filterBPJS === 'without_bpjs') {
        filteredData = filteredData.filter(app => app.bpjs_ketenagakerjaan === false);
      }

      return filteredData as IndonesianVendorApplication[];
    }
  });

  // Fetch Indonesian rejection codes
  const { data: rejectionCodes } = useQuery({
    queryKey: ['indonesian-rejection-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indonesian_rejection_codes')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) throw error;
      return data as RejectionCode[];
    }
  });

  // Review application mutation
  const reviewApplicationMutation = useMutation({
    mutationFn: async ({ applicationId, action, reason, codes }: {
      applicationId: string;
      action: 'approve' | 'reject';
      reason?: string;
      codes?: string[];
    }) => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error('Not authenticated');

      const updateData: any = {
        application_status: action === 'approve' ? 'approved' : 'rejected',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      };

      if (action === 'reject') {
        updateData.rejection_reason = reason;
        updateData.rejection_details = {
          codes: codes || [],
          reason: reason,
          reviewed_at: new Date().toISOString()
        };
      } else {
        // If approving, create vendor business profile
        const application = applications?.find(app => app.id === applicationId);
        if (application) {
          await supabase
            .from('vendor_business_profiles')
            .insert({
              vendor_id: application.user_id,
              business_name: application.business_name,
              business_type: application.business_type,
              business_address: application.business_address?.street || '',
              business_phone: application.contact_info?.phone || '',
              business_email: application.contact_info?.email || '',
              is_verified: true,
              is_active: true
            });
        }
      }

      const { error } = await supabase
        .from('vendor_applications')
        .update(updateData)
        .eq('id', applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess("Sukses", `Aplikasi berhasil ${reviewAction === 'approve' ? 'disetujui' : 'ditolak'}`);
      setReviewDialogOpen(false);
      setSelectedApplication(null);
      setReviewAction('');
      setRejectionReason('');
      setSelectedRejectionCodes([]);
      queryClient.invalidateQueries({ queryKey: ['indonesian-vendor-applications'] });
    },
    onError: (error: any) => {
      showError("Error", `Gagal memproses aplikasi: ${error.message}`);
    }
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-500', text: language === 'id' ? 'Draft' : 'Draft', icon: Clock },
      submitted: { color: 'bg-blue-500', text: language === 'id' ? 'Diajukan' : 'Submitted', icon: Clock },
      under_review: { color: 'bg-yellow-500', text: language === 'id' ? 'Ditinjau' : 'Under Review', icon: Clock },
      approved: { color: 'bg-green-500', text: language === 'id' ? 'Disetujui' : 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-500', text: language === 'id' ? 'Ditolak' : 'Rejected', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const calculateCompletionScore = (application: IndonesianVendorApplication): number => {
    let score = 0;
    const totalFields = 10;

    if (application.business_name) score += 1;
    if (application.business_type) score += 1;
    if (application.nomor_npwp) score += 1;
    if (application.business_address) score += 1;
    if (application.bpjs_ketenagakerjaan) score += 1;
    if (application.vendor_type === 'service' && application.nomor_skt) score += 1;
    if (application.vendor_type === 'service' && application.nomor_iujk) score += 1;
    if (application.siup_number) score += 1;
    if (application.contact_info) score += 1;
    if (application.application_status !== 'draft') score += 1;

    return Math.round((score / totalFields) * 100);
  };

  const renderApplicationDetails = (application: IndonesianVendorApplication) => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Nama Usaha' : 'Business Name'}
                </p>
                <p className="font-semibold">{application.business_name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Tipe Vendor' : 'Vendor Type'}
                </p>
                <p className="font-semibold capitalize">{application.vendor_type}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Skor Kelengkapan' : 'Completion Score'}
                </p>
                <p className="font-semibold">{calculateCompletionScore(application)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {language === 'id' ? 'Informasi Perpajakan' : 'Tax Information'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-sm text-muted-foreground">NPWP</Label>
              <p className="font-medium">{application.nomor_npwp || '-'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">SIUP</Label>
              <p className="font-medium">{application.siup_number || '-'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                {language === 'id' ? 'Status UMKM' : 'UMKM Status'}
              </Label>
              <Badge variant={application.umkm_status ? "default" : "secondary"}>
                {application.umkm_status 
                  ? (language === 'id' ? 'Ya' : 'Yes')
                  : (language === 'id' ? 'Tidak' : 'No')
                }
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              {language === 'id' ? 'Status BPJS' : 'BPJS Status'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">BPJS Ketenagakerjaan</Label>
              <Badge variant={application.bpjs_ketenagakerjaan ? "default" : "destructive"}>
                {application.bpjs_ketenagakerjaan ? '✓ Aktif' : '✗ Tidak Aktif'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">BPJS Kesehatan</Label>
              <Badge variant={application.bpjs_kesehatan ? "default" : "secondary"}>
                {application.bpjs_kesehatan ? '✓ Aktif' : '✗ Tidak Aktif'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {application.vendor_type === 'service' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {language === 'id' ? 'Lisensi Jasa' : 'Service Licenses'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">SKT (Listrik)</Label>
                <p className="font-medium">{application.nomor_skt || '-'}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">IUJK (Konstruksi)</Label>
                <p className="font-medium">{application.nomor_iujk || '-'}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              {language === 'id' ? 'Analisis Risiko' : 'Risk Analysis'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Skor Fraud' : 'Fraud Score'}
                </Label>
                <Badge 
                  variant={
                    application.fraud_score > 70 ? "destructive" : 
                    application.fraud_score > 40 ? "secondary" : 
                    "default"
                  }
                >
                  {application.fraud_score}/100
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    application.fraud_score > 70 ? 'bg-red-500' :
                    application.fraud_score > 40 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${application.fraud_score}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReviewDialog = () => (
    <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {reviewAction === 'approve' 
              ? (language === 'id' ? 'Setujui Aplikasi' : 'Approve Application')
              : (language === 'id' ? 'Tolak Aplikasi' : 'Reject Application')
            }
          </DialogTitle>
          <DialogDescription>
            {selectedApplication?.business_name} - {selectedApplication?.vendor_type}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {reviewAction === 'reject' && (
            <>
              <div>
                <Label htmlFor="rejection_reason">
                  {language === 'id' ? 'Alasan Penolakan' : 'Rejection Reason'}
                </Label>
                <Textarea
                  id="rejection_reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={language === 'id' 
                    ? 'Jelaskan alasan penolakan...'
                    : 'Explain rejection reason...'
                  }
                  rows={3}
                />
              </div>

              <div>
                <Label>
                  {language === 'id' ? 'Kode Penolakan' : 'Rejection Codes'}
                </Label>
                <div className="grid grid-cols-1 gap-2 mt-2 max-h-40 overflow-y-auto">
                  {rejectionCodes?.map((code) => (
                    <div key={code.code} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={code.code}
                        checked={selectedRejectionCodes.includes(code.code)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRejectionCodes(prev => [...prev, code.code]);
                          } else {
                            setSelectedRejectionCodes(prev => prev.filter(c => c !== code.code));
                          }
                        }}
                      />
                      <Label htmlFor={code.code} className="text-sm">
                        <span className="font-medium">{code.code}</span> - {code.reason_id}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <Button
              onClick={() => {
                if (selectedApplication) {
                  reviewApplicationMutation.mutate({
                    applicationId: selectedApplication.id,
                    action: reviewAction as 'approve' | 'reject',
                    reason: rejectionReason,
                    codes: selectedRejectionCodes
                  });
                }
              }}
              disabled={reviewApplicationMutation.isPending}
              variant={reviewAction === 'approve' ? 'default' : 'destructive'}
            >
              {reviewAction === 'approve' 
                ? (language === 'id' ? 'Setujui' : 'Approve')
                : (language === 'id' ? 'Tolak' : 'Reject')
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'id' ? 'Manajemen Vendor Indonesia' : 'Indonesian Vendor Management'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'id' 
              ? 'Kelola aplikasi vendor sesuai regulasi Indonesia'
              : 'Manage vendor applications according to Indonesian regulations'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={(value: 'en' | 'id') => setLanguage(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="id">Bahasa</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Total Aplikasi' : 'Total Applications'}
                </p>
                <p className="text-2xl font-bold">{applications?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Menunggu Review' : 'Pending Review'}
                </p>
                <p className="text-2xl font-bold">
                  {applications?.filter(app => app.application_status === 'submitted').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Disetujui' : 'Approved'}
                </p>
                <p className="text-2xl font-bold">
                  {applications?.filter(app => app.application_status === 'approved').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Banknote className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'id' ? 'Dengan BPJS' : 'With BPJS'}
                </p>
                <p className="text-2xl font-bold">
                  {applications?.filter(app => app.bpjs_ketenagakerjaan).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Label className="text-sm">
                {language === 'id' ? 'Filter:' : 'Filters:'}
              </Label>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={language === 'id' ? 'Status' : 'Status'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'id' ? 'Semua Status' : 'All Status'}</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">{language === 'id' ? 'Diajukan' : 'Submitted'}</SelectItem>
                <SelectItem value="under_review">{language === 'id' ? 'Ditinjau' : 'Under Review'}</SelectItem>
                <SelectItem value="approved">{language === 'id' ? 'Disetujui' : 'Approved'}</SelectItem>
                <SelectItem value="rejected">{language === 'id' ? 'Ditolak' : 'Rejected'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterVendorType} onValueChange={setFilterVendorType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={language === 'id' ? 'Tipe Vendor' : 'Vendor Type'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'id' ? 'Semua Tipe' : 'All Types'}</SelectItem>
                <SelectItem value="product">{language === 'id' ? 'Produk' : 'Product'}</SelectItem>
                <SelectItem value="service">{language === 'id' ? 'Jasa' : 'Service'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBPJS} onValueChange={setFilterBPJS}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="BPJS Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'id' ? 'Semua BPJS' : 'All BPJS'}</SelectItem>
                <SelectItem value="with_bpjs">{language === 'id' ? 'Dengan BPJS' : 'With BPJS'}</SelectItem>
                <SelectItem value="without_bpjs">{language === 'id' ? 'Tanpa BPJS' : 'Without BPJS'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'id' ? 'Aplikasi Vendor' : 'Vendor Applications'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">
                {language === 'id' ? 'Memuat...' : 'Loading...'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{language === 'id' ? 'Nama Usaha' : 'Business Name'}</TableHead>
                  <TableHead>{language === 'id' ? 'Tipe' : 'Type'}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>BPJS</TableHead>
                  <TableHead>{language === 'id' ? 'Skor' : 'Score'}</TableHead>
                  <TableHead>{language === 'id' ? 'Tanggal' : 'Date'}</TableHead>
                  <TableHead>{language === 'id' ? 'Aksi' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.business_name}
                    </TableCell>
                    <TableCell className="capitalize">
                      {application.vendor_type}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(application.application_status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge 
                          variant={application.bpjs_ketenagakerjaan ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {application.bpjs_ketenagakerjaan ? '✓' : '✗'} TK
                        </Badge>
                        <Badge 
                          variant={application.bpjs_kesehatan ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {application.bpjs_kesehatan ? '✓' : '✗'} KS
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {calculateCompletionScore(application)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(application.created_at).toLocaleDateString('id-ID')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedApplication(application)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{application.business_name}</DialogTitle>
                              <DialogDescription>
                                {language === 'id' ? 'Detail Aplikasi Vendor' : 'Vendor Application Details'}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedApplication && renderApplicationDetails(selectedApplication)}
                          </DialogContent>
                        </Dialog>

                        {application.application_status === 'submitted' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setReviewAction('approve');
                                setReviewDialogOpen(true);
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedApplication(application);
                                setReviewAction('reject');
                                setReviewDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {renderReviewDialog()}
    </div>
  );
};

export default IndonesianVendorManagement;