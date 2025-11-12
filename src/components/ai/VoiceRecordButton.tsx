import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceRecordButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  recordingDuration: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const VoiceRecordButton: React.FC<VoiceRecordButtonProps> = ({
  isRecording,
  isProcessing,
  recordingDuration,
  onStartRecording,
  onStopRecording,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-1">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-2 h-2 bg-red-500 rounded-full"
              />
              <span className="text-xs text-muted-foreground font-mono">
                {formatDuration(recordingDuration)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="button"
        variant={isRecording ? "destructive" : "ghost"}
        size="icon"
        className={`h-9 w-9 transition-all ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'hover:bg-primary/10'
        }`}
        onClick={isRecording ? onStopRecording : onStartRecording}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-4 w-4" />
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default VoiceRecordButton;
