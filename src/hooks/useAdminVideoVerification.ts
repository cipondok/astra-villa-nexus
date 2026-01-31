import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AdminVideoSession {
  id: string;
  user_id: string;
  agent_id: string | null;
  status: string;
  scheduled_at: string;
  started_at: string | null;
  ended_at: string | null;
  verification_type: string;
  consent_given: boolean;
  recording_consent: boolean;
  recording_url: string | null;
  notes: string | null;
  fraud_flags: string[];
  created_at: string;
  user?: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

export interface SessionReview {
  id: string;
  session_id: string;
  reviewer_id: string;
  decision: 'approved' | 'rejected' | 'needs_more_info' | 'escalated';
  trust_score_awarded: number | null;
  badge_tier_awarded: string | null;
  fraud_detected: boolean;
  fraud_indicators: string[];
  review_notes: string | null;
  identity_match_score: number | null;
  document_authenticity_score: number | null;
  liveness_score: number | null;
  overall_confidence: number | null;
  reviewed_at: string;
}

export interface FraudLog {
  id: string;
  session_id: string;
  detection_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence_score: number | null;
  details: Record<string, any>;
  flagged_by: string;
  resolved: boolean;
  resolution_notes: string | null;
  created_at: string;
}

export const useAdminVideoVerification = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all pending sessions for review
  const { data: pendingSessions = [], isLoading: loadingPending } = useQuery({
    queryKey: ['admin-video-sessions', 'pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_verification_sessions')
        .select(`
          *,
          user:profiles!video_verification_sessions_user_id_fkey(full_name, email, avatar_url)
        `)
        .in('status', ['pending_review', 'scheduled', 'in_progress'])
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data as unknown as AdminVideoSession[];
    },
    enabled: !!user,
  });

  // Fetch all completed sessions
  const { data: completedSessions = [], isLoading: loadingCompleted } = useQuery({
    queryKey: ['admin-video-sessions', 'completed'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_verification_sessions')
        .select(`
          *,
          user:profiles!video_verification_sessions_user_id_fkey(full_name, email, avatar_url)
        `)
        .in('status', ['completed', 'failed', 'cancelled'])
        .order('ended_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as unknown as AdminVideoSession[];
    },
    enabled: !!user,
  });

  // Fetch session documents
  const fetchSessionDocuments = useCallback(async (sessionId: string) => {
    const { data, error } = await supabase
      .from('video_session_documents')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }, []);

  // Fetch fraud logs for session
  const fetchFraudLogs = useCallback(async (sessionId: string) => {
    const { data, error } = await supabase
      .from('video_fraud_detection_logs')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as FraudLog[];
  }, []);

  // Submit review
  const submitReviewMutation = useMutation({
    mutationFn: async (review: Omit<SessionReview, 'id' | 'reviewed_at'>) => {
      // Create review
      const { data: reviewData, error: reviewError } = await supabase
        .from('video_verification_reviews')
        .insert({
          session_id: review.session_id,
          reviewer_id: review.reviewer_id,
          decision: review.decision,
          trust_score_awarded: review.trust_score_awarded,
          badge_tier_awarded: review.badge_tier_awarded,
          fraud_detected: review.fraud_detected,
          fraud_indicators: review.fraud_indicators,
          review_notes: review.review_notes,
          identity_match_score: review.identity_match_score,
          document_authenticity_score: review.document_authenticity_score,
          liveness_score: review.liveness_score,
          overall_confidence: review.overall_confidence,
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      // Update session status
      const newStatus = review.decision === 'approved' ? 'completed' : 
                       review.decision === 'rejected' ? 'failed' : 'pending_review';
      
      const { error: sessionError } = await supabase
        .from('video_verification_sessions')
        .update({ 
          status: newStatus,
          ended_at: new Date().toISOString(),
        })
        .eq('id', review.session_id);

      if (sessionError) throw sessionError;

      // If approved, update user's verification level
      if (review.decision === 'approved' && review.badge_tier_awarded) {
        // Get the session to find user_id
        const { data: session } = await supabase
          .from('video_verification_sessions')
          .select('user_id')
          .eq('id', review.session_id)
          .single();

        if (session && review.badge_tier_awarded) {
          // Update user profile verification_status to reflect L4 completion
          await supabase
            .from('profiles')
            .update({ 
              verification_status: `level_4_${review.badge_tier_awarded}`,
            })
            .eq('id', session.user_id);
        }
      }

      return reviewData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-video-sessions'] });
      toast.success('Review submitted successfully');
    },
    onError: (error) => {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    },
  });

  // Verify document
  const verifyDocumentMutation = useMutation({
    mutationFn: async ({ 
      documentId, 
      status, 
      notes 
    }: { 
      documentId: string; 
      status: 'verified' | 'rejected' | 'needs_review'; 
      notes?: string;
    }) => {
      const { error } = await supabase
        .from('video_session_documents')
        .update({
          verification_status: status,
          verification_notes: notes,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Document verification updated');
    },
    onError: (error) => {
      console.error('Error verifying document:', error);
      toast.error('Failed to update document');
    },
  });

  // Add fraud flag
  const addFraudFlagMutation = useMutation({
    mutationFn: async ({
      sessionId,
      detectionType,
      severity,
      details,
    }: {
      sessionId: string;
      detectionType: string;
      severity: FraudLog['severity'];
      details?: Record<string, any>;
    }) => {
      const { error } = await supabase
        .from('video_fraud_detection_logs')
        .insert({
          session_id: sessionId,
          detection_type: detectionType,
          severity,
          details: details || {},
          flagged_by: 'agent',
          confidence_score: null,
        });

      if (error) throw error;

      // Update session fraud flags
      const { data: session } = await supabase
        .from('video_verification_sessions')
        .select('fraud_flags')
        .eq('id', sessionId)
        .single();

      if (session) {
        const currentFlags = (session.fraud_flags as string[]) || [];
        await supabase
          .from('video_verification_sessions')
          .update({
            fraud_flags: [...currentFlags, detectionType],
          })
          .eq('id', sessionId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-video-sessions'] });
      toast.success('Fraud flag added');
    },
    onError: (error) => {
      console.error('Error adding fraud flag:', error);
      toast.error('Failed to add fraud flag');
    },
  });

  // Resolve fraud flag
  const resolveFraudFlagMutation = useMutation({
    mutationFn: async ({
      flagId,
      resolutionNotes,
    }: {
      flagId: string;
      resolutionNotes: string;
    }) => {
      const { error } = await supabase
        .from('video_fraud_detection_logs')
        .update({
          resolved: true,
          resolved_by: user?.id,
          resolved_at: new Date().toISOString(),
          resolution_notes: resolutionNotes,
        })
        .eq('id', flagId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Fraud flag resolved');
    },
    onError: (error) => {
      console.error('Error resolving fraud flag:', error);
      toast.error('Failed to resolve fraud flag');
    },
  });

  // Assign agent to session
  const assignAgentMutation = useMutation({
    mutationFn: async ({
      sessionId,
      agentId,
    }: {
      sessionId: string;
      agentId: string;
    }) => {
      const { error } = await supabase
        .from('video_verification_sessions')
        .update({ agent_id: agentId })
        .eq('id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-video-sessions'] });
      toast.success('Agent assigned');
    },
    onError: (error) => {
      console.error('Error assigning agent:', error);
      toast.error('Failed to assign agent');
    },
  });

  return {
    // Data
    pendingSessions,
    completedSessions,
    loadingPending,
    loadingCompleted,

    // Queries
    fetchSessionDocuments,
    fetchFraudLogs,

    // Mutations
    submitReview: submitReviewMutation.mutate,
    verifyDocument: verifyDocumentMutation.mutate,
    addFraudFlag: addFraudFlagMutation.mutate,
    resolveFraudFlag: resolveFraudFlagMutation.mutate,
    assignAgent: assignAgentMutation.mutate,

    // Loading states
    isSubmittingReview: submitReviewMutation.isPending,
  };
};

export default useAdminVideoVerification;
