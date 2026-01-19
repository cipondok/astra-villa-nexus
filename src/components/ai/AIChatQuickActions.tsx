
import React from "react";
import { Button } from "@/components/ui/button";
import { QuickAction } from "./types";

interface AIChatQuickActionsProps {
  quickActions: QuickAction[];
  onActionClick: (action: string) => void;
}

const AIChatQuickActions = ({ quickActions, onActionClick }: AIChatQuickActionsProps) => {
  return (
    <div className="p-3 border-t border-primary/20 bg-gradient-to-b from-background/80 to-muted/30 backdrop-blur-sm">
      <div className="text-xs text-muted-foreground mb-2 font-medium">AI Tools & Features:</div>
      <div className="flex flex-wrap gap-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="justify-start text-xs h-9 px-3 gap-2 bg-gradient-to-br from-background/90 to-muted/50 border border-primary/30 hover:border-primary/50 hover:bg-primary/10 rounded-xl shadow-sm hover:shadow-md hover:shadow-primary/10 transition-all duration-300"
            onClick={() => onActionClick(action.action)}
          >
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border border-primary/30">
              <action.icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-foreground/90">{action.text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AIChatQuickActions;
