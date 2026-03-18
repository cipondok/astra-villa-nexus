import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RoadmapMilestone {
  id: string;
  label: string;
  current: number;
  goal: number;
  unit: string;
  completed: boolean;
}

export interface RoadmapObjective {
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'planned';
  priority: 'critical' | 'high' | 'medium';
}

export interface RoadmapPhase {
  id: number;
  name: string;
  subtitle: string;
  months: string;
  color: string;
  icon: string;
  milestones: RoadmapMilestone[];
  objectives: RoadmapObjective[];
  readiness: number;
}

export interface ExecutionRoadmapData {
  phases: RoadmapPhase[];
  current_phase: number;
  overall_progress: number;
  months_elapsed: number;
}

function phasePct(milestones: RoadmapMilestone[]): number {
  if (!milestones.length) return 0;
  return Math.round(
    milestones.reduce((s, m) => s + Math.min(100, (m.current / m.goal) * 100), 0) / milestones.length
  );
}

export function useExecutionRoadmap() {
  return useQuery({
    queryKey: ['execution-roadmap-12m'],
    queryFn: async (): Promise<ExecutionRoadmapData> => {
      const [
        totalUsers,
        activeListings,
        totalAgents,
        completedDeals,
        referrals,
        aiJobs,
        activeSubs,
        totalCities,
        totalCommissions,
        watchlistItems,
        totalReviews,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('vendor_business_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).in('status', ['completed', 'accepted']),
        supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('status', 'converted'),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('properties').select('city').eq('status', 'active').limit(1000),
        supabase.from('transaction_commissions').select('commission_amount').limit(500),
        supabase.from('investor_watchlist_items').select('id', { count: 'exact', head: true }),
        supabase.from('vendor_reviews').select('id', { count: 'exact', head: true }),
      ]);

      const users = totalUsers.count || 0;
      const listings = activeListings.count || 0;
      const agents = totalAgents.count || 0;
      const deals = completedDeals.count || 0;
      const refs = referrals.count || 0;
      const ai = aiJobs.count || 0;
      const subs = activeSubs.count || 0;
      const cities = new Set((totalCities.data || []).map(r => r.city).filter(Boolean)).size;
      const rev = (totalCommissions.data || []).reduce((s, r) => s + (r.commission_amount || 0), 0);
      const mrr = Math.round(rev / 12 + subs * 500_000);
      const watchlist = watchlistItems.count || 0;
      const reviews = totalReviews.count || 0;

      // ── Phase 1: Foundation Build (M1–3) ──
      const p1Milestones: RoadmapMilestone[] = [
        { id: 'p1-1', label: 'MVP Launch', current: listings > 0 ? 1 : 0, goal: 1, unit: 'launch', completed: listings > 0 },
        { id: 'p1-2', label: 'Agent/Developer Supply', current: agents, goal: 50, unit: 'partners', completed: agents >= 50 },
        { id: 'p1-3', label: 'Active Listings', current: listings, goal: 200, unit: 'listings', completed: listings >= 200 },
        { id: 'p1-4', label: 'First Investors', current: users, goal: 500, unit: 'users', completed: users >= 500 },
      ];
      const p1Objectives: RoadmapObjective[] = [
        { title: 'Launch MVP Intelligent Listing Marketplace', description: 'Deploy core property discovery with AI-scored listings and search', priority: 'critical', status: listings > 0 ? 'completed' : 'in_progress' },
        { title: 'Onboard Initial Agent & Developer Supply', description: 'Recruit first 50 agents and developers to seed listing inventory', priority: 'critical', status: agents >= 50 ? 'completed' : agents >= 10 ? 'in_progress' : 'planned' },
        { title: 'Acquire First Active Investor Users', description: 'Drive initial user registration through direct outreach and content', priority: 'high', status: users >= 500 ? 'completed' : users >= 50 ? 'in_progress' : 'planned' },
      ];

      // ── Phase 2: Traction Growth (M4–6) ──
      const p2Milestones: RoadmapMilestone[] = [
        { id: 'p2-1', label: 'AI Scores Generated', current: ai, goal: 1000, unit: 'scores', completed: ai >= 1000 },
        { id: 'p2-2', label: 'Referral Sign-ups', current: refs, goal: 100, unit: 'referrals', completed: refs >= 100 },
        { id: 'p2-3', label: 'Verified Transactions', current: deals, goal: 25, unit: 'deals', completed: deals >= 25 },
        { id: 'p2-4', label: 'Watchlist Engagement', current: watchlist, goal: 500, unit: 'items', completed: watchlist >= 500 },
      ];
      const p2Objectives: RoadmapObjective[] = [
        { title: 'Optimize Opportunity Scoring Experience', description: 'Refine AI scoring UX with investor feedback for higher engagement', priority: 'critical', status: ai >= 1000 ? 'completed' : ai >= 100 ? 'in_progress' : 'planned' },
        { title: 'Implement Referral Growth Mechanics', description: 'Launch tiered referral program with gamified milestone rewards', priority: 'high', status: refs >= 50 ? 'completed' : refs >= 5 ? 'in_progress' : 'planned' },
        { title: 'Close First Verified Property Transactions', description: 'Complete end-to-end deal cycles proving commission revenue model', priority: 'critical', status: deals >= 25 ? 'completed' : deals >= 1 ? 'in_progress' : 'planned' },
      ];

      // ── Phase 3: Intelligence Expansion (M7–9) ──
      const p3Milestones: RoadmapMilestone[] = [
        { id: 'p3-1', label: 'Active Users', current: users, goal: 5000, unit: 'users', completed: users >= 5000 },
        { id: 'p3-2', label: 'Premium Subscribers', current: subs, goal: 100, unit: 'subs', completed: subs >= 100 },
        { id: 'p3-3', label: 'Monthly Revenue', current: mrr, goal: 50_000_000, unit: 'IDR', completed: mrr >= 50_000_000 },
        { id: 'p3-4', label: 'Platform Reviews', current: reviews, goal: 200, unit: 'reviews', completed: reviews >= 200 },
      ];
      const p3Objectives: RoadmapObjective[] = [
        { title: 'Enhance Portfolio Analytics Dashboards', description: 'Build institutional-grade ROI tracking and diversification analysis', priority: 'critical', status: subs >= 20 ? 'completed' : subs >= 5 ? 'in_progress' : 'planned' },
        { title: 'Introduce Premium Investor Insight Features', description: 'Gate advanced AI models, deep comparisons behind subscription tiers', priority: 'high', status: subs >= 100 ? 'completed' : subs >= 10 ? 'in_progress' : 'planned' },
        { title: 'Scale Marketing Acquisition Channels', description: 'Optimize SEO, influencer, and referral channels for CAC efficiency', priority: 'high', status: users >= 5000 ? 'completed' : users >= 1000 ? 'in_progress' : 'planned' },
      ];

      // ── Phase 4: Scaling Readiness (M10–12) ──
      const p4Milestones: RoadmapMilestone[] = [
        { id: 'p4-1', label: 'Total Users', current: users, goal: 15000, unit: 'users', completed: users >= 15000 },
        { id: 'p4-2', label: 'City Coverage', current: cities, goal: 10, unit: 'cities', completed: cities >= 10 },
        { id: 'p4-3', label: 'Monthly Revenue', current: mrr, goal: 300_000_000, unit: 'IDR', completed: mrr >= 300_000_000 },
        { id: 'p4-4', label: 'Deal Pipeline', current: deals, goal: 100, unit: 'deals', completed: deals >= 100 },
      ];
      const p4Objectives: RoadmapObjective[] = [
        { title: 'Strengthen Platform Performance Infrastructure', description: 'Optimize database, caching, and edge functions for 10x scale readiness', priority: 'critical', status: 'planned' },
        { title: 'Expand Into Additional High-Demand Cities', description: 'Launch operations in 10+ cities across Java, Bali, and Sumatra', priority: 'high', status: cities >= 10 ? 'completed' : cities >= 5 ? 'in_progress' : 'planned' },
        { title: 'Prepare Series A Fundraising Narrative', description: 'Build data room with validated traction metrics and growth trajectory', priority: 'high', status: 'planned' },
      ];

      const phases: RoadmapPhase[] = [
        { id: 1, name: 'Foundation Build', subtitle: 'MVP launch & initial supply', months: 'Months 1–3', color: 'chart-2', icon: 'foundation', milestones: p1Milestones, objectives: p1Objectives, readiness: phasePct(p1Milestones) },
        { id: 2, name: 'Traction Growth', subtitle: 'Scoring, referrals & first deals', months: 'Months 4–6', color: 'primary', icon: 'traction', milestones: p2Milestones, objectives: p2Objectives, readiness: phasePct(p2Milestones) },
        { id: 3, name: 'Intelligence Expansion', subtitle: 'Analytics, premium & channels', months: 'Months 7–9', color: 'chart-4', icon: 'intelligence', milestones: p3Milestones, objectives: p3Objectives, readiness: phasePct(p3Milestones) },
        { id: 4, name: 'Scaling Readiness', subtitle: 'Infra, cities & Series A prep', months: 'Months 10–12', color: 'chart-5', icon: 'scaling', milestones: p4Milestones, objectives: p4Objectives, readiness: phasePct(p4Milestones) },
      ];

      const currentPhase = phases[0].readiness >= 80 ? (phases[1].readiness >= 80 ? (phases[2].readiness >= 80 ? 4 : 3) : 2) : 1;
      const overall = Math.round(phases.reduce((s, p) => s + p.readiness, 0) / phases.length);

      return { phases, current_phase: currentPhase, overall_progress: overall, months_elapsed: Math.min(12, Math.max(1, currentPhase * 3)) };
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}
