import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Auto-rotate tips every 5 seconds
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={onClose}
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-3 cursor-pointer",
            className
          )}
        >
          <div className="relative">
            <div className="bg-foreground/70 backdrop-blur-sm rounded-xl px-4 py-2.5 whitespace-nowrap">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTipIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-background leading-relaxed"
                >
                  {TIPS[currentTipIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Chat bubble tail pointing down */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-foreground/70 rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotTipsPopup;
