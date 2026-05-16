
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { safeUUID } from '@/utils/uuid-validation';

// Generate a visitor ID that persists in localStorage
const getVisitorId = () => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

// Generate a session ID that persists in sessionStorage
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

// Get device type based on user agent
const getDeviceType = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|phone/i.test(userAgent)) {
    return 'mobile';
  } else if (/tablet|ipad/i.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
};

// Get browser name
const getBrowserName = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Other';
};

// Get OS name
const getOSName = () => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Other';
};

export const useAnalyticsTracking = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const trackPageView = async () => {
      try {
        const visitorId = getVisitorId();
        const sessionId = getSessionId();
        
        await supabase.from('web_analytics').insert({
          visitor_id: visitorId,
          user_id: safeUUID(user?.id), // Validate UUID before insert
          page_path: location.pathname + location.search,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          browser: getBrowserName(),
          os: getOSName(),
          session_id: sessionId
        });
      } catch (error) {
        console.error('Error tracking page view:', error);
      }
    };

    trackPageView();
  }, [location, user]);

  // Function to track search queries
  const trackSearch = async (searchQuery: string, filters?: any, resultsCount?: number) => {
    try {
      const visitorId = getVisitorId();
      const sessionId = getSessionId();
      
      await supabase.from('search_analytics').insert({
        visitor_id: visitorId,
        user_id: safeUUID(user?.id), // Validate UUID before insert
        search_query: searchQuery,
        search_filters: filters || null,
        results_count: resultsCount || null,
        session_id: sessionId
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  };

  return { trackSearch };
};
