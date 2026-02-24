
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
import { useTranslation } from "@/i18n/useTranslation";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: "en" | "id" | "zh" | "ja" | "ko";
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
  const { t } = useTranslation();

  const currentText = {
    login: t('authModal.login'),
    register: t('authModal.register'),
    email: t('authModal.email'),
    password: t('authModal.password'),
    confirmPassword: t('authModal.confirmPassword'),
    fullName: t('authModal.fullName'),
    loginBtn: t('authModal.loginBtn'),
    registerBtn: t('authModal.registerBtn'),
    close: t('authModal.close'),
    fillDemo: t('authModal.fillDemo'),
    passwordsDontMatch: t('authModal.passwordsDontMatch'),
    emailRequired: t('authModal.emailRequired'),
    passwordRequired: t('authModal.passwordRequired'),
    nameRequired: t('authModal.nameRequired'),
    invalidEmail: t('authModal.invalidEmail'),
    passwordTooShort: t('authModal.passwordTooShort'),
    alreadyHaveAccount: t('authModal.alreadyHaveAccount'),
    dontHaveAccount: t('authModal.dontHaveAccount'),
    switchToLogin: t('authModal.switchToLogin'),
    switchToRegister: t('authModal.switchToRegister'),
    signingIn: t('authModal.signingIn'),
    creatingAccount: t('authModal.creatingAccount'),
    loginSuccess: t('authModal.loginSuccess'),
    signupSuccess: t('authModal.signupSuccess'),
    loginError: t('authModal.loginError'),
    signupError: t('authModal.signupError'),
    tryAgain: t('authModal.tryAgain'),
  };

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
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-gold-primary bg-clip-text text-transparent">
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
            <Alert className="mb-4 border-chart-1/30 bg-chart-1/5">
              <CheckCircle className="h-4 w-4 text-chart-1" />
              <AlertDescription className="text-chart-1">
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
                    className={errors.email ? "border-destructive" : ""}
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
                      className={errors.password ? "border-destructive pr-10" : "pr-10"}
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
                  className="w-full bg-gradient-to-r from-primary to-chart-3"
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
                    className="text-primary hover:underline"
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
                    className={errors.fullName ? "border-destructive" : ""}
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
                    className={errors.email ? "border-destructive" : ""}
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
                      className={errors.password ? "border-destructive pr-10" : "pr-10"}
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
                      className={errors.confirmPassword ? "border-destructive pr-10" : "pr-10"}
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
                  className="w-full bg-gradient-to-r from-primary to-gold-primary"
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
                    className="text-primary hover:underline"
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
