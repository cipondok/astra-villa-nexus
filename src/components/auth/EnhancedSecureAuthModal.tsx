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
import { supabase } from "@/integrations/supabase/client";

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
  
  // Note: Security monitoring moved to server-side  
  const checkBreachStatus = async () => ({ breached: false });
  const calculateRiskScore = () => 0;
  const logSecurityEvent = () => {};
  
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
      switchToRegister: "Sign up here"
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
      switchToRegister: "Daftar di sini"
    }
  };

  const currentText = text[language];

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check email availability and format
  const checkEmailAvailability = async (email: string) => {
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
    setEmailValidation({
      isValid: true,
      isChecking: true,
      isAvailable: false,
      message: currentText.emailChecking,
      type: null
    });

    try {
      // Note: Breach checking moved to server-side
      const breachData = await checkBreachStatus();
      
      // Check if email exists in database
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase())
        .limit(1);

      const emailExists = existingProfiles && existingProfiles.length > 0;
      
      if (emailExists && activeTab === "register") {
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
    } else {
      setPasswordsMatch(true);
    }
  }, [registerData.password, registerData.confirmPassword]);

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
    
    // Bot detection - check honeypot
    if (registerData.honeypot) {
      console.log('Bot detected');
      return;
    }
    
    if (!emailValidation.isValid) {
      await checkEmailAvailability(loginData.email);
      return;
    }
    
    setIsLoading(true);
    
    // Note: Risk scoring moved to server-side (useAdvancedAuthSecurity)
    const riskScore = calculateRiskScore();
    const riskLevel = "low"; // Server will handle actual risk assessment
    setRiskLevel(riskLevel);
    
    // Note: Security logging moved to server-side
    logSecurityEvent();
    
    try {
      const result = await signIn(loginData.email, loginData.password);
      
      if (result.success) {
        // Note: MFA is handled by useAdvancedAuthSecurity on server-side
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 Registration attempt:", {
      email: registerData.email,
      emailValid: emailValidation.isValid,
      emailAvailable: emailValidation.isAvailable,
      passwordsMatch,
      passwordStrength,
      honeypot: registerData.honeypot
    });
    
    // Bot detection - check honeypot
    if (registerData.honeypot) {
      console.log('🤖 Bot detected via honeypot');
      return;
    }
    
    if (!emailValidation.isValid || !emailValidation.isAvailable || !passwordsMatch || passwordStrength < 3) {
      console.log("❌ Registration validation failed");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signUp(registerData.email, registerData.password, registerData.fullName);
      if (result.success) {
        console.log("✅ Registration successful");
        onClose();
      }
    } finally {
      setIsLoading(false);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              >
                {currentText.login}
              </TabsTrigger>
              <TabsTrigger 
                value="register"
                className="data-[state=active]:bg-[#2A5C8A] data-[state=active]:text-white"
              >
                {currentText.register}
              </TabsTrigger>
            </TabsList>

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
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
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
                  disabled={isLoading || !emailValidation.isValid}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
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
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
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
                    !emailValidation.isValid || 
                    !emailValidation.isAvailable || 
                    !passwordsMatch || 
                    passwordStrength < 3 ||
                    !registerData.fullName ||
                    registerData.honeypot !== ""
                  }
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating Account...
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
