import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GamificationStats {
  id: string;
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  last_login_date: string | null;
  total_logins: number;
  user_type: string;
  properties_listed: number;
  inquiries_sent: number;
  inquiries_received: number;
  reviews_written: number;
  properties_saved: number;
  properties_shared: number;
  viewings_booked: number;
  referrals_completed: number;
}

export interface Badge {
  id: string;
  badge_key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: Record<string, any>;
  xp_reward: number;
  is_active: boolean;
  display_order: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  is_displayed: boolean;
  is_new: boolean;
  badge?: Badge;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  achievement_data: Record<string, any>;
  share_text: string | null;
  is_shared: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  rank: number;
  score: number;
  user_name: string;
  avatar_url: string | null;
  level: number;
  badge_count: number;
}

// Level titles by user type
export const LEVEL_TITLES = {
  agent: ['Rookie Agent', 'Rising Star', 'Property Scout', 'Deal Maker', 'Top Performer', 'Elite Agent', 'Master Broker', 'Platinum Agent', 'Diamond Agent', 'Legend'],
  homeowner: ['New Seller', 'Active Seller', 'Market Player', 'Savvy Owner', 'Power Seller', 'Market Expert', 'Portfolio Pro', 'Elite Owner', 'Diamond Seller', 'Mogul'],
  searcher: ['Browser', 'Explorer', 'Home Hunter', 'Serious Buyer', 'VIP Searcher', 'Property Expert', 'Dream Finder', 'Platinum Member', 'Diamond Hunter', 'Tycoon']
};

// XP thresholds for each level
export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 2000, 4000, 7500, 12000, 20000];

// Profile frame colors by level
export const PROFILE_FRAMES = {
  1: { name: 'default', color: 'border-muted' },
  2: { name: 'bronze', color: 'border-amber-600' },
  3: { name: 'bronze', color: 'border-amber-600' },
  4: { name: 'silver', color: 'border-slate-400' },
  5: { name: 'silver', color: 'border-slate-400' },
  6: { name: 'gold', color: 'border-yellow-500' },
  7: { name: 'gold', color: 'border-yellow-500' },
  8: { name: 'platinum', color: 'border-cyan-400' },
  9: { name: 'diamond', color: 'border-purple-500' },
  10: { name: 'diamond', color: 'border-purple-500 ring-2 ring-purple-300' }
};

export const useGamification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's gamification stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['gamification-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_gamification_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Create initial stats if doesn't exist
      if (!data) {
        const { data: newStats, error: insertError } = await supabase
          .from('user_gamification_stats')
          .insert({ user_id: user.id })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newStats as GamificationStats;
      }
      
      return data as GamificationStats;
    },
    enabled: !!user?.id
  });

  // Fetch all badge definitions
  const { data: allBadges } = useQuery({
    queryKey: ['badge-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badge_definitions')
        .select('*')
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      return data as Badge[];
    }
  });

  // Fetch user's earned badges
  const { data: userBadges } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badge_definitions(*)
        `)
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!user?.id
  });

  // Fetch recent achievements
  const { data: achievements } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as Achievement[];
    },
    enabled: !!user?.id
  });

  // Fetch XP transaction history
  const { data: xpHistory } = useQuery({
    queryKey: ['xp-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('xp_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Process daily login
  const claimDailyLogin = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .rpc('process_daily_login', { p_user_id: user.id });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      if (data?.already_claimed) {
        return; // Silent - already claimed today
      }
      
      queryClient.invalidateQueries({ queryKey: ['gamification-stats'] });
      queryClient.invalidateQueries({ queryKey: ['xp-history'] });
      
      toast({
        title: "🎉 Daily Login Bonus!",
        description: `+${data.xp_earned} XP earned! ${data.current_streak > 1 ? `🔥 ${data.current_streak} day streak!` : ''}`,
      });
    }
  });

  // Award XP for action
  const awardXP = useMutation({
    mutationFn: async ({ 
      actionType, 
      xpAmount, 
      description,
      referenceId,
      referenceType 
    }: { 
      actionType: string; 
      xpAmount: number; 
      description?: string;
      referenceId?: string;
      referenceType?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .rpc('award_xp', { 
          p_user_id: user.id,
          p_action_type: actionType,
          p_xp_amount: xpAmount,
          p_description: description || null,
          p_reference_id: referenceId || null,
          p_reference_type: referenceType || null
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['gamification-stats'] });
      queryClient.invalidateQueries({ queryKey: ['xp-history'] });
      
      if (data?.leveled_up) {
        toast({
          title: "🎊 Level Up!",
          description: `Congratulations! You're now Level ${data.new_level}!`,
        });
      }
    }
  });

  // Award badge
  const awardBadge = useMutation({
    mutationFn: async (badgeKey: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .rpc('award_badge', { 
          p_user_id: user.id,
          p_badge_key: badgeKey
        });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      if (data?.success) {
        queryClient.invalidateQueries({ queryKey: ['user-badges'] });
        queryClient.invalidateQueries({ queryKey: ['gamification-stats'] });
        queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
        
        toast({
          title: "🏆 Badge Earned!",
          description: `You earned the "${data.badge_name}" badge! +${data.xp_reward} XP`,
        });
      }
    }
  });

  // Calculate progress to next level
  const getProgressToNextLevel = useCallback(() => {
    if (!stats) return { current: 0, required: 100, percentage: 0 };
    
    const currentLevel = stats.current_level;
    const currentXP = stats.total_xp;
    
    if (currentLevel >= 10) {
      return { current: currentXP, required: currentXP, percentage: 100 };
    }
    
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel];
    const xpInCurrentLevel = currentXP - currentThreshold;
    const xpRequiredForLevel = nextThreshold - currentThreshold;
    
    return {
      current: xpInCurrentLevel,
      required: xpRequiredForLevel,
      percentage: Math.min(100, (xpInCurrentLevel / xpRequiredForLevel) * 100)
    };
  }, [stats]);

  // Get user's title based on level and type
  const getUserTitle = useCallback(() => {
    if (!stats) return 'Member';
    const userType = stats.user_type as keyof typeof LEVEL_TITLES;
    const titles = LEVEL_TITLES[userType] || LEVEL_TITLES.searcher;
    return titles[Math.min(stats.current_level - 1, 9)];
  }, [stats]);

  // Get profile frame for current level
  const getProfileFrame = useCallback(() => {
    if (!stats) return PROFILE_FRAMES[1];
    return PROFILE_FRAMES[stats.current_level as keyof typeof PROFILE_FRAMES] || PROFILE_FRAMES[1];
  }, [stats]);

  // Check if user has a specific badge
  const hasBadge = useCallback((badgeKey: string) => {
    return userBadges?.some(ub => ub.badge?.badge_key === badgeKey) || false;
  }, [userBadges]);

  // Get badges by category
  const getBadgesByCategory = useCallback((category: string) => {
    return allBadges?.filter(b => b.category === category || b.category === 'universal') || [];
  }, [allBadges]);

  return {
    stats,
    statsLoading,
    allBadges,
    userBadges,
    achievements,
    xpHistory,
    claimDailyLogin,
    awardXP,
    awardBadge,
    getProgressToNextLevel,
    getUserTitle,
    getProfileFrame,
    hasBadge,
    getBadgesByCategory,
    LEVEL_TITLES,
    LEVEL_THRESHOLDS,
    PROFILE_FRAMES
  };
};

export default useGamification;
