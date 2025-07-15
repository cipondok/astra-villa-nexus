
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
    <div className="border-t p-3">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything about properties..."
          onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          disabled={isLoading}
          className="flex-1 text-sm bg-white/95 dark:bg-slate-800/95 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm"
        />
        <Button
          onClick={onVoiceInput}
          disabled={isLoading}
          size="icon"
          variant="outline"
          className={`h-8 w-8 ${isListening ? "bg-red-100 text-red-600" : "bg-white/95 dark:bg-slate-800/95 border-slate-200/50 dark:border-slate-700/50"} macos-smooth-click`}
        >
          {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
        </Button>
        <Button
          onClick={onSendMessage}
          disabled={isLoading || !message.trim()}
          size="icon"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-8 w-8 macos-smooth-click"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default AIChatInput;
