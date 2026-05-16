import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SurveyBooking {
  id: string;
  property_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  preferred_date: string;
  preferred_time: string;
  message: string;
  status: string;
  survey_type: string;
  property_title: string;
  property_location: string;
  agent_name: string;
  admin_notes: string;
  created_at: string;
  updated_at: string;
  has_full_access: boolean;
}

export const useSurveyBookings = (propertyId?: string, limit = 50, offset = 0) => {
  return useQuery({
    queryKey: ['survey-bookings', propertyId, limit, offset],
    queryFn: async (): Promise<SurveyBooking[]> => {
      const { data, error } = await supabase.rpc('get_survey_bookings_secure', {
        p_property_id: propertyId || null,
        p_limit: limit,
        p_offset: offset
      });

      if (error) {
        console.error('Error fetching survey bookings:', error);
        throw new Error(error.message);
      }

      return data || [];
    },
    enabled: true, // Always enabled since function handles access control
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
};

export const useSurveyBookingStats = (propertyId?: string) => {
  return useQuery({
    queryKey: ['survey-booking-stats', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_survey_booking_stats_secure', {
        p_property_id: propertyId || null
      });

      if (error) {
        console.error('Error fetching booking stats:', error);
        throw new Error(error.message);
      }

      return data;
    },
    enabled: true,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    refetchOnWindowFocus: false,
  });
};

export const useMyPropertyBookingCount = () => {
  return useQuery({
    queryKey: ['my-property-booking-count'],
    queryFn: async (): Promise<number> => {
      const { data, error } = await supabase.rpc('get_my_property_booking_count');

      if (error) {
        console.error('Error fetching booking count:', error);
        throw new Error(error.message);
      }

      return data || 0;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};