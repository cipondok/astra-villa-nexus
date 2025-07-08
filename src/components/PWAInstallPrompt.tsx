import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { toast } from '@/hooks/use-toast';

const PWAInstallPrompt = () => {
  const { canInstall, isInstalled, isOnline, updateAvailable, installPWA, reloadForUpdate } = usePWA();

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

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      {/* PWA Install Prompt */}
      {canInstall && !isInstalled && (
        <Card className="mb-2 border-primary/20 bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Download className="h-4 w-4" />
              Install App
            </CardTitle>
            <CardDescription className="text-xs">
              Install ASTRA Villa for a better experience
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
                className="h-8 w-8 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Update Available Prompt */}
      {updateAvailable && (
        <Card className="mb-2 border-green-500/20 bg-card/95 backdrop-blur-sm">
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
        <Card className="border-yellow-500/20 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-yellow-600">
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