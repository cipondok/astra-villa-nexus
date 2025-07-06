import React, { memo, useState, useCallback, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { MessageInputProps } from "../types/chatTypes";

const MessageInput = memo<MessageInputProps>(({ 
  onSend, 
  disabled, 
  placeholder = "Type your message..." 
}) => {
  const [message, setMessage] = useState("");

  const handleSend = useCallback(() => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) return;
    
    onSend(trimmedMessage);
    setMessage("");
  }, [message, onSend, disabled]);

  const handleKeyPress = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
  }, []);

  return (
    <div className="p-4 border-t">
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={message}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className="flex-1"
        />
        <Button 
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

MessageInput.displayName = "MessageInput";

export default MessageInput;