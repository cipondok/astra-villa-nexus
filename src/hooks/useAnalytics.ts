import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ga4, PropertyViewEvent, SearchEvent, BookingEvent, PaymentEvent } from '@/services/analytics/GoogleAnalytics';
import { supabase } from '@/integrations/supabase/client';

// Default GA4 ID - can be overridden via admin settings
const DEFAULT_GA_ID = 'G-XXXXXXXXXX'; // Replace with actual ID when configured

export function useAnalytics() {
  const location = useLocation();

  // Initialize GA4 on mount
  useEffect(() => {
    const initializeGA = async () => {
      try {
        // Try to get GA ID from analytics_settings table
        const { data } = await supabase
          .from('analytics_settings')
          .select('tracking_id')
          .eq('tool_name', 'google_analytics')
          .eq('is_active', true)
          .maybeSingle();

        const gaId = data?.tracking_id || DEFAULT_GA_ID;
        
        // Only initialize if we have a valid ID (not placeholder)
        if (gaId && !gaId.includes('XXXXXX')) {
          ga4.initialize(gaId);
        } else {
          console.log('[Analytics] GA4 ID not configured, tracking disabled');
        }
      } catch (error) {
        console.error('[Analytics] Error initializing:', error);
      }
    };

    initializeGA();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (ga4.isInitialized()) {
      ga4.trackPageView(location.pathname + location.search);
    }
  }, [location]);

  // Property tracking
  const trackPropertyView = useCallback((event: PropertyViewEvent) => {
    ga4.trackPropertyView(event);
  }, []);

  // Search tracking
  const trackSearch = useCallback((event: SearchEvent) => {
    ga4.trackSearch(event);
  }, []);

  // Booking tracking
  const trackBookingStart = useCallback((event: BookingEvent) => {
    ga4.trackBookingStart(event);
  }, []);

  const trackBookingComplete = useCallback((event: BookingEvent) => {
    ga4.trackBookingComplete(event);
  }, []);

  // Payment tracking
  const trackPaymentStart = useCallback((event: PaymentEvent) => {
    ga4.trackPaymentStart(event);
  }, []);

  const trackPaymentSuccess = useCallback((event: PaymentEvent) => {
    ga4.trackPaymentSuccess(event);
  }, []);

  // User tracking
  const trackSignUp = useCallback((method: 'email' | 'whatsapp' | 'google' | 'facebook', userType?: string) => {
    ga4.trackSignUp({ method, user_type: userType as any });
  }, []);

  const trackLogin = useCallback((method: 'email' | 'whatsapp' | 'google' | 'facebook') => {
    ga4.trackLogin({ method });
  }, []);

  // Engagement tracking
  const trackInquiry = useCallback((propertyId: string, inquiryType: 'whatsapp' | 'email' | 'phone' | 'form') => {
    ga4.trackInquiry(propertyId, inquiryType);
  }, []);

  const trackSaveProperty = useCallback((propertyId: string, price: number) => {
    ga4.trackSaveProperty(propertyId, price);
  }, []);

  const trackCompare = useCallback((propertyIds: string[]) => {
    ga4.trackCompare(propertyIds);
  }, []);

  const trackValuation = useCallback((propertyId: string, estimatedValue: number) => {
    ga4.trackValuationRequest(propertyId, estimatedValue);
  }, []);

  // Generic event tracking
  const trackEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    ga4.trackEvent(eventName, params);
  }, []);

  // Set user identity
  const identifyUser = useCallback((userId: string, properties?: Record<string, any>) => {
    ga4.setUserProperties(userId, properties || {});
  }, []);

  // Error tracking
  const trackError = useCallback((description: string, fatal: boolean = false) => {
    ga4.trackException(description, fatal);
  }, []);

  return {
    // Property events
    trackPropertyView,
    trackSaveProperty,
    trackCompare,
    trackValuation,
    
    // Search events
    trackSearch,
    
    // Booking events
    trackBookingStart,
    trackBookingComplete,
    
    // Payment events
    trackPaymentStart,
    trackPaymentSuccess,
    
    // User events
    trackSignUp,
    trackLogin,
    identifyUser,
    
    // Engagement events
    trackInquiry,
    
    // Generic
    trackEvent,
    trackError,
    
    // Check if tracking is active
    isActive: ga4.isInitialized(),
  };
}

// Provider component for analytics context
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useAnalytics();
  return children;
}
