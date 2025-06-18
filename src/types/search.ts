
export interface SearchData {
  query?: string;
  state?: string;
  city?: string;
  location?: string;
  propertyType?: string;
  priceRange?: string;
  bedrooms?: string;
  bathrooms?: string;
  furnishing?: string;
  amenities?: string[];
  has3D?: boolean;
}

export interface SearchFilters extends SearchData {
  // Additional filters can be added here
}
