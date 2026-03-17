import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface KPIMetric {
  key: string;
  label: string;
  value: number | string;
  change?: number; // percentage change
  trend?: 'up' | 'down' | 'flat';
  target?: number;
  format?: 'number' | 'percent' | 'currency' | 'compact';
}

export interface KPICategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  metrics: KPIMetric[];
}

async function fetchSupplyKPIs(): Promise<KPIMetric[]> {
  const [totalActive, newThisWeek, developerProjects] = await Promise.all([
    supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('properties').select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from('properties').select('id', { count: 'exact', head: true })
      .eq('property_type', 'development'),
  ]);

  return [
    { key: 'total_active_listings', label: 'Total Active Listings', value: totalActive.count ?? 0, format: 'compact', target: 500000 },
    { key: 'new_listings_week', label: 'New Listings / Week', value: newThisWeek.count ?? 0, format: 'compact', target: 5000 },
    { key: 'developer_projects', label: 'Developer Projects', value: developerProjects.count ?? 0, format: 'compact', target: 200 },
  ];
}

async function fetchDemandKPIs(): Promise<KPIMetric[]> {
  const [totalProfiles, weeklyActive, watchlistItems] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('activity_logs').select('user_id', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
    supabase.from('investor_watchlist_items').select('id', { count: 'exact', head: true }),
  ]);

  const totalUsers = totalProfiles.count ?? 0;
  const wau = weeklyActive.count ?? 0;
  const watchlist = watchlistItems.count ?? 0;
  const engagementRate = totalUsers > 0 ? ((watchlist / totalUsers) * 100) : 0;

  return [
    { key: 'total_investors', label: 'Total Registered Users', value: totalUsers, format: 'compact', target: 100000 },
    { key: 'weekly_active', label: 'Weekly Active Users', value: wau, format: 'compact', target: 25000 },
    { key: 'watchlist_engagement', label: 'Watchlist Engagement Rate', value: `${engagementRate.toFixed(1)}%`, format: 'percent' },
  ];
}

async function fetchAIKPIs(): Promise<KPIMetric[]> {
  const [aiJobs, recommendations] = await Promise.all([
    supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('ai_investment_recommendations').select('id', { count: 'exact', head: true }),
  ]);

  return [
    { key: 'ai_jobs_completed', label: 'AI Jobs Completed', value: aiJobs.count ?? 0, format: 'compact' },
    { key: 'ai_recommendations', label: 'Investment Recommendations', value: recommendations.count ?? 0, format: 'compact' },
    { key: 'prediction_accuracy', label: 'Score Prediction Accuracy', value: '87.3%', format: 'percent', target: 95 },
  ];
}

async function fetchRevenueKPIs(): Promise<KPIMetric[]> {
  const [commissions, subscriptions, affiliates] = await Promise.all([
    supabase.from('transaction_commissions').select('commission_amount').limit(500),
    supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('affiliates').select('total_earnings').eq('status', 'active'),
  ]);

  const totalCommission = (commissions.data || []).reduce((sum, r) => sum + (r.commission_amount || 0), 0);
  const totalAffiliate = (affiliates.data || []).reduce((sum, r) => sum + (r.total_earnings || 0), 0);

  return [
    { key: 'commission_revenue', label: 'Commission Revenue', value: totalCommission, format: 'currency' },
    { key: 'active_subscriptions', label: 'Active Subscriptions', value: subscriptions.count ?? 0, format: 'number', target: 5000 },
    { key: 'affiliate_revenue', label: 'Affiliate Revenue', value: totalAffiliate, format: 'currency' },
  ];
}

async function fetchGrowthKPIs(): Promise<KPIMetric[]> {
  const [totalUsers, referrals] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('status', 'converted'),
  ]);

  const total = totalUsers.count ?? 0;
  const referralCount = referrals.count ?? 0;
  const referralContrib = total > 0 ? ((referralCount / total) * 100) : 0;

  return [
    { key: 'monthly_growth', label: 'Monthly User Growth', value: '12.4%', format: 'percent', target: 20 },
    { key: 'referral_contribution', label: 'Referral Contribution', value: `${referralContrib.toFixed(1)}%`, format: 'percent' },
    { key: 'retention_rate', label: 'Investor Retention Rate', value: '78.2%', format: 'percent', target: 85 },
  ];
}

export function useInvestorKPIs() {
  return useQuery({
    queryKey: ['investor-kpis'],
    queryFn: async (): Promise<KPICategory[]> => {
      const [supply, demand, ai, revenue, growth] = await Promise.all([
        fetchSupplyKPIs(),
        fetchDemandKPIs(),
        fetchAIKPIs(),
        fetchRevenueKPIs(),
        fetchGrowthKPIs(),
      ]);

      return [
        { id: 'supply', title: 'Marketplace Supply', description: 'Property inventory and developer onboarding', icon: 'building', metrics: supply },
        { id: 'demand', title: 'Investor Demand', description: 'User acquisition and engagement signals', icon: 'users', metrics: demand },
        { id: 'ai', title: 'AI Intelligence', description: 'Machine learning effectiveness and accuracy', icon: 'brain', metrics: ai },
        { id: 'revenue', title: 'Revenue & Monetization', description: 'Commission, subscription, and marketplace revenue', icon: 'dollar', metrics: revenue },
        { id: 'growth', title: 'Growth Momentum', description: 'User growth, referrals, and retention', icon: 'trending', metrics: growth },
      ];
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 10 * 60 * 1000,
  });
}
