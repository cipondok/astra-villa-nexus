import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

const TIPS = [
  "🏠 Ask me to find villas, apartments, or land in any area",
  "💰 Get instant mortgage & ROI calculations for any listing",
  "📊 Ask for market trends and price comparisons by district",
  "🗺️ I know neighborhood amenities, schools & transport links",
  "🔍 Describe your dream property — I'll match listings for you",
  "📸 Share a property image and I'll find similar ones",
  "🏡 Ask about foreign ownership rules & visa requirements",
  "📈 Get rental yield estimates for investment properties",
  "📋 I can compare multiple properties side by side",
  "🏗️ Ask about upcoming developments & off-plan projects",
  "💡 Need staging or renovation tips? Just ask!",
  "⚖️ I can explain purchase processes & legal requirements",
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

  const nextTip = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
  }, []);

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
              <div className="flex items-center gap-2">
                <div className="flex-1">
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
                </div>
                <button
                  onClick={nextTip}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-primary/10 transition-colors text-primary/60 hover:text-primary"
                  aria-label="Next tip"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              
              {/* Tip counter */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex gap-1">
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
                <span className="text-[10px] text-muted-foreground">
                  {currentTipIndex + 1}/{TIPS.length}
                </span>
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
