import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, GripVertical, Mic, MicOff, Phone, Settings } from "lucide-react";

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
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);

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
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant={isMuted ? "destructive" : "secondary"}
                size="sm"
                className="flex-1 h-8"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-3 w-3 mr-1" /> : <Mic className="h-3 w-3 mr-1" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="flex-1 h-8"
                onClick={onOpenChat}
              >
                <Phone className="h-3 w-3 mr-1" />
                Chat
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              {isOnline ? 'Available for chat' : 'Currently offline'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableLiveChatStatus;