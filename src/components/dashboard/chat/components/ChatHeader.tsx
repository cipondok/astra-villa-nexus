import React, { memo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, User } from "lucide-react";
import { ChatHeaderProps, ChatPriority } from "../types/chatTypes";

const ChatHeader = memo<ChatHeaderProps>(({ 
  session, 
  onClose, 
  onPriorityChange 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      case 'resolved': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const handleClose = useCallback(() => {
    onClose(session.id);
  }, [session.id, onClose]);

  const handlePriorityChange = useCallback((priority: ChatPriority) => {
    onPriorityChange(session.id, priority);
  }, [session.id, onPriorityChange]);

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <h4 className="font-semibold">{session.customer_name}</h4>
              <p className="text-sm text-muted-foreground">
                {session.customer_email || 'No email provided'} 
                {session.subject && ` • ${session.subject}`}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(session.status)} text-white`}>
            {session.status}
          </Badge>
          
          <Select 
            value={session.priority} 
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <Badge className="bg-gray-500 text-white text-xs">Low</Badge>
              </SelectItem>
              <SelectItem value="medium">
                <Badge className="bg-blue-500 text-white text-xs">Medium</Badge>
              </SelectItem>
              <SelectItem value="high">
                <Badge className="bg-orange-500 text-white text-xs">High</Badge>
              </SelectItem>
              <SelectItem value="urgent">
                <Badge className="bg-red-500 text-white text-xs">Urgent</Badge>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {session.status === 'active' && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleClose}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Close Chat
            </Button>
          )}
        </div>
      </div>
    </div>
  );
});

ChatHeader.displayName = "ChatHeader";

export default ChatHeader;