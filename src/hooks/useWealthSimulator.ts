import { useMemo } from 'react';
import { PortfolioProperty } from './usePortfolioManager';

// ── Scenario Types ──
export type ScenarioType = 'bull' | 'base' | 'bear' | 'hyper_growth' | 'correction';

export interface ScenarioParams {
  label: string;
  description: string;
  appreciation_rate: number;      // annual %
  rental_growth_rate: number;     // annual %
  liquidity_risk: number;         // 0-100
  vacancy_rate: number;           // %
  exit_discount: number;          // % discount on exit
  color: string;                  // chart color token
}

export const SCENARIOS: Record<ScenarioType, ScenarioParams> = {
  bull: {
    label: 'Bull Market',
    description: 'Strong demand, rapid appreciation, low vacancy',
    appreciation_rate: 12,
    rental_growth_rate: 8,
    liquidity_risk: 15,
    vacancy_rate: 3,
    exit_discount: 2,
    color: 'hsl(var(--chart-2))',
  },
  base: {
    label: 'Base Market',
    description: 'Stable growth aligned with historical averages',
    appreciation_rate: 7,
    rental_growth_rate: 5,
    liquidity_risk: 30,
    vacancy_rate: 8,
    exit_discount: 5,
    color: 'hsl(var(--primary))',
  },
  bear: {
    label: 'Bear Market',
    description: 'Slow growth, higher vacancy, liquidity constraints',
    appreciation_rate: 2,
    rental_growth_rate: 1,
    liquidity_risk: 60,
    vacancy_rate: 15,
    exit_discount: 12,
    color: 'hsl(var(--destructive))',
  },
  hyper_growth: {
    label: 'Hyper Growth Zone',
    description: 'Urban expansion corridor with infrastructure boom',
    appreciation_rate: 18,
    rental_growth_rate: 12,
    liquidity_risk: 10,
    vacancy_rate: 2,
    exit_discount: 1,
    color: 'hsl(var(--chart-4))',
  },
  correction: {
    label: 'Market Correction',
    description: 'Post-bubble correction with temporary value decline',
    appreciation_rate: -5,
    rental_growth_rate: -2,
    liquidity_risk: 75,
    vacancy_rate: 20,
    exit_discount: 18,
    color: 'hsl(var(--chart-5))',
  },
};

// ── Financing Config ──
export interface FinancingConfig {
  down_payment_pct: number;       // 0-100
  loan_rate_annual: number;       // %
  loan_term_years: number;
  refinance_at_year: number | null;
  refinance_rate: number;         // new rate after refinance
}

export const DEFAULT_FINANCING: FinancingConfig = {
  down_payment_pct: 30,
  loan_rate_annual: 8.5,
  loan_term_years: 20,
  refinance_at_year: null,
  refinance_rate: 7.0,
};

// ── Year Data Point ──
export interface YearProjection {
  year: number;
  market_value: number;
  rental_income_annual: number;
  rental_income_cumulative: number;
  loan_balance: number;
  equity: number;
  net_worth: number;
  cashflow_annual: number;
  debt_service_annual: number;
  dscr: number;                   // debt service coverage ratio
  leverage_ratio: number;         // loan / value
  milestones: string[];
}

// ── Simulation Result ──
export interface SimulationResult {
  scenario: ScenarioType;
  params: ScenarioParams;
  projections: YearProjection[];
  summary: {
    total_return_pct: number;
    total_rental_income: number;
    final_equity: number;
    final_net_worth: number;
    wealth_acceleration_score: number;   // 0-100
    risk_diversification_score: number;  // 0-100
    capital_efficiency_score: number;    // 0-100
    cashflow_stress_index: number;       // 0-100 (lower = healthier)
    leverage_efficiency_score: number;   // 0-100
  };
  advice: WealthAdvice[];
}

export interface WealthAdvice {
  type: 'sell' | 'refinance' | 'acquire' | 'rebalance' | 'hold';
  year: number;
  message: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
}

// ── Monthly payment helper ──
function monthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate <= 0 || termYears <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

// ── Remaining loan balance after Y years ──
function loanBalanceAfterYears(
  principal: number,
  annualRate: number,
  termYears: number,
  yearsPaid: number,
): number {
  if (principal <= 0 || yearsPaid >= termYears) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  const p = yearsPaid * 12;
  const mp = monthlyPayment(principal, annualRate, termYears);
  return principal * Math.pow(1 + r, p) - mp * ((Math.pow(1 + r, p) - 1) / r);
}

// ── Run simulation ──
function runSimulation(
  properties: PortfolioProperty[],
  scenario: ScenarioType,
  financing: FinancingConfig,
  maxYears: number,
): SimulationResult {
  const params = SCENARIOS[scenario];
  const totalPortfolioValue = properties.reduce((s, p) => s + p.price, 0);
  const avgRentalYield = properties.length > 0
    ? properties.reduce((s, p) => s + (p.rental_yield || 4.5), 0) / properties.length
    : 4.5;

  const downPayment = totalPortfolioValue * (financing.down_payment_pct / 100);
  const initialLoan = totalPortfolioValue - downPayment;
  const loanTerm = financing.loan_term_years;

  const projections: YearProjection[] = [];
  let cumulativeRental = 0;

  // Milestones tracking
  const MILESTONE_TARGETS = [
    { label: 'Rp 1B Equity', value: 1_000_000_000 },
    { label: 'Rp 5B Equity', value: 5_000_000_000 },
    { label: 'Rp 10B Equity', value: 10_000_000_000 },
    { label: 'Rp 50B Net Worth', value: 50_000_000_000 },
  ];
  const achievedMilestones = new Set<string>();

  for (let y = 0; y <= maxYears; y++) {
    const appRate = params.appreciation_rate / 100;
    const rentalGrowth = params.rental_growth_rate / 100;

    const marketValue = Math.round(totalPortfolioValue * Math.pow(1 + appRate, y));

    const baseRental = totalPortfolioValue * (avgRentalYield / 100);
    const rentalAnnual = Math.round(baseRental * Math.pow(1 + rentalGrowth, y) * (1 - params.vacancy_rate / 100));
    cumulativeRental += y > 0 ? rentalAnnual : 0;

    // Loan balance
    let currentRate = financing.loan_rate_annual;
    let effectiveLoan = initialLoan;
    let effectiveTerm = loanTerm;
    let yearOffset = 0;

    if (financing.refinance_at_year && y >= financing.refinance_at_year) {
      // Refinanced: recalculate from refinance point
      const balanceAtRefi = Math.max(0, loanBalanceAfterYears(initialLoan, financing.loan_rate_annual, loanTerm, financing.refinance_at_year));
      effectiveLoan = balanceAtRefi;
      currentRate = financing.refinance_rate;
      effectiveTerm = loanTerm - financing.refinance_at_year;
      yearOffset = financing.refinance_at_year;
    }

    const loanBal = y === 0 ? initialLoan : Math.max(0, loanBalanceAfterYears(effectiveLoan, currentRate, effectiveTerm, y - yearOffset));
    const equity = marketValue - loanBal;
    const netWorth = equity + cumulativeRental;

    const debtServiceAnnual = y > 0 && loanBal > 0 ? monthlyPayment(effectiveLoan, currentRate, effectiveTerm) * 12 : 0;
    const cashflow = rentalAnnual - debtServiceAnnual;
    const dscr = debtServiceAnnual > 0 ? rentalAnnual / debtServiceAnnual : 99;
    const leverageRatio = marketValue > 0 ? loanBal / marketValue : 0;

    // Milestones
    const milestones: string[] = [];
    for (const m of MILESTONE_TARGETS) {
      if (!achievedMilestones.has(m.label) && equity >= m.value) {
        milestones.push(m.label);
        achievedMilestones.add(m.label);
      }
    }
    if (y > 0 && cashflow > 0 && projections.length > 0 && projections[projections.length - 1].cashflow_annual <= 0) {
      milestones.push('Cashflow Positive');
    }
    if (y > 0 && leverageRatio < 0.5 && projections.length > 0 && projections[projections.length - 1].leverage_ratio >= 0.5) {
      milestones.push('50% Equity Threshold');
    }

    projections.push({
      year: y,
      market_value: marketValue,
      rental_income_annual: rentalAnnual,
      rental_income_cumulative: cumulativeRental,
      loan_balance: Math.round(loanBal),
      equity: Math.round(equity),
      net_worth: Math.round(netWorth),
      cashflow_annual: Math.round(cashflow),
      debt_service_annual: Math.round(debtServiceAnnual),
      dscr: Math.round(dscr * 100) / 100,
      leverage_ratio: Math.round(leverageRatio * 1000) / 1000,
      milestones,
    });
  }

  const final = projections[projections.length - 1];
  const initial = projections[0];
  const totalReturn = initial.market_value > 0
    ? ((final.net_worth - initial.equity) / initial.equity) * 100
    : 0;

  // Advisory logic
  const advice: WealthAdvice[] = [];

  // DSCR warnings
  const lowDSCR = projections.find(p => p.year > 0 && p.dscr < 1.2 && p.dscr > 0);
  if (lowDSCR) {
    advice.push({
      type: 'refinance',
      year: lowDSCR.year,
      message: `DSCR drops to ${lowDSCR.dscr.toFixed(2)} at year ${lowDSCR.year}. Consider refinancing to lower rate.`,
      impact: 'Improve cashflow by 15-25%',
      priority: 'high',
    });
  }

  // Leverage too high
  const highLeverage = projections.find(p => p.year >= 3 && p.leverage_ratio > 0.7);
  if (highLeverage) {
    advice.push({
      type: 'sell',
      year: highLeverage.year,
      message: `Leverage remains above 70% at year ${highLeverage.year}. Consider partial exit.`,
      impact: 'Reduce risk exposure',
      priority: 'high',
    });
  }

  // Equity milestone acquisition suggestion
  const equityThreshold = projections.find(p => p.equity > totalPortfolioValue * 0.6 && p.year >= 3);
  if (equityThreshold) {
    advice.push({
      type: 'acquire',
      year: equityThreshold.year,
      message: `Sufficient equity for next acquisition at year ${equityThreshold.year} (${formatB(equityThreshold.equity)} equity).`,
      impact: 'Accelerate wealth growth via leverage recycling',
      priority: 'medium',
    });
  }

  // Diversification
  const uniqueCities = new Set(properties.map(p => p.city)).size;
  if (uniqueCities < 3 && properties.length >= 2) {
    advice.push({
      type: 'rebalance',
      year: 1,
      message: 'Portfolio concentrated in fewer than 3 cities. Geographic diversification recommended.',
      impact: 'Reduce location-specific risk by 20-30%',
      priority: 'medium',
    });
  }

  // Hold recommendation for strong performers
  if (params.appreciation_rate >= 7) {
    advice.push({
      type: 'hold',
      year: 5,
      message: `In ${params.label} scenario, holding through year 5+ maximizes compound growth.`,
      impact: `Projected ${totalReturn.toFixed(0)}% total return`,
      priority: 'low',
    });
  }

  // Score calculations
  const wealthAcceleration = Math.min(100, Math.round(totalReturn / maxYears * 5));
  const riskDiversification = Math.min(100, uniqueCities * 20 + new Set(properties.map(p => p.property_type)).size * 15);
  const capitalEfficiency = Math.min(100, Math.round(
    (final.net_worth / Math.max(downPayment, 1)) * 5
  ));
  const cashflowStress = projections.filter(p => p.year > 0 && p.cashflow_annual < 0).length / Math.max(maxYears, 1) * 100;
  const leverageEfficiency = Math.min(100, Math.round(
    (1 - final.leverage_ratio) * 50 + (final.dscr > 1.5 ? 50 : final.dscr > 1 ? 30 : 10)
  ));

  return {
    scenario,
    params,
    projections,
    summary: {
      total_return_pct: Math.round(totalReturn * 10) / 10,
      total_rental_income: cumulativeRental,
      final_equity: final.equity,
      final_net_worth: final.net_worth,
      wealth_acceleration_score: wealthAcceleration,
      risk_diversification_score: riskDiversification,
      capital_efficiency_score: capitalEfficiency,
      cashflow_stress_index: Math.round(cashflowStress),
      leverage_efficiency_score: leverageEfficiency,
    },
    advice,
  };
}

function formatB(v: number): string {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}M`;
  return `Rp ${(v / 1e3).toFixed(0)}K`;
}

// ── Hook ──
export function useWealthSimulator(
  properties: PortfolioProperty[],
  selectedScenarios: ScenarioType[],
  financing: FinancingConfig,
  maxYears: number,
) {
  const results = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    return selectedScenarios.map(s => runSimulation(properties, s, financing, maxYears));
  }, [properties, selectedScenarios, financing, maxYears]);

  return results;
}

export { formatB };
