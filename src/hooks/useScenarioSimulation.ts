import { useMemo, useCallback } from 'react';

// ═══════════════════════════════════════════════════════════
// INVESTMENT SCENARIO SIMULATION ENGINE
// Zero-latency client-side computation
// ═══════════════════════════════════════════════════════════

export interface ScenarioInputs {
  purchase_price: number;       // IDR
  holding_years: number;        // 1-30
  appreciation_rate: number;    // % annual
  occupancy_rate: number;       // 0-100%
  monthly_rental: number;       // IDR
  rental_growth: number;        // % annual
  down_payment_pct: number;     // 0-100%
  loan_rate: number;            // % annual
  loan_term_years: number;
  maintenance_pct: number;      // % of property value annually
  tax_rate: number;             // % of gross rental
  transaction_cost_buy_pct: number;   // BPHTB, notary etc
  transaction_cost_sell_pct: number;  // PPh, broker etc
}

export const DEFAULT_SCENARIO: ScenarioInputs = {
  purchase_price: 5_000_000_000,
  holding_years: 10,
  appreciation_rate: 7,
  occupancy_rate: 80,
  monthly_rental: 35_000_000,
  rental_growth: 5,
  down_payment_pct: 30,
  loan_rate: 8.5,
  loan_term_years: 20,
  maintenance_pct: 1.5,
  tax_rate: 10,
  transaction_cost_buy_pct: 5,
  transaction_cost_sell_pct: 5,
};

export interface YearResult {
  year: number;
  property_value: number;
  gross_rental: number;
  net_rental: number;
  loan_balance: number;
  equity: number;
  cumulative_cashflow: number;
  annual_cashflow: number;
  total_roi_pct: number;
  annualized_roi_pct: number;
  cash_on_cash_pct: number;
  is_breakeven: boolean;
}

export interface DownsideResult {
  scenario: string;
  final_value: number;
  total_roi_pct: number;
  max_drawdown_pct: number;
  recovery_years: number | null;
  probability_label: string;
}

export interface SimulationOutput {
  years: YearResult[];
  summary: {
    total_investment: number;
    total_rental_income: number;
    total_expenses: number;
    final_property_value: number;
    final_equity: number;
    net_profit: number;
    total_roi_pct: number;
    annualized_roi_pct: number;
    breakeven_year: number | null;
    irr_estimate: number;
    equity_multiple: number;
  };
  downside: DownsideResult[];
}

// ── Monthly payment ──
function calcMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate <= 0 || termYears <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

function loanBalance(principal: number, annualRate: number, termYears: number, yearsPaid: number): number {
  if (principal <= 0 || yearsPaid >= termYears) return 0;
  const r = annualRate / 100 / 12;
  const n = termYears * 12;
  const p = yearsPaid * 12;
  const mp = calcMonthlyPayment(principal, annualRate, termYears);
  return Math.max(0, principal * Math.pow(1 + r, p) - mp * ((Math.pow(1 + r, p) - 1) / r));
}

// ── Core simulation ──
export function runScenarioSimulation(inputs: ScenarioInputs): SimulationOutput {
  const {
    purchase_price, holding_years, appreciation_rate, occupancy_rate,
    monthly_rental, rental_growth, down_payment_pct, loan_rate,
    loan_term_years, maintenance_pct, tax_rate,
    transaction_cost_buy_pct, transaction_cost_sell_pct,
  } = inputs;

  const downPayment = purchase_price * (down_payment_pct / 100);
  const loanPrincipal = purchase_price - downPayment;
  const buyCosts = purchase_price * (transaction_cost_buy_pct / 100);
  const totalInvestment = downPayment + buyCosts;
  const monthlyLoanPayment = calcMonthlyPayment(loanPrincipal, loan_rate, loan_term_years);
  const annualDebtService = monthlyLoanPayment * 12;

  let cumulativeCashflow = -buyCosts; // initial out-of-pocket beyond DP
  let breakevenYear: number | null = null;
  let totalRental = 0;
  let totalExpenses = buyCosts;

  const years: YearResult[] = [];

  for (let y = 1; y <= holding_years; y++) {
    const propertyValue = purchase_price * Math.pow(1 + appreciation_rate / 100, y);
    const currentMonthlyRental = monthly_rental * Math.pow(1 + rental_growth / 100, y - 1);
    const grossRental = currentMonthlyRental * 12 * (occupancy_rate / 100);
    const maintenanceCost = propertyValue * (maintenance_pct / 100);
    const taxCost = grossRental * (tax_rate / 100);
    const netRental = grossRental - maintenanceCost - taxCost;
    const annualCashflow = netRental - annualDebtService;
    const lb = loanBalance(loanPrincipal, loan_rate, loan_term_years, y);
    const equity = propertyValue - lb;
    const sellCosts = propertyValue * (transaction_cost_sell_pct / 100);

    cumulativeCashflow += annualCashflow;
    totalRental += grossRental;
    totalExpenses += maintenanceCost + taxCost + annualDebtService;

    const netSaleProceeds = propertyValue - lb - sellCosts;
    const totalReturn = netSaleProceeds + cumulativeCashflow - downPayment;
    const totalRoiPct = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;
    const annualizedRoi = y > 0 ? (Math.pow(1 + totalReturn / totalInvestment, 1 / y) - 1) * 100 : 0;
    const cashOnCash = downPayment > 0 ? (annualCashflow / downPayment) * 100 : 0;

    const isBreakeven = cumulativeCashflow >= 0 && breakevenYear === null;
    if (isBreakeven) breakevenYear = y;

    years.push({
      year: y,
      property_value: Math.round(propertyValue),
      gross_rental: Math.round(grossRental),
      net_rental: Math.round(netRental),
      loan_balance: Math.round(lb),
      equity: Math.round(equity),
      cumulative_cashflow: Math.round(cumulativeCashflow),
      annual_cashflow: Math.round(annualCashflow),
      total_roi_pct: Math.round(totalRoiPct * 10) / 10,
      annualized_roi_pct: Math.round(annualizedRoi * 10) / 10,
      cash_on_cash_pct: Math.round(cashOnCash * 10) / 10,
      is_breakeven: isBreakeven,
    });
  }

  const lastYear = years[years.length - 1];
  const finalSellCosts = lastYear.property_value * (transaction_cost_sell_pct / 100);
  const netProfit = lastYear.property_value - lastYear.loan_balance - finalSellCosts + cumulativeCashflow - downPayment;
  const equityMultiple = totalInvestment > 0 ? (totalInvestment + netProfit) / totalInvestment : 1;
  const irrEstimate = holding_years > 0 ? (Math.pow(equityMultiple, 1 / holding_years) - 1) * 100 : 0;

  // ── Downside scenarios ──
  const downsideScenarios: { name: string; appreciation: number; vacancy: number; probability: string }[] = [
    { name: 'Mild Correction', appreciation: appreciation_rate * 0.3, vacancy: occupancy_rate * 0.85, probability: '25-30%' },
    { name: 'Market Downturn', appreciation: -3, vacancy: occupancy_rate * 0.65, probability: '10-15%' },
    { name: 'Severe Recession', appreciation: -8, vacancy: occupancy_rate * 0.45, probability: '3-5%' },
  ];

  const downside: DownsideResult[] = downsideScenarios.map(ds => {
    let val = purchase_price;
    let minVal = purchase_price;
    let recoveryYear: number | null = null;

    for (let y = 1; y <= holding_years; y++) {
      val = val * (1 + ds.appreciation / 100);
      if (val < minVal) minVal = val;
      if (val >= purchase_price && recoveryYear === null && ds.appreciation < 0) {
        recoveryYear = y;
      }
    }

    const sellCosts = val * (transaction_cost_sell_pct / 100);
    const lb = loanBalance(loanPrincipal, loan_rate, loan_term_years, holding_years);
    const grossRentalTotal = Array.from({ length: holding_years }, (_, i) =>
      monthly_rental * Math.pow(1 + rental_growth / 100, i) * 12 * (ds.vacancy / 100)
    ).reduce((a, b) => a + b, 0);

    const net = val - lb - sellCosts + grossRentalTotal - totalExpenses - downPayment;
    const roi = totalInvestment > 0 ? (net / totalInvestment) * 100 : 0;
    const maxDrawdown = ((purchase_price - minVal) / purchase_price) * 100;

    return {
      scenario: ds.name,
      final_value: Math.round(val),
      total_roi_pct: Math.round(roi * 10) / 10,
      max_drawdown_pct: Math.round(maxDrawdown * 10) / 10,
      recovery_years: recoveryYear,
      probability_label: ds.probability,
    };
  });

  return {
    years,
    summary: {
      total_investment: Math.round(totalInvestment),
      total_rental_income: Math.round(totalRental),
      total_expenses: Math.round(totalExpenses),
      final_property_value: lastYear.property_value,
      final_equity: lastYear.equity,
      net_profit: Math.round(netProfit),
      total_roi_pct: lastYear.total_roi_pct,
      annualized_roi_pct: lastYear.annualized_roi_pct,
      breakeven_year: breakevenYear,
      irr_estimate: Math.round(irrEstimate * 10) / 10,
      equity_multiple: Math.round(equityMultiple * 100) / 100,
    },
    downside,
  };
}

// ── Saved snapshot type ──
export interface ScenarioSnapshot {
  id: string;
  name: string;
  inputs: ScenarioInputs;
  output: SimulationOutput;
  created_at: number;
}

// ── React hook ──
export function useScenarioSimulation(inputs: ScenarioInputs) {
  const output = useMemo(() => runScenarioSimulation(inputs), [
    inputs.purchase_price, inputs.holding_years, inputs.appreciation_rate,
    inputs.occupancy_rate, inputs.monthly_rental, inputs.rental_growth,
    inputs.down_payment_pct, inputs.loan_rate, inputs.loan_term_years,
    inputs.maintenance_pct, inputs.tax_rate,
    inputs.transaction_cost_buy_pct, inputs.transaction_cost_sell_pct,
  ]);
  return output;
}
