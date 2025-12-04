
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
    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md glass-popup rounded-2xl border border-primary/20 shadow-2xl shadow-primary/20">
        <div className="flex flex-row items-center justify-between p-4 pb-2 border-b border-border/50">
          <h2 className="text-xl font-bold gradient-text">
            Astra Villa
          </h2>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={isLoading} className="hover:bg-primary/10">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          {error && (
            <Alert variant="destructive" className="mb-4 bg-destructive/10 border-destructive/30">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="text-foreground/80">Email Address</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    required
                    className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password" className="text-foreground/80">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
                      className="pr-10 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/30"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {progressiveDelay > 0 && (
                  <Alert className="mb-4 bg-primary/10 border-primary/30">
                    <Clock className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-foreground/80">
                      Please wait {Math.ceil(progressiveDelay / 1000)} seconds before trying again.
                    </AlertDescription>
                  </Alert>
                )}

                {captchaRequired && !showCaptcha && (
                  <Alert className="mb-4 bg-primary/10 border-primary/30">
                    <Shield className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-foreground/80">
                      Multiple failed attempts detected. CAPTCHA verification required.
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/30"
                  disabled={isLoading || isProcessing || progressiveDelay > 0}
                >
                  {isLoading || isProcessing ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4 mt-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-foreground/80">Full Name</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerData.fullName}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={isLoading}
                    required
                    className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-foreground/80">Email Address</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={isLoading}
                    required
                    className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/30"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-foreground/80">Password</Label>
                  <div className="relative">
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password (min 6 characters)"
                      value={registerData.password}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                      disabled={isLoading}
                      className="pr-10 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/30"
                      minLength={6}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password" className="text-foreground/80">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="register-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      disabled={isLoading}
                      className="pr-10 bg-background/50 border-border/50 focus:border-primary focus:ring-primary/30"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg shadow-primary/30"
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
