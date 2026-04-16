import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/i18n/useTranslation';

const DISMISSED_KEY = 'exit-intent-dismissed';
const DISMISS_HOURS = 24;

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const dismiss = useCallback(() => { setShow(false); localStorage.setItem(DISMISSED_KEY, String(Date.now())); }, []);

  useEffect(() => {
    if (user) return;
    const last = Number(localStorage.getItem(DISMISSED_KEY) || 0);
    if (Date.now() - last < DISMISS_HOURS * 60 * 60 * 1000) return;
    if (window.matchMedia('(max-width: 768px)').matches) return;
    let triggered = false;
    const handler = (e: MouseEvent) => {
      if (triggered) return;
      if (e.clientY <= 5 && e.relatedTarget === null) { triggered = true; setTimeout(() => setShow(true), 200); }
    };
    document.addEventListener('mouseout', handler);
    return () => document.removeEventListener('mouseout', handler);
  }, [user]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-background/60 backdrop-blur-sm" onClick={dismiss} />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
            <div className="relative mx-4 rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-primary via-gold-primary to-primary" />
              <button onClick={dismiss} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-muted transition-colors" aria-label={t('common.close')}><X className="h-4 w-4 text-muted-foreground" /></button>
              <div className="p-6 sm:p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4"><Sparkles className="h-6 w-6 text-primary" /></div>
                <h3 className="font-playfair text-xl sm:text-2xl font-bold text-foreground mb-2">{t('homeComponents.waitDontMissOut')}</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">{t('homeComponents.getAIPoweredRecommendations')}</p>
                <div className="space-y-3">
                  <Button className="w-full h-12 text-sm font-semibold gap-2" onClick={() => { dismiss(); navigate('/?auth=true'); }}>
                    <Sparkles className="h-4 w-4" />{t('homeComponents.createFreeAccount')}<ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full h-11 text-sm" onClick={() => { dismiss(); navigate('/properties'); }}>{t('homeComponents.browsePropertiesInstead')}</Button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-4">{t('homeComponents.freeForever')}</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
