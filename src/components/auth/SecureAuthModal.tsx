
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Shield, Mail, User, Lock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";
import { MFASetup } from "./MFASetup";
import { BiometricAuth } from "./BiometricAuth";
import { RiskAssessment } from "./RiskAssessment";
import { useSecurityMonitoring } from "@/hooks/useSecurityMonitoring";

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
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    email: "", 
    password: "", 
    confirmPassword: "", 
    fullName: "" 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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
  const { logSecurityEvent, calculateRiskScore, checkBreachStatus } = useSecurityMonitoring();
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
      gdprConsent: "I agree to data processing for security purposes"
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
      gdprConsent: "Saya setuju dengan pemrosesan data untuk tujuan keamanan"
    }
  };

  const currentText = text[language];

  // Email validation function
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
      // Check for data breaches
      const breachData = await checkBreachStatus(email);
      
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
    
    // Calculate risk score
    const riskScore = calculateRiskScore(behavioralMetrics);
    const riskLevel = riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low";
    setRiskLevel(riskLevel);
    
    logSecurityEvent({
      type: "login_attempt",
      details: { email: loginData.email, riskScore, riskLevel }
    });
    
    try {
      const result = await signIn(loginData.email, loginData.password);
      
      if (result.success) {
        if (riskLevel === "high") {
          setShowMFA(true);
        } else {
          onClose();
        }
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
      <DialogContent className="max-w-md" ref={mouseTrackingRef}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Astra Villa
          </DialogTitle>
          <DialogDescription>
            Enterprise-grade security for your account
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{currentText.login}</TabsTrigger>
              <TabsTrigger value="register">{currentText.register}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{currentText.email}</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                      placeholder="Enter your email"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getEmailIcon()}
                    </div>
                  </div>
                  {emailValidation.message && (
                    <p className={`text-xs ${
                      emailValidation.type === "error" ? "text-red-500" :
                      emailValidation.type === "warning" ? "text-yellow-500" :
                      emailValidation.type === "success" ? "text-green-500" :
                      "text-gray-500"
                    }`}>
                      {emailValidation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">{currentText.password}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                      placeholder="Enter your password"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    {currentText.rememberMe}
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                  disabled={isLoading || !emailValidation.isValid}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </div>
                  ) : (
                    currentText.login
                  )}
                </Button>

                <BiometricAuth onSuccess={() => onClose()} />
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{currentText.fullName}</Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                      placeholder="Enter your full name"
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">{currentText.email}</Label>
                  <div className="relative">
                    <Input
                      id="register-email"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                      className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                      placeholder="Enter your email"
                    />
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getEmailIcon()}
                    </div>
                  </div>
                  {emailValidation.message && (
                    <p className={`text-xs ${
                      emailValidation.type === "error" ? "text-red-500" :
                      emailValidation.type === "warning" ? "text-yellow-500" :
                      emailValidation.type === "success" ? "text-green-500" :
                      "text-gray-500"
                    }`}>
                      {emailValidation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">{currentText.password}</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                      placeholder="Create a strong password"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <PasswordStrengthMeter 
                    password={registerData.password} 
                    onStrengthChange={setPasswordStrength}
                  />
                  {passwordStrength < 3 && registerData.password && (
                    <p className="text-xs text-red-500">{currentText.weakPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{currentText.confirmPassword}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="pl-10 pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                      placeholder="Confirm your password"
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      {registerData.confirmPassword && (
                        passwordsMatch ? 
                          <CheckCircle className="h-4 w-4 text-green-500" /> :
                          <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-full px-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  {registerData.confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500">{currentText.passwordsDontMatch}</p>
                  )}
                  {registerData.confirmPassword && passwordsMatch && (
                    <p className="text-xs text-green-500">{currentText.passwordsMatch}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="gdpr" required />
                  <Label htmlFor="gdpr" className="text-sm">
                    {currentText.gdprConsent}
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50"
                  disabled={isLoading || !emailValidation.isValid || !passwordsMatch || passwordStrength < 3}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Account...
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
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            <span>256-bit encryption</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              riskLevel === "low" ? "bg-green-500" :
              riskLevel === "medium" ? "bg-yellow-500" :
              "bg-red-500"
            }`} />
            <span>{riskLevel.toUpperCase()} RISK</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecureAuthModal;
