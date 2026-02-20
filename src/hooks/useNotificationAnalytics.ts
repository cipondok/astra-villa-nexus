import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationMetrics {
  sent: number;
  delivered: number;
  clicked: number;
  dismissed: number;
  deliveryRate: number;
  clickRate: number;
  dismissRate: number;
}

interface NotificationTypeMetrics {
  type: string;
  count: number;
  clickRate: number;
  avgTimeToClick: number;
}

interface DailyMetrics {
  date: string;
  sent: number;
  clicked: number;
  dismissed: number;
}

interface NotificationAnalytics {
  overview: NotificationMetrics;
  byType: NotificationTypeMetrics[];
  daily: DailyMetrics[];
  topPerforming: string[];
  optInRate: number;
  activeSubscribers: number;
}

const DEFAULT_ANALYTICS: NotificationAnalytics = {
  overview: {
    sent: 0,
    delivered: 0,
    clicked: 0,
    dismissed: 0,
    deliveryRate: 0,
    clickRate: 0,
    dismissRate: 0
  },
  byType: [],
  daily: [],
  topPerforming: [],
  optInRate: 0,
  activeSubscribers: 0
};

export const useNotificationAnalytics = (timeRange: '7d' | '30d' | '90d' = '30d') => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<NotificationAnalytics>(DEFAULT_ANALYTICS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDateRange = useCallback(() => {
    const end = new Date();
    const start = new Date();
    
    switch (timeRange) {
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
    }
    
    return { start: start.toISOString(), end: end.toISOString() };
  }, [timeRange]);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { start, end } = getDateRange();

      // Fetch notification history for the user or all (admin)
      const historyQuery = supabase
        .from('notification_history')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end);

      if (user && !user.email?.includes('admin')) {
        historyQuery.eq('user_id', user.id);
      }

      const { data: historyData, error: historyError } = await historyQuery;

      if (historyError) {
        console.error('Error fetching notification history:', historyError);
      }

      // Calculate metrics
      const notifications = historyData || [];
      const sent = notifications.length;
      const delivered = notifications.filter(n => n.is_sent).length;
      const clicked = notifications.filter(n => n.is_read).length;
      const dismissed = sent - clicked;

      const overview: NotificationMetrics = {
        sent,
        delivered,
        clicked,
        dismissed,
        deliveryRate: sent > 0 ? (delivered / sent) * 100 : 0,
        clickRate: delivered > 0 ? (clicked / delivered) * 100 : 0,
        dismissRate: delivered > 0 ? (dismissed / delivered) * 100 : 0
      };

      // Group by type
      const typeGroups = notifications.reduce((acc, n) => {
        const type = n.notification_type || 'other';
        if (!acc[type]) {
          acc[type] = { total: 0, clicked: 0, clickTimes: [] };
        }
        acc[type].total++;
        if (n.is_read) {
          acc[type].clicked++;
          if (n.read_at && n.sent_at) {
            const diff = new Date(n.read_at).getTime() - new Date(n.sent_at).getTime();
            acc[type].clickTimes.push(diff);
          }
        }
        return acc;
      }, {} as Record<string, { total: number; clicked: number; clickTimes: number[] }>);

      const byType: NotificationTypeMetrics[] = Object.entries(typeGroups).map(([type, data]) => ({
        type,
        count: data.total,
        clickRate: data.total > 0 ? (data.clicked / data.total) * 100 : 0,
        avgTimeToClick: data.clickTimes.length > 0 
          ? data.clickTimes.reduce((a, b) => a + b, 0) / data.clickTimes.length / 1000 / 60 
          : 0
      })).sort((a, b) => b.count - a.count);

      // Group by day
      const dailyGroups = notifications.reduce((acc, n) => {
        const date = new Date(n.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { sent: 0, clicked: 0, dismissed: 0 };
        }
        acc[date].sent++;
        if (n.is_read) {
          acc[date].clicked++;
        } else {
          acc[date].dismissed++;
        }
        return acc;
      }, {} as Record<string, { sent: number; clicked: number; dismissed: number }>);

      const daily: DailyMetrics[] = Object.entries(dailyGroups)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Top performing notification types
      const topPerforming = byType
        .filter(t => t.clickRate > 0)
        .sort((a, b) => b.clickRate - a.clickRate)
        .slice(0, 5)
        .map(t => t.type);

      // Get subscription stats
      const { count: activeSubscribers } = await supabase
        .from('push_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Calculate opt-in rate (subscribers / total users with preferences)
      const { count: totalPrefs } = await supabase
        .from('notification_preferences')
        .select('*', { count: 'exact', head: true });

      const { count: enabledPrefs } = await supabase
        .from('notification_preferences')
        .select('*', { count: 'exact', head: true })
        .eq('push_enabled', true);

      const optInRate = totalPrefs && totalPrefs > 0 
        ? ((enabledPrefs || 0) / totalPrefs) * 100 
        : 0;

      setAnalytics({
        overview,
        byType,
        daily,
        topPerforming,
        optInRate,
        activeSubscribers: activeSubscribers || 0
      });

    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch notification analytics');
    } finally {
      setIsLoading(false);
    }
  }, [user, getDateRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Track notification event
  const trackEvent = useCallback(async (
    eventType: 'sent' | 'delivered' | 'clicked' | 'dismissed' | 'subscribed' | 'unsubscribed',
    metadata?: Record<string, any>
  ) => {
    try {
      // Log to activity_logs as fallback
      if (user?.id) {
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          activity_type: 'notification_' + eventType,
          activity_description: `Notification ${eventType}`,
          metadata: metadata
        });
      }
      console.log('Notification event:', eventType, metadata);
    } catch (error) {
      console.error('Failed to track notification event:', error);
    }
  }, [user]);

  // Calculate engagement score
  const getEngagementScore = useCallback(() => {
    const { clickRate, deliveryRate } = analytics.overview;
    const score = (clickRate * 0.6) + (deliveryRate * 0.4);
    
    if (score >= 70) return { score, rating: 'Excellent', color: 'text-chart-1' };
    if (score >= 50) return { score, rating: 'Good', color: 'text-chart-2' };
    if (score >= 30) return { score, rating: 'Average', color: 'text-chart-3' };
    return { score, rating: 'Needs Improvement', color: 'text-destructive' };
  }, [analytics]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
    trackEvent,
    getEngagementScore,
    timeRange
  };
};

export default useNotificationAnalytics;
