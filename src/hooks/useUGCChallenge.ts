import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface UGCChallenge {
  id: string;
  title: string;
  slug: string;
  description: string;
  theme: string;
  submission_start: string;
  submission_end: string;
  voting_start: string | null;
  voting_end: string | null;
  prizes: any[];
  participation_rules: any;
  judging_criteria: any[];
  status: string;
  total_submissions: number;
  total_votes: number;
}

export interface UGCSubmission {
  id: string;
  challenge_id: string;
  user_id: string;
  title: string;
  description: string;
  media_urls: string[];
  location: string;
  view_count: number;
  vote_count: number;
  status: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
  has_voted?: boolean;
}

export const useUGCChallenge = (challengeSlug?: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<UGCChallenge | null>(null);
  const [submissions, setSubmissions] = useState<UGCSubmission[]>([]);
  const [userSubmission, setUserSubmission] = useState<UGCSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch challenge
  const fetchChallenge = useCallback(async () => {
    try {
      let query = supabase
        .from('ugc_challenges')
        .select('*')
        .in('status', ['active', 'voting', 'completed']);

      if (challengeSlug) {
        query = query.eq('slug', challengeSlug);
      } else {
        query = query.order('created_at', { ascending: false }).limit(1);
      }

      const { data, error } = await query.single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setChallenge({
          ...data,
          prizes: data.prizes as any[],
          participation_rules: data.participation_rules as any,
          judging_criteria: data.judging_criteria as any[]
        });
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
    }
  }, [challengeSlug]);

  // Fetch submissions
  const fetchSubmissions = useCallback(async () => {
    if (!challenge) return;

    try {
      const { data, error } = await supabase
        .from('ugc_submissions')
        .select('*')
        .eq('challenge_id', challenge.id)
        .in('status', ['approved', 'winner'])
        .order('vote_count', { ascending: false });

      if (error) throw error;

      // Check if user voted on each
      let votedIds: string[] = [];
      if (user) {
        const { data: votes } = await supabase
          .from('ugc_votes')
          .select('submission_id')
          .eq('user_id', user.id);
        votedIds = (votes || []).map(v => v.submission_id);
      }

      setSubmissions((data || []).map(s => ({
        ...s,
        media_urls: s.media_urls as string[],
        has_voted: votedIds.includes(s.id)
      })));

      // Get user's own submission
      if (user) {
        const userSub = data?.find(s => s.user_id === user.id);
        if (userSub) {
          setUserSubmission({
            ...userSub,
            media_urls: userSub.media_urls as string[]
          });
        }
      }

    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  }, [challenge, user]);

  // Submit entry
  const submitEntry = useCallback(async (
    title: string,
    description: string,
    mediaUrls: string[],
    location?: string
  ) => {
    if (!user || !challenge) {
      toast({
        title: "Please login",
        description: "You need to be logged in to submit.",
        variant: "destructive"
      });
      return null;
    }

    // Validate against rules
    const rules = challenge.participation_rules;
    if (mediaUrls.length < rules.min_photos) {
      toast({
        title: "More photos needed",
        description: `Please upload at least ${rules.min_photos} photos.`,
        variant: "destructive"
      });
      return null;
    }
    if (description.length < rules.min_description_length) {
      toast({
        title: "Description too short",
        description: `Please write at least ${rules.min_description_length} characters.`,
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('ugc_submissions')
        .insert({
          challenge_id: challenge.id,
          user_id: user.id,
          title,
          description,
          media_urls: mediaUrls,
          location,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Submission Received! 🎉",
        description: "Your entry is pending review.",
      });

      setUserSubmission({
        ...data,
        media_urls: data.media_urls as string[]
      });

      return data;

    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  }, [user, challenge, toast]);

  // Vote for submission
  const voteFor = useCallback(async (submissionId: string) => {
    if (!user) {
      toast({
        title: "Please login",
        description: "You need to be logged in to vote.",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('ugc_votes')
        .insert({
          submission_id: submissionId,
          user_id: user.id
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Voted",
            description: "You've already voted for this entry.",
          });
          return false;
        }
        throw error;
      }

      // Update local state
      setSubmissions(prev => prev.map(s => 
        s.id === submissionId 
          ? { ...s, vote_count: s.vote_count + 1, has_voted: true }
          : s
      ));

      toast({
        title: "Vote Recorded! ❤️",
        description: "Thanks for participating!",
      });

      return true;

    } catch (error: any) {
      toast({
        title: "Vote Failed",
        description: error.message,
        variant: "destructive"
      });
      return false;
    }
  }, [user, toast]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchChallenge();
      setIsLoading(false);
    };
    load();
  }, [fetchChallenge]);

  useEffect(() => {
    if (challenge) {
      fetchSubmissions();
    }
  }, [challenge, fetchSubmissions]);

  return {
    challenge,
    submissions,
    userSubmission,
    isLoading,
    submitEntry,
    voteFor,
    refresh: fetchSubmissions
  };
};

export default useUGCChallenge;
