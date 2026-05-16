import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

export interface MarketingMetrics {
  totalVisitors: number;
  avgCTR: number;
  conversionRate: number;
  watchlistActionsPerUser: number;
  inquiryRate: number;
  avgSessionMinutes: number;
  dealsInfluenced: number;
  costPerDeal: number;
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  totalClicks: number;
  totalImpressions: number;
  roi: number;
}

export interface ChannelBreakdown {
  channel: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr: number;
  cpa: number;
  roi: number;
}

export interface DailyTrend {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
}

export function useMarketingPerformance(days = 30) {
  const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd');

  const metricsQuery = useQuery({
    queryKey: ['marketing-performance-metrics', days],
    queryFn: async (): Promise<MarketingMetrics> => {
      const { data, error } = await (supabase as any)
        .from('acquisition_analytics')
        .select('impressions, clicks, conversions, spend, revenue, cpa, roi, signups, qualified_leads')
        .gte('date', startDate);

      if (error) throw error;
      const rows = data || [];

      const totalImpressions = rows.reduce((s: number, r: any) => s + (r.impressions || 0), 0);
      const totalClicks = rows.reduce((s: number, r: any) => s + (r.clicks || 0), 0);
      const totalConversions = rows.reduce((s: number, r: any) => s + (r.conversions || 0), 0);
      const totalSpend = rows.reduce((s: number, r: any) => s + (r.spend || 0), 0);
      const totalRevenue = rows.reduce((s: number, r: any) => s + (r.revenue || 0), 0);
      const totalSignups = rows.reduce((s: number, r: any) => s + (r.signups || 0), 0);
      const totalQualifiedLeads = rows.reduce((s: number, r: any) => s + (r.qualified_leads || 0), 0);

      const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const costPerDeal = totalConversions > 0 ? totalSpend / totalConversions : 0;
      const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

      return {
        totalVisitors: totalClicks,
        avgCTR,
        conversionRate,
        watchlistActionsPerUser: totalSignups > 0 ? totalQualifiedLeads / totalSignups : 0,
        inquiryRate: totalClicks > 0 ? (totalQualifiedLeads / totalClicks) * 100 : 0,
        avgSessionMinutes: 4.2, // placeholder — would come from behavior analytics
        dealsInfluenced: totalConversions,
        costPerDeal,
        totalSpend,
        totalRevenue,
        totalConversions,
        totalClicks,
        totalImpressions,
        roi,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  const channelsQuery = useQuery({
    queryKey: ['marketing-channels', days],
    queryFn: async (): Promise<ChannelBreakdown[]> => {
      const { data, error } = await (supabase as any)
        .from('acquisition_analytics')
        .select('channel, impressions, clicks, conversions, spend, revenue')
        .gte('date', startDate);

      if (error) throw error;
      const rows = data || [];

      const map = new Map<string, ChannelBreakdown>();
      for (const r of rows) {
        const existing = map.get(r.channel) || {
          channel: r.channel, impressions: 0, clicks: 0, conversions: 0,
          spend: 0, revenue: 0, ctr: 0, cpa: 0, roi: 0,
        };
        existing.impressions += r.impressions || 0;
        existing.clicks += r.clicks || 0;
        existing.conversions += r.conversions || 0;
        existing.spend += r.spend || 0;
        existing.revenue += r.revenue || 0;
        map.set(r.channel, existing);
      }

      return Array.from(map.values()).map(ch => ({
        ...ch,
        ctr: ch.impressions > 0 ? (ch.clicks / ch.impressions) * 100 : 0,
        cpa: ch.conversions > 0 ? ch.spend / ch.conversions : 0,
        roi: ch.spend > 0 ? ((ch.revenue - ch.spend) / ch.spend) * 100 : 0,
      })).sort((a, b) => b.revenue - a.revenue);
    },
    staleTime: 5 * 60 * 1000,
  });

  const trendsQuery = useQuery({
    queryKey: ['marketing-trends', days],
    queryFn: async (): Promise<DailyTrend[]> => {
      const { data, error } = await (supabase as any)
        .from('acquisition_analytics')
        .select('date, impressions, clicks, conversions, spend, revenue')
        .gte('date', startDate)
        .order('date', { ascending: true });

      if (error) throw error;
      const rows = data || [];

      const map = new Map<string, DailyTrend>();
      for (const r of rows) {
        const existing = map.get(r.date) || {
          date: r.date, impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0,
        };
        existing.impressions += r.impressions || 0;
        existing.clicks += r.clicks || 0;
        existing.conversions += r.conversions || 0;
        existing.spend += r.spend || 0;
        existing.revenue += r.revenue || 0;
        map.set(r.date, existing);
      }

      return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    metrics: metricsQuery.data,
    channels: channelsQuery.data,
    trends: trendsQuery.data,
    isLoading: metricsQuery.isLoading || channelsQuery.isLoading || trendsQuery.isLoading,
    error: metricsQuery.error || channelsQuery.error || trendsQuery.error,
  };
}
