import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, addMonths, format } from 'date-fns';

export type ReadinessLevel = 'not_ready' | 'building' | 'approaching' | 'ready';
export type CheckStatus = 'pass' | 'partial' | 'fail';

export interface ReadinessCheck {
  label: string;
  status: CheckStatus;
  current: string;
  target: string;
  pct: number;
}

export interface ReadinessDomain {
  domain: string;
  icon: string;
  score: number;
  checks: ReadinessCheck[];
  narrative: string;
}

export interface TimelinePhase {
  phase: string;
  months: string;
  milestones: string[];
  status: 'completed' | 'active' | 'upcoming';
}

export interface SeriesAData {
  domains: ReadinessDomain[];
  overallScore: number;
  readinessLevel: ReadinessLevel;
  timeline: TimelinePhase[];
  storyStructure: { section: string; hook: string; proof: string }[];
  topGaps: string[];
  targetRaise: string;
  targetValuation: string;
}

function checkStatus(pct: number): CheckStatus {
  return pct >= 80 ? 'pass' : pct >= 40 ? 'partial' : 'fail';
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}M`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export function useSeriesAReadiness() {
  return useQuery({
    queryKey: ['series-a-readiness'],
    queryFn: async (): Promise<SeriesAData> => {
      const now = new Date();
      const d30 = subDays(now, 30).toISOString();
      const d60 = subDays(now, 60).toISOString();
      const d90 = subDays(now, 90).toISOString();

      const [
        activeListings, totalDeals30, totalDeals60, totalDeals90,
        commCurr, commPrev, activeSubs, prevSubs,
        agents, inquiries30, inquiries60,
        referrals30, acqSpend, premiumAds,
        investors30, vendors,
      ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('property_offers').select('id, offer_price', { count: 'exact' }).gte('created_at', d30).in('status', ['completed', 'accepted']),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30).in('status', ['completed', 'accepted']),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).gte('created_at', d90).lt('created_at', d60).in('status', ['completed', 'accepted']),
        supabase.from('transaction_commissions').select('commission_amount').gte('created_at', d30),
        supabase.from('transaction_commissions').select('commission_amount').gte('created_at', d60).lt('created_at', d30),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
        (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'agent'),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        supabase.from('acquisition_referrals').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('acquisition_analytics').select('spend, conversions').gte('date', d30.slice(0, 10)),
        supabase.from('featured_ads').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', d30),
        (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'vendor'),
      ]);

      // ── Derived metrics ──
      const deals30 = totalDeals30.count || 0;
      const deals60 = totalDeals60.count || 0;
      const deals90 = totalDeals90.count || 0;
      const dealGrowthM = deals60 > 0 ? Math.round(((deals30 - deals60) / deals60) * 100) : (deals30 > 0 ? 100 : 0);
      const deal3mTrend = deals90 > 0 ? Math.round(((deals30 - deals90) / deals90) * 100) : 0;

      const rev30 = (commCurr.data || []).reduce((s, r) => s + (r.commission_amount || 0), 0);
      const rev60 = (commPrev.data || []).reduce((s, r) => s + (r.commission_amount || 0), 0);
      const mrr = rev30;
      const arr = mrr * 12;
      const revGrowth = rev60 > 0 ? Math.round(((rev30 - rev60) / rev60) * 100) : (rev30 > 0 ? 100 : 0);

      const subCount = activeSubs.count || 0;
      const subMRR = subCount * 500_000;
      const totalMRR = mrr + subMRR;

      const listings = activeListings.count || 0;
      const agentCount = agents.count || 0;
      const vendorCount = vendors.count || 0;
      const inq30 = inquiries30.count || 0;
      const inq60 = inquiries60.count || 0;
      const ref30 = referrals30.count || 0;

      const spend = (acqSpend.data || []).reduce((s, r) => s + (r.spend || 0), 0);
      const conversions = (acqSpend.data || []).reduce((s, r) => s + (r.conversions || 0), 0);
      const cac = conversions > 0 ? Math.round(spend / conversions) : 0;
      const ltv = 6_400_000;
      const ltvCac = cac > 0 ? Math.round((ltv / cac) * 10) / 10 : 0;

      // ════ DOMAIN 1: TRACTION ════
      const tractionChecks: ReadinessCheck[] = [
        { label: 'Monthly Deal Volume', current: `${deals30} deals`, target: '≥ 40 deals/mo', pct: Math.min(100, Math.round((deals30 / 40) * 100)), status: checkStatus(Math.min(100, (deals30 / 40) * 100)) },
        { label: 'MoM Deal Growth', current: `${dealGrowthM}%`, target: '≥ 20% MoM', pct: Math.min(100, Math.round((dealGrowthM / 20) * 100)), status: checkStatus(Math.min(100, (dealGrowthM / 20) * 100)) },
        { label: 'Commission MRR', current: fmt(mrr), target: `≥ ${fmt(800_000_000)}`, pct: Math.min(100, Math.round((mrr / 800_000_000) * 100)), status: checkStatus(Math.min(100, (mrr / 800_000_000) * 100)) },
        { label: 'Subscription Revenue', current: fmt(subMRR), target: `≥ ${fmt(50_000_000)}/mo`, pct: Math.min(100, Math.round((subMRR / 50_000_000) * 100)), status: checkStatus(Math.min(100, (subMRR / 50_000_000) * 100)) },
        { label: '3-Month Growth Trend', current: `${deal3mTrend}%`, target: '≥ 50% / 3mo', pct: Math.min(100, Math.round((deal3mTrend / 50) * 100)), status: checkStatus(Math.min(100, (deal3mTrend / 50) * 100)) },
      ];
      const tractionScore = Math.round(tractionChecks.reduce((s, c) => s + c.pct, 0) / tractionChecks.length);

      // ════ DOMAIN 2: MARKET LEADERSHIP ════
      const absorptionRate = listings > 0 ? Math.round((deals30 / listings) * 1000) / 10 : 0;
      const inqGrowth = inq60 > 0 ? Math.round(((inq30 - inq60) / inq60) * 100) : 0;

      const marketChecks: ReadinessCheck[] = [
        { label: 'Active Listings', current: `${listings}`, target: '≥ 500', pct: Math.min(100, Math.round((listings / 500) * 100)), status: checkStatus(Math.min(100, (listings / 500) * 100)) },
        { label: 'Listing Absorption Rate', current: `${absorptionRate}%`, target: '≥ 8%', pct: Math.min(100, Math.round((absorptionRate / 8) * 100)), status: checkStatus(Math.min(100, (absorptionRate / 8) * 100)) },
        { label: 'Agent Network', current: `${agentCount} agents`, target: '≥ 50', pct: Math.min(100, Math.round((agentCount / 50) * 100)), status: checkStatus(Math.min(100, (agentCount / 50) * 100)) },
        { label: 'Vendor Ecosystem', current: `${vendorCount} vendors`, target: '≥ 20', pct: Math.min(100, Math.round((vendorCount / 20) * 100)), status: checkStatus(Math.min(100, (vendorCount / 20) * 100)) },
        { label: 'Demand Growth (Inquiries)', current: `${inqGrowth}% MoM`, target: '≥ 15% MoM', pct: Math.min(100, Math.round((Math.max(0, inqGrowth) / 15) * 100)), status: checkStatus(Math.min(100, (Math.max(0, inqGrowth) / 15) * 100)) },
      ];
      const marketScore = Math.round(marketChecks.reduce((s, c) => s + c.pct, 0) / marketChecks.length);

      // ════ DOMAIN 3: FINANCIAL CREDIBILITY ════
      const burnMultiple = totalMRR > 0 ? Math.round((spend / totalMRR) * 10) / 10 : 0;
      const premiumCount = premiumAds.count || 0;
      const revDiversification = totalMRR > 0 ? Math.round((subMRR / totalMRR) * 100) : 0;

      const finChecks: ReadinessCheck[] = [
        { label: 'LTV / CAC Ratio', current: `${ltvCac}x`, target: '≥ 10x', pct: Math.min(100, Math.round((ltvCac / 10) * 100)), status: checkStatus(Math.min(100, (ltvCac / 10) * 100)) },
        { label: 'ARR Run Rate', current: fmt(arr), target: `≥ ${fmt(10_000_000_000)}`, pct: Math.min(100, Math.round((arr / 10_000_000_000) * 100)), status: checkStatus(Math.min(100, (arr / 10_000_000_000) * 100)) },
        { label: 'Revenue Growth Rate', current: `${revGrowth}% MoM`, target: '≥ 25% MoM', pct: Math.min(100, Math.round((Math.max(0, revGrowth) / 25) * 100)), status: checkStatus(Math.min(100, (Math.max(0, revGrowth) / 25) * 100)) },
        { label: 'Burn Multiple', current: `${burnMultiple}x`, target: '≤ 2.0x', pct: burnMultiple <= 2 ? 100 : burnMultiple <= 3 ? 60 : 20, status: checkStatus(burnMultiple <= 2 ? 100 : burnMultiple <= 3 ? 60 : 20) },
        { label: 'Revenue Diversification', current: `${revDiversification}% subscription`, target: '≥ 15% non-commission', pct: Math.min(100, Math.round((revDiversification / 15) * 100)), status: checkStatus(Math.min(100, (revDiversification / 15) * 100)) },
      ];
      const finScore = Math.round(finChecks.reduce((s, c) => s + c.pct, 0) / finChecks.length);

      // ════ DOMAIN 4: NARRATIVE ════
      const narrativeChecks: ReadinessCheck[] = [
        { label: 'Category Definition Clarity', current: deals30 > 20 ? 'Strong' : deals30 > 5 ? 'Building' : 'Weak', target: 'Clear & defensible', pct: deals30 > 20 ? 90 : deals30 > 5 ? 55 : 15, status: checkStatus(deals30 > 20 ? 90 : deals30 > 5 ? 55 : 15) },
        { label: 'Expansion Roadmap', current: listings > 200 ? 'Multi-city ready' : listings > 50 ? 'Single-city proven' : 'Early stage', target: 'Multi-city proven', pct: listings > 200 ? 90 : listings > 50 ? 60 : 20, status: checkStatus(listings > 200 ? 90 : listings > 50 ? 60 : 20) },
        { label: 'Network Effect Evidence', current: ref30 > 10 ? 'Demonstrable' : ref30 > 0 ? 'Emerging' : 'None', target: 'Quantified flywheel', pct: ref30 > 10 ? 85 : ref30 > 0 ? 45 : 10, status: checkStatus(ref30 > 10 ? 85 : ref30 > 0 ? 45 : 10) },
        { label: 'Data Moat Articulation', current: listings > 100 ? 'Strong' : listings > 30 ? 'Building' : 'Early', target: 'Proprietary dataset', pct: listings > 100 ? 85 : listings > 30 ? 50 : 15, status: checkStatus(listings > 100 ? 85 : listings > 30 ? 50 : 15) },
        { label: 'Profitability Pathway', current: totalMRR > spend ? 'Visible' : 'Projected', target: 'Clear unit economics', pct: totalMRR > spend ? 90 : totalMRR > spend * 0.5 ? 60 : 25, status: checkStatus(totalMRR > spend ? 90 : totalMRR > spend * 0.5 ? 60 : 25) },
      ];
      const narrativeScore = Math.round(narrativeChecks.reduce((s, c) => s + c.pct, 0) / narrativeChecks.length);

      // ── Domains ──
      const domains: ReadinessDomain[] = [
        { domain: 'Traction Validation', icon: 'trending', score: tractionScore, checks: tractionChecks, narrative: 'Demonstrating consistent transaction growth and monetization momentum to prove product-market fit.' },
        { domain: 'Market Leadership', icon: 'crown', score: marketScore, checks: marketChecks, narrative: 'Building dominant supply density and demand velocity in core markets to establish category leadership.' },
        { domain: 'Financial Credibility', icon: 'shield', score: finScore, checks: finChecks, narrative: 'Proving sustainable unit economics and disciplined capital efficiency for investor confidence.' },
        { domain: 'Investor Narrative', icon: 'message', score: narrativeScore, checks: narrativeChecks, narrative: 'Crafting a compelling category-creation story backed by quantified traction proof points.' },
      ];

      const overallScore = Math.round(domains.reduce((s, d) => s + d.score, 0) / domains.length);
      const readinessLevel: ReadinessLevel = overallScore >= 75 ? 'ready' : overallScore >= 50 ? 'approaching' : overallScore >= 25 ? 'building' : 'not_ready';

      // ── Top Gaps ──
      const allChecks = domains.flatMap(d => d.checks.map(c => ({ ...c, domain: d.domain })));
      const topGaps = allChecks
        .filter(c => c.status !== 'pass')
        .sort((a, b) => a.pct - b.pct)
        .slice(0, 5)
        .map(c => `${c.label} (${c.current} → ${c.target})`);

      // ── Timeline ──
      const timeline: TimelinePhase[] = [
        { phase: 'Foundation Sprint', months: 'Month 1-2', status: overallScore > 15 ? 'completed' : 'active', milestones: ['Close 20+ verified deals', 'Activate 3 revenue streams', 'Recruit 15+ agents', 'Establish core district density'] },
        { phase: 'Traction Acceleration', months: 'Month 3-4', status: overallScore > 35 ? 'completed' : overallScore > 15 ? 'active' : 'upcoming', milestones: ['Achieve 40+ deals/month velocity', 'Grow MRR to Rp 500M+', 'Launch premium subscriptions', 'Demonstrate MoM growth > 20%'] },
        { phase: 'Narrative Crystallization', months: 'Month 5-6', status: overallScore > 55 ? 'completed' : overallScore > 35 ? 'active' : 'upcoming', milestones: ['Validate LTV/CAC > 10x', 'Build investor deck with live metrics', 'Publish market intelligence reports', 'Secure 2+ strategic partnerships'] },
        { phase: 'Fundraising Execution', months: 'Month 7-8', status: overallScore > 75 ? 'completed' : overallScore > 55 ? 'active' : 'upcoming', milestones: ['Launch investor outreach (50+ targets)', 'Complete data room preparation', 'Run 15+ investor meetings', 'Target term sheet within 4-6 weeks'] },
      ];

      // ── Story Structure ──
      const storyStructure = [
        { section: 'Problem', hook: 'Real estate transactions in Indonesia are opaque, fragmented, and illiquid', proof: `${listings} active listings demonstrate market need for aggregation` },
        { section: 'Solution', hook: 'AI-powered liquidity infrastructure that makes real estate transact like financial assets', proof: `${deals30} deals closed in 30 days with ${absorptionRate}% absorption rate` },
        { section: 'Traction', hook: 'Fastest-growing transaction platform in target markets', proof: `${fmt(totalMRR)} MRR, ${dealGrowthM}% MoM deal growth, ${agentCount} agents onboarded` },
        { section: 'Market', hook: '$120B+ Indonesian real estate market with <2% digital penetration', proof: `${fmt(arr)} ARR capturing initial market share in core districts` },
        { section: 'Moat', hook: 'Compounding data intelligence + multi-sided network effects', proof: `${ltvCac}x LTV/CAC ratio with ${ref30} organic referrals demonstrating network pull` },
        { section: 'Vision', hook: 'Bloomberg Terminal for global real estate capital allocation', proof: 'Platform architecture supports multi-city expansion with 450+ table data model' },
      ];

      return {
        domains, overallScore, readinessLevel, timeline, storyStructure, topGaps,
        targetRaise: '$3-5M', targetValuation: '$25-40M pre-money',
      };
    },
    staleTime: 5 * 60_000,
  });
}
