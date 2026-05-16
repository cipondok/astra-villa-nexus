import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const db = supabase as any;

// ── Types ──
export interface SocialPost {
  id: string;
  author_id: string;
  post_type: 'opportunity' | 'insight' | 'discussion' | 'watchlist';
  title: string;
  content: string;
  property_id: string | null;
  tags: string[];
  likes_count: number;
  comments_count: number;
  saves_count: number;
  views_count: number;
  is_elite: boolean;
  moderation_status: string;
  created_at: string;
  author?: { full_name: string; avatar_url: string | null };
  property?: { id: string; title: string; city: string; price: number; property_type: string; thumbnail_url: string | null; investment_score: number };
  user_liked?: boolean;
  user_saved?: boolean;
}

export interface InvestorProfile {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  reputation_score: number;
  tier: string;
  deals_shared: number;
  total_likes_received: number;
  follower_count: number;
  following_count: number;
  is_following?: boolean;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  author?: { full_name: string; avatar_url: string | null };
}

// ── Feed ──
export function useSocialFeed(filter: string = 'all', searchQuery: string = '') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['social-feed', filter, searchQuery],
    queryFn: async (): Promise<SocialPost[]> => {
      let query = db
        .from('investor_posts')
        .select('*, author:profiles!investor_posts_author_id_fkey(full_name, avatar_url), property:properties!investor_posts_property_id_fkey(id, title, city, price, property_type, thumbnail_url, investment_score)')
        .eq('moderation_status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (filter !== 'all') {
        query = query.eq('post_type', filter);
      }
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Check user likes/saves
      let userLikes = new Set<string>();
      let userSaves = new Set<string>();

      if (user && data?.length) {
        const postIds = data.map((p: any) => p.id);
        const [likesRes, savesRes] = await Promise.all([
          db.from('investor_post_likes').select('post_id').eq('user_id', user.id).in('post_id', postIds),
          db.from('investor_post_saves').select('post_id').eq('user_id', user.id).in('post_id', postIds),
        ]);
        (likesRes.data || []).forEach((l: any) => userLikes.add(l.post_id));
        (savesRes.data || []).forEach((s: any) => userSaves.add(s.post_id));
      }

      return (data || []).map((p: any) => ({
        ...p,
        user_liked: userLikes.has(p.id),
        user_saved: userSaves.has(p.id),
      }));
    },
    staleTime: 30_000,
  });
}

// ── Create Post ──
export function useCreatePost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: {
      title: string;
      content: string;
      post_type: 'opportunity' | 'insight' | 'discussion' | 'watchlist';
      property_id?: string;
      tags?: string[];
    }) => {
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await db
        .from('investor_posts')
        .insert({
          author_id: user.id,
          title: payload.title,
          content: payload.content,
          post_type: payload.post_type,
          property_id: payload.property_id || null,
          tags: payload.tags || [],
        })
        .select('id')
        .single();
      if (error) throw error;

      // Update credibility deals_shared
      await db.from('investor_credibility')
        .upsert({ user_id: user.id, deals_shared: 1 }, { onConflict: 'user_id' })
        .select();
      // Actually increment
      await db.rpc('increment_credibility_deals', { uid: user.id }).catch(() => {});

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      toast({ title: 'Post Published!', description: 'Your insight is now visible to the community.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });
}

// ── Toggle Like ──
export function useToggleLike() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      if (isLiked) {
        await db.from('investor_post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await db.from('investor_post_likes').insert({ post_id: postId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
  });
}

// ── Toggle Save ──
export function useToggleSave() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isSaved }: { postId: string; isSaved: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      if (isSaved) {
        await db.from('investor_post_saves').delete().eq('post_id', postId).eq('user_id', user.id);
      } else {
        await db.from('investor_post_saves').insert({ post_id: postId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
  });
}

// ── Toggle Follow ──
export function useToggleFollow() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ targetId, isFollowing }: { targetId: string; isFollowing: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      if (user.id === targetId) throw new Error('Cannot follow yourself');
      if (isFollowing) {
        await db.from('investor_follows').delete().eq('follower_id', user.id).eq('following_id', targetId);
      } else {
        await db.from('investor_follows').insert({ follower_id: user.id, following_id: targetId });
      }
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['investor-leaderboard'] });
      toast({ title: vars.isFollowing ? 'Unfollowed' : 'Following!' });
    },
  });
}

// ── Comments ──
export function usePostComments(postId: string | null) {
  return useQuery({
    queryKey: ['post-comments', postId],
    queryFn: async (): Promise<PostComment[]> => {
      const { data, error } = await db
        .from('investor_post_comments')
        .select('*, author:profiles!investor_post_comments_author_id_fkey(full_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
    enabled: !!postId,
  });
}

export function useAddComment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await db
        .from('investor_post_comments')
        .insert({ post_id: postId, author_id: user.id, content });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['post-comments', vars.postId] });
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
    },
  });
}

// ── Leaderboard ──
export function useInvestorLeaderboard() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['investor-leaderboard'],
    queryFn: async (): Promise<InvestorProfile[]> => {
      const { data, error } = await db
        .from('investor_credibility')
        .select('*, profile:profiles!investor_credibility_user_id_fkey(full_name, avatar_url)')
        .order('reputation_score', { ascending: false })
        .limit(20);
      if (error) throw error;

      let followingSet = new Set<string>();
      if (user) {
        const { data: follows } = await db
          .from('investor_follows')
          .select('following_id')
          .eq('follower_id', user.id);
        (follows || []).forEach((f: any) => followingSet.add(f.following_id));
      }

      return (data || []).map((c: any) => ({
        user_id: c.user_id,
        full_name: c.profile?.full_name || 'Investor',
        avatar_url: c.profile?.avatar_url || null,
        reputation_score: c.reputation_score,
        tier: c.tier,
        deals_shared: c.deals_shared,
        total_likes_received: c.total_likes_received,
        follower_count: c.follower_count,
        following_count: c.following_count,
        is_following: followingSet.has(c.user_id),
      }));
    },
    staleTime: 60_000,
  });
}
