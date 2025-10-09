
export interface SearchData {
  query?: string;
  state?: string;
  city?: string;
  area?: string;
  location?: string;
  propertyType?: string;
  listingType?: string;
  priceRange?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: string;
  bathrooms?: string;
  parking?: string;
  furnishing?: string;
  amenities?: string[];
  features?: string[];
  developmentStatus?: string;
  certificateType?: string;
  buildingAge?: string;
  rentalPeriod?: string;
  floorLevel?: string;
  buildingOrientation?: string;
  minArea?: number;
  maxArea?: number;
  has3D?: boolean;
  hasVirtualTour?: boolean;
  sortBy?: string;
}

export interface SearchFilters extends SearchData {
  // All search filters are now in SearchData
}
