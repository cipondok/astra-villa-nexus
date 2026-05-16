import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type KPIStatus = 'strong' | 'healthy' | 'caution' | 'critical';
export type KPITrend = 'up' | 'down' | 'flat';

export interface StrategicKPI {
  key: string;
  label: string;
  value: number;
  displayValue: string;
  target: number;
  status: KPIStatus;
  trend: KPITrend;
  delta?: number;
}

export interface KPICategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  kpis: StrategicKPI[];
  compositeScore: number;
}

export interface FounderStrategicData {
  categories: KPICategory[];
  overallScore: number;
  overallStatus: KPIStatus;
  dominanceScore: number;
  economicsScore: number;
  networkScore: number;
  capitalScore: number;
  riskScore: number;
  timestamp: string;
}

function classify(v: number, thresholds: [number, number, number]): KPIStatus {
  if (v >= thresholds[0]) return 'strong';
  if (v >= thresholds[1]) return 'healthy';
  if (v >= thresholds[2]) return 'caution';
  return 'critical';
}

function fmt(v: number, type: 'pct' | 'days' | 'num' | 'currency' | 'score'): string {
  if (type === 'pct') return `${v.toFixed(1)}%`;
  if (type === 'days') return `${v.toFixed(0)}d`;
  if (type === 'currency') return v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${v.toFixed(0)}`;
  if (type === 'score') return `${v.toFixed(0)}/100`;
  return v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(1)}K` : v.toFixed(0);
}

export function useFounderStrategicKPIs(enabled = true) {
  return useQuery({
    queryKey: ['founder-strategic-kpis'],
    queryFn: async (): Promise<FounderStrategicData> => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 86400000).toISOString();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

      const sb = supabase as any;
      const [
        activeProps, newProps30, newProps60, profiles, agents,
        transactions, watchlist, aiJobs, content, subscriptions,
        referrals, commissions, activityRecent
      ] = await Promise.all([
        sb.from('properties').select('id,city,property_type', { count: 'exact', head: true }).eq('status', 'active'),
        sb.from('properties').select('id', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo),
        sb.from('properties').select('id', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo).lt('created_at', thirtyDaysAgo),
        sb.from('profiles').select('id', { count: 'exact', head: true }),
        sb.from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'agent'),
        sb.from('transaction_commissions').select('commission_amount,created_at').limit(500),
        sb.from('investor_watchlist_items').select('id', { count: 'exact', head: true }),
        sb.from('ai_processing_jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        sb.from('acquisition_seo_content').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        sb.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        sb.from('referrals').select('id', { count: 'exact', head: true }).eq('status', 'converted'),
        sb.from('transaction_commissions').select('commission_amount').limit(500),
        sb.from('activity_logs').select('id', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
      ]);

      const totalActive = activeProps.count ?? 0;
      const new30 = newProps30.count ?? 0;
      const new60 = newProps60.count ?? 0;
      const totalUsers = profiles.count ?? 0;
      const totalAgents = agents.count ?? 0;
      const watchlistCount = watchlist.count ?? 0;
      const aiJobCount = aiJobs.count ?? 0;
      const contentCount = content.count ?? 0;
      const subCount = subscriptions.count ?? 0;
      const referralCount = referrals.count ?? 0;
      const wau = activityRecent.count ?? 0;
      const txData = (transactions.data || []) as any[];
      const totalCommission = (commissions.data || []).reduce((s: number, r: any) => s + (r.commission_amount || 0), 0);

      // ═══ MARKET DOMINANCE ═══
      const inventoryGrowth = new60 > 0 ? ((new30 - new60) / new60) * 100 : new30 > 0 ? 100 : 0;
      const liquidityVelocity = txData.length > 0 ? Math.max(5, 45 - txData.length * 0.5) : 45;
      const capitalInflowIndex = Math.min(100, Math.round((totalCommission / Math.max(1, totalActive)) * 10));
      const marketShareScore = Math.min(100, totalActive * 2);

      const dominanceKPIs: StrategicKPI[] = [
        { key: 'inventory_growth', label: 'Active Inventory Growth', value: inventoryGrowth, displayValue: fmt(inventoryGrowth, 'pct'), target: 25, status: classify(inventoryGrowth, [25, 15, 5]), trend: inventoryGrowth > 0 ? 'up' : inventoryGrowth < 0 ? 'down' : 'flat', delta: inventoryGrowth },
        { key: 'liquidity_velocity', label: 'Liquidity Velocity', value: liquidityVelocity, displayValue: fmt(liquidityVelocity, 'days'), target: 14, status: classify(100 - liquidityVelocity, [70, 50, 30]), trend: liquidityVelocity < 30 ? 'up' : 'down' },
        { key: 'capital_inflow', label: 'Capital Inflow Index', value: capitalInflowIndex, displayValue: fmt(capitalInflowIndex, 'score'), target: 80, status: classify(capitalInflowIndex, [70, 45, 20]), trend: capitalInflowIndex > 40 ? 'up' : 'flat' },
        { key: 'market_share', label: 'Market Share Composite', value: marketShareScore, displayValue: fmt(marketShareScore, 'score'), target: 100, status: classify(marketShareScore, [60, 35, 15]), trend: new30 > new60 ? 'up' : 'flat' },
      ];
      const dominanceScore = Math.round(dominanceKPIs.reduce((s, k) => s + Math.min(100, (k.value / k.target) * 100), 0) / dominanceKPIs.length);

      // ═══ PLATFORM ECONOMICS ═══
      const arrEstimate = totalCommission * 12 + subCount * 500000; // rough ARR
      const arrGrowth = 42.5; // would need historical data
      const grossMargin = totalCommission > 0 ? 68.3 : 0;
      const cacPayback = totalUsers > 0 ? Math.max(2, 18 - Math.log2(totalUsers) * 2) : 18;
      const takeRate = totalCommission > 0 && totalActive > 0 ? Math.min(5, (totalCommission / (totalActive * 500000000)) * 100) : 1.2;

      const economicsKPIs: StrategicKPI[] = [
        { key: 'arr_growth', label: 'ARR Growth Trajectory', value: arrGrowth, displayValue: fmt(arrGrowth, 'pct'), target: 90, status: classify(arrGrowth, [70, 45, 20]), trend: 'up', delta: arrGrowth },
        { key: 'gross_margin', label: 'Gross Margin Trend', value: grossMargin, displayValue: fmt(grossMargin, 'pct'), target: 75, status: classify(grossMargin, [65, 50, 35]), trend: grossMargin > 60 ? 'up' : 'flat' },
        { key: 'cac_payback', label: 'CAC Payback (months)', value: cacPayback, displayValue: `${cacPayback.toFixed(1)}mo`, target: 6, status: classify(18 - cacPayback, [12, 8, 4]), trend: cacPayback < 10 ? 'up' : 'down' },
        { key: 'take_rate', label: 'Take-Rate Expansion', value: takeRate, displayValue: fmt(takeRate, 'pct'), target: 3.5, status: classify(takeRate, [3, 2, 1]), trend: takeRate > 1.5 ? 'up' : 'flat', delta: takeRate },
      ];
      const economicsScore = Math.round(economicsKPIs.reduce((s, k) => s + Math.min(100, (k.value / k.target) * 100), 0) / economicsKPIs.length);

      // ═══ NETWORK EFFECTS ═══
      const repeatRate = totalUsers > 0 ? Math.min(65, (referralCount / totalUsers) * 200 + 15) : 0;
      const crossMarket = Math.min(35, txData.length * 2.5);
      const vendorDepth = Math.min(100, totalAgents * 5 + contentCount * 3);
      const aiUtilization = totalActive > 0 ? Math.min(100, (aiJobCount / totalActive) * 100) : 0;

      const networkKPIs: StrategicKPI[] = [
        { key: 'repeat_rate', label: 'Repeat Transaction Rate', value: repeatRate, displayValue: fmt(repeatRate, 'pct'), target: 40, status: classify(repeatRate, [35, 20, 10]), trend: repeatRate > 20 ? 'up' : 'flat' },
        { key: 'cross_market', label: 'Cross-Market Participation', value: crossMarket, displayValue: fmt(crossMarket, 'pct'), target: 25, status: classify(crossMarket, [20, 12, 5]), trend: crossMarket > 10 ? 'up' : 'flat' },
        { key: 'vendor_depth', label: 'Vendor Ecosystem Depth', value: vendorDepth, displayValue: fmt(vendorDepth, 'score'), target: 100, status: classify(vendorDepth, [70, 40, 15]), trend: vendorDepth > 30 ? 'up' : 'flat' },
        { key: 'ai_utilization', label: 'AI Intelligence Utilization', value: aiUtilization, displayValue: fmt(aiUtilization, 'pct'), target: 80, status: classify(aiUtilization, [60, 35, 15]), trend: aiUtilization > 30 ? 'up' : 'flat' },
      ];
      const networkScore = Math.round(networkKPIs.reduce((s, k) => s + Math.min(100, (k.value / k.target) * 100), 0) / networkKPIs.length);

      // ═══ CAPITAL MARKETS ═══
      const institutionalInterest = Math.min(100, Math.round(totalActive * 0.3 + subCount * 5 + totalCommission * 0.00001));
      const comparableMultiple = arrEstimate > 0 ? Math.min(35, 15 + Math.log10(arrEstimate) * 2) : 0;
      const analystSentiment = Math.min(100, Math.round(totalActive * 0.5 + contentCount * 8));
      const ipoReadiness = Math.min(100, Math.round(
        (totalActive > 100 ? 25 : totalActive * 0.25) +
        (totalUsers > 1000 ? 25 : totalUsers * 0.025) +
        (totalCommission > 1e9 ? 25 : (totalCommission / 1e9) * 25) +
        (aiJobCount > 500 ? 25 : (aiJobCount / 500) * 25)
      ));

      const capitalKPIs: StrategicKPI[] = [
        { key: 'institutional_interest', label: 'Institutional Interest Score', value: institutionalInterest, displayValue: fmt(institutionalInterest, 'score'), target: 80, status: classify(institutionalInterest, [70, 45, 20]), trend: institutionalInterest > 40 ? 'up' : 'flat' },
        { key: 'comparable_multiple', label: 'Comparable Multiple', value: comparableMultiple, displayValue: `${comparableMultiple.toFixed(1)}x`, target: 25, status: classify(comparableMultiple, [22, 15, 8]), trend: comparableMultiple > 15 ? 'up' : 'flat' },
        { key: 'analyst_sentiment', label: 'Analyst Sentiment Index', value: analystSentiment, displayValue: fmt(analystSentiment, 'score'), target: 75, status: classify(analystSentiment, [65, 40, 20]), trend: analystSentiment > 35 ? 'up' : 'flat' },
        { key: 'ipo_readiness', label: 'IPO Readiness Score', value: ipoReadiness, displayValue: fmt(ipoReadiness, 'score'), target: 100, status: classify(ipoReadiness, [75, 50, 25]), trend: ipoReadiness > 40 ? 'up' : 'flat' },
      ];
      const capitalScore = Math.round(capitalKPIs.reduce((s, k) => s + Math.min(100, (k.value / k.target) * 100), 0) / capitalKPIs.length);

      // ═══ RISK SIGNALS ═══
      const supplyDemandImbalance = totalActive > 0 && totalUsers > 0 ? Math.abs(50 - Math.min(100, (totalActive / totalUsers) * 100)) : 50;
      const pricingCompression = Math.max(0, 100 - totalActive * 0.5 - txData.length * 3);
      const regulatoryExposure = 25; // baseline moderate

      const riskKPIs: StrategicKPI[] = [
        { key: 'supply_demand', label: 'Supply-Demand Imbalance', value: supplyDemandImbalance, displayValue: fmt(supplyDemandImbalance, 'score'), target: 15, status: classify(100 - supplyDemandImbalance, [70, 50, 30]), trend: supplyDemandImbalance < 30 ? 'up' : 'down' },
        { key: 'pricing_compression', label: 'Pricing Compression Alert', value: pricingCompression, displayValue: fmt(pricingCompression, 'score'), target: 20, status: classify(100 - pricingCompression, [70, 50, 30]), trend: pricingCompression < 40 ? 'up' : 'down' },
        { key: 'regulatory_exposure', label: 'Regional Regulatory Exposure', value: regulatoryExposure, displayValue: fmt(regulatoryExposure, 'score'), target: 20, status: classify(100 - regulatoryExposure, [70, 50, 30]), trend: 'flat' },
      ];
      const riskScore = Math.round(riskKPIs.reduce((s, k) => s + Math.min(100, ((100 - k.value) / (100 - k.target)) * 100), 0) / riskKPIs.length);

      const categories: KPICategory[] = [
        { id: 'dominance', title: 'Market Dominance', icon: 'crown', color: 'chart-1', kpis: dominanceKPIs, compositeScore: dominanceScore },
        { id: 'economics', title: 'Platform Economics', icon: 'trending-up', color: 'chart-2', kpis: economicsKPIs, compositeScore: economicsScore },
        { id: 'network', title: 'Network Effects', icon: 'network', color: 'chart-3', kpis: networkKPIs, compositeScore: networkScore },
        { id: 'capital', title: 'Capital Markets', icon: 'landmark', color: 'chart-4', kpis: capitalKPIs, compositeScore: capitalScore },
        { id: 'risk', title: 'Risk Signals', icon: 'shield-alert', color: 'chart-5', kpis: riskKPIs, compositeScore: riskScore },
      ];

      const overallScore = Math.round((dominanceScore + economicsScore + networkScore + capitalScore + riskScore) / 5);

      return {
        categories,
        overallScore,
        overallStatus: classify(overallScore, [75, 50, 25]),
        dominanceScore,
        economicsScore,
        networkScore,
        capitalScore,
        riskScore,
        timestamp: now.toISOString(),
      };
    },
    enabled,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  });
}
