
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
      const body: any = {
        message: userMessage,
        conversationId: sessionId
      };
      if (user?.id) body.userId = user.id;

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body
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
      {/* AI Bot Trigger Button - Always visible with high z-index */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] pointer-events-auto">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-2xl hover:shadow-3xl transition-all duration-200 hover:scale-110"
            size="icon"
            aria-label="Open AI Assistant"
          >
            <Bot className="h-6 w-6 text-white" />
          </Button>
          <div className="absolute -top-2 -right-2 pointer-events-none">
            <Badge className="bg-orange-500 text-white animate-pulse shadow-lg">
              <Sparkles className="h-3 w-3 mr-1" />
              Help
            </Badge>
          </div>
        </div>
      )}

      {/* AI Chat Window - Always visible on active screen */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-96 z-[9999] pointer-events-auto animate-scale-in md:max-w-sm">
          <Card className="shadow-2xl border-2 border-green-200 bg-background h-full md:h-auto md:max-h-[85vh] flex flex-col">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Bot className="h-5 w-5" />
                  Help Assistant
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 transition-colors"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-green-100 mt-1">
                Get instant help and guidance 24/7
              </div>
            </CardHeader>
            <CardContent className="p-0 bg-background flex-1 flex flex-col min-h-0">
              {/* Chat History - Scrollable area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                {chatHistory.length === 0 && (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    <div className="text-center space-y-2">
                      <Bot className="h-12 w-12 mx-auto text-green-600" />
                      <p>How can I help you today?</p>
                    </div>
                  </div>
                )}
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="space-y-3 animate-fade-in">
                    <div className="flex justify-end">
                      <div className="bg-green-500 text-white p-3 rounded-lg rounded-tr-none max-w-[85%] shadow-sm">
                        <p className="text-sm">{chat.message}</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-background border border-border p-3 rounded-lg rounded-tl-none max-w-[85%] shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="h-4 w-4 text-green-600" />
                          <span className="text-xs font-medium text-green-600">AI Assistant</span>
                        </div>
                        <div className="text-sm whitespace-pre-line leading-relaxed">{chat.response}</div>
                      </div>
                    </div>
                  </div>
                ))}
                {aiChatMutation.isPending && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-background border border-border p-3 rounded-lg shadow-sm">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-green-600 animate-pulse" />
                        <span className="text-sm">AI is thinking...</span>
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area - Sticky bottom */}
              <div className="border-t bg-background p-4 sticky bottom-0">
                <div className="flex gap-2 mb-3">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything..."
                    onKeyPress={(e) => e.key === 'Enter' && !aiChatMutation.isPending && handleSendMessage()}
                    disabled={aiChatMutation.isPending}
                    className="flex-1"
                    aria-label="Chat message input"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={aiChatMutation.isPending || !message.trim()}
                    size="icon"
                    className="bg-green-600 hover:bg-green-700 transition-colors shrink-0"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quick Suggestions */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "Show me properties",
                    "Find vendors",
                    "How does this work?"
                  ].map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
                      onClick={() => setMessage(suggestion)}
                      disabled={aiChatMutation.isPending}
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
