import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';

export type ActivationMilestone = 
  | 'first_search'
  | 'first_save'
  | 'first_insight_view'
  | 'first_inquiry';

interface MilestoneRecord {
  milestone_type: ActivationMilestone;
  completed_at: string;
}

export function useActivationMilestones() {
  const { user } = useAuth();

  // Fetch completed milestones
  const { data: completedMilestones = [], refetch } = useQuery({
    queryKey: ['activation-milestones', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_activation_milestones')
        .select('milestone_type, completed_at')
        .eq('user_id', user.id);
      if (error) { console.warn('Failed to fetch milestones:', error); return []; }
      return (data || []) as MilestoneRecord[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60_000,
  });

  const completedTypes = new Set(completedMilestones.map(m => m.milestone_type));

  const isMilestoneCompleted = useCallback(
    (type: ActivationMilestone) => completedTypes.has(type),
    [completedTypes]
  );

  const completeMilestone = useCallback(async (
    type: ActivationMilestone,
    metadata?: Record<string, unknown>
  ) => {
    if (!user?.id || completedTypes.has(type)) return;

    try {
      const { error } = await supabase
        .from('user_activation_milestones')
        .upsert({
          user_id: user.id,
          milestone_type: type,
          completed_at: new Date().toISOString(),
          metadata: metadata || {},
        }, { onConflict: 'user_id,milestone_type' });

      if (error) console.warn('Failed to record milestone:', error);
      else refetch();
    } catch (e) {
      console.warn('Milestone tracking error:', e);
    }
  }, [user?.id, completedTypes, refetch]);

  const activationProgress = {
    total: 4,
    completed: completedTypes.size,
    percentage: Math.round((completedTypes.size / 4) * 100),
    isActivated: completedTypes.size >= 2,
    milestones: {
      first_search: completedTypes.has('first_search'),
      first_save: completedTypes.has('first_save'),
      first_insight_view: completedTypes.has('first_insight_view'),
      first_inquiry: completedTypes.has('first_inquiry'),
    }
  };

  return {
    completedMilestones,
    isMilestoneCompleted,
    completeMilestone,
    activationProgress,
    isNewUser: !!user && completedTypes.size < 2,
  };
}

// Hook for activation dashboard stats (admin)
export function useActivationDashboardStats(daysBack: number = 30) {
  return useQuery({
    queryKey: ['activation-dashboard-stats', daysBack],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_activation_dashboard_stats', {
        days_back: daysBack,
      });
      if (error) throw error;
      return data as {
        total_new_users: number;
        activated_users: number;
        activation_rate: number;
        avg_time_to_search_minutes: number;
        avg_time_to_save_minutes: number;
        avg_time_to_insight_minutes: number;
        avg_time_to_inquiry_minutes: number;
        funnel: {
          signed_up: number;
          first_search: number;
          first_save: number;
          first_insight_view: number;
          first_inquiry: number;
        };
      };
    },
    staleTime: 5 * 60_000,
  });
}
