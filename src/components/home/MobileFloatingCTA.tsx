import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { haptic } from '@/utils/haptics';

/**
 * Floating mobile CTA bar — appears after scrolling past hero.
 * Features:
 * - Spring entrance animation
 * - Auto-hides when scrolling up (reading mode)
 * - Re-shows when scrolling down (action mode)
 * - Safe area compliance
 * - Haptic feedback on tap
 */
export default function MobileFloatingCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const navigate = useNavigate();
  const lastY = useRef(0);
  const scrollDir = useRef<'up' | 'down'>('down');

  useEffect(() => {
    if (dismissed) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        scrollDir.current = y > lastY.current ? 'down' : 'up';
        lastY.current = y;

        if (y > 500 && scrollDir.current === 'down') {
          if (!visible) {
            setShouldRender(true);
            // Small delay so DOM mounts before animation class applies
            requestAnimationFrame(() => setVisible(true));
          }
        } else if (y < 200 || scrollDir.current === 'up') {
          if (visible) {
            setVisible(false);
            // Wait for exit animation
            setTimeout(() => setShouldRender(false), 260);
          }
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [dismissed, visible]);

  if (dismissed || !shouldRender) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-3 right-3 z-40 md:hidden",
        "flex items-center gap-2 p-2 rounded-2xl",
        "bg-card/95 backdrop-blur-md border border-border/60 shadow-lg",
        visible ? "float-bar-enter" : "float-bar-exit"
      )}
      style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
    >
      <Button
        size="sm"
        className="flex-1 h-11 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 min-h-[44px] rounded-xl touch-press"
        onClick={() => {
          haptic('light');
          navigate('/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <Search className="h-3.5 w-3.5" />
        Explore Listings
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="flex-1 h-11 text-xs font-semibold gap-1.5 min-h-[44px] rounded-xl border-primary/30 text-primary touch-press"
        onClick={() => {
          haptic('light');
          navigate('/post-property');
        }}
      >
        <Plus className="h-3.5 w-3.5" />
        List Property
      </Button>

      <button
        onClick={() => {
          haptic('selection');
          setDismissed(true);
        }}
        className="h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 touch-press min-h-[44px] min-w-[44px]"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
