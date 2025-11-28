import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightbulb, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const TIPS = [
  "💡 Drag the chat button to reposition it anywhere!",
  "🏠 Ask me about property prices in any area",
  "🔍 I can help you find properties by your criteria",
  "📊 Get market insights and investment tips",
  "🗺️ Ask about neighborhood details & amenities",
  "💰 I can calculate mortgage estimates for you",
  "📸 Use image search to find similar properties",
  "⌨️ Press Ctrl+K to quickly open chat",
  "🔔 Enable notifications for new listings",
  "📋 I can compare multiple properties for you",
  "🏡 Ask about foreign ownership regulations",
  "📈 Get rental yield estimates instantly",
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={cn(
            "absolute bottom-full right-0 mb-3 w-64",
            className
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Chat bubble with tail */}
          <div className="relative">
            <div className="bg-background/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-lg shadow-primary/10 p-3 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <Lightbulb className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-[10px] font-medium text-primary uppercase tracking-wide">
                    Quick Tip
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>

              {/* Tip content with animation */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTipIndex}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-foreground/90 leading-relaxed"
                >
                  {TIPS[currentTipIndex]}
                </motion.p>
              </AnimatePresence>

              {/* Footer with navigation */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                <span className="text-[9px] text-muted-foreground">
                  {currentTipIndex + 1}/{TIPS.length}
                </span>
                <button
                  onClick={nextTip}
                  className="flex items-center gap-0.5 text-[10px] text-primary hover:text-primary/80 transition-colors"
                >
                  Next tip
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Chat bubble tail */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-background/95 border-r border-b border-primary/20 rotate-45 transform origin-center" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotTipsPopup;
