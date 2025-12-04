
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useAdvancedAuthSecurity } from "@/hooks/useAdvancedAuthSecurity";
import { X, Eye, EyeOff, Shield, Clock } from "lucide-react";
import CaptchaVerification from "./CaptchaVerification";

interface SimpleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SimpleAuthModal = ({ isOpen, onClose }: SimpleAuthModalProps) => {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ email: "", password: "", fullName: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const { 
    secureLogin, 
    captchaRequired, 
    progressiveDelay, 
    isProcessing,
    setCaptchaRequired 
  } = useAdvancedAuthSecurity();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent, captchaToken?: string) => {
    e.preventDefault();
    setError("");
    
    if (!loginData.email || !loginData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(loginData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await secureLogin(loginData.email, loginData.password, captchaToken);
      
      if (result.requiresCaptcha) {
        setShowCaptcha(true);
        setIsLoading(false);
        return;
      }
      
      if (result.error) {
        console.error("Login error:", result.error);
        if (result.error.message?.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please check your credentials and try again.");
        } else {
          setError(result.error.message || "Login failed. Please try again.");
        }
      } else if (result.success) {
        onClose();
        setLoginData({ email: "", password: "" });
        setError("");
        setShowCaptcha(false);
        setCaptchaRequired(false);
      }
    } catch (err: any) {
      console.error("Login exception:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCaptchaVerify = (token: string) => {
    setShowCaptcha(false);
    handleLogin({ preventDefault: () => {} } as React.FormEvent, token);
  };

  const handleCaptchaCancel = () => {
    setShowCaptcha(false);
    setCaptchaRequired(false);
    setError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!registerData.email || !registerData.password || !registerData.fullName || !registerData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (!validateEmail(registerData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await signUp(registerData.email, registerData.password, registerData.fullName);
      
      if (result.error) {
        console.error("Registration error:", result.error);
        if (result.error.message?.includes("User already registered")) {
          setError("An account with this email already exists. Please try logging in instead.");
        } else {
          setError(result.error.message || "Registration failed. Please try again.");
        }
      } else if (result.success) {
        console.log("Registration successful");
        onClose();
        setRegisterData({ email: "", password: "", fullName: "", confirmPassword: "" });
        setError("");
      }
    } catch (err: any) {
      console.error("Registration exception:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForms = () => {
    setLoginData({ email: "", password: "" });
    setRegisterData({ email: "", password: "", fullName: "", confirmPassword: "" });
    setError("");
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl">
        <div className="flex flex-row items-center justify-between p-4 pb-2 border-b border-gray-200/50 dark:border-white/10">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Astra Villa
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading} className="hover:bg-gray-100 dark:hover:bg-white/10">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
              <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 dark:bg-white/10">
              <TabsTrigger value="login" className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white dark:data-[state=active]:bg-white/20 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    required
                    className="bg-white/70 dark:bg-white/10 border-gray-200/50 dark:border-white/20 focus:border-primary focus:ring-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
                      className="pr-10 bg-white/70 dark:bg-white/10 border-gray-200/50 dark:border-white/20 focus:border-primary focus:ring-primary/30"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-500 dark:text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {progressiveDelay > 0 && (
                  <Alert className="mb-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/30">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-700 dark:text-amber-300">
                      Please wait {Math.ceil(progressiveDelay / 1000)} seconds before trying again.
                    </AlertDescription>
                  </Alert>
                )}

                {captchaRequired && !showCaptcha && (
                  <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/30">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <AlertDescription className="text-blue-700 dark:text-blue-300">
                      Multiple failed attempts detected. CAPTCHA verification required.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg"
                  disabled={isLoading || isProcessing || progressiveDelay > 0}
                >
                  {isLoading || isProcessing ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4 mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-gray-700 dark:text-gray-300">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={isLoading}
                    required
                    className="bg-white/70 dark:bg-white/10 border-gray-200/50 dark:border-white/20 focus:border-primary focus:ring-primary/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    required
                    className="bg-white/70 dark:bg-white/10 border-gray-200/50 dark:border-white/20 focus:border-primary focus:ring-primary/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-gray-700 dark:text-gray-300">Password</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password (min 6 characters)"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
                      className="pr-10 bg-white/70 dark:bg-white/10 border-gray-200/50 dark:border-white/20 focus:border-primary focus:ring-primary/30"
                      minLength={6}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-500 dark:text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password" className="text-gray-700 dark:text-gray-300">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      disabled={isLoading}
                      className="pr-10 bg-white/70 dark:bg-white/10 border-gray-200/50 dark:border-white/20 focus:border-primary focus:ring-primary/30"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-gray-500 dark:text-gray-400"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* CAPTCHA Verification Modal */}
      {showCaptcha && (
        <CaptchaVerification
          onVerify={handleCaptchaVerify}
          onCancel={handleCaptchaCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default SimpleAuthModal;
