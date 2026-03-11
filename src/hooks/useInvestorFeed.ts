import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type FeedCategory = 'best_rental_yield' | 'fast_appreciation' | 'luxury_flip' | 'passive_income';
export type RiskFilter = 'all' | 'low' | 'medium' | 'high';

export interface InvestorFeedItem {
  id: string;
  property_id: string;
  title: string;
  city: string;
  state: string;
  property_type: string;
  listing_type: string;
  price: number;
  land_area_sqm: number | null;
  building_area_sqm: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  thumbnail_url: string | null;
  investment_score: number;
  deal_score: number;
  deal_tag: string;
  undervaluation_percent: number;
  estimated_value: number;
  rental_yield_estimate: number;
  roi_forecast_gap: number;
  location_growth_score: number;
  demand_signal_score: number;
  feed_category: FeedCategory;
  rank_reason: string;
}

export interface InvestorFeedFilters {
  category?: FeedCategory;
  risk?: RiskFilter;
  city?: string;
  minBudget?: number;
  maxBudget?: number;
  page?: number;
  pageSize?: number;
}

export interface InvestorFeedResponse {
  items: InvestorFeedItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

function getRiskRange(risk: RiskFilter): { min: number; max: number } | null {
  switch (risk) {
    case 'low': return { min: 70, max: 100 };
    case 'medium': return { min: 40, max: 69 };
    case 'high': return { min: 0, max: 39 };
    default: return null;
  }
}

function getCategoryConfig(category?: FeedCategory) {
  switch (category) {
    case 'best_rental_yield':
      return { orderBy: 'rental_yield_estimate', reason: 'Top rental yield potential' };
    case 'fast_appreciation':
      return { orderBy: 'location_growth_score', reason: 'High location growth trajectory' };
    case 'luxury_flip':
      return { orderBy: 'undervaluation_percent', reason: 'Undervalued luxury opportunity' };
    case 'passive_income':
      return { orderBy: 'deal_score', reason: 'Strong passive income profile' };
    default:
      return { orderBy: 'deal_score', reason: 'AI-ranked opportunity' };
  }
}

export function useInvestorFeed(filters: InvestorFeedFilters = {}) {
  const page = filters.page || 1;
  const pageSize = filters.pageSize || 12;

  return useQuery({
    queryKey: ['investor-feed', filters],
    queryFn: async (): Promise<InvestorFeedResponse> => {
      const offset = (page - 1) * pageSize;
      const config = getCategoryConfig(filters.category);

      let query = (supabase as any)
        .from('property_deal_analysis')
        .select(`
          id,
          property_id,
          deal_score,
          deal_tag,
          estimated_value,
          undervaluation_percent,
          rental_yield_estimate,
          roi_forecast_gap,
          location_growth_score,
          demand_signal_score,
          properties!inner(
            title, city, state, property_type, listing_type, price,
            land_area_sqm, building_area_sqm, bedrooms, bathrooms,
            thumbnail_url, investment_score
          )
        `, { count: 'exact' });

      // Category-specific filters
      if (filters.category === 'best_rental_yield') {
        query = query.gte('rental_yield_estimate', 4);
      } else if (filters.category === 'fast_appreciation') {
        query = query.gte('location_growth_score', 60);
      } else if (filters.category === 'luxury_flip') {
        query = query.gte('undervaluation_percent', 10);
      } else if (filters.category === 'passive_income') {
        query = query.gte('deal_score', 50);
      }

      // Risk filter via investment_score
      const riskRange = getRiskRange(filters.risk || 'all');
      if (riskRange) {
        query = query.gte('deal_score', riskRange.min).lte('deal_score', riskRange.max);
      }

      // City filter
      if (filters.city) {
        query = query.eq('properties.city', filters.city);
      }

      // Budget filter
      if (filters.minBudget) {
        query = query.gte('listing_price', filters.minBudget);
      }
      if (filters.maxBudget) {
        query = query.lte('listing_price', filters.maxBudget);
      }

      query = query
        .order(config.orderBy, { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      const items: InvestorFeedItem[] = (data || []).map((d: any) => ({
        id: d.id,
        property_id: d.property_id,
        title: d.properties?.title || 'Untitled',
        city: d.properties?.city || '',
        state: d.properties?.state || '',
        property_type: d.properties?.property_type || '',
        listing_type: d.properties?.listing_type || '',
        price: d.properties?.price || 0,
        land_area_sqm: d.properties?.land_area_sqm,
        building_area_sqm: d.properties?.building_area_sqm,
        bedrooms: d.properties?.bedrooms,
        bathrooms: d.properties?.bathrooms,
        thumbnail_url: d.properties?.thumbnail_url,
        investment_score: d.properties?.investment_score || 0,
        deal_score: d.deal_score,
        deal_tag: d.deal_tag,
        undervaluation_percent: d.undervaluation_percent,
        estimated_value: d.estimated_value,
        rental_yield_estimate: d.rental_yield_estimate || 0,
        roi_forecast_gap: d.roi_forecast_gap || 0,
        location_growth_score: d.location_growth_score || 0,
        demand_signal_score: d.demand_signal_score || 0,
        feed_category: filters.category || 'passive_income',
        rank_reason: config.reason,
      }));

      const total = count || 0;
      return {
        items,
        total,
        page,
        pageSize,
        hasMore: offset + pageSize < total,
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
