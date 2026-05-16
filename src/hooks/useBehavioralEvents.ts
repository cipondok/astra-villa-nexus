import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type BehavioralEventType =
  | 'view'
  | 'click'
  | 'save'
  | 'unsave'
  | 'share'
  | 'inquiry'
  | 'compare'
  | 'dismiss'
  | 'search'
  | 'filter'
  | 'map_pan'
  | 'detail_open'
  | 'gallery_view'
  | 'contact_agent';

interface TrackEventInput {
  property_id?: string;
  event_type: BehavioralEventType;
  metadata?: Record<string, unknown>;
}

export function useTrackEvent() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: TrackEventInput) => {
      if (!user?.id) return null;

      const { error } = await supabase
        .from('behavioral_events' as any)
        .insert({
          user_id: user.id,
          property_id: input.property_id ?? null,
          event_type: input.event_type,
          metadata: input.metadata ?? {},
          session_id: sessionStorage.getItem('astra_session_id') ?? null,
        });

      if (error) {
        console.error('Failed to track event:', error);
        throw error;
      }
    },
    // Fire-and-forget — don't block UI
    onError: () => {},
  });
}
