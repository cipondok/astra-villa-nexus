import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex gap-3 justify-start animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm">
        <div className="flex gap-1.5 items-center">
          <span 
            className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-typing-dot"
            style={{ animationDelay: '0ms' }}
          />
          <span 
            className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-typing-dot"
            style={{ animationDelay: '150ms' }}
          />
          <span 
            className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-typing-dot"
            style={{ animationDelay: '300ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
