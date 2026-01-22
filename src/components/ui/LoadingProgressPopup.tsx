import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, X } from 'lucide-react';
import { useGlobalLoading } from '@/hooks/useGlobalLoading';
import { cn } from '@/lib/utils';
import astraLogo from '@/assets/astra-logo.png';

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
            {/* Gradient Top Accent */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500" />
            
            {/* Header with Logo & Brand */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <div className="flex items-center gap-3">
                {/* Logo with Glow Effect */}
                <motion.div
                  className="relative"
                  animate={{ 
                    boxShadow: [
                      '0 0 0px rgba(127, 90, 240, 0)',
                      '0 0 12px rgba(127, 90, 240, 0.4)',
                      '0 0 0px rgba(127, 90, 240, 0)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <img 
                    src={astraLogo} 
                    alt="ASTRA" 
                    className="w-8 h-8 object-contain rounded-lg"
                  />
                  {/* Spinning Ring */}
                  <motion.div
                    className="absolute inset-0 rounded-lg border-2 border-transparent border-t-primary/50"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </motion.div>
                
                {/* Brand Name */}
                <div className="flex flex-col">
                  <motion.h3 
                    className="text-sm font-bold leading-tight"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                      ASTRA
                    </span>
                    <span className="text-foreground ml-1">Villa</span>
                  </motion.h3>
                  <span className="text-[8px] uppercase tracking-[0.15em] text-muted-foreground">
                    Premium Real Estate
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => setShowPopup(false)}
                className="p-1.5 rounded-full hover:bg-muted/80 transition-colors group"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Status Indicator */}
              <div className="flex items-center gap-2 mb-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 className="w-3.5 h-3.5 text-primary" />
                </motion.div>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={message}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-xs text-muted-foreground"
                  >
                    {message}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Progress bar container */}
              <div className="relative h-2.5 bg-muted/50 rounded-full overflow-hidden">
                {/* Glow effect */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full blur-sm"
                  style={{
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #f97316)',
                  }}
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
                
                {/* Progress fill with gradient */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #f97316, #3b82f6)',
                    backgroundSize: '300% 100%'
                  }}
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: `${progress}%`,
                    backgroundPosition: ['0% 50%', '100% 50%']
                  }}
                  transition={{ 
                    width: { duration: 0.3, ease: 'easeOut' },
                    backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' }
                  }}
                />
                
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
                    width: '40%'
                  }}
                  animate={{ x: ['-100%', '350%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Percentage with animated glow */}
              <div className="flex items-center justify-between mt-2.5">
                <div className="flex items-center gap-1">
                  {/* Mini progress dots */}
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-1 rounded-full"
                        style={{
                          background: i === 0 ? '#3b82f6' : i === 1 ? '#8b5cf6' : '#f97316'
                        }}
                        animate={{
                          scale: [0.8, 1.2, 0.8],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.15
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[9px] text-muted-foreground ml-1">Processing</span>
                </div>
                
                <motion.div
                  className="flex items-center gap-1"
                  animate={{ 
                    textShadow: [
                      '0 0 0px rgba(139, 92, 246, 0)',
                      '0 0 8px rgba(139, 92, 246, 0.5)',
                      '0 0 0px rgba(139, 92, 246, 0)'
                    ]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <span className="text-sm font-bold tabular-nums bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
                    {Math.round(progress)}%
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Bottom wave animation */}
            <div className="h-1 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-orange-500/30"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingProgressPopup;
