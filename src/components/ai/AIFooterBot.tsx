
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
      // Generate AI response (simple rule-based for now)
      let aiResponse = "";
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('astra') || lowerMessage.includes('token') || lowerMessage.includes('coin')) {
        aiResponse = "🪙 ASTRA Tokens are our platform's digital reward system! You can earn them by:\n\n• Completing your vendor profile (200 ASTRA)\n• Creating services (50 ASTRA each)\n• Completing transactions (2.5% of transaction value)\n• Achieving membership levels (up to 5000 ASTRA)\n\nUse tokens for platform features and unlock exclusive benefits!";
      } else if (lowerMessage.includes('service') || lowerMessage.includes('booking')) {
        aiResponse = "🛠️ To maximize your service success:\n\n• Write detailed descriptions with clear pricing\n• Upload high-quality images\n• Set competitive but fair rates\n• Respond quickly to inquiries\n• Maintain excellent customer service\n\nConsider offering package deals or seasonal promotions to attract more customers!";
      } else if (lowerMessage.includes('profile') || lowerMessage.includes('complete')) {
        aiResponse = "📋 Complete your vendor profile for maximum success:\n\n• Business information & description\n• Contact details & address\n• Professional photos & gallery\n• Service offerings & pricing\n• KYC verification\n\nA complete profile increases customer trust and booking rates by up to 300%!";
      } else if (lowerMessage.includes('customer') || lowerMessage.includes('client')) {
        aiResponse = "👥 Improve customer satisfaction:\n\n• Respond within 2 hours\n• Provide detailed project timelines\n• Send regular progress updates\n• Exceed expectations when possible\n• Follow up after completion\n\nHappy customers lead to 5-star reviews and repeat business!";
      } else if (lowerMessage.includes('pricing') || lowerMessage.includes('price')) {
        aiResponse = "💰 Smart pricing strategies:\n\n• Research competitor rates in your area\n• Consider your experience level\n• Factor in materials and travel time\n• Offer tiered pricing options\n• Provide clear breakdowns\n\nRemember: competitive pricing wins more jobs, but don't undervalue your work!";
      } else {
        aiResponse = "👋 Welcome to our platform! I'm here to help you succeed as a vendor.\n\nI can assist with:\n🎯 Profile optimization tips\n💡 Service improvement ideas\n🪙 ASTRA Token information\n📈 Business growth strategies\n🤝 Customer service best practices\n\nWhat would you like to know more about?";
      }

      // Log the chat
      const { error } = await supabase
        .from('ai_chat_logs')
        .insert([{
          user_id: user?.id,
          user_type: user ? (user.user_metadata?.role || 'customer') : 'guest',
          message: userMessage,
          ai_response: aiResponse,
          session_id: sessionId
        }]);

      if (error) console.error('Error logging chat:', error);

      return aiResponse;
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
          response: "👋 Welcome to our platform! I'm your AI assistant here to help you succeed.\n\nAs a new visitor, here are some quick tips:\n\n🚀 Complete your vendor profile to start earning ASTRA tokens\n💡 Check out our service categories for inspiration\n🎯 Our most successful vendors respond quickly and provide excellent service\n\nHow can I help you get started today?",
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
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
            size="icon"
          >
            <Bot className="h-6 w-6 text-white" />
          </Button>
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-red-500 text-white animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
        </div>
      )}

      {/* AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
          <Card className="shadow-2xl border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Bot className="h-5 w-5" />
                  AI Assistant
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
              <div className="text-sm text-purple-100">
                Get instant help and business tips
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Chat History */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((chat) => (
                  <div key={chat.id} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-blue-500 text-white p-2 rounded-lg max-w-xs">
                        {chat.message}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 p-2 rounded-lg max-w-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-4 w-4 text-purple-600" />
                          <span className="text-xs font-medium text-purple-600">AI Assistant</span>
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
                        <Bot className="h-4 w-4 text-purple-600 animate-pulse" />
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
                    placeholder="Ask me anything about the platform..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={aiChatMutation.isPending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={aiChatMutation.isPending || !message.trim()}
                    size="icon"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quick Suggestions */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {[
                    "How to earn ASTRA tokens?",
                    "Profile tips",
                    "Pricing strategy"
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
