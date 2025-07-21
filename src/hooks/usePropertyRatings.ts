import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PropertyRating {
  id: string;
  property_id: string;
  user_id: string;
  rating: number;
  review_text?: string;
  is_verified_buyer: boolean;
  is_anonymous: boolean;
  helpful_votes: number;
  created_at: string;
  updated_at: string;
  user_profile?: {
    full_name: string;
    avatar_url?: string;
  } | null;
}

interface PropertyRatingAggregate {
  property_id: string;
  average_rating: number;
  total_ratings: number;
  rating_distribution: Record<string, number>;
  last_updated: string;
}

export const usePropertyRatings = (propertyId: string) => {
  const [ratings, setRatings] = useState<PropertyRating[]>([]);
  const [aggregate, setAggregate] = useState<PropertyRatingAggregate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRatings = async () => {
    if (!propertyId) return;
    
    setLoading(true);
    setError(null);

    try {
      // Fetch ratings with user profiles
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('property_ratings')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });

      if (ratingsError) throw ratingsError;

      // Fetch aggregate data
      const { data: aggregateData, error: aggregateError } = await supabase
        .from('property_rating_aggregates')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      if (aggregateError && aggregateError.code !== 'PGRST116') {
        throw aggregateError;
      }

      // Fetch user profiles separately
      const userIds = ratingsData?.map(r => r.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      // Combine ratings with profiles
      const processedRatings = (ratingsData || []).map(rating => ({
        ...rating,
        user_profile: profilesData?.find(p => p.id === rating.user_id) || null
      }));

      const processedAggregate = aggregateData ? {
        ...aggregateData,
        rating_distribution: aggregateData.rating_distribution as Record<string, number>
      } : null;

      setRatings(processedRatings);
      setAggregate(processedAggregate);
    } catch (err) {
      console.error('Error fetching property ratings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch ratings');
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async (rating: number, reviewText?: string, isAnonymous: boolean = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to rate');

      const { error } = await supabase
        .from('property_ratings')
        .upsert({
          property_id: propertyId,
          user_id: user.id,
          rating,
          review_text: reviewText,
          is_anonymous: isAnonymous
        }, {
          onConflict: 'property_id,user_id'
        });

      if (error) throw error;

      // Refresh ratings after submission
      await fetchRatings();
      return true;
    } catch (err) {
      console.error('Error submitting rating:', err);
      throw err;
    }
  };

  const deleteRating = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { error } = await supabase
        .from('property_ratings')
        .delete()
        .eq('property_id', propertyId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh ratings after deletion
      await fetchRatings();
      return true;
    } catch (err) {
      console.error('Error deleting rating:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [propertyId]);

  return {
    ratings,
    aggregate,
    loading,
    error,
    submitRating,
    deleteRating,
    refetch: fetchRatings
  };
};