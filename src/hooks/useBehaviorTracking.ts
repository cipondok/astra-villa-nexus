import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrackEventParams {
  eventType: string;
  propertyId?: string;
  eventData?: Record<string, any>;
  durationMs?: number;
}

const CACHE_INVALIDATION_DEBOUNCE_MS = 30_000; // 30 seconds

/**
 * Lightweight hook to track user behavior for the AI Match Engine.
 * Batches events and debounces rapid-fire scroll/view events.
 * Includes debounced cache invalidation — multiple events within 30s
 * only trigger one cache invalidation.
 */
export function useBehaviorTracking() {
  const lastEvent = useRef<string>('');
  const lastTime = useRef<number>(0);
  const cacheInvalidationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingInvalidation = useRef<string | null>(null); // userId waiting for invalidation

  /**
   * Debounced cache invalidation: marks user_ai_cache.recompute_needed = true
   * but only fires once per 30-second window regardless of how many events occur.
   */
  const debouncedCacheInvalidation = useCallback((userId: string) => {
    pendingInvalidation.current = userId;

    // If a timer is already running, let it handle the batch
    if (cacheInvalidationTimer.current) return;

    cacheInvalidationTimer.current = setTimeout(async () => {
      cacheInvalidationTimer.current = null;
      const uid = pendingInvalidation.current;
      if (!uid) return;
      pendingInvalidation.current = null;

      try {
        await supabase
          .from('user_ai_cache' as any)
          .update({
            last_activity_at: new Date().toISOString(),
            recompute_needed: true,
          })
          .eq('user_id', uid);
      } catch {
        // Silent — cache invalidation is best-effort
      }
    }, CACHE_INVALIDATION_DEBOUNCE_MS);
  }, []);

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

      // Insert into ai_behavior_tracking
      await supabase.from('ai_behavior_tracking').insert({
        user_id: user.id,
        event_type: eventType,
        property_id: propertyId || null,
        event_data: eventData || {},
        duration_ms: durationMs || null,
        page_url: window.location.pathname,
      });

      // Also insert enriched DNA signal for high-value event types
      const dnaSignalTypes = ['view', 'save', 'search', 'inquiry', 'click', 'filter_change', 'comparison_usage', 'alert_response', 'map_explore'];
      if (dnaSignalTypes.includes(eventType)) {
        await supabase.from('investor_dna_signals' as any).insert({
          user_id: user.id,
          signal_type: eventType,
          signal_data: { ...eventData, duration_ms: durationMs, page_url: window.location.pathname },
          property_id: propertyId || null,
        });
      }

      // Trigger debounced cache invalidation for high-signal events
      const highSignalEvents = ['save', 'inquiry', 'contact', 'view'];
      if (highSignalEvents.includes(eventType)) {
        debouncedCacheInvalidation(user.id);
      }
    } catch (err) {
      // Silent fail - behavior tracking should never break UX
      console.debug('Behavior tracking error:', err);
    }
  }, [debouncedCacheInvalidation]);

  const trackView = useCallback((propertyId: string) => {
    trackEvent({ eventType: 'view', propertyId });
  }, [trackEvent]);

  const trackClick = useCallback((propertyId: string, action?: string) => {
    trackEvent({ eventType: 'click', propertyId, eventData: { action } });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, filters?: Record<string, any>) => {
    trackEvent({ eventType: 'search', eventData: { query, filters } });
  }, [trackEvent]);

  const trackSave = useCallback(async (propertyId: string) => {
    trackEvent({ eventType: 'save', propertyId });
    // Also log conversion event for AI weight tuning
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_recommendation_events' as any).insert({
          user_id: user.id,
          property_id: propertyId,
          event_type: 'save',
          match_factors: {},
          ai_match_score: 0,
        });
      }
    } catch { /* silent */ }
  }, [trackEvent]);

  const trackScroll = useCallback((propertyId: string, scrollDepth: number) => {
    trackEvent({ eventType: 'scroll', propertyId, eventData: { scrollDepth } });
  }, [trackEvent]);

  const trackMapInteraction = useCallback((action: string, data?: Record<string, any>) => {
    trackEvent({ eventType: 'map_interaction', eventData: { action, ...data } });
  }, [trackEvent]);

  const trackLocationClick = useCallback((latitude: number, longitude: number, city?: string) => {
    trackEvent({ eventType: 'location_click', eventData: { latitude, longitude, city } });
  }, [trackEvent]);

  const trackInquiry = useCallback(async (propertyId: string) => {
    trackEvent({ eventType: 'inquiry', propertyId });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('ai_recommendation_events' as any).insert({
          user_id: user.id,
          property_id: propertyId,
          event_type: 'inquiry',
          match_factors: {},
          ai_match_score: 0,
        });
      }
    } catch { /* silent */ }
  }, [trackEvent]);

  return { trackEvent, trackView, trackClick, trackSearch, trackSave, trackScroll, trackInquiry, trackMapInteraction, trackLocationClick };
}
