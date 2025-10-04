
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Users, MapPin, Handshake, Bot } from "lucide-react";
import AIChatTrigger from "./AIChatTrigger";
import AIChatHeader from "./AIChatHeader";
import AIChatMessages from "./AIChatMessages";
import AIChatQuickActions from "./AIChatQuickActions";
import AIChatInput from "./AIChatInput";
import { Message, QuickAction } from "./types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ResponsiveAIChatWidgetProps {
  propertyId?: string;
  onTourControl?: (action: string, target: string) => void;
}

const ResponsiveAIChatWidget = ({ propertyId, onTourControl }: ResponsiveAIChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { isMobile } = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      // Send welcome message
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hi! I'm your AI assistant. I can help you with:

🏠 Property recommendations and details
💰 Rental term negotiations
🏡 Neighborhood questions
🛠️ Vendor service bookings  
🎯 3D property tour guidance
💡 Real estate advice

${propertyId ? "I see you're viewing a property. Feel free to ask me anything about it!" : "How can I assist you today?"}`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [propertyId, messages.length]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Expand if minimized
    if (isMinimized) setIsMinimized(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    const currentMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
      const isNeighborhoodQuery = /neighborhood|area|around|walk to|safe at night|cafes nearby|near a|close to/i.test(currentMessage);
      const isNegotiationQuery = /negotiate|lower the price|deposit|rent|deal|offer|lease/i.test(currentMessage);
      
      let functionName: string;
      const body: { [key: string]: any } = {
        message: currentMessage,
        userId: user?.id,
        propertyId,
        conversationId
      };

      if (isNegotiationQuery && propertyId) {
        functionName = 'rental-negotiator';
        body.conversationHistory = currentMessages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      } else if (isNeighborhoodQuery) {
        functionName = 'neighborhood-simulator';
      } else {
        functionName = 'ai-assistant';
      }

      console.log('Invoking edge function:', functionName, 'with body:', body);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body
      });

      console.log('Edge function response:', { data, error });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data || !data.message) {
        console.error('Invalid response from edge function:', data);
        throw new Error('Invalid response from AI assistant');
      }

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

  const quickActions: QuickAction[] = [
    { icon: Home, text: "Show properties", action: "I'm looking for properties to buy or rent" },
    { icon: Users, text: "Find vendors", action: "I need vendor services for property maintenance" },
    ...(propertyId
      ? [
          { icon: MapPin, text: "Tour property", action: "Give me a guided tour of this property" },
          { icon: Handshake, text: "Negotiate", action: "I'd like to negotiate the rental terms." }
        ]
      : [{ icon: MapPin, text: "Find properties", action: "Show me available properties" }]),
  ];

  return (
    <>
      {/* Chat trigger - Positioned inline on desktop, fixed on mobile */}
      {!isOpen && (
        <div 
          style={isMobile ? { 
            position: 'fixed',
            top: '50%',
            right: '8px',
            transform: 'translateY(-50%)',
            zIndex: 999999
          } : {
            position: 'relative',
            zIndex: 999999
          }}
          onClick={() => {
            console.log('Chat trigger clicked');
            setIsOpen(true);
            setIsMinimized(false);
          }}
        >
          <div style={{ position: 'relative', width: isMobile ? '56px' : '64px', height: isMobile ? '56px' : '64px' }}>
            <AIChatTrigger onOpen={() => setIsOpen(true)} />
            <div 
              style={{
                position: 'absolute',
                inset: '-8px',
                background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.4))',
                borderRadius: '50%',
                animation: 'pulse 2s infinite',
                opacity: 0.9,
                pointerEvents: 'none'
              }}
            />
          </div>
        </div>
      )}

      {/* Chat window - Positioned inline on desktop, fixed on mobile */}
      {isOpen && (
        <div 
          style={isMobile ? {
            position: 'fixed',
            top: '50%',
            right: '8px',
            transform: 'translateY(-50%)',
            width: 'calc(100vw - 16px)',
            height: isMinimized ? 'auto' : 'calc(100vh - 60px)',
            maxHeight: isMinimized ? 'auto' : '85vh',
            zIndex: 999999,
            transition: 'all 0.3s ease-in-out'
          } : {
            position: 'relative',
            width: '100%',
            height: isMinimized ? 'auto' : '680px',
            maxHeight: isMinimized ? 'auto' : '85vh',
            zIndex: 999999,
            transition: 'all 0.3s ease-in-out'
          }}
        >
          <Card className="h-full w-full flex flex-col border-2 border-primary/30 overflow-hidden bg-background/98 backdrop-blur-xl shadow-2xl rounded-2xl">
            {/* Header with Close and Minimize */}
            <div className="flex items-center justify-between p-3 border-b border-primary/20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold text-sm">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? '□' : '−'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                  }}
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Chat content - only show when not minimized */}
            {!isMinimized && (
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1">
                  <div className={`${isMobile ? 'p-3' : 'p-4'} space-y-3`}>
                    <AIChatMessages
                      messages={messages}
                      isLoading={isLoading}
                      messagesEndRef={messagesEndRef}
                    />
                  </div>
                </ScrollArea>

                {messages.length <= 1 && (
                  <div className={`${isMobile ? 'px-3 pb-2' : 'px-4 pb-2'}`}>
                    <AIChatQuickActions
                      quickActions={quickActions}
                      onActionClick={setMessage}
                    />
                  </div>
                )}

                <div className={cn(
                  "border-t border-primary/10 bg-background/50",
                  isMobile ? 'p-3' : 'p-4'
                )}>
                  <AIChatInput
                    message={message}
                    setMessage={setMessage}
                    onSendMessage={handleSendMessage}
                    onVoiceInput={handleVoiceInput}
                    isLoading={isLoading}
                    isListening={isListening}
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
};

export default ResponsiveAIChatWidget;
