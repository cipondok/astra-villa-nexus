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
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          onClick={onClose}
          className={cn(
            "absolute bottom-full right-0 mb-3 cursor-pointer",
            className
          )}
        >
          <div className="relative">
            {/* Glassy Royal Border Popup */}
            <div className="bg-background/80 backdrop-blur-xl rounded-2xl px-4 py-3 border border-primary/40 shadow-xl shadow-primary/20 min-w-[260px] max-w-[300px]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTipIndex}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-foreground leading-relaxed"
                >
                  {TIPS[currentTipIndex]}
                </motion.p>
              </AnimatePresence>
              
              {/* Tip indicator dots */}
              <div className="flex justify-center gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      currentTipIndex % 3 === i
                        ? "bg-primary w-3"
                        : "bg-primary/30"
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Chat bubble tail pointing down-right toward chatbot */}
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-background/80 border-r border-b border-primary/40 rotate-45" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotTipsPopup;
