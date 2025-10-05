import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserInteraction {
  id?: string;
  user_id?: string;
  property_id?: string;
  interaction_type: 'view' | 'save' | 'search' | 'share' | 'contact' | 'visit_3d' | 'click';
  interaction_data: Record<string, any>;
  session_id?: string;
  created_at?: string;
}

interface UserBehaviorMetrics {
  viewingPatterns: {
    avgTimeOnProperty: number;
    preferredPropertyTypes: string[];
    priceRangeInterest: { min: number; max: number };
    locationPreferences: string[];
  };
  searchPatterns: {
    frequentQueries: string[];
    filterUsage: Record<string, number>;
    searchTiming: string[];
  };
  engagementScore: number;
  intentScore: number;
  recommendationFactors: Record<string, number>;
}

interface BehaviorAnalysisOptions {
  timeRange?: 'day' | 'week' | 'month' | 'all';
  includeAnonymous?: boolean;
  groupBySession?: boolean;
}

export function useUserBehaviorAnalytics() {
  const [currentSession] = useState(() => 
    sessionStorage.getItem('user_session') || crypto.randomUUID()
  );
  const [isTracking, setIsTracking] = useState(true);
  
  useEffect(() => {
    sessionStorage.setItem('user_session', currentSession);
  }, [currentSession]);

  // Step 1: Track user interactions
  const trackInteraction = useCallback(async (interaction: UserInteraction) => {
    if (!isTracking) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Only insert if user is logged in (user_id must be valid UUID, not undefined)
      if (!user?.id) {
        console.debug('Skipping interaction tracking: user not authenticated');
        return;
      }

      const interactionData = {
        ...interaction,
        user_id: user.id,
        session_id: currentSession,
        interaction_data: {
          ...interaction.interaction_data,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer,
          page_url: window.location.href
        }
      };

      const { error } = await supabase
        .from('user_interactions')
        .insert(interactionData);

      if (error) console.warn('Failed to track interaction:', error);
    } catch (error) {
      console.warn('Interaction tracking error:', error);
    }
  }, [currentSession, isTracking]);

  // Step 2: Track property views with time spent
  const trackPropertyView = useCallback(async (propertyId: string, startTime?: number) => {
    const viewStartTime = startTime || Date.now();
    let isViewActive = true;

    // Track view start
    await trackInteraction({
      interaction_type: 'view',
      property_id: propertyId,
      interaction_data: {
        view_start: viewStartTime,
        view_type: 'property_detail'
      }
    });

    // Return cleanup function to track view duration
    return () => {
      if (isViewActive) {
        const viewDuration = Date.now() - viewStartTime;
        trackInteraction({
          interaction_type: 'view',
          property_id: propertyId,
          interaction_data: {
            view_duration: viewDuration,
            view_end: Date.now(),
            engagement_level: calculateEngagementLevel(viewDuration)
          }
        });
        isViewActive = false;
      }
    };
  }, [trackInteraction]);

  // Step 3: Track search behavior
  const trackSearch = useCallback(async (searchQuery: string, filters: any, resultsCount: number) => {
    await trackInteraction({
      interaction_type: 'search',
      interaction_data: {
        search_query: searchQuery,
        filters_applied: filters,
        results_count: resultsCount,
        search_timestamp: Date.now()
      }
    });
  }, [trackInteraction]);

  // Step 4: Get user behavior analysis
  const analyzeBehavior = useCallback(async (
    userId?: string, 
    options: BehaviorAnalysisOptions = {}
  ): Promise<UserBehaviorMetrics | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('user-behavior-analyzer', {
        body: {
          userId,
          sessionId: !userId ? currentSession : undefined,
          options
        }
      });

      if (error) throw error;
      return data?.metrics || null;
    } catch (error) {
      console.error('Behavior analysis failed:', error);
      return null;
    }
  }, [currentSession]);

  // Step 5: Get personalized insights
  const getPersonalizedInsights = useCallback(async (userId?: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('user-behavior-analyzer', {
        body: {
          userId,
          sessionId: !userId ? currentSession : undefined,
          requestType: 'insights'
        }
      });

      if (error) throw error;
      return data?.insights || [];
    } catch (error) {
      console.error('Failed to get insights:', error);
      return [];
    }
  }, [currentSession]);

  // Step 6: Batch track multiple interactions
  const batchTrackInteractions = useCallback(async (interactions: UserInteraction[]) => {
    if (!isTracking || !interactions.length) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Only batch insert if user is authenticated
      if (!user?.id) {
        console.debug('Skipping batch tracking: user not authenticated');
        return;
      }

      const batchData = interactions.map(interaction => ({
        ...interaction,
        user_id: user.id,
        session_id: currentSession,
        interaction_data: {
          ...interaction.interaction_data,
          batch_timestamp: new Date().toISOString()
        }
      }));

      const { error } = await supabase
        .from('user_interactions')
        .insert(batchData);

      if (error) console.warn('Batch tracking failed:', error);
    } catch (error) {
      console.warn('Batch tracking error:', error);
    }
  }, [currentSession, isTracking]);

  return {
    trackInteraction,
    trackPropertyView,
    trackSearch,
    analyzeBehavior,
    getPersonalizedInsights,
    batchTrackInteractions,
    sessionId: currentSession,
    setTracking: setIsTracking,
    isTracking
  };
}

// Helper function to calculate engagement level
function calculateEngagementLevel(duration: number): 'low' | 'medium' | 'high' {
  if (duration < 30000) return 'low';      // < 30 seconds
  if (duration < 120000) return 'medium';  // < 2 minutes
  return 'high';                           // >= 2 minutes
}

// Hook for page-level analytics
export function usePageAnalytics(pageName: string) {
  const { trackInteraction } = useUserBehaviorAnalytics();
  const [pageStartTime] = useState(Date.now());

  useEffect(() => {
    // Track page view
    trackInteraction({
      interaction_type: 'view',
      interaction_data: {
        page_name: pageName,
        page_start: pageStartTime
      }
    });

    // Track page exit on unmount
    return () => {
      const timeSpent = Date.now() - pageStartTime;
      trackInteraction({
        interaction_type: 'view',
        interaction_data: {
          page_name: pageName,
          time_spent: timeSpent,
          page_end: Date.now()
        }
      });
    };
  }, [pageName, pageStartTime, trackInteraction]);

  return { trackInteraction };
}