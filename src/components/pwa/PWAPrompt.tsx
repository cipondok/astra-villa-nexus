import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, X, RefreshCw, Smartphone, Zap, WifiOff, HardDrive } from 'lucide-react';
import { usePWAEnhanced } from '@/hooks/usePWAEnhanced';
import { cn } from '@/lib/utils';

interface PWAPromptProps {
  variant?: 'banner' | 'modal' | 'card';
  showAfterDelay?: number; // ms
  className?: string;
}

/**
 * PWA Install Prompt Component
 * Displays install prompt with configurable variants
 */
const PWAPrompt: React.FC<PWAPromptProps> = ({ 
  variant = 'banner',
  showAfterDelay = 5000,
  className 
}) => {
  const { canInstall, isInstalled, updateAvailable, installPWA, reloadForUpdate } = usePWAEnhanced();
  const [dismissed, setDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Delay showing prompt
  useEffect(() => {
    if (canInstall && !dismissed) {
      const timer = setTimeout(() => setShowPrompt(true), showAfterDelay);
      return () => clearTimeout(timer);
    }
  }, [canInstall, dismissed, showAfterDelay]);

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      setShowModal(false);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    setShowModal(false);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Check if previously dismissed
  useEffect(() => {
    const dismissedTime = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedTime) {
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - parseInt(dismissedTime) < sevenDays) {
        setDismissed(true);
      }
    }
  }, []);

  if (isInstalled && !updateAvailable) return null;

  // Update available prompt
  if (updateAvailable) {
    return (
      <div className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm",
        className
      )}>
        <Card className="border-green-500/30 bg-card/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-green-500" />
              Update Available
            </CardTitle>
            <CardDescription className="text-xs">
              New features and improvements are ready
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              size="sm" 
              onClick={reloadForUpdate}
              className="w-full h-8 text-xs bg-green-600 hover:bg-green-700"
            >
              Update Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!showPrompt) return null;

  // Banner variant
  if (variant === 'banner') {
    return (
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 p-4 bg-primary/95 backdrop-blur-sm",
        "border-t border-primary-foreground/10 shadow-lg",
        className
      )}>
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-foreground/10 rounded-lg">
              <Download className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-primary-foreground text-sm">
                Install ASTRA Villa
              </p>
              <p className="text-xs text-primary-foreground/70">
                Get the full experience with offline access
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={handleInstall}
              className="text-xs"
            >
              Install
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={handleDismiss}
              className="h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Card variant
  if (variant === 'card') {
    return (
      <div className={cn(
        "fixed bottom-4 right-4 z-50 max-w-sm",
        className
      )}>
        <Card className="border-primary/20 bg-card/95 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4" />
              Install App
            </CardTitle>
            <CardDescription className="text-xs">
              Add ASTRA Villa to your home screen
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleInstall}
                className="flex-1 h-8 text-xs"
              >
                Install
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleDismiss}
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Modal variant
  return (
    <>
      <div className={cn(
        "fixed bottom-4 right-4 z-50",
        className
      )}>
        <Button 
          onClick={() => setShowModal(true)}
          className="shadow-lg"
        >
          <Download className="h-4 w-4 mr-2" />
          Install App
        </Button>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              Install ASTRA Villa
            </DialogTitle>
            <DialogDescription>
              Get the best experience with our app
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-green-500/10 rounded">
                  <Zap className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Lightning Fast</p>
                  <p className="text-xs text-muted-foreground">
                    Instant loading with cached content
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-blue-500/10 rounded">
                  <WifiOff className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Works Offline</p>
                  <p className="text-xs text-muted-foreground">
                    Browse properties without internet
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-purple-500/10 rounded">
                  <HardDrive className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">Save Your Favorites</p>
                  <p className="text-xs text-muted-foreground">
                    Access saved properties anytime
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="flex-1"
            >
              Not Now
            </Button>
            <Button 
              onClick={handleInstall}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Install
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PWAPrompt;
