
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles } from "lucide-react";

interface AIChatTriggerProps {
  onOpen: () => void;
}

const AIChatTrigger = ({ onOpen }: AIChatTriggerProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-[10001] pointer-events-auto">
      <Button
        onClick={onOpen}
        className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-purple-500/30 hover:scale-110 transition-all duration-300 transform-gpu will-change-transform border-2 border-white/20 backdrop-blur-sm animate-pulse"
        size="icon"
      >
        <Bot className="h-7 w-7 text-white drop-shadow-lg" />
      </Button>
      <div className="absolute -top-3 -right-3">
        <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white animate-bounce shadow-lg border border-white/30">
          <Sparkles className="h-3 w-3 mr-1" />
          AI
        </Badge>
      </div>
    </div>
  );
};

export default AIChatTrigger;
