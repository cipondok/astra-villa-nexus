import React from 'react';
import { Shield, AlertTriangle, TrendingUp, MessageCircle, Gift, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { InterventionDecision } from '@/hooks/useRealTimeIntervention';

interface Props {
  intervention: InterventionDecision | null;
  onDismiss: () => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  show_urgency: <TrendingUp className="h-4 w-4" />,
  show_advisor: <MessageCircle className="h-4 w-4" />,
  show_trust_signal: <Shield className="h-4 w-4" />,
  show_incentive: <Gift className="h-4 w-4" />,
  require_verification: <AlertTriangle className="h-4 w-4" />,
  restrict_action: <AlertTriangle className="h-4 w-4" />,
};

const STYLE_MAP: Record<string, string> = {
  show_urgency: 'border-amber-500/30 bg-amber-500/5 text-amber-200',
  show_advisor: 'border-blue-500/30 bg-blue-500/5 text-blue-200',
  show_trust_signal: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200',
  show_incentive: 'border-purple-500/30 bg-purple-500/5 text-purple-200',
  require_verification: 'border-orange-500/30 bg-orange-500/5 text-orange-200',
  restrict_action: 'border-red-500/30 bg-red-500/5 text-red-200',
};

export default function RealTimeIntervention({ intervention, onDismiss }: Props) {
  return (
    <AnimatePresence>
      {intervention && intervention.action !== 'none' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90vw] rounded-xl border backdrop-blur-md px-4 py-3 shadow-2xl ${STYLE_MAP[intervention.action] || 'border-border bg-background/80 text-foreground'}`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {ICON_MAP[intervention.action]}
            </div>
            <p className="text-sm font-medium leading-snug flex-1">
              {intervention.message}
            </p>
            <button
              onClick={onDismiss}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
