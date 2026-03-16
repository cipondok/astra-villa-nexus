import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ── Types ──

export type LocationLevel = 'province' | 'city' | 'kecamatan' | 'kelurahan';
export type MarketSignal = 'HIGH_DEMAND' | 'GROWING' | 'STABLE' | 'EMERGING';

export interface LocationInfo {
  level: LocationLevel;
  label: string;
  full_path: string;
  province: string;
  city: string;
  district: string;
  village: string;
}

export interface KeywordClusters {
  transactional: string[];
  rental: string[];
  investment: string[];
  informational: string[];
  long_tail: string[];
}

export interface InternalLink {
  label: string;
  slug: string;
  rel: string;
}

export interface NearbyArea {
  area: string;
  listing_count: number;
  link_type: string;
}

export interface InternalLinks {
  parent_pages: InternalLink[];
  nearby_areas: NearbyArea[];
  contextual_links: InternalLink[];
  collection_links: InternalLink[];
}

export interface MarketData {
  listing_count: number;
  avg_price: number;
  median_price: number;
  min_price: number;
  max_price: number;
  price_formatted: string;
  demand_score: number;
  growth_score: number;
  liquidity_score: number;
  investment_score: number;
  market_signal: MarketSignal;
  property_types: Record<string, number>;
}

export interface SeoLocationBlueprint {
  location: LocationInfo;
  seo_title: string;
  meta_description: string;
  intro_content: string;
  keyword_clusters: KeywordClusters;
  internal_links: InternalLinks;
  market_data: MarketData;
  page_slug: string;
  generated_at: string;
}

export interface BlueprintInput {
  province: string;
  city?: string;
  district?: string;
  village?: string;
}

// ── Pure classifiers ──

export function classifyMarketSignal(demand: number, growth: number, liquidity: number): MarketSignal {
  if (demand >= 65 && growth >= 60) return 'HIGH_DEMAND';
  if (growth >= 55) return 'GROWING';
  if (demand >= 45 && liquidity >= 45) return 'STABLE';
  return 'EMERGING';
}

export function scoreSeoReadiness(
  listingCount: number,
  seoTitle: string,
  metaDesc: string,
  keywordCount: number,
  nearbyLinkCount: number,
): number {
  let score = 0;
  // Listing density
  if (listingCount >= 50) score += 25;
  else if (listingCount >= 20) score += 18;
  else if (listingCount >= 5) score += 10;
  else score += 3;
  // Title quality
  if (seoTitle.length >= 30 && seoTitle.length <= 60) score += 25;
  else if (seoTitle.length > 0) score += 12;
  // Meta desc quality
  if (metaDesc.length >= 120 && metaDesc.length <= 160) score += 25;
  else if (metaDesc.length >= 80) score += 15;
  else if (metaDesc.length > 0) score += 8;
  // Keywords
  if (keywordCount >= 25) score += 15;
  else if (keywordCount >= 15) score += 10;
  else score += 5;
  // Internal links
  if (nearbyLinkCount >= 4) score += 10;
  else if (nearbyLinkCount >= 2) score += 6;
  else score += 2;
  return Math.min(score, 100);
}

// ── Hook ──

export function useSeoLocationBlueprint() {
  return useMutation({
    mutationFn: async (input: BlueprintInput): Promise<SeoLocationBlueprint> => {
      const { data, error } = await supabase.rpc('generate_seo_location_blueprint', {
        p_province: input.province || '',
        p_city: input.city || '',
        p_district: input.district || '',
        p_village: input.village || '',
      });
      if (error) throw error;
      return data as unknown as SeoLocationBlueprint;
    },
  });
}
