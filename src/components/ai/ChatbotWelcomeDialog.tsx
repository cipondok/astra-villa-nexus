import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, X, Sparkles, Move, Maximize2, Clock, Volume2 } from "lucide-react";
import { motion } from "framer-motion";

interface ChatbotWelcomeDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ChatbotWelcomeDialog = ({ open, onClose }: ChatbotWelcomeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm p-0 overflow-hidden max-h-[70vh]">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background p-4 pb-5">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6"
          >
            <X className="h-3 w-3" />
          </Button>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex justify-center mb-2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-lg" />
              <div className="relative bg-primary text-primary-foreground p-2.5 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold text-center mb-1"
          >
            Welcome to ASTRA Chat! 👋
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xs text-muted-foreground text-center"
          >
            Your AI-powered property assistant
          </motion.p>
        </div>

        {/* Tips Section */}
        <div className="p-4 space-y-2.5 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2 items-center"
          >
            <div className="bg-primary/10 p-1.5 rounded-md flex-shrink-0">
              <Move className="h-3 w-3 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Drag & Position</span> - Long-press to move
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-2 items-center"
          >
            <div className="bg-accent/50 p-1.5 rounded-md flex-shrink-0">
              <Maximize2 className="h-3 w-3 text-accent-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Mini & Full View</span> - Toggle with resize button
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-2 items-center"
          >
            <div className="bg-secondary/50 p-1.5 rounded-md flex-shrink-0">
              <Clock className="h-3 w-3 text-secondary-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Auto-Collapse</span> - Minimizes after 30s
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-2 items-center p-2 rounded-md bg-primary/10 border border-primary/20"
          >
            <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <kbd className="px-1 py-0.5 text-[10px] bg-muted rounded">Ctrl+K</kbd> open • <kbd className="px-1 py-0.5 text-[10px] bg-muted rounded">Esc</kbd> close
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button onClick={onClose} className="w-full" size="sm">
              Got it! 🚀
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
