import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, GripVertical, Mic, MicOff, Phone, Settings, Volume2, VolumeX, MessageSquare } from "lucide-react";

interface DraggableLiveChatStatusProps {
  isOnline?: boolean;
  className?: string;
  onOpenChat?: () => void;
  activeChatCount?: number;
}

const DraggableLiveChatStatus = ({ 
  isOnline = true, 
  className = "", 
  onOpenChat,
  activeChatCount = 0 
}: DraggableLiveChatStatusProps) => {
  const { user } = useAuth();
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

  // Fetch active chat sessions waiting for assignment
  const { data: waitingSessions = [] } = useQuery({
    queryKey: ['waiting-chat-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching waiting sessions:', error);
        return [];
      }
      return data || [];
    },
    refetchInterval: 3000, // Check every 3 seconds
  });

  // Count of sessions assigned to current user
  const { data: mySessions = [] } = useQuery({
    queryKey: ['my-chat-sessions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('live_chat_sessions')
        .select('*')
        .eq('agent_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching my sessions:', error);
        return [];
      }
      return data || [];
    },
    refetchInterval: 3000,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't start dragging if clicking on buttons
    if ((e.target as HTMLElement).closest('button')) return;
    if (!componentRef.current) return;
    
    setIsDragging(true);
    const rect = componentRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Constrain to viewport
    const maxX = window.innerWidth - 200; // component width
    const maxY = window.innerHeight - 50; // component height

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={componentRef}
      className={`fixed z-50 select-none ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }}
    >
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg hover:shadow-xl transition-all duration-200">
        {/* Header with drag handle */}
        <div 
          className="flex items-center gap-2 px-3 py-2 cursor-move"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
          <Badge className={`${isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}>
            <Users className="h-3 w-3 mr-1" />
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          {activeChatCount > 0 && (
            <Badge className="bg-blue-500 text-white text-xs">
              {activeChatCount}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Settings className="h-3 w-3" />
          </Button>
        </div>

        {/* Expanded controls */}
        {isExpanded && (
          <div className="px-3 pb-3 space-y-2 border-t">
            <div className="flex items-center gap-1 pt-2">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="sm"
                className="h-8 px-2"
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? "Unmute Audio" : "Mute Audio"}
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </Button>
              <Button
                variant={isMicMuted ? "destructive" : "secondary"}
                size="sm"
                className="h-8 px-2"
                onClick={() => setIsMicMuted(!isMicMuted)}
                title={isMicMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMicMuted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 h-8"
                onClick={() => setShowChatPanel(true)}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Manage
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              Active: {mySessions.length} | Waiting: {waitingSessions.length}
            </div>
            {waitingSessions.length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded text-xs text-orange-700 dark:text-orange-300 text-center">
                {waitingSessions.length} customer{waitingSessions.length > 1 ? 's' : ''} waiting!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Management Dialog */}
      <Dialog open={showChatPanel} onOpenChange={setShowChatPanel}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Live Chat Management</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {waitingSessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No customers waiting for chat support
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-medium">Waiting Customers ({waitingSessions.length})</h3>
                {waitingSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{session.customer_name || 'Anonymous Customer'}</h4>
                        <p className="text-sm text-muted-foreground">{session.subject || 'General inquiry'}</p>
                        <p className="text-xs text-muted-foreground">
                          Waiting for {Math.floor((new Date().getTime() - new Date(session.created_at).getTime()) / 60000)} minutes
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          Accept Chat
                        </Button>
                        <Button size="sm" variant="outline">
                          Transfer
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {mySessions.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium">My Active Chats ({mySessions.length})</h3>
                {mySessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{session.customer_name || 'Anonymous Customer'}</h4>
                        <p className="text-sm text-muted-foreground">{session.subject || 'General inquiry'}</p>
                        <p className="text-xs text-muted-foreground">
                          Active for {Math.floor((new Date().getTime() - new Date(session.created_at).getTime()) / 60000)} minutes
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="default">
                          Continue Chat
                        </Button>
                        <Button size="sm" variant="outline">
                          End Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DraggableLiveChatStatus;