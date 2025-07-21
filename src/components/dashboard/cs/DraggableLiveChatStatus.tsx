import { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Users, GripVertical } from "lucide-react";

interface DraggableLiveChatStatusProps {
  isOnline?: boolean;
  className?: string;
}

const DraggableLiveChatStatus = ({ isOnline = true, className = "" }: DraggableLiveChatStatusProps) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const componentRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
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
      className={`fixed z-50 cursor-move select-none ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: isDragging ? 'scale(1.05)' : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.2s ease-out',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-lg hover:shadow-xl transition-shadow">
        <GripVertical className="h-3 w-3 text-muted-foreground" />
        <Badge className={`${isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'} text-white`}>
          <Users className="h-3 w-3 mr-1" />
          {isOnline ? 'Online' : 'Offline'}
        </Badge>
        <span className="text-xs text-muted-foreground">Live Chat</span>
      </div>
    </div>
  );
};

export default DraggableLiveChatStatus;