import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { X, Eye, EyeOff, AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "id";
}

const EnhancedAuthModal = ({ isOpen, onClose, language }: EnhancedAuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ email: "", password: "", fullName: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { signIn, signUp, signInWithGoogle } = useAuth();

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
      orDivider: "or continue with email"
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
      orDivider: "atau lanjutkan dengan email"
    }
  };

  const currentText = text[language];

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateLoginForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!loginData.email) {
      newErrors.email = currentText.emailRequired;
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = currentText.invalidEmail;
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

    if (!registerData.email) {
      newErrors.email = currentText.emailRequired;
    } else if (!validateEmail(registerData.email)) {
      newErrors.email = currentText.invalidEmail;
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
    if (!validateLoginForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await signIn(loginData.email, loginData.password);
      
      if (result.error) {
        console.error('Login error:', result.error);
        let errorMessage = result.error.message || 'Login failed. Please try again.';
        
        if (errorMessage.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        }
        
        setErrors({ login: errorMessage });
        toast.error(errorMessage);
      } else if (result.success) {
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
    if (!validateRegisterForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const result = await signUp(registerData.email, registerData.password, registerData.fullName);
      
      if (result.error) {
        console.error('Register error:', result.error);
        let errorMessage = result.error.message || 'Registration failed. Please try again.';
        
        if (errorMessage.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try logging in instead.';
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
        // OAuth redirect will happen automatically
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

  const resetForms = () => {
    setLoginData({ email: "", password: "" });
    setRegisterData({ email: "", password: "", fullName: "", confirmPassword: "" });
    setErrors({});
    setIsSuccess(false);
    setIsLoading(false);
    setIsLogin(true);
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForms();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-end p-3 pt-16">
      {/* 50% Transparent iPhone-style Backdrop */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/30 to-pink-500/30 backdrop-blur-md"
        onClick={handleClose}
      />
      
      {/* Compact Modal with iPhone Animations */}
      <div className="relative w-full max-w-sm animate-in slide-in-from-right-5 fade-in-0 duration-500 ease-out">
        {/* iPhone-style Glass Card */}
        <div className="bg-white/10 dark:bg-gray-900/10 backdrop-blur-2xl border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-3xl">
          {/* iPhone-style Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 dark:border-gray-700/20 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Astra Villa
              </h2>
              <p className="text-xs text-white/80 dark:text-gray-300">
                {isLogin ? 'Welcome back!' : 'Join us today'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose} 
              disabled={isLoading}
              className="h-8 w-8 p-0 hover:bg-white/20 dark:hover:bg-gray-800/20 rounded-full transition-all duration-200 text-white/80"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Compact Content */}
          <div className="p-4 space-y-4">
            {/* Success State */}
            {isSuccess && (
              <Alert className="border-green-200/30 bg-green-50/20 dark:bg-green-900/10 animate-in fade-in-0 duration-200">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <AlertDescription className="text-xs text-green-800 dark:text-green-300">
                  {isLogin ? currentText.loginSuccess : currentText.signupSuccess}
                </AlertDescription>
              </Alert>
            )}

            {/* General Error */}
            {(errors.login || errors.register) && (
              <Alert variant="destructive" className="bg-red-50/20 dark:bg-red-900/10 border-red-200/30 animate-in fade-in-0 duration-200">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-xs">{errors.login || errors.register}</AlertDescription>
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button 
              onClick={handleGoogleSignIn}
              disabled={isLoading || isSuccess}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-medium text-sm rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {currentText.googleLogin}
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/20"></div>
              <span className="flex-shrink mx-4 text-sm text-white/70">{currentText.orDivider}</span>
              <div className="flex-grow border-t border-white/20"></div>
            </div>

            {/* iPhone-style Toggle Buttons */}
            <div className="flex bg-white/10 dark:bg-gray-800/10 rounded-xl p-1 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrors({}); }}
                disabled={isLoading}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isLogin 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {currentText.login}
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrors({}); }}
                disabled={isLoading}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all duration-300 ${
                  !isLogin 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {currentText.register}
              </button>
            </div>

            {/* Login Form */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-3 animate-in fade-in-0 duration-200">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium text-white/90">
                    {currentText.email}
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={currentText.email}
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    className={`h-10 text-sm bg-white/20 dark:bg-gray-800/20 border-white/30 dark:border-gray-700/30 text-white placeholder:text-white/50 ${
                      errors.email ? "border-red-400/50" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium text-white/90">
                    {currentText.password}
                  </Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={currentText.password}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
                      className={`h-10 text-sm bg-white/20 dark:bg-gray-800/20 border-white/30 dark:border-gray-700/30 pr-10 text-white placeholder:text-white/50 ${
                        errors.password ? "border-red-400/50" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-10 w-10 p-0 hover:bg-transparent text-white/70 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-400">{errors.password}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium text-sm rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      {currentText.signingIn}
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" />
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
              <form onSubmit={handleRegister} className="space-y-3 animate-in fade-in-0 duration-200">
                <div className="space-y-1">
                  <Label htmlFor="register-name" className="text-xs font-medium">
                    {currentText.fullName}
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder={currentText.fullName}
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={isLoading}
                    className={`h-8 text-xs bg-white/20 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/30 ${
                      errors.fullName ? "border-red-500/50" : ""
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-600 dark:text-red-400">{errors.fullName}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="register-email" className="text-xs font-medium">
                    {currentText.email}
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder={currentText.email}
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    className={`h-8 text-xs bg-white/20 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/30 ${
                      errors.email ? "border-red-500/50" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor="register-password" className="text-xs font-medium">
                    {currentText.password}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={currentText.password}
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
                      className={`h-8 text-xs bg-white/20 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/30 pr-8 ${
                        errors.password ? "border-red-500/50" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 dark:text-red-400">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="register-confirm-password" className="text-xs font-medium">
                    {currentText.confirmPassword}
                  </Label>
                  <div className="relative">
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={currentText.confirmPassword}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      disabled={isLoading}
                      className={`h-8 text-xs bg-white/20 dark:bg-gray-800/20 border-gray-200/30 dark:border-gray-700/30 pr-8 ${
                        errors.confirmPassword ? "border-red-500/50" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-8 w-8 p-0 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-8 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-medium text-xs rounded-md transition-all duration-200 transform hover:scale-105"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      {currentText.creatingAccount}
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      {currentText.success}
                    </>
                  ) : (
                    currentText.registerBtn
                  )}
                </Button>
              </form>
            )}

            {/* Switch Form Link */}
            <div className="text-center pt-2 border-t border-gray-200/10 dark:border-gray-700/10">
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                disabled={isLoading}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              >
                {isLogin ? currentText.switchToRegister : currentText.switchToLogin}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedAuthModal;
