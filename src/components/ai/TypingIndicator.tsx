import { motion } from "framer-motion";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
  status?: string;
}

const TypingIndicator = ({ className, status = "AI is thinking" }: TypingIndicatorProps) => {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 },
  };

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        "flex justify-start",
        className
      )}
    >
      <div className="max-w-xs p-3 rounded-lg bg-white/70 dark:bg-gray-800">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="h-4 w-4 text-purple-600" />
          <span className="text-xs font-medium text-purple-600">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <motion.span 
            className="text-sm text-gray-600 dark:text-gray-400"
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {status}
          </motion.span>
          <div className="flex gap-1 ml-1">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{
                  ...dotTransition,
                  delay: index * 0.15,
                }}
                className="w-1.5 h-1.5 rounded-full bg-purple-600"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
