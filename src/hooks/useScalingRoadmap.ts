import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Milestone {
  id: string;
  label: string;
  target: string;
  current: number;
  goal: number;
  unit: string;
  completed: boolean;
}

export interface StageInitiative {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium';
  status: 'completed' | 'in_progress' | 'planned';
}

export interface FundingStage {
  id: 'seed' | 'series_a' | 'expansion';
  name: string;
  subtitle: string;
  timeline: string;
  funding_target: string;
  color: string;
  milestones: Milestone[];
  initiatives: StageInitiative[];
  readiness_score: number;
}

export interface ScalingRoadmapData {
  stages: FundingStage[];
  current_stage: 'seed' | 'series_a' | 'expansion';
  overall_readiness: number;
}

export function useScalingRoadmap() {
  return useQuery({
    queryKey: ['scaling-roadmap'],
    queryFn: async (): Promise<ScalingRoadmapData> => {
      const [
        totalUsers,
        activeListings,
        completedDeals,
        activeSubs,
        aiJobs,
        totalCities,
        totalCommissions,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).in('status', ['completed', 'accepted']),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('properties').select('city').eq('status', 'active').limit(1000),
        supabase.from('transaction_commissions').select('commission_amount').limit(500),
      ]);

      const users = totalUsers.count || 0;
      const listings = activeListings.count || 0;
      const deals = completedDeals.count || 0;
      const subs = activeSubs.count || 0;
      const ai = aiJobs.count || 0;
      const cities = new Set((totalCities.data || []).map(r => r.city).filter(Boolean)).size;
      const totalRev = (totalCommissions.data || []).reduce((s, r) => s + (r.commission_amount || 0), 0);
      const mrr = Math.round(totalRev / 12 + subs * 500_000);

      // ── Seed Stage ──
      const seedMilestones: Milestone[] = [
        { id: 's1', label: 'Registered Users', target: '1,000', current: users, goal: 1000, unit: 'users', completed: users >= 1000 },
        { id: 's2', label: 'Active Listings', target: '500', current: listings, goal: 500, unit: 'listings', completed: listings >= 500 },
        { id: 's3', label: 'First Transactions', target: '10', current: deals, goal: 10, unit: 'deals', completed: deals >= 10 },
        { id: 's4', label: 'Cities Covered', target: '3', current: cities, goal: 3, unit: 'cities', completed: cities >= 3 },
      ];

      const seedInitiatives: StageInitiative[] = [
        { title: 'Validate Product-Market Fit', description: 'Achieve consistent user engagement and repeat usage patterns', priority: 'critical', status: users >= 500 ? 'completed' : users >= 100 ? 'in_progress' : 'planned' },
        { title: 'Secure Initial Marketplace Liquidity', description: 'Build sufficient listing inventory to attract active investors', priority: 'critical', status: listings >= 300 ? 'completed' : listings >= 50 ? 'in_progress' : 'planned' },
        { title: 'Close First Property Transactions', description: 'Complete end-to-end deal cycles proving revenue model viability', priority: 'critical', status: deals >= 10 ? 'completed' : deals >= 1 ? 'in_progress' : 'planned' },
        { title: 'Launch AI Investment Scoring', description: 'Deploy initial property intelligence and recommendation engine', priority: 'high', status: ai >= 100 ? 'completed' : ai >= 10 ? 'in_progress' : 'planned' },
      ];

      const seedScore = Math.round(seedMilestones.reduce((s, m) => s + Math.min(100, (m.current / m.goal) * 100), 0) / seedMilestones.length);

      // ── Series A Stage ──
      const seriesAMilestones: Milestone[] = [
        { id: 'a1', label: 'Total Users', target: '25,000', current: users, goal: 25000, unit: 'users', completed: users >= 25000 },
        { id: 'a2', label: 'City Coverage', target: '15', current: cities, goal: 15, unit: 'cities', completed: cities >= 15 },
        { id: 'a3', label: 'Monthly Revenue', target: 'IDR 500M', current: mrr, goal: 500_000_000, unit: 'IDR', completed: mrr >= 500_000_000 },
        { id: 'a4', label: 'AI Jobs Processed', target: '10,000', current: ai, goal: 10000, unit: 'jobs', completed: ai >= 10000 },
      ];

      const seriesAInitiatives: StageInitiative[] = [
        { title: 'Expand Geographic Listing Coverage', description: 'Scale to 15+ cities across Java, Bali, and Sumatra corridors', priority: 'critical', status: cities >= 15 ? 'completed' : cities >= 5 ? 'in_progress' : 'planned' },
        { title: 'Strengthen AI Intelligence Differentiation', description: 'Build proprietary scoring models creating defensible competitive moat', priority: 'critical', status: ai >= 5000 ? 'completed' : ai >= 500 ? 'in_progress' : 'planned' },
        { title: 'Scale Marketing Acquisition Channels', description: 'Optimize referral, SEO, and influencer channels for growth efficiency', priority: 'high', status: users >= 10000 ? 'completed' : users >= 2000 ? 'in_progress' : 'planned' },
        { title: 'Launch Premium Subscription Tier', description: 'Monetize advanced analytics with tiered subscription pricing', priority: 'high', status: subs >= 100 ? 'completed' : subs >= 10 ? 'in_progress' : 'planned' },
      ];

      const seriesAScore = Math.round(seriesAMilestones.reduce((s, m) => s + Math.min(100, (m.current / m.goal) * 100), 0) / seriesAMilestones.length);

      // ── Expansion Stage ──
      const expansionMilestones: Milestone[] = [
        { id: 'e1', label: 'Total Users', target: '200,000', current: users, goal: 200000, unit: 'users', completed: users >= 200000 },
        { id: 'e2', label: 'Premium Subscribers', target: '5,000', current: subs, goal: 5000, unit: 'subs', completed: subs >= 5000 },
        { id: 'e3', label: 'Annual Revenue', target: 'IDR 50B', current: mrr * 12, goal: 50_000_000_000, unit: 'IDR', completed: mrr * 12 >= 50_000_000_000 },
        { id: 'e4', label: 'ASEAN Markets', target: '3', current: 1, goal: 3, unit: 'countries', completed: false },
      ];

      const expansionInitiatives: StageInitiative[] = [
        { title: 'Advanced Analytics Subscription Models', description: 'Launch institutional-grade analytics APIs and enterprise dashboards', priority: 'critical', status: 'planned' },
        { title: 'Cross-Border Investment Features', description: 'Enable ASEAN property investment with multi-currency and compliance', priority: 'critical', status: 'planned' },
        { title: 'Institutional Investor Partnerships', description: 'Build fund manager portal and bulk deal orchestration platform', priority: 'high', status: 'planned' },
        { title: 'Fractional Ownership Infrastructure', description: 'Deploy tokenized property investment enabling micro-investments', priority: 'medium', status: 'planned' },
      ];

      const expansionScore = Math.round(expansionMilestones.reduce((s, m) => s + Math.min(100, (m.current / m.goal) * 100), 0) / expansionMilestones.length);

      // Determine current stage
      const currentStage = seedScore >= 80 ? (seriesAScore >= 60 ? 'expansion' : 'series_a') : 'seed';

      const stages: FundingStage[] = [
        { id: 'seed', name: 'Seed Stage', subtitle: 'Product-Market Fit & First Revenue', timeline: 'Months 0–12', funding_target: 'IDR 3–5B ($200–350K)', color: 'chart-2', milestones: seedMilestones, initiatives: seedInitiatives, readiness_score: seedScore },
        { id: 'series_a', name: 'Series A', subtitle: 'Scale & Market Expansion', timeline: 'Months 12–24', funding_target: 'IDR 30–50B ($2–3.5M)', color: 'primary', milestones: seriesAMilestones, initiatives: seriesAInitiatives, readiness_score: seriesAScore },
        { id: 'expansion', name: 'Expansion', subtitle: 'Regional Dominance & New Verticals', timeline: 'Months 24–42', funding_target: 'IDR 150–250B ($10–17M)', color: 'chart-4', milestones: expansionMilestones, initiatives: expansionInitiatives, readiness_score: expansionScore },
      ];

      return {
        stages,
        current_stage: currentStage,
        overall_readiness: Math.round((seedScore + seriesAScore + expansionScore) / 3),
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}
