import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type AMLRiskLevel = 'clear' | 'low' | 'medium' | 'high' | 'blocked';

export interface AMLScreeningResult {
  risk_level: AMLRiskLevel;
  sanctions_match: boolean;
  pep_match: boolean;
  adverse_media: boolean;
  matches: AMLMatch[];
  screened_at: string;
  score: number; // 0-100
}

export interface AMLMatch {
  source: 'sanctions' | 'pep' | 'adverse_media' | 'watchlist';
  name: string;
  match_score: number;
  list_name: string;
  details?: string;
}

export function useAMLScreening() {
  const [isScreening, setIsScreening] = useState(false);
  const [lastResult, setLastResult] = useState<AMLScreeningResult | null>(null);

  const screenUser = useCallback(async (params: {
    full_name: string;
    date_of_birth?: string;
    nationality?: string;
    document_number?: string;
    country_of_residence?: string;
  }): Promise<AMLScreeningResult> => {
    setIsScreening(true);
    try {
      const { data, error } = await supabase.functions.invoke('kyc-engine', {
        body: { action: 'aml_screening', ...params },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const result: AMLScreeningResult = {
        risk_level: data.risk_level || 'clear',
        sanctions_match: data.sanctions_match || false,
        pep_match: data.pep_match || false,
        adverse_media: data.adverse_media || false,
        matches: data.matches || [],
        screened_at: data.screened_at || new Date().toISOString(),
        score: data.score ?? 0,
      };

      setLastResult(result);

      if (result.sanctions_match) {
        toast.error('Sanctions match detected — account restricted');
      } else if (result.pep_match) {
        toast.warning('Enhanced due diligence required');
      }

      return result;
    } catch (err: any) {
      console.error('AML screening error:', err);
      toast.error('AML screening failed');
      throw err;
    } finally {
      setIsScreening(false);
    }
  }, []);

  const getScreeningHistory = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('aml_screenings' as any)
      .select('*')
      .eq('user_id', userId)
      .order('screened_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching AML history:', error);
      return [];
    }
    return data || [];
  }, []);

  return { isScreening, lastResult, screenUser, getScreeningHistory };
}
