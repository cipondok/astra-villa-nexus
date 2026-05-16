import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TourStop {
  order: number;
  property_id: string;
  title: string;
  city: string;
  state: string | null;
  area: string | null;
  location: string;
  latitude: number;
  longitude: number;
  has_coordinates: boolean;
  price: number;
  property_type: string;
  thumbnail_url: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  building_area_sqm: number | null;
  visit_time: string;
  visit_end: string;
  visit_duration_min: number;
  travel_to_next_min: number;
  distance_to_next_km: number;
}

export interface TourPlanResult {
  tour_plan: TourStop[];
  summary: {
    total_properties: number;
    start_time: string;
    end_time: string;
    total_tour_minutes: number;
    total_travel_minutes: number;
    total_visit_minutes: number;
    total_distance_km: number;
    visit_duration_per_property: number;
    cross_city: boolean;
  };
  tips: string[];
  generated_at: string;
}

export interface TourPlanInput {
  property_ids: string[];
  start_hour?: number;
  visit_duration?: number;
}

export function useTourPlanner() {
  return useMutation({
    mutationFn: async (input: TourPlanInput): Promise<TourPlanResult> => {
      const { data, error } = await supabase.functions.invoke('core-engine', {
        body: { mode: 'smart_tour_planner', ...input },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.data as TourPlanResult;
    },
    onSuccess: (data) => {
      toast.success(`Rute tur optimal: ${data.tour_plan.length} properti, ${data.summary.total_distance_km} km`);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Gagal merencanakan tur');
    },
  });
}
