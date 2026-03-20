import { useState, useCallback } from "react";

export interface NegotiationMessage {
  role: "user" | "assistant";
  content: string;
}

export interface DealContext {
  property_title?: string;
  listing_price?: number;
  estimated_fmv?: number;
  days_on_market?: number;
  demand_score?: number;
  liquidity_score?: number;
  deal_stage?: string;
  buyer_urgency?: string;
  seller_flexibility?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/negotiation-agent`;

export function useNegotiationAgent() {
  const [messages, setMessages] = useState<NegotiationMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(async (input: string, dealContext?: DealContext) => {
    const userMsg: NegotiationMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);

    let assistantSoFar = "";

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      const allMessages = [...messages, userMsg];
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: allMessages,
          deal_context: dealContext,
        }),
      });

      if (!resp.ok || !resp.body) throw new Error(`Request failed: ${resp.status}`);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsertAssistant(content);
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (err) {
      console.error("Negotiation agent error:", err);
      upsertAssistant("⚠️ Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsStreaming(false);
    }
  }, [messages]);

  const clearChat = useCallback(() => setMessages([]), []);

  return { messages, isStreaming, sendMessage, clearChat };
}
