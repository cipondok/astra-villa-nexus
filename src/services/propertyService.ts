/**
 * Property Data Service
 * Abstracts all property-related Supabase queries from UI/stores.
 */
import { supabase } from '@/integrations/supabase/client';

export interface PropertySummary {
  id: string;
  title: string;
  city: string | null;
  price: number;
  property_type: string | null;
  listing_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  building_area: number | null;
  land_area: number | null;
  image_url: string | null;
  status: string | null;
  investment_score: number | null;
  rental_yield: number | null;
  created_at: string;
}

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
    .select('id, title, city, price, property_type, listing_type, bedrooms, bathrooms, building_area, land_area, image_url, status, investment_score, rental_yield, created_at', { count: 'exact' })
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
  return { data: (data || []) as PropertySummary[], count: count || 0 };
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
    .select('id, title, city, price, property_type, listing_type, bedrooms, bathrooms, building_area, land_area, image_url, status, investment_score, rental_yield, created_at')
    .eq('status', 'active')
    .order('investment_score', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as PropertySummary[];
}
