import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Send, Calendar, DollarSign, Sparkles, Zap, TrendingUp, MapPin,
  Building2, BarChart3, Users, ArrowLeft, CheckCircle2, Clock,
  MessageSquare, Eye, FileText, ChevronRight, Flame, Shield,
  AlertTriangle, X, BellRing
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/* ================================================================
   DEAL ROOM — Premium Negotiation Interface
   ================================================================ */

type DealStatus = 'negotiating' | 'viewing_scheduled' | 'offer_sent' | 'accepted';
type MessageRole = 'investor' | 'agent' | 'ai';

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface SmartEvent {
  id: string;
  type: 'viewing' | 'offer' | 'price_alert';
  title: string;
  detail: string;
  timestamp: Date;
}

const STATUS_CONFIG: Record<DealStatus, { label: string; color: string; icon: React.ReactNode }> = {
  negotiating: { label: 'Negotiating', color: 'bg-primary/10 text-primary border-primary/20', icon: <MessageSquare className="w-3 h-3" /> },
  viewing_scheduled: { label: 'Viewing Scheduled', color: 'bg-accent text-accent-foreground border-border', icon: <Calendar className="w-3 h-3" /> },
  offer_sent: { label: 'Offer Sent', color: 'bg-primary/10 text-primary border-primary/20', icon: <DollarSign className="w-3 h-3" /> },
  accepted: { label: 'Accepted', color: 'bg-primary/15 text-primary border-primary/30', icon: <CheckCircle2 className="w-3 h-3" /> },
};

const MOCK_MESSAGES: Message[] = [
  { id: '1', role: 'investor', content: "I'm interested in this property. What's the current flexibility on price?", timestamp: new Date(Date.now() - 3600000 * 5) },
  { id: '2', role: 'agent', content: "Thank you for your interest. The owner is open to discussion for serious buyers. The listed price reflects recent comparable sales in Canggu.", timestamp: new Date(Date.now() - 3600000 * 4.5) },
  { id: '3', role: 'ai', content: "💡 Market insight: Similar 3-bedroom villas in this area have sold at 5-8% below listing in the past 90 days. Median days-on-market: 42.", timestamp: new Date(Date.now() - 3600000 * 4) },
  { id: '4', role: 'investor', content: "That's helpful context. I'd like to schedule a viewing before discussing numbers. Is this weekend available?", timestamp: new Date(Date.now() - 3600000 * 2) },
  { id: '5', role: 'agent', content: "Absolutely. I can arrange Saturday at 10:00 AM or Sunday at 2:00 PM. The property shows beautifully in morning light.", timestamp: new Date(Date.now() - 3600000) },
];

const COMPARABLES = [
  { title: 'Villa Semara', location: 'Canggu', price: 'IDR 5.1B', daysAgo: 15, delta: '-6%' },
  { title: 'Casa Luna', location: 'Pererenan', price: 'IDR 4.8B', daysAgo: 28, delta: '-4%' },
  { title: 'The Nest', location: 'Canggu', price: 'IDR 5.5B', daysAgo: 45, delta: '+2%' },
];

export default function DealRoom() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<DealStatus>('negotiating');
  const [events, setEvents] = useState<SmartEvent[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, events]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      role: 'investor',
      content: input.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    inputRef.current?.focus();

    // Simulate agent reply
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'agent',
        content: "Noted. I'll follow up with the property owner and get back to you shortly.",
        timestamp: new Date(),
      }]);
    }, 2000);
  };

  const handleScheduleViewing = () => {
    setStatus('viewing_scheduled');
    const evt: SmartEvent = {
      id: Date.now().toString(),
      type: 'viewing',
      title: 'Viewing Confirmed',
      detail: 'Saturday, 10:00 AM — Modern Villa, Canggu',
      timestamp: new Date(),
    };
    setEvents(prev => [...prev, evt]);
    toast.success('Viewing scheduled for Saturday at 10:00 AM');
  };

  const handleMakeOffer = () => {
    setStatus('offer_sent');
    const evt: SmartEvent = {
      id: Date.now().toString(),
      type: 'offer',
      title: 'Offer Submitted',
      detail: 'IDR 4,950,000,000 — Awaiting response',
      timestamp: new Date(),
    };
    setEvents(prev => [...prev, evt]);
    setMessages(prev => [...prev, {
      id: (Date.now() + 2).toString(),
      role: 'ai',
      content: "📊 Your offer of IDR 4.95B is 7.3% below asking — within the competitive range for this area. Median accepted discount: 5-8%.",
      timestamp: new Date(),
    }]);
  };

  const handleRequestReport = () => {
    toast.success('AI Investment Report is being generated...');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: (Date.now() + 3).toString(),
        role: 'ai',
        content: "📋 Investment Report Ready\n\n• Opportunity Score: 92/100\n• Projected yield: 14.2% (short-term rental)\n• Area appreciation: +12% YoY\n• Liquidity score: High\n• Risk level: Low-Medium\n\nFull report available in your documents.",
        timestamp: new Date(),
      }]);
    }, 1500);
  };

  const statusCfg = STATUS_CONFIG[status];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* ========== TOP BAR ========== */}
      <div className="shrink-0 border-b border-border bg-card/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4 px-4 sm:px-6 h-16">
          <Button variant="ghost" size="icon" className="shrink-0" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>

          {/* Property thumbnail */}
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-muted-foreground" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-semibold text-foreground text-sm truncate">Modern Villa with Infinity Pool</h1>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">
                <Zap className="w-2.5 h-2.5" />92
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />Canggu, Bali</span>
              <span className="font-medium text-foreground">IDR 5.34B</span>
            </div>
          </div>

          {/* Status */}
          <Badge variant="outline" className={cn('text-[10px] shrink-0 gap-1 hidden sm:flex', statusCfg.color)}>
            {statusCfg.icon}
            {statusCfg.label}
          </Badge>

          {/* Toggle sidebar on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden shrink-0"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <BarChart3 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ========== MAIN AREA ========== */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT — Chat */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <ScrollArea className="flex-1" ref={scrollRef}>
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-1">
              {/* Date header */}
              <div className="text-center mb-6">
                <span className="text-[10px] text-muted-foreground bg-accent/60 px-3 py-1 rounded-full">Today</span>
              </div>

              {messages.map((msg, i) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Smart Events */}
              <AnimatePresence>
                {events.map(evt => (
                  <SmartEventCard key={evt.id} event={evt} />
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>

          {/* ========== ACTION MODULE ========== */}
          <div className="shrink-0 border-t border-border bg-card/60 backdrop-blur-sm p-3 sm:p-4">
            <div className="max-w-2xl mx-auto">
              {/* Quick actions */}
              <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
                <ActionButton
                  icon={<Calendar className="w-3.5 h-3.5" />}
                  label="Schedule Viewing"
                  onClick={handleScheduleViewing}
                  disabled={status === 'viewing_scheduled'}
                />
                <ActionButton
                  icon={<DollarSign className="w-3.5 h-3.5" />}
                  label="Make Offer"
                  onClick={handleMakeOffer}
                  disabled={status === 'offer_sent' || status === 'accepted'}
                />
                <ActionButton
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                  label="Request AI Report"
                  onClick={handleRequestReport}
                />
              </div>

              {/* Message input */}
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={sendMessage} disabled={!input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Deal Intelligence Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="hidden sm:block shrink-0 border-l border-border bg-card/50 overflow-hidden"
            >
              <DealIntelligenceSidebar />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ===================== MESSAGE BUBBLE ===================== */
function MessageBubble({ message }: { message: Message }) {
  const isInvestor = message.role === 'investor';
  const isAI = message.role === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex mb-3', isInvestor ? 'justify-end' : 'justify-start')}
    >
      <div className={cn(
        'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
        isInvestor
          ? 'bg-primary text-primary-foreground rounded-br-md'
          : isAI
            ? 'bg-accent/80 border border-primary/10 text-foreground rounded-bl-md'
            : 'bg-card border border-border text-foreground rounded-bl-md'
      )}>
        {/* Role indicator */}
        {!isInvestor && (
          <div className="flex items-center gap-1.5 mb-1.5">
            {isAI ? (
              <Sparkles className="w-3 h-3 text-primary" />
            ) : (
              <Shield className="w-3 h-3 text-muted-foreground" />
            )}
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {isAI ? 'ASTRA AI' : 'Agent'}
            </span>
          </div>
        )}
        <p className="whitespace-pre-line">{message.content}</p>
        <div className={cn(
          'text-[10px] mt-1.5',
          isInvestor ? 'text-primary-foreground/60' : 'text-muted-foreground'
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}

/* ===================== SMART EVENT CARD ===================== */
function SmartEventCard({ event }: { event: SmartEvent }) {
  const icons = {
    viewing: <Calendar className="w-4 h-4 text-primary" />,
    offer: <DollarSign className="w-4 h-4 text-primary" />,
    price_alert: <AlertTriangle className="w-4 h-4 text-destructive" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="my-4"
    >
      <div className="mx-auto max-w-sm bg-card border border-primary/15 rounded-xl p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            {icons[event.type]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">{event.title}</span>
              {event.type === 'offer' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                >
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </motion.div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ===================== ACTION BUTTON ===================== */
function ActionButton({ icon, label, onClick, disabled }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="shrink-0 gap-1.5 text-xs h-8"
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      {label}
    </Button>
  );
}

/* ===================== DEAL INTELLIGENCE SIDEBAR ===================== */
function DealIntelligenceSidebar() {
  return (
    <ScrollArea className="h-full">
      <div className="p-5 space-y-6 w-[320px]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Deal Intelligence</h3>
        </div>

        {/* AI Price Benchmark */}
        <div className="space-y-3">
          <SidebarLabel>AI Price Benchmark</SidebarLabel>
          <div className="bg-accent/50 rounded-lg p-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-xs text-muted-foreground">Fair Market Range</span>
              <span className="text-xs font-medium text-foreground">IDR</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-foreground">4.8B</span>
              <div className="flex-1 h-1.5 bg-secondary rounded-full relative overflow-hidden">
                <div className="absolute left-[20%] right-[15%] h-full bg-primary/40 rounded-full" />
                <div className="absolute left-[55%] w-2 h-2 -top-[1px] bg-primary rounded-full border-2 border-background" />
              </div>
              <span className="text-sm font-semibold text-foreground">5.6B</span>
            </div>
            <div className="text-center">
              <span className="text-xs text-muted-foreground">Listed at </span>
              <span className="text-xs font-semibold text-foreground">IDR 5.34B</span>
              <span className="text-xs text-primary ml-1">· Fair value</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Rental Yield Forecast */}
        <div className="space-y-3">
          <SidebarLabel>Rental Yield Forecast</SidebarLabel>
          <div className="space-y-2">
            <YieldRow label="Short-term (Airbnb)" value="14.2%" trend="up" />
            <YieldRow label="Long-term lease" value="8.1%" trend="stable" />
            <YieldRow label="Blended strategy" value="11.6%" trend="up" />
          </div>
        </div>

        <Separator />

        {/* Demand Heat */}
        <div className="space-y-3">
          <SidebarLabel>Demand Heat</SidebarLabel>
          <div className="bg-accent/50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">High Demand</span>
              </div>
              <span className="text-xs text-muted-foreground">Canggu area</span>
            </div>
            <Progress value={82} className="h-2 mb-2" />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>18 active inquiries</span>
              <span>82nd percentile</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Comparable Deals */}
        <div className="space-y-3">
          <SidebarLabel>Recent Comparable Sales</SidebarLabel>
          <div className="space-y-2">
            {COMPARABLES.map((c, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
                <div>
                  <div className="text-xs font-medium text-foreground">{c.title}</div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-2.5 h-2.5" />{c.location} · {c.daysAgo}d ago
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-foreground">{c.price}</div>
                  <div className={cn(
                    'text-[10px] font-medium',
                    c.delta.startsWith('-') ? 'text-primary' : 'text-muted-foreground'
                  )}>
                    {c.delta} vs ask
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function SidebarLabel({ children }: { children: React.ReactNode }) {
  return <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{children}</h4>;
}

function YieldRow({ label, value, trend }: { label: string; value: string; trend: 'up' | 'down' | 'stable' }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 bg-accent/30 rounded-lg">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-foreground">{value}</span>
        {trend === 'up' && <TrendingUp className="w-3 h-3 text-primary" />}
        {trend === 'stable' && <span className="text-[10px] text-muted-foreground">—</span>}
      </div>
    </div>
  );
}
