
import React from "react";
import { Button } from "@/components/ui/button";
import { QuickAction } from "./types";

interface AIChatQuickActionsProps {
  quickActions: QuickAction[];
  onActionClick: (action: string) => void;
}

const AIChatQuickActions = ({ quickActions, onActionClick }: AIChatQuickActionsProps) => {
  return (
    <div className="p-3 border-t bg-black/5">
      <div className="text-xs text-gray-600 mb-2">Quick actions:</div>
      <div className="flex flex-col gap-1">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            className="justify-start text-xs h-8"
            onClick={() => onActionClick(action.action)}
          >
            <action.icon className="h-3 w-3 mr-2" />
            {action.text}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AIChatQuickActions;
