
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Users, MapPin, Handshake } from "lucide-react";
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

      const { data, error } = await supabase.functions.invoke(functionName, {
        body
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

  // Responsive positioning and sizing for all devices
  const chatDimensions = {
    width: isMobile ? 'min(320px, 90vw)' : 'min(380px, 25vw)',
    height: isMobile ? 'min(500px, 70vh)' : 'min(550px, 70vh)',
    maxHeight: '70vh'
  };

  // Sticky positioning - always visible on screen like header
  const positionStyles = {
    mobile: "fixed bottom-4 right-4 z-[99999]",
    tablet: "fixed bottom-6 right-6 z-[99999]", 
    desktop: "fixed bottom-6 right-6 z-[99999]"
  };

  const getPositionClass = () => {
    if (isMobile) return positionStyles.mobile;
    if (window.innerWidth <= 1024) return positionStyles.tablet;
    return positionStyles.desktop;
  };

  return (
    <div className={`${getPositionClass()} pointer-events-auto transition-all duration-300`} style={{ position: 'fixed', zIndex: 9999 }}>
      {!isOpen ? (
        <div className="relative">
          <AIChatTrigger onOpen={() => setIsOpen(true)} />
          {/* Always visible indicator */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-pulse opacity-75"></div>
        </div>
      ) : (
        <div 
          className={cn(
            "shadow-2xl",
            isMobile ? "fixed inset-x-4 bottom-20 top-20" : "relative"
          )}
          style={!isMobile ? {
            width: chatDimensions.width,
            height: chatDimensions.height,
            maxHeight: chatDimensions.maxHeight
          } : {}}
        >
          <Card className={cn(
            "h-full w-full flex flex-col border-primary/20 overflow-hidden",
            "bg-background/95 backdrop-blur-xl shadow-2xl",
            isMobile ? "rounded-t-3xl border-t border-l border-r" : "rounded-2xl border shadow-xl",
            "transition-all duration-300 hover:shadow-3xl"
          )}>
            <AIChatHeader onClose={() => setIsOpen(false)} />
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
          </Card>
        </div>
      )}
    </div>
  );
};

export default ResponsiveAIChatWidget;
