import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, Sparkles, TrendingUp, CreditCard, CalendarCheck, Eye, Home, Palmtree } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CameraCommandKey } from '@/components/3d/PropertyScene';

interface Message {
  role: 'ai' | 'user';
  text: string;
  cameraCommand?: CameraCommandKey;
}

interface AIPanelContentProps {
  onCameraCommand?: (cmd: CameraCommandKey) => void;
}

const INITIAL_MESSAGES: Message[] = [
  { role: 'ai', text: "Welcome to ASTRA Villa. I'm your AI property advisor. This Canggu villa has a 92/100 investment score with 8.4% projected rental yield." },
  { role: 'ai', text: "Use the quick actions below or ask me anything. I can also navigate the 3D view for you." },
];

const SUGGESTED_ACTIONS = [
  { label: 'Show ROI Overview', icon: TrendingUp, prompt: 'Show me ROI analysis', camera: 'roi_highlight' as CameraCommandKey },
  { label: 'View Living Room', icon: Home, prompt: 'Show me the living room', camera: 'living_room' as CameraCommandKey },
  { label: 'Show Exterior', icon: Eye, prompt: 'Show me the exterior', camera: 'front' as CameraCommandKey },
  { label: 'View Pool Area', icon: Palmtree, prompt: 'Show me the pool area', camera: 'pool' as CameraCommandKey },
  { label: 'Payment Plan', icon: CreditCard, prompt: 'What payment plans are available?' },
  { label: 'Schedule Viewing', icon: CalendarCheck, prompt: 'Schedule a private viewing' },
];

// Map keywords in user messages to camera commands
function detectCameraIntent(text: string): CameraCommandKey | undefined {
  const lower = text.toLowerCase();
  if (lower.includes('roi') || lower.includes('investment') || lower.includes('highlight')) return 'roi_highlight';
  if (lower.includes('living') || lower.includes('interior')) return 'living_room';
  if (lower.includes('exterior') || lower.includes('front') || lower.includes('outside')) return 'front';
  if (lower.includes('pool') || lower.includes('swim')) return 'pool';
  if (lower.includes('master') || lower.includes('bedroom') || lower.includes('suite')) return 'master_suite';
  if (lower.includes('terrace') || lower.includes('sky') || lower.includes('roof')) return 'sky_terrace';
  if (lower.includes('overview') || lower.includes('full') || lower.includes('reset')) return 'overview';
  return undefined;
}

function getAIResponse(text: string): { reply: string; camera?: CameraCommandKey } {
  const lower = text.toLowerCase();
  const camera = detectCameraIntent(text);

  if (lower.includes('roi') || lower.includes('investment')) {
    return {
      reply: '📊 **ROI Analysis**: Purchase at Rp 12.5B → 14.2% annual appreciation + 8.4% rental yield = **22.6% gross return**. Break-even: ~4.2 years. I\'ve moved the camera to show the full property overview.',
      camera: camera || 'roi_highlight',
    };
  }
  if (lower.includes('living')) {
    return {
      reply: '🏠 The **Living Pavilion** features a 6m double-height ceiling, Italian marble flooring, and floor-to-ceiling glass panels opening to the garden. Navigating there now.',
      camera: camera || 'living_room',
    };
  }
  if (lower.includes('exterior') || lower.includes('front') || lower.includes('outside')) {
    return {
      reply: '🏛 The **exterior** showcases a contemporary tropical design with natural stone cladding, a dramatic cantilevered roof, and integrated landscape lighting. Showing front view.',
      camera: camera || 'front',
    };
  }
  if (lower.includes('pool')) {
    return {
      reply: '🏊 The **Infinity Pool** is 15m long with a vanishing edge overlooking rice terraces. Heated, with an integrated jacuzzi section. Moving camera to pool area.',
      camera: camera || 'pool',
    };
  }
  if (lower.includes('master') || lower.includes('bedroom') || lower.includes('suite')) {
    return {
      reply: '🛏 The **Master Suite** occupies the entire east wing with a private balcony, walk-in closet, and rainfall shower with garden views. Navigating now.',
      camera: camera || 'master_suite',
    };
  }
  if (lower.includes('terrace') || lower.includes('sky') || lower.includes('roof')) {
    return {
      reply: '☁️ The **Sky Terrace** offers 360° views of Canggu coastline. Features an outdoor kitchen, fire pit lounge, and sunset viewing deck. Flying camera up.',
      camera: camera || 'sky_terrace',
    };
  }
  if (lower.includes('payment') || lower.includes('plan')) {
    return { reply: '💳 **Payment options**: 1) Full payment (5% discount), 2) 50/50 split over 12 months, 3) 30/30/40 milestone-based. All include escrow protection via ASTRA Shield.' };
  }
  if (lower.includes('viewing') || lower.includes('schedule')) {
    return { reply: '📅 Available slots: Tomorrow 10AM, Wednesday 2PM, Saturday 11AM. Includes complimentary helicopter transfer from Seminyak. Shall I confirm?' };
  }
  if (lower.includes('overview') || lower.includes('reset')) {
    return { reply: '🔄 Resetting to overview position. You can see the full property layout from this angle.', camera: 'overview' };
  }
  return { reply: "I can navigate you through the property — try asking about the living room, pool, master suite, or sky terrace. I also provide ROI analysis, payment plans, and viewing scheduling." };
}

export default function AIPanelContent({ onCameraCommand }: AIPanelContentProps) {
  const [messages, setMessages] = React.useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const send = (text?: string, forcedCamera?: CameraCommandKey) => {
    const userMsg = (text || input).trim();
    if (!userMsg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    // Fire camera command immediately for suggested actions
    if (forcedCamera && onCameraCommand) {
      onCameraCommand(forcedCamera);
    }

    setTimeout(() => {
      const { reply, camera } = getAIResponse(userMsg);

      // Fire camera command from AI response if not already fired
      if (!forcedCamera && camera && onCameraCommand) {
        onCameraCommand(camera);
      }

      setMessages(prev => [...prev, { role: 'ai', text: reply, cameraCommand: camera }]);
    }, 600);
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
            <p className="text-[10px] text-[#C8A96A]">3D Navigation + Intelligence</p>
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
              {msg.cameraCommand && msg.role === 'ai' && (
                <span className="block mt-1.5 text-[10px] text-[#C8A96A]/60 font-mono">
                  📷 Camera → {msg.cameraCommand.replace('_', ' ')}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Suggested Actions */}
      <div className="px-4 py-2 border-t border-[hsl(var(--border))]/5">
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-2 font-semibold">Quick Actions</p>
        <div className="grid grid-cols-2 gap-1.5">
          {SUGGESTED_ACTIONS.map(action => (
            <button
              key={action.label}
              onClick={() => send(action.prompt, action.camera)}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-medium text-left transition-all border",
                action.camera
                  ? "text-[#C8A96A] bg-[#C8A96A]/5 border-[#C8A96A]/10 hover:bg-[#C8A96A]/10 hover:border-[#C8A96A]/20"
                  : "text-foreground bg-[hsl(var(--card))]/40 border-[hsl(var(--border))]/10 hover:bg-[hsl(var(--card))]/60"
              )}
            >
              <action.icon className="h-3 w-3 shrink-0" />
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
            placeholder="Ask about rooms, ROI, or navigate..."
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
