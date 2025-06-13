
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Bot, 
  Send, 
  X, 
  MessageSquare, 
  Lightbulb,
  Sparkles 
} from "lucide-react";

const AIFooterBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{id: string, message: string, response: string, timestamp: Date}>>([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const { user } = useAuth();

  const aiChatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      // Use the new AI assistant function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: userMessage,
          userId: user?.id,
          conversationId: sessionId
        }
      });

      if (error) throw error;
      return data.message;
    },
    onSuccess: (aiResponse) => {
      const newChat = {
        id: Date.now().toString(),
        message,
        response: aiResponse,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, newChat]);
      setMessage("");
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    aiChatMutation.mutate(message);
  };

  useEffect(() => {
    // Show welcome message for new visitors
    const hasSeenWelcome = localStorage.getItem('ai_welcome_shown');
    if (!hasSeenWelcome) {
      setTimeout(() => {
        setIsOpen(true);
        setChatHistory([{
          id: 'welcome',
          message: 'Hi there!',
          response: "👋 Welcome to Astra Villa! I'm your AI assistant powered by advanced AI.\n\nI can help you with:\n🏠 Property recommendations\n🛠️ Vendor services\n🎯 3D property tours\n💡 Real estate advice\n\nHow can I assist you today?",
          timestamp: new Date()
        }]);
        localStorage.setItem('ai_welcome_shown', 'true');
      }, 3000);
    }
  }, []);

  return (
    <>
      {/* AI Bot Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 left-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg"
            size="icon"
          >
            <Bot className="h-6 w-6 text-white" />
          </Button>
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-orange-500 text-white animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              Help
            </Badge>
          </div>
        </div>
      )}

      {/* AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
          <Card className="shadow-2xl border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Bot className="h-5 w-5" />
                  Help Assistant
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-green-100">
                Get instant help and guidance
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Chat History */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-green-500 text-white p-2 rounded-lg max-w-xs">
                        {chat.message}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-2 rounded-lg max-w-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-green-600">Help Assistant</span>
                        </div>
                        <div className="text-sm whitespace-pre-line">{chat.response}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {aiChatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-green-600 animate-pulse" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={aiChatMutation.isPending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={aiChatMutation.isPending || !message.trim()}
                    size="icon"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quick Suggestions */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {[
                    "Show me properties",
                    "Find vendors",
                    "How does this work?"
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AIFooterBot;
