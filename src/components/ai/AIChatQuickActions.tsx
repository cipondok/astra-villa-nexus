
import React from "react";
import { Button } from "@/components/ui/button";
import { QuickAction } from "./types";

interface AIChatQuickActionsProps {
  quickActions: QuickAction[];
  onActionClick: (action: string) => void;
}

const AIChatQuickActions = ({ quickActions, onActionClick }: AIChatQuickActionsProps) => {
  return (
    <div className="p-3 border-t border-border/40 dark:border-border/30 bg-muted/40 dark:bg-muted/20 backdrop-blur-sm">
      <div className="text-xs text-foreground/70 dark:text-foreground/60 mb-2 font-semibold tracking-wide uppercase">AI Tools & Features:</div>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="justify-start text-xs h-9 px-3 gap-2 bg-card dark:bg-card/80 border border-border/50 dark:border-border/40 hover:border-primary/50 hover:bg-primary/10 dark:hover:bg-primary/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
            onClick={() => onActionClick(action.action)}
          >
            <div className="p-1.5 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30">
              <action.icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-foreground dark:text-foreground/90">{action.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AIChatQuickActions;
