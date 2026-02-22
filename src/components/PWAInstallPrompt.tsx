import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { toast } from '@/hooks/use-toast';
import { useBrandingLogo } from '@/hooks/useBrandingLogo';
import astraLogoFallback from '@/assets/astra-villa-logo.png';

const PWAInstallPrompt = () => {
  const { canInstall, isInstalled, isOnline, updateAvailable, installPWA, reloadForUpdate } = usePWA();
  const [dismissed, setDismissed] = useState(false);
  
  // Fetch PWA logo with fallback hierarchy: pwaLogo → headerLogo → fallback
  const { logoUrl: pwaLogo } = useBrandingLogo('pwaLogo', '');
  const { logoUrl: headerLogo } = useBrandingLogo('headerLogo', astraLogoFallback);
  const displayLogo = pwaLogo || headerLogo || astraLogoFallback;

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      toast({
        title: "App Installed!",
        description: "ASTRA Villa has been installed to your device.",
      });
    }
  };

  const handleUpdate = () => {
    reloadForUpdate();
    toast({
      title: "Updating App",
      description: "Applying latest updates...",
    });
  };

  if (isInstalled && !updateAvailable && isOnline) return null;
  if (dismissed && !updateAvailable && isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* PWA Install Prompt */}
      {canInstall && !isInstalled && (
        <Card className="mb-2 border-primary/20 bg-card/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center overflow-hidden border border-primary/20">
                <img 
                  src={displayLogo} 
                  alt="App Logo" 
                  className="w-10 h-10 object-contain"
                  style={{ imageRendering: 'crisp-edges' }}
                />
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" />
                  Install App
                </CardTitle>
                <CardDescription className="text-xs">
                  Install ASTRA Villa for a better experience
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={handleInstall}
                className="flex-1 h-8 text-xs"
              >
                Install Now
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setDismissed(true)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Available Prompt */}
      {updateAvailable && (
        <Card className="mb-2 border-chart-1/20 bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Update Available
            </CardTitle>
            <CardDescription className="text-xs">
              New features and improvements are ready
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button 
              size="sm" 
              onClick={handleUpdate}
              className="w-full h-8 text-xs"
            >
              Update Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <Card className="border-chart-3/20 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-chart-3">
              <WifiOff className="h-4 w-4" />
              <span className="text-xs">You're offline</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PWAInstallPrompt;