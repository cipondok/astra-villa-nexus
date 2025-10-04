
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles } from "lucide-react";

interface AIChatTriggerProps {
  onOpen: () => void;
}

const AIChatTrigger = ({ onOpen }: AIChatTriggerProps) => {
  return (
    <div className="pointer-events-auto relative group">
      <Button
        onClick={onOpen}
        className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-blue-800 hover:from-blue-600 hover:via-purple-700 hover:to-blue-900 shadow-xl hover:shadow-blue-500/40 hover:scale-110 transition-all duration-300 transform-gpu will-change-transform border-2 border-white/30 backdrop-blur-sm macos-smooth-click group-hover:animate-pulse"
        size="icon"
      >
        <Bot className="h-5 w-5 text-white drop-shadow-lg" />
      </Button>
      
      {/* AI Badge */}
      <div className="absolute -top-1 -right-1 z-10">
        <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg border border-white/40 text-[10px] px-1 py-0">
          <Sparkles className="h-2 w-2 mr-0.5" />
          AI
        </Badge>
      </div>
      
      {/* Pulsing ring indicator */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping scale-110"></div>
      
      {/* Always visible glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl scale-150 animate-pulse"></div>
    </div>
  );
};

export default AIChatTrigger;
