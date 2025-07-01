
// Shared property types to avoid conflicts across components
export interface BaseProperty {
  id: string;
  title: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area_sqm?: number;
  property_type?: string;
  listing_type: 'sale' | 'rent' | 'lease';
  images?: string[];
  thumbnail_url?: string;
  description?: string;
  three_d_model_url?: string;
  virtual_tour_url?: string;
  state?: string;
  city?: string;
  property_features?: Record<string, any>;
  image_urls?: string[];
}

// For components that need additional fields
export interface ExtendedProperty extends BaseProperty {
  rating?: number;
  featured?: boolean;
  isHotDeal?: boolean;
  agent_id?: string;
  owner_id?: string;
  status?: string;
}

// For legacy components (will be phased out)
export interface LegacyProperty {
  id: number;
  title: string;
  location: string;
  price: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  image: string;
  rating?: number;
  featured?: boolean;
  description?: string;
  three_d_model_url?: string;
  virtual_tour_url?: string;
}

// Common props for property card components
export interface PropertyCardProps {
  property: BaseProperty;
  language?: "en" | "id";
  onView?: (id: string) => void;
  isSaved?: boolean;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onView3D?: (property: BaseProperty) => void;
}
