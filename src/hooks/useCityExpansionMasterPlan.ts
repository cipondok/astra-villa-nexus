import { useMemo } from 'react';

export type LaunchWave = 'wave_1' | 'wave_2' | 'wave_3';
export type PhaseKey = 'qualification' | 'pilot' | 'density' | 'stabilization';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface CityPlan {
  city: string;
  province: string;
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3';
  wave: LaunchWave;
  priorityScore: number;
  population: number;
  monthlyTxn: number;
  rentalYield: number;
  competitorGap: number;
  launchBudget: number;
  currentPhase: PhaseKey;
  phasePct: number;
  kpis: CityKPI[];
  risks: CityRisk[];
  resourceAllocation: ResourceAlloc;
}

export interface CityKPI {
  label: string;
  target: number;
  unit: string;
  byMonth: number;
}

export interface CityRisk {
  risk: string;
  level: RiskLevel;
  mitigation: string;
}

export interface ResourceAlloc {
  teamSize: number;
  marketingBudget: number;
  agentIncentives: number;
  techInfra: number;
}

export interface WaveConfig {
  wave: LaunchWave;
  label: string;
  timeline: string;
  cities: string[];
  totalBudget: number;
  targetListings: number;
  targetDeals: number;
}

export interface PhaseConfig {
  key: PhaseKey;
  label: string;
  duration: string;
  milestones: string[];
  gateMetric: string;
}

const PHASES: PhaseConfig[] = [
  { key: 'qualification', label: 'Market Qualification', duration: '4-6 weeks',
    milestones: ['Complete transaction volume analysis', 'Assess digital adoption rate (>45%)', 'Map competitor presence & gaps', 'Validate pricing volatility bands'],
    gateMetric: 'Priority Score ≥ 65 + 10 agent contacts confirmed' },
  { key: 'pilot', label: 'Liquidity Pilot Launch', duration: '6-8 weeks',
    milestones: ['Onboard 80+ initial listings', 'Recruit 10+ local agents', 'Activate 3 demand campaigns', 'Close 5 benchmark transactions'],
    gateMetric: '100+ active listings + 5 closed deals' },
  { key: 'density', label: 'Density & Momentum', duration: '8-12 weeks',
    milestones: ['Reach 300+ listings density', 'Publish 3 local success stories', 'Achieve 15% referral acquisition rate', 'Activate investor subscription trials'],
    gateMetric: '300+ listings + 20% MoM inquiry growth' },
  { key: 'stabilization', label: 'Operational Stabilization', duration: '6-8 weeks',
    milestones: ['Standardize onboarding to <48h cycle', 'Launch 2 monetization experiments', 'Deploy city leadership dashboard', 'Achieve break-even trajectory'],
    gateMetric: 'Positive unit economics + <3 day listing activation' },
];

const CITY_DATA: CityPlan[] = [
  {
    city: 'Jakarta (Jabodetabek)', province: 'DKI Jakarta', tier: 'Tier 1', wave: 'wave_1',
    priorityScore: 92, population: 34_000_000, monthlyTxn: 2800, rentalYield: 5.2, competitorGap: 72,
    launchBudget: 850_000_000, currentPhase: 'density', phasePct: 65,
    kpis: [
      { label: 'Active Listings', target: 1000, unit: 'listings', byMonth: 6 },
      { label: 'Monthly Deals', target: 80, unit: 'deals', byMonth: 9 },
      { label: 'Agent Network', target: 100, unit: 'agents', byMonth: 8 },
      { label: 'Monthly Revenue', target: 500_000_000, unit: 'Rp', byMonth: 10 },
    ],
    risks: [
      { risk: 'Intense portal competition', level: 'high', mitigation: 'Differentiate via AI intelligence layer and investor tools' },
      { risk: 'High CAC in saturated market', level: 'medium', mitigation: 'Focus on organic/referral channels, agent-driven supply' },
    ],
    resourceAllocation: { teamSize: 8, marketingBudget: 350_000_000, agentIncentives: 200_000_000, techInfra: 150_000_000 },
  },
  {
    city: 'Bali (Denpasar/Badung)', province: 'Bali', tier: 'Tier 1', wave: 'wave_1',
    priorityScore: 88, population: 4_400_000, monthlyTxn: 650, rentalYield: 8.5, competitorGap: 78,
    launchBudget: 600_000_000, currentPhase: 'pilot', phasePct: 40,
    kpis: [
      { label: 'Active Listings', target: 500, unit: 'listings', byMonth: 5 },
      { label: 'Monthly Deals', target: 40, unit: 'deals', byMonth: 8 },
      { label: 'Agent Network', target: 50, unit: 'agents', byMonth: 6 },
      { label: 'Monthly Revenue', target: 300_000_000, unit: 'Rp', byMonth: 9 },
    ],
    risks: [
      { risk: 'Seasonal demand volatility', level: 'medium', mitigation: 'Build investor-focused year-round rental yield product' },
      { risk: 'Foreign ownership regulation', level: 'low', mitigation: 'Provide compliant ownership structure advisory' },
    ],
    resourceAllocation: { teamSize: 5, marketingBudget: 250_000_000, agentIncentives: 150_000_000, techInfra: 100_000_000 },
  },
  {
    city: 'Surabaya', province: 'Jawa Timur', tier: 'Tier 1', wave: 'wave_1',
    priorityScore: 82, population: 2_900_000, monthlyTxn: 480, rentalYield: 5.8, competitorGap: 80,
    launchBudget: 500_000_000, currentPhase: 'qualification', phasePct: 75,
    kpis: [
      { label: 'Active Listings', target: 400, unit: 'listings', byMonth: 6 },
      { label: 'Monthly Deals', target: 35, unit: 'deals', byMonth: 9 },
      { label: 'Agent Network', target: 40, unit: 'agents', byMonth: 7 },
      { label: 'Monthly Revenue', target: 200_000_000, unit: 'Rp', byMonth: 10 },
    ],
    risks: [
      { risk: 'Conservative market adoption', level: 'medium', mitigation: 'Lead with agent-first onboarding and relationship approach' },
    ],
    resourceAllocation: { teamSize: 4, marketingBudget: 200_000_000, agentIncentives: 150_000_000, techInfra: 80_000_000 },
  },
  {
    city: 'Bandung', province: 'Jawa Barat', tier: 'Tier 2', wave: 'wave_2',
    priorityScore: 76, population: 2_500_000, monthlyTxn: 320, rentalYield: 6.2, competitorGap: 82,
    launchBudget: 400_000_000, currentPhase: 'qualification', phasePct: 30,
    kpis: [
      { label: 'Active Listings', target: 300, unit: 'listings', byMonth: 7 },
      { label: 'Monthly Deals', target: 25, unit: 'deals', byMonth: 10 },
      { label: 'Agent Network', target: 30, unit: 'agents', byMonth: 8 },
      { label: 'Monthly Revenue', target: 150_000_000, unit: 'Rp', byMonth: 11 },
    ],
    risks: [
      { risk: 'Proximity to Jakarta talent pool drain', level: 'medium', mitigation: 'Build dedicated Bandung team with local hires' },
    ],
    resourceAllocation: { teamSize: 3, marketingBudget: 150_000_000, agentIncentives: 120_000_000, techInfra: 60_000_000 },
  },
  {
    city: 'Medan', province: 'Sumatera Utara', tier: 'Tier 2', wave: 'wave_2',
    priorityScore: 68, population: 2_200_000, monthlyTxn: 180, rentalYield: 5.0, competitorGap: 88,
    launchBudget: 350_000_000, currentPhase: 'qualification', phasePct: 10,
    kpis: [
      { label: 'Active Listings', target: 200, unit: 'listings', byMonth: 8 },
      { label: 'Monthly Deals', target: 15, unit: 'deals', byMonth: 11 },
      { label: 'Agent Network', target: 20, unit: 'agents', byMonth: 9 },
      { label: 'Monthly Revenue', target: 80_000_000, unit: 'Rp', byMonth: 12 },
    ],
    risks: [
      { risk: 'Low digital penetration', level: 'high', mitigation: 'Invest in agent education and WhatsApp-first UX' },
      { risk: 'Remote operational management', level: 'medium', mitigation: 'Hire local city manager early in qualification phase' },
    ],
    resourceAllocation: { teamSize: 3, marketingBudget: 130_000_000, agentIncentives: 100_000_000, techInfra: 50_000_000 },
  },
  {
    city: 'Makassar', province: 'Sulawesi Selatan', tier: 'Tier 2', wave: 'wave_2',
    priorityScore: 65, population: 1_500_000, monthlyTxn: 120, rentalYield: 6.5, competitorGap: 90,
    launchBudget: 300_000_000, currentPhase: 'qualification', phasePct: 5,
    kpis: [
      { label: 'Active Listings', target: 150, unit: 'listings', byMonth: 8 },
      { label: 'Monthly Deals', target: 12, unit: 'deals', byMonth: 11 },
      { label: 'Agent Network', target: 15, unit: 'agents', byMonth: 9 },
      { label: 'Monthly Revenue', target: 60_000_000, unit: 'Rp', byMonth: 12 },
    ],
    risks: [
      { risk: 'Limited developer pipeline', level: 'medium', mitigation: 'Focus on secondary market and resale inventory' },
    ],
    resourceAllocation: { teamSize: 2, marketingBudget: 110_000_000, agentIncentives: 80_000_000, techInfra: 50_000_000 },
  },
  {
    city: 'Semarang', province: 'Jawa Tengah', tier: 'Tier 3', wave: 'wave_3',
    priorityScore: 60, population: 1_800_000, monthlyTxn: 200, rentalYield: 5.5, competitorGap: 85,
    launchBudget: 280_000_000, currentPhase: 'qualification', phasePct: 0,
    kpis: [
      { label: 'Active Listings', target: 200, unit: 'listings', byMonth: 9 },
      { label: 'Monthly Deals', target: 15, unit: 'deals', byMonth: 12 },
      { label: 'Agent Network', target: 20, unit: 'agents', byMonth: 10 },
      { label: 'Monthly Revenue', target: 70_000_000, unit: 'Rp', byMonth: 13 },
    ],
    risks: [
      { risk: 'Lower transaction value ceiling', level: 'low', mitigation: 'Optimize for volume over value with industrial corridor focus' },
    ],
    resourceAllocation: { teamSize: 2, marketingBudget: 100_000_000, agentIncentives: 80_000_000, techInfra: 50_000_000 },
  },
  {
    city: 'Yogyakarta', province: 'DI Yogyakarta', tier: 'Tier 3', wave: 'wave_3',
    priorityScore: 58, population: 420_000, monthlyTxn: 140, rentalYield: 7.8, competitorGap: 83,
    launchBudget: 250_000_000, currentPhase: 'qualification', phasePct: 0,
    kpis: [
      { label: 'Active Listings', target: 150, unit: 'listings', byMonth: 9 },
      { label: 'Monthly Deals', target: 12, unit: 'deals', byMonth: 12 },
      { label: 'Agent Network', target: 15, unit: 'agents', byMonth: 10 },
      { label: 'Monthly Revenue', target: 50_000_000, unit: 'Rp', byMonth: 13 },
    ],
    risks: [
      { risk: 'Small market ceiling', level: 'medium', mitigation: 'Position as niche high-yield rental market for investors' },
    ],
    resourceAllocation: { teamSize: 2, marketingBudget: 90_000_000, agentIncentives: 70_000_000, techInfra: 40_000_000 },
  },
  {
    city: 'Balikpapan', province: 'Kalimantan Timur', tier: 'Tier 3', wave: 'wave_3',
    priorityScore: 55, population: 700_000, monthlyTxn: 90, rentalYield: 5.8, competitorGap: 92,
    launchBudget: 250_000_000, currentPhase: 'qualification', phasePct: 0,
    kpis: [
      { label: 'Active Listings', target: 120, unit: 'listings', byMonth: 10 },
      { label: 'Monthly Deals', target: 8, unit: 'deals', byMonth: 13 },
      { label: 'Agent Network', target: 10, unit: 'agents', byMonth: 11 },
      { label: 'Monthly Revenue', target: 40_000_000, unit: 'Rp', byMonth: 14 },
    ],
    risks: [
      { risk: 'IKN relocation uncertainty', level: 'high', mitigation: 'Monitor IKN progress; pivot as Nusantara gateway if construction accelerates' },
    ],
    resourceAllocation: { teamSize: 2, marketingBudget: 80_000_000, agentIncentives: 70_000_000, techInfra: 50_000_000 },
  },
  {
    city: 'Batam', province: 'Kepulauan Riau', tier: 'Tier 3', wave: 'wave_3',
    priorityScore: 52, population: 1_200_000, monthlyTxn: 110, rentalYield: 6.0, competitorGap: 91,
    launchBudget: 250_000_000, currentPhase: 'qualification', phasePct: 0,
    kpis: [
      { label: 'Active Listings', target: 130, unit: 'listings', byMonth: 10 },
      { label: 'Monthly Deals', target: 10, unit: 'deals', byMonth: 13 },
      { label: 'Agent Network', target: 12, unit: 'agents', byMonth: 11 },
      { label: 'Monthly Revenue', target: 45_000_000, unit: 'Rp', byMonth: 14 },
    ],
    risks: [
      { risk: 'Cross-border regulatory complexity', level: 'medium', mitigation: 'Partner with FTZ-experienced legal firms for compliance' },
    ],
    resourceAllocation: { teamSize: 2, marketingBudget: 80_000_000, agentIncentives: 70_000_000, techInfra: 50_000_000 },
  },
];

const WAVES: WaveConfig[] = [
  { wave: 'wave_1', label: 'Wave 1 — Beachhead', timeline: 'Month 1-6', cities: ['Jakarta (Jabodetabek)', 'Bali (Denpasar/Badung)', 'Surabaya'], totalBudget: 1_950_000_000, targetListings: 1900, targetDeals: 155 },
  { wave: 'wave_2', label: 'Wave 2 — Expansion', timeline: 'Month 4-10', cities: ['Bandung', 'Medan', 'Makassar'], totalBudget: 1_050_000_000, targetListings: 650, targetDeals: 52 },
  { wave: 'wave_3', label: 'Wave 3 — Scale', timeline: 'Month 8-14', cities: ['Semarang', 'Yogyakarta', 'Balikpapan', 'Batam'], totalBudget: 1_030_000_000, targetListings: 600, targetDeals: 45 },
];

export function useCityExpansionMasterPlan() {
  return useMemo(() => {
    const totalBudget = CITY_DATA.reduce((s, c) => s + c.launchBudget, 0);
    const totalTargetListings = CITY_DATA.reduce((s, c) => s + c.kpis[0].target, 0);
    const totalTargetDeals = CITY_DATA.reduce((s, c) => s + c.kpis[1].target, 0);
    const totalTargetRevenue = CITY_DATA.reduce((s, c) => s + c.kpis[3].target, 0);
    const avgScore = Math.round(CITY_DATA.reduce((s, c) => s + c.priorityScore, 0) / CITY_DATA.length);

    return {
      cities: CITY_DATA,
      waves: WAVES,
      phases: PHASES,
      summary: { totalBudget, totalTargetListings, totalTargetDeals, totalTargetRevenue, avgScore, cityCount: CITY_DATA.length },
    };
  }, []);
}
