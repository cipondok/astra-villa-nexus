import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Trash2 } from 'lucide-react';
import { useInvestmentAssistant, AssistantMessage } from '@/hooks/useInvestmentAssistant';
import AIChatInput from '@/components/ai/AIChatInput';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

const suggestedQuestions = [
  'Best areas for investment in Bali?',
  'Properties with highest rental yield?',
  'Compare villas vs apartments ROI',
  'Market trends in Jakarta 2026',
];

const MobileAIChat: React.FC = () => {
  const { messages, isLoading, sendMessage, clearChat } = useInvestmentAssistant();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] bg-background">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border/30 flex items-center justify-between bg-background/95 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gold-primary/10 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-gold-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">ASTRA AI Assistant</h1>
            <p className="text-[10px] text-muted-foreground">Property & investment advisor</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="p-2 rounded-full hover:bg-muted/50 active:scale-95 transition-transform">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-2xl bg-gold-primary/10 flex items-center justify-center"
            >
              <Bot className="h-8 w-8 text-gold-primary" />
            </motion.div>
            <div className="text-center">
              <h2 className="text-lg font-bold text-foreground mb-1">Ask me anything</h2>
              <p className="text-xs text-muted-foreground max-w-[240px]">
                Property valuations, market trends, investment strategies, and more.
              </p>
            </div>
            <div className="w-full space-y-2 max-w-sm">
              {suggestedQuestions.map((q, i) => (
                <motion.button
                  key={q}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.08 } }}
                  onClick={() => { setInput(q); sendMessage(q); }}
                  className="w-full text-left px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border/30 text-xs text-foreground active:scale-[0.98] transition-transform"
                >
                  {q}
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex",
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5",
                  msg.role === 'user'
                    ? 'bg-gold-primary text-background rounded-br-md'
                    : 'bg-muted/60 text-foreground rounded-bl-md border border-border/30'
                )}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed [&_p]:mb-1.5 [&_ul]:my-1 [&_li]:my-0.5">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-xs">{msg.content}</p>
                  )}
                  <p className={cn(
                    "text-[9px] mt-1 opacity-60",
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  )}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-muted/60 rounded-2xl rounded-bl-md px-4 py-3 border border-border/30">
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <AIChatInput
        message={input}
        setMessage={setInput}
        onSendMessage={handleSend}
        onVoiceInput={() => {}}
        isLoading={isLoading}
        isListening={false}
      />
    </div>
  );
};

export default MobileAIChat;
