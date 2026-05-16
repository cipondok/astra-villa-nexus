import { Button } from '@/components/ui/button';
import { Download, X, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

/**
 * Smart install prompt that appears after the user has scrolled/engaged,
 * with a dismissable banner at the bottom of the viewport.
 */
export default function PWAInstallPrompt() {
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // Delay showing to avoid interrupting first-visit flow
  useEffect(() => {
    if (!canInstall || dismissed) return;

    // Only show after 30s of engagement or 3 scroll events
    let scrollCount = 0;
    const onScroll = () => {
      scrollCount++;
      if (scrollCount >= 3) {
        setShowPrompt(true);
        window.removeEventListener('scroll', onScroll);
      }
    };

    const timer = setTimeout(() => setShowPrompt(true), 30000);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [canInstall, dismissed]);

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) {
      setJustInstalled(true);
      setTimeout(() => setShowPrompt(false), 3000);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    // Remember dismissal for this session
    try { sessionStorage.setItem('pwa-prompt-dismissed', '1'); } catch {}
  };

  // Check session dismissal
  useEffect(() => {
    try {
      if (sessionStorage.getItem('pwa-prompt-dismissed')) setDismissed(true);
    } catch {}
  }, []);

  if (isInstalled || !showPrompt || dismissed) return null;

  return (
    <div className={cn(
      "fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-50",
      "bg-card border border-border/60 rounded-2xl shadow-lg p-4",
      "animate-fade-in"
    )}>
      {justInstalled ? (
        <div className="flex items-center gap-3 text-sm">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Check className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">App Installed!</p>
            <p className="text-xs text-muted-foreground">Open from your home screen anytime</p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Smartphone className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Install ASTRA Villa</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Get faster access, offline browsing, and push notifications
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 -mt-0.5"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              className="flex-1 h-10 text-xs font-semibold gap-1.5 min-h-[40px]"
              onClick={handleInstall}
            >
              <Download className="h-3.5 w-3.5" />
              Install App
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-10 px-3 text-xs text-muted-foreground min-h-[40px]"
              onClick={handleDismiss}
            >
              Not now
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
