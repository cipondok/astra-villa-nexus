
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
      toast.success('Application submitted successfully! We\'ll update you on its progress.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit application');
    },
  });

  return {
    submitApplication: submitApplication.mutateAsync,
    isSubmitting: submitApplication.isPending,
  };
};
