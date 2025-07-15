
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles } from "lucide-react";

interface AIChatTriggerProps {
  onOpen: () => void;
}

const AIChatTrigger = ({ onOpen }: AIChatTriggerProps) => {
  return (
    <div className="pointer-events-auto">
      <Button
        onClick={onOpen}
        className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-blue-800 hover:from-blue-600 hover:via-purple-700 hover:to-blue-900 shadow-2xl hover:shadow-blue-500/30 hover:scale-110 transition-all duration-300 transform-gpu will-change-transform border-2 border-white/20 backdrop-blur-sm macos-smooth-click"
        size="icon"
      >
        <Bot className="h-5 w-5 text-white drop-shadow-lg" />
      </Button>
      <div className="absolute -top-2 -right-2">
        <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white shadow-lg border border-white/30 text-xs">
          <Sparkles className="h-2.5 w-2.5 mr-1" />
          AI
        </Badge>
      </div>
    </div>
  );
};

export default AIChatTrigger;
