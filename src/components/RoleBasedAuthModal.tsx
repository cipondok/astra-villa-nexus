import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import LoadingPage from "./LoadingPage";
import { Alert, AlertTriangle, AlertDescription } from "@/components/ui/alert";

interface RoleBasedAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoleBasedAuthModal = ({ isOpen, onClose }: RoleBasedAuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authAction, setAuthAction] = useState<'login' | 'register' | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn, signUp } = useAuth();

  // Show loading screen during authentication (simplified)
  if (isLoading && authAction) {
    const loadingMessage = authAction === 'login' 
      ? "Authenticating user..." 
      : "Creating your account...";
    
    return (
      <LoadingPage 
        message={loadingMessage}
        showConnectionStatus={false} // Don't show connection status for auth
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        setAuthAction('login');
        console.log('Attempting login for:', email);
        const result = await signIn(email, password);
        
        if (result.error) {
          console.error('Login error:', result.error);
          if (result.error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (result.error.message.includes('Email not confirmed')) {
            setError('Please check your email and confirm your account before logging in.');
          } else {
            setError(result.error.message || 'Login failed. Please try again.');
          }
        } else if (result.success) {
          console.log('Login successful, closing modal');
          onClose();
          setEmail("");
          setPassword("");
          setFullName("");
        }
      } else {
        setAuthAction('register');
        console.log('Attempting sign up for:', email);
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) {
          console.error('Sign up error:', error);
          if (error.message.includes('email rate limit exceeded')) {
            setError('Too many signup attempts. Please wait a few minutes before trying again.');
          } else if (error.message.includes('User already registered')) {
            setError('An account with this email already exists. Please try logging in instead.');
          } else {
            setError(error.message || 'Registration failed. Please try again.');
          }
        } else {
          console.log('Sign up successful for:', email);
          setError(null);
          onClose();
          setEmail("");
          setPassword("");
          setFullName("");
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      setAuthAction(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Welcome to AstraVilla</DialogTitle>
          <DialogDescription>
            {isLogin ? 'Sign in to your account' : 'Create a new account to get started'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={isLogin ? "signin" : "signup"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin" onClick={() => { setIsLogin(true); setError(null); }}>
              Sign In
            </TabsTrigger>
            <TabsTrigger value="signup" onClick={() => { setIsLogin(false); setError(null); }}>
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
                  required
                />
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
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
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
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            <p className="text-xs text-gray-600 text-center">
              New accounts are automatically approved and ready to use
            </p>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default RoleBasedAuthModal;
