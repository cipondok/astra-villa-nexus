
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Clock, Shield, CheckCircle } from "lucide-react";

interface PasswordResetFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

export const PasswordResetFlow = ({ onComplete, onBack }: PasswordResetFlowProps) => {
  const [step, setStep] = useState<"email" | "captcha" | "code" | "newPassword">("email");
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // AI-powered CAPTCHA challenge
  const captchaQuestion = "Select the image that shows a villa or luxury home";
  const captchaImages = [
    { id: 1, url: "/api/placeholder/100/100", isVilla: true },
    { id: 2, url: "/api/placeholder/100/100", isVilla: false },
    { id: 3, url: "/api/placeholder/100/100", isVilla: true },
    { id: 4, url: "/api/placeholder/100/100", isVilla: false },
  ];

  const handleSendResetEmail = async () => {
    setIsLoading(true);
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStep("captcha");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaSubmit = async () => {
    if (captchaAnswer.includes("1") || captchaAnswer.includes("3")) {
      setStep("code");
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      alert("Please select the correct images showing villas");
    }
  };

  const handleVerifyCode = async () => {
    setIsLoading(true);
    try {
      // Simulate code verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep("newPassword");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    try {
      // Simulate password reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      onComplete();
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {step === "email" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Reset Password
            </CardTitle>
            <CardDescription>
              Enter your email address to receive a password reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email Address</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack} className="flex-1">
                Back to Login
              </Button>
              <Button 
                onClick={handleSendResetEmail} 
                disabled={!email || isLoading}
                className="flex-1"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "captcha" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Verification
            </CardTitle>
            <CardDescription>
              {captchaQuestion}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {captchaImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                    captchaAnswer.includes(image.id.toString()) 
                      ? 'border-blue-500 ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    if (captchaAnswer.includes(image.id.toString())) {
                      setCaptchaAnswer(prev => prev.replace(image.id.toString(), ''));
                    } else {
                      setCaptchaAnswer(prev => prev + image.id.toString());
                    }
                  }}
                >
                  <img 
                    src={image.url} 
                    alt={`Option ${image.id}`}
                    className="w-full h-24 object-cover"
                  />
                  {captchaAnswer.includes(image.id.toString()) && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-blue-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <Button 
              onClick={handleCaptchaSubmit} 
              disabled={!captchaAnswer}
              className="w-full"
            >
              Verify Selection
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "code" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Enter Reset Code
            </CardTitle>
            <CardDescription>
              Check your email for the 6-digit verification code
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeLeft > 0 ? (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  This code expires in {formatTime(timeLeft)}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  Code has expired. Please request a new reset link.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="reset-code">Verification Code</Label>
              <Input
                id="reset-code"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-wider"
              />
            </div>
            
            <Button 
              onClick={handleVerifyCode} 
              disabled={resetCode.length !== 6 || timeLeft === 0 || isLoading}
              className="w-full"
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "newPassword" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Set New Password
            </CardTitle>
            <CardDescription>
              Choose a strong password for your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            
            <Button 
              onClick={handlePasswordReset} 
              disabled={!newPassword || !confirmPassword || isLoading}
              className="w-full"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
