import React, { memo, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Volume2, VolumeX, Settings } from "lucide-react";
import NotificationBadge from "./NotificationBadge";
import { ChatSession } from "../types/chatTypes";

interface LiveNotificationBarProps {
  sessions: ChatSession[];
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const LiveNotificationBar = memo<LiveNotificationBarProps>(({ 
  sessions, 
  isVisible, 
  onToggleVisibility 
}) => {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('chat-sound-enabled') !== 'false';
  });

  const waitingCount = sessions.filter(s => s.status === 'waiting').length;
  const urgentCount = sessions.filter(s => s.priority === 'urgent').length;
  const highCount = sessions.filter(s => s.priority === 'high').length;

  useEffect(() => {
    localStorage.setItem('chat-sound-enabled', soundEnabled.toString());
  }, [soundEnabled]);

  if (!isVisible && waitingCount === 0) return null;

  return (
    <Card className="fixed top-4 right-4 z-50 p-4 bg-card/95 backdrop-blur-lg border shadow-lg max-w-sm">
      <div className="flex items-center justify-between space-x-3">
        <div className="flex items-center space-x-3">
          <NotificationBadge 
            count={waitingCount} 
            hasUrgent={urgentCount > 0}
            className="flex-shrink-0"
          />
          
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">
              Live Chat Status
            </p>
            <div className="text-xs text-muted-foreground space-y-1">
              {waitingCount > 0 && (
                <div>
                  {waitingCount} waiting
                  {urgentCount > 0 && (
                    <span className="text-destructive font-medium">
                      {' '}({urgentCount} urgent)
                    </span>
                  )}
                  {highCount > 0 && urgentCount === 0 && (
                    <span className="text-orange-500 font-medium">
                      {' '}({highCount} high priority)
                    </span>
                  )}
                </div>
              )}
              {waitingCount === 0 && (
                <div className="text-green-600">All chats handled</div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 w-8 p-0"
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVisibility}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {urgentCount > 0 && (
        <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-destructive">
              Urgent chats require immediate attention!
            </span>
          </div>
        </div>
      )}
    </Card>
  );
});

LiveNotificationBar.displayName = "LiveNotificationBar";

export default LiveNotificationBar;