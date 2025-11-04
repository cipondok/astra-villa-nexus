import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Keyboard, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Shortcut {
  key: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface KeyboardShortcutIndicatorProps {
  shortcuts: Shortcut[];
  className?: string;
}

export const KeyboardShortcutIndicator = ({ 
  shortcuts, 
  className 
}: KeyboardShortcutIndicatorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenShortcuts, setHasSeenShortcuts] = useState(false);

  useEffect(() => {
    // Check if user has seen the shortcuts before
    const seen = localStorage.getItem('keyboard_shortcuts_seen');
    if (!seen) {
      // Show automatically after 3 seconds for first-time users
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setHasSeenShortcuts(true);
    }
  }, []);

  useEffect(() => {
    // Listen for toggle event
    const handleToggle = () => setIsOpen(prev => !prev);
    window.addEventListener('toggleShortcutsPanel', handleToggle);
    return () => window.removeEventListener('toggleShortcutsPanel', handleToggle);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (!hasSeenShortcuts) {
      localStorage.setItem('keyboard_shortcuts_seen', 'true');
      setHasSeenShortcuts(true);
    }
  };

  return (
    <>
      {/* Help Button - Bottom left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className={cn("fixed bottom-6 left-6 z-[9998]", className)}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full bg-background/95 backdrop-blur-sm shadow-lg border-2 hover:scale-110 transition-transform"
          aria-label="Show keyboard shortcuts"
        >
          <Keyboard className="h-5 w-5" />
        </Button>
        
        {/* Pulsing indicator for new users */}
        {!hasSeenShortcuts && !isOpen && (
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5]
            }}
            transition={{
              repeat: Infinity,
              duration: 2
            }}
            className="absolute inset-0 rounded-full bg-primary/30 -z-10"
          />
        )}
      </motion.div>

      {/* Shortcuts Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 left-6 z-[9999] bg-background/98 backdrop-blur-xl border-2 border-border rounded-2xl shadow-2xl p-5 max-w-xs"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base">Keyboard Shortcuts</h3>
              </div>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Shortcuts List */}
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <motion.div
                  key={shortcut.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {shortcut.icon && (
                      <shortcut.icon className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-foreground">{shortcut.description}</span>
                  </div>
                  <kbd className="px-3 py-1.5 text-sm font-semibold bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-md shadow-sm">
                    {shortcut.key.toUpperCase()}
                  </kbd>
                </motion.div>
              ))}
            </div>

            {/* Footer hint */}
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Press these keys anywhere to quickly access features
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[9997]"
          />
        )}
      </AnimatePresence>
    </>
  );
};
