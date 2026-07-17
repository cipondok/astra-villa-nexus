/**
 * AI Investment Advisor Chat Component
 * Streaming conversational interface for investment guidance
 */

import { memo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, X, Trash2, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useInvestmentAdvisorChat } from '@/hooks/useInvestmentAdvisorChat';
import ReactMarkdown from 'react-markdown';

interface InvestmentAdvisorChatProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const SUGGESTED_QUESTIONS = [
  'What are the best investment opportunities in Bali right now?',
  'How should I diversify my property portfolio?',
  'What\'s the expected ROI for villas in Seminyak?',
  'Explain the risks of investing in pre-launch properties',
];

const InvestmentAdvisorChat = memo(({ isOpen, onClose, className }: InvestmentAdvisorChatProps) => {
  const { messages, isStreaming, sendMessage, stopStreaming, clearChat } = useInvestmentAdvisorChat();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = () => {
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className={cn(
            'fixed bottom-20 right-4 z-50 w-[380px] max-h-[560px]',
            'bg-card border border-border/40 rounded-2xl shadow-2xl',
            'flex flex-col overflow-hidden backdrop-blur-xl',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">AI Investment Advisor</p>
                <p className="text-[10px] text-muted-foreground">Powered by market intelligence</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearChat} aria-label="Clear chat">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose} aria-label="Close advisor">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[300px]">
            {messages.length === 0 && (
              <div className="space-y-3 pt-4">
                <p className="text-xs text-muted-foreground text-center">
                  Ask me about investment opportunities, market trends, or portfolio strategy.
                </p>
                <div className="space-y-1.5">
                  {SUGGESTED_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); sendMessage(q); }}
                      className="w-full text-left text-[11px] p-2.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-xl px-3 py-2 text-xs',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/50 text-foreground'
                  )}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-xs prose-invert max-w-none [&_p]:text-xs [&_p]:my-1 [&_li]:text-xs [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_ul]:my-1 [&_ol]:my-1">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))}

            {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex justify-start">
                <div className="bg-muted/50 rounded-xl px-3 py-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/30 bg-card/80">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about investments..."
                className="flex-1 text-xs bg-muted/50 border border-border/30 rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                disabled={isStreaming}
              />
              {isStreaming ? (
                <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={stopStreaming}>
                  <Square className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleSend} disabled={!input.trim()}>
                  <Send className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

InvestmentAdvisorChat.displayName = 'InvestmentAdvisorChat';

export default InvestmentAdvisorChat;
