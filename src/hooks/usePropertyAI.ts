/**
 * AI Property Intelligence Hook
 * Provides React hooks for ML-powered property features
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import aiPropertyService, {
  PropertyPrediction,
  SmartMatch,
  AIInsight,
  UserPreferenceProfile
} from '@/services/ai/AIPropertyService';

export function usePropertyRecommendations(options: { limit?: number; enabled?: boolean } = {}) {
  const { user } = useAuth();
  const { limit = 10, enabled = true } = options;

  return useQuery({
    queryKey: ['property-recommendations', user?.id, limit],
    queryFn: () => aiPropertyService.getRecommendations(user!.id, { limit, includeDiscovery: true }),
    enabled: enabled && !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });
}

export function usePricePrediction(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['price-prediction', propertyId],
    queryFn: () => aiPropertyService.predictPrice(propertyId!),
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000
  });
}

export function usePropertyInsights(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['property-insights', propertyId],
    queryFn: () => aiPropertyService.getPropertyInsights(propertyId!),
    enabled: !!propertyId,
    staleTime: 5 * 60 * 1000
  });
}

export function useSimilarProperties(propertyId: string | undefined, limit = 5) {
  return useQuery({
    queryKey: ['similar-properties', propertyId, limit],
    queryFn: () => aiPropertyService.getSimilarProperties(propertyId!, limit),
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000
  });
}

export function useMarketTrends(location: string | undefined) {
  return useQuery({
    queryKey: ['market-trends', location],
    queryFn: () => aiPropertyService.getMarketTrends(location!),
    enabled: !!location && location.length > 2,
    staleTime: 30 * 60 * 1000
  });
}

export function useUserPreferenceProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-preference-profile', user?.id],
    queryFn: () => aiPropertyService.getUserProfile(user!.id),
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000
  });
}

export function useAIDescriptionGenerator() {
  return useMutation({
    mutationFn: (propertyData: {
      title: string;
      propertyType: string;
      location: string;
      bedrooms: number;
      bathrooms: number;
      area: number;
      features: string[];
      price: number;
    }) => aiPropertyService.generateDescription(propertyData)
  });
}

export function useImageAnalysis() {
  return useMutation({
    mutationFn: (imageUrls: string[]) => aiPropertyService.analyzeImages(imageUrls)
  });
}

// Compound hook for property detail page with all AI features
export function usePropertyAI(propertyId: string | undefined) {
  const prediction = usePricePrediction(propertyId);
  const insights = usePropertyInsights(propertyId);
  const similar = useSimilarProperties(propertyId);

  return {
    prediction: prediction.data,
    insights: insights.data || [],
    similarProperties: similar.data || [],
    isLoading: prediction.isLoading || insights.isLoading || similar.isLoading,
    error: prediction.error || insights.error || similar.error
  };
}

// Hook for dashboard with recommendations and trends
export function useDashboardAI(location?: string) {
  const { user } = useAuth();
  const recommendations = usePropertyRecommendations({ limit: 6 });
  const trends = useMarketTrends(location);
  const profile = useUserPreferenceProfile();

  return {
    recommendations: recommendations.data || [],
    marketTrends: trends.data,
    userProfile: profile.data,
    isLoading: recommendations.isLoading || trends.isLoading,
    refetch: () => {
      recommendations.refetch();
      trends.refetch();
    }
  };
}
