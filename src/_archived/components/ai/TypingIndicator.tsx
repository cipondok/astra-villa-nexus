import { motion } from "framer-motion";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface TypingIndicatorProps {
  className?: string;
  status?: string;
  logoUrl?: string;
}

const TypingIndicator = ({ className, status = "AI is thinking", logoUrl }: TypingIndicatorProps) => {
  const dotVariants = {
    initial: { y: 0, opacity: 0.4 },
    animate: { y: -6, opacity: 1 },
  };

  const dotTransition = {
    duration: 0.45,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("flex justify-start", className)}
    >
      <div className="max-w-xs p-3 rounded-2xl rounded-bl-md bg-muted/60 backdrop-blur-sm border border-border/50">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Icons.aiLogo className="h-3.5 w-3.5" logoUrl={logoUrl} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">ASTRA AI</span>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.span 
            className="text-xs text-muted-foreground"
            key={status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {status}
          </motion.span>
          <div className="flex gap-1 ml-0.5">
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
                className="w-1.5 h-1.5 rounded-full bg-primary/70"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;
