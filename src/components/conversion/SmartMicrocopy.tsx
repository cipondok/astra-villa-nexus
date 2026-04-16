import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, MessageCircle, TrendingUp, Wallet, X, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/useTranslation';
import { useHesitationDetector, type HesitationSignal } from '@/hooks/useHesitationDetector';
import { useBehaviorTracking } from '@/hooks/useBehaviorTracking';

interface SmartMicrocopyProps {
  /** Context for the microcopy — affects which messages appear */
  context?: 'property' | 'escrow' | 'wallet' | 'checkout';
  /** Whether user has insufficient wallet balance */
  lowBalance?: boolean;
  /** Whether this is a high-value property */
  highValue?: boolean;
  className?: string;
}

interface MicrocopyMessage {
  id: string;
  icon: React.ElementType;
  text: string;
  priority: number;
  trigger: HesitationSignal | 'low_balance' | 'high_value' | 'default';
  colorClass: string;
}

/**
 * Smart microcopy system that dynamically shows contextual trust/guidance
 * messages based on user hesitation patterns.
 * 
 * Non-intrusive — appears as a subtle inline banner, NOT a popup.
 */
const SmartMicrocopy = memo(({
  context = 'property',
  lowBalance = false,
  highValue = false,
  className,
}: SmartMicrocopyProps) => {
  const { t } = useTranslation();
  const { isHesitating, signals, dismiss } = useHesitationDetector();
  const { trackEvent } = useBehaviorTracking();
  const [dismissed, setDismissed] = useState(false);
  const [activeMessage, setActiveMessage] = useState<MicrocopyMessage | null>(null);

  // Build context-aware message pool
  useEffect(() => {
    if (dismissed) return;

    const messages: MicrocopyMessage[] = [];

    // Hesitation-triggered messages
    if (isHesitating && signals.includes('long_dwell')) {
      messages.push({
        id: 'escrow-protection',
        icon: Shield,
        text: t('smartMicrocopy.fundsProtected', 'Your funds are fully protected under escrow until all conditions are met'),
        priority: 10,
        trigger: 'long_dwell',
        colorClass: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400',
      });
    }

    if (isHesitating && signals.includes('idle')) {
      messages.push({
        id: 'need-help',
        icon: HelpCircle,
        text: t('smartMicrocopy.needHelp', 'Need assistance? Our investment advisors are available to help'),
        priority: 8,
        trigger: 'idle',
        colorClass: 'border-primary/20 bg-primary/5 text-primary',
      });
    }

    if (isHesitating && signals.includes('repeated_scroll')) {
      messages.push({
        id: 'trust-reassurance',
        icon: Shield,
        text: t('smartMicrocopy.verifiedProperty', 'This property has been legally verified with ownership documents confirmed'),
        priority: 7,
        trigger: 'repeated_scroll',
        colorClass: 'border-chart-1/20 bg-chart-1/5 text-chart-1',
      });
    }

    // Balance-triggered messages
    if (lowBalance) {
      messages.push({
        id: 'low-balance',
        icon: Wallet,
        text: t('smartMicrocopy.smallerDeposit', 'Start with a smaller secured deposit — as low as 1% of property value'),
        priority: 9,
        trigger: 'low_balance',
        colorClass: 'border-gold-primary/20 bg-gold-primary/5 text-gold-primary',
      });
    }

    // High-value property messages
    if (highValue && context === 'property') {
      messages.push({
        id: 'high-value',
        icon: TrendingUp,
        text: t('smartMicrocopy.premiumInvestment', 'Premium properties consistently outperform market averages by 12-18% annually'),
        priority: 6,
        trigger: 'high_value',
        colorClass: 'border-chart-5/20 bg-chart-5/5 text-chart-5',
      });
    }

    // Context-specific defaults (show after 10s even without hesitation)
    if (context === 'escrow' && messages.length === 0) {
      messages.push({
        id: 'escrow-default',
        icon: Shield,
        text: t('smartMicrocopy.escrowDefault', 'Escrow deposits are fully refundable if verification conditions are not met'),
        priority: 3,
        trigger: 'default',
        colorClass: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400',
      });
    }

    if (context === 'checkout' && messages.length === 0) {
      messages.push({
        id: 'checkout-default',
        icon: Shield,
        text: t('smartMicrocopy.checkoutDefault', 'Your transaction is protected by institutional-grade escrow and dispute resolution'),
        priority: 3,
        trigger: 'default',
        colorClass: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400',
      });
    }

    // Pick highest priority
    const best = messages.sort((a, b) => b.priority - a.priority)[0] || null;
    
    if (best && best.id !== activeMessage?.id) {
      setActiveMessage(best);
      trackEvent({
        eventType: 'click',
        elementId: `microcopy-shown-${best.id}`,
        metadata: { trigger: best.trigger, context },
      });
    }
  }, [isHesitating, signals, lowBalance, highValue, context, dismissed, t, activeMessage?.id, trackEvent]);

  const handleDismiss = () => {
    setDismissed(true);
    dismiss();
    if (activeMessage) {
      trackEvent({
        eventType: 'click',
        elementId: `microcopy-dismissed-${activeMessage.id}`,
        metadata: { context },
      });
    }
  };

  return (
    <AnimatePresence>
      {activeMessage && !dismissed && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 8 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.3 }}
          className={cn('overflow-hidden', className)}
        >
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px]',
            activeMessage.colorClass,
          )}>
            <activeMessage.icon className="h-3.5 w-3.5 flex-shrink-0" />
            <p className="flex-1 leading-relaxed">{activeMessage.text}</p>
            <button
              onClick={handleDismiss}
              className="p-0.5 rounded hover:bg-background/50 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

SmartMicrocopy.displayName = 'SmartMicrocopy';
export default SmartMicrocopy;
