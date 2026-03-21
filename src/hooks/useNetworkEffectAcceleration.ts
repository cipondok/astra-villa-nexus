import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

export interface FeedbackLoop {
  id: string;
  name: string;
  description: string;
  sides: string[];
  currentVelocity: number;
  targetVelocity: number;
  multiplier: number;
  status: 'dormant' | 'igniting' | 'accelerating' | 'compounding';
  signals: { label: string; value: number; unit: string; trend: 'up' | 'down' | 'flat' }[];
}

export interface AccelerationTactic {
  tactic: string;
  loop: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  description: string;
  metric: string;
}

export interface MultiplierKPI {
  label: string;
  value: number;
  target: number;
  unit: string;
  description: string;
}

export interface RoadmapPhase {
  phase: string;
  timeline: string;
  objective: string;
  tactics: string[];
  gate: string;
  status: 'active' | 'upcoming' | 'completed';
}

export interface NetworkEffectData {
  loops: FeedbackLoop[];
  multiplierKPIs: MultiplierKPI[];
  tactics: AccelerationTactic[];
  roadmap: RoadmapPhase[];
  networkHealthScore: number;
  activeSides: { side: string; count: number; growth: number }[];
}

function loopStatus(vel: number, target: number): FeedbackLoop['status'] {
  const pct = vel / target;
  return pct >= 0.8 ? 'compounding' : pct >= 0.5 ? 'accelerating' : pct >= 0.2 ? 'igniting' : 'dormant';
}

export function useNetworkEffectAcceleration() {
  return useQuery({
    queryKey: ['network-effect-acceleration'],
    queryFn: async (): Promise<NetworkEffectData> => {
      const now = new Date();
      const d30 = subDays(now, 30).toISOString();
      const d60 = subDays(now, 60).toISOString();

      const [
        listings, listings60, deals30, deals60,
        agents, vendors, subs, subs60,
        inquiries30, inquiries60, referrals30, referrals60,
        investors30, investors60,
      ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'available'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).lt('created_at', d30).eq('status', 'available'),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).gte('created_at', d30).in('status', ['completed', 'accepted']),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30).in('status', ['completed', 'accepted']),
        (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'agent'),
        (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'vendor'),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'cancelled'),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('inquiries').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        supabase.from('acquisition_referrals').select('id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('acquisition_referrals').select('id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
        supabase.from('activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', d30),
        supabase.from('activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', d60).lt('created_at', d30),
      ]);

      const l = listings.count || 0;
      const l60 = listings60.count || 0;
      const d30c = deals30.count || 0;
      const d60c = deals60.count || 0;
      const ag = agents.count || 0;
      const vn = vendors.count || 0;
      const sb = subs.count || 0;
      const inq = inquiries30.count || 0;
      const inq60 = inquiries60.count || 0;
      const ref30 = referrals30.count || 0;
      const ref60c = referrals60.count || 0;
      const inv30 = investors30.count || 0;
      const inv60 = investors60.count || 0;

      const trend = (c: number, p: number): 'up' | 'down' | 'flat' => {
        if (p === 0) return c > 0 ? 'up' : 'flat';
        const d = ((c - p) / p) * 100;
        return d > 5 ? 'up' : d < -5 ? 'down' : 'flat';
      };
      const growth = (c: number, p: number) => p === 0 ? (c > 0 ? 100 : 0) : Math.round(((c - p) / p) * 100);

      // ── Feedback Loops ──
      const listingVel = l > 0 ? Math.round((d30c / l) * 100) : 0;
      const loops: FeedbackLoop[] = [
        {
          id: 'liquidity', name: 'Liquidity Feedback Loop',
          description: 'More listings attract more buyers → faster sales attract more sellers → cycle compounds',
          sides: ['Sellers', 'Buyers', 'Agents'],
          currentVelocity: listingVel, targetVelocity: 12,
          multiplier: Math.max(1, 1 + (listingVel / 100)),
          status: loopStatus(listingVel, 12),
          signals: [
            { label: 'Active Listings', value: l, unit: 'listings', trend: trend(l, l60) },
            { label: 'Monthly Deals', value: d30c, unit: 'deals', trend: trend(d30c, d60c) },
            { label: 'Inquiries', value: inq, unit: '/month', trend: trend(inq, inq60) },
          ],
        },
        {
          id: 'referral', name: 'Referral Growth Loop',
          description: 'Successful deals generate referrals → new users bring their network → organic acquisition compounds',
          sides: ['Referrers', 'New Users'],
          currentVelocity: ref30, targetVelocity: 50,
          multiplier: Math.max(1, 1 + (ref30 / 100)),
          status: loopStatus(ref30, 50),
          signals: [
            { label: 'Referrals (30d)', value: ref30, unit: 'referrals', trend: trend(ref30, ref60c) },
            { label: 'Referral Growth', value: growth(ref30, ref60c), unit: '%', trend: trend(ref30, ref60c) },
          ],
        },
        {
          id: 'intelligence', name: 'Intelligence Value Loop',
          description: 'More transactions → better pricing models → more accurate predictions → more trust → more transactions',
          sides: ['Data', 'Investors', 'Sellers'],
          currentVelocity: d30c, targetVelocity: 40,
          multiplier: Math.max(1, 1 + (d30c / 200)),
          status: loopStatus(d30c, 40),
          signals: [
            { label: 'Deal Data Points', value: d30c * 12, unit: 'signals', trend: trend(d30c, d60c) },
            { label: 'Active Subscribers', value: sb, unit: 'users', trend: 'up' },
          ],
        },
        {
          id: 'ecosystem', name: 'Ecosystem Lock-In Loop',
          description: 'Vendors + agents + analytics create switching costs → retention strengthens → more participants join',
          sides: ['Vendors', 'Agents', 'Investors'],
          currentVelocity: ag + vn, targetVelocity: 80,
          multiplier: Math.max(1, 1 + ((ag + vn) / 200)),
          status: loopStatus(ag + vn, 80),
          signals: [
            { label: 'Agent Network', value: ag, unit: 'agents', trend: 'up' },
            { label: 'Vendor Network', value: vn, unit: 'vendors', trend: 'up' },
            { label: 'Active Investors', value: inv30, unit: 'users', trend: trend(inv30, inv60) },
          ],
        },
      ];

      // ── Multiplier KPIs ──
      const viralCoeff = d30c > 0 ? Math.round((ref30 / Math.max(1, d30c)) * 100) / 100 : 0;
      const crossSideRatio = l > 0 ? Math.round((inq / l) * 10) / 10 : 0;
      const networkDensity = Math.min(100, Math.round(((ag * 3) + (vn * 5) + (sb * 2)) / 5));

      const multiplierKPIs: MultiplierKPI[] = [
        { label: 'Viral Coefficient', value: viralCoeff, target: 1.5, unit: 'x', description: 'Referrals per successful deal — >1.0 = self-sustaining growth' },
        { label: 'Cross-Side Ratio', value: crossSideRatio, target: 5.0, unit: 'x', description: 'Demand inquiries per listing — higher = stronger buyer-side pull' },
        { label: 'Network Density', value: networkDensity, target: 80, unit: '%', description: 'Weighted coverage of agents + vendors + subscribers' },
        { label: 'Deal Velocity', value: d30c, target: 40, unit: 'deals/mo', description: 'Monthly closed transactions — primary liquidity signal' },
        { label: 'Loop Multiplier', value: Math.round(loops.reduce((s, l) => s * l.multiplier, 1) * 100) / 100, target: 3.0, unit: 'x', description: 'Compound effect of all active feedback loops' },
      ];

      // ── Acceleration Tactics ──
      const tactics: AccelerationTactic[] = [
        { tactic: 'Agent Referral Bonus Program', loop: 'referral', impact: 'high', effort: 'low', description: 'Rp 500K bonus per successful agent-referred deal', metric: 'Referrals/month' },
        { tactic: 'Seller Success Story Campaign', loop: 'liquidity', impact: 'high', effort: 'medium', description: 'Publish 2 case studies/week of fast sales to attract new sellers', metric: 'New listings/week' },
        { tactic: 'Investor Intelligence Freemium', loop: 'intelligence', impact: 'medium', effort: 'medium', description: 'Offer limited market insights free → convert to Pro subscriptions', metric: 'Free-to-paid conversion' },
        { tactic: 'Vendor Cross-Sell Integration', loop: 'ecosystem', impact: 'medium', effort: 'high', description: 'Auto-recommend vendors post-deal to increase ecosystem stickiness', metric: 'Post-deal vendor bookings' },
        { tactic: 'Listing Quality Score Boost', loop: 'liquidity', impact: 'high', effort: 'low', description: 'Higher quality listings get visibility boost → incentivizes complete data', metric: 'Avg listing completeness' },
        { tactic: 'Buyer Urgency Alerts', loop: 'liquidity', impact: 'medium', effort: 'low', description: 'Notify watchlist users when similar properties get offers → FOMO-driven action', metric: 'Alert-to-inquiry conversion' },
        { tactic: 'Agent Leaderboard Visibility', loop: 'ecosystem', impact: 'medium', effort: 'low', description: 'Top agents get featured placement → drives competition and retention', metric: 'Agent deal velocity' },
        { tactic: 'Investor Social Proof Feed', loop: 'intelligence', impact: 'high', effort: 'medium', description: 'Show real-time deal activity and portfolio performance to build trust', metric: 'Investor engagement rate' },
      ];

      // ── Roadmap ──
      const netHealth = Math.round(loops.reduce((s, l) => s + (l.currentVelocity / l.targetVelocity) * 25, 0));
      const roadmap: RoadmapPhase[] = [
        { phase: 'Loop Ignition', timeline: 'Month 1-3', objective: 'Activate primary liquidity and referral feedback loops',
          tactics: ['Launch agent referral program', 'Publish first 10 seller success stories', 'Deploy buyer urgency alerts'],
          gate: 'Viral coefficient > 0.5 + 20+ deals/month', status: netHealth > 20 ? 'completed' : 'active' },
        { phase: 'Cross-Side Amplification', timeline: 'Month 4-6', objective: 'Strengthen demand-supply balance and data flywheel',
          tactics: ['Activate intelligence freemium tier', 'Launch agent leaderboard', 'Integrate vendor cross-sell'],
          gate: 'Cross-side ratio > 3.0 + 30+ deals/month', status: netHealth > 45 ? 'completed' : netHealth > 20 ? 'active' : 'upcoming' },
        { phase: 'Ecosystem Deepening', timeline: 'Month 7-10', objective: 'Create switching costs through integrated service ecosystem',
          tactics: ['Launch post-deal vendor automation', 'Deploy portfolio analytics for investors', 'Activate social proof feed'],
          gate: 'Network density > 60% + 3 revenue streams active', status: netHealth > 65 ? 'completed' : netHealth > 45 ? 'active' : 'upcoming' },
        { phase: 'Compounding Dominance', timeline: 'Month 11-14', objective: 'Achieve self-sustaining growth through compounding network effects',
          tactics: ['Scale referral program nationally', 'Launch institutional data products', 'Activate multi-city network bridges'],
          gate: 'Viral coefficient > 1.2 + loop multiplier > 2.5x', status: netHealth > 80 ? 'active' : 'upcoming' },
      ];

      const activeSides = [
        { side: 'Sellers/Owners', count: l, growth: growth(l, l60) },
        { side: 'Buyers/Investors', count: inv30, growth: growth(inv30, inv60) },
        { side: 'Agents', count: ag, growth: 15 },
        { side: 'Vendors', count: vn, growth: 10 },
        { side: 'Subscribers', count: sb, growth: 20 },
      ];

      return { loops, multiplierKPIs, tactics, roadmap, networkHealthScore: Math.min(100, netHealth), activeSides };
    },
    staleTime: 5 * 60_000,
  });
}
