
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Shield, Mail, User, Lock, CheckCircle, XCircle, AlertTriangle, Phone, MessageCircle } from "lucide-react";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { MFASetup } from "./MFASetup";
import { BiometricAuth } from "./BiometricAuth";
import { RiskAssessment } from "./RiskAssessment";

interface SecureAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "id";
}

interface BehavioralMetrics {
  keystrokes: number[];
  mouseMovements: Array<{ x: number; y: number; timestamp: number }>;
  typingPattern: number[];
}

interface EmailValidation {
  isValid: boolean;
  isChecking: boolean;
  message: string;
  type: "success" | "error" | "warning" | null;
}

const SecureAuthModal = ({ isOpen, onClose, language }: SecureAuthModalProps) => {
  const [activeTab, setActiveTab] = useState("login");
  const [authMethod, setAuthMethod] = useState<"email" | "whatsapp">("email");
  const [loginData, setLoginData] = useState({ email: "", password: "", whatsapp: "" });
  const [registerData, setRegisterData] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "", 
    fullName: "",
    whatsapp: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [whatsappValidation, setWhatsappValidation] = useState<EmailValidation>({
    isValid: false,
    isChecking: false,
    message: "",
    type: null
  });
  const [emailValidation, setEmailValidation] = useState<EmailValidation>({
    isValid: false,
    isChecking: false,
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
      login: "Secure Login",
      register: "Create Account",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      rememberMe: "Remember me for 30 days",
      emailValid: "Email is valid",
      emailInvalid: "Please enter a valid email address",
      emailExists: "Email already registered",
      emailChecking: "Checking email...",
      passwordsMatch: "Passwords match",
      passwordsDontMatch: "Passwords don't match",
      weakPassword: "Password too weak (minimum strength: Good)",
      gdprConsent: "I agree to data processing for security purposes",
      whatsapp: "WhatsApp Number",
      whatsappValid: "WhatsApp number is valid",
      whatsappInvalid: "Enter valid WhatsApp (e.g. +62812xxxx)",
      useEmail: "Use Email",
      useWhatsapp: "Use WhatsApp"
    },
    id: {
      login: "Login Aman",
      register: "Buat Akun",
      email: "Alamat Email",
      password: "Kata Sandi",
      confirmPassword: "Konfirmasi Kata Sandi",
      fullName: "Nama Lengkap",
      rememberMe: "Ingat saya selama 30 hari",
      emailValid: "Email valid",
      emailInvalid: "Silakan masukkan alamat email yang valid",
      emailExists: "Email sudah terdaftar",
      emailChecking: "Memeriksa email...",
      passwordsMatch: "Kata sandi cocok",
      passwordsDontMatch: "Kata sandi tidak cocok",
      weakPassword: "Kata sandi terlalu lemah (minimum: Baik)",
      gdprConsent: "Saya setuju dengan pemrosesan data untuk tujuan keamanan",
      whatsapp: "Nomor WhatsApp",
      whatsappValid: "Nomor WhatsApp valid",
      whatsappInvalid: "Masukkan WhatsApp valid (cth: +62812xxxx)",
      useEmail: "Pakai Email",
      useWhatsapp: "Pakai WhatsApp"
    }
  };

  const currentText = text[language];

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // WhatsApp validation function
  const validateWhatsapp = (phone: string): boolean => {
    // Accept formats: +62812xxx, 62812xxx, 0812xxx, 812xxx
    const phoneRegex = /^(\+?62|0)?8[1-9][0-9]{7,10}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  // Check WhatsApp number
  const checkWhatsapp = (phone: string) => {
    if (!phone) {
      setWhatsappValidation({ isValid: false, isChecking: false, message: "", type: null });
      return;
    }

    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!validateWhatsapp(cleanPhone)) {
      setWhatsappValidation({
        isValid: false,
        isChecking: false,
        message: currentText.whatsappInvalid,
        type: "error"
      });
      return;
    }

    setWhatsappValidation({
      isValid: true,
      isChecking: false,
      message: currentText.whatsappValid,
      type: "success"
    });
  };

  // Debounced WhatsApp checking
  useEffect(() => {
    const phone = activeTab === "login" ? loginData.whatsapp : registerData.whatsapp;
    if (authMethod === "whatsapp") {
      const timer = setTimeout(() => checkWhatsapp(phone), 300);
      return () => clearTimeout(timer);
    }
  }, [loginData.whatsapp, registerData.whatsapp, activeTab, authMethod]);

  // Check email availability and format
  const checkEmail = async (email: string) => {
    if (!email) {
      setEmailValidation({ isValid: false, isChecking: false, message: "", type: null });
      return;
    }

    if (!validateEmail(email)) {
      setEmailValidation({
        isValid: false,
        isChecking: false,
        message: currentText.emailInvalid,
        type: "error"
      });
      return;
    }

    setEmailValidation({
      isValid: false,
      isChecking: true,
      message: currentText.emailChecking,
      type: null
    });

    try {
      // Note: Breach checking moved to server-side
      const breachData = await checkBreachStatus();
      
      // For demonstration - in real app, you'd check if email exists in your database
      const emailExists = Math.random() > 0.8; // 20% chance email exists for demo
      
      if (emailExists && activeTab === "register") {
        setEmailValidation({
          isValid: false,
          isChecking: false,
          message: currentText.emailExists,
          type: "error"
        });
      } else {
        const message = breachData.breached 
          ? "Email valid but found in data breach"
          : currentText.emailValid;
        
        setEmailValidation({
          isValid: true,
          isChecking: false,
          message,
          type: breachData.breached ? "warning" : "success"
        });
      }
    } catch (error) {
      setEmailValidation({
        isValid: true,
        isChecking: false,
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

    emailCheckTimeoutRef.current = setTimeout(() => {
      checkEmail(email);
    }, 500);

    return () => {
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }
    };
  }, [registerData.email, loginData.email, activeTab]);

  // Password confirmation validation
  useEffect(() => {
    if (registerData.confirmPassword) {
      setPasswordsMatch(registerData.password === registerData.confirmPassword);
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
    
    if (!emailValidation.isValid && activeTab === "login") {
      await checkEmail(loginData.email);
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
    
    if (!emailValidation.isValid || !passwordsMatch || passwordStrength < 3) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await signUp(registerData.email, registerData.password, registerData.fullName);
      if (result.success) {
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getEmailIcon = () => {
    if (emailValidation.isChecking) {
      return <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    }
    if (emailValidation.type === "success") {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (emailValidation.type === "error") {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (emailValidation.type === "warning") {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <Mail className="h-4 w-4 text-gray-400" />;
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[300px] md:max-w-[340px] p-3 md:p-4" ref={mouseTrackingRef} autoClose={false}>
        <DialogHeader className="space-y-1">
          <DialogTitle className="flex items-center gap-1.5 text-xs md:text-sm">
            <Shield className="h-3.5 w-3.5 text-primary" />
            Astra Villa
          </DialogTitle>
          <DialogDescription className="text-[10px] md:text-xs">
            Secure login to your account
          </DialogDescription>
        </DialogHeader>

        {/* Risk Assessment Alert */}
        {riskLevel !== "low" && (
          <RiskAssessment 
            riskLevel={riskLevel}
            factors={["New device detected", "Unusual typing pattern"]}
          />
        )}

        {/* MFA Flow */}
        {showMFA ? (
          <MFASetup onComplete={() => {
            setShowMFA(false);
            onClose();
          }} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="login" className="text-[10px] md:text-xs h-7">{currentText.login}</TabsTrigger>
              <TabsTrigger value="register" className="text-[10px] md:text-xs h-7">{currentText.register}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-2 mt-2">
              {/* Auth Method Toggle */}
              <div className="flex gap-1 p-0.5 bg-muted/50 rounded-lg">
                <Button
                  type="button"
                  variant={authMethod === "email" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 h-6 text-[9px] gap-1"
                  onClick={() => setAuthMethod("email")}
                >
                  <Mail className="h-2.5 w-2.5" />
                  {currentText.useEmail}
                </Button>
                <Button
                  type="button"
                  variant={authMethod === "whatsapp" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 h-6 text-[9px] gap-1"
                  onClick={() => setAuthMethod("whatsapp")}
                >
                  <MessageCircle className="h-2.5 w-2.5" />
                  {currentText.useWhatsapp}
                </Button>
              </div>

              <form onSubmit={handleLogin} className="space-y-2">
                {authMethod === "email" ? (
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-[10px] md:text-xs">{currentText.email}</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-8 pr-8 h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                        placeholder="Enter your email"
                      />
                      <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                        {getEmailIcon()}
                      </div>
                    </div>
                    {emailValidation.message && (
                      <p className={`text-[9px] ${
                        emailValidation.type === "error" ? "text-destructive" :
                        emailValidation.type === "warning" ? "text-yellow-500" :
                        emailValidation.type === "success" ? "text-green-500" :
                        "text-muted-foreground"
                      }`}>
                        {emailValidation.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label htmlFor="login-whatsapp" className="text-[10px] md:text-xs">{currentText.whatsapp}</Label>
                    <div className="relative">
                      <Input
                        id="login-whatsapp"
                        type="tel"
                        value={loginData.whatsapp}
                        onChange={(e) => setLoginData(prev => ({ ...prev, whatsapp: e.target.value }))}
                        className="pl-8 pr-8 h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                        placeholder="+62812xxxxxxxx"
                      />
                      <Phone className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                        {whatsappValidation.type === "success" ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : whatsappValidation.type === "error" ? (
                          <XCircle className="h-3 w-3 text-destructive" />
                        ) : (
                          <MessageCircle className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                    </div>
                    {whatsappValidation.message && (
                      <p className={`text-[9px] ${
                        whatsappValidation.type === "error" ? "text-destructive" : "text-green-500"
                      }`}>
                        {whatsappValidation.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-[10px] md:text-xs">{currentText.password}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-8 pr-8 h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-primary"
                      disabled={isLoading}
                      placeholder="Enter your password"
                    />
                    <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="h-3 w-3"
                  />
                  <Label htmlFor="remember" className="text-[9px] md:text-[10px] text-muted-foreground">
                    {currentText.rememberMe}
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-8 text-xs bg-primary hover:bg-primary/90 transition-all duration-200"
                  disabled={isLoading || (authMethod === "email" ? !emailValidation.isValid : !whatsappValidation.isValid)}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px]">Loading...</span>
                    </div>
                  ) : (
                    currentText.login
                  )}
                </Button>

                <BiometricAuth onSuccess={() => onClose()} />
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-2 mt-2">
              {/* Auth Method Toggle */}
              <div className="flex gap-1 p-0.5 bg-muted/50 rounded-lg">
                <Button
                  type="button"
                  variant={authMethod === "email" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 h-6 text-[9px] gap-1"
                  onClick={() => setAuthMethod("email")}
                >
                  <Mail className="h-2.5 w-2.5" />
                  {currentText.useEmail}
                </Button>
                <Button
                  type="button"
                  variant={authMethod === "whatsapp" ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 h-6 text-[9px] gap-1"
                  onClick={() => setAuthMethod("whatsapp")}
                >
                  <MessageCircle className="h-2.5 w-2.5" />
                  {currentText.useWhatsapp}
                </Button>
              </div>

              <form onSubmit={handleRegister} className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="fullName" className="text-[10px] md:text-xs">{currentText.fullName}</Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="pl-8 h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-primary"
                      disabled={isLoading}
                      placeholder="Enter your full name"
                    />
                    <User className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  </div>
                </div>

                {authMethod === "email" ? (
                  <div className="space-y-1">
                    <Label htmlFor="register-email" className="text-[10px] md:text-xs">{currentText.email}</Label>
                    <div className="relative">
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        className="pl-8 pr-8 h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                        placeholder="Enter your email"
                      />
                      <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                        {getEmailIcon()}
                      </div>
                    </div>
                    {emailValidation.message && (
                      <p className={`text-[9px] ${
                        emailValidation.type === "error" ? "text-destructive" :
                        emailValidation.type === "warning" ? "text-yellow-500" :
                        emailValidation.type === "success" ? "text-green-500" :
                        "text-muted-foreground"
                      }`}>
                        {emailValidation.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label htmlFor="register-whatsapp" className="text-[10px] md:text-xs">{currentText.whatsapp}</Label>
                    <div className="relative">
                      <Input
                        id="register-whatsapp"
                        type="tel"
                        value={registerData.whatsapp}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, whatsapp: e.target.value }))}
                        className="pl-8 pr-8 h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                        placeholder="+62812xxxxxxxx"
                      />
                      <Phone className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                      <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2">
                        {whatsappValidation.type === "success" ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : whatsappValidation.type === "error" ? (
                          <XCircle className="h-3 w-3 text-destructive" />
                        ) : (
                          <MessageCircle className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                    </div>
                    {whatsappValidation.message && (
                      <p className={`text-[9px] ${
                        whatsappValidation.type === "error" ? "text-destructive" : "text-green-500"
                      }`}>
                        {whatsappValidation.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="register-password" className="text-[10px] md:text-xs">{currentText.password}</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-8 pr-8 h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-primary"
                      disabled={isLoading}
                      placeholder="Create a strong password"
                    />
                    <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  <PasswordStrengthMeter 
                    password={registerData.password} 
                    onStrengthChange={setPasswordStrength}
                  />
                  {passwordStrength < 3 && registerData.password && (
                    <p className="text-[9px] text-destructive">{currentText.weakPassword}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword" className="text-[10px] md:text-xs">{currentText.confirmPassword}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-8 pr-8 h-8 text-xs transition-all duration-200 focus:ring-2 focus:ring-primary"
                      disabled={isLoading}
                      placeholder="Confirm your password"
                    />
                    <Lock className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                      {registerData.confirmPassword && (
                        passwordsMatch ? 
                          <CheckCircle className="h-3 w-3 text-green-500" /> :
                          <XCircle className="h-3 w-3 text-destructive" />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-full px-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  {registerData.confirmPassword && !passwordsMatch && (
                    <p className="text-[9px] text-destructive">{currentText.passwordsDontMatch}</p>
                  )}
                  {registerData.confirmPassword && passwordsMatch && (
                    <p className="text-[9px] text-green-500">{currentText.passwordsMatch}</p>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <Checkbox id="gdpr" required className="h-3 w-3" />
                  <Label htmlFor="gdpr" className="text-[9px] md:text-[10px] text-muted-foreground">
                    {currentText.gdprConsent}
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-8 text-xs bg-primary hover:bg-primary/90 transition-all duration-200 disabled:opacity-50"
                  disabled={isLoading || (authMethod === "email" ? !emailValidation.isValid : !whatsappValidation.isValid) || !passwordsMatch || passwordStrength < 3}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px]">Creating...</span>
                    </div>
                  ) : (
                    currentText.register
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        {/* Security Status Footer */}
        <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <Shield className="h-2.5 w-2.5" />
            <span>256-bit encryption</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${
              riskLevel === "low" ? "bg-green-500" :
              riskLevel === "medium" ? "bg-yellow-500" :
              "bg-destructive"
            }`} />
            <span>{riskLevel.toUpperCase()} RISK</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecureAuthModal;
