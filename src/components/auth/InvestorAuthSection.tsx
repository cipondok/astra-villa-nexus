import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, AlertTriangle, LogIn, UserPlus, Sparkles, CheckCircle, Rocket, FileText, ArrowRight, Building2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { CreateOrderDialog } from "@/components/orders/CreateOrderDialog";

interface InvestorAuthSectionProps {
  investorType: 'wni' | 'wna';
  className?: string;
}

const InvestorAuthSection = ({ investorType, className }: InvestorAuthSectionProps) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { signIn, isAuthenticated, profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const result = await signIn(email, password);
        
        if (result.error) {
          if (result.error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else if (result.error.message.includes('Email not confirmed')) {
            setError('Please check your email and confirm your account before logging in.');
          } else {
            setError(result.error.message || 'Login failed. Please try again.');
          }
        } else if (result.success) {
          setSuccess('Welcome back! You are now logged in.');
          setEmail("");
          setPassword("");
          setFullName("");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              investor_type: investorType
            },
            emailRedirectTo: `${window.location.origin}/investor/${investorType}`
          }
        });

        if (error) {
          if (error.message.includes('email rate limit exceeded')) {
            setError('Too many signup attempts. Please wait a few minutes before trying again.');
          } else if (error.message.includes('User already registered')) {
            setError('An account with this email already exists. Please try logging in instead.');
          } else {
            setError(error.message || 'Registration failed. Please try again.');
          }
        } else {
          setSuccess('Account created! Please check your email to confirm your account.');
          setEmail("");
          setPassword("");
          setFullName("");
        }
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If already authenticated, show professional welcome with application CTA
  if (isAuthenticated) {
    return (
      <Card className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-white/30 dark:border-white/10 shadow-lg overflow-hidden ${className}`}>
        <CardContent className="p-4 sm:p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Welcome Header */}
            <div className="text-center">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className="mx-auto w-14 h-14 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center mb-3"
              >
                <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
              </motion.div>
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Welcome, {profile?.full_name || 'Investor'}!
              </h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                You're ready to explore {investorType.toUpperCase()} investment opportunities
              </p>
            </div>

            {/* Professional Features Display */}
            <div className="grid grid-cols-2 gap-2">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-medium text-foreground">Premium Properties</span>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="flex items-center gap-2 p-2 bg-accent/5 rounded-lg"
              >
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-accent" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-medium text-foreground">KPR Assistance</span>
              </motion.div>
            </div>

            {/* Start Application CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <CreateOrderDialog>
                <Button 
                  size="sm" 
                  className="w-full h-9 sm:h-10 gap-2 bg-gradient-to-r from-primary via-accent to-primary hover:opacity-90 shadow-lg text-xs sm:text-sm font-semibold"
                >
                  <Rocket className="h-4 w-4" />
                  Start Your Application Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CreateOrderDialog>
              
              <Button 
                size="sm" 
                variant="outline"
                className="w-full h-8 text-[10px] sm:text-xs gap-1.5 border-border/50 hover:bg-muted/50"
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </motion.div>

            <p className="text-[8px] sm:text-[9px] text-center text-muted-foreground">
              Our team will guide you through every step of the process
            </p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-white/30 dark:border-white/10 shadow-lg overflow-hidden ${className}`}>
      <CardHeader className="p-3 sm:p-4 pb-2 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mx-auto mb-2 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20"
        >
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        </motion.div>
        <CardTitle className="text-sm sm:text-base bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-bold">
          {investorType === 'wni' ? 'WNI Overseas' : 'Foreign Investor'} Portal
        </CardTitle>
        <CardDescription className="text-[10px] sm:text-xs">
          {isLogin ? 'Sign in to access exclusive features' : 'Create an account to get started'}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 pt-0 space-y-3">
        {/* Error/Success Alerts */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 py-2">
                <AlertTriangle className="h-3 w-3" />
                <AlertDescription className="text-[10px] sm:text-xs text-red-700 dark:text-red-300">{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 py-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                <AlertDescription className="text-[10px] sm:text-xs text-green-700 dark:text-green-300">{success}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <Tabs value={isLogin ? "signin" : "signup"} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-8 sm:h-9 bg-muted/50 p-0.5 rounded-lg">
            <TabsTrigger 
              value="signin" 
              onClick={() => { setIsLogin(true); setError(null); setSuccess(null); }}
              className="gap-1 sm:gap-2 text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <LogIn className="h-3 w-3" />
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup" 
              onClick={() => { setIsLogin(false); setError(null); setSuccess(null); }}
              className="gap-1 sm:gap-2 text-[10px] sm:text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <UserPlus className="h-3 w-3" />
              Sign Up
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="signin" className="mt-3" asChild>
              <motion.div
                key="signin"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[10px] sm:text-xs text-foreground/80">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-8 sm:h-9 text-xs sm:text-sm bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password" className="text-[10px] sm:text-xs text-foreground/80">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-8 sm:h-9 text-xs sm:text-sm bg-background/50 border-border/50 pr-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-primary to-accent hover:opacity-90" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-3 w-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                    ) : (
                      <>
                        <LogIn className="h-3 w-3 mr-1.5" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            </TabsContent>

            <TabsContent value="signup" className="mt-3" asChild>
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-[10px] sm:text-xs text-foreground/80">Full Name</Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="h-8 sm:h-9 text-xs sm:text-sm bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-email" className="text-[10px] sm:text-xs text-foreground/80">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-8 sm:h-9 text-xs sm:text-sm bg-background/50 border-border/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="signup-password" className="text-[10px] sm:text-xs text-foreground/80">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password (min 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-8 sm:h-9 text-xs sm:text-sm bg-background/50 border-border/50 pr-9"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-primary to-accent hover:opacity-90" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-3 w-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                    ) : (
                      <>
                        <UserPlus className="h-3 w-3 mr-1.5" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        <p className="text-[9px] sm:text-[10px] text-center text-muted-foreground pt-1">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </CardContent>
    </Card>
  );
};

export default InvestorAuthSection;
