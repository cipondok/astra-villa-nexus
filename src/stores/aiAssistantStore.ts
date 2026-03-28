/**
 * AI Assistant Store — Manages conversation state and AI interactions.
 * Consumes aiService, decoupled from UI.
 */
import { create } from 'zustand';
import { sendAssistantMessage, type AIResponse } from '@/services/aiService';

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  properties?: AIResponse['recommended_properties'];
  insights?: AIResponse['insights'];
}

interface AIAssistantState {
  messages: AssistantMessage[];
  isLoading: boolean;
  error: string | null;

  // Actions
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

export const useAIAssistantStore = create<AIAssistantState>((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  sendMessage: async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || get().isLoading) return;

    const userMsg: AssistantMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    set(state => ({ messages: [...state.messages, userMsg], isLoading: true, error: null }));

    // Build conversation history from current messages
    const history = get().messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    try {
      const response = await sendAssistantMessage(trimmed, history);

      const assistantMsg: AssistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        properties: response.recommended_properties,
        insights: response.insights,
      };

      set(state => ({ messages: [...state.messages, assistantMsg], isLoading: false }));
    } catch (err: any) {
      const errMsg: AssistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to process request'}`,
        timestamp: new Date(),
      };
      set(state => ({ messages: [...state.messages, errMsg], isLoading: false, error: err.message }));
    }
  },

  clearChat: () => set({ messages: [], error: null }),
}));
