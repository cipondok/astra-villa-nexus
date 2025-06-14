
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Mic, MicOff } from "lucide-react";

interface AIChatInputProps {
  message: string;
  setMessage: (value: string) => void;
  onSendMessage: () => void;
  onVoiceInput: () => void;
  isLoading: boolean;
  isListening: boolean;
}

const AIChatInput = ({
  message,
  setMessage,
  onSendMessage,
  onVoiceInput,
  isLoading,
  isListening,
}: AIChatInputProps) => {
  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything about properties..."
          onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={onVoiceInput}
          disabled={isLoading}
          size="icon"
          variant="outline"
          className={isListening ? "bg-red-100 text-red-600" : ""}
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Button
          onClick={onSendMessage}
          disabled={isLoading || !message.trim()}
          size="icon"
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AIChatInput;
