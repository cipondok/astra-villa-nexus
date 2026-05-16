import React, { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { Bell, BellRing } from "lucide-react";

interface NotificationBadgeProps {
  count: number;
  hasUrgent?: boolean;
  className?: string;
}

const NotificationBadge = memo<NotificationBadgeProps>(({ 
  count, 
  hasUrgent = false, 
  className = "" 
}) => {
  if (count === 0) return null;

  return (
    <div className={`relative ${className}`}>
      {hasUrgent ? (
        <BellRing className="h-5 w-5 text-destructive animate-pulse" />
      ) : (
        <Bell className="h-5 w-5 text-muted-foreground" />
      )}
      
      <Badge 
        className={`
          absolute -top-2 -right-2 h-5 w-5 p-0 text-xs font-bold
          flex items-center justify-center rounded-full
          ${hasUrgent 
            ? 'bg-destructive text-destructive-foreground border-destructive animate-pulse' 
            : 'bg-primary text-primary-foreground border-primary'
          }
        `}
      >
        {count > 99 ? '99+' : count}
      </Badge>
    </div>
  );
});

NotificationBadge.displayName = "NotificationBadge";

export default NotificationBadge;