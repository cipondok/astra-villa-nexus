
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import VoiceRecordButton from "./VoiceRecordButton";

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
    <div className="border-t p-3">
      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask me anything about properties..."
          onKeyPress={(e) => e.key === 'Enter' && !isRecording && onSendMessage()}
          disabled={isLoading || isRecording}
          className="flex-1 text-sm bg-white/95 dark:bg-slate-800/95 border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm"
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
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 h-8 w-8 macos-smooth-click"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default AIChatInput;
