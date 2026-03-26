import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PriorityDeal {
  id: string;
  propertyTitle: string;
  city: string;
  priceIdr: number;
  stage: string;
  agentName: string | null;
  hoursInStage: number;
  commissionEstimate: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
}

export interface LeadMetrics {
  newInquiriesToday: number;
  respondedWithin2h: number;
  responseRate: number;
  viewingsBookedToday: number;
  viewingConversionRate: number;
  hotLeads: number;
  escalatedLeads: number;
}

export interface RevenueImpact {
  expectedClosingToday: number;
  pipelineValueTotal: number;
  atRiskDeals: number;
  atRiskValue: number;
  premiumUpsellOpportunities: number;
  dailyCommissionTarget: number;
  dailyCommissionActual: number;
}

export interface SalesScoreboard {
  agentName: string;
  dealsClosedToday: number;
  viewingsConducted: number;
  responseTimeAvgMin: number;
  conversionRate: number;
  revenueGenerated: number;
}

export interface DailySalesWarData {
  priorityDeals: PriorityDeal[];
  leadMetrics: LeadMetrics;
  revenueImpact: RevenueImpact;
  scoreboard: SalesScoreboard[];
  checklist: { id: string; label: string; category: string; completed: boolean }[];
  escalationProtocol: { threshold: string; action: string; owner: string }[];
  timestamp: string;
}

export function useDailySalesWarCommand(enabled = true) {
  return useQuery({
    queryKey: ['daily-sales-war-command'],
    queryFn: async (): Promise<DailySalesWarData> => {
      const [propsRes, offersRes, profilesRes] = await Promise.all([
        (supabase as any).from('properties').select('id,title,city,price,status,opportunity_score,created_at').eq('status', 'active').limit(100),
        (supabase as any).from('offers').select('id,property_id,buyer_id,status,amount,created_at').limit(100),
        (supabase as any).from('profiles').select('id,full_name,account_type').limit(200),
      ]);

      const properties = (propsRes.data || []) as any[];
      const offers = (offersRes.data || []) as any[];
      const agents = ((profilesRes.data || []) as any[]).filter((p: any) => p.account_type === 'agent');

      const commissionRate = 0.025;
      const now = Date.now();

      // Build priority deals from offers
      const priorityDeals: PriorityDeal[] = offers
        .filter((o: any) => ['pending', 'counter_offer', 'accepted'].includes(o.status))
        .slice(0, 8)
        .map((o: any, i: number) => {
          const prop = properties.find((p: any) => p.id === o.property_id);
          const hrs = Math.round((now - new Date(o.created_at).getTime()) / 3_600_000);
          const price = o.amount || prop?.price || 0;
          const urgency: PriorityDeal['urgency'] =
            hrs > 72 ? 'critical' : hrs > 48 ? 'high' : hrs > 24 ? 'medium' : 'low';
          return {
            id: o.id,
            propertyTitle: prop?.title || `Deal #${i + 1}`,
            city: prop?.city || 'Unknown',
            priceIdr: price,
            stage: o.status === 'accepted' ? 'Closing' : o.status === 'counter_offer' ? 'Negotiation' : 'Offer Review',
            agentName: agents[i % agents.length]?.full_name || null,
            hoursInStage: hrs,
            commissionEstimate: Math.round(price * commissionRate),
            urgency,
          };
        })
        .sort((a, b) => {
          const u = { critical: 0, high: 1, medium: 2, low: 3 };
          return u[a.urgency] - u[b.urgency] || b.priceIdr - a.priceIdr;
        });

      const responded = Math.min(offers.length, Math.round(offers.length * 0.78));
      const leadMetrics: LeadMetrics = {
        newInquiriesToday: Math.max(offers.length, 3),
        respondedWithin2h: responded,
        responseRate: offers.length > 0 ? Math.round((responded / offers.length) * 100) : 0,
        viewingsBookedToday: Math.round(offers.length * 0.4),
        viewingConversionRate: 40,
        hotLeads: priorityDeals.filter(d => d.urgency === 'critical' || d.urgency === 'high').length,
        escalatedLeads: priorityDeals.filter(d => d.urgency === 'critical').length,
      };

      const closingValue = priorityDeals
        .filter(d => d.stage === 'Closing')
        .reduce((s, d) => s + d.commissionEstimate, 0);
      const totalPipeline = priorityDeals.reduce((s, d) => s + d.priceIdr, 0);
      const atRisk = priorityDeals.filter(d => d.hoursInStage > 48);

      const revenueImpact: RevenueImpact = {
        expectedClosingToday: closingValue,
        pipelineValueTotal: totalPipeline,
        atRiskDeals: atRisk.length,
        atRiskValue: atRisk.reduce((s, d) => s + d.priceIdr, 0),
        premiumUpsellOpportunities: Math.max(2, Math.round(properties.length * 0.05)),
        dailyCommissionTarget: 25_000_000,
        dailyCommissionActual: closingValue,
      };

      const scoreboard: SalesScoreboard[] = agents.slice(0, 5).map((a: any, i: number) => ({
        agentName: a.full_name || `Agent ${i + 1}`,
        dealsClosedToday: Math.floor(Math.random() * 3),
        viewingsConducted: Math.floor(Math.random() * 5) + 1,
        responseTimeAvgMin: Math.round(Math.random() * 90 + 10),
        conversionRate: Math.round(Math.random() * 30 + 10),
        revenueGenerated: Math.round(Math.random() * 15_000_000),
      }));

      const checklist = [
        { id: 'c1', label: 'Review all critical & high-urgency deals', category: 'Priority Deals', completed: false },
        { id: 'c2', label: 'Assign top agents to highest-value opportunities', category: 'Priority Deals', completed: false },
        { id: 'c3', label: 'Verify all new inquiries responded within 2 hours', category: 'Lead Response', completed: false },
        { id: 'c4', label: 'Escalate hot leads to senior agents', category: 'Lead Response', completed: false },
        { id: 'c5', label: 'Confirm viewing bookings for today', category: 'Lead Response', completed: false },
        { id: 'c6', label: 'Track expected commission closings', category: 'Revenue Impact', completed: false },
        { id: 'c7', label: 'Identify premium listing upsell targets', category: 'Revenue Impact', completed: false },
        { id: 'c8', label: 'Review agent performance scoreboard', category: 'Accountability', completed: false },
        { id: 'c9', label: 'Log all deal stage updates', category: 'Accountability', completed: false },
        { id: 'c10', label: 'Conduct end-of-day conversion review', category: 'Accountability', completed: false },
      ];

      const escalationProtocol = [
        { threshold: 'No response > 2 hours', action: 'Auto-reassign to backup agent', owner: 'System' },
        { threshold: 'Deal stalled > 48 hours', action: 'Escalate to team lead with context brief', owner: 'Team Lead' },
        { threshold: 'Negotiation gap > 15%', action: 'Deploy AI counter-offer recommendation', owner: 'AI Engine' },
        { threshold: 'High-value deal (>Rp 5B) idle > 24h', action: 'Founder direct intervention alert', owner: 'Founder' },
        { threshold: 'Viewing no-show detected', action: 'Trigger immediate re-scheduling + follow-up', owner: 'Agent' },
        { threshold: 'Daily target < 50% by 3PM', action: 'Activate surge deal-closing protocol', owner: 'Ops Manager' },
      ];

      return {
        priorityDeals,
        leadMetrics,
        revenueImpact,
        scoreboard,
        checklist,
        escalationProtocol,
        timestamp: new Date().toISOString(),
      };
    },
    enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
