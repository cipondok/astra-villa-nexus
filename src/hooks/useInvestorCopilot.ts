import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface CopilotAlert {
  id: string;
  alert_type: string;
  title: string;
  message: string;
  city: string | null;
  severity: string;
  trend_direction: string;
  trend_magnitude: number;
  data_points: Record<string, any>;
  generated_at: string;
}

export interface PropertyInsight {
  id: string;
  property_id: string;
  why_good_deal: string | null;
  risks: Array<{ factor: string; severity: string; description: string }>;
  exit_strategy: { optimal_hold_years?: number; exit_method?: string; reasoning?: string };
  best_for_persona: string | null;
  recommendation_level: string;
  projected_roi: number | null;
  confidence_score: number;
}

const COPILOT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/investor-copilot`;

export function useInvestorCopilot(propertyId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (input: string) => {
    const userMsg: CopilotMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantContent = '';
    const assistantId = crypto.randomUUID();

    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && last.id === assistantId) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantContent } : m);
        }
        return [...prev, { id: assistantId, role: 'assistant', content: assistantContent, createdAt: new Date() }];
      });
    };

    try {
      const allMsgs = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

      const resp = await fetch(COPILOT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          mode: 'chat',
          messages: allMsgs,
          property_id: propertyId,
          user_id: user?.id,
        }),
        signal: controller.signal,
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Request failed' }));
        upsertAssistant(`⚠️ ${err.error || 'Service unavailable. Please try again.'}`);
        setIsStreaming(false);
        return;
      }

      if (!resp.body) {
        upsertAssistant('⚠️ No response stream available.');
        setIsStreaming(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Flush remaining
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw?.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) upsertAssistant(content);
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        upsertAssistant('⚠️ Connection error. Please try again.');
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages, propertyId, user?.id]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isStreaming, sendMessage, stopStreaming, clearMessages };
}

// ── Copilot Alerts Hook ──
export function useCopilotAlerts() {
  return useQuery({
    queryKey: ['copilot-alerts'],
    queryFn: async (): Promise<CopilotAlert[]> => {
      const { data, error } = await supabase.functions.invoke('investor-copilot', {
        body: { mode: 'get_alerts' },
      });
      if (error) throw error;
      return (data?.data || []) as CopilotAlert[];
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ── Property Insight Hook ──
export function usePropertyInsight(propertyId: string | undefined) {
  return useQuery({
    queryKey: ['property-insight', propertyId],
    queryFn: async (): Promise<PropertyInsight | null> => {
      const { data, error } = await supabase.functions.invoke('investor-copilot', {
        body: { mode: 'get_insight', property_id: propertyId },
      });
      if (error) throw error;
      return data?.data as PropertyInsight | null;
    },
    enabled: !!propertyId,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
