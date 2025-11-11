import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { 
  ArrowUp, 
  MessageSquare, 
  Camera, 
  X, 
  Menu,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface FloatingActionMenuProps {
  onScrollToTop: () => void;
  onOpenChat: () => void;
  onImageSearch: () => void;
  showScrollButton: boolean;
  className?: string;
}

export const FloatingActionMenu = ({
  onScrollToTop,
  onOpenChat,
  onImageSearch,
  showScrollButton,
  className
}: FloatingActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    {
      icon: ArrowUp,
      label: "Scroll to Top",
      onClick: () => {
        onScrollToTop();
        setIsOpen(false);
      },
      show: showScrollButton,
      color: "from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700",
      delay: 0
    },
    {
      icon: Camera,
      label: "Image Search",
      onClick: () => {
        onImageSearch();
        setIsOpen(false);
      },
      show: true,
      color: "from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
      delay: 0.05
    }
  ].filter(item => item.show);

  return (
    <div className={cn("fixed bottom-6 left-6 z-[9998]", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
      />
      
      <div className="relative">
        {/* Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 right-0 flex flex-col gap-3 items-end"
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0, x: 20 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    x: 0,
                    transition: { 
                      delay: item.delay,
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0, 
                    x: 20,
                    transition: { delay: (menuItems.length - index - 1) * 0.05 }
                  }}
                  className="flex items-center gap-3"
                >
                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: item.delay + 0.1 }
                    }}
                    exit={{ opacity: 0, x: 10 }}
                    className="bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-lg border border-border text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.div>
                  
                  {/* Button */}
                  <Button
                    onClick={item.onClick}
                    className={cn(
                      "h-12 w-12 rounded-full shadow-2xl transition-all duration-200 border-2 border-white/20",
                      `bg-gradient-to-r ${item.color}`
                    )}
                    size="icon"
                    aria-label={item.label}
                  >
                    <item.icon className="h-5 w-5 text-white" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.div
          animate={{ 
            rotate: isOpen ? 45 : 0,
            scale: isOpen ? 1.1 : 1
          }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "h-16 w-16 rounded-full shadow-2xl transition-all duration-300 border-2 border-white/30",
              isOpen 
                ? "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700" 
                : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
            )}
            size="icon"
            aria-label={isOpen ? "Close menu" : "Open quick actions menu"}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="h-7 w-7 text-white" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Menu className="h-7 w-7 text-white" />
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2,
                      ease: "easeInOut"
                    }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] -z-10"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
