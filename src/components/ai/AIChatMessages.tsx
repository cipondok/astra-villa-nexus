
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Bot, LoaderCircle } from "lucide-react";
import { Message } from "./types";
import TypingIndicator from "./TypingIndicator";

interface AIChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

const AIChatMessages = ({ messages, isLoading, messagesEndRef }: AIChatMessagesProps) => {
  return (
    <div className="h-96 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-xs p-3 rounded-lg ${
            msg.role === 'user'
              ? 'bg-blue-500 text-white'
              : 'bg-white/70 text-gray-900'
          }`}>
            {msg.role === 'assistant' && (
              <div className="flex items-center gap-2 mb-1">
                <Bot className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-medium text-purple-600">AI Assistant</span>
              </div>
            )}
            <div className="text-sm whitespace-pre-line">{msg.content}</div>
            {msg.functionCall && (
              <Badge className="mt-2 bg-green-100 text-green-800">
                Action: {msg.functionCall.name}
              </Badge>
            )}
          </div>
        </div>
      ))}

      {isLoading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default AIChatMessages;
