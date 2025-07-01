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
  
  const { signIn, signUp } = useAuth();

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
      signupSuccess: "Account created successfully!"
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
      signupSuccess: "Akun berhasil dibuat!"
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
      {/* 90% Transparent Backdrop */}
      <div 
        className="absolute inset-0 bg-black/10 backdrop-blur-[2px]"
        onClick={handleClose}
      />
      
      {/* Compact Modal with Animations */}
      <div className="relative w-full max-w-sm animate-in slide-in-from-right-5 fade-in-0 duration-300 ease-out">
        {/* Ultra Glassy Compact Card */}
        <div className="bg-white/5 dark:bg-gray-900/5 backdrop-blur-2xl border border-white/10 dark:border-gray-700/10 rounded-xl shadow-2xl shadow-black/5 dark:shadow-black/20 overflow-hidden transform transition-all duration-300 hover:scale-[1.02]">
          {/* Compact Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5 dark:border-gray-700/10">
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Astra Villa
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isLogin ? 'Welcome back!' : 'Join us today'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose} 
              disabled={isLoading}
              className="h-6 w-6 p-0 hover:bg-gray-100/20 dark:hover:bg-gray-800/20 rounded-full transition-all duration-200"
            >
              <X className="h-3 w-3" />
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

            {/* Compact Toggle Buttons */}
            <div className="flex bg-gray-100/20 dark:bg-gray-800/20 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrors({}); }}
                disabled={isLoading}
                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all duration-200 ${
                  isLogin 
                    ? 'bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {currentText.login}
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrors({}); }}
                disabled={isLoading}
                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all duration-200 ${
                  !isLogin 
                    ? 'bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {currentText.register}
              </button>
            </div>

            {/* Login Form */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-3 animate-in fade-in-0 duration-200">
                <div className="space-y-1">
                  <Label htmlFor="login-email" className="text-xs font-medium">
                    {currentText.email}
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={currentText.email}
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
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
                  <Label htmlFor="login-password" className="text-xs font-medium">
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

                <Button 
                  type="submit" 
                  className="w-full h-8 bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-medium text-xs rounded-md transition-all duration-200 transform hover:scale-105"
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
