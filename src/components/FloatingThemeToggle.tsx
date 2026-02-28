import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed bottom-6 left-6 z-50 md:bottom-8 md:left-8 w-11 h-11 rounded-full shadow-lg border border-gold-primary/30 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-gold-primary/20 bg-background/80 dark:bg-background/70 group"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className="h-5 w-5 text-gold-primary group-hover:drop-shadow-[0_0_6px_hsl(var(--gold-primary)/0.6)]" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className="h-5 w-5 text-gold-primary group-hover:drop-shadow-[0_0_6px_hsl(var(--gold-primary)/0.6)]" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default FloatingThemeToggle;
