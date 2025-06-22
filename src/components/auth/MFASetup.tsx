
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Shield, Clock, QrCode } from "lucide-react";

interface MFASetupProps {
  onComplete: () => void;
}

export const MFASetup = ({ onComplete }: MFASetupProps) => {
  const [mfaMethod, setMfaMethod] = useState<"sms" | "app" | "backup">("app");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [step, setStep] = useState<"setup" | "verify" | "backup">("setup");
  const [timeLeft, setTimeLeft] = useState(30);
  const [isLoading, setIsLoading] = useState(false);

  // Generate QR code for authenticator app
  useEffect(() => {
    if (mfaMethod === "app") {
      const secret = generateSecret();
      const qrData = `otpauth://totp/AstraVilla:user@example.com?secret=${secret}&issuer=AstraVilla`;
      setQrCode(qrData);
    }
  }, [mfaMethod]);

  // Countdown timer for SMS verification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "verify" && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timeLeft]);

  const generateSecret = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    return codes;
  };

  const handleSendSMS = async () => {
    setIsLoading(true);
    try {
      // Simulate SMS sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep("verify");
      setTimeLeft(30);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      const codes = generateBackupCodes();
      setBackupCodes(codes);
      setStep("backup");
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    // Store MFA preference
    localStorage.setItem('mfa_enabled', 'true');
    localStorage.setItem('mfa_method', mfaMethod);
    onComplete();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-2" />
        <h3 className="text-lg font-semibold">Multi-Factor Authentication</h3>
        <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
      </div>

      {step === "setup" && (
        <Tabs value={mfaMethod} onValueChange={(value) => setMfaMethod(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="app" className="text-xs">
              <QrCode className="h-4 w-4 mr-1" />
              App
            </TabsTrigger>
            <TabsTrigger value="sms" className="text-xs">
              <Smartphone className="h-4 w-4 mr-1" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="backup" className="text-xs">
              <Shield className="h-4 w-4 mr-1" />
              Backup
            </TabsTrigger>
          </TabsList>

          <TabsContent value="app" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Authenticator App</CardTitle>
                <CardDescription className="text-xs">
                  Use Google Authenticator, Microsoft Authenticator, or similar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-gray-200 flex items-center justify-center rounded">
                    <QrCode className="h-16 w-16 text-gray-400" />
                    {/* In real implementation, generate actual QR code */}
                  </div>
                </div>
                <p className="text-xs text-center text-gray-600">
                  Scan this QR code with your authenticator app
                </p>
                <Button onClick={() => setStep("verify")} className="w-full">
                  I've Added the Account
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">SMS Verification</CardTitle>
                <CardDescription className="text-xs">
                  Receive codes via text message
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <Button 
                  onClick={handleSendSMS} 
                  className="w-full"
                  disabled={!phoneNumber || isLoading}
                >
                  {isLoading ? "Sending..." : "Send Verification Code"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Backup codes can be used when your primary MFA method is unavailable.
                Store them securely!
              </AlertDescription>
            </Alert>
            <Button onClick={() => setStep("backup")} className="w-full">
              Generate Backup Codes
            </Button>
          </TabsContent>
        </Tabs>
      )}

      {step === "verify" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Enter Verification Code
            </CardTitle>
            <CardDescription className="text-xs">
              {mfaMethod === "sms" 
                ? `Code sent to ${phoneNumber}` 
                : "Enter the 6-digit code from your authenticator app"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-wider"
              />
            </div>
            
            {mfaMethod === "sms" && (
              <div className="text-center">
                <p className="text-xs text-gray-600">
                  Resend code in {timeLeft}s
                </p>
              </div>
            )}
            
            <Button 
              onClick={handleVerifyCode} 
              className="w-full"
              disabled={verificationCode.length !== 6 || isLoading}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "backup" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Backup Codes</CardTitle>
            <CardDescription className="text-xs">
              Save these codes in a secure location. Each can only be used once.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 rounded">
              {backupCodes.map((code, index) => (
                <div key={index} className="text-xs font-mono text-center p-2 bg-white rounded">
                  {code}
                </div>
              ))}
            </div>
            
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Store these codes securely! You'll need them if you lose access to your primary MFA method.
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleComplete} className="w-full">
              I've Saved My Backup Codes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
