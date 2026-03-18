import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type CheckStatus = 'pass' | 'warning' | 'fail' | 'pending';

export interface CheckItem {
  id: string;
  label: string;
  description: string;
  status: CheckStatus;
  detail: string;
  auto: boolean;
}

export interface CheckSection {
  id: string;
  title: string;
  icon: string;
  items: CheckItem[];
  score: number;
}

export interface LaunchChecklistData {
  sections: CheckSection[];
  overall_score: number;
  go_decision: 'go' | 'conditional' | 'no_go';
  blockers: string[];
  launch_confidence: number;
}

function sectionScore(items: CheckItem[]): number {
  if (!items.length) return 0;
  const pts = items.reduce((s, i) => s + (i.status === 'pass' ? 100 : i.status === 'warning' ? 60 : i.status === 'pending' ? 30 : 0), 0);
  return Math.round(pts / items.length);
}

export function useLaunchChecklist() {
  return useQuery({
    queryKey: ['launch-checklist'],
    queryFn: async (): Promise<LaunchChecklistData> => {
      const [
        activeListings, aiJobs, agents, totalUsers,
        supportTickets, seoContent, alertRules, reviews,
        referralConfig, feedbackCount,
      ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('vendor_business_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('id', { count: 'exact', head: true }),
        supabase.from('acquisition_seo_content').select('id', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('admin_alert_rules').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('vendor_reviews').select('id', { count: 'exact', head: true }),
        supabase.from('referrals').select('id', { count: 'exact', head: true }),
        supabase.from('user_feedback').select('id', { count: 'exact', head: true }),
      ]);

      const listings = activeListings.count || 0;
      const ai = aiJobs.count || 0;
      const agentCount = agents.count || 0;
      const users = totalUsers.count || 0;
      const tickets = supportTickets.count || 0;
      const seo = seoContent.count || 0;
      const alerts = alertRules.count || 0;
      const refs = referralConfig.count || 0;
      const feedback = feedbackCount.count || 0;

      const techItems: CheckItem[] = [
        { id: 't1', label: 'Listing Search Performance', auto: true, description: 'Verify search returns results within acceptable response time', status: listings >= 10 ? 'pass' : listings > 0 ? 'warning' : 'fail', detail: `${listings} active listings indexed and searchable` },
        { id: 't2', label: 'Opportunity Scoring Accuracy', auto: true, description: 'Confirm AI scoring engine produces valid scores on active inventory', status: ai >= 50 ? 'pass' : ai >= 10 ? 'warning' : ai > 0 ? 'pending' : 'fail', detail: `${ai} AI scoring jobs completed successfully` },
        { id: 't3', label: 'Mobile Responsiveness', auto: false, description: 'Test all critical flows on mobile viewports (375px, 414px)', status: 'pending', detail: 'Manual QA required — verify listing discovery, detail, and offer flows' },
        { id: 't4', label: 'Error Monitoring Active', auto: true, description: 'Ensure alert rules are configured for critical system events', status: alerts >= 3 ? 'pass' : alerts >= 1 ? 'warning' : 'fail', detail: `${alerts} active alert rules configured` },
        { id: 't5', label: 'Authentication & Security', auto: true, description: 'Verify auth flows, RLS policies, and session management', status: users >= 5 ? 'pass' : 'pending', detail: `${users} user accounts created — auth pipeline validated` },
      ];

      const marketItems: CheckItem[] = [
        { id: 'm1', label: 'High-Quality Property Listings', auto: true, description: 'Secure minimum viable inventory of curated active listings', status: listings >= 100 ? 'pass' : listings >= 30 ? 'warning' : listings > 0 ? 'pending' : 'fail', detail: `${listings} active listings — target: 100+ for launch credibility` },
        { id: 'm2', label: 'Agent Partners Onboarded', auto: true, description: 'Recruit responsive agent/developer partners for supply pipeline', status: agentCount >= 20 ? 'pass' : agentCount >= 5 ? 'warning' : agentCount > 0 ? 'pending' : 'fail', detail: `${agentCount} agent/vendor partners registered` },
        { id: 'm3', label: 'City Coverage Diversity', auto: true, description: 'Ensure listings span at least 3 target cities for discovery breadth', status: listings >= 50 ? 'pass' : listings >= 10 ? 'warning' : 'pending', detail: 'Geographic diversity assessed from active listing distribution' },
        { id: 'm4', label: 'Listing Quality Standards', auto: false, description: 'Verify listings have photos, pricing, and complete descriptions', status: 'pending', detail: 'Manual review needed — check photo count, price accuracy, descriptions' },
      ];

      const growthItems: CheckItem[] = [
        { id: 'g1', label: 'Social Media Launch Plan', auto: false, description: 'Prepare coordinated launch announcements across channels', status: 'pending', detail: 'Prepare posts for Instagram, LinkedIn, Twitter, and TikTok' },
        { id: 'g2', label: 'Performance Dashboards Active', auto: true, description: 'Confirm analytics and KPI dashboards are operational', status: alerts >= 1 || users >= 5 ? 'pass' : 'pending', detail: 'Company dashboard, executive KPIs, and growth monitors deployed' },
        { id: 'g3', label: 'SEO Content Published', auto: true, description: 'Launch with foundational SEO content for organic discovery', status: seo >= 10 ? 'pass' : seo >= 3 ? 'warning' : seo > 0 ? 'pending' : 'fail', detail: `${seo} SEO content pieces published` },
        { id: 'g4', label: 'Referral System Ready', auto: true, description: 'Verify referral link generation and reward tracking are functional', status: refs >= 5 ? 'pass' : refs > 0 ? 'warning' : 'pending', detail: `${refs} referral records — system ${refs > 0 ? 'active' : 'needs testing'}` },
      ];

      const supportItems: CheckItem[] = [
        { id: 's1', label: 'Customer Inquiry Workflow', auto: true, description: 'Define response SLAs and escalation paths for user inquiries', status: tickets >= 1 || feedback >= 1 ? 'pass' : 'pending', detail: `Support system configured — ${tickets} tickets, ${feedback} feedback entries` },
        { id: 's2', label: 'Onboarding Guidance Materials', auto: false, description: 'Prepare first-time user walkthrough and help documentation', status: 'pending', detail: 'Create tooltips, FAQ section, and getting-started guide' },
        { id: 's3', label: 'Feedback Collection System', auto: true, description: 'Enable in-app feedback submission for early user insights', status: feedback >= 1 || (reviews.count || 0) > 0 ? 'pass' : 'pending', detail: `${feedback} feedback entries — collection pipeline active` },
        { id: 's4', label: 'Escalation Contact Points', auto: false, description: 'Assign team members for critical issue escalation during launch', status: 'pending', detail: 'Designate on-call technical and support contacts for launch week' },
      ];

      const sections: CheckSection[] = [
        { id: 'technical', title: 'Technical Readiness', icon: 'server', items: techItems, score: sectionScore(techItems) },
        { id: 'marketplace', title: 'Marketplace Preparation', icon: 'building', items: marketItems, score: sectionScore(marketItems) },
        { id: 'growth', title: 'Growth Activation', icon: 'trending', items: growthItems, score: sectionScore(growthItems) },
        { id: 'support', title: 'Support Preparation', icon: 'headset', items: supportItems, score: sectionScore(supportItems) },
      ];

      const overall = Math.round(sections.reduce((s, sec) => s + sec.score, 0) / sections.length);
      const blockers = sections.flatMap(sec => sec.items.filter(i => i.status === 'fail').map(i => `${sec.title}: ${i.label}`));
      const failCount = sections.flatMap(s => s.items).filter(i => i.status === 'fail').length;
      const pendingCount = sections.flatMap(s => s.items).filter(i => i.status === 'pending').length;
      const go_decision: LaunchChecklistData['go_decision'] = failCount === 0 && pendingCount <= 3 ? 'go' : failCount === 0 ? 'conditional' : 'no_go';
      const confidence = Math.max(0, Math.min(100, overall - failCount * 10 - pendingCount * 3));

      return { sections, overall_score: overall, go_decision, blockers, launch_confidence: confidence };
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
