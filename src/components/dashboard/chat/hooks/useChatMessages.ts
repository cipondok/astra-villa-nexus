import { useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { ChatMessage } from "../types/chatTypes";

export const useChatMessages = (sessionId: string | null) => {
  const { user } = useAuth();
  const { showError } = useAlert();
  const queryClient = useQueryClient();

  // Fetch messages for selected session
  const {
    data: messages = [],
    isLoading: messagesLoading,
    error: messagesError
  } = useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: async (): Promise<ChatMessage[]> => {
      if (!sessionId) return [];
      
      const { data, error } = await supabase
        .from('live_chat_messages')
        .select(`
          id,
          session_id,
          sender_user_id,
          sender_type,
          content,
          message_type,
          is_read,
          created_at,
          metadata
        `)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return (data || []) as ChatMessage[];
    },
    enabled: !!sessionId,
    refetchInterval: 2000, // Refresh every 2 seconds for active chats
  });

  // Send message mutation with optimistic updates
  const sendMessageMutation = useMutation({
    mutationFn: async ({ sessionId, content }: { sessionId: string; content: string }) => {
      const messageData = {
        session_id: sessionId,
        sender_user_id: user?.id,
        sender_type: 'agent' as const,
        content: content.trim(),
        message_type: 'text' as const,
        metadata: {}
      };

      const { error } = await supabase
        .from('live_chat_messages')
        .insert([messageData]);
      
      if (error) throw error;

      // Update session last activity
      await supabase
        .from('live_chat_sessions')
        .update({ last_activity_at: new Date().toISOString() })
        .eq('id', sessionId);

      return messageData;
    },
    onMutate: async ({ sessionId, content }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat-messages', sessionId] });
      
      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<ChatMessage[]>(['chat-messages', sessionId]);
      
      // Create optimistic message
      const optimisticMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        session_id: sessionId,
        sender_user_id: user?.id || null,
        sender_type: 'agent',
        message_type: 'text',
        content: content.trim(),
        metadata: {},
        is_read: false,
        created_at: new Date().toISOString()
      };
      
      // Optimistically update
      queryClient.setQueryData<ChatMessage[]>(['chat-messages', sessionId], (old = []) => 
        [...old, optimisticMessage]
      );
      
      return { previousMessages, optimisticMessage };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat-messages', variables.sessionId], context.previousMessages);
      }
      console.error('Error sending message:', error);
      showError("Send Failed", "Failed to send message.");
    },
    onSuccess: (data, variables) => {
      // Remove optimistic message and add real one
      queryClient.setQueryData<ChatMessage[]>(['chat-messages', variables.sessionId], (old = []) => {
        // Remove temporary message and let refetch handle the real one
        return old.filter(msg => !msg.id.startsWith('temp-'));
      });
    },
    onSettled: (data, error, variables) => {
      // Always refetch to get the real message with server-generated ID
      queryClient.invalidateQueries({ queryKey: ['chat-messages', variables.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['live-chat-sessions'] });
    }
  });

  // Mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageIds: string[]) => {
      const { error } = await supabase
        .from('live_chat_messages')
        .update({ is_read: true })
        .in('id', messageIds)
        .eq('sender_type', 'customer'); // Only mark customer messages as read
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', sessionId] });
    }
  });

  // Real-time subscription for messages
  useEffect(() => {
    if (!sessionId) return;

    const messagesChannel = supabase
      .channel(`chat-messages-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          // Add new message to cache
          queryClient.setQueryData<ChatMessage[]>(['chat-messages', sessionId], (old = []) => {
            // Check if message already exists (prevent duplicates)
            const exists = old.some(msg => msg.id === payload.new.id);
            if (exists) return old;
            
            return [...old, payload.new as ChatMessage];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [sessionId, queryClient]);

  // Memoized handlers
  const handleSendMessage = useCallback((content: string) => {
    if (!sessionId || !content.trim()) return;
    sendMessageMutation.mutate({ sessionId, content });
  }, [sessionId, sendMessageMutation]);

  const handleMarkAsRead = useCallback((messageIds: string[]) => {
    if (messageIds.length === 0) return;
    markAsReadMutation.mutate(messageIds);
  }, [markAsReadMutation]);

  return {
    messages,
    isLoading: messagesLoading,
    error: messagesError,
    onSendMessage: handleSendMessage,
    onMarkAsRead: handleMarkAsRead,
    isSending: sendMessageMutation.isPending,
    isMarkingRead: markAsReadMutation.isPending,
  };
};