import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RegionScore {
  region: string;
  province: string;
  populationM: number;
  transactionPotential: number;
  digitalReadiness: number;
  competitorPresence: number;
  yieldAttractiveness: number;
  compositeScore: number;
  wave: 1 | 2 | 3 | 4;
  status: 'live' | 'launching' | 'planned' | 'future';
  listings: number;
  deals: number;
  agents: number;
}

export interface DominationPillar {
  id: string;
  title: string;
  description: string;
  kpis: { label: string; current: number; target: number; unit: string }[];
  tactics: string[];
  status: 'leading' | 'growing' | 'emerging' | 'planned';
}

export interface RolloutPhase {
  phase: string;
  timeline: string;
  regions: string[];
  objectives: string[];
  gate: string;
  investment: string;
  status: 'active' | 'upcoming' | 'future';
}

export interface RiskItem {
  risk: string;
  severity: 'high' | 'medium' | 'low';
  mitigation: string;
  pillar: string;
}

export interface NationalDominationData {
  regions: RegionScore[];
  pillars: DominationPillar[];
  rollout: RolloutPhase[];
  risks: RiskItem[];
  nationalMetrics: { label: string; value: string; trend: 'up' | 'down' | 'flat' }[];
  dominationScore: number;
}

export function useNationalDominationBlueprint() {
  return useQuery({
    queryKey: ['national-domination-blueprint'],
    queryFn: async (): Promise<NationalDominationData> => {
      const [listings, deals, agents] = await Promise.all([
        supabase.from('properties').select('id, city', { count: 'exact' }).eq('status', 'available'),
        supabase.from('property_offers').select('id', { count: 'exact' }).in('status', ['completed', 'accepted']),
        (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'agent'),
      ]);

      const l = listings.count || 0;
      const d = deals.count || 0;
      const ag = agents.count || 0;

      const regions: RegionScore[] = [
        { region: 'Jakarta (Jabodetabek)', province: 'DKI Jakarta', populationM: 34.5, transactionPotential: 98, digitalReadiness: 95, competitorPresence: 85, yieldAttractiveness: 72, compositeScore: 92, wave: 1, status: 'live', listings: Math.round(l * 0.35), deals: Math.round(d * 0.4), agents: Math.round(ag * 0.3) },
        { region: 'Surabaya Metro', province: 'Jawa Timur', populationM: 9.2, transactionPotential: 82, digitalReadiness: 80, competitorPresence: 55, yieldAttractiveness: 78, compositeScore: 83, wave: 1, status: 'live', listings: Math.round(l * 0.15), deals: Math.round(d * 0.15), agents: Math.round(ag * 0.12) },
        { region: 'Bali (Denpasar-Ubud)', province: 'Bali', populationM: 4.3, transactionPotential: 85, digitalReadiness: 88, competitorPresence: 70, yieldAttractiveness: 90, compositeScore: 86, wave: 1, status: 'live', listings: Math.round(l * 0.2), deals: Math.round(d * 0.2), agents: Math.round(ag * 0.15) },
        { region: 'Bandung Metro', province: 'Jawa Barat', populationM: 8.5, transactionPotential: 75, digitalReadiness: 78, competitorPresence: 50, yieldAttractiveness: 74, compositeScore: 76, wave: 2, status: 'launching', listings: Math.round(l * 0.08), deals: Math.round(d * 0.05), agents: Math.round(ag * 0.08) },
        { region: 'Medan Metro', province: 'Sumatera Utara', populationM: 6.8, transactionPotential: 70, digitalReadiness: 65, competitorPresence: 35, yieldAttractiveness: 76, compositeScore: 72, wave: 2, status: 'launching', listings: Math.round(l * 0.05), deals: Math.round(d * 0.03), agents: Math.round(ag * 0.05) },
        { region: 'Makassar Metro', province: 'Sulawesi Selatan', populationM: 3.8, transactionPotential: 65, digitalReadiness: 60, competitorPresence: 25, yieldAttractiveness: 80, compositeScore: 70, wave: 2, status: 'planned', listings: Math.round(l * 0.03), deals: 0, agents: Math.round(ag * 0.04) },
        { region: 'Semarang Metro', province: 'Jawa Tengah', populationM: 5.1, transactionPotential: 62, digitalReadiness: 68, competitorPresence: 40, yieldAttractiveness: 72, compositeScore: 67, wave: 3, status: 'planned', listings: Math.round(l * 0.03), deals: 0, agents: Math.round(ag * 0.03) },
        { region: 'Yogyakarta', province: 'DI Yogyakarta', populationM: 3.6, transactionPotential: 58, digitalReadiness: 75, competitorPresence: 45, yieldAttractiveness: 68, compositeScore: 65, wave: 3, status: 'planned', listings: Math.round(l * 0.02), deals: 0, agents: Math.round(ag * 0.02) },
        { region: 'Balikpapan-Samarinda', province: 'Kalimantan Timur', populationM: 3.9, transactionPotential: 72, digitalReadiness: 58, competitorPresence: 20, yieldAttractiveness: 82, compositeScore: 68, wave: 3, status: 'planned', listings: 0, deals: 0, agents: 0 },
        { region: 'IKN Nusantara', province: 'Kalimantan Timur', populationM: 0.5, transactionPotential: 88, digitalReadiness: 70, competitorPresence: 10, yieldAttractiveness: 92, compositeScore: 80, wave: 2, status: 'planned', listings: 0, deals: 0, agents: 0 },
        { region: 'Palembang', province: 'Sumatera Selatan', populationM: 3.4, transactionPotential: 55, digitalReadiness: 55, competitorPresence: 20, yieldAttractiveness: 70, compositeScore: 58, wave: 4, status: 'future', listings: 0, deals: 0, agents: 0 },
        { region: 'Manado', province: 'Sulawesi Utara', populationM: 2.2, transactionPotential: 48, digitalReadiness: 58, competitorPresence: 15, yieldAttractiveness: 72, compositeScore: 54, wave: 4, status: 'future', listings: 0, deals: 0, agents: 0 },
        { region: 'Batam', province: 'Kepulauan Riau', populationM: 1.3, transactionPotential: 68, digitalReadiness: 72, competitorPresence: 30, yieldAttractiveness: 78, compositeScore: 70, wave: 3, status: 'planned', listings: 0, deals: 0, agents: 0 },
        { region: 'Lombok-Mataram', province: 'NTB', populationM: 3.5, transactionPotential: 60, digitalReadiness: 50, competitorPresence: 15, yieldAttractiveness: 85, compositeScore: 62, wave: 4, status: 'future', listings: 0, deals: 0, agents: 0 },
      ];

      const liveRegions = regions.filter(r => r.status === 'live').length;
      const totalPop = regions.reduce((s, r) => s + r.populationM, 0);
      const livePop = regions.filter(r => r.status === 'live' || r.status === 'launching').reduce((s, r) => s + r.populationM, 0);

      const pillars: DominationPillar[] = [
        {
          id: 'liquidity', title: 'Liquidity Leadership', description: 'Concentrate listing density and accelerate time-to-sell in target metros',
          kpis: [
            { label: 'National Listings', current: l, target: 5000, unit: 'listings' },
            { label: 'Avg Days on Market', current: 45, target: 21, unit: 'days' },
            { label: 'Absorption Rate', current: d > 0 ? Math.round((d / Math.max(l, 1)) * 100) : 0, target: 15, unit: '%/mo' },
            { label: 'Live Metro Regions', current: liveRegions, target: 10, unit: 'cities' },
          ],
          tactics: ['Cluster 200+ listings per district in Wave 1 cities', 'Deploy predictive pricing to reduce DOM by 40%', 'Launch liquidity index benchmarks per metro', 'Activate seller urgency through demand visibility signals'],
          status: l > 200 ? 'growing' : 'emerging',
        },
        {
          id: 'supply', title: 'Supply Network Consolidation', description: 'Secure exclusive inventory and recruit top-performing agent networks',
          kpis: [
            { label: 'Active Agents', current: ag, target: 500, unit: 'agents' },
            { label: 'Developer Partnerships', current: Math.round(l / 50), target: 50, unit: 'partners' },
            { label: 'Exclusive Listings %', current: 15, target: 40, unit: '%' },
            { label: 'Vendor Coverage', current: 12, target: 38, unit: 'provinces' },
          ],
          tactics: ['Sign exclusive listing MOUs with top 20 developers per city', 'Agent referral bonus: Rp 1M per 5 successful onboards', 'Deploy vendor onboarding blitz in Wave 2 cities', 'Quality gate: 85% listing completeness minimum'],
          status: ag > 50 ? 'growing' : 'emerging',
        },
        {
          id: 'demand', title: 'Demand Capture Acceleration', description: 'Scale investor acquisition and activate referral-driven organic growth',
          kpis: [
            { label: 'Monthly Active Investors', current: Math.round(d * 3.5), target: 2000, unit: 'users' },
            { label: 'Inquiry Volume', current: Math.round(l * 2.5), target: 10000, unit: '/month' },
            { label: 'Referral Coefficient', current: 0.4, target: 1.5, unit: 'x' },
            { label: 'National Brand Awareness', current: 8, target: 45, unit: '%' },
          ],
          tactics: ['Launch national investor acquisition campaign across 5 channels', 'Publish weekly national market intelligence reports', 'Activate referral loops with Rp 500K incentive per conversion', 'Partner with financial media for co-branded content'],
          status: 'emerging',
        },
        {
          id: 'brand', title: 'Brand Authority Reinforcement', description: 'Position ASTRA as the national property intelligence infrastructure',
          kpis: [
            { label: 'Published Reports', current: 4, target: 52, unit: '/year' },
            { label: 'Media Mentions', current: 12, target: 200, unit: '/year' },
            { label: 'NPS Score', current: 42, target: 70, unit: 'pts' },
            { label: 'Institutional Partners', current: 3, target: 25, unit: 'partners' },
          ],
          tactics: ['Launch ASTRA National Property Index (quarterly publication)', 'Host annual Indonesia Property Intelligence Summit', 'Deploy verified transaction badges on all completed deals', 'Build institutional API partnerships with 5 major banks'],
          status: 'planned',
        },
      ];

      const rollout: RolloutPhase[] = [
        {
          phase: 'Wave 1 — Metro Anchors', timeline: 'Month 1-6',
          regions: ['Jakarta', 'Surabaya', 'Bali'],
          objectives: ['500+ listings per city', '50+ monthly deals', '100+ agent network', 'Liquidity index #1 position'],
          gate: 'Each city: 15%+ absorption rate + positive unit economics', investment: 'Rp 3.5B', status: 'active',
        },
        {
          phase: 'Wave 2 — Growth Corridors', timeline: 'Month 7-12',
          regions: ['Bandung', 'Medan', 'Makassar', 'IKN Nusantara'],
          objectives: ['200+ listings per city', '20+ monthly deals', '50+ agents each', 'Developer partnership pipeline'],
          gate: 'Wave 1 profitable + brand awareness >25% in target cities', investment: 'Rp 5.2B', status: 'upcoming',
        },
        {
          phase: 'Wave 3 — National Coverage', timeline: 'Month 13-20',
          regions: ['Semarang', 'Yogyakarta', 'Balikpapan', 'Batam'],
          objectives: ['150+ listings per city', 'Standardized playbook deployment', 'Regional vendor ecosystems', 'Cross-city investor matching'],
          gate: 'Wave 2 break-even + national brand recognition >35%', investment: 'Rp 4.8B', status: 'future',
        },
        {
          phase: 'Wave 4 — Frontier Markets', timeline: 'Month 21-30',
          regions: ['Palembang', 'Manado', 'Lombok', '+ emerging corridors'],
          objectives: ['100+ listings per city', 'Automated launch playbook', 'Full 38-province vendor network', 'National liquidity dominance'],
          gate: 'Wave 3 operational + national listing count >5,000', investment: 'Rp 3.2B', status: 'future',
        },
      ];

      const risks: RiskItem[] = [
        { risk: 'Aggressive competitor response in Wave 1 cities', severity: 'high', mitigation: 'Lock exclusive developer MOUs before launch announcement; outspend on agent incentives in first 90 days', pillar: 'supply' },
        { risk: 'Slow demand uptake in Wave 2 secondary cities', severity: 'high', mitigation: 'Deploy hyper-local SEO + influencer partnerships; lower investor subscription entry price', pillar: 'demand' },
        { risk: 'Agent network defection to competitor platforms', severity: 'medium', mitigation: 'Performance-based loyalty programs; provide superior analytics tools that create switching costs', pillar: 'supply' },
        { risk: 'Regulatory friction in new provinces', severity: 'medium', mitigation: 'Pre-engage local real estate associations; maintain compliance buffer in launch timeline', pillar: 'brand' },
        { risk: 'Capital burn exceeding projections', severity: 'high', mitigation: 'Gate each wave on unit economics; maintain 6-month runway reserve before Wave 2', pillar: 'liquidity' },
        { risk: 'Listing quality dilution during rapid scaling', severity: 'medium', mitigation: 'Automated quality scoring; reject listings below 70% completeness threshold', pillar: 'liquidity' },
        { risk: 'Brand trust erosion from bad actor transactions', severity: 'medium', mitigation: 'Verified transaction program; escrow service integration; dispute resolution SLA', pillar: 'brand' },
        { risk: 'IKN Nusantara timeline delays impacting Wave 2 ROI', severity: 'low', mitigation: 'Position IKN as speculative alpha; maintain optionality to defer if construction milestones slip', pillar: 'demand' },
      ];

      const domScore = Math.min(100, Math.round(
        (l / 5000) * 25 + (d / 200) * 25 + (ag / 500) * 25 + (liveRegions / 10) * 25
      ));

      const nationalMetrics = [
        { label: 'Total National Listings', value: l.toLocaleString(), trend: l > 50 ? 'up' as const : 'flat' as const },
        { label: 'Active Metro Regions', value: `${liveRegions} / 14`, trend: 'up' as const },
        { label: 'Population Coverage', value: `${livePop.toFixed(1)}M / ${totalPop.toFixed(1)}M`, trend: 'up' as const },
        { label: 'National Agent Network', value: ag.toLocaleString(), trend: ag > 10 ? 'up' as const : 'flat' as const },
        { label: 'Domination Score', value: `${domScore}%`, trend: domScore > 20 ? 'up' as const : 'flat' as const },
      ];

      return { regions, pillars, rollout, risks, nationalMetrics, dominationScore: domScore };
    },
    staleTime: 5 * 60_000,
  });
}
