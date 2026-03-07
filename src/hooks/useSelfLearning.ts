import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { throwIfEdgeFunctionReturnedError } from '@/lib/supabaseFunctionErrors';

export interface FeedbackInput {
  feedback_property_id: string;
  ai_match_score?: number;
  user_action: 'view' | 'save' | 'contact' | 'visit' | 'ignore' | 'dismiss';
  source?: string;
  session_id?: string;
}

export interface LearningStats {
  current_weights: Record<string, number> | null;
  learning_stats: {
    total_signals_30d: number;
    positive_signals: number;
    negative_signals: number;
    neutral_signals: number;
    conversion_rate: number;
    avg_match_score: number;
    action_breakdown: Record<string, number>;
  };
  signal_trend: { date: string; positive: number; negative: number; total: number }[];
  model_evolution: { date: string; accuracy: number; confidence: number; signals_processed: number; positive_ratio: number }[];
  training_history: any[];
  generated_at: string;
}

export interface TrainResult {
  training_complete: boolean;
  old_weights: Record<string, number>;
  new_weights: Record<string, number>;
  adjustments: Record<string, number>;
  model_metrics: {
    accuracy: number;
    confidence: number;
    learning_rate: number;
    total_signals: number;
    positive_signals: number;
    negative_signals: number;
    pos_ratio: number;
    data_sufficiency: string;
  };
  generated_at: string;
}

export const useRecordFeedback = () => {
  return useMutation({
    mutationFn: async (input: FeedbackInput) => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'self_learning', sub_mode: 'record_feedback', ...input },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
  });
};

export const useLearningStats = () => {
  return useQuery({
    queryKey: ['self-learning-stats'],
    queryFn: async (): Promise<LearningStats> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'self_learning', sub_mode: 'stats' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTrainModel = () => {
  return useMutation({
    mutationFn: async (): Promise<TrainResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'self_learning', sub_mode: 'train' },
      });
      if (error) throw error;
      throwIfEdgeFunctionReturnedError(data);
      return data?.data;
    },
  });
};
