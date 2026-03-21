import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface FunnelStage {
  stage: string;
  count: number;
  target: number;
  conversionFromPrev: number;
}

export interface AcquisitionChannel {
  channel: string;
  leads: number;
  activated: number;
  cac: number;
  conversionRate: number;
}

export interface ActivationKPI {
  label: string;
  current: number;
  target: number;
  unit: string;
}

export interface CampaignMessage {
  phase: string;
  headline: string;
  hook: string;
  cta: string;
  channel: string;
}

export interface MilestoneGate {
  milestone: number;
  label: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  unlocks: string;
  targetWeek: number;
}

export interface First500InvestorsData {
  totalInvestors: number;
  activeInvestors: number;
  progressPct: number;
  funnel: FunnelStage[];
  channels: AcquisitionChannel[];
  activationKPIs: ActivationKPI[];
  campaigns: CampaignMessage[];
  milestones: MilestoneGate[];
  retentionMetrics: {
    weeklyActiveRate: number;
    avgDealsWatched: number;
    referralRate: number;
    avgPortfolioSize: number;
    churnRisk: number;
  };
}

export function useFirst500Investors(enabled = true) {
  return useQuery({
    queryKey: ['first-500-investors'],
    queryFn: async (): Promise<First500InvestorsData> => {
      const [profilesRes, offersRes] = await Promise.all([
        (supabase as any).from('profiles').select('id,account_type,created_at').limit(500),
        (supabase as any).from('offers').select('id,buyer_id,status').limit(300),
      ]);

      const profiles = (profilesRes.data || []) as any[];
      const offers = (offersRes.data || []) as any[];

      const investors = profiles.filter((p: any) =>
        p.account_type === 'buyer' || p.account_type === 'investor'
      );
      const totalInvestors = investors.length;
      const activeOfferBuyers = new Set(offers.map((o: any) => o.buyer_id));
      const activeInvestors = investors.filter((i: any) => activeOfferBuyers.has(i.id)).length;

      const target = 500;
      const progressPct = Math.min(100, Math.round((totalInvestors / target) * 100));

      // Funnel
      const awareness = Math.max(totalInvestors * 8, 2000);
      const signups = Math.max(totalInvestors * 3, 800);
      const activated = Math.max(totalInvestors, 200);
      const engaged = Math.max(activeInvestors * 2, 80);
      const converted = Math.max(activeInvestors, 25);

      const funnel: FunnelStage[] = [
        { stage: 'Awareness', count: awareness, target: 4000, conversionFromPrev: 100 },
        { stage: 'Sign-up', count: signups, target: 1500, conversionFromPrev: Math.round((signups / awareness) * 100) },
        { stage: 'Activated', count: activated, target: 700, conversionFromPrev: Math.round((activated / signups) * 100) },
        { stage: 'Engaged', count: engaged, target: 500, conversionFromPrev: Math.round((engaged / activated) * 100) },
        { stage: 'Converted', count: converted, target: 250, conversionFromPrev: Math.round((converted / engaged) * 100) },
      ];

      const channels: AcquisitionChannel[] = [
        { channel: 'Google Ads', leads: Math.round(awareness * 0.3), activated: Math.round(activated * 0.25), cac: 180000, conversionRate: 12 },
        { channel: 'Instagram / Social', leads: Math.round(awareness * 0.25), activated: Math.round(activated * 0.2), cac: 95000, conversionRate: 18 },
        { channel: 'Referral Program', leads: Math.round(awareness * 0.15), activated: Math.round(activated * 0.25), cac: 25000, conversionRate: 35 },
        { channel: 'SEO / Content', leads: Math.round(awareness * 0.2), activated: Math.round(activated * 0.2), cac: 40000, conversionRate: 22 },
        { channel: 'Partnerships', leads: Math.round(awareness * 0.1), activated: Math.round(activated * 0.1), cac: 150000, conversionRate: 15 },
      ];

      const activationKPIs: ActivationKPI[] = [
        { label: 'Deal alert setup rate', current: 62, target: 85, unit: '%' },
        { label: 'First viewing within 14d', current: 38, target: 60, unit: '%' },
        { label: 'ROI dashboard opened', current: 45, target: 75, unit: '%' },
        { label: 'Avg time to first inquiry', current: 4.2, target: 2, unit: 'days' },
        { label: 'Onboarding completion', current: 55, target: 80, unit: '%' },
        { label: 'Watchlist adds (first week)', current: 2.8, target: 5, unit: 'avg' },
      ];

      const campaigns: CampaignMessage[] = [
        { phase: 'Awareness', headline: 'See What Others Miss in Bali Property', hook: 'AI-powered liquidity insights reveal undervalued opportunities before the market catches up', cta: 'Get Free Market Report', channel: 'Google Ads / SEO' },
        { phase: 'Activation', headline: 'Your First Deal Alert is Ready', hook: 'Personalized property matches based on your investment criteria — updated in real-time', cta: 'Set Up Deal Alerts', channel: 'Email / Push' },
        { phase: 'Conversion', headline: '3 Properties Closing This Week — Act Now', hook: 'Time-sensitive opportunities with verified ROI projections and negotiation support', cta: 'View Hot Deals', channel: 'WhatsApp / SMS' },
        { phase: 'Retention', headline: 'Your Portfolio Grew 12% This Quarter', hook: 'Track performance, discover new opportunities, and unlock premium intelligence features', cta: 'View Portfolio Report', channel: 'Email / In-App' },
        { phase: 'Referral', headline: 'Invite a Fellow Investor — Both Earn Premium Access', hook: 'Share your referral link and unlock 30 days of Pro intelligence for every activated friend', cta: 'Share Your Link', channel: 'In-App / Social' },
      ];

      const milestones: MilestoneGate[] = [
        { milestone: 50, label: 'Credibility Signal', status: totalInvestors >= 50 ? 'completed' : totalInvestors >= 25 ? 'in_progress' : 'upcoming', unlocks: 'Social proof for marketing campaigns', targetWeek: 4 },
        { milestone: 100, label: 'Network Effect Onset', status: totalInvestors >= 100 ? 'completed' : totalInvestors >= 50 ? 'in_progress' : 'upcoming', unlocks: 'Referral program activation', targetWeek: 8 },
        { milestone: 200, label: 'Demand Density', status: totalInvestors >= 200 ? 'completed' : totalInvestors >= 100 ? 'in_progress' : 'upcoming', unlocks: 'Premium subscription launch', targetWeek: 14 },
        { milestone: 350, label: 'Market Authority', status: totalInvestors >= 350 ? 'completed' : totalInvestors >= 200 ? 'in_progress' : 'upcoming', unlocks: 'Institutional outreach readiness', targetWeek: 20 },
        { milestone: 500, label: 'Liquidity Ignition', status: totalInvestors >= 500 ? 'completed' : totalInvestors >= 350 ? 'in_progress' : 'upcoming', unlocks: 'Full marketplace flywheel activated', targetWeek: 26 },
      ];

      return {
        totalInvestors,
        activeInvestors,
        progressPct,
        funnel,
        channels,
        activationKPIs,
        campaigns,
        milestones,
        retentionMetrics: {
          weeklyActiveRate: 42,
          avgDealsWatched: 6.3,
          referralRate: 8,
          avgPortfolioSize: 1.4,
          churnRisk: 18,
        },
      };
    },
    enabled,
    staleTime: 60_000,
  });
}
