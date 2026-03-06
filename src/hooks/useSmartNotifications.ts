import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { throwIfEdgeFunctionReturnedError } from "@/lib/supabaseFunctionErrors";

export interface SmartNotificationInput {
  user_id: string;
  user_behavior?: {
    avg_active_hours?: number[];
    most_viewed_types?: string[];
    most_viewed_cities?: string[];
    search_frequency?: string;
    price_range?: { min: number; max: number };
    last_login?: string;
    total_views_30d?: number;
    saved_properties?: number;
    inquiries_sent?: number;
  };
  notification_history?: {
    total_sent_30d?: number;
    open_rate?: number;
    click_rate?: number;
    unsubscribe_rate?: number;
    most_engaged_types?: string[];
  };
  preferences?: {
    channels?: string[];
    frequency?: string;
    quiet_hours?: { start: number; end: number };
  };
}

export interface OptimalSendTime {
  hour: number;
  day_of_week: string;
  confidence: number;
  reasoning: string;
}

export interface PersonalizedAlert {
  alert_type: "price_drop" | "new_listing" | "market_trend" | "investment_opportunity" | "viewing_reminder" | "similar_property" | "price_milestone";
  priority: "high" | "medium" | "low";
  title: string;
  message: string;
  recommended_channel: "push" | "email" | "sms" | "in_app";
  trigger_condition: string;
  estimated_relevance_score: number;
}

export interface SmartNotificationResult {
  optimal_send_times: OptimalSendTime[];
  recommended_frequency: {
    daily_max: number;
    weekly_max: number;
    reasoning: string;
  };
  personalized_alerts: PersonalizedAlert[];
  engagement_insights: {
    engagement_level: "highly_engaged" | "moderately_engaged" | "at_risk" | "dormant";
    churn_risk: number;
    re_engagement_strategy: string;
    content_preferences: string[];
    fatigue_risk: "low" | "medium" | "high";
  };
  channel_optimization: {
    primary_channel: string;
    secondary_channel: string;
    channel_scores: {
      push: number;
      email: number;
      sms: number;
      in_app: number;
    };
    reasoning: string;
  };
  summary: string;
}

export function useSmartNotifications() {
  return useMutation({
    mutationFn: async (input: SmartNotificationInput): Promise<SmartNotificationResult> => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { mode: "smart_notifications", payload: input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data as SmartNotificationResult;
    },
  });
}
