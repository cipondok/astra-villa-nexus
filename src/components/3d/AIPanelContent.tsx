import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, TrendingUp, CreditCard, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  role: 'ai' | 'user';
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  { role: 'ai', text: "Welcome to ASTRA Villa. I'm your AI property advisor. This Canggu villa has a 92/100 investment score with 8.4% projected rental yield." },
  { role: 'ai', text: "Click any gold hotspot in the 3D view to learn about specific features. Would you like an ROI breakdown or neighborhood analysis?" },
];

const SUGGESTED_ACTIONS = [
  { label: 'ROI Analysis', icon: TrendingUp, prompt: 'Show me a detailed ROI analysis for this property' },
  { label: 'Payment Plan', icon: CreditCard, prompt: 'What payment plan options are available?' },
  { label: 'Schedule Viewing', icon: CalendarCheck, prompt: 'I want to schedule a private viewing' },
];

export default function AIPanelContent() {
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const send = (text?: string) => {
    const userMsg = (text || input).trim();
    if (!userMsg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: userMsg.toLowerCase().includes('roi')
            ? 'Based on current Canggu market data: Purchase at Rp 12.5B → projected 14.2% annual appreciation + 8.4% rental yield = 22.6% gross return. Break-even on rental income: ~4.2 years.'
            : userMsg.toLowerCase().includes('payment') || userMsg.toLowerCase().includes('plan')
            ? 'We offer 3 payment structures: 1) Full payment (5% discount), 2) 50/50 split over 12 months, 3) 30/30/40 milestone-based. All include escrow protection.'
            : userMsg.toLowerCase().includes('viewing') || userMsg.toLowerCase().includes('schedule')
            ? 'I can arrange a private viewing. Available slots: Tomorrow 10AM, Wednesday 2PM, or Saturday 11AM. Includes helicopter transfer from Seminyak. Shall I confirm?'
            : userMsg.toLowerCase().includes('area') || userMsg.toLowerCase().includes('neighbor')
            ? "Canggu is Bali's fastest-growing investment corridor. Walk score: 78. Proximity to Finns Beach Club (0.8km), international schools, and fiber internet coverage."
            : "I can help with ROI projections, neighborhood analysis, legal considerations for foreign buyers, or comparable property pricing. What interests you most?",
        },
      ]);
    }, 800);
  };

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[hsl(var(--border))]/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#C8A96A]/15 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-[#C8A96A]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">ASTRA AI Advisor</h3>
            <p className="text-[10px] text-[#C8A96A]">Investment Intelligence Active</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed',
                msg.role === 'ai'
                  ? 'bg-[hsl(var(--card))]/80 border border-[hsl(var(--border))]/10 text-foreground'
                  : 'bg-[#C8A96A]/15 text-foreground border border-[#C8A96A]/20'
              )}
            >
              {msg.role === 'ai' && <Bot className="h-3 w-3 text-[#C8A96A] mb-1 inline-block mr-1" />}
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Suggested Actions */}
      <div className="px-4 py-2 border-t border-[hsl(var(--border))]/5">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Quick Actions</p>
        <div className="flex flex-col gap-1.5">
          {SUGGESTED_ACTIONS.map(action => (
            <button
              key={action.label}
              onClick={() => send(action.prompt)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#C8A96A] bg-[#C8A96A]/5 border border-[#C8A96A]/10 hover:bg-[#C8A96A]/10 hover:border-[#C8A96A]/20 transition-all text-left"
            >
              <action.icon className="h-3.5 w-3.5 shrink-0" />
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[hsl(var(--border))]/10">
        <div className="flex items-center gap-2 bg-[hsl(var(--card))]/60 border border-[hsl(var(--border))]/10 rounded-xl px-3 py-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask about ROI, area, legality..."
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={() => send()}
            className="w-7 h-7 rounded-lg bg-[#C8A96A]/20 text-[#C8A96A] flex items-center justify-center hover:bg-[#C8A96A]/30 transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
