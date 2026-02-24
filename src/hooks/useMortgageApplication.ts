
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface MortgageApplicationInput {
  bank_id?: string | null;
  simulation_id?: string | null;
  property_id?: string | null;
  full_name: string;
  email: string;
  phone: string;
  employment_type: string;
  company_name?: string;
  years_employed?: number;
  monthly_income: number;
  other_income?: number;
  monthly_expenses?: number;
  existing_debt?: number;
  property_price: number;
  down_payment: number;
  down_payment_percent: number;
  loan_amount: number;
  loan_term_years: number;
  interest_rate: number;
  monthly_payment: number;
  dti_ratio?: number;
  qualification_status: string;
}

export interface PartnerBank {
  id: string;
  bank_name: string;
  bank_logo_url: string | null;
  interest_rate_range: string | null;
  min_loan_amount: number | null;
  max_loan_amount: number | null;
  partnership_tier: string | null;
  is_featured: boolean | null;
}

export const useMortgageApplication = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const submitApplication = useMutation({
    mutationFn: async (input: MortgageApplicationInput) => {
      if (!user?.id) throw new Error('Must be logged in');

      const statusHistory = [
        { status: 'submitted', timestamp: new Date().toISOString(), note: 'Application submitted' }
      ];

      const { data, error } = await supabase
        .from('mortgage_applications')
        .insert({
          user_id: user.id,
          ...input,
          status: 'submitted',
          status_history: statusHistory,
          submitted_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgage-applications'] });
      toast.success('Application submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit application');
    },
  });

  const submitToBank = useMutation({
    mutationFn: async ({ applicationId, bankId }: { applicationId: string; bankId: string }) => {
      if (!user?.id) throw new Error('Must be logged in');

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error('No session');

      const { data, error } = await supabase.functions.invoke('submit-mortgage-application', {
        body: { application_id: applicationId, bank_id: bankId },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['mortgage-applications'] });
      toast.success(
        data.bank_name
          ? `Application sent to ${data.bank_name}! Ref: ${data.reference_number}`
          : `Application submitted! Ref: ${data.reference_number}`
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit to bank');
    },
  });

  return {
    submitApplication: submitApplication.mutateAsync,
    isSubmitting: submitApplication.isPending,
    submitToBank: submitToBank.mutateAsync,
    isSubmittingToBank: submitToBank.isPending,
  };
};

export const usePartnerBanks = () => {
  return useQuery({
    queryKey: ['partner-banks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('acquisition_bank_partnerships')
        .select('id, bank_name, bank_logo_url, interest_rate_range, min_loan_amount, max_loan_amount, partnership_tier, is_featured')
        .eq('is_active', true)
        .order('is_featured', { ascending: false });
      if (error) throw error;
      return (data || []) as PartnerBank[];
    },
  });
};
