import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FraudDecision {
  allowed: boolean;
  decision: 'allow' | 'block' | 'require_kyc' | 'add_friction';
  fraud_score: number;
  risk_level: string;
  reason?: string;
  restrictions?: string[];
}

/**
 * Server-side fraud guard — call before any financial operation.
 * Returns the decision; throws on block.
 */
export function useFraudGuard() {
  const checkFraud = useCallback(async (params: {
    action: string;
    amount?: number;
    currency?: string;
    entity_id?: string;
    entity_type?: string;
    device_fingerprint?: string;
    client_fraud_score?: number;
  }): Promise<FraudDecision> => {
    const { data, error } = await supabase.functions.invoke('fraud-guard', {
      body: params,
    });

    if (error) {
      // If 403, parse the blocked response
      if (error.message?.includes('non-2xx')) {
        const decision: FraudDecision = {
          allowed: false,
          decision: 'block',
          fraud_score: 100,
          risk_level: 'blocked',
          reason: 'Transaction blocked by security system.',
          restrictions: ['all_transactions_blocked'],
        };
        toast.error('Transaction blocked for security reasons. Please verify your identity.');
        throw new FraudBlockError(decision);
      }
      throw error;
    }

    const decision = data as FraudDecision;

    if (decision.decision === 'block') {
      toast.error(decision.reason || 'Transaction blocked.');
      throw new FraudBlockError(decision);
    }

    if (decision.decision === 'require_kyc') {
      toast.warning('Identity verification required before proceeding.');
    }

    if (decision.decision === 'add_friction') {
      toast.info('Additional security verification applied.');
    }

    return decision;
  }, []);

  return { checkFraud };
}

export class FraudBlockError extends Error {
  decision: FraudDecision;
  constructor(decision: FraudDecision) {
    super(decision.reason || 'Blocked by fraud guard');
    this.name = 'FraudBlockError';
    this.decision = decision;
  }
}
