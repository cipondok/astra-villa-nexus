import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PropertyFilters } from '@/components/search/AdvancedPropertyFilters';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: string;
  filters: Partial<PropertyFilters>;
  matchCount: number;
}

export const useCollaborativeRecommendations = (
  currentFilterId: string | null,
  sessionId: string
) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentFilterId) {
      setRecommendations([]);
      return;
    }

    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          'get-collaborative-recommendations',
          {
            body: { currentFilterId, sessionId },
          }
        );

        if (error) throw error;
        setRecommendations(data?.recommendations || []);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchRecommendations, 300);
    return () => clearTimeout(timer);
  }, [currentFilterId, sessionId]);

  const trackSequence = async (previousFilterId: string, currentFilterId: string) => {
    try {
      await supabase.from('filter_sequences').insert({
        session_id: sessionId,
        previous_filter_id: previousFilterId,
        current_filter_id: currentFilterId,
      });
    } catch (error) {
      console.error('Error tracking filter sequence:', error);
    }
  };

  return {
    recommendations,
    isLoading,
    trackSequence,
  };
};
