import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface WatchlistCategory {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  sort_order: number;
  created_at: string;
  item_count?: number;
}

export interface WatchlistItem {
  id: string;
  user_id: string;
  property_id: string;
  category_id: string | null;
  notes: string | null;
  ai_recommendation: 'strong_buy' | 'monitor' | 'risk_increasing' | null;
  score_at_add: number | null;
  price_at_add: number | null;
  last_score: number | null;
  last_price: number | null;
  score_change: number;
  price_change_pct: number;
  has_new_alert: boolean;
  alert_count: number;
  last_alert_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined property data
  property?: {
    id: string;
    title: string;
    price: number;
    city: string | null;
    location: string | null;
    property_type: string | null;
    bedrooms: number | null;
    bathrooms: number | null;
    area_sqm: number | null;
    images: string[] | null;
    image_urls: string[] | null;
    opportunity_score: number | null;
    demand_heat_score: number | null;
    rental_yield_percentage: number | null;
    ai_price_forecast_3m: number | null;
    status: string | null;
  };
  category?: WatchlistCategory;
}

export type WatchlistFilter = 'all' | 'elite' | 'undervalued' | 'strong_buy' | 'has_alerts';
export type WatchlistSort = 'newest' | 'score_desc' | 'price_change' | 'forecast';

// ─── Categories ───
export function useWatchlistCategories() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['watchlist-categories', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await (supabase as any)
        .from('investor_watchlist_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('sort_order');
      if (error) throw error;
      return (data || []) as WatchlistCategory[];
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });
}

export function useCreateWatchlistCategory() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; description?: string; color?: string }) => {
      if (!user?.id) throw new Error('Login required');
      const { data, error } = await (supabase as any)
        .from('investor_watchlist_categories')
        .insert({ user_id: user.id, ...input })
        .select()
        .single();
      if (error) throw error;
      return data as WatchlistCategory;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist-categories'] });
      toast.success('Kategori watchlist dibuat');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteWatchlistCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (categoryId: string) => {
      const { error } = await (supabase as any)
        .from('investor_watchlist_categories')
        .delete()
        .eq('id', categoryId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist-categories'] });
      qc.invalidateQueries({ queryKey: ['watchlist-items'] });
      toast.success('Kategori dihapus');
    },
  });
}

// ─── Items ───
export function useWatchlistItems(filter: WatchlistFilter = 'all', sort: WatchlistSort = 'newest', categoryId?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['watchlist-items', user?.id, filter, sort, categoryId],
    queryFn: async () => {
      if (!user?.id) return [];
      let query = (supabase as any)
        .from('investor_watchlist_items')
        .select('*, properties(id, title, price, city, location, property_type, bedrooms, bathrooms, area_sqm, images, image_urls, opportunity_score, demand_heat_score, rental_yield_percentage, ai_price_forecast_3m, status)')
        .eq('user_id', user.id);

      if (categoryId) query = query.eq('category_id', categoryId);

      // Sorting
      switch (sort) {
        case 'score_desc':
          query = query.order('last_score', { ascending: false, nullsFirst: false });
          break;
        case 'price_change':
          query = query.order('price_change_pct', { ascending: true });
          break;
        case 'forecast':
          query = query.order('created_at', { ascending: false }); // will sort client-side
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      let items = (data || []).map((item: any) => ({
        ...item,
        property: item.properties,
      })) as WatchlistItem[];

      // Client-side filters
      if (filter === 'elite') items = items.filter(i => (i.property?.opportunity_score || 0) >= 85);
      if (filter === 'undervalued') items = items.filter(i => (i.price_change_pct || 0) < -5);
      if (filter === 'strong_buy') items = items.filter(i => i.ai_recommendation === 'strong_buy');
      if (filter === 'has_alerts') items = items.filter(i => i.has_new_alert);

      // Client-side sort for forecast
      if (sort === 'forecast') {
        items.sort((a, b) => (b.property?.ai_price_forecast_3m || 0) - (a.property?.ai_price_forecast_3m || 0));
      }

      return items;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

export function useWatchlistPropertyIds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['watchlist-property-ids', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const { data, error } = await (supabase as any)
        .from('investor_watchlist_items')
        .select('property_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return new Set((data || []).map((d: any) => d.property_id));
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}

export function useToggleWatchlist() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { propertyId: string; categoryId?: string; price?: number; score?: number }) => {
      if (!user?.id) throw new Error('Login required');

      // Check if already in watchlist
      const { data: existing } = await (supabase as any)
        .from('investor_watchlist_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('property_id', input.propertyId)
        .maybeSingle();

      if (existing) {
        const { error } = await (supabase as any)
          .from('investor_watchlist_items')
          .delete()
          .eq('id', existing.id);
        if (error) throw error;
        return { action: 'removed' as const };
      } else {
        const { error } = await (supabase as any)
          .from('investor_watchlist_items')
          .insert({
            user_id: user.id,
            property_id: input.propertyId,
            category_id: input.categoryId || null,
            score_at_add: input.score || null,
            price_at_add: input.price || null,
            last_score: input.score || null,
            last_price: input.price || null,
          });
        if (error) throw error;
        return { action: 'added' as const };
      }
    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ['watchlist-items'] });
      qc.invalidateQueries({ queryKey: ['watchlist-property-ids'] });
      toast.success(result.action === 'added' ? 'Ditambahkan ke watchlist' : 'Dihapus dari watchlist');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateWatchlistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; category_id?: string | null; notes?: string }) => {
      const { error } = await (supabase as any)
        .from('investor_watchlist_items')
        .update(input)
        .eq('id', input.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist-items'] });
    },
  });
}

export function useClearWatchlistAlerts() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await (supabase as any)
        .from('investor_watchlist_items')
        .update({ has_new_alert: false })
        .eq('user_id', user.id)
        .eq('has_new_alert', true);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist-items'] });
      toast.success('Semua alert telah dibaca');
    },
  });
}

// AI recommendation helpers
export const AI_REC_CONFIG = {
  strong_buy: { label: 'Strong Buy', emoji: '🚀', color: 'text-chart-2', bg: 'bg-chart-2/10 border-chart-2/20' },
  monitor: { label: 'Monitor', emoji: '👀', color: 'text-chart-4', bg: 'bg-chart-4/10 border-chart-4/20' },
  risk_increasing: { label: 'Risk ↑', emoji: '⚠️', color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20' },
} as const;
