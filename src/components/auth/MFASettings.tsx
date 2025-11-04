import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { validateUUIDWithLogging } from '@/utils/uuid-validation-logger';
import {
  Shield,
  Mail,
  Key,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Copy,
  RefreshCw
} from 'lucide-react';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
}

const OTPInput: React.FC<OTPInputProps> = ({ length = 6, onComplete, disabled }) => {
  const [otp, setOtp] = useState(Array(length).fill(''));
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(0, 1);
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(length).fill('')).slice(0, length);
    setOtp(newOtp);
    
    if (pastedData.length === length) {
      onComplete(pastedData);
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {otp.map((digit, index) => (
        <Input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="w-12 h-14 text-center text-2xl font-bold"
        />
      ))}
    </div>
  );
};

const MFASettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEnabling, setIsEnabling] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // Fetch MFA settings
  const { data: mfaSettings, refetch: refetchMFA } = useQuery({
    queryKey: ['mfa-settings', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('mfa_settings' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!user
  });

  // Fetch verification status
  const { data: verification } = useQuery({
    queryKey: ['user-verification', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_verification' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as any;
    },
    enabled: !!user
  });

  const generateOTP = async (purpose: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-otp', {
        body: { purpose }
      });

      if (error) throw error;

      toast({
        title: "OTP Code Sent",
        description: `Check your notifications for the verification code. ${data.dev_code ? `Dev code: ${data.dev_code}` : ''}`,
      });

      setShowOTPInput(true);
    } catch (error) {
      console.error('Error generating OTP:', error);
      toast({
        title: "Failed to Send OTP",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const verifyOTP = async (code: string, purpose: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { code, purpose }
      });

      if (error) throw error;

      toast({
        title: "Verification Successful",
        description: "Your code has been verified successfully",
      });

      setShowOTPInput(false);
      refetchMFA();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : 'Invalid code',
        variant: "destructive",
      });
    }
  };

  const enableMFA = async () => {
    setIsEnabling(true);
    try {
      // Generate backup codes
      const codes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );
      
      setBackupCodes(codes);

      // Enable MFA
      await supabase.from('mfa_settings' as any).upsert({
        user_id: user?.id,
        is_enabled: true,
        method: 'email',
        backup_codes: codes,
        updated_at: new Date().toISOString(),
      });

      toast({
        title: "MFA Enabled",
        description: "Save your backup codes in a secure location",
      });

      refetchMFA();
    } catch (error) {
      console.error('Error enabling MFA:', error);
      toast({
        title: "Failed to Enable MFA",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setIsEnabling(false);
    }
  };

  const disableMFA = async () => {
    if (!user?.id || !validateUUIDWithLogging(user.id, 'MFASettings.disableMFA', {
      operation: 'disable_mfa'
    })) {
      console.error('Invalid user ID for disabling MFA');
      return;
    }

    try {
      await supabase.from('mfa_settings' as any).update({
        is_enabled: false,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);

      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been turned off",
      });

      refetchMFA();
    } catch (error) {
      console.error('Error disabling MFA:', error);
      toast({
        title: "Failed to Disable MFA",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'));
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Email OTP Verification</h4>
              <p className="text-sm text-muted-foreground">
                Receive a 6-digit code via notification
              </p>
            </div>
            <div className="flex items-center gap-3">
              {mfaSettings?.is_enabled && (
                <Badge className="bg-green-500/10 text-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enabled
                </Badge>
              )}
              <Switch
                checked={mfaSettings?.is_enabled || false}
                onCheckedChange={(checked) => {
                  if (checked) {
                    enableMFA();
                  } else {
                    disableMFA();
                  }
                }}
                disabled={isEnabling}
              />
            </div>
          </div>

          {backupCodes.length > 0 && (
            <Alert>
              <Key className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p className="font-semibold">Save Your Backup Codes</p>
                  <p className="text-sm">
                    Store these codes in a safe place. You can use them to access your account if you lose access to your email.
                  </p>
                  <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-1">
                    {backupCodes.map((code, index) => (
                      <div key={index}>{code}</div>
                    ))}
                  </div>
                  <Button onClick={copyBackupCodes} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Codes
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="verification">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="verification">Email Verification</TabsTrigger>
          <TabsTrigger value="test">Test MFA</TabsTrigger>
        </TabsList>

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Verification Status</CardTitle>
              <CardDescription>Verify your email address for enhanced security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{user?.email}</p>
                    <p className="text-sm text-muted-foreground">Primary email</p>
                  </div>
                </div>
                {verification?.email_verified ? (
                  <Badge className="bg-green-500/10 text-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline">Not Verified</Badge>
                )}
              </div>

              {!verification?.email_verified && (
                <div className="space-y-4">
                  {!showOTPInput ? (
                    <Button onClick={() => generateOTP('email_verification')} className="w-full">
                      Send Verification Code
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <Label>Enter Verification Code</Label>
                      <OTPInput onComplete={(code) => verifyOTP(code, 'email_verification')} />
                      <Button
                        variant="outline"
                        onClick={() => generateOTP('email_verification')}
                        className="w-full"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Resend Code
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Test MFA Flow</CardTitle>
              <CardDescription>Test your multi-factor authentication setup</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showOTPInput ? (
                <Button onClick={() => generateOTP('mfa')} className="w-full">
                  Generate Test Code
                </Button>
              ) : (
                <div className="space-y-4">
                  <Label>Enter MFA Code</Label>
                  <OTPInput onComplete={(code) => verifyOTP(code, 'mfa')} />
                  <Button
                    variant="outline"
                    onClick={() => generateOTP('mfa')}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend Code
                  </Button>
                </div>
              )}

              {mfaSettings?.last_verified_at && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Last verified: {new Date(mfaSettings.last_verified_at).toLocaleString()}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MFASettings;
