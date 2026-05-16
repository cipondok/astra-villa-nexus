import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { ChatSession } from "../types/chatTypes";

export const useChatSessions = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useAlert();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch live chat sessions with optimistic updates
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    error: sessionsError
  } = useQuery({
    queryKey: ['live-chat-sessions'],
    queryFn: async (): Promise<ChatSession[]> => {
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select(`
          id,
          customer_user_id,
          customer_name,
          customer_email,
          agent_user_id,
          status,
          subject,
          priority,
          started_at,
          ended_at,
          last_activity_at,
          customer_ip,
          user_agent,
          referrer_url,
          created_at,
          updated_at
        `)
        .in('status', ['waiting', 'active'])
        .order('last_activity_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as ChatSession[];
    },
    refetchInterval: 10000, // Refresh every 10 seconds (real-time handles updates)
  });

  // Real-time subscription for session updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('chat-sessions-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_chat_sessions',
        },
        () => {
          // Invalidate and refetch sessions when any change occurs
          queryClient.invalidateQueries({ queryKey: ['live-chat-sessions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Memoized filtered and sorted sessions for performance
  const filteredSessions = useMemo(() => {
    if (!sessions) return [];
    
    let filtered = sessions;
    
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = sessions.filter(session => 
        session.customer_name.toLowerCase().includes(searchLower) ||
        session.customer_email?.toLowerCase().includes(searchLower) ||
        session.subject?.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by priority and activity
    return filtered.sort((a, b) => {
      // Priority order: urgent > high > medium > low
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // If same priority, sort by last activity
      return new Date(b.last_activity_at).getTime() - new Date(a.last_activity_at).getTime();
    });
  }, [sessions, searchTerm]);

  // Assign chat session to current agent
  const assignChatMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('live_chat_sessions')
        .update({ 
          agent_user_id: user?.id,
          status: 'active' as const,
          last_activity_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) throw error;
      return sessionId;
    },
    onMutate: async (sessionId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['live-chat-sessions'] });
      
      // Snapshot previous value
      const previousSessions = queryClient.getQueryData<ChatSession[]>(['live-chat-sessions']);
      
      // Optimistically update
      queryClient.setQueryData<ChatSession[]>(['live-chat-sessions'], (old = []) => 
        old.map(session => 
          session.id === sessionId 
            ? { 
                ...session, 
                agent_user_id: user?.id || null, 
                status: 'active' as const,
                last_activity_at: new Date().toISOString()
              }
            : session
        )
      );
      
      return { previousSessions };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousSessions) {
        queryClient.setQueryData(['live-chat-sessions'], context.previousSessions);
      }
      console.error('Error assigning chat:', error);
      showError("Assignment Failed", "Failed to assign chat session.");
    },
    onSuccess: () => {
      showSuccess("Chat Assigned", "You have successfully taken this chat session.");
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['live-chat-sessions'] });
    }
  });

  // Close chat session
  const closeChatMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase
        .from('live_chat_sessions')
        .update({ 
          status: 'resolved' as const,
          ended_at: new Date().toISOString()
        })
        .eq('id', sessionId);
      
      if (error) throw error;
      return sessionId;
    },
    onMutate: async (sessionId) => {
      await queryClient.cancelQueries({ queryKey: ['live-chat-sessions'] });
      
      const previousSessions = queryClient.getQueryData<ChatSession[]>(['live-chat-sessions']);
      
      // Remove from active sessions list
      queryClient.setQueryData<ChatSession[]>(['live-chat-sessions'], (old = []) => 
        old.filter(session => session.id !== sessionId)
      );
      
      return { previousSessions };
    },
    onError: (error, variables, context) => {
      if (context?.previousSessions) {
        queryClient.setQueryData(['live-chat-sessions'], context.previousSessions);
      }
      console.error('Error closing chat:', error);
      showError("Close Failed", "Failed to close chat session.");
    },
    onSuccess: () => {
      showSuccess("Chat Closed", "Chat session has been resolved and closed.");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['live-chat-sessions'] });
    }
  });

  // Memoized handlers to prevent unnecessary re-renders
  const handleAssignChat = useCallback((sessionId: string) => {
    assignChatMutation.mutate(sessionId);
  }, [assignChatMutation]);

  const handleCloseChat = useCallback((sessionId: string) => {
    closeChatMutation.mutate(sessionId);
  }, [closeChatMutation]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    sessions: filteredSessions,
    isLoading: sessionsLoading,
    error: sessionsError,
    searchTerm,
    onSearch: handleSearch,
    onAssignChat: handleAssignChat,
    onCloseChat: handleCloseChat,
    isAssigning: assignChatMutation.isPending,
    isClosing: closeChatMutation.isPending,
  };
};