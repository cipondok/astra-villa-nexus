import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Smartphone, Key, CheckCircle2, XCircle, Lock } from 'lucide-react';
import { use2FA } from '@/hooks/use2FA';
import { TwoFactorSetupDialog } from './TwoFactorSetupDialog';

export const TwoFactorAuth = () => {
  const { settings, loading, disable2FA } = use2FA();
  const [showSetup, setShowSetup] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const handleDisable2FA = async () => {
    setIsDisabling(true);
    await disable2FA();
    setIsDisabling(false);
  };

  if (loading) {
    return (
      <Card className="professional-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/20 border-t-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="professional-card border">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
        <CardHeader className="pb-3 px-4 pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
                <CardDescription className="text-xs">Add an extra layer of security</CardDescription>
              </div>
            </div>
            {settings?.is_enabled ? (
              <Badge variant="default" className="bg-green-500 text-white gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Enabled
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <XCircle className="h-3 w-3" />
                Disabled
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="px-4 pb-3 space-y-3">
          {settings?.is_enabled ? (
            <>
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Lock className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-green-900 dark:text-green-100 mb-1">
                      Protection Active
                    </h3>
                    <p className="text-xs text-green-700 dark:text-green-300 mb-2">
                      Your account is protected with {settings.method === 'both' ? 'SMS and authenticator app' : settings.method === 'sms' ? 'SMS codes' : 'authenticator app'} verification.
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(settings.method === 'totp' || settings.method === 'both') && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Key className="h-3 w-3" />
                          Authenticator App
                        </Badge>
                      )}
                      {(settings.method === 'sms' || settings.method === 'both') && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Smartphone className="h-3 w-3" />
                          SMS: {settings.phone_number}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSetup(true)}
                  className="flex-1 h-8 text-xs"
                >
                  Modify Settings
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDisable2FA}
                  disabled={isDisabling}
                  className="flex-1 h-8 text-xs"
                >
                  {isDisabling ? 'Disabling...' : 'Disable 2FA'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs text-muted-foreground mb-3">
                  Protect your account with an additional security layer. Choose between SMS codes or authenticator apps.
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-background border text-center">
                    <Key className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs font-semibold">Authenticator</p>
                    <p className="text-[10px] text-muted-foreground">Google, Authy</p>
                  </div>
                  <div className="p-2 rounded-lg bg-background border text-center">
                    <Smartphone className="h-5 w-5 mx-auto mb-1 text-primary" />
                    <p className="text-xs font-semibold">SMS</p>
                    <p className="text-[10px] text-muted-foreground">Text message</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowSetup(true)}
                className="w-full h-8 text-xs gap-1.5"
              >
                <Shield className="h-3.5 w-3.5" />
                Enable Two-Factor Authentication
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <TwoFactorSetupDialog
        open={showSetup}
        onOpenChange={setShowSetup}
        currentSettings={settings}
      />
    </>
  );
};