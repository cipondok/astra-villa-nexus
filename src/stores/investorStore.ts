/**
 * Investor Store — Tracks investor metrics and interactions.
 * Consumes investorService, decoupled from UI.
 */
import { create } from 'zustand';
import {
  fetchInvestorMetrics,
  fetchSavedProperties,
  trackInteraction,
  type InvestorMetrics,
  type InvestorInteraction,
} from '@/services/investorService';

interface InvestorState {
  metrics: InvestorMetrics;
  savedPropertyIds: string[];
  isLoading: boolean;

  // Actions
  loadMetrics: () => Promise<void>;
  loadSavedProperties: () => Promise<void>;
  trackEvent: (propertyId: string, type: InvestorInteraction['interaction_type'], metadata?: Record<string, unknown>) => Promise<void>;
}

export const useInvestorStore = create<InvestorState>((set) => ({
  metrics: { totalConversations: 0, activeDeals: 0, totalReplies: 0, conversionRate: 0 },
  savedPropertyIds: [],
  isLoading: false,

  loadMetrics: async () => {
    set({ isLoading: true });
    try {
      const metrics = await fetchInvestorMetrics();
      set({ metrics, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  loadSavedProperties: async () => {
    try {
      const ids = await fetchSavedProperties();
      set({ savedPropertyIds: ids });
    } catch {}
  },

  trackEvent: async (propertyId, type, metadata) => {
    await trackInteraction(propertyId, type, metadata);
    // Refresh metrics after tracking
    const metrics = await fetchInvestorMetrics();
    set({ metrics });
  },
}));
