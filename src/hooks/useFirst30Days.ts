import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type DayStatus = 'completed' | 'in_progress' | 'upcoming' | 'missed';

export interface DayAction {
  day: number;
  title: string;
  description: string;
  category: 'supply' | 'investor' | 'pipeline' | 'conversion';
  kpiMetric: string;
  status: DayStatus;
  autoCheck?: boolean;
  liveValue?: number;
  targetValue?: number;
}

export interface WeekBlock {
  week: number;
  label: string;
  theme: string;
  category: 'supply' | 'investor' | 'pipeline' | 'conversion';
  days: DayAction[];
  completedCount: number;
  totalCount: number;
  progressPct: number;
}

export interface First30DaysPlan {
  weeks: WeekBlock[];
  overallProgress: number;
  currentDay: number;
  totalCompleted: number;
  totalActions: number;
  momentum: 'strong' | 'steady' | 'at_risk';
}

const LAUNCH_DATE_KEY = 'astra_soft_launch_date';

function getLaunchDate(): Date {
  const stored = localStorage.getItem(LAUNCH_DATE_KEY);
  if (stored) return new Date(stored);
  const now = new Date();
  localStorage.setItem(LAUNCH_DATE_KEY, now.toISOString());
  return now;
}

function getCurrentDay(): number {
  const launch = getLaunchDate();
  const diff = Date.now() - launch.getTime();
  return Math.max(1, Math.min(30, Math.ceil(diff / 86_400_000)));
}

function buildDayActions(): DayAction[] {
  const actions: Omit<DayAction, 'status'>[] = [
    // Week 1 — Supply Activation
    { day: 1, title: 'Identify top 10 agent contacts', description: 'Map local agent networks in Jakarta, Bali, Surabaya for initial outreach.', category: 'supply', kpiMetric: 'Agents identified' },
    { day: 2, title: 'Personal outreach to 5 agents', description: 'WhatsApp / call top-priority agents with platform value proposition.', category: 'supply', kpiMetric: 'Agents contacted' },
    { day: 3, title: 'Onboard first 2 agent partners', description: 'Walk agents through listing submission, profile setup, and lead flow.', category: 'supply', kpiMetric: 'Agents onboarded' },
    { day: 4, title: 'Secure 5 high-quality listings', description: 'Curate listings with strong ROI data, high-res photos, and accurate pricing.', category: 'supply', kpiMetric: 'Listings live' },
    { day: 5, title: 'Validate listing data accuracy', description: 'Cross-check pricing, location data, and investment metrics for all live listings.', category: 'supply', kpiMetric: 'Listings verified' },
    { day: 6, title: 'Contact 3 developer partners', description: 'Reach out to property developers for exclusive new-project listings.', category: 'supply', kpiMetric: 'Developers contacted' },
    { day: 7, title: 'Week 1 review & supply audit', description: 'Assess listing quality, agent responsiveness, and supply pipeline health.', category: 'supply', kpiMetric: 'Supply score' },

    // Week 2 — Investor Acquisition
    { day: 8, title: 'Publish first property insight article', description: 'Create data-driven market analysis content targeting property investors.', category: 'investor', kpiMetric: 'Content published' },
    { day: 9, title: 'Share content across social channels', description: 'Distribute insight content on LinkedIn, Instagram, and investor groups.', category: 'investor', kpiMetric: 'Social impressions' },
    { day: 10, title: 'Outreach to 3 investor communities', description: 'Post in Facebook/Telegram investor groups with platform introduction.', category: 'investor', kpiMetric: 'Communities reached' },
    { day: 11, title: 'Guide 5 early users through onboarding', description: 'Personally walk first investors through search, watchlist, and alerts.', category: 'investor', kpiMetric: 'Users onboarded' },
    { day: 12, title: 'Publish second insight article', description: 'Create comparison or opportunity-focused content to build trust authority.', category: 'investor', kpiMetric: 'Content published' },
    { day: 13, title: 'Run targeted outreach to 10 investors', description: 'Direct message high-net-worth contacts with personalized listing recommendations.', category: 'investor', kpiMetric: 'Investors contacted' },
    { day: 14, title: 'Week 2 review & user feedback', description: 'Analyze user sign-ups, content engagement, and early inquiry patterns.', category: 'investor', kpiMetric: 'Feedback collected' },

    // Week 3 — Deal Pipeline Creation
    { day: 15, title: 'Follow up on all active inquiries', description: 'Personally contact every user who submitted an inquiry or viewing request.', category: 'pipeline', kpiMetric: 'Inquiries followed up' },
    { day: 16, title: 'Coordinate first buyer-agent meetings', description: 'Facilitate introductions between interested investors and listing agents.', category: 'pipeline', kpiMetric: 'Meetings scheduled' },
    { day: 17, title: 'Set up CRM deal tracking', description: 'Log all active opportunities with status, value, and next action in CRM.', category: 'pipeline', kpiMetric: 'Deals in pipeline' },
    { day: 18, title: 'Assist negotiation coordination', description: 'Support offer/counter-offer process between buyer and agent parties.', category: 'pipeline', kpiMetric: 'Negotiations active' },
    { day: 19, title: 'Push 3 deals toward next stage', description: 'Apply urgency and support to advance stalled pipeline opportunities.', category: 'pipeline', kpiMetric: 'Deals advanced' },
    { day: 20, title: 'Publish third insight article', description: 'Create urgency-driven content about market timing and deal opportunities.', category: 'pipeline', kpiMetric: 'Content published' },
    { day: 21, title: 'Week 3 review & pipeline health', description: 'Review CRM pipeline, conversion rates, and deal velocity metrics.', category: 'pipeline', kpiMetric: 'Pipeline value' },

    // Week 4 — Conversion Focus
    { day: 22, title: 'Send urgency messages to serious investors', description: 'Personalized messages highlighting time-sensitive opportunities and scarcity.', category: 'conversion', kpiMetric: 'Messages sent' },
    { day: 23, title: 'Support documentation for closest deal', description: 'Help prepare transaction documents and coordinate legal requirements.', category: 'conversion', kpiMetric: 'Docs prepared' },
    { day: 24, title: 'Follow up on all Week 3 negotiations', description: 'Check status of every active negotiation and remove blockers.', category: 'conversion', kpiMetric: 'Blockers removed' },
    { day: 25, title: 'Push for first transaction close', description: 'Apply maximum founder attention to the highest-probability deal.', category: 'conversion', kpiMetric: 'Deals closing' },
    { day: 26, title: 'Collect first success story testimonial', description: 'Interview first successful buyer/agent for case study and social proof.', category: 'conversion', kpiMetric: 'Testimonials' },
    { day: 27, title: 'Publish success story content', description: 'Share testimonial across channels to build credibility and trust.', category: 'conversion', kpiMetric: 'Content published' },
    { day: 28, title: 'Onboard 5 new agents from referrals', description: 'Leverage initial agent success stories to recruit their network contacts.', category: 'conversion', kpiMetric: 'Referral agents' },
    { day: 29, title: 'Prepare Month 2 growth plan', description: 'Document learnings, set targets, and plan scaling actions for next phase.', category: 'conversion', kpiMetric: 'Plan drafted' },
    { day: 30, title: 'Month 1 retrospective & metrics review', description: 'Full review of supply, demand, pipeline, and transaction performance.', category: 'conversion', kpiMetric: 'Metrics reviewed' },
  ];

  const currentDay = getCurrentDay();
  return actions.map((a) => ({
    ...a,
    status: a.day < currentDay ? 'completed' as DayStatus : a.day === currentDay ? 'in_progress' as DayStatus : 'upcoming' as DayStatus,
  }));
}

export function useFirst30Days(enabled = true) {
  return useQuery({
    queryKey: ['first-30-days-plan'],
    queryFn: async (): Promise<First30DaysPlan> => {
      // Fetch live signals for auto-check enrichment
      const [propertiesRes, profilesRes, offersRes, contentRes] = await Promise.all([
        (supabase as any).from('properties').select('id', { count: 'exact', head: true }),
        (supabase as any).from('profiles').select('id', { count: 'exact', head: true }).eq('account_type', 'agent'),
        (supabase as any).from('offers').select('id', { count: 'exact', head: true }),
        (supabase as any).from('acquisition_seo_content').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      ]);

      const liveListings = propertiesRes.count ?? 0;
      const liveAgents = profilesRes.count ?? 0;
      const liveOffers = offersRes.count ?? 0;
      const liveContent = contentRes.count ?? 0;

      const days = buildDayActions();
      const currentDay = getCurrentDay();

      // Enrich specific days with live data
      const enrichMap: Record<number, { liveValue: number; targetValue: number }> = {
        4: { liveValue: liveListings, targetValue: 5 },
        3: { liveValue: liveAgents, targetValue: 2 },
        8: { liveValue: liveContent, targetValue: 1 },
        17: { liveValue: liveOffers, targetValue: 3 },
      };

      for (const d of days) {
        const enrichment = enrichMap[d.day];
        if (enrichment) {
          d.liveValue = enrichment.liveValue;
          d.targetValue = enrichment.targetValue;
          d.autoCheck = true;
          if (enrichment.liveValue >= enrichment.targetValue && d.status !== 'upcoming') {
            d.status = 'completed';
          }
        }
      }

      const weekDefs: { week: number; label: string; theme: string; category: 'supply' | 'investor' | 'pipeline' | 'conversion'; range: [number, number] }[] = [
        { week: 1, label: 'Week 1', theme: 'Supply Activation', category: 'supply', range: [1, 7] },
        { week: 2, label: 'Week 2', theme: 'Investor Acquisition', category: 'investor', range: [8, 14] },
        { week: 3, label: 'Week 3', theme: 'Deal Pipeline Creation', category: 'pipeline', range: [15, 21] },
        { week: 4, label: 'Week 4', theme: 'Conversion Focus', category: 'conversion', range: [22, 30] },
      ];

      const weeks: WeekBlock[] = weekDefs.map((wd) => {
        const wDays = days.filter((d) => d.day >= wd.range[0] && d.day <= wd.range[1]);
        const completed = wDays.filter((d) => d.status === 'completed').length;
        return {
          ...wd,
          days: wDays,
          completedCount: completed,
          totalCount: wDays.length,
          progressPct: wDays.length > 0 ? Math.round((completed / wDays.length) * 100) : 0,
        };
      });

      const totalCompleted = days.filter((d) => d.status === 'completed').length;
      const overallProgress = Math.round((totalCompleted / days.length) * 100);

      let momentum: 'strong' | 'steady' | 'at_risk' = 'steady';
      const expectedCompletion = Math.round((currentDay / 30) * 100);
      if (overallProgress >= expectedCompletion) momentum = 'strong';
      else if (overallProgress < expectedCompletion - 20) momentum = 'at_risk';

      return {
        weeks,
        overallProgress,
        currentDay,
        totalCompleted,
        totalActions: days.length,
        momentum,
      };
    },
    enabled,
    staleTime: 60_000,
  });
}
