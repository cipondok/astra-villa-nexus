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
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${user.id},agent_id.eq.${user.id}`)
        .eq('is_archived', false)
        .order('last_message_at', { ascending: false });
      if (error) throw error;

      // Enrich with property and user info
      const enriched: Conversation[] = [];
      for (const conv of data || []) {
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
        });
      }
      return enriched;
    },
    enabled: !!user?.id,
  });

  // Realtime subscription for conversation updates
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations',
      }, () => {
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

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
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

  // Realtime subscription for new messages
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
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
  }, [conversationId, queryClient]);

  // Mark messages as read
  useEffect(() => {
    if (!conversationId || !user?.id) return;
    const markRead = async () => {
      await supabase
        .from('messages')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('is_read', false);

      // Reset unread count
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
  }, [conversationId, user?.id, messages.length]);

  const sendMessage = useMutation({
    mutationFn: async ({ content, messageType = 'text' }: { content: string; messageType?: string }) => {
      if (!conversationId || !user?.id) throw new Error('Not ready');

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
          // Fallback: manual increment
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

        // Always update last message
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

      // Check for existing conversation
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

      // Send the initial message
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
