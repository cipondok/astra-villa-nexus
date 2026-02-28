import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface PropertyAnalyticsSummary {
  totalViews: number;
  totalSaves: number;
  totalContacts: number;
  totalShares: number;
  totalClicks: number;
  viewsTrend: { date: string; views: number; contacts: number }[];
  topProperties: { id: string; title: string; views: number; saves: number; contacts: number }[];
  conversionRate: number; // contacts / views
}

export const usePropertyAnalytics = (dateRange: '7d' | '30d' | '90d' = '30d') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['property-analytics', user?.id, dateRange],
    queryFn: async (): Promise<PropertyAnalyticsSummary> => {
      if (!user) throw new Error('Not authenticated');

      const daysAgo = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data: analytics, error } = await supabase
        .from('property_analytics')
        .select('*, properties!inner(title)')
        .eq('agent_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      const rows = analytics || [];

      // Aggregate totals
      const totalViews = rows.reduce((s, r) => s + (r.views || 0), 0);
      const totalSaves = rows.reduce((s, r) => s + (r.saves || 0), 0);
      const totalContacts = rows.reduce((s, r) => s + (r.contacts || 0), 0);
      const totalShares = rows.reduce((s, r) => s + (r.shares || 0), 0);
      const totalClicks = rows.reduce((s, r) => s + (r.clicks || 0), 0);

      // Daily trend
      const byDate = new Map<string, { views: number; contacts: number }>();
      rows.forEach(r => {
        const existing = byDate.get(r.date) || { views: 0, contacts: 0 };
        existing.views += r.views || 0;
        existing.contacts += r.contacts || 0;
        byDate.set(r.date, existing);
      });
      const viewsTrend = Array.from(byDate.entries()).map(([date, d]) => ({ date, ...d }));

      // Top properties
      const byProperty = new Map<string, { id: string; title: string; views: number; saves: number; contacts: number }>();
      rows.forEach(r => {
        const pid = r.property_id;
        const existing = byProperty.get(pid) || { id: pid, title: (r as any).properties?.title || 'Unknown', views: 0, saves: 0, contacts: 0 };
        existing.views += r.views || 0;
        existing.saves += r.saves || 0;
        existing.contacts += r.contacts || 0;
        byProperty.set(pid, existing);
      });
      const topProperties = Array.from(byProperty.values())
        .sort((a, b) => b.views - a.views)
        .slice(0, 5);

      return {
        totalViews,
        totalSaves,
        totalContacts,
        totalShares,
        totalClicks,
        viewsTrend,
        topProperties,
        conversionRate: totalViews > 0 ? totalContacts / totalViews : 0,
      };
    },
    enabled: !!user,
  });
};
