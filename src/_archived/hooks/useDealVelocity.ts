import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, differenceInHours, differenceInDays } from 'date-fns';

/* ── Types ── */

export type DealVelocityHealth = 'fast' | 'normal' | 'slow' | 'stalled';

export interface StageMetrics {
  stage: string;
  label: string;
  count: number;
  avg_duration_hours: number;
  conversion_rate: number; // % progressing to next stage
}

export interface VelocityIntervention {
  id: string;
  type: 'follow_up' | 'negotiation_guidance' | 'urgency_signal' | 'pricing_insight' | 'response_speed';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  icon_key: string;
}

export interface DealVelocityMetrics {
  // Cycle times
  avg_inquiry_to_response_hours: number;
  avg_inquiry_to_offer_days: number;
  avg_offer_to_close_days: number;
  avg_total_cycle_days: number;
  // Volume
  total_inquiries_period: number;
  total_offers_period: number;
  total_closed_period: number;
  // Rates
  inquiry_to_offer_rate: number;     // %
  offer_close_rate: number;          // %
  overall_conversion_rate: number;   // %
  counter_offer_frequency: number;   // % of offers with counter
  // Classification
  health: DealVelocityHealth;
  velocity_score: number; // 0-100
  velocity_trend: 'accelerating' | 'stable' | 'decelerating';
}

export interface DealVelocityInsight {
  metrics: DealVelocityMetrics;
  stages: StageMetrics[];
  interventions: VelocityIntervention[];
  daily_trend: { date: string; inquiries: number; offers: number; closed: number }[];
}

/* ── Classifiers ── */

function classifyHealth(avgCycleDays: number, closeRate: number): DealVelocityHealth {
  if (avgCycleDays <= 14 && closeRate >= 20) return 'fast';
  if (avgCycleDays <= 30 && closeRate >= 10) return 'normal';
  if (avgCycleDays <= 60) return 'slow';
  return 'stalled';
}

function computeVelocityScore(
  responseHrs: number,
  cycleDays: number,
  closeRate: number,
  counterFreq: number,
): number {
  const responseScore = Math.max(0, 100 - responseHrs * 2) * 0.25;        // fast response = good
  const cycleScore = Math.max(0, 100 - cycleDays * 1.5) * 0.30;           // shorter cycle = good
  const closeScore = Math.min(closeRate * 3, 30) * 1.0;                    // higher close rate = good
  const negotiationScore = Math.max(0, 15 - counterFreq * 0.15);           // fewer revisions = smoother
  return Math.min(100, Math.round(responseScore + cycleScore + closeScore + negotiationScore));
}

/* ── Intervention Builder ── */

function buildInterventions(m: DealVelocityMetrics): VelocityIntervention[] {
  const actions: VelocityIntervention[] = [];

  if (m.avg_inquiry_to_response_hours > 24) {
    actions.push({
      id: 'response_speed',
      type: 'response_speed',
      title: 'Accelerate Agent Response Time',
      description: `Avg response: ${m.avg_inquiry_to_response_hours.toFixed(0)}h — automate follow-up reminders at 2h, 8h, 24h marks`,
      impact: 'high',
      icon_key: 'clock',
    });
  }

  if (m.counter_offer_frequency > 40) {
    actions.push({
      id: 'negotiation',
      type: 'negotiation_guidance',
      title: 'Provide Negotiation Guidance',
      description: `${m.counter_offer_frequency.toFixed(0)}% of offers receive counter — surface AI pricing advisor for realistic initial offers`,
      impact: 'high',
      icon_key: 'message-circle',
    });
  }

  if (m.offer_close_rate < 15) {
    actions.push({
      id: 'urgency',
      type: 'urgency_signal',
      title: 'Inject Urgency Signals',
      description: `Only ${m.offer_close_rate.toFixed(1)}% of offers close — show competing investor interest and time-limited incentives`,
      impact: 'high',
      icon_key: 'zap',
    });
  }

  if (m.avg_offer_to_close_days > 21) {
    actions.push({
      id: 'follow_up',
      type: 'follow_up',
      title: 'Automated Follow-Up Reminders',
      description: `Avg ${m.avg_offer_to_close_days.toFixed(0)} days from offer to close — trigger automated nudges at 7d, 14d, 21d intervals`,
      impact: 'medium',
      icon_key: 'bell',
    });
  }

  if (m.inquiry_to_offer_rate < 20) {
    actions.push({
      id: 'pricing_insight',
      type: 'pricing_insight',
      title: 'Surface Pricing Insights',
      description: `${m.inquiry_to_offer_rate.toFixed(1)}% inquiry-to-offer rate — highlight valuation gap and fair market price to encourage offers`,
      impact: 'medium',
      icon_key: 'dollar-sign',
    });
  }

  return actions.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.impact] - p[b.impact];
  });
}

/* ── Main Hook ── */

export function useDealVelocity(period = 30) {
  return useQuery({
    queryKey: ['deal-velocity', period],
    queryFn: async (): Promise<DealVelocityInsight> => {
      const now = new Date();
      const dPeriod = subDays(now, period).toISOString();
      const dPrev = subDays(now, period * 2).toISOString();

      const [inquiriesRes, offersRes, prevOffersRes] = await Promise.all([
        supabase
          .from('inquiries')
          .select('id, created_at, responded_at, status')
          .gte('created_at', dPeriod)
          .order('created_at', { ascending: true })
          .limit(500),
        supabase
          .from('property_offers')
          .select('id, created_at, accepted_at, completed_at, status, counter_price')
          .gte('created_at', dPeriod)
          .order('created_at', { ascending: true })
          .limit(500),
        supabase
          .from('property_offers')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', dPrev)
          .lt('created_at', dPeriod)
          .in('status', ['accepted', 'completed']),
      ]);

      const inquiries = inquiriesRes.data || [];
      const offers = offersRes.data || [];
      const prevClosed = prevOffersRes.count || 0;

      // Response time: avg hours from inquiry created_at to responded_at
      const respondedInquiries = inquiries.filter(i => i.responded_at);
      const avgResponseHours = respondedInquiries.length > 0
        ? respondedInquiries.reduce((sum, i) =>
            sum + differenceInHours(new Date(i.responded_at!), new Date(i.created_at!)), 0
          ) / respondedInquiries.length
        : 48; // default assumption

      // Offer cycle times
      const closedOffers = offers.filter(o => ['accepted', 'completed'].includes(o.status));
      const avgOfferToClose = closedOffers.length > 0
        ? closedOffers.reduce((sum, o) => {
            const end = o.completed_at || o.accepted_at || o.created_at;
            return sum + differenceInDays(new Date(end), new Date(o.created_at));
          }, 0) / closedOffers.length
        : 30;

      // Inquiry to offer (simplified: assume avg 7d unless we can correlate)
      const avgInquiryToOffer = inquiries.length > 0 && offers.length > 0
        ? Math.max(1, Math.round(period * (inquiries.length / Math.max(offers.length, 1)) * 0.3))
        : 7;

      const avgTotalCycle = avgInquiryToOffer + avgOfferToClose;

      // Rates
      const inquiryToOfferRate = inquiries.length > 0 ? (offers.length / inquiries.length) * 100 : 0;
      const offerCloseRate = offers.length > 0 ? (closedOffers.length / offers.length) * 100 : 0;
      const overallRate = inquiries.length > 0 ? (closedOffers.length / inquiries.length) * 100 : 0;

      // Counter offer frequency
      const counterOffers = offers.filter(o => o.counter_price !== null && o.counter_price > 0);
      const counterFreq = offers.length > 0 ? (counterOffers.length / offers.length) * 100 : 0;

      // Velocity trend
      const currentClosed = closedOffers.length;
      const trend: 'accelerating' | 'stable' | 'decelerating' =
        currentClosed > prevClosed * 1.15 ? 'accelerating' :
        currentClosed < prevClosed * 0.85 ? 'decelerating' : 'stable';

      const health = classifyHealth(avgTotalCycle, offerCloseRate);
      const velocityScore = computeVelocityScore(avgResponseHours, avgTotalCycle, offerCloseRate, counterFreq);

      const metrics: DealVelocityMetrics = {
        avg_inquiry_to_response_hours: Math.round(avgResponseHours * 10) / 10,
        avg_inquiry_to_offer_days: avgInquiryToOffer,
        avg_offer_to_close_days: Math.round(avgOfferToClose * 10) / 10,
        avg_total_cycle_days: Math.round(avgTotalCycle * 10) / 10,
        total_inquiries_period: inquiries.length,
        total_offers_period: offers.length,
        total_closed_period: closedOffers.length,
        inquiry_to_offer_rate: Math.round(inquiryToOfferRate * 10) / 10,
        offer_close_rate: Math.round(offerCloseRate * 10) / 10,
        overall_conversion_rate: Math.round(overallRate * 10) / 10,
        counter_offer_frequency: Math.round(counterFreq * 10) / 10,
        health,
        velocity_score: velocityScore,
        velocity_trend: trend,
      };

      // Stage funnel
      const stages: StageMetrics[] = [
        {
          stage: 'inquiry',
          label: 'Inquiry',
          count: inquiries.length,
          avg_duration_hours: avgResponseHours,
          conversion_rate: inquiryToOfferRate,
        },
        {
          stage: 'offer',
          label: 'Offer Submitted',
          count: offers.length,
          avg_duration_hours: avgOfferToClose * 24,
          conversion_rate: offerCloseRate,
        },
        {
          stage: 'negotiation',
          label: 'Negotiation',
          count: counterOffers.length,
          avg_duration_hours: (avgOfferToClose * 0.6) * 24,
          conversion_rate: counterOffers.length > 0
            ? (closedOffers.filter(o => o.counter_price).length / counterOffers.length) * 100
            : 0,
        },
        {
          stage: 'closed',
          label: 'Deal Closed',
          count: closedOffers.length,
          avg_duration_hours: 0,
          conversion_rate: 100,
        },
      ];

      // Daily trend
      const dailyMap = new Map<string, { inquiries: number; offers: number; closed: number }>();
      for (let i = 0; i < period; i++) {
        const d = subDays(now, period - 1 - i);
        dailyMap.set(d.toISOString().slice(0, 10), { inquiries: 0, offers: 0, closed: 0 });
      }
      inquiries.forEach(r => {
        const key = r.created_at?.slice(0, 10);
        if (key) { const e = dailyMap.get(key); if (e) e.inquiries++; }
      });
      offers.forEach(r => {
        const key = r.created_at.slice(0, 10);
        const e = dailyMap.get(key);
        if (e) {
          e.offers++;
          if (['accepted', 'completed'].includes(r.status)) e.closed++;
        }
      });

      return {
        metrics,
        stages,
        interventions: buildInterventions(metrics),
        daily_trend: Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v })),
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export const VELOCITY_HEALTH_META: Record<DealVelocityHealth, { label: string; color: string; bgColor: string; description: string }> = {
  fast: { label: 'Fast Velocity', color: 'text-chart-2', bgColor: 'bg-chart-2/10', description: 'Deals closing quickly with high conversion' },
  normal: { label: 'Normal Velocity', color: 'text-primary', bgColor: 'bg-primary/10', description: 'Healthy deal progression pace' },
  slow: { label: 'Slow Velocity', color: 'text-chart-4', bgColor: 'bg-chart-4/10', description: 'Deals taking longer than optimal — interventions needed' },
  stalled: { label: 'Stalled', color: 'text-destructive', bgColor: 'bg-destructive/10', description: 'Critical bottlenecks blocking deal progression' },
};
