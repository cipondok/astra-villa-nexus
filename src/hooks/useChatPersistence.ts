import { useState, useEffect, useCallback } from "react";
import { Message } from "@/components/ai/types";

interface ChatHistory {
  messages: Message[];
  conversationId: string;
  timestamp: number;
}

const STORAGE_KEY_PREFIX = 'chat_history_';
const EXPIRY_DAYS = 7;
const EXPIRY_MS = EXPIRY_DAYS * 24 * 60 * 60 * 1000;

/**
 * Hook to persist chat messages and conversation ID to localStorage
 * Auto-expires after 7 days
 */
export const useChatPersistence = (userId?: string) => {
  const storageKey = `${STORAGE_KEY_PREFIX}${userId || 'guest'}`;

  const [persistedMessages, setPersistedMessages] = useState<Message[]>([]);
  const [persistedConversationId, setPersistedConversationId] = useState<string>("");

  // Load chat history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;

      const parsed: ChatHistory = JSON.parse(saved);
      
      // Check if expired (older than 7 days)
      const now = Date.now();
      if (now - parsed.timestamp > EXPIRY_MS) {
        localStorage.removeItem(storageKey);
        return;
      }

      setPersistedMessages(parsed.messages);
      setPersistedConversationId(parsed.conversationId);
    } catch (error) {
      console.error('Failed to load chat history:', error);
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  // Save chat history
  const saveChat = useCallback((messages: Message[], conversationId: string) => {
    try {
      const history: ChatHistory = {
        messages,
        conversationId,
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save chat history:', error);
    }
  }, [storageKey]);

  // Clear chat history
  const clearChat = useCallback(() => {
    localStorage.removeItem(storageKey);
    setPersistedMessages([]);
    setPersistedConversationId("");
  }, [storageKey]);

  return {
    persistedMessages,
    persistedConversationId,
    saveChat,
    clearChat,
  };
};
