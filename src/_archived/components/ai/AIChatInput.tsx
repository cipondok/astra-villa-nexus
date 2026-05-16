
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import VoiceRecordButton from "./VoiceRecordButton";
import { cn } from "@/lib/utils";

interface AIChatInputProps {
  message: string;
  setMessage: (value: string) => void;
  onSendMessage: () => void;
  onVoiceInput: () => void;
  isLoading: boolean;
  isListening: boolean;
  isRecording?: boolean;
  isProcessingVoice?: boolean;
  recordingDuration?: number;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

const AIChatInput = ({
  message,
  setMessage,
  onSendMessage,
  onVoiceInput,
  isLoading,
  isListening,
  isRecording = false,
  isProcessingVoice = false,
  recordingDuration = 0,
  onStartRecording,
  onStopRecording,
}: AIChatInputProps) => {
  return (
    <div className="border-t border-border/50 p-3 bg-background/50 backdrop-blur-sm">
      <div className="flex gap-2 items-center">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything about properties..."
          onKeyPress={(e) => e.key === 'Enter' && !isRecording && onSendMessage()}
          disabled={isLoading || isRecording}
          className="flex-1 text-sm bg-muted/40 border-border/50 backdrop-blur-sm focus-visible:ring-primary/30 rounded-xl"
        />
        {onStartRecording && onStopRecording && (
          <VoiceRecordButton
            isRecording={isRecording}
            isProcessing={isProcessingVoice}
            recordingDuration={recordingDuration}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
          />
        )}
        <Button
          onClick={onSendMessage}
          disabled={isLoading || !message.trim() || isRecording}
          size="icon"
          className={cn(
            "h-9 w-9 rounded-xl shrink-0",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
            "shadow-md shadow-primary/20 transition-all duration-200",
            "disabled:opacity-40 disabled:shadow-none"
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AIChatInput;
