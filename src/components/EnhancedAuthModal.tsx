
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";
import LoadingPage from "./LoadingPage";

interface EnhancedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EnhancedAuthModal = ({ isOpen, onClose }: EnhancedAuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authAction, setAuthAction] = useState<'login' | 'register' | null>(null);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  const { signIn, signUp } = useEnhancedAuth();

  // Show loading screen during authentication
  if (isLoading && authAction) {
    const loadingMessage = authAction === 'login' 
      ? "Authenticating your credentials..." 
      : "Creating your account...";
    
    return (
      <LoadingPage 
        message={loadingMessage}
        showConnectionStatus={false}
      />
    );
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!email.includes('@')) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!isLogin && !fullName) {
      newErrors.fullName = "Full name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        setAuthAction('login');
        console.log('Attempting enhanced login for:', email);
        const result = await signIn(email, password);
        if (result.success) {
          console.log('Login successful, closing modal');
          onClose();
          resetForm();
        }
      } else {
        setAuthAction('register');
        console.log('Attempting enhanced sign up for:', email);
        const result = await signUp(email, password, fullName);
        if (result.success) {
          console.log('Sign up successful, closing modal');
          onClose();
          resetForm();
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
      setAuthAction(null);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setErrors({});
    setShowPassword(false);
  };

  const handleTabChange = (value: string) => {
    setIsLogin(value === "signin");
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-samsung-blue" />
            <DialogTitle>Welcome to AstraVilla</DialogTitle>
          </div>
          <DialogDescription>
            {isLogin ? 'Sign in to your account securely' : 'Create a new account to get started'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={isLogin ? "signin" : "signup"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" onClick={() => handleTabChange("signin")}>
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" onClick={() => handleTabChange("signup")}>
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  required
                />
                {errors.email && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.email}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.password}
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-samsung-blue hover:bg-samsung-blue-dark" 
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In Securely"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={errors.fullName ? "border-red-500" : ""}
                  required
                />
                {errors.fullName && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.fullName}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                  required
                />
                {errors.email && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.email}
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
                    required
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.password}
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-samsung-blue hover:bg-samsung-blue-dark" 
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            
            <div className="text-xs text-gray-600 text-center space-y-1">
              <p>New accounts are automatically approved and ready to use</p>
              <p className="flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                Your data is protected with enterprise-grade security
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAuthModal;
