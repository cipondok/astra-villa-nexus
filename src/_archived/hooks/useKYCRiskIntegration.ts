import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type KYCTier = 'unverified' | 'basic' | 'standard' | 'enhanced';

export interface KYCRiskProfile {
  kyc_tier: KYCTier;
  is_verified: boolean;
  aml_clear: boolean;
  fraud_score: number;
  combined_risk: 'low' | 'medium' | 'high' | 'critical';
  transaction_limits: {
    max_single: number;
    max_daily: number;
    max_monthly: number;
    escrow_allowed: boolean;
  };
  restrictions: string[];
  required_actions: string[];
}

const TIER_LIMITS: Record<KYCTier, { single: number; daily: number; monthly: number }> = {
  unverified: { single: 10_000_000, daily: 25_000_000, monthly: 100_000_000 },
  basic: { single: 100_000_000, daily: 500_000_000, monthly: 2_000_000_000 },
  standard: { single: 1_000_000_000, daily: 5_000_000_000, monthly: 20_000_000_000 },
  enhanced: { single: Infinity, daily: Infinity, monthly: Infinity },
};

export function useKYCRiskIntegration() {
  const [profile, setProfile] = useState<KYCRiskProfile | null>(null);

  const evaluateRisk = useCallback(async (): Promise<KYCRiskProfile> => {
    const { data, error } = await supabase.functions.invoke('kyc-engine', {
      body: { action: 'evaluate_risk' },
    });

    if (error) throw new Error(error.message);

    const kycTier: KYCTier = data?.kyc_tier || 'unverified';
    const fraudScore = data?.fraud_score ?? 0;
    const amlClear = data?.aml_clear ?? true;
    const limits = TIER_LIMITS[kycTier];

    const restrictions: string[] = [];
    const requiredActions: string[] = [];

    if (kycTier === 'unverified') {
      restrictions.push('limited_transactions');
      requiredActions.push('complete_kyc');
    }
    if (!amlClear) {
      restrictions.push('no_escrow', 'no_withdrawals');
      requiredActions.push('aml_review_pending');
    }
    if (fraudScore > 70) {
      restrictions.push('all_transactions_blocked');
    }

    let combinedRisk: KYCRiskProfile['combined_risk'] = 'low';
    if (fraudScore > 70 || !amlClear) combinedRisk = 'critical';
    else if (fraudScore > 40 || kycTier === 'unverified') combinedRisk = 'high';
    else if (fraudScore > 20 || kycTier === 'basic') combinedRisk = 'medium';

    const result: KYCRiskProfile = {
      kyc_tier: kycTier,
      is_verified: kycTier !== 'unverified',
      aml_clear: amlClear,
      fraud_score: fraudScore,
      combined_risk: combinedRisk,
      transaction_limits: {
        max_single: limits.single,
        max_daily: limits.daily,
        max_monthly: limits.monthly,
        escrow_allowed: kycTier !== 'unverified' && amlClear,
      },
      restrictions,
      required_actions: requiredActions,
    };

    setProfile(result);
    return result;
  }, []);

  const canTransact = useCallback((amount: number): { allowed: boolean; reason?: string } => {
    if (!profile) return { allowed: false, reason: 'Risk profile not loaded' };
    if (profile.restrictions.includes('all_transactions_blocked'))
      return { allowed: false, reason: 'Account blocked — contact support' };
    if (amount > profile.transaction_limits.max_single)
      return { allowed: false, reason: `Exceeds limit (Rp ${(profile.transaction_limits.max_single / 1e6).toFixed(0)}M). Upgrade KYC to increase.` };
    return { allowed: true };
  }, [profile]);

  return { profile, evaluateRisk, canTransact };
}
