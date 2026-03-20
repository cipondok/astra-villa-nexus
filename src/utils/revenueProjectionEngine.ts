/**
 * Revenue Projection Engine
 *
 * Formula-driven financial modeling with scenario simulation,
 * sensitivity analysis, and break-even computation.
 */

// ─── Input Types ──────────────────────────────────────────────────────────

export interface ProjectionInputs {
  activeListings: number;
  monthlyDealConversionRate: number;  // e.g. 0.035 = 3.5%
  avgTransactionValue: number;        // IDR
  commissionPct: number;              // e.g. 0.011 = 1.1%
  activeSubscribers: number;
  avgSubscriptionPrice: number;       // IDR monthly
  premiumSlotsSold: number;
  premiumSlotPrice: number;           // IDR per slot
  activeVendors: number;
  avgVendorFee: number;               // IDR monthly
  monthlyFixedCosts: number;          // IDR
  monthlyVariableCostPct: number;     // % of revenue
}

export type ScenarioKey = 'conservative' | 'base' | 'aggressive';

export interface ScenarioMultipliers {
  listingGrowthRate: number;      // monthly %
  conversionImprovement: number;  // monthly %
  subscriberGrowthRate: number;   // monthly %
  vendorGrowthRate: number;       // monthly %
  premiumSlotGrowthRate: number;  // monthly %
  costGrowthRate: number;         // monthly %
}

// ─── Output Types ─────────────────────────────────────────────────────────

export interface MonthlyForecast {
  month: number;
  label: string;
  listings: number;
  deals: number;
  conversionRate: number;
  transactionRevenue: number;
  subscriptionRevenue: number;
  premiumRevenue: number;
  vendorRevenue: number;
  totalRevenue: number;
  totalCosts: number;
  netIncome: number;
  cumulativeRevenue: number;
  cumulativeNet: number;
  arr: number;
  subscribers: number;
  vendors: number;
}

export interface BreakEvenResult {
  month: number | null;
  cumulativeInvestment: number;
  isProfitable: boolean;
}

export interface SensitivityPoint {
  variable: string;
  variablePct: number;   // -20% to +20%
  m12Revenue: number;
  m12Net: number;
  deltaRevenuePct: number;
}

export interface HighMarginOpportunity {
  id: string;
  stream: string;
  currentRevenue: number;
  potentialRevenue: number;
  upliftPct: number;
  margin: number;
  rationale: string;
}

export interface ProjectionResult {
  scenario: ScenarioKey;
  monthly: MonthlyForecast[];
  breakEven: BreakEvenResult;
  m6Revenue: number;
  m12Revenue: number;
  m24Revenue: number;
  m12ARR: number;
  m12Net: number;
  revenueCAGR: number;
}

// ─── Scenario Presets ─────────────────────────────────────────────────────

export const SCENARIO_PRESETS: Record<ScenarioKey, ScenarioMultipliers> = {
  conservative: {
    listingGrowthRate: 0.04,
    conversionImprovement: 0.002,
    subscriberGrowthRate: 0.06,
    vendorGrowthRate: 0.03,
    premiumSlotGrowthRate: 0.05,
    costGrowthRate: 0.03,
  },
  base: {
    listingGrowthRate: 0.08,
    conversionImprovement: 0.004,
    subscriberGrowthRate: 0.12,
    vendorGrowthRate: 0.07,
    premiumSlotGrowthRate: 0.10,
    costGrowthRate: 0.04,
  },
  aggressive: {
    listingGrowthRate: 0.15,
    conversionImprovement: 0.008,
    subscriberGrowthRate: 0.20,
    vendorGrowthRate: 0.12,
    premiumSlotGrowthRate: 0.18,
    costGrowthRate: 0.06,
  },
};

// ─── Engine ───────────────────────────────────────────────────────────────

const MONTH_LABELS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function projectRevenue(
  inputs: ProjectionInputs,
  scenario: ScenarioKey,
  months = 24,
): ProjectionResult {
  const m = SCENARIO_PRESETS[scenario];
  const forecasts: MonthlyForecast[] = [];
  const now = new Date();
  let cumRev = 0;
  let cumNet = 0;

  for (let i = 0; i < months; i++) {
    const mIdx = (now.getMonth() + i) % 12;
    // Seasonality: mild sin wave peaking mid-year
    const seasonality = 1 + Math.sin((mIdx / 12) * Math.PI * 2 - Math.PI / 2) * 0.08;

    const listings = Math.round(inputs.activeListings * Math.pow(1 + m.listingGrowthRate, i));
    const convRate = Math.min(0.12, inputs.monthlyDealConversionRate + m.conversionImprovement * i);
    const deals = Math.max(1, Math.round(listings * convRate * seasonality));

    const txnRev = Math.round(deals * inputs.avgTransactionValue * inputs.commissionPct);
    const subs = Math.round(inputs.activeSubscribers * Math.pow(1 + m.subscriberGrowthRate, i));
    const subRev = Math.round(subs * inputs.avgSubscriptionPrice);
    const slots = Math.round(inputs.premiumSlotsSold * Math.pow(1 + m.premiumSlotGrowthRate, i) * seasonality);
    const premRev = Math.round(slots * inputs.premiumSlotPrice);
    const vendors = Math.round(inputs.activeVendors * Math.pow(1 + m.vendorGrowthRate, i));
    const vendorRev = Math.round(vendors * inputs.avgVendorFee);

    const totalRev = txnRev + subRev + premRev + vendorRev;
    const totalCosts = Math.round(
      inputs.monthlyFixedCosts * Math.pow(1 + m.costGrowthRate, i) +
      totalRev * inputs.monthlyVariableCostPct,
    );
    const net = totalRev - totalCosts;
    cumRev += totalRev;
    cumNet += net;

    forecasts.push({
      month: i + 1,
      label: MONTH_LABELS[mIdx],
      listings,
      deals,
      conversionRate: convRate,
      transactionRevenue: txnRev,
      subscriptionRevenue: subRev,
      premiumRevenue: premRev,
      vendorRevenue: vendorRev,
      totalRevenue: totalRev,
      totalCosts,
      netIncome: net,
      cumulativeRevenue: cumRev,
      cumulativeNet: cumNet,
      arr: totalRev * 12,
      subscribers: subs,
      vendors,
    });
  }

  // Break-even: first month where cumulativeNet > 0
  const beMonth = forecasts.find(f => f.cumulativeNet > 0);
  const breakEven: BreakEvenResult = {
    month: beMonth?.month ?? null,
    cumulativeInvestment: Math.abs(Math.min(0, ...forecasts.map(f => f.cumulativeNet))),
    isProfitable: forecasts[forecasts.length - 1].cumulativeNet > 0,
  };

  const last = forecasts[forecasts.length - 1];
  const m6 = forecasts.slice(0, 6).reduce((s, f) => s + f.totalRevenue, 0);
  const m12 = forecasts.slice(0, Math.min(12, months)).reduce((s, f) => s + f.totalRevenue, 0);
  const first = forecasts[0];
  const m12Last = forecasts[Math.min(11, months - 1)];
  const cagr = first.totalRevenue > 0
    ? Math.pow(m12Last.totalRevenue / first.totalRevenue, 1 / Math.min(12, months)) - 1
    : 0;

  return {
    scenario,
    monthly: forecasts,
    breakEven,
    m6Revenue: m6,
    m12Revenue: m12,
    m24Revenue: cumRev,
    m12ARR: m12Last.arr,
    m12Net: forecasts.slice(0, Math.min(12, months)).reduce((s, f) => s + f.netIncome, 0),
    revenueCAGR: cagr,
  };
}

// ─── Sensitivity Analysis ─────────────────────────────────────────────────

export function sensitivityAnalysis(
  inputs: ProjectionInputs,
  scenario: ScenarioKey,
): SensitivityPoint[] {
  const baseline = projectRevenue(inputs, scenario, 12);
  const variables: { key: keyof ProjectionInputs; label: string }[] = [
    { key: 'activeListings', label: 'Active Listings' },
    { key: 'monthlyDealConversionRate', label: 'Conversion Rate' },
    { key: 'avgTransactionValue', label: 'Avg Transaction Value' },
    { key: 'commissionPct', label: 'Commission %' },
    { key: 'activeSubscribers', label: 'Subscribers' },
    { key: 'premiumSlotsSold', label: 'Premium Slots' },
  ];

  const points: SensitivityPoint[] = [];
  for (const v of variables) {
    for (const delta of [-0.2, -0.1, 0.1, 0.2]) {
      const modified = { ...inputs, [v.key]: (inputs[v.key] as number) * (1 + delta) };
      const result = projectRevenue(modified, scenario, 12);
      points.push({
        variable: v.label,
        variablePct: delta * 100,
        m12Revenue: result.m12Revenue,
        m12Net: result.m12Net,
        deltaRevenuePct: baseline.m12Revenue > 0
          ? Math.round(((result.m12Revenue - baseline.m12Revenue) / baseline.m12Revenue) * 1000) / 10
          : 0,
      });
    }
  }
  return points;
}

// ─── High-Margin Opportunity Detection ────────────────────────────────────

export function detectHighMarginOpportunities(
  inputs: ProjectionInputs,
  baseResult: ProjectionResult,
): HighMarginOpportunity[] {
  const m12Rev = baseResult.m12Revenue;
  const opportunities: HighMarginOpportunity[] = [];

  // Subscription upsell — very high margin
  const subShare = baseResult.monthly[11]?.subscriptionRevenue ?? 0;
  if (inputs.activeSubscribers > 0) {
    opportunities.push({
      id: 'sub-upsell',
      stream: 'Subscriptions',
      currentRevenue: subShare * 12,
      potentialRevenue: Math.round(subShare * 12 * 1.4),
      upliftPct: 40,
      margin: 92,
      rationale: 'Introduce Platinum tier at 3× price with institutional analytics — 92% gross margin',
    });
  }

  // Premium slot expansion
  const premShare = baseResult.monthly[11]?.premiumRevenue ?? 0;
  opportunities.push({
    id: 'prem-expand',
    stream: 'Premium Listings',
    currentRevenue: premShare * 12,
    potentialRevenue: Math.round(premShare * 12 * 1.6),
    upliftPct: 60,
    margin: 88,
    rationale: 'Tiered visibility slots (Silver/Gold/Platinum) with dynamic auction pricing',
  });

  // Data API licensing
  opportunities.push({
    id: 'data-api',
    stream: 'Data Intelligence',
    currentRevenue: 0,
    potentialRevenue: Math.round(m12Rev * 0.05),
    upliftPct: 100,
    margin: 95,
    rationale: 'License anonymized market intelligence APIs to institutional investors',
  });

  // Vendor SaaS expansion
  const vendorShare = baseResult.monthly[11]?.vendorRevenue ?? 0;
  if (vendorShare > 0) {
    opportunities.push({
      id: 'vendor-saas',
      stream: 'Vendor SaaS',
      currentRevenue: vendorShare * 12,
      potentialRevenue: Math.round(vendorShare * 12 * 1.35),
      upliftPct: 35,
      margin: 85,
      rationale: 'Add CRM, analytics dashboard, and lead-gen tools to vendor subscription',
    });
  }

  return opportunities.sort((a, b) => b.margin * b.upliftPct - a.margin * a.upliftPct);
}
