import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PropertyViewing {
  id: string;
  property_id: string;
  agent_id: string;
  investor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  viewing_type: string;
  location_notes: string | null;
  agent_notes: string | null;
  investor_notes: string | null;
  feedback_rating: number | null;
  feedback_text: string | null;
  offer_triggered: boolean;
  offer_probability: number;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export const usePropertyViewings = (filters?: { agentId?: string; investorId?: string; propertyId?: string; status?: string }) => {
  const queryClient = useQueryClient();

  const viewingsQuery = useQuery({
    queryKey: ['property-viewings', filters],
    queryFn: async () => {
      let query = supabase.from('property_viewings').select('*').order('scheduled_at', { ascending: true });
      if (filters?.agentId) query = query.eq('agent_id', filters.agentId);
      if (filters?.investorId) query = query.eq('investor_id', filters.investorId);
      if (filters?.propertyId) query = query.eq('property_id', filters.propertyId);
      if (filters?.status) query = query.eq('status', filters.status);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as PropertyViewing[];
    },
  });

  const scheduleViewing = useMutation({
    mutationFn: async (viewing: Omit<PropertyViewing, 'id' | 'created_at' | 'updated_at' | 'confirmed_at' | 'completed_at' | 'cancelled_at' | 'cancellation_reason' | 'feedback_rating' | 'feedback_text' | 'offer_triggered'>) => {
      const { data, error } = await supabase.from('property_viewings').insert(viewing as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-viewings'] });
      toast.success('Viewing scheduled successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateViewingStatus = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
      if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();
      if (status === 'completed') updates.completed_at = new Date().toISOString();
      if (status === 'cancelled') {
        updates.cancelled_at = new Date().toISOString();
        if (notes) updates.cancellation_reason = notes;
      }
      const { data, error } = await supabase.from('property_viewings').update(updates as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-viewings'] });
      toast.success('Viewing updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return { viewings: viewingsQuery.data || [], isLoading: viewingsQuery.isLoading, scheduleViewing, updateViewingStatus };
};
