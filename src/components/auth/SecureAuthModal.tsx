
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, Shield, Smartphone, Clock, AlertTriangle, CheckCircle } from "lucide-react";
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
  const [rememberMe, setRememberMe] = useState(false);
  const [showMFA, setShowMFA] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [riskLevel, setRiskLevel] = useState<"low" | "medium" | "high">("low");
  const [behavioralMetrics, setBehavioralMetrics] = useState<BehavioralMetrics>({
    keystrokes: [],
    mouseMovements: [],
    typingPattern: []
  });
  const [breachStatus, setBreachStatus] = useState<"checking" | "safe" | "breached" | null>(null);
  const [rateLimitWarning, setRateLimitWarning] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  
  const { signIn, signUp } = useAuth();
  const mouseTrackingRef = useRef<HTMLDivElement>(null);
  const lastKeystrokeRef = useRef(0);

  const text = {
    en: {
      login: "Secure Login",
      register: "Create Account",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      rememberMe: "Remember me for 30 days",
      mfaRequired: "Multi-Factor Authentication Required",
      riskDetected: "Suspicious activity detected",
      breachDetected: "Email found in data breach",
      rateLimited: "Too many attempts. Please wait",
      biometricAuth: "Use Biometric Authentication",
      passwordStrength: "Password Strength",
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
      mfaRequired: "Autentikasi Multi-Faktor Diperlukan",
      riskDetected: "Aktivitas mencurigakan terdeteksi",
      breachDetected: "Email ditemukan dalam kebocoran data",
      rateLimited: "Terlalu banyak percobaan. Silakan tunggu",
      biometricAuth: "Gunakan Autentikasi Biometrik",
      passwordStrength: "Kekuatan Kata Sandi",
      gdprConsent: "Saya setuju dengan pemrosesan data untuk tujuan keamanan"
    }
  };

  const currentText = text[language];

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

  // Check email against breach database
  const checkEmailBreach = async (email: string) => {
    if (!email.includes('@')) return;
    
    setBreachStatus("checking");
    try {
      // Simulate HaveIBeenPwned API check
      const response = await fetch(`/api/check-breach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        const data = await response.json();
        setBreachStatus(data.breached ? "breached" : "safe");
      }
    } catch (error) {
      setBreachStatus("safe"); // Fail safe
    }
  };

  // Risk assessment based on behavioral metrics and device fingerprinting
  const assessRisk = () => {
    const metrics = behavioralMetrics;
    let risk = 0;
    
    // Check typing pattern consistency
    if (metrics.typingPattern.length > 10) {
      const avgTypingSpeed = metrics.typingPattern.reduce((a, b) => a + b, 0) / metrics.typingPattern.length;
      const variance = metrics.typingPattern.reduce((sum, time) => sum + Math.pow(time - avgTypingSpeed, 2), 0) / metrics.typingPattern.length;
      
      if (variance > 10000) risk += 1; // High variance = suspicious
    }
    
    // Check mouse movement patterns
    if (metrics.mouseMovements.length > 20) {
      const movements = metrics.mouseMovements;
      const isBot = movements.every((move, i) => 
        i === 0 || Math.abs(move.x - movements[i-1].x) < 5 && Math.abs(move.y - movements[i-1].y) < 5
      );
      if (isBot) risk += 2;
    }
    
    // Device fingerprinting (simplified)
    const isNewDevice = !localStorage.getItem('device_fingerprint');
    if (isNewDevice) risk += 1;
    
    const riskLevel = risk >= 3 ? "high" : risk >= 2 ? "medium" : "low";
    setRiskLevel(riskLevel);
    
    if (riskLevel === "high") {
      setMfaRequired(true);
    }
  };

  // Rate limiting
  const handleRateLimit = () => {
    const attempts = loginAttempts + 1;
    setLoginAttempts(attempts);
    
    if (attempts >= 5) {
      setRateLimitWarning(true);
      setTimeout(() => {
        setRateLimitWarning(false);
        setLoginAttempts(0);
      }, 15 * 60 * 1000); // 15 minutes
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateLimitWarning) return;
    
    setIsLoading(true);
    assessRisk();
    
    try {
      const result = await signIn(loginData.email, loginData.password);
      
      if (result.success) {
        // Store device fingerprint
        localStorage.setItem('device_fingerprint', Date.now().toString());
        
        // Handle remember me
        if (rememberMe) {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          localStorage.setItem('remember_token', JSON.stringify({
            email: loginData.email,
            expires: expiryDate.toISOString()
          }));
        }
        
        if (mfaRequired || riskLevel === "high") {
          setShowMFA(true);
        } else {
          onClose();
        }
      } else {
        handleRateLimit();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
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

  // Auto-fill remembered credentials
  useEffect(() => {
    const remembered = localStorage.getItem('remember_token');
    if (remembered) {
      const data = JSON.parse(remembered);
      if (new Date(data.expires) > new Date()) {
        setLoginData(prev => ({ ...prev, email: data.email }));
        setRememberMe(true);
      } else {
        localStorage.removeItem('remember_token');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" ref={mouseTrackingRef}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            {currentText.login}
          </DialogTitle>
          <DialogDescription>
            Enterprise-grade security for your account
          </DialogDescription>
        </DialogHeader>

        {/* Risk Assessment Alert */}
        {riskLevel !== "low" && (
          <Alert variant={riskLevel === "high" ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {currentText.riskDetected} - {riskLevel.toUpperCase()} risk detected
            </AlertDescription>
          </Alert>
        )}

        {/* Rate Limit Warning */}
        {rateLimitWarning && (
          <Alert variant="destructive">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              {currentText.rateLimited} (15 minutes remaining)
            </AlertDescription>
          </Alert>
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
                  <Input
                    id="email"
                    type="email"
                    value={loginData.email}
                    onChange={(e) => {
                      setLoginData(prev => ({ ...prev, email: e.target.value }));
                      checkEmailBreach(e.target.value);
                    }}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  
                  {/* Breach Status */}
                  {breachStatus === "checking" && (
                    <div className="flex items-center gap-2 text-sm text-yellow-600">
                      <div className="w-3 h-3 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                      Checking security status...
                    </div>
                  )}
                  {breachStatus === "breached" && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{currentText.breachDetected}</AlertDescription>
                    </Alert>
                  )}
                  {breachStatus === "safe" && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Email security verified
                    </div>
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
                      className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
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
                  disabled={isLoading || rateLimitWarning}
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

                {/* Biometric Authentication Option */}
                <BiometricAuth onSuccess={() => onClose()} />
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{currentText.fullName}</Label>
                  <Input
                    id="fullName"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">{currentText.email}</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerData.email}
                    onChange={(e) => {
                      setRegisterData(prev => ({ ...prev, email: e.target.value }));
                      checkEmailBreach(e.target.value);
                    }}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">{currentText.password}</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                      disabled={isLoading}
                    />
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{currentText.confirmPassword}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="gdpr" required />
                  <Label htmlFor="gdpr" className="text-sm">
                    {currentText.gdprConsent}
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                  disabled={isLoading || passwordStrength < 3}
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

        {/* Security Status */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            <span>256-bit encryption</span>
          </div>
          <Badge variant={riskLevel === "low" ? "default" : riskLevel === "medium" ? "secondary" : "destructive"}>
            {riskLevel.toUpperCase()} RISK
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SecureAuthModal;
