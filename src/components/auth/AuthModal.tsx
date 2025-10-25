
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { X, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "id";
}

const AuthModal = ({ isOpen, onClose, language }: AuthModalProps) => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ email: "", password: "", fullName: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [activeTab, setActiveTab] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  
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
      fillDemo: "Fill Demo Data",
      passwordsDontMatch: "Passwords do not match",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      nameRequired: "Full name is required",
      invalidEmail: "Please enter a valid email address",
      passwordTooShort: "Password must be at least 6 characters",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      switchToLogin: "Sign in here",
      switchToRegister: "Sign up here",
      signingIn: "Signing in...",
      creatingAccount: "Creating account...",
      loginSuccess: "Login successful! Redirecting...",
      signupSuccess: "Account created successfully!",
      loginError: "Login failed. Please check your credentials.",
      signupError: "Failed to create account. Please try again.",
      tryAgain: "Try Again"
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
      fillDemo: "Isi Data Demo",
      passwordsDontMatch: "Kata sandi tidak cocok",
      emailRequired: "Email wajib diisi",
      passwordRequired: "Kata sandi wajib diisi",
      nameRequired: "Nama lengkap wajib diisi",
      invalidEmail: "Masukkan alamat email yang valid",
      passwordTooShort: "Kata sandi minimal 6 karakter",
      alreadyHaveAccount: "Sudah punya akun?",
      dontHaveAccount: "Belum punya akun?",
      switchToLogin: "Masuk di sini",
      switchToRegister: "Daftar di sini",
      signingIn: "Sedang masuk...",
      creatingAccount: "Membuat akun...",
      loginSuccess: "Login berhasil! Mengalihkan...",
      signupSuccess: "Akun berhasil dibuat!",
      loginError: "Login gagal. Periksa kredensial Anda.",
      signupError: "Gagal membuat akun. Silakan coba lagi.",
      tryAgain: "Coba Lagi"
    }
  };

  const currentText = text[language];

  const fillDemoData = () => {
    const timestamp = Date.now();
    if (activeTab === "register") {
      setRegisterData({
        fullName: "John Doe",
        email: `demo${timestamp}@example.com`,
        password: "Demo123456",
        confirmPassword: "Demo123456"
      });
    } else {
      setLoginData({
        email: "demo@example.com",
        password: "demo123456"
      });
    }
    setErrors({});
    setAuthSuccess(false);
  };

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

    setAuthLoading(true);
    setErrors({});
    setAuthSuccess(false);

    try {
      const result = await signIn(loginData.email, loginData.password);
      
      if (result.success) {
        setAuthSuccess(true);
        toast.success(currentText.loginSuccess);
        
        // Close modal after short delay to show success state
        setTimeout(() => {
          onClose();
          resetForms();
        }, 1500);
      } else {
        console.error('Login failed:', result.error);
        setErrors({ general: result.error?.message || currentText.loginError });
        toast.error(result.error?.message || currentText.loginError);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setErrors({ general: error.message || currentText.loginError });
      toast.error(error.message || currentText.loginError);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegisterForm()) return;

    setAuthLoading(true);
    setErrors({});
    setAuthSuccess(false);

    try {
      console.log('Attempting signup for:', registerData.email);
      const result = await signUp(registerData.email, registerData.password, registerData.fullName);
      
      if (result.success) {
        console.log('Signup successful');
        setAuthSuccess(true);
        toast.success(currentText.signupSuccess);
        
        // Close modal after short delay to show success state
        setTimeout(() => {
          onClose();
          resetForms();
        }, 1500);
      } else {
        console.error('Signup failed:', result.error);
        setErrors({ general: result.error?.message || currentText.signupError });
        toast.error(result.error?.message || currentText.signupError);
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setErrors({ general: error.message || currentText.signupError });
      toast.error(error.message || currentText.signupError);
    } finally {
      setAuthLoading(false);
    }
  };

  const resetForms = () => {
    setLoginData({ email: "", password: "" });
    setRegisterData({ email: "", password: "", fullName: "", confirmPassword: "" });
    setErrors({});
    setAuthSuccess(false);
    setAuthLoading(false);
  };

  const handleClose = () => {
    if (!authLoading) {
      resetForms();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
            Astra Villa
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClose} 
            disabled={authLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Success State */}
          {authSuccess && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {activeTab === "login" ? currentText.loginSuccess : currentText.signupSuccess}
              </AlertDescription>
            </Alert>
          )}

          {/* General Error */}
          {errors.general && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Demo Data Button */}
          <div className="space-y-3 mb-6">
            <Button 
              variant="outline" 
              onClick={fillDemoData}
              disabled={authLoading}
              className="w-full"
            >
              {currentText.fillDemo}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login" disabled={authLoading}>{currentText.login}</TabsTrigger>
              <TabsTrigger value="register" disabled={authLoading}>{currentText.register}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">{currentText.email}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={currentText.email}
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={authLoading}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.email}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">{currentText.password}</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={currentText.password}
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={authLoading}
                      className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={authLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.password}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                  disabled={authLoading || authSuccess}
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {currentText.signingIn}
                    </>
                  ) : authSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {currentText.loginSuccess}
                    </>
                  ) : (
                    currentText.loginBtn
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {currentText.dontHaveAccount}{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("register")}
                    className="text-blue-600 hover:underline"
                    disabled={authLoading}
                  >
                    {currentText.switchToRegister}
                  </button>
                </p>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">{currentText.fullName}</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder={currentText.fullName}
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={authLoading}
                    className={errors.fullName ? "border-red-500" : ""}
                  />
                  {errors.fullName && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.fullName}</AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email">{currentText.email}</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder={currentText.email}
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={authLoading}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.email}</AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password">{currentText.password}</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={currentText.password}
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={authLoading}
                      className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={authLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.password && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.password}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">{currentText.confirmPassword}</Label>
                  <div className="relative">
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={currentText.confirmPassword}
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      disabled={authLoading}
                      className={errors.confirmPassword ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={authLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.confirmPassword}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-orange-500"
                  disabled={authLoading || authSuccess}
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {currentText.creatingAccount}
                    </>
                  ) : authSuccess ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {currentText.signupSuccess}
                    </>
                  ) : (
                    currentText.registerBtn
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {currentText.alreadyHaveAccount}{" "}
                  <button
                    type="button"
                    onClick={() => setActiveTab("login")}
                    className="text-blue-600 hover:underline"
                    disabled={authLoading}
                  >
                    {currentText.switchToLogin}
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthModal;
