import { supabase } from '@/integrations/supabase/client';

interface SearchTrackingData {
  search_query: string | null;
  search_filters: Record<string, any>;
  results_count: number;
  response_time_ms: number;
  cache_hit?: boolean;
}

// Generate or retrieve visitor ID for anonymous tracking
const getVisitorId = (): string => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

// Get or create session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

export const trackSearch = async (data: SearchTrackingData): Promise<void> => {
  try {
    // Get current user if authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    const visitorId = getVisitorId();
    const sessionId = getSessionId();

    // Insert directly to search_analytics table
    const { error } = await supabase
      .from('search_analytics')
      .insert({
        visitor_id: visitorId,
        user_id: user?.id || null,
        search_query: data.search_query,
        search_filters: data.search_filters,
        results_count: data.results_count,
        response_time_ms: data.response_time_ms,
        cache_hit: data.cache_hit || false,
        session_id: sessionId
      });

    if (error) {
      console.warn('Failed to track search (non-critical):', error.message);
    } else {
      console.log('Search tracked successfully');
    }
  } catch (error) {
    // Non-critical - don't break the app if tracking fails
    console.warn('Search tracking error:', error);
  }
};

export const trackSearchClick = async (searchId: string, propertyId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('search_analytics')
      .update({ clicked_result_id: propertyId })
      .eq('id', searchId);

    if (error) {
      console.warn('Failed to track click:', error.message);
    }
  } catch (error) {
    console.warn('Click tracking error:', error);
  }
};
