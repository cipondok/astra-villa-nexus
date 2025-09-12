import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, MessageCircle, Lock, Unlock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CategoryChangeRequest {
  id: string;
  vendor_id: string;
  request_type: string;
  reason: string;
  status: string;
  created_at: string;
  current_data: any;
  requested_data: any;
  admin_notes?: string;
  profiles: {
    full_name: string;
    email: string;
    vendor_business_profiles: {
      business_name: string;
      business_email: string;
    }[];
  };
}

const VendorCategoryChangeRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<CategoryChangeRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');

  // Fetch change requests
  const { data: requests, isLoading } = useQuery({
    queryKey: ['vendor-category-change-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_change_requests')
        .select(`
          *,
          profiles!vendor_id(
            full_name,
            email,
            vendor_business_profiles!vendor_id(business_name, business_email)
          )
        `)
        .eq('request_type', 'main_category_change')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    }
  });

  // Fetch main categories for new category selection
  const { data: mainCategories } = useQuery({
    queryKey: ['main-categories-for-change'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendor_main_categories')
        .select('id, name, description, type')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Approve request mutation
  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, vendorId, newCategoryId, notes }: {
      requestId: string;
      vendorId: string;
      newCategoryId?: string;
      notes: string;
    }) => {
      // First unlock the vendor's main category
      const { error: unlockError } = await supabase.rpc('unlock_vendor_main_category', {
        p_vendor_id: vendorId,
        p_reason: notes || 'Approved by admin for category change'
      });

      if (unlockError) throw unlockError;

      // If new category is specified, update it
      if (newCategoryId) {
        const { error: updateError } = await supabase
          .from('vendor_business_profiles')
          .update({
            main_service_category_id: newCategoryId,
            main_category_locked: true,
            main_category_locked_at: new Date().toISOString(),
            main_category_locked_by: user?.id,
            category_change_reason: notes
          })
          .eq('vendor_id', vendorId);

        if (updateError) throw updateError;
      }

      // Update request status
      const { error: requestError } = await supabase
        .from('vendor_change_requests')
        .update({
          status: 'approved',
          admin_notes: notes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (requestError) throw requestError;
    },
    onSuccess: () => {
      toast.success('Permintaan disetujui dan kategori berhasil diperbarui');
      queryClient.invalidateQueries({ queryKey: ['vendor-category-change-requests'] });
      setSelectedRequest(null);
      setAdminNotes('');
      setNewCategoryId('');
    },
    onError: (error: any) => {
      toast.error('Gagal menyetujui permintaan: ' + error.message);
    }
  });

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes: string }) => {
      const { error } = await supabase
        .from('vendor_change_requests')
        .update({
          status: 'rejected',
          admin_notes: notes,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Permintaan ditolak');
      queryClient.invalidateQueries({ queryKey: ['vendor-category-change-requests'] });
      setSelectedRequest(null);
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast.error('Gagal menolak permintaan: ' + error.message);
    }
  });

  const handleApprove = () => {
    if (!selectedRequest) return;
    
    approveRequestMutation.mutate({
      requestId: selectedRequest.id,
      vendorId: selectedRequest.vendor_id,
      newCategoryId,
      notes: adminNotes
    });
  };

  const handleReject = () => {
    if (!selectedRequest || !adminNotes.trim()) {
      toast.error('Catatan admin diperlukan untuk penolakan');
      return;
    }
    
    rejectRequestMutation.mutate({
      requestId: selectedRequest.id,
      notes: adminNotes
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600"><Clock className="h-3 w-3 mr-1" />Menunggu</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600"><CheckCircle className="h-3 w-3 mr-1" />Disetujui</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600"><XCircle className="h-3 w-3 mr-1" />Ditolak</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Permintaan Perubahan Kategori</h2>
          <p className="text-muted-foreground">
            Kelola permintaan vendor untuk mengubah kategori utama layanan
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Memuat permintaan...</span>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests?.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Belum ada permintaan perubahan kategori</p>
              </CardContent>
            </Card>
          ) : (
            requests?.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {request.profiles?.vendor_business_profiles?.[0]?.business_name || 
                         request.profiles?.full_name}
                      </CardTitle>
                      <CardDescription>
                        {request.profiles?.email} • {new Date(request.created_at).toLocaleDateString('id-ID')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(request.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Alasan Permintaan:</p>
                      <p className="text-sm">{request.reason}</p>
                    </div>
                    
                    {request.current_data?.main_category_name && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Kategori Saat Ini:</p>
                        <Badge variant="outline">{request.current_data.main_category_name}</Badge>
                      </div>
                    )}

                    {request.admin_notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Catatan Admin:</p>
                        <p className="text-sm text-blue-700">{request.admin_notes}</p>
                      </div>
                    )}

                    {request.status === 'pending' && (
                      <div className="flex gap-2 pt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              onClick={() => setSelectedRequest(request)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Unlock className="h-4 w-4 mr-2" />
                              Proses Permintaan
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Proses Permintaan Perubahan Kategori</DialogTitle>
                              <DialogDescription>
                                Tinjau dan proses permintaan dari {request.profiles?.vendor_business_profiles?.[0]?.business_name || request.profiles?.full_name}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div>
                                <Label>Pilih Kategori Baru (Opsional)</Label>
                                <Select value={newCategoryId} onValueChange={setNewCategoryId}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori baru atau biarkan vendor memilih" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mainCategories?.map((category) => (
                                      <SelectItem key={category.id} value={category.id}>
                                        {category.name} ({category.type === 'products' ? 'Produk' : 'Layanan'})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label htmlFor="adminNotes">Catatan Admin *</Label>
                                <Textarea
                                  id="adminNotes"
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Berikan catatan atau alasan untuk keputusan..."
                                  rows={3}
                                />
                              </div>

                              <div className="flex gap-3 justify-end">
                                <Button
                                  variant="destructive"
                                  onClick={handleReject}
                                  disabled={rejectRequestMutation.isPending}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Tolak
                                </Button>
                                <Button
                                  onClick={handleApprove}
                                  disabled={approveRequestMutation.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Setujui
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default VendorCategoryChangeRequests;