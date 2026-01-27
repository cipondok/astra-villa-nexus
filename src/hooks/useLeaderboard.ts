import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LeaderboardEntry {
  user_id: string;
  rank: number;
  score: number;
  full_name: string;
  avatar_url: string | null;
  level: number;
  badge_count: number;
  user_type: string;
}

export type LeaderboardCategory = 
  | 'top_xp' 
  | 'top_agents' 
  | 'rising_stars' 
  | 'most_helpful'
  | 'engagement_kings';

export const useLeaderboard = (category: LeaderboardCategory = 'top_xp', limit: number = 10) => {
  const { user } = useAuth();

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard', category, limit],
    queryFn: async () => {
      // Build query based on category
      let query = supabase
        .from('user_gamification_stats')
        .select(`
          user_id,
          total_xp,
          current_level,
          user_type,
          properties_listed,
          inquiries_received,
          reviews_written
        `)
        .gt('total_xp', 0);

      // Add category-specific filters
      switch (category) {
        case 'top_agents':
          query = query.eq('user_type', 'agent');
          break;
        case 'rising_stars':
          // Users with most XP gained recently - use total_xp for now
          break;
        case 'most_helpful':
          // Sort by reviews written
          break;
      }

      // Order by appropriate metric
      switch (category) {
        case 'most_helpful':
          query = query.order('reviews_written', { ascending: false });
          break;
        case 'engagement_kings':
          query = query.order('total_xp', { ascending: false });
          break;
        default:
          query = query.order('total_xp', { ascending: false });
      }

      query = query.limit(limit);

      const { data: statsData, error: statsError } = await query;
      if (statsError) throw statsError;

      if (!statsData || statsData.length === 0) return [];

      // Fetch user profiles and badge counts
      const userIds = statsData.map(s => s.user_id);
      
      const [profilesResult, badgesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds),
        supabase
          .from('user_badges')
          .select('user_id')
          .in('user_id', userIds)
      ]);

      const profiles = profilesResult.data || [];
      const badges = badgesResult.data || [];

      // Count badges per user
      const badgeCounts: Record<string, number> = {};
      badges.forEach(b => {
        badgeCounts[b.user_id] = (badgeCounts[b.user_id] || 0) + 1;
      });

      // Create profile lookup
      const profileMap: Record<string, any> = {};
      profiles.forEach(p => {
        profileMap[p.id] = p;
      });

      // Build leaderboard
      const leaderboard: LeaderboardEntry[] = statsData.map((stat, index) => {
        const profile = profileMap[stat.user_id];
        
        let score: number;
        switch (category) {
          case 'most_helpful':
            score = stat.reviews_written || 0;
            break;
          case 'top_agents':
            score = stat.inquiries_received || 0;
            break;
          default:
            score = stat.total_xp;
        }

        return {
          user_id: stat.user_id,
          rank: index + 1,
          score,
          full_name: profile?.full_name || 'Anonymous',
          avatar_url: profile?.avatar_url,
          level: stat.current_level,
          badge_count: badgeCounts[stat.user_id] || 0,
          user_type: stat.user_type
        };
      });

      return leaderboard;
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // Find current user's rank
  const currentUserRank = leaderboard?.find(e => e.user_id === user?.id)?.rank || null;

  return {
    leaderboard: leaderboard || [],
    isLoading,
    currentUserRank
  };
};

export default useLeaderboard;
