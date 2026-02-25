import { describe, it, expect } from "vitest";

/**
 * Tests for the property filter-to-backend pipeline.
 * Validates that form data mappings and filter counting logic are correct.
 */

// Simulated form data shape matching PropertyFormData
const createMockFormData = (overrides: Record<string, any> = {}) => ({
  title: "Test Villa Bali",
  description: "Luxury villa in Seminyak",
  property_type: "villa",
  listing_type: "rent",
  price: "5000000",
  bedrooms: "3",
  bathrooms: "2",
  area_sqm: "250",
  location: "Jl. Raya Seminyak",
  city: "Denpasar",
  state: "Bali",
  area: "Seminyak",
  development_status: "completed",
  owner_type: "individual",
  status: "active",
  seo_title: "",
  seo_description: "",
  property_features: {},
  rental_periods: ["monthly"],
  minimum_rental_days: "30",
  online_booking_enabled: true,
  booking_type: "astra_villa",
  advance_booking_days: "7",
  rental_terms: "",
  available_from: "",
  available_until: "",
  nearby_facilities: ["beach", "restaurant", "shopping_mall"],
  payment_methods: ["online", "bank_transfer"],
  land_area_sqm: "300",
  building_area_sqm: "200",
  floors: "2",
  has_pool: true,
  garage_count: "1",
  view_type: "ocean",
  furnishing: "furnished",
  roi_percentage: "8.5",
  rental_yield_percentage: "6.2",
  legal_status: "shm",
  wna_eligible: true,
  payment_plan_available: false,
  handover_year: "2026",
  has_vr: true,
  has_360_view: false,
  has_drone_video: true,
  has_interactive_floorplan: false,
  ...overrides,
});

// Replicate the property data transformation from RoleBasedPropertyForm
const transformFormToPropertyData = (data: ReturnType<typeof createMockFormData>) => ({
  title: data.title,
  description: data.description,
  property_type: data.property_type,
  listing_type: data.listing_type,
  price: data.price ? parseFloat(data.price) : null,
  bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
  bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
  area_sqm: data.area_sqm ? parseInt(data.area_sqm) : null,
  nearby_facilities: data.nearby_facilities || [],
  payment_methods: data.payment_methods || [],
  land_area_sqm: data.land_area_sqm ? parseFloat(data.land_area_sqm) : null,
  building_area_sqm: data.building_area_sqm ? parseFloat(data.building_area_sqm) : null,
  floors: data.floors ? parseInt(data.floors) : null,
  has_pool: data.has_pool,
  garage_count: data.garage_count ? parseInt(data.garage_count) : null,
  view_type: data.view_type || null,
  furnishing: data.furnishing || null,
  roi_percentage: data.roi_percentage ? parseFloat(data.roi_percentage) : null,
  rental_yield_percentage: data.rental_yield_percentage ? parseFloat(data.rental_yield_percentage) : null,
  legal_status: data.legal_status || null,
  wna_eligible: data.wna_eligible,
  payment_plan_available: data.payment_plan_available,
  handover_year: data.handover_year ? parseInt(data.handover_year) : null,
  has_vr: data.has_vr,
  has_360_view: data.has_360_view,
  has_drone_video: data.has_drone_video,
  has_interactive_floorplan: data.has_interactive_floorplan,
});

// Replicate the mobile filter active count logic from RentalMobileFilterSheet
const countActiveFilters = (filters: Record<string, any>) => {
  return [
    filters.searchTerm,
    filters.propertyType !== "all" ? filters.propertyType : "",
    filters.province && filters.province !== "all" ? "prov" : "",
    filters.city !== "all" ? filters.city : "",
    filters.area ? "area" : "",
    filters.listingStatus && filters.listingStatus !== "all" ? "status" : "",
    filters.rentalPeriod?.length > 0 ? "period" : "",
    filters.onlineBookingOnly ? "online" : "",
    filters.bedrooms !== "all" ? "bed" : "",
    filters.bathrooms !== "all" ? "bath" : "",
    filters.minPrice > 0 ? "minp" : "",
    filters.maxPrice < 100_000_000 ? "maxp" : "",
    filters.furnishing && filters.furnishing !== "all" ? "furn" : "",
    filters.minLandArea > 0 ? "mla" : "",
    filters.maxLandArea < 5000 ? "xla" : "",
    filters.minBuildingArea > 0 ? "mba" : "",
    filters.maxBuildingArea < 2000 ? "xba" : "",
    filters.floors && filters.floors !== "all" ? "fl" : "",
    filters.hasPool ? "pool" : "",
    filters.garageCount && filters.garageCount !== "all" ? "gar" : "",
    filters.viewType && filters.viewType !== "all" ? "view" : "",
    filters.minRoi > 0 ? "roi" : "",
    filters.minYield > 0 ? "yield" : "",
    filters.legalStatus && filters.legalStatus !== "all" ? "legal" : "",
    filters.foreignOwnershipFriendly ? "wna" : "",
    filters.paymentPlanAvailable ? "payplan" : "",
    filters.handoverYear && filters.handoverYear !== "all" ? "handover" : "",
    filters.has3DTour ? "3d" : "",
    filters.hasVR ? "vr" : "",
    filters.has360View ? "360" : "",
    filters.hasDroneVideo ? "drone" : "",
    filters.hasInteractiveFloorplan ? "floorplan" : "",
    (filters.nearbyFacilities || []).length > 0 ? "nearby" : "",
    filters.paymentMethod && filters.paymentMethod !== "all" ? "pay" : "",
  ].filter(Boolean).length;
};

describe("PropertyFormData transformation", () => {
  it("correctly transforms string fields to numeric types", () => {
    const form = createMockFormData();
    const result = transformFormToPropertyData(form);

    expect(result.price).toBe(5000000);
    expect(result.bedrooms).toBe(3);
    expect(result.bathrooms).toBe(2);
    expect(result.area_sqm).toBe(250);
    expect(result.land_area_sqm).toBe(300);
    expect(result.building_area_sqm).toBe(200);
    expect(result.floors).toBe(2);
    expect(result.garage_count).toBe(1);
    expect(result.roi_percentage).toBe(8.5);
    expect(result.rental_yield_percentage).toBe(6.2);
    expect(result.handover_year).toBe(2026);
  });

  it("handles empty string fields as null", () => {
    const form = createMockFormData({
      land_area_sqm: "",
      building_area_sqm: "",
      floors: "",
      garage_count: "",
      roi_percentage: "",
      rental_yield_percentage: "",
      handover_year: "",
      view_type: "",
      furnishing: "",
      legal_status: "",
    });
    const result = transformFormToPropertyData(form);

    expect(result.land_area_sqm).toBeNull();
    expect(result.building_area_sqm).toBeNull();
    expect(result.floors).toBeNull();
    expect(result.garage_count).toBeNull();
    expect(result.roi_percentage).toBeNull();
    expect(result.rental_yield_percentage).toBeNull();
    expect(result.handover_year).toBeNull();
    expect(result.view_type).toBeNull();
    expect(result.furnishing).toBeNull();
    expect(result.legal_status).toBeNull();
  });

  it("preserves boolean fields correctly", () => {
    const form = createMockFormData();
    const result = transformFormToPropertyData(form);

    expect(result.has_pool).toBe(true);
    expect(result.wna_eligible).toBe(true);
    expect(result.payment_plan_available).toBe(false);
    expect(result.has_vr).toBe(true);
    expect(result.has_360_view).toBe(false);
    expect(result.has_drone_video).toBe(true);
    expect(result.has_interactive_floorplan).toBe(false);
  });

  it("preserves array fields (nearby_facilities, payment_methods)", () => {
    const form = createMockFormData();
    const result = transformFormToPropertyData(form);

    expect(result.nearby_facilities).toEqual(["beach", "restaurant", "shopping_mall"]);
    expect(result.payment_methods).toEqual(["online", "bank_transfer"]);
  });
});

describe("Mobile filter active count", () => {
  it("returns 0 for default/empty filters", () => {
    const defaultFilters = {
      searchTerm: "",
      propertyType: "all",
      province: "all",
      city: "all",
      area: "",
      listingStatus: "all",
      rentalPeriod: [],
      onlineBookingOnly: false,
      bedrooms: "all",
      bathrooms: "all",
      minPrice: 0,
      maxPrice: 100_000_000,
      furnishing: "all",
      minLandArea: 0,
      maxLandArea: 5000,
      minBuildingArea: 0,
      maxBuildingArea: 2000,
      floors: "all",
      hasPool: false,
      garageCount: "all",
      viewType: "all",
      minRoi: 0,
      minYield: 0,
      legalStatus: "all",
      foreignOwnershipFriendly: false,
      paymentPlanAvailable: false,
      handoverYear: "all",
      has3DTour: false,
      hasVR: false,
      has360View: false,
      hasDroneVideo: false,
      hasInteractiveFloorplan: false,
      nearbyFacilities: [],
      paymentMethod: "all",
    };
    expect(countActiveFilters(defaultFilters)).toBe(0);
  });

  it("counts multiple active filters correctly", () => {
    const activeFilters = {
      searchTerm: "villa",
      propertyType: "villa",
      province: "Bali",
      city: "Denpasar",
      area: "Seminyak",
      listingStatus: "rent",
      rentalPeriod: ["monthly"],
      onlineBookingOnly: true,
      bedrooms: "3",
      bathrooms: "2",
      minPrice: 1000000,
      maxPrice: 50000000,
      furnishing: "furnished",
      minLandArea: 100,
      maxLandArea: 5000,
      minBuildingArea: 0,
      maxBuildingArea: 2000,
      floors: "2",
      hasPool: true,
      garageCount: "1",
      viewType: "ocean",
      minRoi: 5,
      minYield: 3,
      legalStatus: "shm",
      foreignOwnershipFriendly: true,
      paymentPlanAvailable: true,
      handoverYear: "2026",
      has3DTour: true,
      hasVR: true,
      has360View: true,
      hasDroneVideo: true,
      hasInteractiveFloorplan: true,
      nearbyFacilities: ["beach"],
      paymentMethod: "online",
    };
    // All 34 filters active
    expect(countActiveFilters(activeFilters)).toBe(34);
  });

  it("counts nearby facilities as single filter entry", () => {
    const filters = {
      searchTerm: "",
      propertyType: "all",
      province: "all",
      city: "all",
      area: "",
      listingStatus: "all",
      rentalPeriod: [],
      onlineBookingOnly: false,
      bedrooms: "all",
      bathrooms: "all",
      minPrice: 0,
      maxPrice: 100_000_000,
      furnishing: "all",
      minLandArea: 0,
      maxLandArea: 5000,
      minBuildingArea: 0,
      maxBuildingArea: 2000,
      floors: "all",
      hasPool: false,
      garageCount: "all",
      viewType: "all",
      minRoi: 0,
      minYield: 0,
      legalStatus: "all",
      foreignOwnershipFriendly: false,
      paymentPlanAvailable: false,
      handoverYear: "all",
      has3DTour: false,
      hasVR: false,
      has360View: false,
      hasDroneVideo: false,
      hasInteractiveFloorplan: false,
      nearbyFacilities: ["beach", "restaurant", "hospital"],
      paymentMethod: "all",
    };
    expect(countActiveFilters(filters)).toBe(1);
  });
});
