import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// ── Types ──

export type DocumentType =
  | 'booking_form' | 'offer_agreement' | 'rental_contract'
  | 'reservation_form' | 'shm' | 'ajb' | 'ppjb'
  | 'power_of_attorney' | 'other';

export type DocumentStatus =
  | 'draft' | 'pending_review' | 'awaiting_signatures'
  | 'partially_signed' | 'completed' | 'expired' | 'cancelled';

export type SignatureStatus = 'pending' | 'viewed' | 'signed' | 'rejected' | 'expired';

export type SignerRole = 'buyer' | 'seller' | 'agent' | 'developer' | 'legal_consultant' | 'notary' | 'witness';

export interface TransactionDocument {
  id: string;
  property_id: string | null;
  offer_id: string | null;
  booking_id: string | null;
  legal_request_id: string | null;
  document_number: string;
  document_type: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  status: DocumentStatus;
  requires_signature: boolean;
  signature_order: { user_id: string; role: string; order: number }[];
  current_signer_index: number;
  expires_at: string | null;
  completed_at: string | null;
  version: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DocumentSignature {
  id: string;
  document_id: string;
  signer_id: string;
  signer_role: string;
  signer_name: string | null;
  signer_email: string | null;
  status: SignatureStatus;
  signature_data: string | null;
  signature_image_url: string | null;
  signed_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  sign_order: number;
  verification_code: string | null;
  verified_at: string | null;
  notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AuditEntry {
  id: string;
  document_id: string;
  action: string;
  performed_by: string | null;
  performer_name: string | null;
  ip_address: string | null;
  details: Record<string, any>;
  created_at: string;
}

// ── Document type labels ──

export const DOCUMENT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  booking_form: { label: 'Booking Form', icon: '📋' },
  offer_agreement: { label: 'Offer Agreement', icon: '🤝' },
  rental_contract: { label: 'Rental Contract', icon: '🏠' },
  reservation_form: { label: 'Reservation Form', icon: '📝' },
  shm: { label: 'SHM Certificate', icon: '📜' },
  ajb: { label: 'AJB (Sale Agreement)', icon: '⚖️' },
  ppjb: { label: 'PPJB (Pre-Sale)', icon: '📄' },
  power_of_attorney: { label: 'Power of Attorney', icon: '🔏' },
  other: { label: 'Other Document', icon: '📎' },
};

export const STATUS_LABELS: Record<DocumentStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  pending_review: { label: 'Pending Review', color: 'bg-chart-4/20 text-chart-4' },
  awaiting_signatures: { label: 'Awaiting Signatures', color: 'bg-chart-3/20 text-chart-3' },
  partially_signed: { label: 'Partially Signed', color: 'bg-chart-5/20 text-chart-5' },
  completed: { label: 'Completed', color: 'bg-chart-2/20 text-chart-2' },
  expired: { label: 'Expired', color: 'bg-destructive/20 text-destructive' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive' },
};

// ── Hooks ──

export const useMyDocuments = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['transaction-documents', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('transaction_documents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TransactionDocument[];
    },
    enabled: !!user?.id,
  });
};

export const useDocumentById = (docId: string | undefined) => {
  return useQuery({
    queryKey: ['transaction-document', docId],
    queryFn: async () => {
      if (!docId) return null;
      const { data, error } = await supabase
        .from('transaction_documents')
        .select('*')
        .eq('id', docId)
        .single();
      if (error) throw error;
      return data as TransactionDocument;
    },
    enabled: !!docId,
  });
};

export const useDocumentSignatures = (docId: string | undefined) => {
  return useQuery({
    queryKey: ['document-signatures', docId],
    queryFn: async () => {
      if (!docId) return [];
      const { data, error } = await supabase
        .from('document_signatures')
        .select('*')
        .eq('document_id', docId)
        .order('sign_order', { ascending: true });
      if (error) throw error;
      return data as DocumentSignature[];
    },
    enabled: !!docId,
  });
};

export const useDocumentAuditTrail = (docId: string | undefined) => {
  return useQuery({
    queryKey: ['document-audit', docId],
    queryFn: async () => {
      if (!docId) return [];
      const { data, error } = await supabase
        .from('document_audit_trail')
        .select('*')
        .eq('document_id', docId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AuditEntry[];
    },
    enabled: !!docId,
  });
};

// ── Upload document ──

export const useUploadTransactionDocument = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      file: File;
      title: string;
      documentType: DocumentType;
      description?: string;
      propertyId?: string;
      offerId?: string;
      bookingId?: string;
      legalRequestId?: string;
      requiresSignature?: boolean;
      signers?: { userId: string; role: SignerRole; name?: string; email?: string }[];
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { file, title, documentType, description, propertyId, offerId, bookingId, legalRequestId, requiresSignature, signers } = params;

      // Upload file
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadErr } = await supabase.storage
        .from('transaction-documents')
        .upload(filePath, file);
      if (uploadErr) throw uploadErr;

      const { data: { publicUrl } } = supabase.storage
        .from('transaction-documents')
        .getPublicUrl(filePath);

      // Build signature order
      const signatureOrder = (signers || []).map((s, i) => ({
        user_id: s.userId,
        role: s.role,
        order: i,
      }));

      // Insert document
      const { data: doc, error } = await supabase
        .from('transaction_documents')
        .insert({
          uploaded_by: user.id,
          title,
          document_type: documentType,
          description: description || null,
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type || 'application/pdf',
          property_id: propertyId || null,
          offer_id: offerId || null,
          booking_id: bookingId || null,
          legal_request_id: legalRequestId || null,
          requires_signature: requiresSignature || false,
          signature_order: signatureOrder,
          status: requiresSignature ? 'awaiting_signatures' : 'draft',
        })
        .select()
        .single();
      if (error) throw error;

      // Create signature records
      if (requiresSignature && signers?.length) {
        const sigRecords = signers.map((s, i) => ({
          document_id: doc.id,
          signer_id: s.userId,
          signer_role: s.role,
          signer_name: s.name || null,
          signer_email: s.email || null,
          sign_order: i,
          status: 'pending' as const,
        }));
        const { error: sigErr } = await supabase
          .from('document_signatures')
          .insert(sigRecords);
        if (sigErr) throw sigErr;
      }

      // Audit trail
      await supabase.from('document_audit_trail').insert({
        document_id: doc.id,
        action: 'document_uploaded',
        performed_by: user.id,
        details: { file_name: file.name, document_type: documentType, requires_signature: requiresSignature },
      });

      return doc as TransactionDocument;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transaction-documents'] });
      toast.success('Document uploaded successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

// ── Sign document ──

export const useSignDocument = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      documentId: string;
      signatureData: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { documentId, signatureData, notes } = params;

      // Update signature record
      const { error } = await supabase
        .from('document_signatures')
        .update({
          status: 'signed',
          signature_data: signatureData,
          signed_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
          notes: notes || null,
        })
        .eq('document_id', documentId)
        .eq('signer_id', user.id);
      if (error) throw error;

      // Check if all signatures collected
      const { data: allSigs } = await supabase
        .from('document_signatures')
        .select('status')
        .eq('document_id', documentId);

      const allSigned = allSigs?.every(s => s.status === 'signed');
      const someSigned = allSigs?.some(s => s.status === 'signed');

      // Update document status
      const newStatus = allSigned ? 'completed' : someSigned ? 'partially_signed' : 'awaiting_signatures';
      await supabase
        .from('transaction_documents')
        .update({
          status: newStatus,
          completed_at: allSigned ? new Date().toISOString() : null,
          current_signer_index: allSigned ? (allSigs?.length || 0) : (allSigs?.filter(s => s.status === 'signed').length || 0),
        })
        .eq('id', documentId);

      // Audit
      await supabase.from('document_audit_trail').insert({
        document_id: documentId,
        action: 'document_signed',
        performed_by: user.id,
        details: { all_signed: allSigned },
      });

      return { allSigned };
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['transaction-documents'] });
      qc.invalidateQueries({ queryKey: ['document-signatures'] });
      toast.success(result.allSigned ? 'Document fully signed!' : 'Signature recorded');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};

// ── Reject signature ──

export const useRejectSignature = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, reason }: { documentId: string; reason: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      await supabase
        .from('document_signatures')
        .update({ status: 'rejected', notes: reason })
        .eq('document_id', documentId)
        .eq('signer_id', user.id);

      await supabase.from('document_audit_trail').insert({
        document_id: documentId,
        action: 'signature_rejected',
        performed_by: user.id,
        details: { reason },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transaction-documents'] });
      qc.invalidateQueries({ queryKey: ['document-signatures'] });
      toast.success('Signature rejected');
    },
    onError: (err: Error) => toast.error(err.message),
  });
};
