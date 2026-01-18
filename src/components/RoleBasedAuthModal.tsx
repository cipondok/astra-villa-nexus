import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, AlertTriangle, LogIn, UserPlus, Sparkles } from "lucide-react";
import LoadingPage from "./LoadingPage";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isContentVisible, setIsContentVisible] = useState(false);
  
  const { signIn, signUp } = useAuth();

  // Animate content when modal opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsContentVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsContentVisible(false);
    }
  }, [isOpen]);

  if (isLoading && authAction) {
    const loadingMessage = authAction === 'login' 
      ? "Authenticating user..." 
      : "Creating your account...";
    
    return (
      <LoadingPage 
        message={loadingMessage}
        showConnectionStatus={false}
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
          onClose();
          setEmail("");
          setPassword("");
          setFullName("");
        }
      } else {
        setAuthAction('register');
        
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: {
        duration: 0.15,
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 260,
        damping: 20,
        delay: 0.2,
      },
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[420px] bg-white/98 dark:bg-neutral-900/98 backdrop-blur-2xl border-white/30 dark:border-white/10 shadow-2xl overflow-hidden"
        autoClose={false}
      >
        <AnimatePresence mode="wait">
          {isContentVisible && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              {/* Animated Header with Icon */}
              <motion.div variants={itemVariants}>
                <DialogHeader className="text-center pb-2">
                  <motion.div 
                    variants={iconVariants}
                    className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    >
                      <Sparkles className="h-7 w-7 text-primary" />
                    </motion.div>
                  </motion.div>
                  <DialogTitle className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent text-xl font-bold">
                    Welcome to AstraVilla
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {isLogin ? 'Sign in to your account' : 'Create a new account to get started'}
                  </DialogDescription>
                </DialogHeader>
              </motion.div>

              {/* Error Alert with Animation */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-700 dark:text-red-300">{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tabs with Animation */}
              <motion.div variants={itemVariants}>
                <Tabs value={isLogin ? "signin" : "signup"} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-muted/50 dark:bg-white/5 p-1 rounded-lg">
                    <TabsTrigger 
                      value="signin" 
                      onClick={() => { setIsLogin(true); setError(null); }}
                      className="gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup" 
                      onClick={() => { setIsLogin(false); setError(null); }}
                      className="gap-2 data-[state=active]:bg-background dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm transition-all duration-200"
                    >
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </TabsTrigger>
                  </TabsList>

                  <AnimatePresence mode="wait">
                    <TabsContent value="signin" className="space-y-4 mt-4" asChild>
                      <motion.div
                        key="signin"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Label htmlFor="email" className="text-foreground/80">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                            />
                          </motion.div>
                          <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                          >
                            <Label htmlFor="password" className="text-foreground/80">Password</Label>
                            <div className="relative">
                              <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Button 
                              type="submit" 
                              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                                />
                              ) : (
                                <>
                                  <LogIn className="h-4 w-4 mr-2" />
                                  Sign In
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </form>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4 mt-4" asChild>
                      <motion.div
                        key="signup"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <Label htmlFor="fullName" className="text-foreground/80">Full Name</Label>
                            <Input
                              id="fullName"
                              type="text"
                              placeholder="Enter your full name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                            />
                          </motion.div>
                          <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                          >
                            <Label htmlFor="signup-email" className="text-foreground/80">Email</Label>
                            <Input
                              id="signup-email"
                              type="email"
                              placeholder="Enter your email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                            />
                          </motion.div>
                          <motion.div 
                            className="space-y-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Label htmlFor="signup-password" className="text-foreground/80">Password</Label>
                            <div className="relative">
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password (min 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </motion.div>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                          >
                            <Button 
                              type="submit" 
                              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                                />
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Create Account
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </form>
                        <motion.p 
                          className="text-xs text-muted-foreground text-center"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          New accounts are automatically approved and ready to use
                        </motion.p>
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </Tabs>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default RoleBasedAuthModal;
