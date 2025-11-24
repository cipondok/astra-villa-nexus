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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Modern Backdrop with Smooth Blur */}
      <div 
        className="absolute inset-0 bg-black/30 dark:bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={handleClose}
      />
      
      {/* Compact Modal with Smooth Animations */}
      <div className="relative w-full max-w-md animate-in slide-in-from-top-4 fade-in zoom-in-95 duration-300 origin-center">
        {/* Modern Glass Card */}
        <div className="bg-white dark:bg-gray-900 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Modern Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ASTRA Villa
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {isLogin ? 'Welcome back!' : 'Join us today'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClose} 
              disabled={isLoading}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200 text-gray-600 dark:text-gray-400"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Compact Content */}
          <div className="px-5 py-4 space-y-4">
            {/* Success State */}
            {isSuccess && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800/50 animate-in fade-in duration-200">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-sm text-green-800 dark:text-green-300">
                  {isLogin ? currentText.loginSuccess : currentText.signupSuccess}
                </AlertDescription>
              </Alert>
            )}

            {/* General Error */}
            {(errors.login || errors.register) && (
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/50 animate-in fade-in duration-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">{errors.login || errors.register}</AlertDescription>
              </Alert>
            )}

            {/* Google Sign In Button */}
            <Button 
              onClick={handleGoogleSignIn}
              disabled={isLoading || isSuccess}
              className="w-full h-11 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm">{currentText.googleLogin}</span>
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              <span className="flex-shrink mx-3 text-xs text-gray-500 dark:text-gray-400">{currentText.orDivider}</span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>

            {/* Modern Toggle Buttons */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrors({}); }}
                disabled={isLoading}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isLogin 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {currentText.login}
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrors({}); }}
                disabled={isLoading}
                className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  !isLogin 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {currentText.register}
              </button>
            </div>

            {/* Login Form */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentText.email}
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={currentText.email}
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    className={`h-11 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className={`h-11 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 pr-11 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl ${
                        errors.password ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-11 w-11 p-0 hover:bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-lg"
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
              <form onSubmit={handleRegister} className="space-y-3 animate-in fade-in duration-200">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentText.fullName}
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder={currentText.fullName}
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={isLoading}
                    className={`h-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl ${
                      errors.fullName ? "border-red-500" : ""
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.fullName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentText.email}
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder={currentText.email}
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    className={`h-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl ${
                      errors.email ? "border-red-500" : ""
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className={`h-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 pr-10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl ${
                        errors.password ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-10 w-10 p-0 hover:bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
                  <Label htmlFor="register-confirm-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                      className={`h-10 bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 pr-10 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 rounded-xl ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-10 w-10 p-0 hover:bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-lg"
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
            <div className="text-center pt-3 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setErrors({}); }}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium"
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
