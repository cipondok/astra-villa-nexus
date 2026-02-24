import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface CollaborativeRecommendation {
  propertyId: string;
  title: string;
  city: string;
  district: string;
  price: number;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  image: string | null;
  listingType: string;
  score: number;
  reason: string;
  icon: string;
}

export const useCollaborativeRecommendations = (
  currentFilterId: string | null = null,
  sessionId: string = ''
) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<CollaborativeRecommendation[]>([]);
  const [strategy, setStrategy] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch if we have a userId, a currentFilterId, or just as fallback
    const shouldFetch = user?.id || currentFilterId;
    if (!shouldFetch && !sessionId) {
      setRecommendations([]);
      return;
    }

    const fetchRecommendations = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke(
          'get-collaborative-recommendations',
          {
            body: {
              currentFilterId,
              sessionId,
              userId: user?.id || null,
            },
          }
        );

        if (error) throw error;
        setRecommendations(data?.recommendations || []);
        setStrategy(data?.strategy || '');
      } catch (error) {
        console.error('Error fetching collaborative recommendations:', error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchRecommendations, 300);
    return () => clearTimeout(timer);
  }, [currentFilterId, sessionId, user?.id]);

  const trackSequence = async (previousFilterId: string, newFilterId: string) => {
    try {
      await supabase.from('filter_sequences').insert({
        session_id: sessionId,
        previous_filter_id: previousFilterId,
        current_filter_id: newFilterId,
        user_id: user?.id || null,
      });
    } catch (error) {
      console.error('Error tracking filter sequence:', error);
    }
  };

  return {
    recommendations,
    strategy,
    isLoading,
    trackSequence,
  };
};
