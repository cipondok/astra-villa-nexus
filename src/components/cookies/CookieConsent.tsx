import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Cookie, Shield, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CookieConsentProps {
  onAccept: () => void;
  onReject: () => void;
  show: boolean;
}

const CookieConsent = ({ onAccept, onReject, show }: CookieConsentProps) => {
  const [showCustomize, setShowCustomize] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: true,
  });

  // Auto-close after 5 seconds if no interaction
  useEffect(() => {
    if (!show || showCustomize) return;
    
    const timer = setTimeout(() => {
      handleAcceptAll();
    }, 5000);

    return () => clearTimeout(timer);
  }, [show, showCustomize]);

  const handleAcceptAll = () => {
    setIsClosing(true);
    setTimeout(() => {
      onAccept();
      setIsClosing(false);
    }, 300);
  };

  const handleReject = () => {
    setIsClosing(true);
    setTimeout(() => {
      onReject();
      setIsClosing(false);
    }, 300);
  };

  const handleSavePreferences = () => {
    setIsClosing(true);
    setTimeout(() => {
      onAccept();
      setShowCustomize(false);
      setIsClosing(false);
    }, 300);
  };

  if (!show) return null;

  return (
    <>
      {/* Overlay - 60% transparent, click to accept */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/60 z-40 transition-opacity duration-300",
          show && !isClosing ? "opacity-100" : "opacity-0 pointer-events-none"
        )} 
        onClick={handleAcceptAll}
      />

      {/* Cookie Banner - Compact for mobile */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-2 md:p-3 transition-all duration-300 ease-out",
        show && !isClosing ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}>
        <div className="max-w-sm mx-auto">
          <div className="rounded-lg border border-border/50 shadow-xl overflow-hidden bg-background/95 backdrop-blur-sm">
            <div className="p-3">
              {!showCustomize ? (
                // Main Cookie Banner - Compact
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Cookie className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xs font-semibold text-foreground">
                        Cookie Notice
                      </h3>
                      <p className="text-[10px] text-muted-foreground leading-tight">
                        We use cookies to enhance your experience.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleReject}
                      className="h-6 w-6 hover:bg-muted"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="flex gap-1.5">
                    <Button
                      onClick={() => setShowCustomize(true)}
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-[10px] gap-1 border-border/50"
                    >
                      <Settings className="w-2.5 h-2.5" />
                      Settings
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      size="sm"
                      className="flex-1 h-7 text-[10px] gap-1 bg-primary hover:bg-primary/90"
                    >
                      <Shield className="w-2.5 h-2.5" />
                      Accept
                    </Button>
                  </div>
                </div>
              ) : (
                // Customize Preferences - Compact
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-foreground">
                      Cookie Settings
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCustomize(false)}
                      className="h-6 w-6 hover:bg-muted"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    {/* Necessary Cookies */}
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/30">
                      <input
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled
                        className="w-3 h-3 rounded accent-primary"
                      />
                      <div className="flex-grow">
                        <span className="text-[10px] font-medium text-foreground">Necessary</span>
                        <span className="text-[9px] text-muted-foreground ml-1">(Required)</span>
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/30">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="w-3 h-3 rounded accent-primary cursor-pointer"
                      />
                      <span className="text-[10px] font-medium text-foreground">Analytics</span>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-center gap-2 p-2 rounded bg-muted/30 border border-border/30">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="w-3 h-3 rounded accent-primary cursor-pointer"
                      />
                      <span className="text-[10px] font-medium text-foreground">Marketing</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 pt-1">
                    <Button
                      onClick={handleReject}
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-[10px] border-border/50"
                    >
                      Reject All
                    </Button>
                    <Button
                      onClick={handleSavePreferences}
                      size="sm"
                      className="flex-1 h-7 text-[10px] bg-primary hover:bg-primary/90"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;