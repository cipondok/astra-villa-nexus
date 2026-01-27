import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Phone, User, ArrowRight, Check, 
  Shield, Users, Sparkles, Eye, EyeOff,
  MessageCircle, Chrome
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Smart Registration Flow
 * Solves: Complex multi-step registration with too many required fields
 * 
 * Technical: One-tap social login, progressive profiling
 * Psychological: Benefits first, progress indicator, trust signals
 * Alternative: WhatsApp OTP, magic link
 */

interface SmartRegistrationFlowProps {
  onComplete: (data: { email?: string; phone?: string; name?: string }) => void;
  onClose?: () => void;
}

const SmartRegistrationFlow: React.FC<SmartRegistrationFlowProps> = ({
  onComplete,
  onClose,
}) => {
  const [step, setStep] = useState<'benefits' | 'method' | 'details' | 'complete'>('benefits');
  const [method, setMethod] = useState<'email' | 'phone' | 'google' | null>(null);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const benefits = [
    { icon: Sparkles, text: "Save your favorite properties" },
    { icon: Shield, text: "Get price drop alerts" },
    { icon: Users, text: "Connect with verified agents" },
  ];

  const handleSocialLogin = async (provider: 'google') => {
    setIsLoading(true);
    // Simulate social login
    await new Promise(r => setTimeout(r, 1000));
    setStep('complete');
    onComplete({ email: 'user@gmail.com' });
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setStep('complete');
    onComplete({ email, phone });
  };

  return (
    <div className="max-w-md mx-auto">
      <AnimatePresence mode="wait">
        {/* Step 1: Show Benefits First (Psychological) */}
        {step === 'benefits' && (
          <motion.div
            key="benefits"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Join 50,000+ Property Seekers
              </h2>
              <p className="text-sm text-muted-foreground">
                Get exclusive access to premium listings
              </p>
            </div>

            {/* Trust & benefit signals */}
            <div className="space-y-3">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Welcome bonus teaser */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="p-4 bg-gradient-to-r from-accent/20 to-accent/10 rounded-xl border border-accent/30"
            >
              <p className="text-sm font-medium text-accent-foreground">
                🎁 Get 100 ASTRA tokens on signup!
              </p>
            </motion.div>

            <Button 
              onClick={() => setStep('method')} 
              className="w-full h-12 active:scale-95"
            >
              Get Started
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <p className="text-xs text-muted-foreground">
              Takes less than 30 seconds
            </p>
          </motion.div>
        )}

        {/* Step 2: Choose Method (Technical - Multiple Options) */}
        {step === 'method' && (
          <motion.div
            key="method"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-foreground">
                Choose your preferred method
              </h2>
              <p className="text-sm text-muted-foreground">
                Quick & secure - just 2 steps
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-8 h-1.5 rounded-full bg-primary" />
              <div className="w-8 h-1.5 rounded-full bg-muted" />
            </div>

            {/* One-tap social login (Technical) */}
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="w-full h-12 justify-start gap-3 active:scale-95"
            >
              <Chrome className="h-5 w-5 text-red-500" />
              <span>Continue with Google</span>
              <span className="ml-auto text-xs text-muted-foreground">Fastest</span>
            </Button>

            {/* WhatsApp OTP (Alternative) */}
            <Button
              variant="outline"
              onClick={() => { setMethod('phone'); setStep('details'); }}
              className="w-full h-12 justify-start gap-3 active:scale-95"
            >
              <MessageCircle className="h-5 w-5 text-green-500" />
              <span>Continue with WhatsApp</span>
              <span className="ml-auto text-xs text-muted-foreground">Popular</span>
            </Button>

            {/* Email option */}
            <Button
              variant="outline"
              onClick={() => { setMethod('email'); setStep('details'); }}
              className="w-full h-12 justify-start gap-3 active:scale-95"
            >
              <Mail className="h-5 w-5 text-blue-500" />
              <span>Continue with Email</span>
            </Button>

            <p className="text-center text-xs text-muted-foreground pt-4">
              🔒 Your data is encrypted and secure
            </p>
          </motion.div>
        )}

        {/* Step 3: Minimal Details (Progressive Profiling) */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-foreground">
                Almost there!
              </h2>
              <p className="text-sm text-muted-foreground">
                Just your {method === 'email' ? 'email' : 'phone number'}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-8 h-1.5 rounded-full bg-primary" />
              <div className="w-8 h-1.5 rounded-full bg-primary" />
            </div>

            {method === 'email' ? (
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-10"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll send a magic link - no password needed! ✨
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    placeholder="+62 812 3456 7890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 pl-10"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We'll send a verification code via WhatsApp 📱
                </p>
              </div>
            )}

            <Button 
              onClick={handleSubmit}
              disabled={isLoading || (method === 'email' ? !email : !phone)}
              className="w-full h-12 active:scale-95"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <>
                  {method === 'email' ? 'Send Magic Link' : 'Send OTP'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>

            <button 
              onClick={() => setStep('method')}
              className="w-full text-sm text-muted-foreground py-2"
            >
              ← Choose different method
            </button>
          </motion.div>
        )}

        {/* Step 4: Success (Psychological - Celebration) */}
        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <Check className="h-10 w-10 text-green-500" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">
                Welcome to ASTRA! 🎉
              </h2>
              <p className="text-sm text-muted-foreground">
                Your account is ready. Let's find your dream property!
              </p>
            </div>

            {/* Reward confirmation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full"
            >
              <Sparkles className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">+100 ASTRA tokens added!</span>
            </motion.div>

            <Button 
              onClick={onClose}
              className="w-full h-12 active:scale-95"
            >
              Start Exploring
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartRegistrationFlow;
