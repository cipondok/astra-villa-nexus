import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, TrendingUp, Shield, Target, Trash2, StopCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useInvestorCopilot, useCopilotAlerts } from '@/hooks/useInvestorCopilot';
import { useAuth } from '@/contexts/AuthContext';
import ReactMarkdown from 'react-markdown';

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: 'Best ROI cities', prompt: 'Which Indonesian city has the best ROI potential for real estate in the next 3 years?' },
  { icon: Shield, label: 'Portfolio review', prompt: 'How can I improve my portfolio diversification and reduce risk?' },
  { icon: Target, label: 'Deal finder', prompt: 'Show me the most undervalued properties with strong rental yield potential.' },
  { icon: Sparkles, label: 'Market trends', prompt: 'What are the emerging real estate investment hotspots in Indonesia right now?' },
];

const AlertBanner = memo(function AlertBanner() {
  const { data: alerts } = useCopilotAlerts();
  const topAlert = alerts?.[0];
  if (!topAlert) return null;

  const severityColors: Record<string, string> = {
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    alert: 'bg-destructive/10 border-destructive/30 text-destructive',
    opportunity: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    info: 'bg-primary/10 border-primary/30 text-primary',
  };

  return (
    <div className={cn('px-3 py-2 text-[11px] border-b', severityColors[topAlert.severity] || severityColors.info)}>
      <span className="font-semibold">{topAlert.title}</span>
      <span className="opacity-80 ml-1">— {topAlert.message.slice(0, 80)}…</span>
    </div>
  );
});

interface Props {
  propertyId?: string;
}

export default function InvestorCopilot({ propertyId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { user } = useAuth();
  const { messages, isStreaming, sendMessage, stopStreaming, clearMessages } = useInvestorCopilot(propertyId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput('');
    sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 right-4 z-50 md:bottom-8 md:right-8"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 relative group"
            >
              <Bot className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-background animate-pulse" />
              <span className="absolute bottom-full mb-2 right-0 bg-popover text-popover-foreground text-xs px-2.5 py-1 rounded-md shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                AI Investment Copilot
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-6rem)] flex flex-col bg-card border border-border rounded-2xl shadow-2xl overflow-hidden md:bottom-8 md:right-8"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary/5 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">ASTRA Copilot</h3>
                  <p className="text-[10px] text-muted-foreground">AI Investment Advisor</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearMessages} title="Clear chat">
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Alert Banner */}
            <AlertBanner />

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center text-center pt-6 space-y-4">
                  <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Investment Intelligence</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Ask about properties, markets, portfolio strategy, or deal analysis.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full">
                    {QUICK_PROMPTS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(q.prompt)}
                        className="flex items-start gap-2 p-2.5 text-left rounded-lg border border-border bg-muted/30 hover:bg-muted/60 transition-colors"
                      >
                        <q.icon className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                        <span className="text-[11px] text-foreground leading-tight">{q.label}</span>
                      </button>
                    ))}
                  </div>
                  {!user && (
                    <Badge variant="secondary" className="text-[10px]">
                      Sign in for personalized portfolio advice
                    </Badge>
                  )}
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted/50 text-foreground border border-border/50 rounded-bl-md'
                      )}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-sm [&_h2]:text-[13px] [&_h3]:text-xs [&_p]:text-[13px] [&_li]:text-[13px] [&_strong]:text-foreground [&_code]:text-[11px] [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                          {isStreaming && msg.id === messages[messages.length - 1]?.id && (
                            <span className="inline-block w-1.5 h-4 bg-primary/60 animate-pulse ml-0.5" />
                          )}
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 bg-card">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about investments, deals, portfolio..."
                  rows={1}
                  className="flex-1 resize-none bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 max-h-20"
                />
                {isStreaming ? (
                  <Button size="icon" variant="outline" className="h-9 w-9 rounded-xl shrink-0" onClick={stopStreaming}>
                    <StopCircle className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    className="h-9 w-9 rounded-xl shrink-0"
                    onClick={handleSubmit}
                    disabled={!input.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <p className="text-[9px] text-muted-foreground text-center mt-1.5">
                AI analysis based on precomputed market data. Not financial advice.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
