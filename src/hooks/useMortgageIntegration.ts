import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MortgageApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  employment_type: string;
  company_name: string | null;
  monthly_income: number;
  other_income: number | null;
  monthly_expenses: number | null;
  existing_debt: number | null;
  property_price: number;
  down_payment: number;
  down_payment_percent: number;
  loan_amount: number;
  interest_rate: number;
  loan_term_years: number;
  monthly_payment: number;
  dti_ratio: number | null;
  qualification_status: string;
  status: string;
  bank_id: string | null;
  property_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MortgageBank {
  id: string;
  bank_name: string;
  logo_url: string | null;
  max_loan_term_years: number | null;
  min_down_payment_percent: number | null;
  is_active: boolean | null;
  description: string | null;
}

export function useMyMortgageApplications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['my-mortgage-apps', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('mortgage_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as MortgageApplication[];
    },
    enabled: !!user?.id,
  });
}

export function useMortgageBanks() {
  return useQuery({
    queryKey: ['mortgage-banks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mortgage_banks')
        .select('id, bank_name, logo_url, max_loan_term_years, min_down_payment_percent, is_active, description')
        .eq('is_active', true)
        .order('bank_name');
      if (error) throw error;
      return (data || []) as unknown as MortgageBank[];
    },
    staleTime: 60_000,
  });
}

export interface SubmitMortgageInput {
  full_name: string;
  email: string;
  phone: string;
  employment_type: string;
  company_name?: string;
  monthly_income: number;
  other_income?: number;
  monthly_expenses?: number;
  existing_debt?: number;
  property_price: number;
  down_payment: number;
  down_payment_percent: number;
  loan_amount: number;
  interest_rate: number;
  loan_term_years: number;
  monthly_payment: number;
  dti_ratio?: number;
  qualification_status: string;
  bank_id?: string;
  property_id?: string;
}

export function useSubmitMortgageApplication() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SubmitMortgageInput) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('mortgage_applications')
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-mortgage-apps'] });
      toast.success('Mortgage application submitted!');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
