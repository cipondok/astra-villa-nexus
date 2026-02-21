
import React from "react";
import { Button } from "@/components/ui/button";
import { QuickAction } from "./types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AIChatQuickActionsProps {
  quickActions: QuickAction[];
  onActionClick: (action: string) => void;
}

const AIChatQuickActions = ({ quickActions, onActionClick }: AIChatQuickActionsProps) => {
  return (
    <div className="px-4 py-3 border-t border-border/30 bg-muted/20 backdrop-blur-sm">
      <p className="text-[10px] text-muted-foreground mb-2.5 font-semibold uppercase tracking-widest">Quick Actions</p>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start text-xs h-auto py-2.5 px-3 gap-2.5",
                "bg-background/60 border border-border/40",
                "hover:border-primary/40 hover:bg-primary/5",
                "rounded-xl transition-all duration-200",
                "group"
              )}
              onClick={() => onActionClick(action.action)}
            >
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <action.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-foreground/80 group-hover:text-foreground transition-colors text-left leading-tight">{action.text}</span>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIChatQuickActions;
