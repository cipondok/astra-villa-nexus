export interface DemandForecastVariable {
  id: string;
  name: string;
  weight: number;
  source: string;
  updateFrequency: string;
  description: string;
}

export interface DemandForecastOutput {
  metric: string;
  description: string;
  format: string;
  actionTrigger: string;
}

export interface SeasonalPattern {
  period: string;
  demandLevel: 'peak' | 'high' | 'moderate' | 'low';
  driver: string;
  pricingGuidance: string;
}

export interface AccuracyMilestone {
  phase: number;
  title: string;
  duration: string;
  targetAccuracy: string;
  initiatives: string[];
  dataRequirement: string;
}

export interface DeploymentPhase {
  phase: number;
  title: string;
  duration: string;
  deliverables: string[];
  successMetric: string;
}

export interface ForecastTier {
  score: string;
  label: string;
  color: 'emerald' | 'blue' | 'amber' | 'red';
  timeToSell: string;
  pricingAction: string;
  marketingAction: string;
}

const VARIABLES: DemandForecastVariable[] = [
  { id: 'v1', name: 'Inquiry Velocity', weight: 25, source: 'behavioral_events + property_inquiries', updateFrequency: 'Real-time', description: 'Rate of new inquiries per listing per day — 7-day rolling average vs 30-day baseline to detect acceleration or deceleration trends' },
  { id: 'v2', name: 'Search Volume Index', weight: 20, source: 'search_logs + district aggregation', updateFrequency: 'Daily', description: 'District-level search query volume weighted by property type match — normalized against city-wide baseline to identify relative demand shifts' },
  { id: 'v3', name: 'Viewing Booking Density', weight: 18, source: 'viewing_schedules + booking_confirmations', updateFrequency: 'Daily', description: 'Ratio of viewing bookings to total impressions — measures conversion from passive interest to active intent signal' },
  { id: 'v4', name: 'Price Competitiveness Ratio', weight: 15, source: 'ai_price_predictions + market_comparables', updateFrequency: 'Weekly', description: 'Listing price vs AI Fair Market Value (FMV) ratio — properties priced ≤95% of FMV receive demand uplift multiplier' },
  { id: 'v5', name: 'Seasonal Cycle Factor', weight: 10, source: 'historical_transactions + calendar_events', updateFrequency: 'Monthly', description: 'Cyclical demand adjustment based on 12-month transaction pattern analysis — accounts for Ramadan, year-end, and school-cycle effects' },
  { id: 'v6', name: 'Watchlist Momentum', weight: 7, source: 'user_watchlists + save_events', updateFrequency: 'Real-time', description: 'Rate of new watchlist additions — sudden spikes indicate emerging demand before inquiry conversion' },
  { id: 'v7', name: 'Liquidity District Score', weight: 5, source: 'district_liquidity_scores', updateFrequency: 'Daily', description: 'Inherited district-level liquidity rating — high-liquidity districts amplify individual listing demand forecasts' },
];

const OUTPUTS: DemandForecastOutput[] = [
  { metric: 'Demand Forecast Score (0-100)', description: 'Composite score predicting relative demand intensity for a listing over the next 14-30 days', format: 'Integer score with tier classification (Hot / Warm / Cool / Cold)', actionTrigger: 'Score change >15 points in 48 hours triggers admin notification' },
  { metric: 'Estimated Time-to-Sell', description: 'Projected days until listing receives a qualified offer based on current demand trajectory', format: 'Range in days (e.g., 14-21 days) with confidence interval', actionTrigger: 'Projection exceeds 60 days → pricing adjustment recommendation auto-generated' },
  { metric: 'Pricing Adjustment Range', description: 'Recommended price band to optimize demand-to-margin balance', format: 'Percentage range (e.g., -5% to +3%) relative to current asking price', actionTrigger: 'Price competitiveness ratio falls below 0.85 → urgent repricing alert' },
  { metric: 'Marketing Visibility Boost', description: 'Recommended promotional intensity based on demand gap analysis', format: 'Priority level (Critical / High / Standard / None) with channel suggestion', actionTrigger: 'High-quality listing with demand score <40 → auto-suggest premium slot upgrade' },
];

const TIERS: ForecastTier[] = [
  { score: '80-100', label: 'Hot Demand', color: 'emerald', timeToSell: '7-14 days', pricingAction: 'Hold or increase 2-5% — strong buyer competition expected', marketingAction: 'Minimal spend needed — organic demand sufficient' },
  { score: '60-79', label: 'Warm Demand', color: 'blue', timeToSell: '15-30 days', pricingAction: 'Maintain current pricing — monitor weekly for trend shifts', marketingAction: 'Standard visibility — consider featured placement for acceleration' },
  { score: '35-59', label: 'Cool Demand', color: 'amber', timeToSell: '31-60 days', pricingAction: 'Consider 3-7% reduction or value-add bundling to stimulate interest', marketingAction: 'Boost visibility — activate premium slot and targeted investor alerts' },
  { score: '0-34', label: 'Cold Demand', color: 'red', timeToSell: '60+ days', pricingAction: 'Reprice 8-15% below current ask or reposition listing strategy entirely', marketingAction: 'Critical intervention — reassess target audience and listing quality score' },
];

const SEASONAL_PATTERNS: SeasonalPattern[] = [
  { period: 'January-February', demandLevel: 'moderate', driver: 'Post-holiday recovery — gradual return of buyer activity after year-end closings', pricingGuidance: 'Hold pricing steady — early-year buyers are typically decisive' },
  { period: 'March-April', demandLevel: 'high', driver: 'Pre-Ramadan acceleration — buyers rush to close before fasting month reduces activity', pricingGuidance: 'Firm pricing — urgency-driven demand supports premium positioning' },
  { period: 'May-June (Ramadan/Eid)', demandLevel: 'low', driver: 'Seasonal slowdown — reduced viewing activity and delayed decision-making', pricingGuidance: 'Offer incentives — flexible terms or bonus packages to maintain pipeline' },
  { period: 'July-August', demandLevel: 'high', driver: 'Post-Eid rebound + mid-year bonus deployment — strong investor re-engagement', pricingGuidance: 'Competitive pricing to capture returning investor capital' },
  { period: 'September-October', demandLevel: 'moderate', driver: 'School cycle stabilization — family buyers active for year-end move-in targets', pricingGuidance: 'Standard pricing with family-oriented value messaging' },
  { period: 'November-December', demandLevel: 'peak', driver: 'Year-end tax optimization + developer promotions + bonus season liquidity surge', pricingGuidance: 'Premium positioning — highest absorption rates and deal velocity of the year' },
];

const ACCURACY_ROADMAP: AccuracyMilestone[] = [
  { phase: 1, title: 'Baseline Heuristic Model', duration: 'Months 1-2', targetAccuracy: '55-65% directional accuracy', initiatives: ['Deploy weighted-average scoring using 7 input variables', 'Calibrate initial weights using historical transaction data from past 6 months', 'Establish accuracy measurement framework comparing forecast vs actual time-to-sell'], dataRequirement: '≥500 completed transactions with full behavioral signal history' },
  { phase: 2, title: 'Pattern Recognition Enhancement', duration: 'Months 3-4', targetAccuracy: '65-75% directional accuracy', initiatives: ['Integrate seasonal adjustment factors based on 12-month cycle analysis', 'Add district-specific demand baseline normalization', 'Implement price elasticity feedback from completed vs expired listings', 'Deploy A/B testing framework for weight optimization'], dataRequirement: '≥1,000 transactions + 6 months of behavioral event data' },
  { phase: 3, title: 'Predictive Model Maturation', duration: 'Months 5-8', targetAccuracy: '75-82% directional accuracy', initiatives: ['Introduce time-series trend analysis for inquiry velocity prediction', 'Add cross-listing demand cannibalization detection', 'Implement confidence interval calibration for time-to-sell estimates', 'Deploy automated weight recalibration via learning engine'], dataRequirement: '≥3,000 transactions + 12 months of continuous signal data' },
  { phase: 4, title: 'Intelligence Superiority', duration: 'Months 9-12', targetAccuracy: '82-90% directional accuracy', initiatives: ['Deploy ensemble model combining heuristic and ML-derived scores', 'Add macro-economic signal integration (interest rates, GDP growth)', 'Implement district-level micro-cycle detection and phase prediction', 'Build explainable AI layer for forecast reasoning transparency'], dataRequirement: '≥5,000 transactions + external macro data feeds integrated' },
];

const DEPLOYMENT: DeploymentPhase[] = [
  { phase: 1, title: 'Data Pipeline & Signal Collection', duration: 'Weeks 1-3', deliverables: ['Build demand signal aggregation pipeline from behavioral_events table', 'Create listing_demand_forecasts table with daily snapshot storage', 'Implement real-time inquiry velocity calculator with 7/30-day rolling windows', 'Deploy district search volume indexing from search logs'], successMetric: 'All 7 input variables collecting data with <5 minute latency' },
  { phase: 2, title: 'Scoring Engine & Tier Classification', duration: 'Weeks 4-6', deliverables: ['Deploy weighted demand forecast scoring engine as Edge Function', 'Implement 4-tier classification system (Hot/Warm/Cool/Cold)', 'Build time-to-sell estimation model using historical close-rate data', 'Create pricing adjustment recommendation engine'], successMetric: 'Demand scores generating for 100% of active listings with hourly refresh' },
  { phase: 3, title: 'Dashboard & Alert Integration', duration: 'Weeks 7-9', deliverables: ['Launch demand forecast visualization on listing detail pages', 'Deploy admin dashboard with district-level demand heatmap', 'Activate alert triggers for demand surge and demand collapse detection', 'Integrate forecast data with existing liquidity scoring pipeline'], successMetric: 'Dashboard live + alerts firing within 10 minutes of threshold breach' },
  { phase: 4, title: 'Optimization & Accuracy Loop', duration: 'Weeks 10-12', deliverables: ['Deploy accuracy tracking comparing forecast vs actual outcomes', 'Implement automated weight recalibration based on prediction errors', 'Build seasonal adjustment calibration using first cycle of data', 'Launch A/B test framework for pricing recommendation validation'], successMetric: 'Forecast accuracy ≥60% directional + automated recalibration active' },
];

export function useListingDemandForecast() {
  return {
    variables: VARIABLES,
    outputs: OUTPUTS,
    tiers: TIERS,
    seasonalPatterns: SEASONAL_PATTERNS,
    accuracyRoadmap: ACCURACY_ROADMAP,
    deployment: DEPLOYMENT,
    totalWeight: VARIABLES.reduce((s, v) => s + v.weight, 0),
  };
}
