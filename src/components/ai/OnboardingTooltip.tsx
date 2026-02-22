import { useState, useEffect } from 'react';
import { X, Sparkles, Keyboard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OnboardingTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the onboarding
    const hasSeenOnboarding = localStorage.getItem('debug-panel-onboarding-seen');
    
    if (!hasSeenOnboarding && process.env.NODE_ENV === 'development') {
      // Show tooltip after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        console.log('👋 Welcome! Showing debug panel onboarding');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('debug-panel-onboarding-seen', 'true');
    console.log('✅ Onboarding dismissed - won\'t show again');
  };

  const handleTryIt = () => {
    handleDismiss();
    // Trigger the debug panel to open
    const event = new KeyboardEvent('keydown', { key: 'd', metaKey: true });
    window.dispatchEvent(event);
  };

  // Only show in development
  if (!isVisible || process.env.NODE_ENV !== 'development') return null;

  return (
    <div
      className={cn(
        "fixed bottom-32 left-4 z-[10004] w-80",
        "animate-in slide-in-from-left-5 fade-in duration-500"
      )}
    >
      <div className="bg-gradient-to-br from-primary to-accent rounded-lg shadow-2xl p-1">
        <div className="bg-popover rounded-lg p-4 text-popover-foreground">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold-primary" />
              <h3 className="font-bold text-sm">Developer Tools Available!</h3>
            </div>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground -mt-1 -mr-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-3 text-xs">
            <p className="text-muted-foreground">
              🎉 New debugging tools are available to help you test animations!
            </p>

            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-foreground/80">
                <Settings className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <span className="font-semibold">Debug Panel:</span> Control animations
                  without changing OS settings
                </div>
              </div>

              <div className="flex items-start gap-2 text-foreground/80">
                <Keyboard className="h-4 w-4 mt-0.5 text-accent-foreground flex-shrink-0" />
                <div>
                  <span className="font-semibold">Keyboard Shortcuts:</span> Fast access
                  to all features
                </div>
              </div>
            </div>

            {/* Quick shortcuts */}
            <div className="bg-muted rounded p-2 space-y-1">
              <p className="font-semibold text-[10px] text-muted-foreground uppercase">
                Quick Shortcuts:
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Toggle panel</span>
                  <kbd className="px-2 py-0.5 bg-background rounded text-[10px] font-mono">
                    ⌘/Ctrl + D
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">Toggle animations</span>
                  <kbd className="px-2 py-0.5 bg-background rounded text-[10px] font-mono">
                    ⌘/Ctrl + A
                  </kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foreground/70">View all shortcuts</span>
                  <kbd className="px-2 py-0.5 bg-background rounded text-[10px] font-mono">
                    ?
                  </kbd>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleTryIt}
                className="flex-1 h-8 text-xs bg-primary hover:bg-primary/90"
              >
                Try It Now
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                className="flex-1 h-8 text-xs border-border hover:bg-muted"
              >
                Got It
              </Button>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-[10px] text-muted-foreground">
              💡 This tooltip won't show again. Press <kbd className="px-1 bg-muted rounded">?</kbd> anytime for help.
            </p>
          </div>
        </div>
      </div>

      {/* Arrow pointer */}
      <div className="absolute -bottom-2 left-8 w-4 h-4 bg-popover transform rotate-45" />
    </div>
  );
};

export default OnboardingTooltip;
