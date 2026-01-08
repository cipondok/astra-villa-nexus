import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { X, Eye, EyeOff, AlertTriangle, Loader2, CheckCircle, Phone, Mail, MessageCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { EmailValidationIndicator } from "./EmailValidationIndicator";
import { PasswordStrengthBar } from "./PasswordStrengthBar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "id";
}

const EnhancedAuthModal = ({ isOpen, onClose, language }: EnhancedAuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<"email" | "whatsapp">("email");
  const [loginData, setLoginData] = useState({ email: "", password: "", whatsapp: "" });
  const [registerData, setRegisterData] = useState({ email: "", password: "", fullName: "", confirmPassword: "", whatsapp: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasInteraction, setHasInteraction] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [rememberMe, setRememberMe] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberEmail');
    if (rememberedEmail) {
      setLoginData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const text = {
    en: {
      login: "Sign In",
      register: "Sign Up",
      email: "Email Address",
      password: "Password",
      confirmPassword: "Confirm Password",
      fullName: "Full Name",
      loginBtn: "Sign In",
      registerBtn: "Create Account",
      close: "Close",
      switchToLogin: "Already have an account? Sign in here",
      switchToRegister: "Don't have an account? Sign up here",
      passwordsDontMatch: "Passwords do not match",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      nameRequired: "Full name is required",
      invalidEmail: "Please enter a valid email address",
      passwordTooShort: "Password must be at least 6 characters",
      signingIn: "Signing in...",
      creatingAccount: "Creating account...",
      success: "Success!",
      loginSuccess: "Welcome back!",
      signupSuccess: "Account created successfully!",
      googleLogin: "Continue with Google",
      orDivider: "or continue with email",
      whatsapp: "WhatsApp Number",
      whatsappInvalid: "Enter valid WhatsApp (e.g. +62812xxxx)",
      useEmail: "Email",
      useWhatsapp: "WhatsApp",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      resetPassword: "Reset Password",
      resetDescription: "Enter your email to receive a password reset link.",
      sendResetLink: "Send Reset Link",
      resetSent: "Reset email sent! Check your inbox.",
      passwordWeak: "Password too weak"
    },
    id: {
      login: "Masuk",
      register: "Daftar",
      email: "Alamat Email",
      password: "Kata Sandi",
      confirmPassword: "Konfirmasi Kata Sandi",
      fullName: "Nama Lengkap",
      loginBtn: "Masuk",
      registerBtn: "Buat Akun",
      close: "Tutup",
      switchToLogin: "Sudah punya akun? Masuk di sini",
      switchToRegister: "Belum punya akun? Daftar di sini",
      passwordsDontMatch: "Kata sandi tidak cocok",
      emailRequired: "Email wajib diisi",
      passwordRequired: "Kata sandi wajib diisi",
      nameRequired: "Nama lengkap wajib diisi",
      invalidEmail: "Masukkan alamat email yang valid",
      passwordTooShort: "Kata sandi minimal 6 karakter",
      signingIn: "Sedang masuk...",
      creatingAccount: "Membuat akun...",
      success: "Berhasil!",
      loginSuccess: "Selamat datang kembali!",
      signupSuccess: "Akun berhasil dibuat!",
      googleLogin: "Lanjutkan dengan Google",
      orDivider: "atau lanjutkan dengan email",
      whatsapp: "Nomor WhatsApp",
      whatsappInvalid: "Masukkan WhatsApp valid (cth: +62812xxxx)",
      useEmail: "Email",
      useWhatsapp: "WhatsApp",
      rememberMe: "Ingat saya",
      forgotPassword: "Lupa kata sandi?",
      resetPassword: "Reset Kata Sandi",
      resetDescription: "Masukkan email untuk menerima link reset.",
      sendResetLink: "Kirim Link Reset",
      resetSent: "Email reset terkirim! Cek inbox Anda.",
      passwordWeak: "Kata sandi terlalu lemah"
    }
  };

  const currentText = text[language];

  // Auto-close countdown timer
  useEffect(() => {
    if (!isOpen || hasInteraction || isLoading || isSuccess) return;
    
    setCountdown(5);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    const closeTimer = setTimeout(() => {
      if (closeRef.current) {
        closeRef.current.click();
      }
    }, 5000);
    
    return () => {
      clearInterval(countdownInterval);
      clearTimeout(closeTimer);
    };
  }, [isOpen, hasInteraction, isLoading, isSuccess]);

  // Reset countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasInteraction(false);
      setCountdown(5);
    }
  }, [isOpen]);

  const handleInteraction = () => {
    setHasInteraction(true);
  };

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateWhatsapp = (phone: string): boolean => {
    const phoneRegex = /^(\+?62|0)?8[1-9][0-9]{7,10}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
  };

  const validateLoginForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (authMethod === "email") {
      if (!loginData.email) {
        newErrors.email = currentText.emailRequired;
      } else if (!validateEmail(loginData.email)) {
        newErrors.email = currentText.invalidEmail;
      }
    } else {
      if (!loginData.whatsapp || !validateWhatsapp(loginData.whatsapp)) {
        newErrors.whatsapp = currentText.whatsappInvalid;
      }
    }

    if (!loginData.password) {
      newErrors.password = currentText.passwordRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegisterForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!registerData.fullName.trim()) {
      newErrors.fullName = currentText.nameRequired;
    }

    if (authMethod === "email") {
      if (!registerData.email) {
        newErrors.email = currentText.emailRequired;
      } else if (!validateEmail(registerData.email)) {
        newErrors.email = currentText.invalidEmail;
      }
    } else {
      if (!registerData.whatsapp || !validateWhatsapp(registerData.whatsapp)) {
        newErrors.whatsapp = currentText.whatsappInvalid;
      }
    }

    if (!registerData.password) {
      newErrors.password = currentText.passwordRequired;
    } else if (registerData.password.length < 6) {
      newErrors.password = currentText.passwordTooShort;
    }

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = currentText.passwordsDontMatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    handleInteraction();
    if (!validateLoginForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      // For WhatsApp auth, we'd need to look up the email by phone number
      // For now, use email auth
      const emailToUse = authMethod === "email" ? loginData.email : `${loginData.whatsapp.replace(/[^0-9]/g, '')}@whatsapp.local`;
      const result = await signIn(emailToUse, loginData.password);
      
      if (result.error) {
        console.error('Login error:', result.error);
        let errorMessage = result.error.message || 'Login failed. Please try again.';
        
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid credentials. Please check and try again.';
        }
        
        setErrors({ login: errorMessage });
        toast.error(errorMessage);
      } else if (result.success) {
        // Store remember me preference
        if (rememberMe && authMethod === "email") {
          localStorage.setItem('rememberEmail', loginData.email);
        } else {
          localStorage.removeItem('rememberEmail');
        }
        
        setIsSuccess(true);
        toast.success(currentText.loginSuccess);
        
        setTimeout(() => {
          onClose();
          resetForms();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Login catch error:', error);
      const errorMessage = 'Network error. Please check your connection and try again.';
      setErrors({ login: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    handleInteraction();
    if (!validateRegisterForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      // For WhatsApp registration, create email from phone
      const emailToUse = authMethod === "email" ? registerData.email : `${registerData.whatsapp.replace(/[^0-9]/g, '')}@whatsapp.local`;
      const result = await signUp(emailToUse, registerData.password, registerData.fullName);
      
      if (result.error) {
        console.error('Register error:', result.error);
        let errorMessage = result.error.message || 'Registration failed. Please try again.';
        
        if (errorMessage.includes('User already registered')) {
          errorMessage = 'An account with this already exists. Please try logging in instead.';
        }
        
        setErrors({ register: errorMessage });
        toast.error(errorMessage);
      } else if (result.success) {
        setIsSuccess(true);
        toast.success(currentText.signupSuccess);
        
        setTimeout(() => {
          onClose();
          resetForms();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Register catch error:', error);
      const errorMessage = 'Network error. Please check your connection and try again.';
      setErrors({ register: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    handleInteraction();
    setIsLoading(true);
    setErrors({});

    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        console.error('Google sign in error:', result.error);
        const errorMessage = result.error.message || 'Google sign in failed. Please try again.';
        setErrors({ login: errorMessage });
        toast.error(errorMessage);
        setIsLoading(false);
      } else {
        toast.success('Redirecting to Google...');
      }
    } catch (error: any) {
      console.error('Google sign in catch error:', error);
      const errorMessage = 'Google sign in failed. Please try again.';
      setErrors({ login: errorMessage });
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    handleInteraction();
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(currentText.resetSent);
        setResetDialogOpen(false);
        setResetEmail("");
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred");
    } finally {
      setResetLoading(false);
    }
  };

  const resetForms = () => {
    setLoginData({ email: "", password: "", whatsapp: "" });
    setRegisterData({ email: "", password: "", fullName: "", confirmPassword: "", whatsapp: "" });
    setErrors({});
    setIsSuccess(false);
    setIsLoading(false);
    setIsLogin(true);
    setAuthMethod("email");
    setHasInteraction(false);
    setCountdown(5);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForms();
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={handleInteraction}
      onKeyDown={handleInteraction}
    >
      {/* 60% Transparent Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />
      
      {/* Compact Modal - Smaller Size */}
      <div className="relative w-full max-w-[300px] md:max-w-[340px] animate-in slide-in-from-top-4 fade-in zoom-in-95 duration-300 origin-center">
        {/* Glass Card */}
        <div className="bg-background/95 backdrop-blur-xl border border-border/30 rounded-xl shadow-2xl overflow-hidden">
          {/* Countdown Timer */}
          {!hasInteraction && !isLoading && !isSuccess && countdown > 0 && (
            <div className="absolute left-3 top-3 z-10 flex items-center gap-1">
              <div className="relative h-5 w-5">
                <svg className="h-5 w-5 -rotate-90" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-muted/30"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={62.83}
                    strokeDashoffset={62.83 - (62.83 * countdown) / 5}
                    className="text-primary transition-all duration-1000"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[8px] font-medium text-foreground">
                  {countdown}
                </span>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-gradient-to-r from-primary/10 to-accent/10">
            <div>
              <h2 className="text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ASTRA Villa
              </h2>
              <p className="text-[10px] text-muted-foreground">
                {isLogin ? 'Welcome back!' : 'Join us today'}
              </p>
            </div>
            <Button 
              ref={closeRef}
              variant="ghost" 
              size="sm" 
              onClick={handleClose} 
              disabled={isLoading}
              className="h-6 w-6 p-0 hover:bg-muted rounded-full text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Content */}
          <div className="px-4 py-3 space-y-3">
            {/* Success State */}
            {isSuccess && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800/50 py-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-xs text-green-800 dark:text-green-300">
                  {isLogin ? currentText.loginSuccess : currentText.signupSuccess}
                </AlertDescription>
              </Alert>
            )}

            {/* General Error */}
            {(errors.login || errors.register) && (
              <Alert variant="destructive" className="py-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{errors.login || errors.register}</AlertDescription>
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button 
              onClick={handleGoogleSignIn}
              disabled={isLoading || isSuccess}
              className="w-full h-9 bg-background hover:bg-muted text-foreground border border-border font-medium rounded-lg text-xs flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{currentText.googleLogin}</span>
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink mx-2 text-[10px] text-muted-foreground">{currentText.orDivider}</span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            {/* Auth Method Toggle - Email / WhatsApp */}
            <div className="flex gap-1 p-0.5 bg-muted/50 rounded-lg">
              <Button
                type="button"
                variant={authMethod === "email" ? "default" : "ghost"}
                size="sm"
                className="flex-1 h-7 text-[10px] gap-1"
                onClick={() => { setAuthMethod("email"); handleInteraction(); }}
              >
                <Mail className="h-3 w-3" />
                {currentText.useEmail}
              </Button>
              <Button
                type="button"
                variant={authMethod === "whatsapp" ? "default" : "ghost"}
                size="sm"
                className="flex-1 h-7 text-[10px] gap-1"
                onClick={() => { setAuthMethod("whatsapp"); handleInteraction(); }}
              >
                <MessageCircle className="h-3 w-3" />
                {currentText.useWhatsapp}
              </Button>
            </div>

            {/* Toggle Buttons */}
            <div className="flex bg-muted/50 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrors({}); handleInteraction(); }}
                disabled={isLoading}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all duration-200 ${
                  isLogin 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {currentText.login}
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrors({}); handleInteraction(); }}
                disabled={isLoading}
                className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all duration-200 ${
                  !isLogin 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {currentText.register}
              </button>
            </div>

            {/* Login Form */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-2.5 animate-in fade-in duration-200">
                {/* Email or WhatsApp field */}
                {authMethod === "email" ? (
                  <div className="space-y-1">
                    <Label htmlFor="login-email" className="text-[10px] font-medium text-foreground">
                      {currentText.email}
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder={currentText.email}
                      value={loginData.email}
                      onChange={(e) => { setLoginData(prev => ({ ...prev, email: e.target.value })); handleInteraction(); }}
                      disabled={isLoading}
                      className={`h-8 text-xs bg-background border-border rounded-lg ${errors.email ? "border-destructive" : ""}`}
                    />
                    {errors.email && (
                      <p className="text-[10px] text-destructive">{errors.email}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label htmlFor="login-whatsapp" className="text-[10px] font-medium text-foreground">
                      {currentText.whatsapp}
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-whatsapp"
                        type="tel"
                        placeholder="+62812xxxxxxxx"
                        value={loginData.whatsapp}
                        onChange={(e) => { setLoginData(prev => ({ ...prev, whatsapp: e.target.value })); handleInteraction(); }}
                        disabled={isLoading}
                        className={`h-8 text-xs bg-background border-border rounded-lg pl-8 ${errors.whatsapp ? "border-destructive" : ""}`}
                      />
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    </div>
                    {errors.whatsapp && (
                      <p className="text-[10px] text-destructive">{errors.whatsapp}</p>
                    )}
                  </div>
                )}

                <div className="space-y-1">
                  <Label htmlFor="login-password" className="text-[10px] font-medium text-foreground">
                    {currentText.password}
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={currentText.password}
                      value={loginData.password}
                      onChange={(e) => { setLoginData(prev => ({ ...prev, password: e.target.value })); handleInteraction(); }}
                      disabled={isLoading}
                      className={`h-8 text-xs bg-background border-border pr-8 rounded-lg ${errors.password ? "border-destructive" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent text-muted-foreground"
                      onClick={() => { setShowPassword(!showPassword); handleInteraction(); }}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-[10px] text-destructive">{errors.password}</p>
                  )}
                </div>

                {/* Remember me & Forgot password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Checkbox 
                      id="remember-me" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => { setRememberMe(checked as boolean); handleInteraction(); }}
                      className="h-3 w-3"
                    />
                    <Label htmlFor="remember-me" className="text-[10px] font-normal cursor-pointer text-muted-foreground">
                      {currentText.rememberMe}
                    </Label>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => { setResetDialogOpen(true); handleInteraction(); }}
                    className="text-[10px] text-primary hover:text-primary/80 transition-colors"
                  >
                    {currentText.forgotPassword}
                  </button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg text-xs"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      {currentText.signingIn}
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                      {currentText.success}
                    </>
                  ) : (
                    currentText.loginBtn
                  )}
                </Button>
              </form>
            )}

            {/* Register Form */}
            {!isLogin && (
              <form onSubmit={handleRegister} className="space-y-2.5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <Label htmlFor="register-name" className="text-[10px] font-medium text-foreground">
                    {currentText.fullName}
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder={currentText.fullName}
                    value={registerData.fullName}
                    onChange={(e) => { setRegisterData(prev => ({ ...prev, fullName: e.target.value })); handleInteraction(); }}
                    disabled={isLoading}
                    className={`h-8 text-xs bg-background border-border rounded-lg ${errors.fullName ? "border-destructive" : ""}`}
                  />
                  {errors.fullName && (
                    <p className="text-[10px] text-destructive">{errors.fullName}</p>
                  )}
                </div>
                
                {/* Email or WhatsApp field */}
                {authMethod === "email" ? (
                  <div className="space-y-1">
                    <Label htmlFor="register-email" className="text-[10px] font-medium text-foreground">
                      {currentText.email}
                    </Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder={currentText.email}
                      value={registerData.email}
                      onChange={(e) => { setRegisterData(prev => ({ ...prev, email: e.target.value })); handleInteraction(); }}
                      disabled={isLoading}
                      className={`h-8 text-xs bg-background border-border rounded-lg ${errors.email ? "border-destructive" : ""}`}
                    />
                    <EmailValidationIndicator email={registerData.email} />
                    {errors.email && (
                      <p className="text-[10px] text-destructive">{errors.email}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label htmlFor="register-whatsapp" className="text-[10px] font-medium text-foreground">
                      {currentText.whatsapp}
                    </Label>
                    <div className="relative">
                      <Input
                        id="register-whatsapp"
                        type="tel"
                        placeholder="+62812xxxxxxxx"
                        value={registerData.whatsapp}
                        onChange={(e) => { setRegisterData(prev => ({ ...prev, whatsapp: e.target.value })); handleInteraction(); }}
                        disabled={isLoading}
                        className={`h-8 text-xs bg-background border-border rounded-lg pl-8 ${errors.whatsapp ? "border-destructive" : ""}`}
                      />
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                    </div>
                    {errors.whatsapp && (
                      <p className="text-[10px] text-destructive">{errors.whatsapp}</p>
                    )}
                  </div>
                )}
                
                <div className="space-y-1">
                  <Label htmlFor="register-password" className="text-[10px] font-medium text-foreground">
                    {currentText.password}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={currentText.password}
                      value={registerData.password}
                      onChange={(e) => { setRegisterData(prev => ({ ...prev, password: e.target.value })); handleInteraction(); }}
                      disabled={isLoading}
                      className={`h-8 text-xs bg-background border-border pr-8 rounded-lg ${errors.password ? "border-destructive" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent text-muted-foreground"
                      onClick={() => { setShowPassword(!showPassword); handleInteraction(); }}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <PasswordStrengthBar password={registerData.password} showTips={false} />
                  {errors.password && (
                    <p className="text-[10px] text-destructive">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="register-confirm-password" className="text-[10px] font-medium text-foreground">
                    {currentText.confirmPassword}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={currentText.confirmPassword}
                      value={registerData.confirmPassword}
                      onChange={(e) => { setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value })); handleInteraction(); }}
                      disabled={isLoading}
                      className={`h-8 text-xs bg-background border-border pr-8 rounded-lg ${errors.confirmPassword ? "border-destructive" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent text-muted-foreground"
                      onClick={() => { setShowConfirmPassword(!showConfirmPassword); handleInteraction(); }}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  {registerData.confirmPassword && registerData.password !== registerData.confirmPassword && (
                    <p className="text-[10px] text-destructive">Passwords do not match</p>
                  )}
                  {registerData.confirmPassword && registerData.password === registerData.confirmPassword && registerData.confirmPassword.length > 0 && (
                    <p className="text-[10px] text-green-600">✓ Passwords match</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg text-xs"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      {currentText.creatingAccount}
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                      {currentText.success}
                    </>
                  ) : (
                    currentText.registerBtn
                  )}
                </Button>
              </form>
            )}

            {/* Switch Form Link */}
            <div className="text-center pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setErrors({}); handleInteraction(); }}
                disabled={isLoading}
                className="text-[10px] text-primary hover:text-primary/80 transition-colors font-medium"
              >
                {isLogin ? currentText.switchToRegister : currentText.switchToLogin}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <KeyRound className="h-4 w-4" />
              {currentText.resetPassword}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {currentText.resetDescription}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-3 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="reset-email" className="text-xs">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="h-9 text-sm"
              />
              <EmailValidationIndicator email={resetEmail} />
            </div>
            <Button type="submit" className="w-full h-9" disabled={resetLoading}>
              {resetLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Sending...
                </>
              ) : (
                currentText.sendResetLink
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedAuthModal;
