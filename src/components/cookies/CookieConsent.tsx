import { useState } from 'react';
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
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: true,
  });

  const handleAcceptAll = () => {
    onAccept();
  };

  const handleSavePreferences = () => {
    onAccept();
    setShowCustomize(false);
  };

  if (!show) return null;

  return (
    <>
      {/* Overlay */}
      <div className={cn(
        "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500",
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      )} />

      {/* Cookie Banner */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 transition-all duration-700 ease-out",
        show ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}>
        <div className="max-w-6xl mx-auto">
          <div className="glass-effect rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8">
              {!showCustomize ? (
                // Main Cookie Banner
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
                      <Cookie className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                  
                  <div className="flex-grow space-y-3">
                    <h3 className="text-xl md:text-2xl font-bold text-foreground">
                      Welcome to ASTRA Villa
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                      We use cookies to enhance your luxury browsing experience, analyze site traffic, 
                      and personalize your villa recommendations. By accepting, you agree to our use of cookies.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <Button
                      onClick={() => setShowCustomize(true)}
                      variant="outline"
                      className="gap-2 border-primary/30 hover:border-primary/50 hover:bg-primary/5"
                    >
                      <Settings className="w-4 h-4" />
                      Customize
                    </Button>
                    <Button
                      onClick={handleAcceptAll}
                      className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Shield className="w-4 h-4" />
                      Accept All
                    </Button>
                  </div>
                </div>
              ) : (
                // Customize Preferences
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl md:text-2xl font-bold text-foreground">
                      Cookie Preferences
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowCustomize(false)}
                      className="hover:bg-white/10"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Necessary Cookies */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                      <input
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled
                        className="mt-1 w-5 h-5 rounded border-border accent-primary"
                      />
                      <div className="flex-grow">
                        <h4 className="font-semibold text-foreground mb-1">Necessary Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          Essential for the website to function properly. Cannot be disabled.
                        </p>
                      </div>
                    </div>

                    {/* Analytics Cookies */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                        className="mt-1 w-5 h-5 rounded border-border accent-primary cursor-pointer"
                      />
                      <div className="flex-grow">
                        <h4 className="font-semibold text-foreground mb-1">Analytics Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          Help us understand how you use our site to improve your experience.
                        </p>
                      </div>
                    </div>

                    {/* Marketing Cookies */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                        className="mt-1 w-5 h-5 rounded border-border accent-primary cursor-pointer"
                      />
                      <div className="flex-grow">
                        <h4 className="font-semibold text-foreground mb-1">Marketing Cookies</h4>
                        <p className="text-sm text-muted-foreground">
                          Allow us to show you personalized villa recommendations and exclusive offers.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      onClick={onReject}
                      variant="outline"
                      className="flex-1 border-primary/30"
                    >
                      Reject All
                    </Button>
                    <Button
                      onClick={handleSavePreferences}
                      className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      Save Preferences
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
