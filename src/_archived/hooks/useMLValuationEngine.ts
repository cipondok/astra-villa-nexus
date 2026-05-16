import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════
// ML VALUATION ENGINE DATA HOOKS
// ═══════════════════════════════════════════════════════════

export interface MLValuationModel {
  id: string;
  model_version: string;
  model_type: string;
  description: string | null;
  feature_weights: Record<string, number>;
  training_sample_size: number;
  mae: number;
  mape: number;
  r_squared: number;
  median_error_pct: number;
  is_active: boolean;
  is_shadow: boolean;
  trained_at: string;
  promoted_at: string | null;
  retired_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface MLValuationPrediction {
  id: string;
  property_id: string;
  model_id: string | null;
  predicted_value: number;
  predicted_range_low: number;
  predicted_range_high: number;
  confidence_score: number;
  trend_direction: string;
  trend_magnitude: number;
  price_per_sqm: number;
  comparables_used: number;
  feature_contributions: Record<string, number>;
  macro_adjustments: Record<string, number>;
  demand_multiplier: number;
  seasonality_factor: number;
  city: string | null;
  property_type: string | null;
  valid_until: string;
  created_at: string;
}

export interface MLValuationFeedback {
  id: string;
  prediction_id: string | null;
  property_id: string;
  predicted_value: number;
  actual_value: number;
  error_amount: number;
  error_pct: number;
  feedback_type: string;
  feedback_source: string;
  notes: string | null;
  created_at: string;
}

export interface MLTrainingRun {
  id: string;
  model_id: string | null;
  trigger_source: string;
  training_samples: number;
  validation_samples: number;
  mae_before: number | null;
  mae_after: number | null;
  mape_before: number | null;
  mape_after: number | null;
  r_squared_before: number | null;
  r_squared_after: number | null;
  weight_adjustments: Record<string, unknown>;
  drift_detected: boolean;
  drift_magnitude: number;
  duration_ms: number;
  status: string;
  error_message: string | null;
  created_at: string;
}

export interface MLCityStats {
  id: string;
  city: string;
  property_type: string | null;
  avg_price_per_sqm: number;
  median_price_per_sqm: number;
  sample_count: number;
  yoy_change_pct: number;
  qoq_change_pct: number;
  demand_index: number;
  supply_index: number;
  absorption_rate: number;
  avg_days_on_market: number;
  snapshot_date: string;
  created_at: string;
}

// --- Active model ---
export function useActiveValuationModel() {
  return useQuery({
    queryKey: ['ml-valuation-model-active'],
    queryFn: async (): Promise<MLValuationModel | null> => {
      const { data, error } = await supabase
        .from('ml_valuation_models')
        .select('*')
        .eq('is_active', true)
        .order('trained_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as MLValuationModel | null;
    },
    staleTime: 60_000,
  });
}

// --- All models ---
export function useValuationModels() {
  return useQuery({
    queryKey: ['ml-valuation-models'],
    queryFn: async (): Promise<MLValuationModel[]> => {
      const { data, error } = await supabase
        .from('ml_valuation_models')
        .select('*')
        .order('trained_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data || []) as unknown as MLValuationModel[];
    },
    staleTime: 60_000,
  });
}

// --- Recent predictions ---
export function useRecentPredictions(limit = 50) {
  return useQuery({
    queryKey: ['ml-valuation-predictions', limit],
    queryFn: async (): Promise<MLValuationPrediction[]> => {
      const { data, error } = await supabase
        .from('ml_valuation_predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as MLValuationPrediction[];
    },
    staleTime: 30_000,
  });
}

// --- Feedback signals ---
export function useValuationFeedback(limit = 100) {
  return useQuery({
    queryKey: ['ml-valuation-feedback', limit],
    queryFn: async (): Promise<MLValuationFeedback[]> => {
      const { data, error } = await supabase
        .from('ml_valuation_feedback')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as MLValuationFeedback[];
    },
    staleTime: 60_000,
  });
}

// --- Training runs ---
export function useTrainingRuns(limit = 20) {
  return useQuery({
    queryKey: ['ml-valuation-training-runs', limit],
    queryFn: async (): Promise<MLTrainingRun[]> => {
      const { data, error } = await supabase
        .from('ml_valuation_training_runs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data || []) as unknown as MLTrainingRun[];
    },
    staleTime: 60_000,
  });
}

// --- City stats ---
export function useCityValuationStats() {
  return useQuery({
    queryKey: ['ml-valuation-city-stats'],
    queryFn: async (): Promise<MLCityStats[]> => {
      const { data, error } = await supabase
        .from('ml_valuation_city_stats')
        .select('*')
        .order('snapshot_date', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []) as unknown as MLCityStats[];
    },
    staleTime: 120_000,
  });
}
