import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VerificationSummary {
  document_count: number;
  verified_documents: number;
  pending_documents: number;
  rejected_documents: number;
  kyc_status: string;
  kyc_level: string;
  overall_score: number;
}

export const useSecureIdentityVerification = () => {
  const [loading, setLoading] = useState(false);
  const [verificationSummary, setVerificationSummary] = useState<VerificationSummary | null>(null);

  const getVerificationSummary = async (vendorId: string) => {
    if (!vendorId) {
      toast.error('Vendor ID is required');
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_vendor_verification_summary', {
        p_vendor_id: vendorId
      });

      if (error) {
        console.error('Error fetching verification summary:', error);
        if (error.message.includes('Insufficient permissions')) {
          toast.error('Access denied: Admin privileges required');
        } else {
          toast.error('Failed to fetch verification summary');
        }
        return null;
      }

      const summary = data?.[0] as VerificationSummary;
      setVerificationSummary(summary);
      return summary;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (
    documentId: string, 
    status: 'verified' | 'rejected' | 'pending',
    rejectionReason?: string
  ) => {
    if (!documentId || !status) {
      toast.error('Document ID and status are required');
      return false;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('update_verification_status', {
        p_document_id: documentId,
        p_status: status,
        p_rejection_reason: rejectionReason || null
      });

      if (error) {
        console.error('Error updating verification status:', error);
        if (error.message.includes('Insufficient permissions')) {
          toast.error('Access denied: Admin privileges required');
        } else if (error.message.includes('Invalid verification status')) {
          toast.error('Invalid verification status provided');
        } else if (error.message.includes('Document not found')) {
          toast.error('Document not found');
        } else {
          toast.error('Failed to update verification status');
        }
        return false;
      }

      toast.success(`Document ${status} successfully`);
      return data === true;
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const maskDocumentNumber = async (documentNumber: string) => {
    if (!documentNumber) return '';

    try {
      const { data, error } = await supabase.rpc('mask_document_number', {
        doc_number: documentNumber
      });

      if (error) {
        console.error('Error masking document number:', error);
        return '***masked***';
      }

      return data || '***masked***';
    } catch (error) {
      console.error('Unexpected error masking document:', error);
      return '***masked***';
    }
  };

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('check_admin_access');
      if (error) {
        console.error('Error checking admin access:', error);
        return false;
      }

      return data === true;
    } catch (error) {
      console.error('Error checking admin access:', error);
      return false;
    }
  };

  return {
    loading,
    verificationSummary,
    getVerificationSummary,
    updateVerificationStatus,
    maskDocumentNumber,
    checkAdminAccess
  };
};