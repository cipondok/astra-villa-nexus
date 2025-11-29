import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const TIPS = [
  { icon: "🎯", text: "Drag the chat button to reposition it anywhere!", category: "Pro Tip" },
  { icon: "🏠", text: "Ask me about property prices in any area", category: "Search" },
  { icon: "🔍", text: "I can help you find properties by your criteria", category: "Discovery" },
  { icon: "📊", text: "Get market insights and investment tips", category: "Analytics" },
  { icon: "🗺️", text: "Ask about neighborhood details & amenities", category: "Location" },
  { icon: "💰", text: "I can calculate mortgage estimates for you", category: "Finance" },
  { icon: "📸", text: "Use image search to find similar properties", category: "AI Feature" },
  { icon: "⌨️", text: "Press Ctrl+K to quickly open chat", category: "Shortcut" },
  { icon: "🔔", text: "Enable notifications for new listings", category: "Alerts" },
  { icon: "📋", text: "I can compare multiple properties for you", category: "Compare" },
  { icon: "🏡", text: "Ask about foreign ownership regulations", category: "Legal" },
  { icon: "📈", text: "Get rental yield estimates instantly", category: "Investment" },
];

interface ChatbotTipsPopupProps {
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const ChatbotTipsPopup = ({ isVisible, onClose, className }: ChatbotTipsPopupProps) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(() => 
    Math.floor(Math.random() * TIPS.length)
  );
  const [isHovered, setIsHovered] = useState(false);

  // Auto-rotate tips every 5 seconds when not hovered
  useEffect(() => {
    if (!isVisible || isHovered) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible, isHovered]);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
  };

  const currentTip = TIPS[currentTipIndex];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10, x: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10, x: 10 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "absolute bottom-full right-0 mb-3 w-72",
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Main card with glassmorphism */}
          <div className="relative group">
            {/* Animated gradient border */}
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50 rounded-2xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
            
            {/* Card content */}
            <div className="relative bg-background/90 backdrop-blur-2xl border border-primary/20 rounded-2xl shadow-2xl shadow-primary/20 overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50" />
              
              {/* Sparkle decorations */}
              <motion.div 
                className="absolute top-2 right-8 text-primary/30"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Sparkles className="w-3 h-3" />
              </motion.div>
              
              <motion.div 
                className="absolute bottom-8 left-3 text-accent/30"
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [360, 180, 0],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Sparkles className="w-2 h-2" />
              </motion.div>

              {/* Header */}
              <div className="relative flex items-center justify-between p-3 border-b border-primary/10">
                <div className="flex items-center gap-2">
                  <motion.div 
                    className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/30"
                    animate={{ 
                      boxShadow: [
                        "0 4px 14px 0 rgba(var(--primary), 0.3)",
                        "0 4px 20px 0 rgba(var(--primary), 0.5)",
                        "0 4px 14px 0 rgba(var(--primary), 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      AI Assistant
                    </span>
                    <span className="text-[8px] text-muted-foreground">
                      Smart Tips
                    </span>
                  </div>
                </div>
                
                <motion.button
                  onClick={onClose}
                  className="w-6 h-6 rounded-full bg-muted/50 hover:bg-destructive/20 flex items-center justify-center transition-all duration-200 group/close"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-3 h-3 text-muted-foreground group-hover/close:text-destructive transition-colors" />
                </motion.button>
              </div>

              {/* Category badge */}
              <div className="relative px-3 pt-2">
                <motion.span
                  key={currentTip.category}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/20"
                >
                  <span className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                  {currentTip.category}
                </motion.span>
              </div>

              {/* Tip content with animation */}
              <div className="relative p-3 pt-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTipIndex}
                    initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-2"
                  >
                    <motion.span 
                      className="text-lg flex-shrink-0"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    >
                      {currentTip.icon}
                    </motion.span>
                    <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                      {currentTip.text}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Footer with navigation */}
              <div className="relative flex items-center justify-between px-3 pb-3">
                {/* Progress dots */}
                <div className="flex items-center gap-1">
                  {TIPS.slice(0, 5).map((_, index) => (
                    <motion.div
                      key={index}
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-300",
                        index === currentTipIndex % 5 
                          ? "bg-primary w-3" 
                          : "bg-muted-foreground/30"
                      )}
                      animate={index === currentTipIndex % 5 ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.5 }}
                    />
                  ))}
                  <span className="text-[9px] text-muted-foreground ml-1">
                    {currentTipIndex + 1}/{TIPS.length}
                  </span>
                </div>
                
                <motion.button
                  onClick={nextTip}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-primary hover:bg-primary/10 transition-all duration-200 group/next"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Next tip
                  <motion.div
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ChevronRight className="w-3 h-3 group-hover/next:text-primary" />
                  </motion.div>
                </motion.button>
              </div>
            </div>

            {/* Chat bubble tail with gradient */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-background/90 border-r border-b border-primary/20 rotate-45 transform origin-center shadow-lg" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotTipsPopup;
