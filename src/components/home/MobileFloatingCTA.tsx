import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Floating mobile CTA bar — appears after scrolling past hero.
 * Two primary actions: Explore Listings + List Property
 * Auto-hides when scrolling up rapidly (reading mode).
 */
export default function MobileFloatingCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let lastY = 0;
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        // Show after scrolling past hero (~500px)
        if (y > 500 && y > lastY) {
          setVisible(true);
        } else if (y < 200) {
          setVisible(false);
        }
        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (dismissed || !visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-20 left-3 right-3 z-40 md:hidden",
        "flex items-center gap-2 p-2 rounded-2xl",
        "bg-card/95 backdrop-blur-md border border-border/60 shadow-lg",
        "animate-fade-in"
      )}
    >
      <Button
        size="sm"
        className="flex-1 h-11 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 min-h-[44px] rounded-xl"
        onClick={() => {
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
        className="flex-1 h-11 text-xs font-semibold gap-1.5 min-h-[44px] rounded-xl border-primary/30 text-primary"
        onClick={() => navigate('/post-property')}
      >
        <Plus className="h-3.5 w-3.5" />
        List Property
      </Button>

      <button
        onClick={() => setDismissed(true)}
        className="h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
