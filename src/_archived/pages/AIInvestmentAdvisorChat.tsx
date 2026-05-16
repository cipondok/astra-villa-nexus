import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Send, Sparkles, TrendingUp, DollarSign, BarChart3,
  Home, Shield, MapPin, ArrowLeft, Loader2, Trash2,
  Building2, Zap, Target, PieChart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────
type Msg = { id: string; role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/investment-advisor-chat`;

// ─── Quick Actions ───────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Best ROI property?', icon: TrendingUp, prompt: 'What is the best ROI property available right now in Bali?' },
  { label: 'Can I afford a villa?', icon: DollarSign, prompt: 'Can I afford a villa in Bali with a budget of Rp 5 billion? Break down payment options.' },
  { label: 'Compare markets', icon: BarChart3, prompt: 'Compare Bali vs Jakarta for property investment. Which is better for rental income?' },
  { label: 'Risk assessment', icon: Shield, prompt: 'What are the main risks of investing in Indonesian real estate right now?' },
  { label: 'Rental yield analysis', icon: Home, prompt: 'What rental yields can I expect from a 3-bedroom villa in Canggu, Bali?' },
  { label: 'Investment strategy', icon: Target, prompt: 'I have Rp 10 billion to invest. Create a diversified property portfolio strategy for me.' },
];

// ─── Streaming helper ────────────────────────────────────────────────
async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
  signal,
}: {
  messages: { role: string; content: string }[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (err: string) => void;
  signal?: AbortSignal;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Request failed' }));
    onError(err.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) { onError('No response body'); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let done = false;

  while (!done) {
    const { done: rDone, value } = await reader.read();
    if (rDone) break;
    buf += decoder.decode(value, { stream: true });

    let nl: number;
    while ((nl = buf.indexOf('\n')) !== -1) {
      let line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buf = line + '\n' + buf;
        break;
      }
    }
  }

  // flush
  if (buf.trim()) {
    for (let raw of buf.split('\n')) {
      if (!raw || !raw.startsWith('data: ')) continue;
      const json = raw.slice(6).trim();
      if (json === '[DONE]') continue;
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content;
        if (c) onDelta(c);
      } catch {}
    }
  }

  onDone();
}

// ─── Component ───────────────────────────────────────────────────────
export default function AIInvestmentAdvisorChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    let assistantContent = '';
    const assistantId = crypto.randomUUID();

    const history = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    const upsert = (chunk: string) => {
      assistantContent += chunk;
      const content = assistantContent;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.id === assistantId) {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content } : m);
        }
        return [...prev, { id: assistantId, role: 'assistant' as const, content }];
      });
    };

    try {
      await streamChat({
        messages: history,
        onDelta: upsert,
        onDone: () => setIsStreaming(false),
        onError: (err) => {
          upsert(`\n\n⚠️ ${err}`);
          setIsStreaming(false);
        },
        signal: controller.signal,
      });
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        upsert('\n\n⚠️ Connection lost. Please try again.');
      }
      setIsStreaming(false);
    }
  }, [messages, isStreaming]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    abortRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/80 backdrop-blur-lg">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">ASTRA Investment Advisor</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Property Intelligence</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="icon" onClick={clearChat} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {isEmpty && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center gap-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Your Private Investment Advisor</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ask me about ROI analysis, property comparisons, market risks, or investment strategies. 
                  I'll give you clear, actionable insights.
                </p>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2 w-full">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.prompt)}
                    className="flex items-center gap-2 p-3 rounded-xl border border-border/60 bg-card/50 hover:bg-primary/10 hover:border-primary/30 transition-all text-left group"
                  >
                    <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card border border-border/50 rounded-bl-md'
                )}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-foreground [&_strong]:text-primary [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:my-1 [&_li]:my-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}

          {isStreaming && messages[messages.length - 1]?.role === 'user' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-card border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Analyzing...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-lg">
        {!isEmpty && (
          <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-none">
            {QUICK_ACTIONS.slice(0, 4).map((a) => (
              <button
                key={a.label}
                onClick={() => sendMessage(a.prompt)}
                disabled={isStreaming}
                className="shrink-0 text-[11px] px-2.5 py-1 rounded-full border border-border/60 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any property investment..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-border/60 bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 min-h-[44px] max-h-[120px]"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 120) + 'px';
            }}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isStreaming}
            size="icon"
            className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
