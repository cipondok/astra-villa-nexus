import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PropertyReview {
  id: string;
  property_id: string;
  user_id: string;
  booking_id: string | null;
  rating: number;
  title: string | null;
  review_text: string | null;
  pros: string[] | null;
  cons: string[] | null;
  is_verified_visit: boolean;
  is_published: boolean;
  admin_approved: boolean;
  helpful_count: number;
  report_count: number;
  owner_response: string | null;
  owner_responded_at: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    full_name: string;
    avatar_url: string;
  };
}

interface CreateReviewData {
  property_id: string;
  rating: number;
  title?: string;
  review_text?: string;
  pros?: string[];
  cons?: string[];
}

export function usePropertyReviews(propertyId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch reviews for a property
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['property-reviews', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];

      const { data, error } = await supabase
        .from('property_reviews')
        .select(`
          *,
          profiles:user_id (id, full_name, avatar_url)
        `)
        .eq('property_id', propertyId)
        .eq('is_published', true)
        .eq('admin_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PropertyReview[];
    },
    enabled: !!propertyId,
  });

  // Fetch user's review for a property
  const { data: myReview } = useQuery({
    queryKey: ['my-property-review', propertyId, user?.id],
    queryFn: async () => {
      if (!propertyId || !user?.id) return null;

      const { data, error } = await supabase
        .from('property_reviews')
        .select('*')
        .eq('property_id', propertyId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data as PropertyReview | null;
    },
    enabled: !!propertyId && !!user?.id,
  });

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (data: CreateReviewData) => {
      if (!user?.id) throw new Error('Must be logged in');

      // Check if user has a completed booking
      const { data: booking } = await supabase
        .from('property_bookings')
        .select('id')
        .eq('property_id', data.property_id)
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .maybeSingle();

      const { data: review, error } = await supabase
        .from('property_reviews')
        .insert({
          ...data,
          user_id: user.id,
          booking_id: booking?.id || null,
          is_verified_visit: !!booking,
        })
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-reviews', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['my-property-review', propertyId] });
      toast.success('Review submitted successfully!');
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate')) {
        toast.error('You have already reviewed this property');
      } else {
        toast.error(error.message || 'Failed to submit review');
      }
    },
  });

  // Update review mutation
  const updateReviewMutation = useMutation({
    mutationFn: async ({ reviewId, ...data }: { reviewId: string } & Partial<CreateReviewData>) => {
      const { data: review, error } = await supabase
        .from('property_reviews')
        .update(data)
        .eq('id', reviewId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      return review;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-reviews', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['my-property-review', propertyId] });
      toast.success('Review updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update review');
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('property_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-reviews', propertyId] });
      queryClient.invalidateQueries({ queryKey: ['my-property-review', propertyId] });
      toast.success('Review deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete review');
    },
  });

  // Vote on review
  const voteOnReviewMutation = useMutation({
    mutationFn: async ({ reviewId, voteType }: { reviewId: string; voteType: 'helpful' | 'not_helpful' }) => {
      if (!user?.id) throw new Error('Must be logged in');

      // Upsert vote
      const { error } = await supabase
        .from('review_votes')
        .upsert({
          review_type: 'property',
          review_id: reviewId,
          user_id: user.id,
          vote_type: voteType,
        }, {
          onConflict: 'review_type,review_id,user_id',
        });

      if (error) throw error;

      // Update helpful_count on review
      const { count } = await supabase
        .from('review_votes')
        .select('*', { count: 'exact', head: true })
        .eq('review_id', reviewId)
        .eq('review_type', 'property')
        .eq('vote_type', 'helpful');

      await supabase
        .from('property_reviews')
        .update({ helpful_count: count || 0 })
        .eq('id', reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-reviews', propertyId] });
    },
  });

  // Calculate average rating
  const averageRating = reviews?.length 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const ratingDistribution = reviews?.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  return {
    reviews: reviews || [],
    myReview,
    isLoading,
    averageRating,
    ratingDistribution,
    totalReviews: reviews?.length || 0,
    createReview: createReviewMutation.mutate,
    updateReview: updateReviewMutation.mutate,
    deleteReview: deleteReviewMutation.mutate,
    voteOnReview: voteOnReviewMutation.mutate,
    isSubmitting: createReviewMutation.isPending || updateReviewMutation.isPending,
  };
}
