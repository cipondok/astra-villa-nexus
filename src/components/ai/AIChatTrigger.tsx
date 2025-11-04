
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles } from "lucide-react";

interface AIChatTriggerProps {
  onOpen: () => void;
}

const AIChatTrigger = ({ onOpen }: AIChatTriggerProps) => {
  return (
    <div className="pointer-events-auto relative group animate-bounce">
      <Button
        onClick={onOpen}
        className="h-[80px] w-[80px] md:h-[72px] md:w-[72px] rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-blue-800 hover:from-blue-600 hover:via-purple-700 hover:to-blue-900 shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all duration-300 transform-gpu will-change-transform border-3 border-white/40 backdrop-blur-sm macos-smooth-click group-hover:animate-pulse"
        size="icon"
      >
        <Bot className="h-9 w-9 md:h-8 md:w-8 text-white drop-shadow-lg" />
      </Button>
      
      {/* AI Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg border border-white/40 text-xs px-2 py-0.5 font-bold">
          <Sparkles className="h-3 w-3 mr-0.5" />
          AI
        </Badge>
      </div>
      
      {/* Pulsing ring indicator */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 to-purple-500/30 animate-ping scale-125"></div>
      
      {/* Always visible glow - larger */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl scale-[2] animate-pulse"></div>
    </div>
  );
};

export default AIChatTrigger;
