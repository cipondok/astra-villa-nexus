
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles } from "lucide-react";

interface AIChatTriggerProps {
  onOpen: () => void;
}

const AIChatTrigger = ({ onOpen }: AIChatTriggerProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={onOpen}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:scale-110 transition-all"
        size="icon"
      >
        <Bot className="h-6 w-6 text-white" />
      </Button>
      <div className="absolute -top-2 -right-2">
        <Badge className="bg-green-500 text-white animate-bounce">
          <Sparkles className="h-3 w-3 mr-1" />
          AI
        </Badge>
      </div>
    </div>
  );
};

export default AIChatTrigger;
