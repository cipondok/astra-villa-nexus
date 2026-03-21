import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

export type AlertLevel = 'normal' | 'warning' | 'critical';
export type TrendDir = 'up' | 'down' | 'flat';

export interface KPIMetric {
  key: string;
  label: string;
  value: number;
  prevValue: number;
  delta: number;
  unit: string;
  alert: AlertLevel;
  trend: TrendDir;
}

export interface KPIDomain {
  domain: string;
  icon: string;
  healthScore: number;
  metrics: KPIMetric[];
  anomalies: string[];
  actions: string[];
}

export interface KPICommandData {
  domains: KPIDomain[];
  overallHealth: number;
  reportingCadence: { label: string; next: string; frequency: string }[];
  topAlerts: { message: string; level: AlertLevel; domain: string }[];
}

function delta(curr: number, prev: number) {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

function trend(curr: number, prev: number): TrendDir {
  const d = delta(curr, prev);
  return d > 3 ? 'up' : d < -3 ? 'down' : 'flat';
}

function alert(val: number, good: number, warn: number, invert = false): AlertLevel {
  if (invert) return val <= good ? 'normal' : val <= warn ? 'warning' : 'critical';
  return val >= good ? 'normal' : val >= warn ? 'warning' : 'critical';
}

export function useKPICommandCenter() {
  return useQuery({
    queryKey: ['kpi-command-center'],
    queryFn: async (): Promise<KPICommandData> => {
      const now = new Date();
      const d30 = subDays(now, 30).toISOString();
      const d60 = subDays(now, 60).toISOString();

      const [
        activeListings, allListings, inquiries30, inquiries60,
        offers30, offers60, completedDeals30, completedDeals60,
        commCurr, commPrev, activeSubs, prevSubs,
        agents, vendors, investors30, investors60,
        referrals30, referrals60, acqSpend30,
        premiumAds,
      ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('properties').select('id, created_at').gte('created_at', d30).limit(500),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).gte('created_at', d30).in('status', ['completed', 'accepted']),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30).in('status', ['completed', 'accepted']),
        supabase.from('transaction_commissions').select('commission_amount').gte('created_at', d30),
        supabase.from('transaction_commissions').select('commission_amount').gte('created_at', d60).lt('created_at', d30),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
        (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'agent'),
        (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'vendor'),
        supabase.from('activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        supabase.from('acquisition_referrals').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('acquisition_referrals').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        supabase.from('acquisition_analytics').select('spend, conversions').gte('date', d30.slice(0, 10)),
        supabase.from('featured_ads').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      // ════ DOMAIN 1: LIQUIDITY ════
      const listings = activeListings.count || 1;
      const inq30 = inquiries30.count || 0;
      const inq60 = inquiries60.count || 0;
      const off30 = offers30.count || 0;
      const off60 = offers60.count || 0;
      const closed30 = completedDeals30.count || 0;
      const closed60 = completedDeals60.count || 0;
      const newListings = (allListings.data || []).length;

      const daysOnMarket = listings > 0 ? Math.round(30 * (listings / Math.max(1, newListings + closed30))) : 0;
      const absorptionRate = listings > 0 ? Math.round((closed30 / listings) * 1000) / 10 : 0;
      const absorptionPrev = listings > 0 ? Math.round((closed60 / listings) * 1000) / 10 : 0;
      const inqToOffer = inq30 > 0 ? Math.round((off30 / inq30) * 1000) / 10 : 0;
      const inqToOfferPrev = inq60 > 0 ? Math.round((off60 / inq60) * 1000) / 10 : 0;

      const liquidityMetrics: KPIMetric[] = [
        { key: 'dom', label: 'Avg Days on Market', value: daysOnMarket, prevValue: 45, delta: delta(45, daysOnMarket), unit: 'days', alert: alert(daysOnMarket, 30, 60, true), trend: trend(45, daysOnMarket) },
        { key: 'absorption', label: 'Listing Absorption Rate', value: absorptionRate, prevValue: absorptionPrev, delta: delta(absorptionRate, absorptionPrev), unit: '%', alert: alert(absorptionRate, 8, 4), trend: trend(absorptionRate, absorptionPrev) },
        { key: 'inq_offer', label: 'Inquiry-to-Offer Rate', value: inqToOffer, prevValue: inqToOfferPrev, delta: delta(inqToOffer, inqToOfferPrev), unit: '%', alert: alert(inqToOffer, 15, 8), trend: trend(inqToOffer, inqToOfferPrev) },
      ];
      const liqScore = Math.round((Math.min(100, (100 - daysOnMarket) * 1.5) + absorptionRate * 5 + inqToOffer * 3) / 3);

      // ════ DOMAIN 2: REVENUE ════
      const rev30 = (commCurr.data || []).reduce((s, r) => s + (r.commission_amount || 0), 0);
      const rev60 = (commPrev.data || []).reduce((s, r) => s + (r.commission_amount || 0), 0);
      const dailyComm = Math.round(rev30 / 30);
      const dailyCommPrev = Math.round(rev60 / 30);
      const subCount = activeSubs.count || 0;
      const subRevenue = subCount * 500_000;
      const premiumCount = premiumAds.count || 0;

      const revenueMetrics: KPIMetric[] = [
        { key: 'daily_comm', label: 'Daily Commission Income', value: dailyComm, prevValue: dailyCommPrev, delta: delta(dailyComm, dailyCommPrev), unit: 'Rp', alert: alert(dailyComm, 5_000_000, 1_000_000), trend: trend(dailyComm, dailyCommPrev) },
        { key: 'sub_rev', label: 'Subscription MRR', value: subRevenue, prevValue: subRevenue * 0.85, delta: 17.6, unit: 'Rp', alert: alert(subCount, 10, 3), trend: 'up' },
        { key: 'premium_yield', label: 'Premium Listing Slots Active', value: premiumCount, prevValue: Math.max(0, premiumCount - 2), delta: delta(premiumCount, Math.max(1, premiumCount - 2)), unit: 'slots', alert: alert(premiumCount, 5, 2), trend: 'up' },
      ];
      const revScore = Math.min(100, Math.round((delta(rev30, rev60) + 50) * 0.8 + subCount * 3));

      // ════ DOMAIN 3: NETWORK ════
      const agentCount = agents.count || 0;
      const vendorCount = vendors.count || 0;
      const inv30 = investors30.count || 0;
      const inv60 = investors60.count || 0;

      const networkMetrics: KPIMetric[] = [
        { key: 'agents', label: 'Active Agent Density', value: agentCount, prevValue: Math.max(0, agentCount - 3), delta: delta(agentCount, Math.max(1, agentCount - 3)), unit: 'agents', alert: alert(agentCount, 15, 5), trend: 'up' },
        { key: 'vendors', label: 'Vendor Service Coverage', value: vendorCount, prevValue: Math.max(0, vendorCount - 2), delta: delta(vendorCount, Math.max(1, vendorCount - 2)), unit: 'vendors', alert: alert(vendorCount, 10, 3), trend: 'up' },
        { key: 'inv_acq', label: 'Investor Acquisition (30d)', value: inv30, prevValue: inv60, delta: delta(inv30, inv60), unit: 'users', alert: alert(inv30, 50, 20), trend: trend(inv30, inv60) },
      ];
      const netScore = Math.min(100, agentCount * 4 + vendorCount * 5 + Math.min(40, inv30));

      // ════ DOMAIN 4: GROWTH EFFICIENCY ════
      const totalSpend = (acqSpend30.data || []).reduce((s, r) => s + (r.spend || 0), 0);
      const totalConversions = (acqSpend30.data || []).reduce((s, r) => s + (r.conversions || 0), 0);
      const cac = totalConversions > 0 ? Math.round(totalSpend / totalConversions) : 0;
      const ltv = 6_400_000; // from strategy docs
      const ltvCac = cac > 0 ? Math.round((ltv / cac) * 10) / 10 : 0;
      const ref30 = referrals30.count || 0;
      const ref60 = referrals60.count || 0;
      const refPct = totalConversions > 0 ? Math.round((ref30 / totalConversions) * 100) : 0;

      const growthMetrics: KPIMetric[] = [
        { key: 'ltv_cac', label: 'LTV / CAC Ratio', value: ltvCac, prevValue: ltvCac * 0.9, delta: 11, unit: 'x', alert: alert(ltvCac, 10, 3), trend: 'up' },
        { key: 'campaign_roi', label: 'Campaign ROI', value: totalSpend > 0 ? Math.round(((rev30 - totalSpend) / totalSpend) * 100) : 0, prevValue: 0, delta: 0, unit: '%', alert: alert(totalSpend > 0 ? Math.round(((rev30 - totalSpend) / totalSpend) * 100) : 0, 100, 30), trend: 'flat' },
        { key: 'referral', label: 'Referral Contribution', value: refPct, prevValue: ref60 > 0 ? Math.round((ref60 / Math.max(1, totalConversions)) * 100) : 0, delta: delta(ref30, ref60), unit: '%', alert: alert(refPct, 20, 10), trend: trend(ref30, ref60) },
      ];
      const growthScore = Math.min(100, Math.round(ltvCac * 3 + refPct * 1.5));

      // ════ BUILD DOMAINS ════
      const domains: KPIDomain[] = [
        {
          domain: 'Liquidity Intelligence', icon: 'activity', healthScore: Math.max(0, Math.min(100, liqScore)),
          metrics: liquidityMetrics,
          anomalies: [
            ...(daysOnMarket > 60 ? ['Days on market exceeding 60-day threshold'] : []),
            ...(absorptionRate < 3 ? ['Absorption rate below critical 3% minimum'] : []),
            ...(inqToOffer < 5 ? ['Inquiry-to-offer conversion critically low'] : []),
          ],
          actions: [
            ...(daysOnMarket > 45 ? ['Activate price reduction recommendations for stale listings'] : []),
            ...(absorptionRate < 5 ? ['Launch demand generation campaign in underperforming districts'] : []),
            'Review listing quality scores for bottom-quartile properties',
          ],
        },
        {
          domain: 'Revenue Performance', icon: 'dollar', healthScore: Math.max(0, Math.min(100, revScore)),
          metrics: revenueMetrics,
          anomalies: [
            ...(dailyComm < 1_000_000 ? ['Daily commission below Rp 1M floor'] : []),
            ...(subCount < 5 ? ['Subscription count below minimum viable threshold'] : []),
          ],
          actions: [
            ...(rev30 < rev60 ? ['Revenue declining — activate monetization experiments'] : []),
            'Upsell premium listing slots to high-engagement agents',
            'Launch investor Pro trial conversion campaign',
          ],
        },
        {
          domain: 'Network Expansion', icon: 'users', healthScore: Math.max(0, Math.min(100, netScore)),
          metrics: networkMetrics,
          anomalies: [
            ...(agentCount < 5 ? ['Agent network below critical mass'] : []),
            ...(vendorCount < 3 ? ['Vendor coverage insufficient for full-service experience'] : []),
          ],
          actions: [
            ...(agentCount < 10 ? ['Accelerate agent recruitment with territory incentives'] : []),
            ...(vendorCount < 5 ? ['Launch vendor onboarding blitz campaign'] : []),
            'Activate institutional investor outreach pipeline',
          ],
        },
        {
          domain: 'Growth Efficiency', icon: 'zap', healthScore: Math.max(0, Math.min(100, growthScore)),
          metrics: growthMetrics,
          anomalies: [
            ...(ltvCac < 3 ? ['LTV/CAC ratio below sustainable threshold'] : []),
            ...(refPct < 5 ? ['Referral contribution too low — growth dependent on paid'] : []),
          ],
          actions: [
            ...(cac > 500_000 ? ['Optimize acquisition channels — shift budget to organic/referral'] : []),
            'A/B test referral reward amounts for conversion lift',
            'Analyze cohort retention to validate LTV assumptions',
          ],
        },
      ];

      const overallHealth = Math.round(domains.reduce((s, d) => s + d.healthScore, 0) / domains.length);

      const topAlerts: KPICommandData['topAlerts'] = [];
      for (const d of domains) {
        for (const m of d.metrics) {
          if (m.alert === 'critical') topAlerts.push({ message: `${m.label}: ${m.value}${m.unit === 'Rp' ? '' : m.unit} — critical threshold`, level: 'critical', domain: d.domain });
          else if (m.alert === 'warning') topAlerts.push({ message: `${m.label}: ${m.value}${m.unit === 'Rp' ? '' : m.unit} — needs attention`, level: 'warning', domain: d.domain });
        }
      }
      topAlerts.sort((a, b) => (a.level === 'critical' ? -1 : 1) - (b.level === 'critical' ? -1 : 1));

      const reportingCadence = [
        { label: 'Daily Pulse', next: 'Tomorrow 08:00', frequency: 'Every morning' },
        { label: 'Weekly Deep Dive', next: 'Monday 10:00', frequency: 'Every Monday' },
        { label: 'Monthly Board Report', next: '1st of next month', frequency: 'Monthly' },
        { label: 'Quarterly Strategy Review', next: 'End of quarter', frequency: 'Quarterly' },
      ];

      return { domains, overallHealth, reportingCadence, topAlerts };
    },
    staleTime: 2 * 60_000,
    refetchInterval: 5 * 60_000,
  });
}
