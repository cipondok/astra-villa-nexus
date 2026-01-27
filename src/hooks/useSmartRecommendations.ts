import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPreferences {
  minBudget?: number;
  maxBudget?: number;
  preferredLocations: string[];
  preferredPropertyTypes: string[];
  minBedrooms?: number;
  maxBedrooms?: number;
  mustHaveFeatures: string[];
  dealBreakers: string[];
}

export interface MatchReason {
  factor: string;
  score: number;
  explanation: string;
  weight: number;
}

export interface PropertyRecommendation {
  propertyId: string;
  overallScore: number;
  preferenceScore: number;
  discoveryScore: number;
  matchReasons: MatchReason[];
  discoveryReasons?: MatchReason[];
  isDiscoveryMatch: boolean;
  property: any;
}

export interface UserProfile {
  explicit: UserPreferences;
  implicit: {
    viewedPriceRange: { min: number; max: number };
    dwellTimeByType: Record<string, number>;
    locationClusters: string[];
    featureAffinities: Record<string, number>;
    stylePreferences: string[];
    timePatterns: string[];
  };
  weights: {
    location: number;
    price: number;
    size: number;
    features: number;
    type: number;
  };
  discoveryOpenness: number;
}

export function useSmartRecommendations(limit = 10) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['smart-recommendations', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase.functions.invoke('smart-recommendation-engine', {
        body: { action: 'get_recommendations', userId: user.id, limit }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    recommendations: data?.recommendations as PropertyRecommendation[] || [],
    userProfile: data?.userProfile as UserProfile | null,
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}

export function useUserProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase.functions.invoke('smart-recommendation-engine', {
        body: { action: 'get_user_profile', userId: user.id }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000,
  });
}

export function usePropertyMatchReport(propertyId: string | undefined) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['match-report', user?.id, propertyId],
    queryFn: async () => {
      if (!user?.id || !propertyId) return null;

      const { data, error } = await supabase.functions.invoke('smart-recommendation-engine', {
        body: { action: 'get_match_report', userId: user.id, propertyId }
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!propertyId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBehaviorTracking() {
  const { user } = useAuth();
  const viewStartTime = useRef<number>(0);
  const scrollDepth = useRef<number>(0);
  const photosViewed = useRef<number>(0);
  const sectionsExpanded = useRef<string[]>([]);

  const trackSignal = useMutation({
    mutationFn: async ({ 
      propertyId, 
      signalType, 
      signalData 
    }: { 
      propertyId: string; 
      signalType: string; 
      signalData: any;
    }) => {
      if (!user?.id) return;

      const { error } = await supabase.functions.invoke('smart-recommendation-engine', {
        body: {
          action: 'record_signal',
          userId: user.id,
          propertyId,
          signalType,
          signalData: {
            ...signalData,
            sessionId: sessionStorage.getItem('user_session'),
            deviceType: /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          }
        }
      });

      if (error) throw error;
    }
  });

  const startPropertyView = useCallback((propertyId: string) => {
    viewStartTime.current = Date.now();
    scrollDepth.current = 0;
    photosViewed.current = 0;
    sectionsExpanded.current = [];

    // Track initial view
    trackSignal.mutate({
      propertyId,
      signalType: 'view',
      signalData: { timeSpent: 0 }
    });
  }, [trackSignal]);

  const endPropertyView = useCallback((propertyId: string) => {
    const timeSpent = Math.round((Date.now() - viewStartTime.current) / 1000);
    
    if (timeSpent > 5) {
      trackSignal.mutate({
        propertyId,
        signalType: 'dwell',
        signalData: {
          timeSpent,
          scrollDepth: scrollDepth.current,
          photosViewed: photosViewed.current,
          sectionsExpanded: sectionsExpanded.current,
        }
      });
    }
  }, [trackSignal]);

  const trackScroll = useCallback((depth: number) => {
    scrollDepth.current = Math.max(scrollDepth.current, depth);
  }, []);

  const trackPhotoView = useCallback(() => {
    photosViewed.current += 1;
  }, []);

  const trackSectionExpand = useCallback((sectionName: string) => {
    if (!sectionsExpanded.current.includes(sectionName)) {
      sectionsExpanded.current.push(sectionName);
    }
  }, []);

  const trackSave = useCallback((propertyId: string) => {
    trackSignal.mutate({
      propertyId,
      signalType: 'save',
      signalData: { timeSpent: Math.round((Date.now() - viewStartTime.current) / 1000) }
    });
  }, [trackSignal]);

  const trackInquiry = useCallback((propertyId: string) => {
    trackSignal.mutate({
      propertyId,
      signalType: 'inquiry',
      signalData: { timeSpent: Math.round((Date.now() - viewStartTime.current) / 1000) }
    });
  }, [trackSignal]);

  const trackShare = useCallback((propertyId: string) => {
    trackSignal.mutate({
      propertyId,
      signalType: 'share',
      signalData: {}
    });
  }, [trackSignal]);

  return {
    startPropertyView,
    endPropertyView,
    trackScroll,
    trackPhotoView,
    trackSectionExpand,
    trackSave,
    trackInquiry,
    trackShare,
  };
}

export function usePreferencesUpdate() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<UserPreferences> & Record<string, any>) => {
      if (!user?.id) throw new Error('User not authenticated');

      const dbPreferences = {
        min_budget: preferences.minBudget,
        max_budget: preferences.maxBudget,
        preferred_locations: preferences.preferredLocations,
        preferred_property_types: preferences.preferredPropertyTypes,
        min_bedrooms: preferences.minBedrooms,
        max_bedrooms: preferences.maxBedrooms,
        must_have_features: preferences.mustHaveFeatures,
        deal_breakers: preferences.dealBreakers,
        discovery_openness: preferences.discoveryOpenness,
      };

      const { error } = await supabase.functions.invoke('smart-recommendation-engine', {
        body: {
          action: 'update_preferences',
          userId: user.id,
          preferences: dbPreferences
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    }
  });
}

export function useRecommendationFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recommendationId, feedback }: { recommendationId: string; feedback: string }) => {
      const { error } = await supabase.functions.invoke('smart-recommendation-engine', {
        body: {
          action: 'provide_feedback',
          recommendationId,
          feedback
        }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-recommendations'] });
    }
  });
}
