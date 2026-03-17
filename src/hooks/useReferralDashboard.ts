import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface ReferralDashboardData {
  affiliate: any;
  stats: {
    total_referrals: number;
    pending: number;
    converted: number;
    total_earnings: number;
    pending_earnings: number;
    paid_earnings: number;
  };
  milestones: { level: number; name: string; threshold: number; reward: number; desc: string }[];
  current_milestone: { level: number; name: string; threshold: number; reward: number };
  next_milestone: { level: number; name: string; threshold: number; reward: number };
  milestone_progress: number;
  leaderboard: {
    rank: number;
    user_id: string;
    name: string;
    avatar_url: string | null;
    total_referrals: number;
    total_earnings: number;
    is_current_user: boolean;
  }[];
  recent_activity: {
    id: string;
    status: string;
    source_channel: string | null;
    referee_email: string | null;
    reward_amount: number | null;
    created_at: string;
    converted_at: string | null;
  }[];
  commissions: any[];
}

async function callReferralEngine(action: string, extra?: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke("referral-engine", {
    body: { action, ...extra },
  });
  if (error) throw error;
  throwIfEdgeFunctionReturnedError(data);
  return data;
}

export function useReferralDashboard() {
  const { user } = useAuth();
  return useQuery<ReferralDashboardData>({
    queryKey: ["referral-dashboard-full", user?.id],
    queryFn: () => callReferralEngine("get_dashboard"),
    enabled: !!user?.id,
    staleTime: 60_000,
  });
}

export function useJoinReferralProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => callReferralEngine("join_program"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referral-dashboard-full"] }),
  });
}

export function useApplyAffiliatePartner() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => callReferralEngine("apply_affiliate_partner"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["referral-dashboard-full"] }),
  });
}
