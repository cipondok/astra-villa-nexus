import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { SupportTicket, TicketMessage, TicketCategory } from './types';

export const useTickets = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['support-tickets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }

      return data as SupportTicket[];
    },
    enabled: !!user?.id,
  });
};

export const useCreateTicket = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticketData: {
      category: TicketCategory;
      subject: string;
      description: string;
      priority?: string;
      related_order_id?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          category: ticketData.category,
          subject: ticketData.subject,
          description: ticketData.description,
          priority: ticketData.priority || 'normal',
          related_order_id: ticketData.related_order_id || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
      toast({
        title: 'Ticket Created',
        description: 'Your support ticket has been submitted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useTicketMessages = (ticketId: string | undefined) => {
  return useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: async () => {
      if (!ticketId) return [];

      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .eq('is_internal', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as TicketMessage[];
    },
    enabled: !!ticketId,
  });
};

export const useSendTicketMessage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: user.id,
          sender_type: 'user',
          message,
        })
        .select()
        .single();

      if (error) throw error;

      // Update ticket status to awaiting_response
      await supabase
        .from('support_tickets')
        .update({ status: 'awaiting_response', updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', variables.ticketId] });
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useTicketStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ticket-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, open: 0, resolved: 0 };

      const { data, error } = await supabase
        .from('support_tickets')
        .select('status')
        .eq('user_id', user.id);

      if (error) throw error;

      return {
        total: data.length,
        open: data.filter(t => ['open', 'in_progress', 'awaiting_response'].includes(t.status)).length,
        resolved: data.filter(t => ['resolved', 'closed'].includes(t.status)).length,
      };
    },
    enabled: !!user?.id,
  });
};
