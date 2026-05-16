import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Conversation {
  id: string;
  property_id: string | null;
  buyer_id: string;
  agent_id: string;
  last_message_at: string;
  last_message_preview: string | null;
  buyer_unread_count: number;
  agent_unread_count: number;
  is_archived: boolean;
  created_at: string;
  // Joined fields
  property_title?: string;
  property_image?: string;
  other_user_name?: string;
  other_user_avatar?: string;
  // Rental booking context
  source?: 'property' | 'rental';
  booking_id?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  attachment_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch property conversations
      const { data: propConvs, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${user.id},agent_id.eq.${user.id}`)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false });
      if (error) throw error;

      // Fetch rental booking conversations (from rental_messages)
      const { data: rentalMsgs } = await supabase
        .from('rental_messages')
        .select('booking_id, sender_id, message, created_at, is_read')
        .order('created_at', { ascending: false })
        .limit(500);

      // Group rental messages by booking
      const rentalByBooking = new Map<string, typeof rentalMsgs>();
      for (const m of rentalMsgs || []) {
        if (!rentalByBooking.has(m.booking_id)) rentalByBooking.set(m.booking_id, []);
        rentalByBooking.get(m.booking_id)!.push(m);
      }

      // Get booking info for rental conversations
      const bookingIds = Array.from(rentalByBooking.keys());
      let rentalConvs: Conversation[] = [];

      if (bookingIds.length > 0) {
        const { data: bookings } = await supabase
          .from('rental_bookings')
          .select('id, customer_id, property_id, properties(title, images, owner_id)')
          .in('id', bookingIds);

        for (const booking of bookings || []) {
          const prop = booking.properties as any;
          const ownerId = prop?.owner_id;
          const tenantId = booking.customer_id;

          // Only include if current user is tenant or owner
          if (user.id !== tenantId && user.id !== ownerId) continue;

          const msgs = rentalByBooking.get(booking.id) || [];
          const lastMsg = msgs[0];
          const unreadCount = msgs.filter(m => !m.is_read && m.sender_id !== user.id).length;
          const otherId = user.id === tenantId ? ownerId : tenantId;

          // Fetch other user profile
          let otherName = 'User';
          let otherAvatar: string | undefined;
          if (otherId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, avatar_url')
              .eq('id', otherId)
              .single();
            if (profile) {
              otherName = profile.full_name || 'User';
              otherAvatar = profile.avatar_url || undefined;
            }
          }

          const imgs = prop?.images as string[] | null;

          rentalConvs.push({
            id: `rental-${booking.id}`,
            property_id: booking.property_id,
            buyer_id: tenantId || '',
            agent_id: ownerId || '',
            last_message_at: lastMsg?.created_at || '',
            last_message_preview: lastMsg?.message?.substring(0, 100) || null,
            buyer_unread_count: user.id === tenantId ? unreadCount : 0,
            agent_unread_count: user.id === ownerId ? unreadCount : 0,
            is_archived: false,
            created_at: lastMsg?.created_at || '',
            property_title: prop?.title,
            property_image: imgs?.[0],
            other_user_name: otherName,
            other_user_avatar: otherAvatar,
            source: 'rental',
            booking_id: booking.id,
          });
        }
      }

      // Enrich property conversations
      const enriched: Conversation[] = [];
      for (const conv of propConvs || []) {
        const otherId = conv.buyer_id === user.id ? conv.agent_id : conv.buyer_id;
        let otherName = 'User';
        let otherAvatar: string | undefined;
        let propertyTitle: string | undefined;
        let propertyImage: string | undefined;

        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', otherId)
          .single();
        if (profile) {
          otherName = profile.full_name || 'User';
          otherAvatar = profile.avatar_url || undefined;
        }

        if (conv.property_id) {
          const { data: prop } = await supabase
            .from('properties')
            .select('title, images')
            .eq('id', conv.property_id)
            .single();
          if (prop) {
            propertyTitle = prop.title;
            const imgs = prop.images as string[] | null;
            propertyImage = imgs?.[0] || undefined;
          }
        }

        enriched.push({
          ...conv,
          other_user_name: otherName,
          other_user_avatar: otherAvatar,
          property_title: propertyTitle,
          property_image: propertyImage,
          source: 'property',
        });
      }

      // Merge and sort by last_message_at
      const all = [...enriched, ...rentalConvs].sort(
        (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
      );

      return all;
    },
    enabled: !!user?.id,
  });

  // Realtime subscription for conversation updates
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rental_messages' }, () => {
        queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id, queryClient]);

  const totalUnread = conversations.reduce((sum, c) => {
    if (!user?.id) return sum;
    return sum + (c.buyer_id === user.id ? c.buyer_unread_count : c.agent_unread_count);
  }, 0);

  return { conversations, isLoading, totalUnread };
};

export const useMessages = (conversationId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if this is a rental conversation
  const isRental = conversationId?.startsWith('rental-');
  const bookingId = isRental ? conversationId?.replace('rental-', '') : null;

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      if (isRental && bookingId) {
        // Fetch from rental_messages
        const { data, error } = await supabase
          .from('rental_messages')
          .select('id, booking_id, sender_id, message, is_read, created_at')
          .eq('booking_id', bookingId)
          .order('created_at', { ascending: true })
          .limit(200);
        if (error) throw error;
        // Map to Message interface
        return (data || []).map(m => ({
          id: m.id,
          conversation_id: conversationId,
          sender_id: m.sender_id,
          content: m.message,
          message_type: 'text',
          attachment_url: null,
          is_read: m.is_read,
          read_at: null,
          created_at: m.created_at,
        })) as Message[];
      }

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!conversationId,
  });

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    if (isRental && bookingId) {
      const channel = supabase
        .channel(`rental-inbox-${bookingId}`)
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'rental_messages',
          filter: `booking_id=eq.${bookingId}`,
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        queryClient.setQueryData(['messages', conversationId], (old: Message[] = []) => {
          const newMsg = payload.new as Message;
          if (old.find(m => m.id === newMsg.id)) return old;
          return [...old, newMsg];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, queryClient, isRental, bookingId]);

  // Mark messages as read
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    if (isRental && bookingId) {
      const unread = messages.filter(m => !m.is_read && m.sender_id !== user.id);
      if (unread.length > 0) {
        supabase
          .from('rental_messages')
          .update({ is_read: true })
          .in('id', unread.map(m => m.id))
          .then();
      }
      return;
    }

    const markRead = async () => {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      const { data: conv } = await supabase
        .from('conversations')
        .select('buyer_id')
        .eq('id', conversationId)
        .single();
      if (conv) {
        const field = conv.buyer_id === user.id ? 'buyer_unread_count' : 'agent_unread_count';
        await supabase
          .from('conversations')
          .update({ [field]: 0 })
          .eq('id', conversationId);
      }
    };
    markRead();
  }, [conversationId, user?.id, messages.length, isRental, bookingId]);

  const sendMessage = useMutation({
    mutationFn: async ({ content, messageType = 'text' }: { content: string; messageType?: string }) => {
      if (!conversationId || !user?.id) throw new Error('Not ready');

      if (isRental && bookingId) {
        const { error } = await supabase.from('rental_messages').insert({
          booking_id: bookingId,
          sender_id: user.id,
          message: content,
        });
        if (error) throw error;
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        return null;
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
        })
        .select()
        .single();
      if (error) throw error;

      // Update conversation
      const { data: conv } = await supabase
        .from('conversations')
        .select('buyer_id, agent_id')
        .eq('id', conversationId)
        .single();

      if (conv) {
        const unreadField = conv.buyer_id === user.id ? 'agent_unread_count' : 'buyer_unread_count';
        await supabase.rpc('increment_field' as any, {
          table_name: 'conversations',
          field_name: unreadField,
          row_id: conversationId,
        }).then(() => {}, async () => {
          const { data: current } = await supabase
            .from('conversations')
            .select(unreadField)
            .eq('id', conversationId)
            .single();
          if (current) {
            await supabase
              .from('conversations')
              .update({
                [unreadField]: ((current as any)[unreadField] || 0) + 1,
                last_message_at: new Date().toISOString(),
                last_message_preview: content.substring(0, 100),
              })
              .eq('id', conversationId);
          }
        });

        await supabase
          .from('conversations')
          .update({
            last_message_at: new Date().toISOString(),
            last_message_preview: content.substring(0, 100),
          })
          .eq('id', conversationId);
      }

      return data;
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
  };
};

export const useStartConversation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ agentId, propertyId, initialMessage }: {
      agentId: string;
      propertyId?: string;
      initialMessage: string;
    }) => {
      if (!user?.id) throw new Error('Must be logged in');

      let query = supabase
        .from('conversations')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('agent_id', agentId);

      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }

      const { data: existing } = await query.maybeSingle();

      let conversationId: string;
      if (existing) {
        conversationId = existing.id;
      } else {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            buyer_id: user.id,
            agent_id: agentId,
            property_id: propertyId || null,
            last_message_preview: initialMessage.substring(0, 100),
            agent_unread_count: 1,
          })
          .select()
          .single();
        if (error) throw error;
        conversationId = newConv.id;
      }

      await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: initialMessage,
        message_type: 'text',
      });

      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      return conversationId;
    },
  });
};
