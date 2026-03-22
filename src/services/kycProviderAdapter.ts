import { supabase } from '@/integrations/supabase/client';

export type KYCProvider = 'manual' | 'veriff' | 'sumsub' | 'persona';
export type VerificationStatus = 'pending' | 'verified' | 'manual_review' | 'rejected';

export interface KYCSubmission {
  userId: string;
  verificationType: string;
  documentType: string;
  documentImage?: string;
  selfieImage?: string;
}

export interface KYCResult {
  success: boolean;
  verificationId?: string;
  status: VerificationStatus;
  rejectionReason?: string | null;
  redirectUrl?: string; // For external providers (Veriff/Sumsub)
}

/** Abstract adapter — swap provider without changing calling code */
export const kycProviderAdapter = {
  async getActiveProvider(): Promise<{ name: KYCProvider; config: Record<string, any> }> {
    const { data } = await supabase
      .from('kyc_provider_config' as any)
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    return {
      name: (data?.provider_type as KYCProvider) || 'manual',
      config: (data?.config as Record<string, any>) || {},
    };
  },

  async submitVerification(submission: KYCSubmission): Promise<KYCResult> {
    const provider = await this.getActiveProvider();

    switch (provider.name) {
      case 'veriff':
        return this._submitVeriff(submission, provider.config);
      case 'sumsub':
        return this._submitSumsub(submission, provider.config);
      case 'persona':
        return this._submitPersona(submission, provider.config);
      default:
        return this._submitManual(submission);
    }
  },

  async _submitManual(submission: KYCSubmission): Promise<KYCResult> {
    const { data, error } = await supabase.functions.invoke('auth-engine', {
      body: {
        action: 'verify_document',
        verification_type: submission.verificationType,
        document_type: submission.documentType,
        document_image: submission.documentImage,
        selfie_image: submission.selfieImage,
      },
    });
    if (error) return { success: false, status: 'rejected', rejectionReason: error.message };
    return {
      success: true,
      verificationId: data?.verification_id,
      status: data?.status || 'pending',
      rejectionReason: data?.rejection_reason,
    };
  },

  // Provider stubs — ready for real API integration
  async _submitVeriff(_sub: KYCSubmission, _config: Record<string, any>): Promise<KYCResult> {
    // TODO: Integrate with Veriff API
    // 1. Create session via POST https://stationapi.veriff.com/v1/sessions
    // 2. Return redirectUrl for user to complete verification
    return { success: false, status: 'pending', rejectionReason: 'Veriff integration not yet configured' };
  },

  async _submitSumsub(_sub: KYCSubmission, _config: Record<string, any>): Promise<KYCResult> {
    // TODO: Integrate with Sumsub API
    return { success: false, status: 'pending', rejectionReason: 'Sumsub integration not yet configured' };
  },

  async _submitPersona(_sub: KYCSubmission, _config: Record<string, any>): Promise<KYCResult> {
    // TODO: Integrate with Persona API
    return { success: false, status: 'pending', rejectionReason: 'Persona integration not yet configured' };
  },

  async checkStatus(userId: string): Promise<{ status: VerificationStatus; level: string }> {
    const { data } = await supabase.functions.invoke('auth-engine', {
      body: { action: 'verify_document', kyc_action: 'check_status' },
    });
    return {
      status: data?.verification?.status || 'pending',
      level: data?.kyc_level || 'none',
    };
  },
};
