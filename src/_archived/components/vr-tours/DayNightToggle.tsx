import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayNightToggleProps {
  isDayMode: boolean;
  onToggle: () => void;
  className?: string;
}

const DayNightToggle: React.FC<DayNightToggleProps> = ({
  isDayMode,
  onToggle,
  className
}) => {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative flex items-center w-16 h-8 rounded-full p-1 transition-colors duration-300",
        isDayMode
          ? "bg-gradient-to-r from-chart-4 to-chart-4/80"
          : "bg-gradient-to-r from-primary/90 to-primary/70",
        className
      )}
      aria-label={isDayMode ? 'Switch to night mode' : 'Switch to day mode'}
    >
      {/* Sun/Moon icons in background */}
      <div className="absolute inset-0 flex items-center justify-between px-2">
        <Sun className={cn(
          "h-4 w-4 transition-opacity duration-300",
          isDayMode ? "text-gold-primary opacity-100" : "text-gold-primary/30 opacity-50"
        )} />
        <Moon className={cn(
          "h-4 w-4 transition-opacity duration-300",
          isDayMode ? "text-primary-foreground/30 opacity-50" : "text-primary-foreground opacity-100"
        )} />
      </div>

      {/* Sliding knob */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={cn(
          "relative w-6 h-6 rounded-full shadow-lg z-10",
          isDayMode
            ? "bg-gradient-to-br from-gold-primary to-gold-primary/80"
            : "bg-gradient-to-br from-muted to-muted-foreground/30"
        )}
        style={{ marginLeft: isDayMode ? 0 : 'auto' }}
      >
        {/* Knob details */}
        {isDayMode ? (
          // Sun rays
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-1 bg-gold-primary rounded-full"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-10px)`,
                }}
              />
            ))}
          </motion.div>
        ) : (
          // Moon craters
          <>
            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            <div className="absolute bottom-2 left-1.5 w-1 h-1 rounded-full bg-muted-foreground/50" />
          </>
        )}
      </motion.div>

      {/* Stars (night mode only) */}
      {!isDayMode && (
        <div className="absolute inset-0 overflow-hidden rounded-full">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 bg-primary-foreground rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.4,
              }}
              style={{
                left: `${15 + i * 8}%`,
                top: `${20 + (i % 3) * 20}%`,
              }}
            />
          ))}
        </div>
      )}
    </button>
  );
};

export default DayNightToggle;
