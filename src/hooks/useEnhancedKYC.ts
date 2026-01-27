import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type VerificationType = 'basic' | 'standard' | 'enhanced';
export type DocumentType = 'ktp' | 'passport' | 'sim' | 'kitas';
export type KYCStatus = 'pending' | 'processing' | 'verified' | 'rejected' | 'expired' | 'manual_review';

export interface KYCVerification {
  id: string;
  user_id: string;
  verification_type: VerificationType;
  document_type: DocumentType | null;
  document_number: string | null;
  liveness_score: number | null;
  liveness_passed: boolean;
  face_match_score: number | null;
  face_match_passed: boolean;
  extracted_data: Record<string, any>;
  status: KYCStatus;
  rejection_reason: string | null;
  created_at: string;
  expires_at: string;
}

export interface SubmitKYCParams {
  verificationType: VerificationType;
  documentType: DocumentType;
  documentImageBase64?: string;
  selfieImageBase64?: string;
}

export interface KYCSubmissionResult {
  success: boolean;
  verification_id?: string;
  status?: KYCStatus;
  rejection_reason?: string | null;
  details?: {
    extraction?: {
      success: boolean;
      confidence: number;
      extracted_fields: string[];
    } | null;
    liveness?: {
      passed: boolean;
      score: number;
    } | null;
    face_match?: {
      passed: boolean;
      score: number;
    } | null;
  };
  error?: string;
}

export function useEnhancedKYC() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentVerification, setCurrentVerification] = useState<KYCVerification | null>(null);
  const [kycLevel, setKycLevel] = useState<VerificationType | 'none'>('none');

  const submitKYC = useCallback(async (params: SubmitKYCParams): Promise<KYCSubmissionResult> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-kyc', {
        body: {
          action: 'submit',
          verificationType: params.verificationType,
          documentType: params.documentType,
          documentImageBase64: params.documentImageBase64,
          selfieImageBase64: params.selfieImageBase64,
        },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      if (data.status === 'verified') {
        toast.success('KYC verification successful!');
        setKycLevel(params.verificationType);
      } else if (data.status === 'manual_review') {
        toast.info('Your verification is under review');
      } else if (data.status === 'rejected') {
        toast.error(data.rejection_reason || 'Verification failed');
      }

      return data;
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit KYC');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkStatus = useCallback(async (): Promise<void> => {
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-kyc', {
        body: { action: 'check_status' },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      setCurrentVerification(data.verification);
      setKycLevel(data.kyc_level || 'none');
    } catch (err: any) {
      console.error('Error checking KYC status:', err);
    }
  }, []);

  const verifyLiveness = useCallback(async (selfieBase64: string): Promise<{
    passed: boolean;
    score: number;
  } | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-kyc', {
        body: {
          action: 'verify_liveness',
          selfieImageBase64: selfieBase64,
        },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      return data.liveness;
    } catch (err: any) {
      toast.error(err.message || 'Liveness check failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const extractDocument = useCallback(async (
    documentBase64: string, 
    documentType: DocumentType
  ): Promise<{
    success: boolean;
    confidence: number;
    extracted_data: Record<string, any>;
  } | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-kyc', {
        body: {
          action: 'extract_document',
          documentImageBase64: documentBase64,
          documentType,
        },
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);

      return data.extraction;
    } catch (err: any) {
      toast.error(err.message || 'Document extraction failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getVerificationHistory = useCallback(async (): Promise<KYCVerification[]> => {
    try {
      const { data, error } = await supabase
        .from('kyc_verifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return (data || []) as unknown as KYCVerification[];
    } catch (err) {
      console.error('Error fetching verification history:', err);
      return [];
    }
  }, []);

  const getKYCLevelLabel = useCallback((level: VerificationType | 'none'): string => {
    switch (level) {
      case 'basic': return 'Basic Verified';
      case 'standard': return 'Standard Verified';
      case 'enhanced': return 'Fully Verified';
      default: return 'Not Verified';
    }
  }, []);

  const getKYCLevelColor = useCallback((level: VerificationType | 'none'): string => {
    switch (level) {
      case 'basic': return 'bg-blue-100 text-blue-700';
      case 'standard': return 'bg-green-100 text-green-700';
      case 'enhanced': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  }, []);

  return {
    isLoading,
    currentVerification,
    kycLevel,
    submitKYC,
    checkStatus,
    verifyLiveness,
    extractDocument,
    getVerificationHistory,
    getKYCLevelLabel,
    getKYCLevelColor,
  };
}
