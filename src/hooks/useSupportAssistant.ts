import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AssistantMessage } from './useInvestmentAssistant';

export interface SupportMeta {
  user_id: string;
  tickets_found: number;
  legal_requests_found: number;
  escrow_transactions_found: number;
  documents_found: number;
  conflict_detected: boolean;
}

export function useSupportAssistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMeta, setLastMeta] = useState<SupportMeta | null>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMsg: AssistantMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    historyRef.current.push({ role: 'user', content: content.trim() });
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          mode: 'support_assistant',
          payload: {
            query: content.trim(),
            conversation_history: historyRef.current.slice(-10),
          },
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.support_meta) setLastMeta(data.support_meta);

      const assistantMsg: AssistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || 'Unable to process your request at this time.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      historyRef.current.push({ role: 'assistant', content: assistantMsg.content });
    } catch (err: any) {
      const errMsg: AssistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to process request'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearChat = useCallback(() => {
    setMessages([]);
    historyRef.current = [];
    setLastMeta(null);
  }, []);

  return { messages, isLoading, sendMessage, clearChat, lastMeta };
}
