import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { isAiTemporarilyDisabled, markAiTemporarilyDisabledFromError } from "@/lib/aiAvailability";
import { getEdgeFunctionStatus } from "@/lib/supabaseFunctionErrors";
import {
  MessageCircle, Send, Loader2, Bot, User, Sparkles,
} from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED_QUESTIONS = [
  "What's the total price including taxes?",
  "Is the price negotiable?",
  "What's the neighborhood like?",
  "How many bedrooms and bathrooms?",
  "What are the monthly maintenance costs?",
  "Is this property suitable for investment?",
];

interface PropertyChatbotProps {
  propertyId: string;
  propertyData?: Record<string, unknown>;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`;

export default function PropertyChatbot({ propertyId, propertyData }: PropertyChatbotProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const streamChat = useCallback(async (allMessages: Msg[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        mode: "property_chatbot",
        payload: {
          property_id: propertyId,
          property_data: propertyData,
          messages: allMessages,
        },
      }),
    });

    if (!resp.ok || !resp.body) {
      // Check for rate-limit / credit errors
      if (resp.status === 402 || resp.status === 429 || resp.status === 503) {
        markAiTemporarilyDisabledFromError({ status: resp.status });
      }
      // Try to read JSON error
      try {
        const errData = await resp.json();
        const status = errData?.status;
        if (status && status >= 400) {
          markAiTemporarilyDisabledFromError({ status });
        }
        throw new Error(errData?.error || "Failed to get response");
      } catch (e) {
        if (e instanceof Error && e.message !== "Failed to get response") throw e;
        throw new Error("Failed to get response from AI");
      }
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";
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
          if (content) {
            assistantSoFar += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
              }
              return [...prev, { role: "assistant", content: assistantSoFar }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant") {
                return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
              }
              return [...prev, { role: "assistant", content: assistantSoFar }];
            });
          }
        } catch { /* ignore */ }
      }
    }
  }, [propertyId, propertyData]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;
    if (isAiTemporarilyDisabled()) return;

    const userMsg: Msg = { role: "user", content: msg };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(updatedMessages);
    } catch (e) {
      console.error("Property chatbot error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I couldn't process your request. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 max-h-[350px] min-h-[200px] px-1 py-2">
        {messages.length === 0 ? (
          <div className="text-center py-6 space-y-3">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">Ask me anything about this property!</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                <Badge
                  key={q}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent text-[10px] py-1 px-2"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </Badge>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs sm:text-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-xs sm:text-sm [&_p]:mb-1.5 [&_ul]:mb-1.5 [&_li]:mb-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-3.5 w-3.5 text-accent-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="bg-muted rounded-xl px-3 py-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-2 border-t border-border/50">
        <Input
          placeholder="Ask about this property..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          disabled={isLoading}
          className="text-xs sm:text-sm h-8 sm:h-9"
        />
        <Button size="icon-sm" onClick={() => sendMessage()} disabled={isLoading || !input.trim()}>
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}
