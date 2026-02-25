import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AdvancedRentalFilters } from "@/components/rental/RentalSidebarFilters";

export interface AdvancedFilterParams {
  filters: AdvancedRentalFilters;
  page: number;
  pageSize: number;
}

export interface FilteredPropertyResult {
  id: string;
  title: string;
  description: string;
  price: number;
  property_type: string;
  listing_type: string;
  location: string;
  city: string;
  area: string;
  state: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  images: string[];
  image_urls: string[];
  status: string;
  created_at: string;
  rental_periods: string[];
  minimum_rental_days: number;
  online_booking_enabled: boolean;
  booking_type: string;
  thumbnail_url: string;
  three_d_model_url: string;
  virtual_tour_url: string;
  land_area_sqm: number;
  building_area_sqm: number;
  floors: number;
  has_pool: boolean;
  garage_count: number;
  view_type: string;
  furnishing: string;
  roi_percentage: number;
  rental_yield_percentage: number;
  legal_status: string;
  wna_eligible: boolean;
  payment_plan_available: boolean;
  handover_year: number;
  has_vr: boolean;
  has_360_view: boolean;
  has_drone_video: boolean;
  has_interactive_floorplan: boolean;
  development_status: string;
}

const buildFilteredQuery = (filters: AdvancedRentalFilters, page: number, pageSize: number) => {
  let query = supabase
    .from("properties")
    .select(
      `id, title, description, price, property_type, listing_type, location, city, area, state,
       bedrooms, bathrooms, area_sqm, images, image_urls, status, created_at,
       rental_periods, minimum_rental_days, online_booking_enabled, booking_type,
       thumbnail_url, three_d_model_url, virtual_tour_url,
       land_area_sqm, building_area_sqm, floors, has_pool, garage_count, view_type, furnishing,
       roi_percentage, rental_yield_percentage, legal_status, wna_eligible,
       payment_plan_available, handover_year,
       has_vr, has_360_view, has_drone_video, has_interactive_floorplan, development_status`,
      { count: "exact" }
    )
    .eq("status", "active");

  // Search
  if (filters.searchTerm) {
    query = query.or(
      `title.ilike.%${filters.searchTerm}%,location.ilike.%${filters.searchTerm}%,city.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`
    );
  }

  // Location
  if (filters.province && filters.province !== "all") {
    query = query.ilike("state", `%${filters.province}%`);
  }
  if (filters.city && filters.city !== "all") {
    query = query.eq("city", filters.city);
  }
  if (filters.area) {
    query = query.ilike("area", `%${filters.area}%`);
  }

  // Listing status
  if (filters.listingStatus && filters.listingStatus !== "all") {
    if (filters.listingStatus === "freehold" || filters.listingStatus === "leasehold") {
      query = query.eq("legal_status", filters.listingStatus);
    } else if (filters.listingStatus === "off-plan") {
      query = query.eq("development_status", "off-plan");
    } else {
      query = query.eq("listing_type", filters.listingStatus);
    }
  }

  // Property type
  if (filters.propertyType && filters.propertyType !== "all") {
    query = query.eq("property_type", filters.propertyType);
  }

  // Price
  if (filters.minPrice > 0) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice < 100_000_000) query = query.lte("price", filters.maxPrice);

  // Bedrooms / bathrooms
  if (filters.bedrooms && filters.bedrooms !== "all") {
    if (filters.bedrooms === "5+") query = query.gte("bedrooms", 5);
    else query = query.eq("bedrooms", parseInt(filters.bedrooms));
  }
  if (filters.bathrooms && filters.bathrooms !== "all") {
    if (filters.bathrooms === "4+") query = query.gte("bathrooms", 4);
    else query = query.eq("bathrooms", parseInt(filters.bathrooms));
  }

  // Indonesian specs
  if (filters.minLandArea > 0) query = query.gte("land_area_sqm", filters.minLandArea);
  if (filters.maxLandArea < 5000) query = query.lte("land_area_sqm", filters.maxLandArea);
  if (filters.minBuildingArea > 0) query = query.gte("building_area_sqm", filters.minBuildingArea);
  if (filters.maxBuildingArea < 2000) query = query.lte("building_area_sqm", filters.maxBuildingArea);

  if (filters.floors && filters.floors !== "all") {
    if (filters.floors === "4+") query = query.gte("floors", 4);
    else query = query.eq("floors", parseInt(filters.floors));
  }

  if (filters.hasPool) query = query.eq("has_pool", true);

  if (filters.garageCount && filters.garageCount !== "all") {
    if (filters.garageCount === "3+") query = query.gte("garage_count", 3);
    else query = query.eq("garage_count", parseInt(filters.garageCount));
  }

  if (filters.viewType && filters.viewType !== "all") {
    query = query.eq("view_type", filters.viewType);
  }

  if (filters.furnishing && filters.furnishing !== "all") {
    query = query.eq("furnishing", filters.furnishing);
  }

  // Investment
  if (filters.minRoi > 0) query = query.gte("roi_percentage", filters.minRoi);
  if (filters.maxRoi < 50) query = query.lte("roi_percentage", filters.maxRoi);
  if (filters.minYield > 0) query = query.gte("rental_yield_percentage", filters.minYield);
  if (filters.maxYield < 30) query = query.lte("rental_yield_percentage", filters.maxYield);

  if (filters.legalStatus && filters.legalStatus !== "all") {
    query = query.eq("legal_status", filters.legalStatus);
  }
  if (filters.foreignOwnershipFriendly) query = query.eq("wna_eligible", true);
  if (filters.paymentPlanAvailable) query = query.eq("payment_plan_available", true);

  if (filters.handoverYear && filters.handoverYear !== "all") {
    if (filters.handoverYear === "2028") query = query.gte("handover_year", 2028);
    else query = query.eq("handover_year", parseInt(filters.handoverYear));
  }

  // Technology
  if (filters.has3DTour) query = query.not("three_d_model_url", "is", null);
  if (filters.hasVR) query = query.eq("has_vr", true);
  if (filters.has360View) query = query.eq("has_360_view", true);
  if (filters.hasDroneVideo) query = query.eq("has_drone_video", true);
  if (filters.hasInteractiveFloorplan) query = query.eq("has_interactive_floorplan", true);

  // Online booking
  if (filters.onlineBookingOnly) query = query.eq("online_booking_enabled", true);

  // Sorting
  switch (filters.sortBy) {
    case "price_low": query = query.order("price", { ascending: true }); break;
    case "price_high": query = query.order("price", { ascending: false }); break;
    case "oldest": query = query.order("created_at", { ascending: true }); break;
    case "roi_high": query = query.order("roi_percentage", { ascending: false, nullsFirst: false }); break;
    case "yield_high": query = query.order("rental_yield_percentage", { ascending: false, nullsFirst: false }); break;
    default: query = query.order("created_at", { ascending: false }); break;
  }

  // Pagination
  const from = (page - 1) * pageSize;
  query = query.range(from, from + pageSize - 1);

  return query;
};

export const useAdvancedPropertyFilters = ({ filters, page, pageSize }: AdvancedFilterParams) => {
  return useQuery({
    queryKey: ["advanced-properties", filters, page, pageSize],
    queryFn: async () => {
      const { data, error, count } = await buildFilteredQuery(filters, page, pageSize);

      if (error) {
        console.error("Advanced filter query error:", error);
        throw error;
      }

      return {
        properties: (data || []) as FilteredPropertyResult[],
        totalCount: count || 0,
      };
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};
