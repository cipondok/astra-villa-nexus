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
      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-background p-6 pb-8">
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl" />
              <div className="relative bg-primary text-primary-foreground p-4 rounded-full">
                <Bot className="h-8 w-8" />
              </div>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-center mb-2"
          >
            Welcome to ASTRA Chat! 👋
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm text-muted-foreground text-center"
          >
            Your AI-powered property assistant is here to help
          </motion.p>
        </div>

        {/* Tips Section */}
        <div className="p-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3 items-start"
          >
            <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
              <Move className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Drag & Position</h3>
              <p className="text-xs text-muted-foreground">
                Long-press the header to drag me anywhere on screen. I'll snap to edges automatically!
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3 items-start"
          >
            <div className="bg-accent/50 p-2 rounded-lg flex-shrink-0">
              <Maximize2 className="h-4 w-4 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Mini & Full View</h3>
              <p className="text-xs text-muted-foreground">
                Toggle between compact mini mode (last 3 messages) and full view with the resize button.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3 items-start"
          >
            <div className="bg-secondary/50 p-2 rounded-lg flex-shrink-0">
              <Clock className="h-4 w-4 text-secondary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Auto-Collapse</h3>
              <p className="text-xs text-muted-foreground">
                I'll minimize automatically after 30s of inactivity to stay out of your way (customizable in settings).
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3 items-start"
          >
            <div className="bg-muted p-2 rounded-lg flex-shrink-0">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-1">Sound Notifications</h3>
              <p className="text-xs text-muted-foreground">
                Get audio alerts for new messages and warnings. Customize or mute in settings.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-3 items-start p-3 rounded-lg bg-primary/10 border border-primary/20"
          >
            <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Keyboard Shortcuts</h3>
              <p className="text-xs text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+K</kbd> to open chat • <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Esc</kbd> to close
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button onClick={onClose} className="w-full" size="lg">
              Got it, Let's Chat! 🚀
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-xs text-center text-muted-foreground"
          >
            You can access these tips anytime in the settings menu
          </motion.p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
