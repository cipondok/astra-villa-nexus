import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { cn } from '@/lib/utils';

interface LoadingProgressPopupProps {
  className?: string;
}

const LoadingProgressPopup = ({ className }: LoadingProgressPopupProps) => {
  const { isLoading, progress, message, showPopup, setShowPopup } = useGlobalLoading();

  return (
    <AnimatePresence>
      {isLoading && showPopup && (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          "fixed bottom-6 right-6 z-[9998] w-80",
          className
        )}
      >
        <div className="bg-background/95 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl shadow-primary/10 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm font-medium text-foreground">Loading</span>
            </div>
            <button
              onClick={() => setShowPopup(false)}
              className="p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Message */}
            <AnimatePresence mode="wait">
              <motion.p
                key={message}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-xs text-muted-foreground mb-3"
              >
                {message}
              </motion.p>
            </AnimatePresence>

            {/* Progress bar */}
            <div className="relative h-2 bg-muted/50 rounded-full overflow-hidden">
              {/* Glow effect */}
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full blur-sm"
                style={{
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
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
                  width: { duration: 0.3, ease: 'easeOut' },
                  backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' }
                }}
              />
              
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, hsl(var(--primary-foreground) / 0.4) 50%, transparent 100%)',
                  width: '30%'
                }}
                animate={{ x: ['-100%', '400%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </div>

            {/* Percentage */}
            <div className="flex items-center justify-end mt-2">
              <motion.span 
                className="text-xs font-bold tabular-nums text-primary"
                animate={{ 
                  textShadow: ['0 0 8px hsl(var(--primary) / 0)', '0 0 8px hsl(var(--primary) / 0.5)', '0 0 8px hsl(var(--primary) / 0)']
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {Math.round(progress)}%
              </motion.span>
            </div>
          </div>

          {/* Loading dots */}
          <div className="flex items-center justify-center gap-1.5 pb-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-primary"
                animate={{
                  y: [0, -4, 0],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: 'easeInOut'
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingProgressPopup;
