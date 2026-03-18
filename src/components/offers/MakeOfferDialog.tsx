import { useState, useMemo } from 'react';
import { useCreateOffer, type CreateOfferInput, type FinancingMethod } from '@/hooks/usePropertyOffers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, TrendingDown, TrendingUp, Minus, CheckCircle2, Clock, Sparkles, ArrowRight, ArrowLeft, Shield, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

function formatPrice(v: number) {
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(0)}jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

type CompetitiveTier = 'below' | 'aligned' | 'premium';
type Step = 'form' | 'review' | 'success';

function getCompetitiveTier(offerPrice: number, listPrice: number): CompetitiveTier {
  const ratio = offerPrice / listPrice;
  if (ratio < 0.92) return 'below';
  if (ratio <= 1.05) return 'aligned';
  return 'premium';
}

const tierConfig: Record<CompetitiveTier, { label: string; description: string; icon: typeof TrendingDown; colorClass: string; bgClass: string; borderClass: string; acceptance: string }> = {
  below: {
    label: 'Below Market',
    description: 'Aggressive offer — may need negotiation rounds',
    icon: TrendingDown,
    colorClass: 'text-chart-4',
    bgClass: 'bg-chart-4/10',
    borderClass: 'border-chart-4/20',
    acceptance: '~35% acceptance rate',
  },
  aligned: {
    label: 'Market Aligned',
    description: 'Strong competitive position — high acceptance probability',
    icon: Minus,
    colorClass: 'text-chart-2',
    bgClass: 'bg-chart-2/10',
    borderClass: 'border-chart-2/20',
    acceptance: '~78% acceptance rate',
  },
  premium: {
    label: 'Premium Offer',
    description: 'Above market — signals serious buyer intent',
    icon: TrendingUp,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
    borderClass: 'border-primary/20',
    acceptance: '~92% acceptance rate',
  },
};

const financingLabels: Record<string, string> = {
  cash: '💵 Cash',
  mortgage: '🏦 Mortgage / KPR',
  mixed: '🔀 Mixed',
};

interface MakeOfferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  propertyTitle?: string;
  propertyImage?: string;
  propertyPrice?: number;
  sellerId?: string | null;
  agentId?: string | null;
  opportunityScore?: number | null;
}

export default function MakeOfferDialog({
  open, onOpenChange, propertyId, propertyTitle, propertyImage, propertyPrice, sellerId, agentId, opportunityScore,
}: MakeOfferDialogProps) {
  const createOffer = useCreateOffer();
  const [step, setStep] = useState<Step>('form');
  const [form, setForm] = useState({
    offer_price: propertyPrice ? Math.round(propertyPrice * 0.9) : 0,
    financing_method: 'cash' as FinancingMethod,
    completion_timeline: '30 days',
    buyer_message: '',
  });

  const discount = propertyPrice && form.offer_price
    ? Math.round((1 - form.offer_price / propertyPrice) * 100)
    : 0;

  const tier = useMemo(() => {
    if (!propertyPrice || form.offer_price <= 0) return null;
    return getCompetitiveTier(form.offer_price, propertyPrice);
  }, [form.offer_price, propertyPrice]);

  const aiEstimate = useMemo(() => {
    if (!propertyPrice) return null;
    const factor = opportunityScore && opportunityScore > 70 ? 0.95 : 0.97;
    return Math.round(propertyPrice * factor);
  }, [propertyPrice, opportunityScore]);

  // Suggested offer range
  const suggestedRange = useMemo(() => {
    if (!propertyPrice) return null;
    return { low: Math.round(propertyPrice * 0.85), high: Math.round(propertyPrice * 0.98) };
  }, [propertyPrice]);

  const handleSubmit = () => {
    if (form.offer_price <= 0) return;
    const input: CreateOfferInput = {
      property_id: propertyId,
      seller_id: sellerId,
      agent_id: agentId,
      offer_price: form.offer_price,
      financing_method: form.financing_method,
      completion_timeline: form.completion_timeline,
      buyer_message: form.buyer_message || undefined,
      property_title: propertyTitle,
      property_image: propertyImage,
      property_original_price: propertyPrice,
    };
    createOffer.mutate(input, {
      onSuccess: () => setStep('success'),
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep('form');
    }, 300);
  };

  const currentTier = tier ? tierConfig[tier] : null;

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-background border-border">
        <AnimatePresence mode="wait" custom={step === 'form' ? -1 : 1}>
          {step === 'success' ? (
            /* ── SUCCESS ── */
            <motion.div
              key="success"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="p-6 flex flex-col items-center text-center gap-4"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-chart-2/15 flex items-center justify-center"
              >
                <CheckCircle2 className="h-8 w-8 text-chart-2" />
              </motion.div>

              <div>
                <h3 className="text-lg font-semibold text-foreground">Offer Submitted</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your offer of <span className="font-medium text-foreground">{formatPrice(form.offer_price)}</span> has been sent.
                </p>
              </div>

              <div className="w-full p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Agent will respond within <strong className="text-foreground">24 hours</strong></span>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  Track your offer status and negotiate directly from <strong>My Offers</strong> dashboard.
                </p>
              </div>

              <div className="flex gap-2 w-full mt-2">
                <Button variant="outline" className="flex-1" onClick={handleClose}>
                  Close
                </Button>
                <Button className="flex-1 gap-1.5" onClick={() => { handleClose(); window.location.href = '/my-offers'; }}>
                  My Offers <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>

          ) : step === 'review' ? (
            /* ── REVIEW SUMMARY ── */
            <motion.div
              key="review"
              custom={1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="p-6 space-y-4"
            >
              <DialogHeader className="p-0">
                <DialogTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-5 w-5 text-primary" />
                  Review Your Offer
                </DialogTitle>
              </DialogHeader>

              {/* Property recap */}
              {propertyTitle && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  {propertyImage && (
                    <img src={propertyImage} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{propertyTitle}</p>
                    {propertyPrice && (
                      <p className="text-xs text-muted-foreground">Listed: <span className="font-semibold text-foreground">{formatPrice(propertyPrice)}</span></p>
                    )}
                  </div>
                </div>
              )}

              {/* Summary details */}
              <div className="rounded-xl border border-border/60 divide-y divide-border/40 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">Your Offer</span>
                  <span className="text-sm font-bold text-foreground">{formatPrice(form.offer_price)}</span>
                </div>
                {discount !== 0 && (
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">vs. Asking Price</span>
                    <span className={cn('text-xs font-semibold', discount > 0 ? 'text-chart-2' : 'text-chart-4')}>
                      {discount > 0 ? `${discount}% below` : `${Math.abs(discount)}% above`}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">Financing</span>
                  <span className="text-xs font-medium text-foreground">{financingLabels[form.financing_method] || form.financing_method}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">Timeline</span>
                  <span className="text-xs font-medium text-foreground">{form.completion_timeline}</span>
                </div>
                {form.buyer_message && (
                  <div className="px-4 py-2.5">
                    <span className="text-xs text-muted-foreground block mb-1">Your Message</span>
                    <p className="text-xs text-foreground leading-relaxed">{form.buyer_message}</p>
                  </div>
                )}
              </div>

              {/* AI Competitiveness recap */}
              {currentTier && (
                <div className={cn('flex items-center gap-3 p-3 rounded-lg border', currentTier.bgClass, currentTier.borderClass)}>
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', currentTier.bgClass, 'border', currentTier.borderClass)}>
                    <currentTier.icon className={cn('h-4 w-4', currentTier.colorClass)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-semibold', currentTier.colorClass)}>{currentTier.label}</p>
                    <p className="text-[10px] text-muted-foreground">{currentTier.acceptance}</p>
                  </div>
                </div>
              )}

              {/* Trust note */}
              <div className="flex items-start gap-2 px-1">
                <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Your offer is non-binding until a formal agreement is signed. All negotiations are private between you and the seller/agent.
                </p>
              </div>

              <DialogFooter className="p-0 gap-2">
                <Button variant="outline" onClick={() => setStep('form')} className="gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createOffer.isPending}
                  className="gap-1.5 flex-1"
                >
                  {createOffer.isPending ? 'Submitting…' : 'Confirm & Submit'}
                </Button>
              </DialogFooter>
            </motion.div>

          ) : (
            /* ── OFFER FORM ── */
            <motion.div
              key="form"
              custom={-1}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="p-6 space-y-4"
            >
              <DialogHeader className="p-0">
                <DialogTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Make an Offer
                </DialogTitle>
              </DialogHeader>

              {/* Property Header */}
              {propertyTitle && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  {propertyImage && (
                    <img src={propertyImage} alt="" className="w-14 h-14 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{propertyTitle}</p>
                    {propertyPrice && (
                      <p className="text-xs text-muted-foreground">Listed: <span className="font-semibold text-foreground">{formatPrice(propertyPrice)}</span></p>
                    )}
                  </div>
                </div>
              )}

              {/* Offer Price */}
              <div>
                <label className="text-xs font-medium text-foreground">Your Offer Price (Rp) *</label>
                <Input
                  type="number"
                  min={1}
                  value={form.offer_price}
                  onChange={e => setForm(f => ({ ...f, offer_price: Number(e.target.value) }))}
                  className="mt-1"
                />
                <div className="flex items-center justify-between mt-1">
                  {discount > 0 && (
                    <p className="text-[10px] text-chart-2">{discount}% below asking price</p>
                  )}
                  {discount < 0 && (
                    <p className="text-[10px] text-chart-4">{Math.abs(discount)}% above asking price</p>
                  )}
                  {discount === 0 && <span />}
                  {suggestedRange && (
                    <p className="text-[10px] text-muted-foreground">
                      Typical: {formatPrice(suggestedRange.low)} – {formatPrice(suggestedRange.high)}
                    </p>
                  )}
                </div>
              </div>

              {/* AI Guidance Panel */}
              {propertyPrice && form.offer_price > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="rounded-lg border border-border/50 overflow-hidden"
                >
                  {aiEstimate && (
                    <div className="px-3 py-2 bg-muted/20 border-b border-border/30 flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      <span className="text-[11px] text-muted-foreground">
                        AI Fair Value Estimate: <span className="font-semibold text-foreground">{formatPrice(aiEstimate)}</span>
                      </span>
                    </div>
                  )}

                  {currentTier && (
                    <div className={cn('px-3 py-2.5 flex items-center gap-3', currentTier.bgClass)}>
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center border', currentTier.bgClass, currentTier.borderClass)}>
                        <currentTier.icon className={cn('h-4 w-4', currentTier.colorClass)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-xs font-semibold', currentTier.colorClass)}>{currentTier.label}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">{currentTier.description}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Financing */}
              <div>
                <label className="text-xs font-medium text-foreground">Financing Method</label>
                <Select value={form.financing_method} onValueChange={v => setForm(f => ({ ...f, financing_method: v as FinancingMethod }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">💵 Cash</SelectItem>
                    <SelectItem value="mortgage">🏦 Mortgage / KPR</SelectItem>
                    <SelectItem value="mixed">🔀 Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Timeline */}
              <div>
                <label className="text-xs font-medium text-foreground">Preferred Completion Timeline</label>
                <Select value={form.completion_timeline} onValueChange={v => setForm(f => ({ ...f, completion_timeline: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="14 days">14 days</SelectItem>
                    <SelectItem value="30 days">30 days</SelectItem>
                    <SelectItem value="60 days">60 days</SelectItem>
                    <SelectItem value="90 days">90 days</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-medium text-foreground">Message to Seller (optional)</label>
                <Textarea
                  rows={2}
                  placeholder="Tell the seller why you're interested..."
                  value={form.buyer_message}
                  maxLength={500}
                  onChange={e => setForm(f => ({ ...f, buyer_message: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-[10px] text-muted-foreground/60 text-right mt-0.5">{form.buyer_message.length}/500</p>
              </div>

              <DialogFooter className="p-0 gap-2">
                <Button variant="outline" onClick={handleClose}>Cancel</Button>
                <Button
                  onClick={() => setStep('review')}
                  disabled={form.offer_price <= 0}
                  className="gap-1.5"
                >
                  Review Offer <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
