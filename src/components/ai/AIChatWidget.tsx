import { useState, useRef, useEffect } from "react";
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
  Mic,
  MicOff,
  MessageSquare,
  Sparkles,
  Home,
  Users,
  MapPin,
  LoaderCircle
} from "lucide-react";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  functionCall?: any;
}

interface AIChatWidgetProps {
  propertyId?: string;
  onTourControl?: (action: string, target: string) => void;
}

const AIChatWidget = ({ propertyId, onTourControl }: AIChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hi! I'm your Astra Villa AI assistant. I can help you with:

🏠 Property recommendations and details
🛠️ Vendor service bookings  
🎯 3D property tour guidance
💡 Real estate advice

${propertyId ? "I see you're viewing a property. Feel free to ask me anything about it!" : "How can I assist you today?"}`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, propertyId]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: message,
          userId: user?.id,
          propertyId,
          conversationId
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        functionCall: data.functionCall
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId);
      }

      // Handle function calls
      if (data.functionCall?.name === 'control_3d_tour' && onTourControl) {
        const args = JSON.parse(data.functionCall.arguments);
        onTourControl(args.action, args.target);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert('Speech recognition error');
    };

    recognition.start();
  };

  const quickActions = [
    { icon: Home, text: "Show me properties", action: "I'm looking for properties to buy or rent" },
    { icon: Users, text: "Find vendors", action: "I need vendor services for property maintenance" },
    { icon: MapPin, text: "Tour this property", action: propertyId ? "Give me a guided tour of this property" : "Show me available properties" }
  ];

  return (
    <>
      {/* AI Chat Trigger Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:scale-110 transition-all"
            size="icon"
          >
            <Bot className="h-6 w-6 text-white" />
          </Button>
          <div className="absolute -top-2 -right-2">
            <Badge className="bg-green-500 text-white animate-bounce">
              <Sparkles className="h-3 w-3 mr-1" />
              AI
            </Badge>
          </div>
        </div>
      )}

      {/* AI Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
          <Card className="shadow-2xl border-2 border-purple-200 bg-white">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Bot className="h-5 w-5" />
                  Astra Villa AI
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
                Your intelligent property assistant
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {/* Messages */}
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 text-gray-900'
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
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <LoaderCircle className="h-5 w-5 text-purple-600 animate-spin" />
                        <span className="text-sm">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions */}
              {messages.length <= 1 && (
                <div className="p-3 border-t bg-gray-50">
                  <div className="text-xs text-gray-600 mb-2">Quick actions:</div>
                  <div className="flex flex-col gap-1">
                    {quickActions.map((action, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="justify-start text-xs h-8"
                        onClick={() => setMessage(action.action)}
                      >
                        <action.icon className="h-3 w-3 mr-2" />
                        {action.text}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask me anything about properties..."
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleVoiceInput}
                    disabled={isLoading}
                    size="icon"
                    variant="outline"
                    className={isListening ? "bg-red-100 text-red-600" : ""}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !message.trim()}
                    size="icon"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
