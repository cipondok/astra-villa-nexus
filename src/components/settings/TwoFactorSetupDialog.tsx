import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Key, Smartphone, Copy, CheckCircle } from 'lucide-react';
import { use2FA, TwoFASettings } from '@/hooks/use2FA';
import { useToast } from '@/hooks/use-toast';

interface TwoFactorSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSettings: TwoFASettings | null;
}

export const TwoFactorSetupDialog = ({ open, onOpenChange, currentSettings }: TwoFactorSetupDialogProps) => {
  const { enable2FA } = use2FA();
  const { toast } = useToast();
  const [method, setMethod] = useState<'totp' | 'sms'>('totp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'method' | 'setup' | 'verify'>('method');
  const [secretKey, setSecretKey] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const generateTOTPSecret = () => {
    // In production, this should be done on the backend
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  const handleMethodSelect = (selectedMethod: 'totp' | 'sms') => {
    setMethod(selectedMethod);
    if (selectedMethod === 'totp') {
      const secret = generateTOTPSecret();
      setSecretKey(secret);
      // Generate QR code URL for authenticator apps
      const appName = 'YourApp';
      const userEmail = 'user@example.com'; // Should come from auth context
      setQrCodeUrl(`otpauth://totp/${appName}:${userEmail}?secret=${secret}&issuer=${appName}`);
    }
    setStep('setup');
  };

  const handleSetupComplete = async () => {
    setIsSubmitting(true);
    try {
      const codes = generateBackupCodes();
      setBackupCodes(codes);

      const result = await enable2FA(method, {
        totp_secret: method === 'totp' ? secretKey : undefined,
        phone_number: method === 'sms' ? phoneNumber : undefined,
        backup_codes: codes,
      });

      if (result.success) {
        setStep('verify');
      }
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setStep('method');
    setPhoneNumber('');
    setVerificationCode('');
    setSecretKey('');
    setQrCodeUrl('');
    setBackupCodes([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Setup Two-Factor Authentication</DialogTitle>
          <DialogDescription className="text-xs">
            {step === 'method' && 'Choose your preferred authentication method'}
            {step === 'setup' && 'Follow the instructions to complete setup'}
            {step === 'verify' && 'Save your backup codes in a secure location'}
          </DialogDescription>
        </DialogHeader>

        {step === 'method' && (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-auto p-4 justify-start"
              onClick={() => handleMethodSelect('totp')}
            >
              <Key className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <div className="font-semibold text-sm">Authenticator App</div>
                <div className="text-xs text-muted-foreground">Use Google Authenticator, Authy, or similar</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto p-4 justify-start"
              onClick={() => handleMethodSelect('sms')}
            >
              <Smartphone className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <div className="font-semibold text-sm">SMS Text Message</div>
                <div className="text-xs text-muted-foreground">Receive codes via text message</div>
              </div>
            </Button>
          </div>
        )}

        {step === 'setup' && method === 'totp' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 border text-center">
              <div className="w-48 h-48 mx-auto mb-3 bg-white rounded-lg flex items-center justify-center">
                {/* In production, generate actual QR code */}
                <div className="text-xs text-muted-foreground">QR Code Here</div>
              </div>
              <p className="text-xs text-muted-foreground mb-2">Scan with your authenticator app</p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">Or enter this key manually:</Label>
              <div className="flex gap-2">
                <Input
                  value={secretKey}
                  readOnly
                  className="text-xs font-mono h-8"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(secretKey)}
                  className="h-8 w-8 p-0"
                >
                  {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code" className="text-xs">Enter verification code</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg font-mono h-10"
              />
            </div>

            <Button
              onClick={handleSetupComplete}
              disabled={isSubmitting || verificationCode.length !== 6}
              className="w-full h-9"
            >
              {isSubmitting ? 'Verifying...' : 'Verify & Enable'}
            </Button>
          </div>
        )}

        {step === 'setup' && method === 'sms' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="h-9"
              />
              <p className="text-xs text-muted-foreground">
                Standard SMS rates may apply
              </p>
            </div>

            <Button
              onClick={handleSetupComplete}
              disabled={isSubmitting || !phoneNumber}
              className="w-full h-9"
            >
              {isSubmitting ? 'Sending Code...' : 'Send Verification Code'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-500/20">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                <h3 className="font-bold text-sm text-green-900 dark:text-green-100">
                  2FA Enabled Successfully!
                </h3>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300">
                Save these backup codes in a secure location. You can use them if you lose access to your authentication method.
              </p>
            </div>

            <Card className="p-3 bg-muted/50">
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="p-2 rounded bg-background border text-center font-mono text-xs"
                  >
                    {code}
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="flex-1 h-9 text-xs"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copy Codes
              </Button>
              <Button
                onClick={handleClose}
                className="flex-1 h-9 text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};