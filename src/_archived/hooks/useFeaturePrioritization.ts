import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type Quadrant = 'quick_wins' | 'strategic_bets' | 'fill_ins' | 'deprioritize';

export interface PrioritizedFeature {
  id: string;
  name: string;
  description: string;
  quadrant: Quadrant;
  impact: number;      // 0-100
  complexity: number;  // 0-100
  priority_score: number; // weighted
  status: 'shipped' | 'building' | 'planned' | 'exploring';
  engagement_signal?: number;
  category: string;
}

export interface FeaturePrioritizationData {
  features: PrioritizedFeature[];
  quadrant_summary: Record<Quadrant, { count: number; avg_score: number }>;
  focus_recommendation: string;
}

function quadrant(impact: number, complexity: number): Quadrant {
  if (impact >= 60 && complexity < 50) return 'quick_wins';
  if (impact >= 60 && complexity >= 50) return 'strategic_bets';
  if (impact < 60 && complexity < 50) return 'fill_ins';
  return 'deprioritize';
}

function priorityScore(impact: number, complexity: number): number {
  return Math.round(impact * 0.65 + (100 - complexity) * 0.35);
}

export function useFeaturePrioritization() {
  return useQuery({
    queryKey: ['feature-prioritization'],
    queryFn: async (): Promise<FeaturePrioritizationData> => {
      const [aiJobs, watchlist, offers, subs, reviews, referrals] = await Promise.all([
        supabase.from('ai_jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('investor_watchlist_items').select('id', { count: 'exact', head: true }),
        supabase.from('property_offers').select('id', { count: 'exact', head: true }),
        supabase.from('user_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('vendor_reviews').select('id', { count: 'exact', head: true }),
        supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('status', 'converted'),
      ]);

      const aiCount = aiJobs.count || 0;
      const wlCount = watchlist.count || 0;
      const offerCount = offers.count || 0;
      const subCount = subs.count || 0;
      const refCount = referrals.count || 0;

      const features: PrioritizedFeature[] = [
        // Quick Wins — High Impact / Low Complexity
        { id: 'f1', name: 'Opportunity Score Visibility', description: 'Surface AI scores prominently in listing cards and search results', quadrant: 'quick_wins', impact: 90, complexity: 25, priority_score: 0, status: aiCount > 100 ? 'shipped' : 'building', engagement_signal: aiCount, category: 'Discovery' },
        { id: 'f2', name: 'Watchlist & Alert Notifications', description: 'Push price drop, new listing, and score change alerts to investors', quadrant: 'quick_wins', impact: 85, complexity: 30, priority_score: 0, status: wlCount > 50 ? 'shipped' : 'building', engagement_signal: wlCount, category: 'Engagement' },
        { id: 'f3', name: 'Smart Property Comparison', description: 'Side-by-side comparison of up to 3 properties with key metrics', quadrant: 'quick_wins', impact: 75, complexity: 35, priority_score: 0, status: 'building', category: 'Discovery' },
        { id: 'f4', name: 'Investor Onboarding Flow', description: 'Guided first-time experience with preference capture and recommendations', quadrant: 'quick_wins', impact: 80, complexity: 30, priority_score: 0, status: 'building', category: 'Growth' },

        // Strategic Bets — High Impact / High Complexity
        { id: 'f5', name: 'Automated Valuation Engine', description: 'ML-powered fair market value estimation with confidence scoring', quadrant: 'strategic_bets', impact: 95, complexity: 85, priority_score: 0, status: aiCount > 500 ? 'shipped' : 'building', engagement_signal: aiCount, category: 'Intelligence' },
        { id: 'f6', name: 'Negotiation Workflow Tools', description: 'Structured offer/counter-offer flow with AI-suggested pricing', quadrant: 'strategic_bets', impact: 88, complexity: 75, priority_score: 0, status: offerCount > 20 ? 'building' : 'planned', engagement_signal: offerCount, category: 'Transaction' },
        { id: 'f7', name: 'Portfolio Analytics Dashboard', description: 'Multi-property ROI tracking, risk scoring, and diversification analysis', quadrant: 'strategic_bets', impact: 82, complexity: 70, priority_score: 0, status: subCount > 10 ? 'building' : 'planned', engagement_signal: subCount, category: 'Intelligence' },
        { id: 'f8', name: 'Referral Growth Engine', description: 'Tiered gamified referral system with viral loop mechanics', quadrant: 'strategic_bets', impact: 78, complexity: 60, priority_score: 0, status: refCount > 10 ? 'shipped' : 'building', engagement_signal: refCount, category: 'Growth' },

        // Fill-Ins — Low Impact / Low Complexity
        { id: 'f9', name: 'UI Visual Enhancements', description: 'Polish animations, dark mode refinements, and micro-interactions', quadrant: 'fill_ins', impact: 35, complexity: 20, priority_score: 0, status: 'shipped', category: 'Experience' },
        { id: 'f10', name: 'Profile Customization', description: 'Avatar upload, bio, and investor preference badge display', quadrant: 'fill_ins', impact: 30, complexity: 15, priority_score: 0, status: 'shipped', category: 'Experience' },
        { id: 'f11', name: 'Saved Search Filters', description: 'Persist and name custom filter combinations for quick reuse', quadrant: 'fill_ins', impact: 45, complexity: 25, priority_score: 0, status: 'building', category: 'Discovery' },

        // Deprioritize — Low Impact / High Complexity
        { id: 'f12', name: 'Community Networking Hub', description: 'Investor forums, group deals, and social features', quadrant: 'deprioritize', impact: 40, complexity: 80, priority_score: 0, status: 'exploring', category: 'Community' },
        { id: 'f13', name: 'Fractional Tokenization', description: 'Blockchain-based fractional property ownership infrastructure', quadrant: 'deprioritize', impact: 50, complexity: 95, priority_score: 0, status: 'exploring', category: 'Innovation' },
        { id: 'f14', name: 'AR Property Previews', description: 'Augmented reality property visualization and virtual staging', quadrant: 'deprioritize', impact: 35, complexity: 90, priority_score: 0, status: 'exploring', category: 'Innovation' },
      ];

      // Compute scores and re-assign quadrants
      for (const f of features) {
        f.priority_score = priorityScore(f.impact, f.complexity);
        f.quadrant = quadrant(f.impact, f.complexity);
      }

      features.sort((a, b) => b.priority_score - a.priority_score);

      const quadrant_summary = {} as Record<Quadrant, { count: number; avg_score: number }>;
      for (const q of ['quick_wins', 'strategic_bets', 'fill_ins', 'deprioritize'] as Quadrant[]) {
        const items = features.filter(f => f.quadrant === q);
        quadrant_summary[q] = {
          count: items.length,
          avg_score: items.length > 0 ? Math.round(items.reduce((s, f) => s + f.priority_score, 0) / items.length) : 0,
        };
      }

      const topQuadrant = quadrant_summary.quick_wins.count > 0 ? 'Quick Wins' : 'Strategic Bets';
      const focus_recommendation = `Focus on ${topQuadrant} — ${quadrant_summary.quick_wins.count} features ready for immediate high-impact delivery with low engineering cost.`;

      return { features, quadrant_summary, focus_recommendation };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export { quadrant, priorityScore };
