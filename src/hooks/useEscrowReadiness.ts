import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface EscrowReadiness {
  readiness_status: 'not_ready' | 'approaching_agreement' | 'escrow_ready';
  probability: number;
  price_gap: number;
  stage: string;
  suggested_deposit: number;
}

export function useEscrowReadiness() {
  const [readiness, setReadiness] = useState<EscrowReadiness | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const checkReadiness = useCallback(async (dealId: string) => {
    if (!user || !dealId) return null;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('escrow-readiness-scorer', {
        body: { deal_id: dealId, action: 'score' },
      });
      if (error) throw error;
      setReadiness(data);
      return data as EscrowReadiness;
    } catch (err) {
      console.error('Escrow readiness check failed:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return { readiness, isLoading, checkReadiness };
}
