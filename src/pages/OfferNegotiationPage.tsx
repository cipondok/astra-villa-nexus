import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useOffer, useOfferMessages, useUpdateOfferStatus, useSendOfferMessage,
  OFFER_STATUS_CONFIG, TIMELINE_STEPS, type OfferStatus, type SenderRole,
} from '@/hooks/usePropertyOffers';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  ArrowLeft, Send, DollarSign, Clock, CheckCircle2, XCircle, RefreshCw,
  MessageSquare, FileText, User, Building,
} from 'lucide-react';

function formatPrice(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

// ── Timeline Progress ──
function OfferTimeline({ currentStatus }: { currentStatus: OfferStatus }) {
  const config = OFFER_STATUS_CONFIG[currentStatus];
  const currentStep = config.step;
  const isTerminal = currentStep < 0;

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {TIMELINE_STEPS.map((step, i) => {
        const stepIndex = TIMELINE_STEPS.findIndex(s => s.status === currentStatus);
        const isActive = !isTerminal && stepIndex >= i;
        const isCurrent = step.status === currentStatus || (currentStatus === 'counter_offer' && step.status === 'seller_reviewing');
        return (
          <div key={step.status} className="flex items-center gap-1 shrink-0">
            <div className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border transition-all',
              isCurrent ? 'bg-primary text-primary-foreground border-primary' :
              isActive ? 'bg-primary/10 text-primary border-primary/30' :
              'bg-muted/20 text-muted-foreground border-border/30'
            )}>
              {isCurrent ? <CheckCircle2 className="h-3 w-3" /> : <span className="w-3 h-3 rounded-full border border-current inline-block" />}
              {step.label}
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={cn('w-6 h-px', isActive ? 'bg-primary' : 'bg-border/50')} />
            )}
          </div>
        );
      })}
      {isTerminal && (
        <Badge variant="outline" className={cn('ml-2', config.bg, config.color)}>
          {config.icon} {config.label}
        </Badge>
      )}
    </div>
  );
}

// ── Message Bubble ──
function MessageBubble({ msg, isOwn }: { msg: any; isOwn: boolean }) {
  const isSystem = msg.sender_role === 'system' || msg.message_type === 'status_change';
  const isCounter = msg.message_type === 'counter_offer';

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <div className="px-3 py-1.5 rounded-full bg-muted/30 border border-border/30 text-[10px] text-muted-foreground flex items-center gap-1">
          {isCounter ? <RefreshCw className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {msg.message}
          <span className="text-[9px] ml-2">{new Date(msg.created_at).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex mb-2', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[75%] rounded-2xl px-3 py-2 text-xs',
        isOwn
          ? 'bg-primary text-primary-foreground rounded-br-sm'
          : 'bg-muted/40 text-foreground border border-border/30 rounded-bl-sm'
      )}>
        <div className="flex items-center gap-1 mb-0.5">
          <span className="font-semibold text-[10px] capitalize">{msg.sender_role}</span>
          {msg.message_type === 'milestone' && <Badge variant="secondary" className="text-[8px] h-3">Milestone</Badge>}
        </div>
        <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
        <span className={cn('text-[9px] mt-1 block', isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground')}>
          {new Date(msg.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
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
  const [counterPrice, setCounterPrice] = useState(0);
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

  const handleSend = () => {
    if (!newMessage.trim() || !offerId) return;
    sendMessage.mutate({ offerId, message: newMessage.trim(), senderRole: myRole });
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
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-[400px] w-full" />
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
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-foreground truncate">
            {offer.property_title || 'Property Offer'}
          </h1>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge variant="outline" className={cn('text-xs', statusConfig.bg, statusConfig.color)}>
              {statusConfig.icon} {statusConfig.label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {new Date(offer.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardContent className="py-3 px-4">
          <OfferTimeline currentStatus={offer.status} />
        </CardContent>
      </Card>

      {/* Offer Summary */}
      <div className="grid md:grid-cols-2 gap-3">
        <Card className="bg-card/80 backdrop-blur border-border/50">
          <CardContent className="p-4 space-y-2">
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
                <span className="text-sm text-muted-foreground">{formatPrice(offer.property_original_price)}</span>
              </div>
            )}
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
          </CardContent>
        </Card>

        {/* Action buttons */}
        {isActive && (
          <Card className="bg-card/80 backdrop-blur border-border/50">
            <CardContent className="p-4 space-y-2">
              <p className="text-xs font-medium text-foreground mb-2">Actions ({myRole})</p>
              {isSeller && offer.status === 'submitted' && (
                <Button size="sm" className="w-full text-xs" onClick={() => handleStatusChange('seller_reviewing')}>
                  👀 Mark as Reviewing
                </Button>
              )}
              {isSeller && ['submitted', 'seller_reviewing'].includes(offer.status) && (
                <>
                  <Button size="sm" className="w-full text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange('accepted')}>
                    🤝 Accept Offer
                  </Button>
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => { setCounterPrice(offer.offer_price); setShowCounter(true); }}>
                    🔄 Counter Offer
                  </Button>
                  <Button size="sm" variant="destructive" className="w-full text-xs" onClick={() => handleStatusChange('rejected')}>
                    ❌ Reject
                  </Button>
                </>
              )}
              {isBuyer && offer.status === 'counter_offer' && (
                <>
                  <Button size="sm" className="w-full text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange('accepted')}>
                    🤝 Accept Counter
                  </Button>
                  <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => handleStatusChange('withdrawn')}>
                    ↩️ Withdraw Offer
                  </Button>
                </>
              )}
              {isBuyer && ['submitted', 'seller_reviewing'].includes(offer.status) && (
                <Button size="sm" variant="outline" className="w-full text-xs" onClick={() => handleStatusChange('withdrawn')}>
                  ↩️ Withdraw Offer
                </Button>
              )}
              {(isSeller || myRole === 'agent') && offer.status === 'accepted' && (
                <Button size="sm" className="w-full text-xs" onClick={() => handleStatusChange('in_progress')}>
                  ⚙️ Start Transaction
                </Button>
              )}
              {(isSeller || myRole === 'agent') && offer.status === 'in_progress' && (
                <Button size="sm" className="w-full text-xs bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange('completed')}>
                  ✅ Mark Completed
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chat Thread */}
      <Card className="bg-card/80 backdrop-blur border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" /> Negotiation Thread
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] overflow-y-auto px-1 space-y-1">
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No messages yet. Start the conversation.</p>
            )}
            {messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} isOwn={msg.sender_id === user?.id} />
            ))}
            <div ref={messagesEndRef} />
          </div>

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
              <Button size="icon" onClick={handleSend} disabled={!newMessage.trim()}>
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
            <DialogTitle>Submit Counter Offer</DialogTitle>
          </DialogHeader>
          <div>
            <label className="text-xs font-medium">Counter Price (Rp)</label>
            <Input type="number" min={1} value={counterPrice} onChange={e => setCounterPrice(Number(e.target.value))} className="mt-1" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCounter(false)}>Cancel</Button>
            <Button onClick={handleCounterOffer} disabled={counterPrice <= 0}>Submit Counter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
