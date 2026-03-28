/**
 * Property Store — Central state for property listings and active property.
 * Consumes propertyService for data fetching, decoupled from UI.
 */
import { create } from 'zustand';
import {
  fetchProperties,
  fetchPropertyById,
  fetchFeaturedProperties,
  type PropertySummary,
  type PropertyFilters,
} from '@/services/propertyService';

interface PropertyState {
  // Listings
  properties: PropertySummary[];
  totalCount: number;
  filters: PropertyFilters;
  isLoading: boolean;
  error: string | null;

  // Active/selected property (detail view)
  activeProperty: Record<string, unknown> | null;
  activePropertyLoading: boolean;

  // Featured
  featured: PropertySummary[];

  // Actions
  setFilters: (filters: Partial<PropertyFilters>) => void;
  loadProperties: () => Promise<void>;
  loadMore: () => Promise<void>;
  loadPropertyDetail: (id: string) => Promise<void>;
  loadFeatured: () => Promise<void>;
  clearActive: () => void;
}

export const usePropertyStore = create<PropertyState>((set, get) => ({
  properties: [],
  totalCount: 0,
  filters: { limit: 20, offset: 0 },
  isLoading: false,
  error: null,
  activeProperty: null,
  activePropertyLoading: false,
  featured: [],

  setFilters: (newFilters) => {
    set(state => ({ filters: { ...state.filters, ...newFilters, offset: 0 } }));
    get().loadProperties();
  },

  loadProperties: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, count } = await fetchProperties(get().filters);
      set({ properties: data, totalCount: count, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  loadMore: async () => {
    const { filters, properties, totalCount } = get();
    if (properties.length >= totalCount) return;
    const nextOffset = (filters.offset || 0) + (filters.limit || 20);
    try {
      const { data } = await fetchProperties({ ...filters, offset: nextOffset });
      set({ properties: [...properties, ...data], filters: { ...filters, offset: nextOffset } });
    } catch {}
  },

  loadPropertyDetail: async (id: string) => {
    set({ activePropertyLoading: true });
    try {
      const data = await fetchPropertyById(id);
      set({ activeProperty: data as Record<string, unknown>, activePropertyLoading: false });
    } catch (err: any) {
      set({ activePropertyLoading: false, error: err.message });
    }
  },

  loadFeatured: async () => {
    try {
      const data = await fetchFeaturedProperties(6);
      set({ featured: data });
    } catch {}
  },

  clearActive: () => set({ activeProperty: null }),
}));
