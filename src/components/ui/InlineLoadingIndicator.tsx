import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import astraLogo from '@/assets/astra-logo.png';

interface InlineLoadingIndicatorProps {
  message?: string;
  showLogo?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
}

const InlineLoadingIndicator = ({ 
  message = 'Loading...', 
  showLogo = true,
  size = 'md',
  className,
  fullScreen = false
}: InlineLoadingIndicatorProps) => {
  const sizeClasses = {
    sm: { logo: 'w-8 h-8', text: 'text-sm', dots: 'w-1.5 h-1.5', gap: 'gap-3' },
    md: { logo: 'w-12 h-12', text: 'text-base', dots: 'w-2 h-2', gap: 'gap-4' },
    lg: { logo: 'w-16 h-16', text: 'text-lg', dots: 'w-2.5 h-2.5', gap: 'gap-5' }
  };

  const s = sizeClasses[size];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center",
      fullScreen ? "min-h-screen bg-background" : "py-12",
      s.gap,
      className
    )}>
      {/* Logo with animated ring */}
      {showLogo && (
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <img 
            src={astraLogo} 
            alt="ASTRA Villa" 
            className={cn(s.logo, "object-contain rounded-xl")}
          />
          {/* Spinning ring */}
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-transparent border-t-primary/60 border-r-accent/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{ 
              boxShadow: [
                '0 0 0px rgba(127, 90, 240, 0)',
                '0 0 20px rgba(127, 90, 240, 0.3)',
                '0 0 0px rgba(127, 90, 240, 0)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}

      {/* Brand Name */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className={cn("font-bold", s.text)}>
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
            ASTRA
          </span>
          <span className="text-foreground ml-1.5">Villa</span>
        </h2>
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
          Premium Real Estate
        </p>
      </motion.div>

      {/* Animated dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className={cn(s.dots, "rounded-full")}
            style={{
              background: i % 3 === 0 ? '#3b82f6' : i % 3 === 1 ? '#8b5cf6' : '#f97316'
            }}
            animate={{
              y: [0, -6, 0],
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* Message */}
      <motion.div 
        className="flex items-center gap-2 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        <span className="text-xs">{message}</span>
      </motion.div>
    </div>
  );
};

export default InlineLoadingIndicator;
