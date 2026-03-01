import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrackEventParams {
  eventType: string;
  propertyId?: string;
  eventData?: Record<string, any>;
  durationMs?: number;
}

/**
 * Lightweight hook to track user behavior for the AI Match Engine.
 * Batches events and debounces rapid-fire scroll/view events.
 */
export function useBehaviorTracking() {
  const lastEvent = useRef<string>('');
  const lastTime = useRef<number>(0);

  const trackEvent = useCallback(async ({ eventType, propertyId, eventData, durationMs }: TrackEventParams) => {
    // Debounce: skip duplicate events within 500ms
    const now = Date.now();
    const key = `${eventType}-${propertyId || ''}`;
    if (key === lastEvent.current && now - lastTime.current < 500) return;
    lastEvent.current = key;
    lastTime.current = now;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Only track authenticated users

      await supabase.from('ai_behavior_tracking').insert({
        user_id: user.id,
        event_type: eventType,
        property_id: propertyId || null,
        event_data: eventData || {},
        duration_ms: durationMs || null,
        page_url: window.location.pathname,
      });
    } catch (err) {
      // Silent fail - behavior tracking should never break UX
      console.debug('Behavior tracking error:', err);
    }
  }, []);

  const trackView = useCallback((propertyId: string) => {
    trackEvent({ eventType: 'view', propertyId });
  }, [trackEvent]);

  const trackClick = useCallback((propertyId: string, action?: string) => {
    trackEvent({ eventType: 'click', propertyId, eventData: { action } });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, filters?: Record<string, any>) => {
    trackEvent({ eventType: 'search', eventData: { query, filters } });
  }, [trackEvent]);

  const trackSave = useCallback((propertyId: string) => {
    trackEvent({ eventType: 'save', propertyId });
  }, [trackEvent]);

  const trackScroll = useCallback((propertyId: string, scrollDepth: number) => {
    trackEvent({ eventType: 'scroll', propertyId, eventData: { scrollDepth } });
  }, [trackEvent]);

  const trackInquiry = useCallback((propertyId: string) => {
    trackEvent({ eventType: 'inquiry', propertyId });
  }, [trackEvent]);

  return { trackEvent, trackView, trackClick, trackSearch, trackSave, trackScroll, trackInquiry };
}
