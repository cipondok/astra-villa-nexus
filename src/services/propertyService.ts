/**
 * Property Data Service
 * Abstracts all property-related Supabase queries from UI/stores.
 */
import { supabase } from '@/integrations/supabase/client';

export interface PropertySummary {
  id: string;
  title: string;
  city: string | null;
  price: number | null;
  property_type: string;
  listing_type: string;
  bedrooms: number | null;
  bathrooms: number | null;
  building_area_sqm: number | null;
  land_area_sqm: number | null;
  image_urls: string[] | null;
  status: string;
  investment_score: number | null;
  expected_rental_yield: number | null;
  created_at: string | null;
}

const PROPERTY_SELECT = 'id, title, city, price, property_type, listing_type, bedrooms, bathrooms, building_area_sqm, land_area_sqm, image_urls, status, investment_score, expected_rental_yield, created_at';

export interface PropertyFilters {
  city?: string;
  property_type?: string;
  listing_type?: string;
  price_min?: number;
  price_max?: number;
  bedrooms_min?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function fetchProperties(filters: PropertyFilters = {}): Promise<{ data: PropertySummary[]; count: number }> {
  let query = supabase
    .from('properties')
    .select(PROPERTY_SELECT, { count: 'exact' })
    .eq('status', 'active');

  if (filters.city) query = query.eq('city', filters.city);
  if (filters.property_type) query = query.eq('property_type', filters.property_type);
  if (filters.listing_type) query = query.eq('listing_type', filters.listing_type);
  if (filters.price_min) query = query.gte('price', filters.price_min);
  if (filters.price_max) query = query.lte('price', filters.price_max);
  if (filters.bedrooms_min) query = query.gte('bedrooms', filters.bedrooms_min);
  if (filters.search) query = query.ilike('title', `%${filters.search}%`);

  query = query
    .order('created_at', { ascending: false })
    .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data || []) as unknown as PropertySummary[], count: count || 0 };
}

export async function fetchPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function fetchFeaturedProperties(limit = 6): Promise<PropertySummary[]> {
  const { data, error } = await supabase
    .from('properties')
    .select(PROPERTY_SELECT)
    .eq('status', 'active')
    .order('investment_score', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as unknown as PropertySummary[];
}
