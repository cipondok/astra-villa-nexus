/**
 * AI Recommendations Hook - Provides recommendation data and actions
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface MatchReason {
  factor: string;
  score: number;
  explanation: string;
  weight: number;
}

interface Recommendation {
  id: string;
  title: string;
  price: number;
  city: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  property_type: string;
  thumbnail_url: string;
  images: string[];
  overallScore: number;
  preferenceScore: number;
  discoveryScore: number;
  matchReasons: MatchReason[];
  aiExplanation: string | null;
  matchPercentage: number;
  isDiscovery: boolean;
}

interface UserInsights {
  preferredLocations: string[];
  budgetRange: { min: number; max: number };
  topPropertyTypes: string[];
}

interface DiscoveryInsight {
  title: string;
  description: string;
  suggestion: string;
}

export function useAIRecommendations(limit = 10) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch recommendations
  const {
    data: recommendationsData,
    isLoading: isLoadingRecommendations,
    error: recommendationsError,
    refetch: refetchRecommendations
  } = useQuery({
    queryKey: ['ai-recommendations', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase.functions.invoke('ai-property-recommendations', {
        body: {
          action: 'get_ai_recommendations',
          userId: user.id,
          limit
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  // Fetch discovery insights
  const {
    data: insightsData,
    isLoading: isLoadingInsights
  } = useQuery({
    queryKey: ['ai-discovery-insights', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase.functions.invoke('ai-property-recommendations', {
        body: {
          action: 'get_discovery_insights',
          userId: user.id
        }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000
  });

  // Get detailed match explanation
  const explainMatchMutation = useMutation({
    mutationFn: async (propertyId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('ai-property-recommendations', {
        body: {
          action: 'explain_match',
          userId: user.id,
          propertyId
        }
      });

      if (error) throw error;
      return data;
    },
    onError: (error) => {
      console.error('Failed to get match explanation:', error);
      toast.error('Failed to get match explanation');
    }
  });

  // Record behavior signal
  const recordSignalMutation = useMutation({
    mutationFn: async ({
      propertyId,
      signalType,
      signalData
    }: {
      propertyId: string;
      signalType: string;
      signalData?: any;
    }) => {
      if (!user?.id) return;

      await supabase.from('user_behavior_signals').insert({
        user_id: user.id,
        property_id: propertyId,
        signal_type: signalType,
        signal_data: signalData || {}
      });
    },
    onSuccess: () => {
      // Invalidate recommendations after significant signals
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
    }
  });

  const recommendations: Recommendation[] = recommendationsData?.recommendations || [];
  const userInsights: UserInsights | null = recommendationsData?.userInsights || null;
  const discoveryInsights: DiscoveryInsight[] = insightsData?.insights || [];
  const behaviorPatterns = insightsData?.patterns || null;

  return {
    // Recommendations
    recommendations,
    isLoadingRecommendations,
    recommendationsError,
    refetchRecommendations,

    // User insights
    userInsights,
    
    // Discovery insights
    discoveryInsights,
    behaviorPatterns,
    isLoadingInsights,

    // Actions
    explainMatch: explainMatchMutation.mutateAsync,
    isExplainingMatch: explainMatchMutation.isPending,
    
    recordSignal: recordSignalMutation.mutate,

    // Metadata
    meta: recommendationsData?.meta || null,

    // Helper to check if we have enough data
    hasEnoughData: recommendations.length > 0,
    
    // Get preference vs discovery split
    preferenceMatches: recommendations.filter(r => !r.isDiscovery),
    discoveryMatches: recommendations.filter(r => r.isDiscovery)
  };
}

export default useAIRecommendations;
