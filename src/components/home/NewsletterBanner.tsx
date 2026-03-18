import { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function NewsletterBanner() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    setSubmitted(true);
    toast.success('Welcome! You\'ll receive our next market report.');
  };

  return (
    <div ref={ref} className="w-full py-4 sm:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-4xl mx-auto px-4 sm:px-6"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-chart-4/10 border border-primary/15 p-5 sm:p-8">
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            {/* Icon + text */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="font-playfair text-base sm:text-lg font-bold text-foreground">
                  Market Intelligence Report
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
                Weekly AI insights on price trends, undervalued areas, and emerging investment opportunities.
              </p>
            </div>

            {/* Form */}
            <div className="w-full sm:w-auto shrink-0">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-chart-4 font-medium text-sm"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  <span>You're subscribed!</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 text-sm bg-background/60 border-border/50 min-w-[200px]"
                  />
                  <Button type="submit" className="h-10 px-4 text-xs font-semibold gap-1 shrink-0">
                    Subscribe
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
