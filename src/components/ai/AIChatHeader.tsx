
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";

interface AIChatHeaderProps {
  onClose: () => void;
}

const AIChatHeader = ({ onClose }: AIChatHeaderProps) => {
  return (
    <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-600 to-blue-800 text-white rounded-t-lg">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-white text-base">
          <Bot className="h-4 w-4" />
          Astra Villa AI
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20 h-8 w-8 macos-smooth-click"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="text-xs text-blue-100">
        Your intelligent property assistant
      </div>
    </CardHeader>
  );
};

export default AIChatHeader;
