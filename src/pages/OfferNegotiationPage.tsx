import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useOffer, useOfferMessages, useUpdateOfferStatus, useSendOfferMessage,
  OFFER_STATUS_CONFIG, TIMELINE_STEPS, type OfferStatus, type SenderRole, type OfferMessage,
} from '@/hooks/usePropertyOffers';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Send, DollarSign, Clock, CheckCircle2, XCircle, RefreshCw,
  MessageSquare, FileText, User, Building, StickyNote, Plus, CalendarClock,
  TrendingUp, Shield, Handshake, Zap, ArrowUpRight, ChevronRight,
} from 'lucide-react';

function formatPrice(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short',
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit',
  });
}

function daysBetween(a: string, b: string) {
  return Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

// ── Timeline Stage Data ──
const DEAL_STAGES = [
  { key: 'inquiry', label: 'Inquiry Initiated', icon: MessageSquare, statuses: ['submitted'] },
  { key: 'offer', label: 'Offer Submitted', icon: FileText, statuses: ['submitted', 'seller_reviewing'] },
  { key: 'negotiation', label: 'Negotiation', icon: RefreshCw, statuses: ['seller_reviewing', 'counter_offer'] },
  { key: 'agreement', label: 'Agreement Reached', icon: Handshake, statuses: ['accepted'] },
  { key: 'completion', label: 'Transaction Complete', icon: CheckCircle2, statuses: ['in_progress', 'completed'] },
] as const;

// ── Enhanced Progress Stepper ──
function DealProgressStepper({
  currentStatus,
  stageTimestamps,
}: {
  currentStatus: OfferStatus;
  stageTimestamps: Record<string, string | null>;
}) {
  const config = OFFER_STATUS_CONFIG[currentStatus];
  const currentStep = config.step;
  const isTerminal = currentStep < 0;

  // Map current status to stage index
  const activeStageIndex = isTerminal
    ? -1
    : DEAL_STAGES.findIndex(s => (s.statuses as readonly string[]).includes(currentStatus));

  return (
    <div className="space-y-3">
      {/* Horizontal stepper */}
      <div className="flex items-start gap-0 overflow-x-auto pb-1">
        {DEAL_STAGES.map((stage, i) => {
          const isCompleted = !isTerminal && i < activeStageIndex;
          const isCurrent = !isTerminal && i === activeStageIndex;
          const isFuture = !isTerminal && i > activeStageIndex;
          const timestamp = stageTimestamps[stage.key];
          const Icon = stage.icon;

          return (
            <div key={stage.key} className="flex items-start flex-1 min-w-0">
              <div className="flex flex-col items-center text-center flex-1 min-w-0">
                {/* Circle */}
                <motion.div
                  initial={isCurrent ? { scale: 0.8 } : {}}
                  animate={isCurrent ? { scale: [0.95, 1.05, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all shrink-0',
                    isCompleted
                      ? 'bg-chart-2 border-chart-2 text-chart-2-foreground shadow-sm shadow-chart-2/30'
                      : isCurrent
                      ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30 ring-4 ring-primary/10'
                      : 'bg-muted/30 border-border/50 text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </motion.div>

                {/* Label */}
                <p className={cn(
                  'text-[10px] font-medium mt-1.5 leading-tight px-0.5',
                  isCurrent ? 'text-primary font-semibold' :
                  isCompleted ? 'text-chart-2' : 'text-muted-foreground'
                )}>
                  {stage.label}
                </p>

                {/* Timestamp */}
                {timestamp ? (
                  <p className={cn(
                    'text-[9px] mt-0.5',
                    isCompleted ? 'text-chart-2/70' : isCurrent ? 'text-primary/70' : 'text-muted-foreground/60'
                  )}>
                    {formatDateShort(timestamp)}
                    <br />
                    {formatTime(timestamp)}
                  </p>
                ) : (
                  <p className="text-[9px] text-muted-foreground/40 mt-0.5">—</p>
                )}
              </div>

              {/* Connector line */}
              {i < DEAL_STAGES.length - 1 && (
                <div className="flex items-center pt-4 px-0.5 shrink-0">
                  <div className={cn(
                    'h-0.5 w-6 md:w-10 transition-colors',
                    isCompleted ? 'bg-chart-2' :
                    isCurrent ? 'bg-gradient-to-r from-primary to-border/30' : 'bg-border/30'
                  )} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Terminal status badge */}
      {isTerminal && (
        <div className="flex justify-center">
          <Badge variant="outline" className={cn('text-xs', config.bg, config.color)}>
            {config.icon} {config.label}
          </Badge>
        </div>
      )}

      {/* Duration indicator */}
      {stageTimestamps.inquiry && !isTerminal && (
        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <CalendarClock className="h-3 w-3" />
          <span>
            {stageTimestamps.completion
              ? `Completed in ${daysBetween(stageTimestamps.inquiry, stageTimestamps.completion)} days`
              : `${daysBetween(stageTimestamps.inquiry, new Date().toISOString())} days in progress`
            }
          </span>
        </div>
      )}
    </div>
  );
}

// ── Message Bubble ──
function MessageBubble({ msg, isOwn }: { msg: OfferMessage; isOwn: boolean }) {
  const isSystem = msg.sender_role === 'system' || msg.message_type === 'status_change';
  const isCounter = msg.message_type === 'counter_offer';
  const isMilestone = msg.message_type === 'milestone';
  const isNote = (msg.metadata as any)?.is_note;

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-center my-2"
      >
        <div className={cn(
          'px-3 py-1.5 rounded-full border text-[10px] flex items-center gap-1.5',
          isCounter
            ? 'bg-purple-500/10 border-purple-500/20 text-purple-600'
            : 'bg-muted/30 border-border/30 text-muted-foreground'
        )}>
          {isCounter ? <RefreshCw className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {msg.message}
          <span className="text-[9px] ml-1 opacity-60">
            {formatTime(msg.created_at)}
          </span>
        </div>
      </motion.div>
    );
  }

  if (isMilestone) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center my-3"
      >
        <div className="px-4 py-2 rounded-lg bg-primary/5 border border-primary/20 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <Zap className="h-3 w-3 text-primary" />
            <span className="text-[10px] font-semibold text-primary">Milestone</span>
          </div>
          <p className="text-xs text-foreground">{msg.message}</p>
          <span className="text-[9px] text-muted-foreground">{formatDateTime(msg.created_at)}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex mb-2', isOwn ? 'justify-end' : 'justify-start')}
    >
      <div className={cn(
        'max-w-[75%] rounded-2xl px-3 py-2 text-xs',
        isNote
          ? 'bg-chart-4/10 text-foreground border border-chart-4/20 rounded-lg'
          : isOwn
          ? 'bg-primary text-primary-foreground rounded-br-sm'
          : 'bg-muted/40 text-foreground border border-border/30 rounded-bl-sm'
      )}>
        <div className="flex items-center gap-1 mb-0.5">
          {isNote && <StickyNote className="h-2.5 w-2.5 text-chart-4" />}
          <span className="font-semibold text-[10px] capitalize">{msg.sender_role}</span>
          {isNote && <Badge variant="secondary" className="text-[8px] h-3 bg-chart-4/10 text-chart-4">Note</Badge>}
        </div>
        <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
        <span className={cn(
          'text-[9px] mt-1 block',
          isNote ? 'text-chart-4/60' : isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground'
        )}>
          {formatTime(msg.created_at)}
        </span>
      </div>
    </motion.div>
  );
}

// ── Add Note Dialog ──
function AddNoteDialog({
  open,
  onOpenChange,
  offerId,
  senderRole,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  offerId: string;
  senderRole: string;
}) {
  const sendMessage = useSendOfferMessage();
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!note.trim()) return;
    sendMessage.mutate(
      {
        offerId,
        message: note.trim(),
        senderRole: senderRole as SenderRole,
        messageType: 'text',
      },
      { onSuccess: () => { setNote(''); onOpenChange(false); } }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-chart-4" />
            Attach Negotiation Note
          </DialogTitle>
        </DialogHeader>
        <Textarea
          placeholder="Add context, terms discussed, follow-up items..."
          rows={4}
          value={note}
          onChange={e => setNote(e.target.value)}
          className="text-sm"
        />
        <p className="text-[10px] text-muted-foreground">
          Notes are visible to all parties in this negotiation thread.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!note.trim() || sendMessage.isPending} className="gap-1">
            <StickyNote className="h-3.5 w-3.5" /> Add Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──
export default function OfferNegotiationPage() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: offer, isLoading } = useOffer(offerId);
  const { data: messages = [] } = useOfferMessages(offerId);
  const updateStatus = useUpdateOfferStatus();
  const sendMessage = useSendOfferMessage();

  const [newMessage, setNewMessage] = useState('');
  const [showCounter, setShowCounter] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [counterPrice, setCounterPrice] = useState(0);
  const [chatTab, setChatTab] = useState('thread');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const myRole = useMemo((): string => {
    if (!user || !offer) return 'buyer';
    if (user.id === offer.agent_id) return 'agent';
    if (user.id === offer.seller_id) return 'seller';
    return 'buyer';
  }, [user, offer]);

  const isBuyer = myRole === 'buyer';
  const isSeller = myRole === 'seller' || myRole === 'agent';
  const isActive = offer && !['completed', 'rejected', 'withdrawn', 'expired'].includes(offer.status);

  // ── Derive stage timestamps from messages ──
  const stageTimestamps = useMemo(() => {
    const timestamps: Record<string, string | null> = {
      inquiry: offer?.created_at || null,
      offer: offer?.created_at || null,
      negotiation: null,
      agreement: null,
      completion: null,
    };

    // Find first status_change message for each stage
    messages.forEach(msg => {
      if (msg.message_type !== 'status_change' && msg.message_type !== 'counter_offer') return;
      const text = msg.message.toLowerCase();

      if ((text.includes('reviewing') || text.includes('counter')) && !timestamps.negotiation) {
        timestamps.negotiation = msg.created_at;
      }
      if (text.includes('accepted') && !timestamps.agreement) {
        timestamps.agreement = msg.created_at;
      }
      if (text.includes('completed') && !timestamps.completion) {
        timestamps.completion = msg.created_at;
      }
    });

    // Fallback from offer fields
    if (offer?.accepted_at && !timestamps.agreement) timestamps.agreement = offer.accepted_at;
    if (offer?.completed_at && !timestamps.completion) timestamps.completion = offer.completed_at;

    return timestamps;
  }, [offer, messages]);

  // Separate notes from regular messages
  const noteMessages = messages.filter(m =>
    (m.metadata as any)?.is_note || m.message_type === 'milestone'
  );

  const handleSend = () => {
    if (!newMessage.trim() || !offerId) return;
    sendMessage.mutate({ offerId, message: newMessage.trim(), senderRole: myRole as SenderRole });
    setNewMessage('');
  };

  const handleStatusChange = (status: OfferStatus, message?: string) => {
    if (!offerId) return;
    updateStatus.mutate({ offerId, status, message });
  };

  const handleCounterOffer = () => {
    if (!offerId || counterPrice <= 0) return;
    updateStatus.mutate({ offerId, status: 'counter_offer', counterPrice });
    setShowCounter(false);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <p className="text-muted-foreground">Offer not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const statusConfig = OFFER_STATUS_CONFIG[offer.status];

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">
            {offer.property_title || 'Property Offer'}
          </h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <Badge variant="outline" className={cn('text-xs', statusConfig.bg, statusConfig.color)}>
              {statusConfig.icon} {statusConfig.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground">
              Started {formatDateTime(offer.created_at)}
            </span>
            <Badge variant="secondary" className="text-[9px]">
              You: {myRole}
            </Badge>
          </div>
        </div>
        {offer.property_id && (
          <Link to={`/property/${offer.property_id}`}>
            <Button variant="outline" size="sm" className="gap-1 text-xs shrink-0">
              <ArrowUpRight className="h-3 w-3" /> Property
            </Button>
          </Link>
        )}
      </div>

      {/* ── Progress Stepper ── */}
      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardContent className="p-4 md:p-5">
          <DealProgressStepper
            currentStatus={offer.status}
            stageTimestamps={stageTimestamps}
          />
        </CardContent>
      </Card>

      {/* ── Offer Summary + Actions ── */}
      <div className="grid md:grid-cols-2 gap-3">
        {/* Offer details */}
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <DollarSign className="h-3.5 w-3.5" /> Deal Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Offer Price</span>
              <span className="text-sm font-bold text-foreground">{formatPrice(offer.offer_price)}</span>
            </div>
            {offer.counter_price && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Counter Price</span>
                <span className="text-sm font-bold text-purple-500">{formatPrice(offer.counter_price)}</span>
              </div>
            )}
            {offer.property_original_price && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Listed Price</span>
                <span className="text-sm text-muted-foreground line-through">{formatPrice(offer.property_original_price)}</span>
              </div>
            )}
            {offer.property_original_price && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Discount</span>
                <Badge className="text-[10px] bg-chart-2/10 text-chart-2 border-0">
                  {Math.round(((offer.property_original_price - (offer.counter_price || offer.offer_price)) / offer.property_original_price) * 100)}% below asking
                </Badge>
              </div>
            )}
            <div className="border-t border-border/30 pt-2 mt-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Financing</span>
                <Badge variant="secondary" className="text-[10px]">{offer.financing_method}</Badge>
              </div>
              {offer.completion_timeline && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Timeline</span>
                  <span className="text-xs text-foreground">{offer.completion_timeline}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Status Actions */}
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" /> Update Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {isActive ? (
              <>
                {isSeller && offer.status === 'submitted' && (
                  <Button size="sm" variant="outline" className="w-full text-xs gap-1.5" onClick={() => handleStatusChange('seller_reviewing')}>
                    👀 Mark as Reviewing
                  </Button>
                )}
                {isSeller && ['submitted', 'seller_reviewing'].includes(offer.status) && (
                  <>
                    <Button size="sm" className="w-full text-xs gap-1.5 bg-chart-2 hover:bg-chart-2/90 text-chart-2-foreground" onClick={() => handleStatusChange('accepted')}>
                      <Handshake className="h-3.5 w-3.5" /> Accept Offer
                    </Button>
                    <Button size="sm" variant="outline" className="w-full text-xs gap-1.5" onClick={() => { setCounterPrice(offer.offer_price); setShowCounter(true); }}>
                      <RefreshCw className="h-3.5 w-3.5" /> Counter Offer
                    </Button>
                    <Button size="sm" variant="destructive" className="w-full text-xs gap-1.5" onClick={() => handleStatusChange('rejected')}>
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                  </>
                )}
                {isBuyer && offer.status === 'counter_offer' && (
                  <>
                    <Button size="sm" className="w-full text-xs gap-1.5 bg-chart-2 hover:bg-chart-2/90 text-chart-2-foreground" onClick={() => handleStatusChange('accepted')}>
                      <Handshake className="h-3.5 w-3.5" /> Accept Counter
                    </Button>
                    <Button size="sm" variant="outline" className="w-full text-xs gap-1.5" onClick={() => handleStatusChange('withdrawn')}>
                      ↩️ Withdraw Offer
                    </Button>
                  </>
                )}
                {isBuyer && ['submitted', 'seller_reviewing'].includes(offer.status) && (
                  <Button size="sm" variant="outline" className="w-full text-xs gap-1.5" onClick={() => handleStatusChange('withdrawn')}>
                    ↩️ Withdraw Offer
                  </Button>
                )}
                {(isSeller || myRole === 'agent') && offer.status === 'accepted' && (
                  <Button size="sm" className="w-full text-xs gap-1.5" onClick={() => handleStatusChange('in_progress')}>
                    ⚙️ Start Transaction Process
                  </Button>
                )}
                {(isSeller || myRole === 'agent') && offer.status === 'in_progress' && (
                  <Button size="sm" className="w-full text-xs gap-1.5 bg-chart-2 hover:bg-chart-2/90 text-chart-2-foreground" onClick={() => handleStatusChange('completed')}>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Mark Completed
                  </Button>
                )}

                {/* Always show note button */}
                <div className="border-t border-border/30 pt-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs gap-1.5 text-chart-4 border-chart-4/30 hover:bg-chart-4/5"
                    onClick={() => setShowNote(true)}
                  >
                    <StickyNote className="h-3.5 w-3.5" /> Attach Note
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Shield className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">
                  This deal is {offer.status === 'completed' ? 'completed' : 'no longer active'}.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Chat Thread with Notes Tab ── */}
      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardHeader className="pb-2 px-4 pt-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Negotiation Thread
            </CardTitle>
            <Badge variant="secondary" className="text-[9px]">
              {messages.length} messages
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Tabs value={chatTab} onValueChange={setChatTab}>
            <TabsList className="h-7 mb-3">
              <TabsTrigger value="thread" className="text-[10px] h-6 gap-1">
                <MessageSquare className="h-3 w-3" /> All Messages
              </TabsTrigger>
              <TabsTrigger value="notes" className="text-[10px] h-6 gap-1">
                <StickyNote className="h-3 w-3" /> Notes ({noteMessages.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="thread" className="mt-0">
              <div className="h-[380px] overflow-y-auto px-1 space-y-1 scrollbar-thin">
                {messages.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">No messages yet. Start the conversation.</p>
                  </div>
                )}
                {messages.map(msg => (
                  <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-0">
              <div className="h-[380px] overflow-y-auto px-1 space-y-2">
                {noteMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <StickyNote className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground">No notes yet.</p>
                    {isActive && (
                      <Button
                        variant="outline" size="sm" className="mt-3 text-xs gap-1"
                        onClick={() => setShowNote(true)}
                      >
                        <Plus className="h-3 w-3" /> Add First Note
                      </Button>
                    )}
                  </div>
                ) : (
                  noteMessages.map(msg => (
                    <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Message input */}
          {isActive && (
            <div className="flex gap-2 mt-3 pt-3 border-t border-border/30">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                className="text-sm"
              />
              <Button
                size="sm"
                variant="outline"
                className="shrink-0 gap-1 text-xs text-chart-4 border-chart-4/30 hover:bg-chart-4/5"
                onClick={() => setShowNote(true)}
              >
                <StickyNote className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Counter Offer Dialog */}
      <Dialog open={showCounter} onOpenChange={setShowCounter}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-purple-500" /> Submit Counter Offer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Current Offer</label>
              <p className="text-sm font-bold text-foreground">{formatPrice(offer.offer_price)}</p>
            </div>
            <div>
              <label className="text-xs font-medium">Counter Price (Rp)</label>
              <Input type="number" min={1} value={counterPrice} onChange={e => setCounterPrice(Number(e.target.value))} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCounter(false)}>Cancel</Button>
            <Button onClick={handleCounterOffer} disabled={counterPrice <= 0}>Submit Counter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      {offerId && (
        <AddNoteDialog
          open={showNote}
          onOpenChange={setShowNote}
          offerId={offerId}
          senderRole={myRole}
        />
      )}
    </div>
  );
}
