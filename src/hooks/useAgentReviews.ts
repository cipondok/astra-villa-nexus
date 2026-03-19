import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AgentReview {
  id: string;
  agent_id: string;
  reviewer_id: string;
  property_id: string | null;
  rating: number;
  rating_responsiveness: number | null;
  rating_knowledge: number | null;
  rating_professionalism: number | null;
  title: string | null;
  review_text: string | null;
  is_published: boolean;
  admin_approved: boolean;
  helpful_count: number;
  report_count: number;
  created_at: string;
  profiles?: { id: string; full_name: string; avatar_url: string };
}

interface CreateAgentReviewData {
  agent_id: string;
  property_id?: string;
  rating: number;
  rating_responsiveness?: number;
  rating_knowledge?: number;
  rating_professionalism?: number;
  title?: string;
  review_text?: string;
}

export function useAgentReviews(agentId?: string) {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['agent-reviews', agentId],
    queryFn: async () => {
      if (!agentId) return [];
      const { data, error } = await supabase
        .from('agent_reviews')
        .select('*, profiles:reviewer_id (id, full_name, avatar_url)')
        .eq('agent_id', agentId)
        .eq('is_published', true)
        .eq('admin_approved', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AgentReview[];
    },
    enabled: !!agentId,
  });

  const { data: myReview } = useQuery({
    queryKey: ['my-agent-review', agentId, user?.id],
    queryFn: async () => {
      if (!agentId || !user?.id) return null;
      const { data } = await supabase
        .from('agent_reviews')
        .select('*')
        .eq('agent_id', agentId)
        .eq('reviewer_id', user.id)
        .maybeSingle();
      return data as AgentReview | null;
    },
    enabled: !!agentId && !!user?.id,
  });

  const createReview = useMutation({
    mutationFn: async (data: CreateAgentReviewData) => {
      if (!user?.id) throw new Error('Must be logged in');
      const { data: review, error } = await supabase
        .from('agent_reviews')
        .insert({ ...data, reviewer_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return review;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent-reviews', agentId] });
      qc.invalidateQueries({ queryKey: ['my-agent-review', agentId] });
      toast.success('Agent review submitted!');
    },
    onError: (err: Error) => {
      if (err.message.includes('duplicate') || err.message.includes('unique')) {
        toast.error('You have already reviewed this agent');
      } else {
        toast.error(err.message || 'Failed to submit review');
      }
    },
  });

  const averageRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const avgResponsiveness = reviews.filter(r => r.rating_responsiveness).length
    ? reviews.reduce((s, r) => s + (r.rating_responsiveness || 0), 0) / reviews.filter(r => r.rating_responsiveness).length
    : 0;

  const avgKnowledge = reviews.filter(r => r.rating_knowledge).length
    ? reviews.reduce((s, r) => s + (r.rating_knowledge || 0), 0) / reviews.filter(r => r.rating_knowledge).length
    : 0;

  const avgProfessionalism = reviews.filter(r => r.rating_professionalism).length
    ? reviews.reduce((s, r) => s + (r.rating_professionalism || 0), 0) / reviews.filter(r => r.rating_professionalism).length
    : 0;

  return {
    reviews,
    myReview,
    isLoading,
    averageRating,
    avgResponsiveness,
    avgKnowledge,
    avgProfessionalism,
    totalReviews: reviews.length,
    createReview: createReview.mutate,
    isSubmitting: createReview.isPending,
  };
}
