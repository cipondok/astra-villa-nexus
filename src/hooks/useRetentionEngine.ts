import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RetentionSignals {
  browsing_frequency: number; // sessions in last 30d
  watchlist_updates: number;  // saves/removes in last 30d
  alert_response_rate: number; // 0-100
  days_since_last_visit: number;
  total_interactions_30d: number;
  avg_session_gap_days: number;
}

export type RetentionHealth = 'thriving' | 'healthy' | 'cooling' | 'at_risk' | 'churning';

export interface RetentionProfile {
  health: RetentionHealth;
  health_score: number; // 0-100
  signals: RetentionSignals;
  recommended_actions: RetentionAction[];
  engagement_trend: 'improving' | 'stable' | 'declining';
  predicted_churn_probability: number; // 0-1
  next_milestone: string | null;
}

export interface RetentionAction {
  id: string;
  type: 'recommendation_refresh' | 'portfolio_summary' | 'reengagement_nudge' | 'milestone_celebration' | 'new_listing_match';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  icon_key: string;
}

function computeHealthScore(signals: RetentionSignals): number {
  const frequencyScore = Math.min(signals.browsing_frequency / 20, 1) * 30;
  const watchlistScore = Math.min(signals.watchlist_updates / 10, 1) * 25;
  const alertScore = (signals.alert_response_rate / 100) * 20;
  const recencyScore = Math.max(0, 1 - signals.days_since_last_visit / 30) * 25;
  return Math.round(frequencyScore + watchlistScore + alertScore + recencyScore);
}

function classifyHealth(score: number): RetentionHealth {
  if (score >= 80) return 'thriving';
  if (score >= 60) return 'healthy';
  if (score >= 40) return 'cooling';
  if (score >= 20) return 'at_risk';
  return 'churning';
}

function determineTrend(current30d: number, previous30d: number): 'improving' | 'stable' | 'declining' {
  const ratio = previous30d > 0 ? current30d / previous30d : current30d > 0 ? 2 : 1;
  if (ratio > 1.15) return 'improving';
  if (ratio < 0.85) return 'declining';
  return 'stable';
}

function buildRetentionActions(signals: RetentionSignals, health: RetentionHealth): RetentionAction[] {
  const actions: RetentionAction[] = [];

  if (signals.days_since_last_visit > 7) {
    actions.push({
      id: 'reengagement',
      type: 'reengagement_nudge',
      title: 'Welcome Back Nudge',
      description: `${signals.days_since_last_visit} days since last visit — trigger personalized re-engagement with top matches`,
      priority: signals.days_since_last_visit > 14 ? 'high' : 'medium',
      icon_key: 'bell-ring',
    });
  }

  if (signals.browsing_frequency < 5) {
    actions.push({
      id: 'refresh_recs',
      type: 'recommendation_refresh',
      title: 'Refresh AI Recommendations',
      description: 'Low browsing activity — recalibrate property feed with fresh DNA-aligned listings',
      priority: 'high',
      icon_key: 'sparkles',
    });
  }

  if (signals.watchlist_updates > 3) {
    actions.push({
      id: 'portfolio_summary',
      type: 'portfolio_summary',
      title: 'Portfolio Performance Digest',
      description: 'Active watchlist management detected — deliver milestone portfolio value summary',
      priority: 'medium',
      icon_key: 'bar-chart',
    });
  }

  if (health === 'thriving' || health === 'healthy') {
    actions.push({
      id: 'milestone',
      type: 'milestone_celebration',
      title: 'Milestone Achievement',
      description: `${signals.total_interactions_30d} interactions this month — celebrate engagement streak`,
      priority: 'low',
      icon_key: 'trophy',
    });
  }

  if (signals.alert_response_rate < 30) {
    actions.push({
      id: 'new_listing_match',
      type: 'new_listing_match',
      title: 'Highlight New DNA Matches',
      description: 'Low alert engagement — surface high-score listings aligned with investor DNA',
      priority: 'high',
      icon_key: 'target',
    });
  }

  return actions.sort((a, b) => {
    const p = { high: 0, medium: 1, low: 2 };
    return p[a.priority] - p[b.priority];
  });
}

export function useRetentionEngine() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['retention-engine', user?.id],
    queryFn: async (): Promise<RetentionProfile | null> => {
      if (!user?.id) return null;

      const now = new Date();
      const d30 = new Date(now.getTime() - 30 * 86400000).toISOString();
      const d60 = new Date(now.getTime() - 60 * 86400000).toISOString();

      // Parallel queries
      const [behaviorRes, behavior60Res, savedRes, alertsRes] = await Promise.all([
        supabase
          .from('ai_behavior_tracking')
          .select('created_at', { count: 'exact', head: false })
          .eq('user_id', user.id)
          .gte('created_at', d30)
          .limit(500),
        supabase
          .from('ai_behavior_tracking')
          .select('created_at', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', d60)
          .lt('created_at', d30),
        supabase
          .from('saved_properties')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', d30),
        supabase
          .from('property_alerts')
          .select('id, is_active', { count: 'exact', head: false })
          .eq('user_id', user.id)
          .limit(100),
      ]);

      const current30d = behaviorRes.count || 0;
      const previous30d = behavior60Res.count || 0;
      const watchlistUpdates = savedRes.count || 0;

      // Compute session gaps from behavior timestamps
      const timestamps = (behaviorRes.data || [])
        .map(r => new Date(r.created_at).getTime())
        .sort((a, b) => b - a);

      const daysSinceLast = timestamps.length > 0
        ? Math.round((now.getTime() - timestamps[0]) / 86400000)
        : 30;

      // Average gap between sessions (deduplicated to daily)
      const uniqueDays = new Set(timestamps.map(t => new Date(t).toDateString()));
      const daysList = Array.from(uniqueDays);
      let avgGap = 7;
      if (daysList.length > 1) {
        avgGap = 30 / daysList.length;
      }

      // Alert response rate
      const totalAlerts = alertsRes.count || 0;
      const activeAlerts = (alertsRes.data || []).filter(a => a.is_active).length;
      const alertResponseRate = totalAlerts > 0 ? Math.round((activeAlerts / totalAlerts) * 100) : 50;

      const signals: RetentionSignals = {
        browsing_frequency: current30d,
        watchlist_updates: watchlistUpdates,
        alert_response_rate: alertResponseRate,
        days_since_last_visit: daysSinceLast,
        total_interactions_30d: current30d,
        avg_session_gap_days: Math.round(avgGap * 10) / 10,
      };

      const healthScore = computeHealthScore(signals);
      const health = classifyHealth(healthScore);
      const trend = determineTrend(current30d, previous30d);
      const actions = buildRetentionActions(signals, health);
      const churnProb = Math.max(0, Math.min(1, 1 - healthScore / 100));

      const nextMilestone = current30d < 10 ? '10 interactions'
        : current30d < 50 ? '50 interactions'
        : current30d < 100 ? '100 interactions'
        : null;

      return {
        health,
        health_score: healthScore,
        signals,
        recommended_actions: actions,
        engagement_trend: trend,
        predicted_churn_probability: Math.round(churnProb * 100) / 100,
        next_milestone: nextMilestone,
      };
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Export health meta for UI
export const HEALTH_META: Record<RetentionHealth, { label: string; color: string; bgColor: string }> = {
  thriving: { label: 'Thriving', color: 'text-chart-2', bgColor: 'bg-chart-2/10' },
  healthy: { label: 'Healthy', color: 'text-primary', bgColor: 'bg-primary/10' },
  cooling: { label: 'Cooling', color: 'text-chart-4', bgColor: 'bg-chart-4/10' },
  at_risk: { label: 'At Risk', color: 'text-chart-5', bgColor: 'bg-chart-5/10' },
  churning: { label: 'Churning', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};
