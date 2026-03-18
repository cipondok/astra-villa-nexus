import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DealStage = 'target' | 'matched' | 'negotiation' | 'closing' | 'completed';

export interface DealSlot {
  id: number;
  stage: DealStage;
  propertyTitle: string | null;
  city: string | null;
  priceIdr: number | null;
  investorName: string | null;
  agentName: string | null;
  opportunityScore: number | null;
  daysInStage: number;
  actions: string[];
}

export interface First10DealsMetrics {
  totalListings: number;
  realisticPricedListings: number;
  activeInvestors: number;
  activeOffers: number;
  completedDeals: number;
  avgOpportunityScore: number;
  hotMicroMarkets: { city: string; count: number }[];
}

export interface First10DealsPlan {
  deals: DealSlot[];
  metrics: First10DealsMetrics;
  stageBreakdown: Record<DealStage, number>;
  overallProgress: number;
  revenueEstimate: number;
}

const STAGE_ACTIONS: Record<DealStage, string[]> = {
  target: ['Verify pricing realism', 'Confirm listing data quality', 'Assess micro-market demand'],
  matched: ['Share investment insight summary', 'Introduce investor to agent', 'Confirm investor budget fit'],
  negotiation: ['Maintain communication loop', 'Highlight competing interest', 'Track offer/counter-offer'],
  closing: ['Coordinate documentation', 'Monitor milestone completion', 'Confirm payment readiness'],
  completed: ['Collect testimonial', 'Record revenue', 'Request referral'],
};

export function useFirst10Deals(enabled = true) {
  return useQuery({
    queryKey: ['first-10-deals-plan'],
    queryFn: async (): Promise<First10DealsPlan> => {
      const [propsRes, offersRes, profilesRes] = await Promise.all([
        (supabase as any).from('properties').select('id,title,city,price,opportunity_score,status').limit(200),
        (supabase as any).from('offers').select('id,property_id,buyer_id,status,amount,created_at').limit(100),
        (supabase as any).from('profiles').select('id,full_name,account_type').limit(200),
      ]);

      const properties = (propsRes.data || []) as any[];
      const offers = (offersRes.data || []) as any[];
      const profiles = (profilesRes.data || []) as any[];

      const agents = profiles.filter((p: any) => p.account_type === 'agent');
      const investors = profiles.filter((p: any) => p.account_type === 'buyer' || p.account_type === 'investor');

      // Identify realistic-priced listings (has opportunity score > 50 or any active listing)
      const realisticListings = properties
        .filter((p: any) => p.status === 'active')
        .sort((a: any, b: any) => (b.opportunity_score || 0) - (a.opportunity_score || 0));

      // Hot micro-markets
      const cityCount: Record<string, number> = {};
      for (const p of realisticListings) {
        const c = p.city || 'Unknown';
        cityCount[c] = (cityCount[c] || 0) + 1;
      }
      const hotMicroMarkets = Object.entries(cityCount)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Map offers to stages
      const offerStageMap: Record<string, DealStage> = {
        pending: 'matched',
        counter_offer: 'negotiation',
        accepted: 'closing',
        completed: 'completed',
        rejected: 'target',
      };

      // Build 10 deal slots
      const deals: DealSlot[] = [];
      const usedPropertyIds = new Set<string>();

      // First fill from real offers
      for (const offer of offers.slice(0, 10)) {
        const prop = properties.find((p: any) => p.id === offer.property_id);
        const investor = profiles.find((p: any) => p.id === offer.buyer_id);
        const stage = offerStageMap[offer.status] || 'target';
        const daysSince = Math.max(0, Math.round((Date.now() - new Date(offer.created_at).getTime()) / 86_400_000));

        deals.push({
          id: deals.length + 1,
          stage,
          propertyTitle: prop?.title || null,
          city: prop?.city || null,
          priceIdr: offer.amount || prop?.price || null,
          investorName: investor?.full_name || null,
          agentName: null,
          opportunityScore: prop?.opportunity_score || null,
          daysInStage: daysSince,
          actions: STAGE_ACTIONS[stage],
        });
        if (prop) usedPropertyIds.add(prop.id);
      }

      // Fill remaining slots with target properties
      for (const prop of realisticListings) {
        if (deals.length >= 10) break;
        if (usedPropertyIds.has(prop.id)) continue;
        deals.push({
          id: deals.length + 1,
          stage: 'target',
          propertyTitle: prop.title,
          city: prop.city,
          priceIdr: prop.price,
          investorName: null,
          agentName: null,
          opportunityScore: prop.opportunity_score || null,
          daysInStage: 0,
          actions: STAGE_ACTIONS.target,
        });
      }

      // Pad to 10 if needed
      while (deals.length < 10) {
        deals.push({
          id: deals.length + 1,
          stage: 'target',
          propertyTitle: null,
          city: null,
          priceIdr: null,
          investorName: null,
          agentName: null,
          opportunityScore: null,
          daysInStage: 0,
          actions: STAGE_ACTIONS.target,
        });
      }

      const stageBreakdown: Record<DealStage, number> = { target: 0, matched: 0, negotiation: 0, closing: 0, completed: 0 };
      for (const d of deals) stageBreakdown[d.stage]++;

      const completed = stageBreakdown.completed;
      const avgScore = realisticListings.length > 0
        ? Math.round(realisticListings.reduce((s: number, p: any) => s + (p.opportunity_score || 0), 0) / realisticListings.length)
        : 0;

      const commissionRate = 0.02;
      const revenueEstimate = deals
        .filter((d) => d.stage === 'completed' && d.priceIdr)
        .reduce((s, d) => s + (d.priceIdr! * commissionRate), 0);

      return {
        deals,
        metrics: {
          totalListings: properties.length,
          realisticPricedListings: realisticListings.length,
          activeInvestors: investors.length,
          activeOffers: offers.length,
          completedDeals: completed,
          avgOpportunityScore: avgScore,
          hotMicroMarkets,
        },
        stageBreakdown,
        overallProgress: Math.round((completed / 10) * 100),
        revenueEstimate,
      };
    },
    enabled,
    staleTime: 60_000,
  });
}
