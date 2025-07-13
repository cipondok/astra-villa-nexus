
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
  const isMobile = useIsMobile();

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

  // Dynamic sizing for device screen (viewport) positioning
  const chatDimensions = {
    width: isMobile ? 'min(340px, 92vw)' : 'min(380px, 25vw)',
    height: isMobile ? 'min(520px, 75vh)' : 'min(580px, 75vh)',
    maxHeight: '75vh'
  };

  return (
    <div 
      className="fixed top-1/2 right-5 -translate-y-1/2 z-[9999] pointer-events-auto"
      style={{
        width: chatDimensions.width,
        height: chatDimensions.height,
        maxHeight: chatDimensions.maxHeight
      }}
    >
      <Card className="h-full w-full flex flex-col shadow-2xl border-primary/20 bg-background/95 backdrop-blur-xl overflow-hidden rounded-2xl">
        <AIChatHeader onClose={() => setIsOpen(false)} />
        <CardContent className="p-0 flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1">
            <div className={`${isMobile ? 'p-2' : 'p-4'} space-y-4`}>
              <AIChatMessages
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
              />
            </div>
          </ScrollArea>

          {messages.length <= 1 && (
            <div className={`${isMobile ? 'px-2 pb-1' : 'px-4 pb-2'}`}>
              <AIChatQuickActions
                quickActions={quickActions}
                onActionClick={setMessage}
              />
            </div>
          )}

          <div className={`${isMobile ? 'p-2' : 'p-4'} border-t border-primary/10`}>
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
  );
};

export default ResponsiveAIChatWidget;
