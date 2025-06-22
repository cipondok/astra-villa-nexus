import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { BiometricAuth } from "./BiometricAuth";
import { MFASetup } from "./MFASetup";
import { RiskAssessment } from "./RiskAssessment";
import { EnhancedPasswordStrengthMeter } from "./EnhancedPasswordStrengthMeter";
import { Key, Lock, Unlock, AlertTriangle } from 'lucide-react';

interface EnhancedSecureAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
  language: "en" | "id";
}

export const EnhancedSecureAuthModal: React.FC<EnhancedSecureAuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  language
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isMFAVerified, setIsMFAVerified] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const text = {
    en: {
      signIn: "Sign In",
      signUp: "Sign Up",
      email: "Email",
      password: "Password",
      fullName: "Full Name",
      genericError: "An unexpected error occurred. Please try again.",
      weakPassword: "Weak Password",
      mfaVerification: "MFA Verification",
      mfaDescription: "Enter the verification code sent to your device.",
      verifyCode: "Verify Code",
      verifying: "Verifying...",
      createAccount: "Create Account",
      creatingAccount: "Creating Account...",
      signingIn: "Signing In...",
      biometricAuth: "Biometric Authentication",
      riskAssessment: "Risk Assessment",
      lowRisk: "Low Risk",
      mediumRisk: "Medium Risk",
      highRisk: "High Risk",
      enterEmail: "Enter your email",
      enterPassword: "Enter your password",
      enterFullName: "Enter your full name",
      createPassword: "Create a password (min 8 characters)",
      newAccountsApproved: "New accounts are automatically approved and ready to use",
      additionalSecurity: "Additional Security Required",
      unusualActivity: "We've detected unusual activity. Please verify your identity with additional authentication.",
      smsVerification: "SMS Verification",
      verificationCodeSent: "We've sent a verification code to your registered phone number.",
      verificationCode: "Verification Code",
      skipForNow: "Skip for now (not recommended)",
      useFingerprint: "Use Fingerprint/Face ID",
      authenticating: "Authenticating...",
      orUseBiometric: "Or use biometric",
      welcomeTo: "Welcome to AstraVilla",
      signInToAccount: "Sign in to your account",
      createAccountToStart: "Create a new account to get started"
    },
    id: {
      signIn: "Masuk",
      signUp: "Daftar",
      email: "Email",
      password: "Kata Sandi",
      fullName: "Nama Lengkap",
      genericError: "Terjadi kesalahan tak terduga. Silakan coba lagi.",
      weakPassword: "Kata Sandi Lemah",
      mfaVerification: "Verifikasi MFA",
      mfaDescription: "Masukkan kode verifikasi yang dikirim ke perangkat Anda.",
      verifyCode: "Verifikasi Kode",
      verifying: "Memverifikasi...",
      createAccount: "Buat Akun",
      creatingAccount: "Membuat Akun...",
      signingIn: "Masuk...",
      biometricAuth: "Autentikasi Biometrik",
      riskAssessment: "Penilaian Risiko",
      lowRisk: "Risiko Rendah",
      mediumRisk: "Risiko Sedang",
      highRisk: "Risiko Tinggi",
      enterEmail: "Masukkan email Anda",
      enterPassword: "Masukkan kata sandi Anda",
      enterFullName: "Masukkan nama lengkap Anda",
      createPassword: "Buat kata sandi (min 8 karakter)",
      newAccountsApproved: "Akun baru secara otomatis disetujui dan siap digunakan",
      additionalSecurity: "Keamanan Tambahan Diperlukan",
      unusualActivity: "Kami mendeteksi aktivitas yang tidak biasa. Harap verifikasi identitas Anda dengan autentikasi tambahan.",
      smsVerification: "Verifikasi SMS",
      verificationCodeSent: "Kami telah mengirimkan kode verifikasi ke nomor telepon terdaftar Anda.",
      verificationCode: "Kode Verifikasi",
      skipForNow: "Lewati sekarang (tidak disarankan)",
      useFingerprint: "Gunakan Sidik Jari/Face ID",
      authenticating: "Mengautentikasi...",
      orUseBiometric: "Atau gunakan biometrik",
      welcomeTo: "Selamat datang di AstraVilla",
      signInToAccount: "Masuk ke akun Anda",
      createAccountToStart: "Buat akun baru untuk memulai"
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    setError("");
    setIsLoading(true);
    setProgress(10);

    try {
      if (!email || !password) {
        throw new Error("Email and password are required.");
      }

      if (!isLogin && !fullName) {
        throw new Error("Full name is required for registration.");
      }

      if (!isLogin && passwordStrength < 3) {
        setRiskFactors([text[language].weakPassword]);
        throw new Error(text[language].weakPassword);
      }

      if (isLogin) {
        console.log('🔐 Attempting login for:', email);
        setProgress(30);
        
        const result = await signIn(email, password);
        setProgress(70);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        console.log('✅ Login successful');
        setProgress(100);
        
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          onClose();
        }
        
        setEmail("");
        setPassword("");
        setFullName("");
        setProgress(0);
      } else {
        setProgress(30);
        console.log('Attempting sign up for:', email);
        
        const result = await signUp(email, password, fullName);
        setProgress(70);

        if (result.error) {
          throw new Error(result.error);
        }
        
        console.log('✅ Sign up successful');
        setProgress(100);
        
        if (onAuthSuccess) {
          onAuthSuccess();
        } else {
          onClose();
        }
        
        setEmail("");
        setPassword("");
        setFullName("");
        setProgress(0);
      }
    } catch (error: any) {
      console.error('❌ Auth error:', error);
      setError(error.message || text[language].genericError);
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricSuccess = () => {
    toast({
      title: text[language].biometricAuth,
      description: "Biometric authentication successful!",
    });
    onClose();
  };

  const handleMFASuccess = () => {
    setIsMFAVerified(true);
    toast({
      title: text[language].mfaVerification,
      description: "MFA verification successful!",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{text[language].welcomeTo}</DialogTitle>
          <DialogDescription>
            {isLogin ? text[language].signInToAccount : text[language].createAccountToStart}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={isLogin ? "signin" : "signup"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" onClick={() => setIsLogin(true)}>
              {text[language].signIn}
            </TabsTrigger>
            <TabsTrigger value="signup" onClick={() => setIsLogin(false)}>
              {text[language].signUp}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{text[language].email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={text[language].enterEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{text[language].password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={text[language].enterPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? text[language].signingIn : text[language].signIn}
              </Button>
              
              <BiometricAuth onSuccess={handleBiometricSuccess} />
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{text[language].fullName}</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={text[language].enterFullName}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">{text[language].email}</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder={text[language].enterEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">{text[language].password}</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={text[language].createPassword}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <EnhancedPasswordStrengthMeter
                  password={password}
                  onStrengthChange={setPasswordStrength}
                />
              </div>
              
              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? text[language].creatingAccount : text[language].createAccount}
              </Button>
            </form>
            <p className="text-xs text-gray-600 text-center">
              {text[language].newAccountsApproved}
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
