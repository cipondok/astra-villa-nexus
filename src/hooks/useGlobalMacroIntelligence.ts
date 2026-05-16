import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CountryMacroProfile {
  country_code: string;
  country_name: string;
  flag_emoji: string;
  attractiveness_score: number;       // 0-100
  city_growth_momentum: number;       // 0-100
  foreign_investor_pressure: number;  // 0-100
  capital_inflow_probability: number; // 0-1
  interest_rate: number;
  interest_rate_trend: 'rising' | 'falling' | 'stable';
  currency_strength: number;          // vs USD index
  currency_trend: 'strengthening' | 'weakening' | 'stable';
  gdp_growth_pct: number;
  tourism_growth_pct: number;
  fdi_inflow_bn_usd: number;
  infrastructure_score: number;       // 0-100
  policy_incentive_score: number;     // 0-100
  bubble_risk: number;               // 0-100
  forecast_price_acceleration_12m: number; // % expected
  forecast_price_acceleration_36m: number;
  region: 'asia_pacific' | 'europe' | 'americas' | 'middle_east' | 'africa';
  tier: 'frontier' | 'emerging' | 'developed';
}

export interface RegionalHeatmapData {
  region_id: string;
  label: string;
  lat: number;
  lng: number;
  type: 'investment_corridor' | 'luxury_migration' | 'retirement_hotspot' | 'nomad_cluster';
  intensity: number;       // 0-100
  transaction_velocity: number;
  search_demand_index: number;
  gdp_growth_projection: number;
  country_code: string;
}

export interface CrossBorderStrategy {
  strategy_id: string;
  label: string;
  diversification_score: number;
  macro_risk_exposure: number;
  international_roi_rank: number;
  allocations: Array<{
    country_code: string;
    country_name: string;
    allocation_pct: number;
    expected_roi: number;
    currency_risk: 'low' | 'medium' | 'high';
    cycle_phase: 'early_expansion' | 'mid_expansion' | 'peak' | 'contraction' | 'recovery';
  }>;
}

export interface InfrastructureProject {
  id: string;
  name: string;
  country_code: string;
  country_name: string;
  city: string;
  type: 'airport' | 'rail' | 'smart_city' | 'sez' | 'coastal_tourism';
  completion_year: number;
  investment_bn_usd: number;
  land_price_uplift_pct: number;
  urban_expansion_direction: string;
  commercial_demand_surge: number; // 0-100
  impact_radius_km: number;
  status: 'planned' | 'under_construction' | 'completed';
}

export interface MacroAdvisoryBrief {
  id: string;
  month: string;
  title: string;
  summary: string;
  next_frontier_alert: string;
  bubble_warnings: string[];
  wealth_geography_strategy: string;
  top_opportunities: Array<{ country: string; reason: string; score: number }>;
}

// ─── Macro Prediction Model ──────────────────────────────────────────────────

function computeAttractiveness(params: {
  gdp_growth: number;
  interest_rate: number;
  fdi: number;
  tourism_growth: number;
  infrastructure: number;
  policy: number;
  currency_strength: number;
}): number {
  // Weighted composite: GDP(20%) + FDI(20%) + Tourism(15%) + Infrastructure(15%) + Policy(15%) + Rate_Attractiveness(10%) + Currency(5%)
  const rateScore = Math.max(0, 100 - params.interest_rate * 8); // lower rates = higher score
  return Math.min(100, Math.round(
    params.gdp_growth * 3.5 * 0.20 +
    Math.min(100, params.fdi * 5) * 0.20 +
    params.tourism_growth * 3 * 0.15 +
    params.infrastructure * 0.15 +
    params.policy * 0.15 +
    rateScore * 0.10 +
    params.currency_strength * 0.05
  ));
}

function computeBubbleRisk(params: {
  price_acceleration: number;
  interest_rate_trend: string;
  gdp_growth: number;
  fdi: number;
}): number {
  let risk = 0;
  if (params.price_acceleration > 15) risk += 30;
  else if (params.price_acceleration > 10) risk += 15;
  if (params.interest_rate_trend === 'rising') risk += 20;
  if (params.gdp_growth < 2) risk += 15;
  if (params.fdi < 5) risk += 10;
  risk += Math.max(0, params.price_acceleration - 8) * 2;
  return Math.min(100, risk);
}

function computeCapitalInflowProbability(attractiveness: number, fdi: number, policy: number): number {
  return Math.min(1, (attractiveness / 100 * 0.5 + Math.min(1, fdi / 30) * 0.3 + policy / 100 * 0.2));
}

// ─── Static seed data (simulated macro intelligence) ─────────────────────────

const MACRO_SEED: CountryMacroProfile[] = [
  {
    country_code: 'ID', country_name: 'Indonesia', flag_emoji: '🇮🇩', region: 'asia_pacific', tier: 'emerging',
    interest_rate: 6.0, interest_rate_trend: 'stable', currency_strength: 42, currency_trend: 'stable',
    gdp_growth_pct: 5.1, tourism_growth_pct: 18, fdi_inflow_bn_usd: 22, infrastructure_score: 72, policy_incentive_score: 80,
    forecast_price_acceleration_12m: 8.5, forecast_price_acceleration_36m: 28,
    attractiveness_score: 0, city_growth_momentum: 78, foreign_investor_pressure: 72, capital_inflow_probability: 0, bubble_risk: 0,
  },
  {
    country_code: 'TH', country_name: 'Thailand', flag_emoji: '🇹🇭', region: 'asia_pacific', tier: 'emerging',
    interest_rate: 2.5, interest_rate_trend: 'falling', currency_strength: 48, currency_trend: 'weakening',
    gdp_growth_pct: 3.8, tourism_growth_pct: 22, fdi_inflow_bn_usd: 10, infrastructure_score: 65, policy_incentive_score: 70,
    forecast_price_acceleration_12m: 6.2, forecast_price_acceleration_36m: 18,
    attractiveness_score: 0, city_growth_momentum: 65, foreign_investor_pressure: 68, capital_inflow_probability: 0, bubble_risk: 0,
  },
  {
    country_code: 'VN', country_name: 'Vietnam', flag_emoji: '🇻🇳', region: 'asia_pacific', tier: 'frontier',
    interest_rate: 4.5, interest_rate_trend: 'falling', currency_strength: 38, currency_trend: 'stable',
    gdp_growth_pct: 6.5, tourism_growth_pct: 25, fdi_inflow_bn_usd: 18, infrastructure_score: 58, policy_incentive_score: 75,
    forecast_price_acceleration_12m: 12, forecast_price_acceleration_36m: 38,
    attractiveness_score: 0, city_growth_momentum: 85, foreign_investor_pressure: 60, capital_inflow_probability: 0, bubble_risk: 0,
  },
  {
    country_code: 'AE', country_name: 'UAE', flag_emoji: '🇦🇪', region: 'middle_east', tier: 'developed',
    interest_rate: 5.4, interest_rate_trend: 'stable', currency_strength: 78, currency_trend: 'stable',
    gdp_growth_pct: 3.5, tourism_growth_pct: 12, fdi_inflow_bn_usd: 25, infrastructure_score: 92, policy_incentive_score: 88,
    forecast_price_acceleration_12m: 5, forecast_price_acceleration_36m: 15,
    attractiveness_score: 0, city_growth_momentum: 70, foreign_investor_pressure: 90, capital_inflow_probability: 0, bubble_risk: 0,
  },
  {
    country_code: 'PT', country_name: 'Portugal', flag_emoji: '🇵🇹', region: 'europe', tier: 'developed',
    interest_rate: 4.25, interest_rate_trend: 'falling', currency_strength: 65, currency_trend: 'strengthening',
    gdp_growth_pct: 2.3, tourism_growth_pct: 8, fdi_inflow_bn_usd: 6, infrastructure_score: 75, policy_incentive_score: 65,
    forecast_price_acceleration_12m: 4, forecast_price_acceleration_36m: 12,
    attractiveness_score: 0, city_growth_momentum: 55, foreign_investor_pressure: 75, capital_inflow_probability: 0, bubble_risk: 0,
  },
  {
    country_code: 'MY', country_name: 'Malaysia', flag_emoji: '🇲🇾', region: 'asia_pacific', tier: 'emerging',
    interest_rate: 3.0, interest_rate_trend: 'stable', currency_strength: 45, currency_trend: 'weakening',
    gdp_growth_pct: 4.7, tourism_growth_pct: 15, fdi_inflow_bn_usd: 12, infrastructure_score: 70, policy_incentive_score: 72,
    forecast_price_acceleration_12m: 7, forecast_price_acceleration_36m: 22,
    attractiveness_score: 0, city_growth_momentum: 68, foreign_investor_pressure: 58, capital_inflow_probability: 0, bubble_risk: 0,
  },
  {
    country_code: 'TR', country_name: 'Turkey', flag_emoji: '🇹🇷', region: 'europe', tier: 'emerging',
    interest_rate: 42, interest_rate_trend: 'falling', currency_strength: 20, currency_trend: 'weakening',
    gdp_growth_pct: 4.0, tourism_growth_pct: 20, fdi_inflow_bn_usd: 9, infrastructure_score: 68, policy_incentive_score: 60,
    forecast_price_acceleration_12m: 25, forecast_price_acceleration_36m: 65,
    attractiveness_score: 0, city_growth_momentum: 75, foreign_investor_pressure: 82, capital_inflow_probability: 0, bubble_risk: 0,
  },
  {
    country_code: 'MX', country_name: 'Mexico', flag_emoji: '🇲🇽', region: 'americas', tier: 'emerging',
    interest_rate: 10.5, interest_rate_trend: 'falling', currency_strength: 50, currency_trend: 'stable',
    gdp_growth_pct: 3.2, tourism_growth_pct: 10, fdi_inflow_bn_usd: 30, infrastructure_score: 55, policy_incentive_score: 58,
    forecast_price_acceleration_12m: 6, forecast_price_acceleration_36m: 18,
    attractiveness_score: 0, city_growth_momentum: 60, foreign_investor_pressure: 65, capital_inflow_probability: 0, bubble_risk: 0,
  },
  {
    country_code: 'GR', country_name: 'Greece', flag_emoji: '🇬🇷', region: 'europe', tier: 'developed',
    interest_rate: 4.25, interest_rate_trend: 'falling', currency_strength: 65, currency_trend: 'strengthening',
    gdp_growth_pct: 2.5, tourism_growth_pct: 14, fdi_inflow_bn_usd: 5, infrastructure_score: 60, policy_incentive_score: 72,
    forecast_price_acceleration_12m: 7, forecast_price_acceleration_36m: 20,
    attractiveness_score: 0, city_growth_momentum: 62, foreign_investor_pressure: 70, capital_inflow_probability: 0, bubble_risk: 0,
  },
  {
    country_code: 'SA', country_name: 'Saudi Arabia', flag_emoji: '🇸🇦', region: 'middle_east', tier: 'emerging',
    interest_rate: 6.0, interest_rate_trend: 'stable', currency_strength: 80, currency_trend: 'stable',
    gdp_growth_pct: 4.2, tourism_growth_pct: 30, fdi_inflow_bn_usd: 15, infrastructure_score: 85, policy_incentive_score: 90,
    forecast_price_acceleration_12m: 10, forecast_price_acceleration_36m: 35,
    attractiveness_score: 0, city_growth_momentum: 88, foreign_investor_pressure: 55, capital_inflow_probability: 0, bubble_risk: 0,
  },
  {
    country_code: 'PH', country_name: 'Philippines', flag_emoji: '🇵🇭', region: 'asia_pacific', tier: 'frontier',
    interest_rate: 6.25, interest_rate_trend: 'falling', currency_strength: 35, currency_trend: 'stable',
    gdp_growth_pct: 5.8, tourism_growth_pct: 20, fdi_inflow_bn_usd: 8, infrastructure_score: 50, policy_incentive_score: 65,
    forecast_price_acceleration_12m: 9, forecast_price_acceleration_36m: 30,
    attractiveness_score: 0, city_growth_momentum: 72, foreign_investor_pressure: 48, capital_inflow_probability: 0, bubble_risk: 0,
  },
  {
    country_code: 'KE', country_name: 'Kenya', flag_emoji: '🇰🇪', region: 'africa', tier: 'frontier',
    interest_rate: 12.0, interest_rate_trend: 'stable', currency_strength: 22, currency_trend: 'weakening',
    gdp_growth_pct: 5.5, tourism_growth_pct: 12, fdi_inflow_bn_usd: 2, infrastructure_score: 40, policy_incentive_score: 55,
    forecast_price_acceleration_12m: 8, forecast_price_acceleration_36m: 25,
    attractiveness_score: 0, city_growth_momentum: 58, foreign_investor_pressure: 30, capital_inflow_probability: 0, bubble_risk: 0,
  },
];

// Compute derived scores
const computedProfiles = MACRO_SEED.map(p => {
  const attractiveness = computeAttractiveness({
    gdp_growth: p.gdp_growth_pct,
    interest_rate: p.interest_rate,
    fdi: p.fdi_inflow_bn_usd,
    tourism_growth: p.tourism_growth_pct,
    infrastructure: p.infrastructure_score,
    policy: p.policy_incentive_score,
    currency_strength: p.currency_strength,
  });
  const bubble_risk = computeBubbleRisk({
    price_acceleration: p.forecast_price_acceleration_12m,
    interest_rate_trend: p.interest_rate_trend,
    gdp_growth: p.gdp_growth_pct,
    fdi: p.fdi_inflow_bn_usd,
  });
  const capital_inflow_probability = computeCapitalInflowProbability(attractiveness, p.fdi_inflow_bn_usd, p.policy_incentive_score);
  return { ...p, attractiveness_score: attractiveness, bubble_risk, capital_inflow_probability };
});

// Infrastructure projects seed
const INFRA_PROJECTS: InfrastructureProject[] = [
  { id: '1', name: 'IKN Nusantara New Capital', country_code: 'ID', country_name: 'Indonesia', city: 'Nusantara', type: 'smart_city', completion_year: 2028, investment_bn_usd: 35, land_price_uplift_pct: 120, urban_expansion_direction: 'East Kalimantan', commercial_demand_surge: 85, impact_radius_km: 50, status: 'under_construction' },
  { id: '2', name: 'NEOM', country_code: 'SA', country_name: 'Saudi Arabia', city: 'NEOM', type: 'smart_city', completion_year: 2030, investment_bn_usd: 500, land_price_uplift_pct: 200, urban_expansion_direction: 'Northwest Coast', commercial_demand_surge: 95, impact_radius_km: 80, status: 'under_construction' },
  { id: '3', name: 'Jakarta-Bandung HSR', country_code: 'ID', country_name: 'Indonesia', city: 'Jakarta-Bandung', type: 'rail', completion_year: 2025, investment_bn_usd: 7.3, land_price_uplift_pct: 40, urban_expansion_direction: 'Southeast Java', commercial_demand_surge: 70, impact_radius_km: 15, status: 'completed' },
  { id: '4', name: 'New Istanbul Airport Expansion', country_code: 'TR', country_name: 'Turkey', city: 'Istanbul', type: 'airport', completion_year: 2027, investment_bn_usd: 12, land_price_uplift_pct: 35, urban_expansion_direction: 'North Istanbul', commercial_demand_surge: 65, impact_radius_km: 25, status: 'under_construction' },
  { id: '5', name: 'Bali SEZ', country_code: 'ID', country_name: 'Indonesia', city: 'Bali', type: 'sez', completion_year: 2026, investment_bn_usd: 2.5, land_price_uplift_pct: 45, urban_expansion_direction: 'South Bali', commercial_demand_surge: 78, impact_radius_km: 20, status: 'under_construction' },
  { id: '6', name: 'Lisbon Metro Expansion', country_code: 'PT', country_name: 'Portugal', city: 'Lisbon', type: 'rail', completion_year: 2028, investment_bn_usd: 3, land_price_uplift_pct: 25, urban_expansion_direction: 'South Bank', commercial_demand_surge: 55, impact_radius_km: 10, status: 'planned' },
  { id: '7', name: 'Cancún Maya Train', country_code: 'MX', country_name: 'Mexico', city: 'Cancún', type: 'rail', completion_year: 2025, investment_bn_usd: 8, land_price_uplift_pct: 30, urban_expansion_direction: 'Yucatan Peninsula', commercial_demand_surge: 60, impact_radius_km: 30, status: 'under_construction' },
  { id: '8', name: 'Clark International Airport', country_code: 'PH', country_name: 'Philippines', city: 'Clark', type: 'airport', completion_year: 2026, investment_bn_usd: 4, land_price_uplift_pct: 55, urban_expansion_direction: 'Central Luzon', commercial_demand_surge: 72, impact_radius_km: 20, status: 'under_construction' },
  { id: '9', name: 'Labuan Bajo Coastal Tourism', country_code: 'ID', country_name: 'Indonesia', city: 'Labuan Bajo', type: 'coastal_tourism', completion_year: 2027, investment_bn_usd: 1.5, land_price_uplift_pct: 90, urban_expansion_direction: 'Flores Coast', commercial_demand_surge: 80, impact_radius_km: 15, status: 'under_construction' },
  { id: '10', name: 'Athens Riviera Redevelopment', country_code: 'GR', country_name: 'Greece', city: 'Athens', type: 'coastal_tourism', completion_year: 2028, investment_bn_usd: 8, land_price_uplift_pct: 50, urban_expansion_direction: 'Athenian Riviera', commercial_demand_surge: 68, impact_radius_km: 12, status: 'under_construction' },
];

const HEATMAP_DATA: RegionalHeatmapData[] = [
  { region_id: 'bali', label: 'Bali Digital Nomad Hub', lat: -8.34, lng: 115.09, type: 'nomad_cluster', intensity: 92, transaction_velocity: 85, search_demand_index: 95, gdp_growth_projection: 5.1, country_code: 'ID' },
  { region_id: 'dubai', label: 'Dubai Luxury Corridor', lat: 25.20, lng: 55.27, type: 'luxury_migration', intensity: 88, transaction_velocity: 90, search_demand_index: 82, gdp_growth_projection: 3.5, country_code: 'AE' },
  { region_id: 'lisbon', label: 'Lisbon Retirement Zone', lat: 38.72, lng: -9.14, type: 'retirement_hotspot', intensity: 75, transaction_velocity: 65, search_demand_index: 78, gdp_growth_projection: 2.3, country_code: 'PT' },
  { region_id: 'cancun', label: 'Cancún Investment Corridor', lat: 21.16, lng: -86.85, type: 'investment_corridor', intensity: 70, transaction_velocity: 72, search_demand_index: 68, gdp_growth_projection: 3.2, country_code: 'MX' },
  { region_id: 'hcmc', label: 'HCMC Growth Corridor', lat: 10.82, lng: 106.63, type: 'investment_corridor', intensity: 82, transaction_velocity: 88, search_demand_index: 76, gdp_growth_projection: 6.5, country_code: 'VN' },
  { region_id: 'istanbul', label: 'Istanbul Foreign Buyer Zone', lat: 41.01, lng: 28.98, type: 'investment_corridor', intensity: 78, transaction_velocity: 82, search_demand_index: 85, gdp_growth_projection: 4.0, country_code: 'TR' },
  { region_id: 'kl', label: 'KL MM2H Hub', lat: 3.14, lng: 101.69, type: 'retirement_hotspot', intensity: 68, transaction_velocity: 60, search_demand_index: 70, gdp_growth_projection: 4.7, country_code: 'MY' },
  { region_id: 'chiang_mai', label: 'Chiang Mai Nomad Hub', lat: 18.79, lng: 98.98, type: 'nomad_cluster', intensity: 80, transaction_velocity: 55, search_demand_index: 88, gdp_growth_projection: 3.8, country_code: 'TH' },
  { region_id: 'nairobi', label: 'Nairobi Tech Hub', lat: -1.29, lng: 36.82, type: 'investment_corridor', intensity: 55, transaction_velocity: 45, search_demand_index: 50, gdp_growth_projection: 5.5, country_code: 'KE' },
  { region_id: 'neom', label: 'NEOM Smart City Zone', lat: 27.95, lng: 35.30, type: 'luxury_migration', intensity: 65, transaction_velocity: 30, search_demand_index: 90, gdp_growth_projection: 4.2, country_code: 'SA' },
];

const CROSS_BORDER_STRATEGIES: CrossBorderStrategy[] = [
  {
    strategy_id: 'conservative_global',
    label: 'Conservative Global',
    diversification_score: 85,
    macro_risk_exposure: 25,
    international_roi_rank: 3,
    allocations: [
      { country_code: 'AE', country_name: 'UAE', allocation_pct: 30, expected_roi: 8, currency_risk: 'low', cycle_phase: 'mid_expansion' },
      { country_code: 'PT', country_name: 'Portugal', allocation_pct: 25, expected_roi: 6, currency_risk: 'low', cycle_phase: 'mid_expansion' },
      { country_code: 'MY', country_name: 'Malaysia', allocation_pct: 25, expected_roi: 9, currency_risk: 'medium', cycle_phase: 'early_expansion' },
      { country_code: 'ID', country_name: 'Indonesia', allocation_pct: 20, expected_roi: 12, currency_risk: 'medium', cycle_phase: 'early_expansion' },
    ],
  },
  {
    strategy_id: 'aggressive_frontier',
    label: 'Aggressive Frontier',
    diversification_score: 72,
    macro_risk_exposure: 65,
    international_roi_rank: 1,
    allocations: [
      { country_code: 'VN', country_name: 'Vietnam', allocation_pct: 30, expected_roi: 18, currency_risk: 'medium', cycle_phase: 'early_expansion' },
      { country_code: 'ID', country_name: 'Indonesia', allocation_pct: 25, expected_roi: 15, currency_risk: 'medium', cycle_phase: 'early_expansion' },
      { country_code: 'TR', country_name: 'Turkey', allocation_pct: 25, expected_roi: 22, currency_risk: 'high', cycle_phase: 'recovery' },
      { country_code: 'PH', country_name: 'Philippines', allocation_pct: 20, expected_roi: 14, currency_risk: 'medium', cycle_phase: 'early_expansion' },
    ],
  },
  {
    strategy_id: 'balanced_apac',
    label: 'Balanced Asia-Pacific',
    diversification_score: 78,
    macro_risk_exposure: 40,
    international_roi_rank: 2,
    allocations: [
      { country_code: 'ID', country_name: 'Indonesia', allocation_pct: 35, expected_roi: 13, currency_risk: 'medium', cycle_phase: 'early_expansion' },
      { country_code: 'TH', country_name: 'Thailand', allocation_pct: 25, expected_roi: 9, currency_risk: 'medium', cycle_phase: 'mid_expansion' },
      { country_code: 'MY', country_name: 'Malaysia', allocation_pct: 20, expected_roi: 10, currency_risk: 'medium', cycle_phase: 'early_expansion' },
      { country_code: 'VN', country_name: 'Vietnam', allocation_pct: 20, expected_roi: 16, currency_risk: 'medium', cycle_phase: 'early_expansion' },
    ],
  },
];

const ADVISORY_BRIEF: MacroAdvisoryBrief = {
  id: 'brief-2026-03',
  month: 'March 2026',
  title: 'Capital Rotation Toward Southeast Asia Accelerates',
  summary: 'Global capital is rotating from overpriced Western markets toward high-growth Southeast Asian corridors. Indonesia leads with the IKN new capital catalyst, while Vietnam\'s manufacturing FDI spillover drives residential demand in HCMC and Hanoi. Turkey offers contrarian value post-rate-normalization.',
  next_frontier_alert: 'Saudi Arabia\'s NEOM and Red Sea projects are creating a new luxury real estate frontier — early movers will see 2-3x land value appreciation by 2030.',
  bubble_warnings: [
    'Dubai luxury segment showing 15%+ annual appreciation — approaching overheated territory',
    'Bali villa market experiencing rapid price inflation (>20% YoY in premium zones)',
  ],
  wealth_geography_strategy: 'Overweight: Indonesia (IKN + Bali), Vietnam (HCMC), Saudi Arabia (NEOM). Neutral: UAE, Malaysia. Underweight: Western Europe (yield compression).',
  top_opportunities: [
    { country: 'Indonesia', reason: 'New capital IKN + Bali SEZ + strong tourism recovery', score: 92 },
    { country: 'Vietnam', reason: 'Manufacturing FDI spillover + youngest demographics in ASEAN', score: 88 },
    { country: 'Saudi Arabia', reason: 'NEOM mega-project + Vision 2030 policy tailwinds', score: 85 },
    { country: 'Turkey', reason: 'Contrarian value play post rate normalization', score: 78 },
    { country: 'Greece', reason: 'Golden visa + tourism renaissance + Athens Riviera', score: 74 },
  ],
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCountryMacroProfiles() {
  return useQuery({
    queryKey: ['global-macro-profiles'],
    queryFn: async () => {
      // In production, fetch from supabase table or edge function
      // For now, return computed seed data
      return computedProfiles.sort((a, b) => b.attractiveness_score - a.attractiveness_score);
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useRegionalHeatmap() {
  return useQuery({
    queryKey: ['global-macro-heatmap'],
    queryFn: async () => HEATMAP_DATA.sort((a, b) => b.intensity - a.intensity),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCrossBorderStrategies() {
  return useQuery({
    queryKey: ['global-cross-border-strategies'],
    queryFn: async () => CROSS_BORDER_STRATEGIES,
    staleTime: 10 * 60 * 1000,
  });
}

export function useInfrastructureProjects() {
  return useQuery({
    queryKey: ['global-infrastructure-projects'],
    queryFn: async () => INFRA_PROJECTS.sort((a, b) => b.land_price_uplift_pct - a.land_price_uplift_pct),
    staleTime: 10 * 60 * 1000,
  });
}

export function useMacroAdvisoryBrief() {
  return useQuery({
    queryKey: ['global-macro-advisory'],
    queryFn: async () => ADVISORY_BRIEF,
    staleTime: 30 * 60 * 1000,
  });
}
