import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface PropertyVisit {
  id: string;
  property_id: string;
  visitor_id: string;
  agent_id: string;
  visit_date: string;
  start_time: string;
  end_time: string;
  status: string;
  visitor_name: string | null;
  visitor_phone: string | null;
  visitor_email: string | null;
  notes: string | null;
  cancellation_reason: string | null;
  confirmed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentAvailability {
  id: string;
  agent_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  slot_duration_minutes: number;
}

export interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
}

export function useMyVisits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['my-visits', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('property_visits')
        .select('*')
        .eq('visitor_id', user.id)
        .order('visit_date', { ascending: true });
      if (error) throw error;
      return data as PropertyVisit[];
    },
    enabled: !!user,
  });

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('my-visits-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'property_visits',
        filter: `visitor_id=eq.${user.id}`,
      }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ['my-visits', user.id] });
        if (payload.eventType === 'UPDATE') {
          const newStatus = (payload.new as PropertyVisit).status;
          if (newStatus === 'confirmed') {
            toast.success('Your property visit has been confirmed!');
          } else if (newStatus === 'cancelled') {
            toast.info('A property visit has been cancelled.');
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  return query;
}

export function useAgentVisits() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['agent-visits', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('property_visits')
        .select('*')
        .eq('agent_id', user.id)
        .order('visit_date', { ascending: true });
      if (error) throw error;
      return data as PropertyVisit[];
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('agent-visits-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'property_visits',
        filter: `agent_id=eq.${user.id}`,
      }, () => {
        queryClient.invalidateQueries({ queryKey: ['agent-visits', user.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, queryClient]);

  const updateStatus = useMutation({
    mutationFn: async ({ visitId, status }: { visitId: string; status: string }) => {
      const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();
      if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();

      const { error } = await supabase
        .from('property_visits')
        .update(updates)
        .eq('id', visitId)
        .eq('agent_id', user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-visits'] });
      toast.success('Visit status updated');
    },
    onError: () => toast.error('Failed to update visit status'),
  });

  return { ...query, updateStatus };
}

export function useAgentAvailability(agentId?: string) {
  const { user } = useAuth();
  const targetId = agentId || user?.id;

  return useQuery({
    queryKey: ['agent-availability', targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const { data, error } = await supabase
        .from('agent_availability')
        .select('*')
        .eq('agent_id', targetId)
        .eq('is_available', true)
        .order('day_of_week');
      if (error) throw error;
      return data as AgentAvailability[];
    },
    enabled: !!targetId,
  });
}

export function useAgentBlockedDates(agentId?: string) {
  const { user } = useAuth();
  const targetId = agentId || user?.id;

  return useQuery({
    queryKey: ['agent-blocked-dates', targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const { data, error } = await supabase
        .from('agent_blocked_dates')
        .select('*')
        .eq('agent_id', targetId);
      if (error) throw error;
      return data;
    },
    enabled: !!targetId,
  });
}

export function useBookVisit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: {
      property_id: string;
      agent_id: string;
      visit_date: string;
      start_time: string;
      end_time: string;
      visitor_name?: string;
      visitor_phone?: string;
      visitor_email?: string;
      notes?: string;
    }) => {
      if (!user) throw new Error('Must be logged in');
      const { error } = await supabase
        .from('property_visits')
        .insert({
          ...booking,
          visitor_id: user.id,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-visits'] });
      toast.success('Visit booked! Waiting for agent confirmation.');
    },
    onError: () => toast.error('Failed to book visit'),
  });
}

export function useSaveAvailability() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slots: Omit<AgentAvailability, 'id' | 'agent_id'>[]) => {
      if (!user) throw new Error('Must be logged in');
      // Delete existing and re-insert
      await supabase.from('agent_availability').delete().eq('agent_id', user.id);
      if (slots.length > 0) {
        const { error } = await supabase
          .from('agent_availability')
          .insert(slots.map(s => ({ ...s, agent_id: user.id })));
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-availability'] });
      toast.success('Availability saved');
    },
    onError: () => toast.error('Failed to save availability'),
  });
}

export function generateTimeSlots(
  availability: AgentAvailability[],
  date: Date,
  existingVisits: PropertyVisit[],
  blockedDates: string[]
): TimeSlot[] {
  const dateStr = date.toISOString().split('T')[0];
  if (blockedDates.includes(dateStr)) return [];

  const dayOfWeek = date.getDay();
  const daySlots = availability.filter(a => a.day_of_week === dayOfWeek && a.is_available);
  if (daySlots.length === 0) return [];

  const slots: TimeSlot[] = [];
  for (const avail of daySlots) {
    const duration = avail.slot_duration_minutes;
    const [startH, startM] = avail.start_time.split(':').map(Number);
    const [endH, endM] = avail.end_time.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    for (let m = startMinutes; m + duration <= endMinutes; m += duration) {
      const sh = String(Math.floor(m / 60)).padStart(2, '0');
      const sm = String(m % 60).padStart(2, '0');
      const eh = String(Math.floor((m + duration) / 60)).padStart(2, '0');
      const em = String((m + duration) % 60).padStart(2, '0');
      const startTime = `${sh}:${sm}:00`;
      const endTime = `${eh}:${em}:00`;

      const booked = existingVisits.some(
        v => v.visit_date === dateStr && v.start_time === startTime && ['pending', 'confirmed'].includes(v.status)
      );

      slots.push({ start_time: startTime, end_time: endTime, available: !booked });
    }
  }
  return slots;
}
