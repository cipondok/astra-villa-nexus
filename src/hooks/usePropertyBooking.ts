import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PropertyBooking {
  id: string;
  property_id: string;
  user_id: string;
  owner_id: string | null;
  booking_type: 'viewing' | 'rental' | 'purchase_inquiry';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  notes: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  properties?: {
    id: string;
    title: string;
    location: string;
    city: string;
    images: string[];
    owner_id: string;
  };
  requester?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

interface CreateBookingData {
  property_id: string;
  booking_type: 'viewing' | 'rental' | 'purchase_inquiry';
  scheduled_date: string;
  scheduled_time: string;
  notes?: string;
  contact_phone?: string;
  contact_email?: string;
}

export function usePropertyBooking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's bookings
  const { data: myBookings, isLoading: loadingMyBookings } = useQuery({
    queryKey: ['my-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('property_bookings')
        .select(`
          *,
          properties:property_id (id, title, location, city, images, owner_id)
        `)
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data as PropertyBooking[];
    },
    enabled: !!user?.id,
  });

  // Fetch bookings for properties I own
  const { data: receivedBookings, isLoading: loadingReceivedBookings } = useQuery({
    queryKey: ['received-bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('property_bookings')
        .select(`
          *,
          properties:property_id (id, title, location, city, images, owner_id),
          requester:profiles!property_bookings_user_id_fkey (id, full_name, email, avatar_url)
        `)
        .eq('owner_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      return data as PropertyBooking[];
    },
    enabled: !!user?.id,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: CreateBookingData) => {
      if (!user?.id) throw new Error('Must be logged in');

      // Get property owner
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('owner_id')
        .eq('id', data.property_id)
        .single();

      if (propError) throw propError;

      const { data: booking, error } = await supabase
        .from('property_bookings')
        .insert({
          ...data,
          user_id: user.id,
          owner_id: property.owner_id,
        })
        .select()
        .single();

      if (error) throw error;
      return booking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Booking request submitted!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create booking');
    },
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ 
      bookingId, 
      status, 
      cancellationReason 
    }: { 
      bookingId: string; 
      status: string; 
      cancellationReason?: string;
    }) => {
      const updateData: Record<string, any> = { status };

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancelled_by = user?.id;
        updateData.cancellation_reason = cancellationReason;
      }

      const { data, error } = await supabase
        .from('property_bookings')
        .update(updateData)
        .eq('id', bookingId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['received-bookings'] });
      
      const statusMessages: Record<string, string> = {
        confirmed: 'Booking confirmed!',
        completed: 'Booking marked as completed',
        cancelled: 'Booking cancelled',
      };
      toast.success(statusMessages[variables.status] || 'Booking updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update booking');
    },
  });

  return {
    myBookings: myBookings || [],
    receivedBookings: receivedBookings || [],
    isLoading: loadingMyBookings || loadingReceivedBookings,
    createBooking: createBookingMutation.mutate,
    updateBooking: updateBookingMutation.mutate,
    isCreating: createBookingMutation.isPending,
    isUpdating: updateBookingMutation.isPending,
  };
}
