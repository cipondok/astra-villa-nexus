import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { LegalServiceRequest, LegalServiceType, LegalServiceDocument, LegalServiceTimeline } from './types';

export const useLegalRequests = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['legal-requests', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('legal_service_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LegalServiceRequest[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateLegalRequest = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      service_type: LegalServiceType;
      title: string;
      description?: string;
      property_address?: string;
      priority?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      const { data: result, error } = await supabase
        .from('legal_service_requests')
        .insert({
          user_id: user.id,
          service_type: data.service_type,
          title: data.title,
          description: data.description || null,
          property_address: data.property_address || null,
          priority: data.priority || 'normal',
        })
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-requests'] });
      toast.success('Permintaan layanan legal berhasil dibuat!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useLegalRequestById = (requestId: string | undefined) => {
  return useQuery({
    queryKey: ['legal-request', requestId],
    queryFn: async () => {
      if (!requestId) return null;
      const { data, error } = await supabase
        .from('legal_service_requests')
        .select('*')
        .eq('id', requestId)
        .single();
      if (error) throw error;
      return data as LegalServiceRequest;
    },
    enabled: !!requestId,
  });
};

export const useLegalTimeline = (requestId: string | undefined) => {
  return useQuery({
    queryKey: ['legal-timeline', requestId],
    queryFn: async () => {
      if (!requestId) return [];
      const { data, error } = await supabase
        .from('legal_service_timeline')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as LegalServiceTimeline[];
    },
    enabled: !!requestId,
  });
};

export const useLegalDocuments = (requestId: string | undefined) => {
  return useQuery({
    queryKey: ['legal-documents', requestId],
    queryFn: async () => {
      if (!requestId) return [];
      const { data, error } = await supabase
        .from('legal_service_documents')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as LegalServiceDocument[];
    },
    enabled: !!requestId,
  });
};

export const useUploadLegalDocument = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId, file, notes }: { requestId: string; file: File; notes?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const filePath = `${user.id}/${requestId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('legal-documents')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('legal-documents')
        .getPublicUrl(filePath);

      const { error } = await supabase
        .from('legal_service_documents')
        .insert({
          request_id: requestId,
          document_name: file.name,
          document_url: publicUrl,
          document_type: file.type,
          uploaded_by: user.id,
          notes: notes || null,
        });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['legal-documents', variables.requestId] });
      toast.success('Dokumen berhasil diupload');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

export const useApproveFee = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('legal_service_requests')
        .update({
          fee_approved_at: new Date().toISOString(),
          fee_approved_by: user.id,
          status: 'awaiting_payment' as any,
        })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legal-requests'] });
      toast.success('Biaya disetujui');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
