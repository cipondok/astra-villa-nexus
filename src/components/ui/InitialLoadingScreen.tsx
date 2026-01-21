import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, User, Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import astraLogo from '@/assets/astra-logo.png';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const InitialLoadingScreen = () => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stages = [
      { progress: 15, text: 'Loading assets...' },
      { progress: 35, text: 'Preparing experience...' },
      { progress: 55, text: 'Connecting services...' },
      { progress: 75, text: 'Almost ready...' },
      { progress: 100, text: 'Welcome!' }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setProgress(stages[currentStage].progress);
        setLoadingText(stages[currentStage].text);
        currentStage++;
      } else {
        clearInterval(interval);
      }
    }, 350);

    return () => clearInterval(interval);
  }, []);

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both email and password",
        variant: "destructive"
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) throw error;

      toast({
        title: "Welcome back! 🎉",
        description: "Successfully signed in"
      });
      setShowQuickLogin(false);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.1 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      >
        {/* Animated mesh gradient background */}
        <div className="absolute inset-0 bg-background">
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 30% 20%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
            }}
            animate={{ 
              opacity: [0.5, 0.8, 0.5],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 70% 80%, hsl(var(--accent) / 0.12) 0%, transparent 50%)',
            }}
            animate={{ 
              opacity: [0.6, 0.9, 0.6],
              scale: [1.1, 1, 1.1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, hsl(var(--primary) / 0.08) 0%, transparent 60%)',
            }}
            animate={{ 
              rotate: [0, 360]
            }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />
        </div>

        {/* Animated grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                             linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Floating orbs */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`orb-${i}`}
              className="absolute rounded-full"
              style={{
                width: 100 + i * 40,
                height: 100 + i * 40,
                background: `radial-gradient(circle, hsl(var(--primary) / ${0.08 - i * 0.01}) 0%, transparent 70%)`,
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [0, -30 - i * 5, 0],
                x: [0, 15 + i * 3, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 6 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3
              }}
            />
          ))}
        </div>

        {/* Sparkle particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'easeInOut'
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" className="text-primary/60">
                <path
                  fill="currentColor"
                  d="M6 0L6.9 4.1L11 5L6.9 5.9L6 10L5.1 5.9L1 5L5.1 4.1L6 0Z"
                />
              </svg>
            </motion.div>
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center px-6">
          {/* Logo with advanced rings */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 150, 
              damping: 20,
              duration: 1
            }}
            className="relative mb-10"
          >
            {/* Outermost dashed ring */}
            <motion.div
              className="absolute -inset-8 rounded-full border-2 border-dashed border-primary/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />

            {/* Outer gradient ring */}
            <motion.div
              className="absolute -inset-6 rounded-full"
              style={{
                background: 'conic-gradient(from 0deg, hsl(var(--primary) / 0.3), transparent, hsl(var(--primary) / 0.3))',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />

            {/* Middle ring with glow */}
            <motion.div
              className="absolute -inset-4 rounded-full border border-primary/40"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.4, 0.7, 0.4]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                boxShadow: '0 0 20px hsl(var(--primary) / 0.3)'
              }}
            />

            {/* Inner pulsing glow */}
            <motion.div
              className="absolute -inset-2 rounded-full"
              style={{
                background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
              }}
              animate={{ 
                scale: [0.9, 1.2, 0.9],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            {/* Logo container */}
            <motion.div
              className="relative w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)',
                boxShadow: '0 0 50px hsl(var(--primary) / 0.4), inset 0 0 30px hsl(var(--primary-foreground) / 0.1)'
              }}
              animate={{
                boxShadow: [
                  '0 0 50px hsl(var(--primary) / 0.4), inset 0 0 30px hsl(var(--primary-foreground) / 0.1)',
                  '0 0 70px hsl(var(--primary) / 0.6), inset 0 0 40px hsl(var(--primary-foreground) / 0.15)',
                  '0 0 50px hsl(var(--primary) / 0.4), inset 0 0 30px hsl(var(--primary-foreground) / 0.1)'
                ]
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img 
                src={astraLogo} 
                alt="ASTRA Villa Logo" 
                className="w-16 h-16 object-contain"
              />
            </motion.div>
          </motion.div>

          {/* Brand name with modern gradient */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-center mb-10"
          >
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-3">
              <motion.span
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 50%, hsl(var(--primary)) 100%)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              >
                ASTRA
              </motion.span>
              <span className="text-foreground ml-3">Villa</span>
            </h1>
            <motion.div 
              className="flex items-center justify-center gap-3"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-primary/50" />
              <p className="text-muted-foreground text-xs tracking-[0.4em] uppercase font-medium">
                Premium Real Estate
              </p>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-primary/50" />
            </motion.div>
          </motion.div>

          {/* Quick Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mb-6"
          >
            <AnimatePresence mode="wait">
              {!showQuickLogin ? (
                <motion.button
                  key="login-btn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setShowQuickLogin(true)}
                  className="group flex items-center gap-2 px-5 py-2.5 rounded-full bg-background/50 backdrop-blur-xl border border-primary/30 hover:border-primary/60 transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
                >
                  <LogIn className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Quick Login</span>
                  <motion.div
                    className="ml-1"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-primary" />
                  </motion.div>
                </motion.button>
              ) : (
                <motion.form
                  key="login-form"
                  initial={{ opacity: 0, scale: 0.9, height: 0 }}
                  animate={{ opacity: 1, scale: 1, height: 'auto' }}
                  exit={{ opacity: 0, scale: 0.9, height: 0 }}
                  onSubmit={handleQuickLogin}
                  className="w-80 bg-background/70 backdrop-blur-xl rounded-2xl border border-primary/30 p-4 shadow-2xl shadow-primary/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">Quick Sign In</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuickLogin(false)}
                      className="p-1 rounded-full hover:bg-muted transition-colors"
                    >
                      <span className="text-xs text-muted-foreground">✕</span>
                    </button>
                  </div>

                  {/* Email input */}
                  <div className="relative mb-3">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-muted/50 border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                    />
                  </div>

                  {/* Password input */}
                  <div className="relative mb-4">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl bg-muted/50 border border-border/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {/* Submit button */}
                  <motion.button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isLoggingIn ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <User className="w-4 h-4" />
                        </motion.div>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Progress section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="w-72 md:w-80"
          >
            {/* Progress bar container */}
            <div className="relative h-1 bg-muted/50 rounded-full overflow-hidden backdrop-blur-sm">
              {/* Glow effect behind progress */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full blur-sm"
                style={{
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              
              {/* Progress fill */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
                  backgroundSize: '200% 100%'
                }}
                initial={{ width: '0%' }}
                animate={{ 
                  width: `${progress}%`,
                  backgroundPosition: ['0% 50%', '100% 50%']
                }}
                transition={{ 
                  width: { duration: 0.5, ease: 'easeOut' },
                  backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                }}
              />
              
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary-foreground) / 0.3) 50%, transparent 100%)',
                  width: '30%'
                }}
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Loading text and percentage */}
            <div className="flex items-center justify-between mt-3 text-xs">
              <AnimatePresence mode="wait">
                <motion.span 
                  key={loadingText}
                  className="text-muted-foreground font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  {loadingText}
                </motion.span>
              </AnimatePresence>
              <motion.span 
                className="text-primary font-bold tabular-nums"
                animate={{ 
                  textShadow: ['0 0 10px hsl(var(--primary) / 0)', '0 0 10px hsl(var(--primary) / 0.5)', '0 0 10px hsl(var(--primary) / 0)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {progress}%
              </motion.span>
            </div>
          </motion.div>

          {/* Modern loading indicator */}
          <motion.div 
            className="flex items-center gap-2 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))'
                }}
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InitialLoadingScreen;
