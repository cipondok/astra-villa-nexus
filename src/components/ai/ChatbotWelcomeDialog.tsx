import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Sparkles, Move, Maximize2, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface ChatbotWelcomeDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ChatbotWelcomeDialog = ({ open, onClose }: ChatbotWelcomeDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-sm p-0 overflow-hidden max-h-[70vh] bg-background/95 backdrop-blur-xl border border-primary/40 shadow-2xl shadow-primary/20"
        hideOverlay
      >
        <DialogTitle className="sr-only">Welcome to ASTRA Chat</DialogTitle>
        <DialogDescription className="sr-only">Your AI-powered property assistant tips and features</DialogDescription>
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-primary/30 via-primary/15 to-background/90 p-4 pb-5 border-b border-primary/20">
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex justify-center mb-2"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 rounded-full blur-lg" />
              <div className="relative bg-gradient-to-br from-primary to-accent text-primary-foreground p-2.5 rounded-full border border-primary/50">
                <Bot className="h-5 w-5" />
              </div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg font-bold text-center mb-1 text-foreground"
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
        <div className="p-4 space-y-2.5 overflow-y-auto bg-background/60">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-2 items-center p-2 rounded-lg bg-background/50 border border-primary/20"
          >
            <div className="bg-gradient-to-br from-primary/20 to-accent/20 p-1.5 rounded-md flex-shrink-0 border border-primary/30">
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
            className="flex gap-2 items-center p-2 rounded-lg bg-background/50 border border-primary/20"
          >
            <div className="bg-gradient-to-br from-accent/30 to-primary/20 p-1.5 rounded-md flex-shrink-0 border border-accent/30">
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
            className="flex gap-2 items-center p-2 rounded-lg bg-background/50 border border-primary/20"
          >
            <div className="bg-gradient-to-br from-secondary/50 to-muted/50 p-1.5 rounded-md flex-shrink-0 border border-secondary/30">
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
            className="flex gap-2 items-center p-2.5 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 border border-primary/30"
          >
            <Sparkles className="h-3 w-3 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <kbd className="px-1 py-0.5 text-[10px] bg-background/80 rounded border border-primary/20">Ctrl+K</kbd> open • <kbd className="px-1 py-0.5 text-[10px] bg-background/80 rounded border border-primary/20">Esc</kbd> close
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button onClick={onClose} className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 border border-primary/50" size="sm">
              Got it! 🚀
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
