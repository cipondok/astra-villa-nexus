import { useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAlert } from "@/contexts/AlertContext";
import { ChatSession, ChatMessage } from "../types/chatTypes";

interface NotificationSound {
  newMessage: HTMLAudioElement;
  newChat: HTMLAudioElement;
  urgentChat: HTMLAudioElement;
}

export const useRealTimeNotifications = () => {
  const { user } = useAuth();
  const { showInfo, showWarning, showError } = useAlert();
  const queryClient = useQueryClient();
  const soundsRef = useRef<NotificationSound | null>(null);

  // Initialize notification sounds
  useEffect(() => {
    soundsRef.current = {
      newMessage: new Audio('/sounds/message.mp3'),
      newChat: new Audio('/sounds/new-chat.mp3'),
      urgentChat: new Audio('/sounds/urgent.mp3')
    };

    // Set volume levels
    Object.values(soundsRef.current).forEach(audio => {
      audio.volume = 0.3;
    });

    return () => {
      soundsRef.current = null;
    };
  }, []);

  // Play notification sound
  const playSound = useCallback((type: keyof NotificationSound) => {
    try {
      soundsRef.current?.[type]?.play()?.catch(() => {
        // Ignore autoplay restrictions
      });
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, []);

  // Show browser notification
  const showBrowserNotification = useCallback((title: string, message: string, priority: string = 'medium') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'chat-notification',
        requireInteraction: priority === 'urgent'
      });

      // Auto-close after 5 seconds unless urgent
      if (priority !== 'urgent') {
        setTimeout(() => notification.close(), 5000);
      }
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  // Handle new chat session notifications
  const handleNewChatSession = useCallback((session: ChatSession) => {
    const isUrgent = session.priority === 'urgent';
    const isHigh = session.priority === 'high';
    
    // Play appropriate sound
    playSound(isUrgent ? 'urgentChat' : 'newChat');
    
    // Show toast notification
    if (isUrgent) {
      showWarning(
        "🚨 Urgent Chat Request", 
        `${session.customer_name} needs immediate assistance!`
      );
    } else if (isHigh) {
      showWarning(
        "⚡ High Priority Chat", 
        `${session.customer_name} is waiting for help`
      );
    } else {
      showInfo(
        "💬 New Chat Request", 
        `${session.customer_name} has started a conversation`
      );
    }

    // Show browser notification
    showBrowserNotification(
      isUrgent ? 'Urgent Chat Request' : 'New Chat Request',
      `${session.customer_name}: ${session.subject || 'General inquiry'}`,
      session.priority
    );
  }, [showInfo, showWarning, playSound, showBrowserNotification]);

  // Handle new message notifications
  const handleNewMessage = useCallback((message: ChatMessage, sessionData?: ChatSession) => {
    // Only notify for customer messages, not agent messages
    if (message.sender_type === 'customer') {
      playSound('newMessage');
      
      const customerName = sessionData?.customer_name || 'Customer';
      showInfo(
        `📨 New message from ${customerName}`, 
        message.content.substring(0, 80) + (message.content.length > 80 ? '...' : '')
      );

      showBrowserNotification(
        `New message from ${customerName}`,
        message.content.substring(0, 100),
        sessionData?.priority
      );
    }
  }, [showInfo, playSound, showBrowserNotification]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Request notification permission on mount
    requestNotificationPermission();

    // Subscribe to new chat sessions
    const sessionsChannel = supabase
      .channel('new-chat-sessions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_sessions',
        },
        (payload) => {
          const newSession = payload.new as ChatSession;
          handleNewChatSession(newSession);
          
          // Update sessions cache
          queryClient.setQueryData<ChatSession[]>(['live-chat-sessions'], (old = []) => {
            const exists = old.some(session => session.id === newSession.id);
            return exists ? old : [newSession, ...old];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'live_chat_sessions',
        },
        (payload) => {
          const updatedSession = payload.new as ChatSession;
          
          // Check if priority was changed to urgent
          if (updatedSession.priority === 'urgent' && payload.old.priority !== 'urgent') {
            playSound('urgentChat');
            showWarning(
              "🚨 Chat Priority Escalated", 
              `${updatedSession.customer_name}'s chat is now URGENT!`
            );
          }
          
          // Update sessions cache
          queryClient.setQueryData<ChatSession[]>(['live-chat-sessions'], (old = []) =>
            old.map(session => 
              session.id === updatedSession.id ? updatedSession : session
            )
          );
        }
      )
      .subscribe();

    // Subscribe to new messages for active sessions
    const messagesChannel = supabase
      .channel('new-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_chat_messages',
        },
        async (payload) => {
          const newMessage = payload.new as ChatMessage;
          
          // Get session data for context
          const { data: sessionData } = await supabase
            .from('live_chat_sessions')
            .select('*')
            .eq('id', newMessage.session_id)
            .single();
          
          handleNewMessage(newMessage, sessionData as ChatSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, handleNewChatSession, handleNewMessage, queryClient, requestNotificationPermission, playSound, showWarning]);

  return {
    requestNotificationPermission,
    playSound,
    showBrowserNotification
  };
};