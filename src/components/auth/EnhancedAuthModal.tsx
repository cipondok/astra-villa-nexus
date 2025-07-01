
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
    <div className="fixed inset-0 z-[10000] flex items-start justify-end p-4 pt-20">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md animate-in slide-in-from-right-5 duration-300">
        {/* Glassy Card */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/30 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 dark:border-gray-700/30">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                Astra Villa
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {isLogin ? 'Welcome back!' : 'Create your account'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose} 
              disabled={isLoading}
              className="h-8 w-8 p-0 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Success State */}
            {isSuccess && (
              <Alert className="mb-6 border-green-200/50 bg-green-50/50 dark:bg-green-900/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-300">
                  {isLogin ? currentText.loginSuccess : currentText.signupSuccess}
                </AlertDescription>
              </Alert>
            )}

            {/* General Error */}
            {(errors.login || errors.register) && (
              <Alert variant="destructive" className="mb-6 bg-red-50/50 dark:bg-red-900/20 border-red-200/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{errors.login || errors.register}</AlertDescription>
              </Alert>
            )}

            {/* Toggle Buttons */}
            <div className="flex mb-6 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl p-1">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrors({}); }}
                disabled={isLoading}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isLogin 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {currentText.login}
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrors({}); }}
                disabled={isLoading}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  !isLogin 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {currentText.register}
              </button>
            </div>

            {/* Login Form */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium">
                    {currentText.email}
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={currentText.email}
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    className={`bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium">
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
                      className={`bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 pr-10 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                    />
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
                  {errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-medium py-2.5 rounded-lg transition-all duration-200"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {currentText.signingIn}
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
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
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-sm font-medium">
                    {currentText.fullName}
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder={currentText.fullName}
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={isLoading}
                    className={`bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 ${
                      errors.fullName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium">
                    {currentText.email}
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder={currentText.email}
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    className={`bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium">
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
                      className={`bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 pr-10 ${
                        errors.password ? "border-red-500" : ""
                      }`}
                    />
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
                  {errors.password && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password" className="text-sm font-medium">
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
                      className={`bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50 pr-10 ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                    />
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
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-medium py-2.5 rounded-lg transition-all duration-200"
                  disabled={isLoading || isSuccess}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {currentText.creatingAccount}
                    </>
                  ) : isSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {currentText.success}
                    </>
                  ) : (
                    currentText.registerBtn
                  )}
                </Button>
              </form>
            )}

            {/* Switch Form Link */}
            <div className="text-center mt-6 pt-4 border-t border-gray-200/20 dark:border-gray-700/20">
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
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
