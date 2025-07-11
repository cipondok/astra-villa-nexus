
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
  // User/Poster information
  posted_by?: {
    id: string;
    name: string;
    avatar_url?: string;
    rating?: number;
    user_level?: string;
    verification_status?: string;
    total_properties?: number;
    joining_date?: string;
    customer_feedback_rating?: number;
    customer_feedback_count?: number;
  };
  // Posting information
  created_at?: string;
  posted_at?: string;
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
