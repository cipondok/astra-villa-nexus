
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, X } from "lucide-react";

interface AIChatHeaderProps {
  onClose: () => void;
}

const AIChatHeader = ({ onClose }: AIChatHeaderProps) => {
  return (
    <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-white">
          <Bot className="h-5 w-5" />
          Astra Villa AI
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-sm text-purple-100">
        Your intelligent property assistant
      </div>
    </CardHeader>
  );
};

export default AIChatHeader;
