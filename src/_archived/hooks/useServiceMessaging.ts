import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface StartServiceConversationParams {
  otherUserId: string;
  conversationType: 'service' | 'legal' | 'general';
  participantRoleA: string;
  participantRoleB: string;
  serviceBookingId?: string;
  legalCaseId?: string;
  initialMessage: string;
  propertyId?: string;
}

/**
 * Start a conversation between any two platform participants
 * (service provider ↔ client, legal consultant ↔ customer, etc.)
 */
export function useStartServiceConversation() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      otherUserId,
      conversationType,
      participantRoleA,
      participantRoleB,
      serviceBookingId,
      legalCaseId,
      initialMessage,
      propertyId,
    }: StartServiceConversationParams) => {
      if (!user?.id) throw new Error('Must be logged in');

      // Check for existing conversation
      let query = supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('agent_id', otherUserId)
        .eq('conversation_type', conversationType);

      if (serviceBookingId) query = query.eq('service_booking_id', serviceBookingId);
      if (legalCaseId) query = query.eq('legal_case_id', legalCaseId);

      const { data: existing } = await query.maybeSingle();

      let conversationId: string;
      if (existing) {
        conversationId = existing.id;
      } else {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            buyer_id: user.id,
            agent_id: otherUserId,
            property_id: propertyId || null,
            conversation_type: conversationType,
            participant_role_a: participantRoleA,
            participant_role_b: participantRoleB,
            service_booking_id: serviceBookingId || null,
            legal_case_id: legalCaseId || null,
            last_message_preview: initialMessage.substring(0, 100),
            agent_unread_count: 1,
          })
          .select()
          .single();
        if (error) throw error;
        conversationId = newConv.id;
      }

      // Send initial message
      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: initialMessage,
        message_type: 'text',
      });
      if (msgError) throw msgError;

      return conversationId;
    },
  });
}
