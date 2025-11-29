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
      <Card className="professional-card border p-2">
        <div className="flex items-center justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary/20 border-t-primary"></div>
          <span className="ml-2 text-xs text-muted-foreground">Loading...</span>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="professional-card border p-2">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
              <Shield className="h-3 w-3 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-semibold">2FA</p>
              <p className="text-[10px] text-muted-foreground">Extra security</p>
            </div>
          </div>
          {settings?.is_enabled ? (
            <Badge className="text-[10px] h-4 px-1.5 bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />On
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              <XCircle className="h-2.5 w-2.5 mr-0.5" />Off
            </Badge>
          )}
        </div>
        
        {settings?.is_enabled ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 p-1.5 rounded-md bg-green-500/5 border border-green-500/20">
              <Lock className="h-3 w-3 text-green-500" />
              <span className="text-[10px] text-green-700 dark:text-green-300">
                Protected via {settings.method === 'both' ? 'SMS + App' : settings.method === 'sms' ? 'SMS' : 'App'}
              </span>
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => setShowSetup(true)} className="flex-1 h-6 text-[10px]">
                Modify
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDisable2FA} disabled={isDisabling} className="flex-1 h-6 text-[10px]">
                {isDisabling ? '...' : 'Disable'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="grid grid-cols-2 gap-1">
              <div className="p-1.5 rounded-md bg-muted/50 border text-center">
                <Key className="h-3.5 w-3.5 mx-auto text-primary" />
                <p className="text-[10px] font-medium">App</p>
              </div>
              <div className="p-1.5 rounded-md bg-muted/50 border text-center">
                <Smartphone className="h-3.5 w-3.5 mx-auto text-primary" />
                <p className="text-[10px] font-medium">SMS</p>
              </div>
            </div>
            <Button onClick={() => setShowSetup(true)} className="w-full h-6 text-[10px]">
              <Shield className="h-3 w-3 mr-1" />Enable 2FA
            </Button>
          </div>
        )}
      </Card>

      <TwoFactorSetupDialog
        open={showSetup}
        onOpenChange={setShowSetup}
        currentSettings={settings}
      />
    </>
  );
};