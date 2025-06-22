
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Shield, Mail, User, Lock, CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { EnhancedPasswordStrengthMeter } from "./EnhancedPasswordStrengthMeter";
import { MFASetup } from "./MFASetup";
import { BiometricAuth } from "./BiometricAuth";
import { RiskAssessment } from "./RiskAssessment";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EnhancedSecureAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "id";
}

interface BehavioralMetrics {
  keystrokes: number[];
  mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  typingPattern: number[];
}

interface EmailValidationState {
  isValid: boolean;
  isChecking: boolean;
  isAvailable: boolean;
  message: string;
  type: "success" | "error" | "warning" | null;
}

const EnhancedSecureAuthModal = ({ isOpen, onClose, language }: EnhancedSecureAuthModalProps) => {
  const [activeTab, setActiveTab] = useState("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "", 
    fullName: "",
    honeypot: "" // Anti-bot field
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [authError, setAuthError] = useState<string | null>(null);
  const [emailValidation, setEmailValidation] = useState<EmailValidationState>({
    isValid: false,
    isChecking: false,
    isAvailable: false,
    message: "",
    type: null
  });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low");
  const [behavioralMetrics, setBehavioralMetrics] = useState<BehavioralMetrics>({
    keystrokes: [],
    mouseMovements: [],
    typingPattern: []
  });
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const { logSecurityEvent, calculateRiskScore, checkBreachStatus } = useSecurityMonitoring();
  const mouseTrackingRef = useRef<HTMLDivElement>(null);
  const lastKeystrokeRef = useRef(0);
  const emailCheckTimeoutRef = useRef<NodeJS.Timeout>();

  const text = {
    en: {
      login: "Sign In",
      register: "Create Account",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      rememberMe: "Remember me for 30 days",
      emailValid: "✅ Email is available",
      emailInvalid: "❌ Invalid email format",
      emailTaken: "⚠️ Email already registered",
      emailChecking: "🔄 Checking availability...",
      passwordsMatch: "✅ Passwords match",
      passwordsDontMatch: "❌ Passwords don't match",
      weakPassword: "Password strength insufficient",
      createAccount: "Create your secure account",
      signInAccount: "Sign in to your account",
      alreadyHaveAccount: "Already have an account?",
      needAccount: "Need an account?",
      switchToLogin: "Sign in here",
      switchToRegister: "Sign up here",
      signingIn: "Signing in...",
      creatingAccount: "Creating account...",
      authenticationFailed: "Authentication failed",
      invalidCredentials: "Invalid email or password",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      nameRequired: "Full name is required"
    },
    id: {
      login: "Masuk",
      register: "Buat Akun",
      email: "Alamat Email",
      password: "Kata Sandi",
      confirmPassword: "Konfirmasi Kata Sandi",
      fullName: "Nama Lengkap",
      rememberMe: "Ingat saya selama 30 hari",
      emailValid: "✅ Email tersedia",
      emailInvalid: "❌ Format email tidak valid",
      emailTaken: "⚠️ Email sudah terdaftar",
      emailChecking: "🔄 Memeriksa ketersediaan...",
      passwordsMatch: "✅ Kata sandi cocok",
      passwordsDontMatch: "❌ Kata sandi tidak cocok",
      weakPassword: "Kekuatan kata sandi tidak cukup",
      createAccount: "Buat akun aman Anda",
      signInAccount: "Masuk ke akun Anda",
      alreadyHaveAccount: "Sudah punya akun?",
      needAccount: "Perlu akun?",
      switchToLogin: "Masuk di sini",
      switchToRegister: "Daftar di sini",
      signingIn: "Masuk...",
      creatingAccount: "Membuat akun...",
      authenticationFailed: "Autentikasi gagal",
      invalidCredentials: "Email atau kata sandi salah",
      emailRequired: "Email wajib diisi",
      passwordRequired: "Kata sandi wajib diisi",
      nameRequired: "Nama lengkap wajib diisi"
    }
  };

  const currentText = text[language];

  // Progress animation helper
  const animateProgress = (targetProgress: number) => {
    const startProgress = loadingProgress;
    const duration = 1000; // 1 second
    const startTime = Date.now();

    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const currentProgress = startProgress + (targetProgress - startProgress) * progress;
      setLoadingProgress(Math.round(currentProgress));

      if (progress < 1) {
        requestAnimationFrame(updateProgress);
      }
    };

    requestAnimationFrame(updateProgress);
  };

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Input validation
  const validateLoginInput = () => {
    if (!loginData.email.trim()) {
      setAuthError(currentText.emailRequired);
      return false;
    }
    if (!validateEmail(loginData.email)) {
      setAuthError(currentText.emailInvalid);
      return false;
    }
    if (!loginData.password) {
      setAuthError(currentText.passwordRequired);
      return false;
    }
    return true;
  };

  const validateRegisterInput = () => {
    if (!registerData.fullName.trim()) {
      setAuthError(currentText.nameRequired);
      return false;
    }
    if (!registerData.email.trim()) {
      setAuthError(currentText.emailRequired);
      return false;
    }
    if (!validateEmail(registerData.email)) {
      setAuthError(currentText.emailInvalid);
      return false;
    }
    if (!registerData.password) {
      setAuthError(currentText.passwordRequired);
      return false;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setAuthError(currentText.passwordsDontMatch);
      return false;
    }
    if (passwordStrength < 3) {
      setAuthError(currentText.weakPassword);
      return false;
    }
    return true;
  };

  // Check email availability and format
  const checkEmailAvailability = async (email: string) => {
    console.log("🔍 Checking email:", email);
    
    if (!email) {
      setEmailValidation({ 
        isValid: false, 
        isChecking: false, 
        isAvailable: false, 
        message: "", 
        type: null 
      });
      return;
    }

    // First check format
    if (!validateEmail(email)) {
      console.log("❌ Invalid email format");
      setEmailValidation({
        isValid: false,
        isChecking: false,
        isAvailable: false,
        message: currentText.emailInvalid,
        type: "error"
      });
      return;
    }

    // Show checking state
    console.log("🔄 Checking email availability...");
    setEmailValidation({
      isValid: true,
      isChecking: true,
      isAvailable: false,
      message: currentText.emailChecking,
      type: null
    });

    try {
      // Check for data breaches first
      const breachData = await checkBreachStatus(email);
      
      // Check if email exists in database
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .limit(1);

      const emailExists = existingProfiles && existingProfiles.length > 0;
      
      if (emailExists && activeTab === "register") {
        console.log("⚠️ Email already registered");
        setEmailValidation({
          isValid: true,
          isChecking: false,
          isAvailable: false,
          message: currentText.emailTaken,
          type: "error"
        });
      } else {
        let message = currentText.emailValid;
        let type: "success" | "warning" = "success";
        
        if (breachData.breached) {
          message = "⚠️ Email available but found in data breach";
          type = "warning";
        }
        
        console.log("✅ Email is available");
        setEmailValidation({
          isValid: true,
          isChecking: false,
          isAvailable: !emailExists,
          message,
          type
        });
      }
    } catch (error) {
      console.error('Email check error:', error);
      setEmailValidation({
        isValid: true,
        isChecking: false,
        isAvailable: true,
        message: currentText.emailValid,
        type: "success"
      });
    }
  };

  // Debounced email checking
  useEffect(() => {
    const email = activeTab === "login" ? loginData.email : registerData.email;
    
    if (emailCheckTimeoutRef.current) {
      clearTimeout(emailCheckTimeoutRef.current);
    }

    if (email) {
      emailCheckTimeoutRef.current = setTimeout(() => {
        checkEmailAvailability(email);
      }, 800);
    }

    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, [registerData.email, loginData.email, activeTab]);

  // Password confirmation validation
  useEffect(() => {
    if (registerData.confirmPassword) {
      const matches = registerData.password === registerData.confirmPassword;
      setPasswordsMatch(matches);
      console.log("🔒 Password match check:", matches ? "✅ Match" : "❌ No match");
    } else {
      setPasswordsMatch(true);
    }
  }, [registerData.password, registerData.confirmPassword]);

  // Clear auth error when switching tabs or changing input
  useEffect(() => {
    setAuthError(null);
  }, [activeTab, loginData.email, loginData.password, registerData.email, registerData.password]);

  // Behavioral biometrics tracking
  useEffect(() => {
    const trackMouse = (e: MouseEvent) => {
      setBehavioralMetrics(prev => ({
        ...prev,
        mouseMovements: [...prev.mouseMovements.slice(-50), {
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now()
        }]
      }));
    };

    const trackKeystrokes = () => {
      const now = Date.now();
      const timeDiff = now - lastKeystrokeRef.current;
      lastKeystrokeRef.current = now;
      
      setBehavioralMetrics(prev => ({
        ...prev,
        keystrokes: [...prev.keystrokes.slice(-20), timeDiff],
        typingPattern: [...prev.typingPattern.slice(-20), timeDiff]
      }));
    };

    if (isOpen) {
      document.addEventListener('mousemove', trackMouse);
      document.addEventListener('keydown', trackKeystrokes);
    }

    return () => {
      document.removeEventListener('mousemove', trackMouse);
      document.removeEventListener('keydown', trackKeystrokes);
    };
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 Login attempt started");
    setAuthError(null);
    
    // Validate input
    if (!validateLoginInput()) {
      console.log("❌ Login validation failed");
      return;
    }
    
    // Bot detection - check honeypot
    if (registerData.honeypot) {
      console.log('🤖 Bot detected via honeypot');
      return;
    }
    
    setIsLoading(true);
    setLoadingProgress(0);
    
    try {
      console.log("🔐 Starting authentication process...");
      animateProgress(30);
      
      // Calculate risk score
      const riskScore = calculateRiskScore(behavioralMetrics);
      const currentRiskLevel = riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";
      setRiskLevel(currentRiskLevel);
      
      logSecurityEvent({
        type: "login_attempt",
        details: { email: loginData.email, riskScore, riskLevel: currentRiskLevel }
      });
      
      animateProgress(60);
      
      console.log("📧 Attempting login for:", loginData.email);
      const result = await signIn(loginData.email, loginData.password);
      
      animateProgress(90);
      
      if (result.error) {
        console.error("❌ Login failed:", result.error);
        setAuthError(result.error);
        
        toast({
          title: currentText.authenticationFailed,
          description: result.error,
          variant: "destructive",
        });
        
        logSecurityEvent({
          type: "login_failed",
          details: { email: loginData.email, error: result.error }
        });
      } else if (result.success) {
        console.log("✅ Login successful");
        animateProgress(100);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
        
        if (currentRiskLevel === "high") {
          setShowMFA(true);
        } else {
          setTimeout(() => {
            onClose();
            setLoginData({ email: "", password: "" });
            setAuthError(null);
            setLoadingProgress(0);
          }, 500);
        }
      }
    } catch (error: any) {
      console.error("💥 Unexpected login error:", error);
      const errorMessage = error.message || currentText.authenticationFailed;
      setAuthError(errorMessage);
      
      toast({
        title: currentText.authenticationFailed,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        if (!showMFA) {
          setLoadingProgress(0);
        }
      }, 500);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 Registration attempt started");
    setAuthError(null);
    
    // Validate input
    if (!validateRegisterInput()) {
      console.log("❌ Registration validation failed");
      return;
    }
    
    // Bot detection - check honeypot
    if (registerData.honeypot) {
      console.log('🤖 Bot detected via honeypot');
      return;
    }
    
    if (!emailValidation.isValid || !emailValidation.isAvailable) {
      console.log("❌ Email validation failed");
      setAuthError("Please enter a valid and available email address");
      return;
    }
    
    setIsLoading(true);
    setLoadingProgress(0);
    
    try {
      console.log("👤 Starting registration process...");
      animateProgress(30);
      
      console.log("📧 Attempting registration for:", registerData.email);
      const result = await signUp(registerData.email, registerData.password, registerData.fullName);
      
      animateProgress(80);
      
      if (result.error) {
        console.error("❌ Registration failed:", result.error);
        setAuthError(result.error);
        
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.success) {
        console.log("✅ Registration successful");
        animateProgress(100);
        
        toast({
          title: "Account Created!",
          description: "Welcome to Astra Villa! You can now sign in.",
        });
        
        setTimeout(() => {
          onClose();
          setRegisterData({ email: "", password: "", fullName: "", confirmPassword: "", honeypot: "" });
          setAuthError(null);
          setLoadingProgress(0);
        }, 500);
      }
    } catch (error: any) {
      console.error("💥 Unexpected registration error:", error);
      const errorMessage = error.message || "Registration failed";
      setAuthError(errorMessage);
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    setAuthError(null);
    
    try {
      console.log("🔍 Starting Google OAuth...");
      animateProgress(30);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      animateProgress(100);
      
      if (error) {
        console.error("❌ Google login failed:", error);
        setAuthError(error.message);
        
        toast({
          title: "Google Sign In Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("💥 Google login error:", error);
      setAuthError(error.message);
      
      toast({
        title: "Google Sign In Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(0);
      }, 500);
    }
  };

  const resetForms = () => {
    setLoginData({ email: "", password: "" });
    setRegisterData({ email: "", password: "", fullName: "", confirmPassword: "", honeypot: "" });
    setAuthError(null);
    setLoadingProgress(0);
    setEmailValidation({ isValid: false, isChecking: false, isAvailable: false, message: "", type: null });
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForms();
      onClose();
    }
  };

  const getEmailIcon = () => {
    if (emailValidation.isChecking) {
      return <Loader2 className="w-4 h-4 animate-spin text-[#2A5C8A]" />;
    }
    if (emailValidation.type === "success") {
      return <CheckCircle className="h-4 w-4 text-[#2ECC71]" />;
    }
    if (emailValidation.type === "error") {
      return <XCircle className="h-4 w-4 text-[#E74C3C]" />;
    }
    if (emailValidation.type === "warning") {
      return <AlertTriangle className="h-4 w-4 text-[#F39C12]" />;
    }
    return <Mail className="h-4 w-4 text-gray-400" />;
  };

  const getPasswordMatchIcon = () => {
    if (!registerData.confirmPassword) return null;
    
    return passwordsMatch ? 
      <CheckCircle className="h-4 w-4 text-[#2ECC71]" /> :
      <XCircle className="h-4 w-4 text-[#E74C3C]" />;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-[#F9F9F9] border-0 shadow-xl" ref={mouseTrackingRef}>
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-[#2A5C8A]">
            <Shield className="h-6 w-6" />
            Astra Villa
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {activeTab === "login" ? currentText.signInAccount : currentText.createAccount}
          </DialogDescription>
        </DialogHeader>

        {/* Loading Progress Bar */}
        {isLoading && (
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-[#2A5C8A]" />
              <span className="text-sm text-[#2A5C8A] font-medium">
                {activeTab === "login" ? currentText.signingIn : currentText.creatingAccount}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#2A5C8A] to-[#4A90C2] h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Display */}
        {authError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{authError}</p>
            </div>
          </div>
        )}

        {/* Risk Assessment Alert */}
        {riskLevel !== "low" && (
          <RiskAssessment 
            riskLevel={riskLevel}
            factors={["New device detected", "Unusual typing pattern"]}
            className="mb-4"
          />
        )}

        {/* MFA Flow */}
        {showMFA ? (
          <MFASetup onComplete={() => {
            setShowMFA(false);
            onClose();
          }} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-[#2A5C8A] data-[state=active]:text-white"
                disabled={isLoading}
              >
                {currentText.login}
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-[#2A5C8A] data-[state=active]:text-white"
                disabled={isLoading}
              >
                {currentText.register}
              </TabsTrigger>
            </TabsList>

            <div className="space-y-4 mb-6 mt-6">
              <Button 
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 font-medium transition-all duration-200"
                variant="outline"
              >
                {isLoading && activeTab === "google" ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#F9F9F9] px-2 text-gray-500">Or continue with email</span>
                </div>
              </div>
            </div>

            <TabsContent value="login" className="space-y-6 mt-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    {currentText.email}
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-[#2A5C8A] focus:ring-2 focus:ring-[#2A5C8A]/20 transition-all duration-200 bg-white"
                      disabled={isLoading}
                      placeholder="Enter your email"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getEmailIcon()}
                    </div>
                  </div>
                  {emailValidation.message && (
                    <p className={`text-xs flex items-center gap-1 font-medium ${
                      emailValidation.type === "error" ? "text-[#E74C3C]" :
                      emailValidation.type === "warning" ? "text-[#F39C12]" :
                      emailValidation.type === "success" ? "text-[#2ECC71]" :
                      "text-gray-500"
                    }`}>
                      {emailValidation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    {currentText.password}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-[#2A5C8A] focus:ring-2 focus:ring-[#2A5C8A]/20 transition-all duration-200 bg-white"
                      disabled={isLoading}
                      placeholder="Enter your password"
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      className="border-2 border-[#2A5C8A]"
                      disabled={isLoading}
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      {currentText.rememberMe}
                    </Label>
                  </div>
                </div>

                {/* Honeypot field */}
                <input
                  type="text"
                  name="username"
                  value={registerData.honeypot}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, honeypot: e.target.value }))}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#2A5C8A] hover:bg-[#1e4a73] text-white font-medium transition-all duration-200 disabled:opacity-50"
                  disabled={isLoading || !loginData.email || !loginData.password}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {currentText.signingIn}
                    </div>
                  ) : (
                    currentText.login
                  )}
                </Button>

                <BiometricAuth onSuccess={() => onClose()} />
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {currentText.needAccount}{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-[#2A5C8A] hover:underline font-medium"
                    disabled={isLoading}
                  >
                    {currentText.switchToRegister}
                  </button>
                </p>
              </div>
            </TabsContent>

            <TabsContent value="register" className="space-y-6 mt-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                    {currentText.fullName}
                  </Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="pl-10 h-12 border-2 border-gray-200 focus:border-[#2A5C8A] focus:ring-2 focus:ring-[#2A5C8A]/20 transition-all duration-200 bg-white"
                      disabled={isLoading}
                      placeholder="Enter your full name"
                      required
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                    {currentText.email}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-[#2A5C8A] focus:ring-2 focus:ring-[#2A5C8A]/20 transition-all duration-200 bg-white"
                      disabled={isLoading}
                      placeholder="Enter your email"
                      required
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getEmailIcon()}
                    </div>
                  </div>
                  {emailValidation.message && (
                    <p className={`text-xs flex items-center gap-1 font-medium ${
                      emailValidation.type === "error" ? "text-[#E74C3C]" :
                      emailValidation.type === "warning" ? "text-[#F39C12]" :
                      emailValidation.type === "success" ? "text-[#2ECC71]" :
                      "text-gray-500"
                    }`}>
                      {emailValidation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                    {currentText.password}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10 h-12 border-2 border-gray-200 focus:border-[#2A5C8A] focus:ring-2 focus:ring-[#2A5C8A]/20 transition-all duration-200 bg-white"
                      disabled={isLoading}
                      placeholder="Create a strong password"
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  <EnhancedPasswordStrengthMeter 
                    password={registerData.password} 
                    onStrengthChange={setPasswordStrength}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    {currentText.confirmPassword}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 pr-16 h-12 border-2 border-gray-200 focus:border-[#2A5C8A] focus:ring-2 focus:ring-[#2A5C8A]/20 transition-all duration-200 bg-white"
                      disabled={isLoading}
                      placeholder="Confirm your password"
                      required
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                      {getPasswordMatchIcon()}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {registerData.confirmPassword && (
                    <p className={`text-xs flex items-center gap-1 font-medium ${
                      passwordsMatch ? "text-[#2ECC71]" : "text-[#E74C3C]"
                    }`}>
                      {passwordsMatch ? currentText.passwordsMatch : currentText.passwordsDontMatch}
                    </p>
                  )}
                </div>

                {/* Honeypot field */}
                <input
                  type="text"
                  name="username"
                  value={registerData.honeypot}
                  onChange={(e) => setRegisterData(prev => ({ ...prev, honeypot: e.target.value }))}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#2A5C8A] hover:bg-[#1e4a73] text-white font-medium transition-all duration-200 disabled:opacity-50"
                  disabled={
                    isLoading || 
                    !registerData.fullName.trim() ||
                    !registerData.email.trim() ||
                    !registerData.password ||
                    !registerData.confirmPassword ||
                    !passwordsMatch || 
                    passwordStrength < 3 ||
                    registerData.honeypot !== "" ||
                    (activeTab === "register" && (!emailValidation.isValid || !emailValidation.isAvailable))
                  }
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {currentText.creatingAccount}
                    </div>
                  ) : (
                    currentText.register
                  )}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {currentText.alreadyHaveAccount}{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-[#2A5C8A] hover:underline font-medium"
                    disabled={isLoading}
                  >
                    {currentText.switchToLogin}
                  </button>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Security Status Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-[#2A5C8A]" />
            <span>Enterprise Security</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              riskLevel === "low" ? "bg-[#2ECC71]" :
              riskLevel === "medium" ? "bg-[#F39C12]" :
              "bg-[#E74C3C]"
            }`} />
            <span className="uppercase font-medium">{riskLevel} Risk</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedSecureAuthModal;
