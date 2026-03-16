import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DISMISSED_KEY = 'exit-intent-dismissed';
const DISMISS_HOURS = 24;

/**
 * Exit-intent popup — triggers when cursor leaves viewport top on desktop.
 * Shows a conversion CTA to encourage sign-up or property exploration.
 * Suppressed for logged-in users and for 24h after dismissal.
 */
export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const dismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(DISMISSED_KEY, String(Date.now()));
  }, []);

  useEffect(() => {
    // Don't show for logged-in users
    if (user) return;

    // Check cooldown
    const last = Number(localStorage.getItem(DISMISSED_KEY) || 0);
    if (Date.now() - last < DISMISS_HOURS * 60 * 60 * 1000) return;

    // Only on desktop (no mouseleave on mobile)
    if (window.matchMedia('(max-width: 768px)').matches) return;

    let triggered = false;
    const handler = (e: MouseEvent) => {
      if (triggered) return;
      if (e.clientY <= 5 && e.relatedTarget === null) {
        triggered = true;
        // Small delay so it doesn't feel jarring
        setTimeout(() => setShow(true), 200);
      }
    };

    document.addEventListener('mouseout', handler);
    return () => document.removeEventListener('mouseout', handler);
  }, [user]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm"
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
          >
            <div className="relative mx-4 rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
              {/* Gradient accent */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-gold-primary to-primary" />

              {/* Close */}
              <button
                onClick={dismiss}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="p-6 sm:p-8 text-center">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>

                <h3 className="font-playfair text-xl sm:text-2xl font-bold text-foreground mb-2">
                  Wait — Don't Miss Out!
                </h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                  Get AI-powered property recommendations and price alerts delivered to your inbox.
                </p>

                <div className="space-y-3">
                  <Button
                    className="w-full h-12 text-sm font-semibold gap-2"
                    onClick={() => { dismiss(); navigate('/?auth=true'); }}
                  >
                    <Sparkles className="h-4 w-4" />
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-11 text-sm"
                    onClick={() => { dismiss(); navigate('/properties'); }}
                  >
                    Browse Properties Instead
                  </Button>
                </div>

                <p className="text-[10px] text-muted-foreground mt-4">
                  Free forever • No credit card required
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
