
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Users, MapPin } from "lucide-react";
import AIChatTrigger from "./AIChatTrigger";
import AIChatHeader from "./AIChatHeader";
import AIChatMessages from "./AIChatMessages";
import AIChatQuickActions from "./AIChatQuickActions";
import AIChatInput from "./AIChatInput";
import { Message, QuickAction } from "./types";

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

  const quickActions: QuickAction[] = [
    { icon: Home, text: "Show me properties", action: "I'm looking for properties to buy or rent" },
    { icon: Users, text: "Find vendors", action: "I need vendor services for property maintenance" },
    { icon: MapPin, text: "Tour this property", action: propertyId ? "Give me a guided tour of this property" : "Show me available properties" }
  ];

  return (
    <>
      {!isOpen && <AIChatTrigger onOpen={() => setIsOpen(true)} />}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]">
          <Card className="shadow-2xl border-2 border-purple-200/50 bg-white/60 backdrop-blur-md overflow-hidden">
            <AIChatHeader onClose={() => setIsOpen(false)} />
            <CardContent className="p-0">
              <AIChatMessages
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
              />

              {messages.length <= 1 && (
                <AIChatQuickActions
                  quickActions={quickActions}
                  onActionClick={setMessage}
                />
              )}

              <AIChatInput
                message={message}
                setMessage={setMessage}
                onSendMessage={handleSendMessage}
                onVoiceInput={handleVoiceInput}
                isLoading={isLoading}
                isListening={isListening}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default AIChatWidget;
