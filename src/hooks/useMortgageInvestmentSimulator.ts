import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MortgageInvestmentInput {
  property_price: number;
  down_payment_percent: number;
  interest_rate: number;
  loan_term_years: number;
  property_id?: string;
}

export interface YearlyProjection {
  year: number;
  property_value: number;
  monthly_rent: number;
  annual_cashflow: number;
  cumulative_cashflow: number;
  remaining_balance: number;
  equity: number;
  total_roi: number;
}

export interface RateScenario {
  interest_rate: number;
  monthly_payment: number;
  net_cashflow: number;
  cashflow_status: string;
}

export interface MortgageInvestmentResult {
  property_price: number;
  down_payment: number;
  down_payment_percent: number;
  loan_amount: number;
  interest_rate: number;
  loan_term_years: number;
  monthly_payment: number;
  total_payment: number;
  total_interest: number;
  rental_yield_percent: number;
  monthly_rent: number;
  rent_source: string;
  net_monthly_cashflow: number;
  annual_cashflow: number;
  cash_on_cash_return: number;
  break_even_rent: number;
  dscr: number;
  cashflow_status: string;
  verdict: string;
  verdict_label: string;
  yearly_projection: YearlyProjection[];
  rate_scenarios: RateScenario[];
  property_city: string;
  property_type: string;
  bedrooms: number;
  generated_at: string;
}

export const useMortgageInvestmentSimulator = (input: MortgageInvestmentInput | null) => {
  return useQuery({
    queryKey: ['mortgage-investment-simulator', input],
    queryFn: async (): Promise<MortgageInvestmentResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'mortgage_investment_simulator', ...input },
      });
      if (error) throw error;
      return data?.data;
    },
    enabled: !!input && input.property_price > 0,
    staleTime: 5 * 60 * 1000,
  });
};
