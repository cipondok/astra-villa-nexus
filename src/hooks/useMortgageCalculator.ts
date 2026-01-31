import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MortgageBank {
  id: string;
  bank_name: string;
  bank_code: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  min_loan_amount: number;
  max_loan_amount: number;
  min_down_payment_percent: number;
  max_loan_term_years: number;
  processing_fee_percent: number;
  admin_fee: number;
  appraisal_fee: number;
  insurance_required: boolean;
  notary_fee_percent: number;
  requirements: string[];
  created_at: string;
}

export interface MortgageRate {
  id: string;
  bank_id: string;
  rate_name: string;
  rate_type: 'fixed' | 'floating' | 'promotional';
  interest_rate_year1: number;
  interest_rate_year2: number | null;
  interest_rate_year3_plus: number | null;
  min_loan_amount: number | null;
  max_loan_amount: number | null;
  min_term_years: number;
  max_term_years: number;
  promo_end_date: string | null;
  conditions: string | null;
  is_active: boolean;
  created_at: string;
}

export interface MortgageSimulation {
  id: string;
  user_id: string | null;
  property_id: string | null;
  property_price: number;
  down_payment: number;
  down_payment_percent: number;
  loan_amount: number;
  loan_term_years: number;
  selected_bank_id: string | null;
  selected_rate_id: string | null;
  interest_rate: number;
  monthly_payment: number;
  total_payment: number;
  total_interest: number;
  affordability_ratio: number | null;
  monthly_income: number | null;
  comparison_data: BankComparison[];
  created_at: string;
}

export interface BankComparison {
  bank_id: string;
  bank_name: string;
  rate_id: string;
  rate_name: string;
  interest_rate: number;
  monthly_payment: number;
  total_payment: number;
  total_interest: number;
  total_fees: number;
}

export interface CalculationInput {
  propertyPrice: number;
  downPayment: number;
  loanTermYears: number;
  interestRate: number;
  monthlyIncome?: number;
}

export interface CalculationResult {
  loanAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  downPaymentPercent: number;
  affordabilityRatio?: number;
  monthlyBreakdown: MonthlyBreakdown[];
  yearlyBreakdown: YearlyBreakdown[];
}

export interface MonthlyBreakdown {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface YearlyBreakdown {
  year: number;
  totalPaid: number;
  principalPaid: number;
  interestPaid: number;
  remainingBalance: number;
}

// Calculate mortgage payment using PMT formula
export function calculateMortgage(input: CalculationInput): CalculationResult {
  const { propertyPrice, downPayment, loanTermYears, interestRate, monthlyIncome } = input;
  
  const loanAmount = propertyPrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;
  
  // PMT formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / totalMonths;
  } else {
    monthlyPayment = loanAmount * 
      (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }
  
  const totalPayment = monthlyPayment * totalMonths;
  const totalInterest = totalPayment - loanAmount;
  const downPaymentPercent = (downPayment / propertyPrice) * 100;
  
  // Calculate affordability ratio (DTI)
  const affordabilityRatio = monthlyIncome 
    ? (monthlyPayment / monthlyIncome) * 100 
    : undefined;
  
  // Generate amortization schedule
  const monthlyBreakdown: MonthlyBreakdown[] = [];
  const yearlyBreakdown: YearlyBreakdown[] = [];
  
  let balance = loanAmount;
  let yearlyPrincipal = 0;
  let yearlyInterest = 0;
  
  for (let month = 1; month <= totalMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
    
    monthlyBreakdown.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance)
    });
    
    yearlyPrincipal += principalPayment;
    yearlyInterest += interestPayment;
    
    if (month % 12 === 0) {
      yearlyBreakdown.push({
        year: month / 12,
        totalPaid: yearlyPrincipal + yearlyInterest,
        principalPaid: yearlyPrincipal,
        interestPaid: yearlyInterest,
        remainingBalance: Math.max(0, balance)
      });
      yearlyPrincipal = 0;
      yearlyInterest = 0;
    }
  }
  
  return {
    loanAmount,
    monthlyPayment,
    totalPayment,
    totalInterest,
    downPaymentPercent,
    affordabilityRatio,
    monthlyBreakdown,
    yearlyBreakdown
  };
}

export const useMortgageCalculator = () => {
  const queryClient = useQueryClient();

  // Fetch all active banks
  const { data: banks = [], isLoading: loadingBanks } = useQuery({
    queryKey: ['mortgage-banks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mortgage_banks')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false });
      if (error) throw error;
      return data as MortgageBank[];
    }
  });

  // Fetch all active rates with bank info
  const { data: rates = [], isLoading: loadingRates } = useQuery({
    queryKey: ['mortgage-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mortgage_rates')
        .select('*')
        .eq('is_active', true)
        .order('interest_rate_year1');
      if (error) throw error;
      return data as MortgageRate[];
    }
  });

  // Get rates for a specific bank
  const getRatesForBank = (bankId: string) => {
    return rates.filter(rate => rate.bank_id === bankId);
  };

  // Compare all banks for given loan parameters
  const compareAllBanks = (
    propertyPrice: number,
    downPayment: number,
    loanTermYears: number
  ): BankComparison[] => {
    const comparisons: BankComparison[] = [];
    const loanAmount = propertyPrice - downPayment;

    banks.forEach(bank => {
      const bankRates = getRatesForBank(bank.id);
      
      bankRates.forEach(rate => {
        // Check if loan amount is within bank's limits
        if (rate.min_loan_amount && loanAmount < rate.min_loan_amount) return;
        if (rate.max_loan_amount && loanAmount > rate.max_loan_amount) return;
        if (loanTermYears < rate.min_term_years || loanTermYears > rate.max_term_years) return;

        const result = calculateMortgage({
          propertyPrice,
          downPayment,
          loanTermYears,
          interestRate: rate.interest_rate_year1
        });

        const totalFees = 
          (loanAmount * bank.processing_fee_percent / 100) +
          bank.admin_fee +
          bank.appraisal_fee +
          (loanAmount * bank.notary_fee_percent / 100);

        comparisons.push({
          bank_id: bank.id,
          bank_name: bank.bank_name,
          rate_id: rate.id,
          rate_name: rate.rate_name,
          interest_rate: rate.interest_rate_year1,
          monthly_payment: result.monthlyPayment,
          total_payment: result.totalPayment,
          total_interest: result.totalInterest,
          total_fees: totalFees
        });
      });
    });

    // Sort by monthly payment
    return comparisons.sort((a, b) => a.monthly_payment - b.monthly_payment);
  };

  // Save simulation
  const saveSimulationMutation = useMutation({
    mutationFn: async (simulation: {
      user_id?: string | null;
      property_id?: string | null;
      session_id?: string;
      property_price: number;
      down_payment: number;
      down_payment_percent: number;
      loan_amount: number;
      loan_term_years: number;
      selected_bank_id?: string | null;
      selected_rate_id?: string | null;
      interest_rate: number;
      monthly_payment: number;
      total_payment: number;
      total_interest: number;
      affordability_ratio?: number | null;
      monthly_income?: number | null;
      comparison_data?: BankComparison[];
    }) => {
      const { data, error } = await supabase
        .from('mortgage_simulations')
        .insert({
          ...simulation,
          comparison_data: simulation.comparison_data ? JSON.stringify(simulation.comparison_data) : null
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mortgage-simulations'] });
      toast.success('Simulation saved');
    }
  });

  // Submit inquiry
  const submitInquiryMutation = useMutation({
    mutationFn: async (inquiry: {
      bank_id: string;
      simulation_id?: string;
      property_id?: string;
      full_name: string;
      email: string;
      phone: string;
      monthly_income?: number;
      employment_type?: string;
      loan_amount_requested?: number;
      loan_term_requested?: number;
    }) => {
      const { data, error } = await supabase
        .from('mortgage_inquiries')
        .insert(inquiry)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Your inquiry has been submitted! The bank will contact you soon.');
    },
    onError: () => {
      toast.error('Failed to submit inquiry. Please try again.');
    }
  });

  return {
    banks,
    rates,
    loadingBanks,
    loadingRates,
    isLoading: loadingBanks || loadingRates,
    getRatesForBank,
    compareAllBanks,
    calculateMortgage,
    saveSimulation: saveSimulationMutation.mutateAsync,
    submitInquiry: submitInquiryMutation.mutateAsync,
    isSaving: saveSimulationMutation.isPending,
    isSubmitting: submitInquiryMutation.isPending
  };
};

export default useMortgageCalculator;
